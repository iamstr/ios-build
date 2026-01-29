# swift-run-cli

🚀 Auto-build and deploy SwiftUI apps to simulators

A CLI tool that automates the entire Xcode workflow - from building your SwiftUI app to launching it on the simulator.

## Features

- 🔍 Automatically discovers Xcode schemes in your project
- 📱 Lists all available iOS simulators
- 🛠 Builds your app for the selected scheme
- 📦 Installs the app on the simulator
- 🚀 Launches the app automatically
- ✅ Smart simulator boot detection (avoids "already booted" errors)

## Installation

```bash
npm install
```

## Usage

### Local Development

While developing this package, you can test it in any SwiftUI project folder:

1. Link it: Inside this package folder, run:
   ```bash
   npm link
   ```

2. Run it: Navigate to your SwiftUI project folder and run:
   ```bash
   swift-run
   ```

### How It Works

The tool performs the "Xcode Dance" automatically:

1. **Discovers Schemes**: Uses `xcodebuild -list -json` to find all available schemes
2. **Lists Simulators**: Uses `xcrun simctl list devices --json` to get available simulators
3. **Interactive Selection**: Prompts you to select a scheme and simulator
4. **Builds**: Runs `xcodebuild -scheme <scheme> -sdk iphonesimulator build`
5. **Boots Simulator**: Boots the simulator if not already running
6. **Extracts Metadata**: Uses `xcodebuild -showBuildSettings` to automatically find:
   - Build directory (BUILT_PRODUCTS_DIR)
   - Bundle ID (PRODUCT_BUNDLE_IDENTIFIER)
   - App name (WRAPPER_NAME)
7. **Installs & Launches**: Installs and launches the app on the simulator

## Key Improvements

- ✅ **Automatic Path Discovery**: Finds the .app location regardless of username or hash
- ✅ **Bundle ID Extraction**: No manual input needed
- ✅ **State Detection**: Checks if simulator is already booted to avoid errors
- ✅ **Error Handling**: Clear error messages for troubleshooting

## Requirements

- macOS with Xcode installed
- Node.js 12+
- An Xcode project with schemes

## Dependencies

- `inquirer` - Interactive command-line prompts
- `chalk` - Terminal string styling
