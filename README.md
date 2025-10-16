# 🚫 Site Blocker & Time Budget Chrome Extension

A comprehensive Chrome extension that helps you manage your online time by blocking distracting websites and enforcing weekly time budgets with intelligent scheduling.

## ✨ Features

### ⏰ Time-Based Blocking
- **Configurable Schedules**: Block sites during specific hours
  - Weekday schedule (9:00 AM - 5:00 PM by default)
  - Weekend schedule (optional)
- **Session Limits**: Automatically block sites after a set period (30 minutes default)

### 📊 Weekly Time Budgets
- **Per-Site Budgets**: Set maximum time allowed per site per week
- **Real-Time Tracking**: Monitor your usage in real-time
- **Visual Indicators**: See remaining time or exceeded status in popup

### 🎓 Educational Override System
- **Override Codes**: Use special codes to continue watching educational content
- **Configurable Codes**: Admins can set custom override codes in settings
- **Auto-Expiration**: Overrides automatically expire after 30 minutes

### 🚫 Emergency Block
- **Panic Button**: Instantly block all distracting sites
- **One-Click Activation**: Available in the popup interface

## 🛠️ Installation

### From Chrome Web Store
*Coming soon - this extension will be published to Chrome Web Store*

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension directory
5. The extension will appear in your browser toolbar

## 🚀 Quick Usage After Installation

### First Steps (2 minutes)
1. **Click the extension icon** 🚫 in your browser toolbar
2. **View current status** - see if blocking is active and your usage stats
3. **Click "Settings"** to customize (optional - defaults work great!)

### Immediate Testing
1. **Visit YouTube** or another blocked site (youtube.com, reddit.com, facebook.com)
2. **Wait 30 seconds** - you'll see the blocking screen
3. **Click "Educational Override"** and enter `EDU2024` to test the override system
4. **Try the "Emergency Block All"** button for instant blocking

### Daily Workflow
1. **Extension works automatically** - no daily setup needed!
2. **Check popup regularly** - click icon to see time remaining
3. **Use override codes** when you need educational content
4. **Adjust settings anytime** via the Settings page

### Understanding the Interface
- **🟢 Green indicator**: Site allowed, time remaining
- **🔴 Red indicator**: Budget exceeded or site blocked
- **⏰ Clock icon**: Shows current schedule status
- **🚫 Emergency button**: Instant block all sites

### Weekly Management
- **Budgets reset automatically** every Monday
- **Check "View Stats"** in popup for detailed usage
- **Adjust time limits** in Settings if needed
- **Add/remove sites** as your needs change

### Quick Tips
- **Default override codes**: `EDU2024`, `LEARN123`, `STUDY456`
- **Emergency block**: Use for immediate focus sessions
- **Background tracking**: Works even when popup is closed
- **Educational detection**: Tries to identify learning content automatically

## ⚙️ Configuration

### Initial Setup
1. Click the extension icon in your browser toolbar
2. Click "Settings" to open the configuration page
3. Configure your preferences:

### Schedule Settings
- **Weekday Blocking**: Enable/disable blocking Monday-Friday
  - Set start time (e.g., 09:00)
  - Set end time (e.g., 17:00)
- **Weekend Blocking**: Enable/disable blocking Saturday-Sunday
- **Session Duration**: How long before sites are blocked (minutes)

### Time Budgets
- Add sites you want to budget (e.g., youtube.com, reddit.com)
- Set weekly time limits in minutes (120 minutes = 2 hours)
- Remove sites you no longer want to track

### Educational Override Codes
- Add custom codes that users can enter to override blocking
- Default codes: `EDU2024`, `LEARN123`, `STUDY456`
- Users enter these codes when blocked to continue for educational content

### Blocked Sites
- Manage which sites get blocked during active schedules
- Add/remove sites as needed

## 📱 Usage

### Daily Usage
1. **Automatic Operation**: Extension works automatically based on your schedule
2. **Real-Time Monitoring**: Click extension icon to see current usage stats
3. **Emergency Block**: Use "Emergency Block All" for immediate blocking

### Educational Override
1. When blocked on a site, click "Educational Override"
2. Enter one of the configured override codes
3. Continue using the site for educational purposes
4. Override automatically expires after 30 minutes

### Weekly Reset
- Time budgets automatically reset every Monday at 12:00 AM
- Usage tracking starts fresh each week

## 🔧 Advanced Features

### Popup Interface
- **Current Schedule Status**: See if blocking is currently active
- **Usage Statistics**: View time remaining for each site
- **Quick Override**: Enter codes directly from popup
- **Settings Access**: Quick link to full settings page

### Background Monitoring
- **Session Tracking**: Automatically tracks time spent on sites
- **Budget Enforcement**: Blocks sites when weekly limits are exceeded
- **Smart Detection**: Recognizes when you're on blocked sites

### Content Script Integration
- **YouTube Integration**: Special handling for YouTube videos
- **Video Detection**: Identifies when videos are playing
- **Educational Content Detection**: Attempts to identify educational videos

## 🛡️ Privacy & Security

- **Local Storage Only**: All data stored locally in your browser
- **No External Tracking**: No data sent to external servers
- **Permission Minimal**: Only requests necessary Chrome permissions
- **Override Codes**: Educational codes are stored locally only

## 🔧 Troubleshooting

### Extension Not Working
1. Check if extension is enabled in `chrome://extensions/`
2. Verify site is in blocked sites list
3. Check schedule settings are correct
4. Try refreshing the page

### Override Codes Not Working
1. Ensure code is entered exactly as configured
2. Check if override codes are properly set in settings
3. Try removing and re-adding the code

### Time Tracking Issues
1. Time tracking only works on active tabs
2. Background tabs are not tracked
3. Refreshing page resets current session timer

## 📋 Permissions Explained

The extension requires these Chrome permissions:
- `activeTab`: To access current tab information
- `storage`: To save settings and usage data
- `alarms`: For time-based operations
- `notifications`: To show alerts and updates
- `scripting`: For content script injection

## 🆘 Support

For issues or feature requests:
1. Check the troubleshooting section above
2. Review Chrome extension console for errors
3. Create an issue in the project repository

## 📄 License

This project is open source and available under the MIT License.

## 🔄 Updates

- Check `chrome://extensions/` for available updates
- Updates will be pushed to Chrome Web Store when available
- Manual installation users should pull latest changes from repository

---

**⚠️ Disclaimer**: This extension is designed to help with productivity and time management. It should not be considered a complete solution for all distraction scenarios. Users are responsible for their own online behavior and time management.
