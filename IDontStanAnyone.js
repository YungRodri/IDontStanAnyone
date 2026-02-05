/**
 * ============================================================================
 * INSTAGRAM FOLLOWER AUDIT SCRIPT v1.0.0
 * by YungRodri
 * ============================================================================
 * 
 * Secure extraction script with anti-ban measures for follower auditing.
 * Generates enriched JSON with users who don't follow you back.
 * 
 * USAGE: Paste in Instagram console (DevTools -> Console)
 * NOTE: Must be logged into your Instagram account
 */

(async function InstagramAudit() {
    'use strict';

    // ========================================================================
    // ANTI-BAN CONFIG
    // ========================================================================
    var CONFIG = {
        MIN_DELAY: 2000,              // Min delay between requests (ms)
        MAX_DELAY: 6000,              // Max delay between requests (ms)
        PROFILES_BEFORE_LONG_REST: 45, // Profiles before long pause
        LONG_REST_MIN: 30000,         // Min long pause (30s)
        LONG_REST_MAX: 60000,         // Max long pause (60s)
        QUERY_HASH: '3dec7e2c57367ef3da3d987d89f9dbc8',
        BATCH_SIZE: 24,
        OUTPUT_FILENAME: 'audit_data.json'
    };

    // ========================================================================
    // UTILITIES
    // ========================================================================

    function getCookie(name) {
        var cookies = '; ' + document.cookie;
        var parts = cookies.split('; ' + name + '=');
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    function sleep(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    // Human-like delay using gaussian distribution
    function getHumanDelay(min, max) {
        var u1 = Math.random();
        var u2 = Math.random();
        var gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        var normalized = Math.min(Math.max((gaussian + 3) / 6, 0), 1);
        return Math.floor(min + normalized * (max - min));
    }

    function formatTime(ms) {
        var seconds = Math.floor(ms / 1000);
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return mins + 'm ' + secs + 's';
    }

    function generateQueryUrl(userId, cursor) {
        var variables = {
            id: userId,
            include_reel: true,
            fetch_mutual: true,
            first: CONFIG.BATCH_SIZE
        };
        if (cursor) variables.after = cursor;
        return 'https://www.instagram.com/graphql/query/?query_hash=' + CONFIG.QUERY_HASH + '&variables=' + encodeURIComponent(JSON.stringify(variables));
    }

    function extractUserData(node) {
        return {
            id: node.id || null,
            username: node.username || 'unknown',
            full_name: node.full_name || '',
            profile_pic_url: node.profile_pic_url || '',
            follower_count: (node.edge_followed_by && node.edge_followed_by.count) || null,
            mutual_followers_count: (node.edge_mutual_followed_by && node.edge_mutual_followed_by.count) || 0,
            is_verified: node.is_verified || false,
            is_private: node.is_private || false
        };
    }

    function downloadJSON(data, filename) {
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function log(message, type) {
        var styles = {
            info: 'background:#1a1a2e;color:#00d9ff;padding:4px 8px;border-radius:4px;',
            success: 'background:#1a1a2e;color:#00ff88;padding:4px 8px;border-radius:4px;font-weight:bold;',
            warning: 'background:#1a1a2e;color:#ffaa00;padding:4px 8px;border-radius:4px;',
            error: 'background:#1a1a2e;color:#ff4444;padding:4px 8px;border-radius:4px;',
            progress: 'background:linear-gradient(90deg,#667eea,#764ba2);color:white;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:bold;',
            header: 'background:#0f0f23;color:#ffcc00;padding:10px 20px;border-radius:8px;font-size:18px;font-weight:bold;'
        };
        console.log('%c' + message, styles[type || 'info']);
    }

    // ========================================================================
    // MAIN SCRIPT
    // ========================================================================

    if (window.location.hostname.indexOf('instagram.com') === -1) {
        log('ERROR: Run this on instagram.com', 'error');
        return;
    }

    var csrfToken = getCookie('csrftoken');
    var userId = getCookie('ds_user_id');

    if (!csrfToken || !userId) {
        log('ERROR: Not logged in', 'error');
        return;
    }

    console.clear();
    log('INSTAGRAM AUDIT v1.0 by YungRodri', 'header');
    log('Starting extraction...', 'info');

    var hasNextPage = true;
    var endCursor = null;
    var totalFollowing = 0;
    var processedCount = 0;
    var profilesSinceLastRest = 0;
    var notFollowingBack = [];
    var startTime = Date.now();

    while (hasNextPage) {
        try {
            var response = await fetch(generateQueryUrl(userId, endCursor), {
                method: 'GET',
                credentials: 'include',
                headers: { 'X-CSRFToken': csrfToken, 'X-Requested-With': 'XMLHttpRequest' }
            });

            if (!response.ok) {
                if (response.status === 429) {
                    log('Rate limit! Waiting 2min...', 'warning');
                    await sleep(120000);
                    continue;
                }
                throw new Error('HTTP ' + response.status);
            }

            var data = await response.json();
            var followData = data && data.data && data.data.user && data.data.user.edge_follow;

            if (!followData) {
                log('Unexpected response. Retrying...', 'error');
                await sleep(5000);
                continue;
            }

            if (totalFollowing === 0) {
                totalFollowing = followData.count;
                log('Total following: ' + totalFollowing, 'info');
            }

            var edges = followData.edges || [];
            for (var i = 0; i < edges.length; i++) {
                var node = edges[i].node;
                processedCount++;
                profilesSinceLastRest++;

                if (!node.follows_viewer) {
                    notFollowingBack.push(extractUserData(node));
                }
            }

            hasNextPage = followData.page_info && followData.page_info.has_next_page || false;
            endCursor = followData.page_info && followData.page_info.end_cursor || null;

            var progress = Math.round((processedCount / totalFollowing) * 100);
            var elapsed = Date.now() - startTime;
            var eta = (elapsed / processedCount) * (totalFollowing - processedCount);

            console.clear();
            log('INSTAGRAM AUDIT v1.0 by YungRodri', 'header');
            log('Progress: ' + processedCount + '/' + totalFollowing + ' (' + progress + '%)', 'progress');
            log('Not following back: ' + notFollowingBack.length, 'warning');
            log('Elapsed: ' + formatTime(elapsed) + ' | ETA: ' + formatTime(eta), 'info');

            if (profilesSinceLastRest >= CONFIG.PROFILES_BEFORE_LONG_REST && hasNextPage) {
                var longRest = getHumanDelay(CONFIG.LONG_REST_MIN, CONFIG.LONG_REST_MAX);
                log('Long rest: ' + Math.round(longRest / 1000) + 's...', 'warning');
                await sleep(longRest);
                profilesSinceLastRest = 0;
            } else if (hasNextPage) {
                await sleep(getHumanDelay(CONFIG.MIN_DELAY, CONFIG.MAX_DELAY));
            }

        } catch (error) {
            log('Error: ' + error.message + '. Retrying...', 'error');
            await sleep(10000);
        }
    }

    // ========================================================================
    // OUTPUT
    // ========================================================================

    console.clear();
    log('INSTAGRAM AUDIT v1.0 by YungRodri', 'header');
    log('DONE!', 'success');
    log('Processed: ' + processedCount + ' | Not following back: ' + notFollowingBack.length, 'info');
    log('Total time: ' + formatTime(Date.now() - startTime), 'info');

    var outputData = {
        metadata: {
            generated_at: new Date().toISOString(),
            total_following: totalFollowing,
            not_following_back: notFollowingBack.length,
            version: '1.0.0'
        },
        users: notFollowingBack
    };

    downloadJSON(outputData, CONFIG.OUTPUT_FILENAME);
    log('Downloaded: ' + CONFIG.OUTPUT_FILENAME, 'success');

    return outputData;
})();
