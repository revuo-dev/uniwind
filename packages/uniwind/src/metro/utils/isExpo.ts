export const isExpo = () => {
    try {
        require('@expo/metro-config')

        return true
    } catch {
        return false
    }
}
