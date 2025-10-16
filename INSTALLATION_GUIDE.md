# 🚀 Installation Guide - Site Blocker & Time Budget Extension

## 📦 Option 1: Automatic Packing (Recommended)

1. **Run the packing script:**
   ```bash
   ./pack-extension.sh
   ```

2. **This will create:** `Site_Blocker_&_Time_Budget.crx`

3. **Install in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Drag and drop the `.crx` file into the page
   - Click "Add extension" when prompted

## 📦 Option 2: Manual Installation (Development Mode)

1. **Open Chrome Extensions:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load the extension:**
   - Click "Load unpacked"
   - Select the extension directory

3. **The extension appears in your toolbar!**

## 📦 Option 3: Zip File Installation

1. **Extract the zip file** (if not already extracted)

2. **Follow Option 2** (Manual Installation) above

## 🔧 First Time Setup

After installation:

1. **Click the extension icon** in your browser toolbar
2. **Click "Settings"** to configure:
   - ⏰ Set your blocking schedule (9 AM - 5 PM weekdays)
   - 📊 Configure time budgets per site
   - 🎓 Set educational override codes
   - 🚫 Choose which sites to block

3. **Default settings work immediately:**
   - Blocks YouTube, Reddit, Facebook after 30 minutes
   - Active during weekday business hours
   - Override codes: `EDU2024`, `LEARN123`, `STUDY456`

## 🧪 Testing the Extension

1. **Open `test.html`** in your browser for testing
2. **Visit YouTube** to test blocking functionality
3. **Try the educational override** by entering `EDU2024` when blocked

## ❓ Troubleshooting

**Extension not appearing in toolbar:**
- Check if it's enabled in `chrome://extensions/`
- Try reloading the extension or restarting Chrome

**Blocking not working:**
- Verify the site is in your blocked sites list
- Check if current time is within your schedule
- Look at the popup for current status

**Override codes not working:**
- Make sure codes match exactly (case-sensitive)
- Check settings page for configured codes

## 📞 Support

For issues:
1. Check browser console for errors (`F12` → Console)
2. Verify all permissions are granted
3. Try reinstalling the extension

---

**🎯 Quick Start:** Install → Configure Settings → Start using immediately!
