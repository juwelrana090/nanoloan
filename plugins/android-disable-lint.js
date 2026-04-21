const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Disable lint analysis for release builds
 * Fixes Windows file locking issues during Gradle builds
 */
module.exports = function withAndroidLintDisabled(config) {
  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      let contents = config.modResults.contents;

      // Add lintOptions block after buildTypes
      const lintOptionsBlock = `
    // Disable lint analysis (fixes Windows file locking issues)
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
    }
`;

      // Only add if not already present
      if (!contents.includes('lintOptions')) {
        // Find the buildTypes block and insert lintOptions after it
        // We look for the closing brace of buildTypes at the correct indentation level
        const buildTypesIndex = contents.indexOf('buildTypes {');

        if (buildTypesIndex !== -1) {
          // Find the matching closing brace for buildTypes
          let braceCount = 0;
          let startIndex = -1;
          let endIndex = -1;

          for (let i = buildTypesIndex; i < contents.length; i++) {
            if (contents[i] === '{') {
              if (startIndex === -1) startIndex = i;
              braceCount++;
            } else if (contents[i] === '}') {
              braceCount--;
              if (braceCount === 0 && startIndex !== -1) {
                endIndex = i;
                break;
              }
            }
          }

          if (endIndex !== -1) {
            // Insert lintOptions after the buildTypes block closes
            contents = contents.slice(0, endIndex + 1) + lintOptionsBlock + contents.slice(endIndex + 1);
          }
        }
      }

      config.modResults.contents = contents;
    }
    return config;
  });

  return config;
};
