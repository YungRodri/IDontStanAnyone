# I don't stan anyone 🚫

**Secure, private, and client-side Instagram follower audit tool.**
Detect who doesn't follow you back without sharing your password with third-party apps. Includes a smart extraction script and a local dashboard to manage your unfollows.

![Project Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ⚡ Features

* **🛡️ Anti-Ban Heuristics:** Uses random Gaussian delays and preventive rests to mimic human behavior and avoid Instagram blocks.
* **🔒 Privacy First:** Everything happens in your browser (Client-side). Your credentials never leave your PC.
* **📊 Local Dashboard:** Modern Dark Mode interface to visualize profiles, photos, mutual followers, and filter results.
* **💾 Persistence:** Saves your review progress locally so you can continue later.
* **✨ Rich Data:** Extracts HD profile pictures, follower counts, and verification status.

---

## 🚀 How to Use

The process consists of two simple steps: **Extraction** and **Visualization**.

### Step 1: Data Extraction
1.  Log in to [Instagram.com](https://www.instagram.com) on your PC (Chrome/Firefox/Edge).
2.  Open **Developer Tools** (Press `F12` or `Right Click -> Inspect`).
3.  Go to the **Console** tab.
4.  Copy the entire code from [`IDontStanAnyone.js`](./IDontStanAnyone.js) and paste it into the console.
5.  Press `Enter`.
    * *The script will start working automatically. You will see real-time progress logs.*
    * *⚠️ **Do not close the tab** until it finishes.*
6.  Once done, a file named `audit_data.json` will be downloaded automatically.

### Step 2: Visualization (Dashboard)
1.  Download or open [`dashboard.html`](./dashboard.html) in your browser.
2.  Drag and drop the `audit_data.json` file into the designated area.
3.  Done! Now you can:
    * See who isn't following you back.
    * Sort by follower count or review status.
    * Click on profiles to open them in Instagram (they will be marked as "Reviewed" automatically).

---

## ⚠️ Safety Warnings

* **Ethical Use:** This tool is for personal and educational use only.
* **Rate Limits:** If you have thousands of followers, the script might take some time due to safety pauses (30-60s). **Do not try to speed up the script** by removing the `sleep()` functions, or Instagram might temporarily block your account (Error 429).
* **JSON Files:** The `audit_data.json` file contains personal information. **DO NOT upload it to the internet** or share it.

## 🛠️ Tech Stack

* **Script:** Vanilla JavaScript (ES6+), Fetch API.
* **Dashboard:** HTML5, TailwindCSS (via CDN), LocalStorage API.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
**Disclaimer:** This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Instagram or Meta.
