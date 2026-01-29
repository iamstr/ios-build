#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const { execSync } = require('child_process');

async function run() {
    console.log(chalk.blue.bold('\n🚀 iOS Simulator Auto-Deploy\n'));

    try {
        // 1. GET SCHEMES
        console.log(chalk.gray('🔍 Searching for schemes...'));
        const listJson = JSON.parse(execSync('xcodebuild -list -json').toString());
        
        if (!listJson.project) throw new Error("No Xcode project found in this directory.");
        
        const schemes = listJson.project.schemes;
        if (!schemes || !schemes.length) throw new Error("No schemes found in the Xcode project.");

        // 2. GET SIMULATORS
        const devicesJson = JSON.parse(execSync('xcrun simctl list devices --json').toString());
        const availableSims = Object.values(devicesJson.devices)
            .flat()
            .filter(d => d.isAvailable)
            .map(d => ({ name: `${d.name} (${d.state})`, value: d }));

        // 3. USER INTERACTION
        const answers = await inquirer.prompt([
            { type: 'list', name: 'scheme', message: 'Select a scheme:', choices: schemes },
            { type: 'list', name: 'device', message: 'Select a simulator:', choices: availableSims }
        ]);

        const selectedScheme = answers.scheme;
        const selectedDevice = answers.device;

        // 4. BUILD
        console.log(chalk.yellow(`\n🛠  Building ${selectedScheme}...`));
        execSync(`xcodebuild -scheme "${selectedScheme}" -sdk iphonesimulator build`, { stdio: 'inherit' });

        // 5. BOOT SIMULATOR
        if (selectedDevice.state !== 'Booted') {
            console.log(chalk.gray(`📱 Booting ${selectedDevice.name}...`));
            execSync(`xcrun simctl boot ${selectedDevice.udid}`);
        }
        execSync('open -a Simulator');

        // 6. EXTRACT BUILD PATH & BUNDLE ID
        console.log(chalk.gray('📂 Locating build artifacts...'));
        const buildSettings = execSync(`xcodebuild -scheme "${selectedScheme}" -sdk iphonesimulator -showBuildSettings`).toString();
        
        const buildDirMatch = buildSettings.match(/BUILT_PRODUCTS_DIR = (.+)/);
        const bundleIdMatch = buildSettings.match(/PRODUCT_BUNDLE_IDENTIFIER = (.+)/);
        const appNameMatch = buildSettings.match(/WRAPPER_NAME = (.+)/);

        if (!buildDirMatch) throw new Error("Could not find BUILT_PRODUCTS_DIR in build settings");
        if (!bundleIdMatch) throw new Error("Could not find PRODUCT_BUNDLE_IDENTIFIER in build settings");
        if (!appNameMatch) throw new Error("Could not find WRAPPER_NAME in build settings");

        const buildDir = buildDirMatch[1].trim();
        const bundleId = bundleIdMatch[1].trim();
        const appName = appNameMatch[1].trim();
        const appPath = `${buildDir}/${appName}`;

        // 7. INSTALL AND LAUNCH
        console.log(chalk.green(`\n📦 Installing ${appName} on simulator...`));
        execSync(`xcrun simctl install ${selectedDevice.udid} "${appPath}"`);
        
        console.log(chalk.green(`🚀 Launching ${bundleId}...`));
        execSync(`xcrun simctl launch ${selectedDevice.udid} ${bundleId}`);

        console.log(chalk.blue.bold('\n✅ App is running!\n'));

    } catch (error) {
        console.error(chalk.red(`\n❌ Error: ${error.message}`));
        if (error.stderr) {
            console.error(chalk.red('Details:'), error.stderr.toString());
        }
        process.exit(1);
    }
}

run();
