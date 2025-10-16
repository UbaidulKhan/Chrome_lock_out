#!/bin/bash

# Chrome Extension Packing Script
# This script helps you create a .crx file from the extension

EXTENSION_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTENSION_NAME="Site_Blocker_&_Time_Budget"

echo "🚀 Chrome Extension Packing Script"
echo "=================================="
echo ""
echo "Extension Directory: $EXTENSION_DIR"
echo "Extension Name: $EXTENSION_NAME"
echo ""

# Check if Chrome is installed
if ! command -v google-chrome &> /dev/null && ! command -v chromium-browser &> /dev/null; then
    echo "❌ Chrome or Chromium not found!"
    echo ""
    echo "Please install Google Chrome and try again."
    echo "You can also manually pack using:"
    echo "chrome --pack-extension=\"$EXTENSION_DIR\" --pack-extension-key=\"$EXTENSION_DIR/$EXTENSION_NAME.pem\""
    exit 1
fi

# Find Chrome executable
CHROME_CMD=""
if command -v google-chrome &> /dev/null; then
    CHROME_CMD="google-chrome"
elif command -v chromium-browser &> /dev/null; then
    CHROME_CMD="chromium-browser"
fi

echo "✅ Found Chrome: $CHROME_CMD"
echo ""

# Create the .crx file
echo "📦 Creating .crx file..."
OUTPUT_FILE="$EXTENSION_DIR/$EXTENSION_NAME.crx"

if $CHROME_CMD --pack-extension="$EXTENSION_DIR" --pack-extension-key="$EXTENSION_DIR/$EXTENSION_NAME.pem" 2>/dev/null; then
    echo "✅ Successfully created: $OUTPUT_FILE"

    # Verify the file was created
    if [ -f "$OUTPUT_FILE" ]; then
        FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
        echo "📊 Package size: $FILE_SIZE"
        echo ""
        echo "🎉 Extension packed successfully!"
        echo ""
        echo "📋 Installation Instructions:"
        echo "1. Open Chrome and go to chrome://extensions/"
        echo "2. Drag and drop the .crx file into the extensions page"
        echo "3. Click 'Add extension' when prompted"
        echo ""
        echo "🔧 Alternative installation:"
        echo "1. Go to chrome://extensions/"
        echo "2. Enable 'Developer mode'"
        echo "3. Drag and drop the .crx file"
    else
        echo "❌ Failed to create .crx file"
        echo ""
        echo "🔧 Manual packing command:"
        echo "$CHROME_CMD --pack-extension=\"$EXTENSION_DIR\" --pack-extension-key=\"$EXTENSION_DIR/$EXTENSION_NAME.pem\""
    fi
else
    echo "❌ Failed to pack extension"
    echo ""
    echo "🔧 Manual packing command:"
    echo "$CHROME_CMD --pack-extension=\"$EXTENSION_DIR\" --pack-extension-key=\"$EXTENSION_DIR/$EXTENSION_NAME.pem\""
    echo ""
    echo "💡 Troubleshooting:"
    echo "- Make sure Chrome is closed before packing"
    echo "- Try running Chrome as administrator"
    echo "- Check that all extension files are valid"
fi

echo ""
echo "📚 For more information, see:"
echo "https://developer.chrome.com/docs/extensions/mv3/packaging/"
