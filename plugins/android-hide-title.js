const { withAndroidStyles } = require('@expo/config-plugins')

module.exports = function androidHideTitle(config) {
    return withAndroidStyles(config, (config) => {
        const styles = config.modResults
        const allStyles = styles.resources.style ?? []

        const setItem = (styleObj, name, value) => {
            if (!styleObj.item) styleObj.item = []
            const existing = styleObj.item.find((i) => i.$.name === name)
            if (existing) {
                existing._ = value
            } else {
                styleObj.item.push({ $: { name }, _: value })
            }
        }

        // Apply to ALL styles to be safe
        allStyles.forEach((style) => {
            setItem(style, 'windowActionBar', 'false')
            setItem(style, 'windowNoTitle', 'true')
            // Also set the android versions for newer APIs
            setItem(style, 'android:windowActionBar', 'false')
            setItem(style, 'android:windowNoTitle', 'true')
        })

        // If AppTheme doesn't exist, create it
        const hasAppTheme = allStyles.some((s) => s.$.name === 'AppTheme')
        if (!hasAppTheme) {
            styles.resources.style = [
                ...allStyles,
                {
                    $: {
                        name: 'AppTheme',
                        parent: 'Theme.AppCompat.DayNight.NoActionBar',
                    },
                    item: [
                        { $: { name: 'windowActionBar' }, _: 'false' },
                        { $: { name: 'windowNoTitle' }, _: 'true' },
                        { $: { name: 'android:statusBarColor' }, _: '#00C897' },
                    ],
                },
            ]
        }

        return config
    })
}