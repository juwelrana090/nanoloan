const {
    AndroidConfig,
    withAndroidManifest,
    withMainActivity,
} = require("@expo/config-plugins");

const { getMainApplicationOrThrow } = AndroidConfig.Manifest;

/**
 * Config plugin to fix Google Play Console warnings for Android 15/16:
 * 1. Edge-to-edge display support
 * 2. Deprecated APIs (handled by edge-to-edge)
 * 3. Picture-in-Picture support (manifest only)
 * 4. Remove resizability restrictions
 */

// Modify AndroidManifest.xml
function modifyAndroidManifest(androidManifest) {
    const { manifest } = androidManifest;

    if (!Array.isArray(manifest["application"])) {
        console.warn("No application array in manifest");
        return androidManifest;
    }

    const application = getMainApplicationOrThrow(androidManifest);

    // Add resizeableActivity support for large screens (fixes Android 16 warning)
    application.$["android:resizeableActivity"] = "true";

    // Find MainActivity
    const activities = application.activity || [];
    const mainActivity = activities.find(
        (activity) =>
            activity.$["android:name"] === ".MainActivity" ||
            activity.$["android:name"] === "com.nano.loan.app.MainActivity"
    );

    if (mainActivity) {
        // Enable Picture-in-Picture (fixes PiP warning)
        mainActivity.$["android:supportsPictureInPicture"] = "true";

        // Add configChanges for PiP transitions
        const existingConfigChanges = mainActivity.$["android:configChanges"] || "";
        const requiredChanges = [
            "keyboard",
            "keyboardHidden",
            "orientation",
            "screenSize",
            "screenLayout",
            "uiMode",
            "smallestScreenSize", // For PiP
        ];

        const configChangesSet = new Set(existingConfigChanges.split("|"));
        requiredChanges.forEach((change) => configChangesSet.add(change));
        mainActivity.$["android:configChanges"] = Array.from(configChangesSet)
            .filter(Boolean)
            .join("|");

        // Remove portrait orientation restriction for large screens (fixes resizability warning)
        if (mainActivity.$["android:screenOrientation"]) {
            delete mainActivity.$["android:screenOrientation"];
        }
    }

    return androidManifest;
}

// Modify MainActivity.kt to add edge-to-edge support
function modifyMainActivity(mainActivity) {
    // Add imports for edge-to-edge
    const edgeToEdgeImports = [
        "import androidx.core.view.WindowCompat",
        "import android.content.res.Configuration",
    ];

    let modifiedContent = mainActivity.contents;

    // Add imports if not present
    edgeToEdgeImports.forEach((importStatement) => {
        if (!modifiedContent.includes(importStatement)) {
            // Add after package declaration
            const packageMatch = modifiedContent.match(/package .+\n/);
            if (packageMatch) {
                const insertPosition = packageMatch.index + packageMatch[0].length;
                modifiedContent =
                    modifiedContent.slice(0, insertPosition) +
                    importStatement +
                    "\n" +
                    modifiedContent.slice(insertPosition);
            }
        }
    });

    // Add edge-to-edge support in onCreate (fixes edge-to-edge and deprecated API warnings)
    if (!modifiedContent.includes("WindowCompat.setDecorFitsSystemWindows")) {
        // Find onCreate method
        const onCreateMatch = modifiedContent.match(
            /override fun onCreate\(savedInstanceState: Bundle\?\) \{/
        );

        if (onCreateMatch) {
            const insertPosition = onCreateMatch.index + onCreateMatch[0].length;

            const edgeToEdgeCode = `
    // Enable edge-to-edge display for Android 15+
    WindowCompat.setDecorFitsSystemWindows(window, false)`;

            modifiedContent =
                modifiedContent.slice(0, insertPosition) +
                edgeToEdgeCode +
                modifiedContent.slice(insertPosition);
        }
    }

    // Add PiP mode change handler (optional, for proper PiP handling)
    if (!modifiedContent.includes("onPictureInPictureModeChanged")) {
        // Find the end of the class (before the last closing brace)
        const classEndMatch = modifiedContent.lastIndexOf("}");

        const pipHandler = `
  /**
   * Handle Picture-in-Picture mode changes
   */
  override fun onPictureInPictureModeChanged(
    isInPictureInPictureMode: Boolean,
    newConfig: Configuration
  ) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
  }
`;

        if (classEndMatch > 0) {
            modifiedContent =
                modifiedContent.slice(0, classEndMatch) +
                pipHandler +
                modifiedContent.slice(classEndMatch);
        }
    }

    mainActivity.contents = modifiedContent;
    return mainActivity;
}

module.exports = function withPlayConsoleFixes(config) {
    // Modify AndroidManifest.xml
    config = withAndroidManifest(config, (config) => {
        config.modResults = modifyAndroidManifest(config.modResults);
        return config;
    });

    // Modify MainActivity.kt
    config = withMainActivity(config, (config) => {
        config.modResults = modifyMainActivity(config.modResults);
        return config;
    });

    return config;
};