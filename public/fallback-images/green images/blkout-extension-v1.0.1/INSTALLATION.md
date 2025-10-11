# BLKOUT Chrome Extension - Installation Guide

## 🚀 Quick Installation (5 minutes)

### Step 1: Download the Extension
1. **Download the extension folder** from the project maintainer
2. **Or clone from repository**: The extension is located in `blkout-extension/` folder

### Step 2: Install in Chrome
1. **Open Chrome** and go to: `chrome://extensions/`
2. **Enable Developer Mode** (toggle switch in top-right corner)
3. **Click "Load unpacked"** button
4. **Select the `blkout-extension` folder** from your downloads
5. **Extension installs** - you'll see the BLKOUT icon in your toolbar

### Step 3: Test It Works
1. **Visit the test page**: Open `test-page.html` in your browser
2. **Look for floating button**: "📤 Submit event to BLKOUT" should appear
3. **Click the extension icon** in toolbar to see the popup interface
4. **Try submitting**: Fill out the form and submit a test event

## 📤 Sharing with Your Community

### For Community Moderators/Organizers:

#### Option 1: Direct File Sharing
```bash
# Create a zip file for easy sharing
zip -r blkout-extension.zip blkout-extension/
```
**Share via:**
- Email attachment
- Google Drive/Dropbox link
- Community messaging platforms
- GitHub repository

#### Option 2: GitHub Repository
1. **Upload to GitHub** (recommended for version control)
2. **Create release** with zip download
3. **Share repository link** with installation instructions

#### Option 3: Internal Distribution
1. **Host on community website** as downloadable zip
2. **Include in onboarding materials** for new volunteers
3. **Add to community documentation**

### Installation Instructions for Community Members:

**Send this to your community:**

---

## 📥 Install BLKOUT Submission Tool

**What it does**: Submit events and articles to BLKOUT with one click from any website

**Installation (Chrome only, 2 minutes):**

1. **Download** the extension folder (ask organizer for link)
2. **Open Chrome** → Type `chrome://extensions/` in address bar
3. **Turn on "Developer mode"** (top right toggle)
4. **Click "Load unpacked"** → Select the downloaded folder
5. **Done!** Look for BLKOUT icon in your toolbar

**How to use:**
- Browse to any event page (Eventbrite, Facebook Events, etc.)
- Click the floating "Submit to BLKOUT" button that appears
- Fill in any missing details and submit
- Articles from news sites work the same way!

**Need help?** Contact: [your-contact]

---

## 🔧 Advanced Setup

### For Technical Users:

#### Development Installation:
```bash
git clone [repository-url]
cd blkout-website/blkout-extension
# Load unpacked in Chrome Developer Mode
```

#### Customization:
- **API endpoint**: Edit `API_BASE` in `background.js` and `popup.js`
- **Supported sites**: Add new platforms in `content-scripts/detector.js`
- **Styling**: Modify `popup/popup.css`

## 🌐 Browser Compatibility

- ✅ **Chrome** (recommended)
- ✅ **Edge** (Chromium-based)
- ✅ **Brave** 
- ❌ **Firefox** (requires conversion to WebExtensions format)
- ❌ **Safari** (requires different manifest format)

## 🔒 Privacy & Security

**Data Collection**: None - extension only accesses pages when you use it
**Permissions**: Minimal - only active tab and BLKOUT API
**Storage**: Local only - no cloud sync
**Source Code**: Open source - inspect before installing

## 📞 Support

**Issues or questions?**
- Check the README.md file
- Contact community tech team
- Report bugs via community channels

## 🎯 Success Metrics

**Target Usage:**
- 20+ community members using extension
- 50+ submissions per week
- 80%+ approval rate for submitted content

**Track your impact**: Check BLKOUT admin dashboard to see your contributions!

---

*Ready to crowd out mock data with real community content!* 🚀