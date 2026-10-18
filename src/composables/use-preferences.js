import {ref} from 'vue'

const DEFAULT_PREFERENCES = {
    preferWarmer: false,
    preferLowerRainProbability: false,
    preferLowerWindSpeed: false,
}

export function usePreferences() {
    const preferences = ref({...DEFAULT_PREFERENCES})

    function updatePreference(name, value) {
        if (!Object.hasOwn(DEFAULT_PREFERENCES, name)) {
            return
        }

        if (typeof value !== 'boolean') {
            return
        }

        preferences.value = {
            ...preferences.value,
            [name]: value,
        }
    }

    function resetPreferences() {
        preferences.value = {...DEFAULT_PREFERENCES}
    }

    return {
        preferences,
        updatePreference,
        resetPreferences,
    }
}
