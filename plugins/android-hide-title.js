const { withAndroidStyles } = require('@expo/config-plugins')

module.exports = function androidHideTitle(config) {
    return withAndroidStyles(config, (config) => {
        const styles = config.modResults
        const styleEntries = Array.isArray(styles.resources.style)
            ? styles.resources.style
            : styles.resources.style
                ? [styles.resources.style]
                : []

        const setItem = (styleObj, name, value) => {
            if (!styleObj.item) styleObj.item = []
            const existing = styleObj.item.find((i) => i.$.name === name)
            if (existing) {
                existing._ = value
            } else {
                styleObj.item.push({ $: { name }, _: value })
            }
        }

        const applyNoTitleBar = (styleObj) => {
            setItem(styleObj, 'windowActionBar', 'false')
            setItem(styleObj, 'windowNoTitle', 'true')
            setItem(styleObj, 'android:windowActionBar', 'false')
            setItem(styleObj, 'android:windowNoTitle', 'true')
        }

        styleEntries.forEach((style) => {
            if (!style.$?.name) return
            if (style.$.name === 'AppTheme' || style.$.name === 'Theme.App.SplashScreen') {
                applyNoTitleBar(style)
            }
        })

        const hasAppTheme = styleEntries.some((s) => s.$?.name === 'AppTheme')
        if (!hasAppTheme) {
            styleEntries.push({
                $: {
                    name: 'AppTheme',
                    parent: 'Theme.AppCompat.DayNight.NoActionBar',
                },
                item: [
                    { $: { name: 'windowActionBar' }, _: 'false' },
                    { $: { name: 'windowNoTitle' }, _: 'true' },
                    { $: { name: 'android:windowActionBar' }, _: 'false' },
                    { $: { name: 'android:windowNoTitle' }, _: 'true' },
                    { $: { name: 'android:statusBarColor' }, _: '#00C897' },
                ],
            })
        }

        styles.resources.style = styleEntries

        return config
    })
}