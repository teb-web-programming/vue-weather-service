import {computed, ref, watch} from 'vue'
import {fetchWeather} from '../services/weather-service.js'

export function useWeather(selectedLocations) {
    const weatherByLocation = ref({})
    const weatherErrors = ref({})
    const isRefreshingByLocation = ref({})
    const isLoading = ref(false)

    let requestId = 0
    const locationRequestIds = new Map()

    const hasWeather = computed(
        () => Object.keys(weatherByLocation.value).length > 0,
    )

    function nextLocationRequestId(locationId) {
        const key = String(locationId)
        const nextId = (locationRequestIds.get(key) ?? 0) + 1

        locationRequestIds.set(key, nextId)

        return nextId
    }

    async function refreshWeather(locations = selectedLocations.value) {
        const currentRequestId = ++requestId

        isLoading.value = locations.length > 0

        if (locations.length === 0) {
            for (const locationId of locationRequestIds.keys()) {
                nextLocationRequestId(locationId)
            }

            weatherByLocation.value = {}
            weatherErrors.value = {}
            isRefreshingByLocation.value = {}
            isLoading.value = false
            return
        }

        const activeIds = new Set(
            locations.map((location) => String(location.id)),
        )

        for (const [locationId] of locationRequestIds) {
            if (!activeIds.has(locationId)) {
                nextLocationRequestId(locationId)

                const nextRefreshing = {
                    ...isRefreshingByLocation.value,
                }

                delete nextRefreshing[locationId]
                isRefreshingByLocation.value = nextRefreshing
            }
        }

        const requestTokens = locations.map((location) => ({
            locationId: String(location.id),
            requestId: nextLocationRequestId(location.id),
        }))

        const previousErrors = weatherErrors.value
        weatherErrors.value = {}

        const results = await Promise.allSettled(
            locations.map(async (location) => ({
                locationId: location.id,
                weather: await fetchWeather(location),
            })),
        )

        if (currentRequestId !== requestId) {
            return
        }

        const nextWeather = {}
        const nextErrors = {}

        results.forEach((result, index) => {
            const location = locations[index]
            const token = requestTokens[index]
            const key = token.locationId

            if (locationRequestIds.get(key) !== token.requestId) {
                if (weatherByLocation.value[key]) {
                    nextWeather[key] = weatherByLocation.value[key]
                }

                if (weatherErrors.value[key] || previousErrors[key]) {
                    nextErrors[key] =
                        weatherErrors.value[key] ?? previousErrors[key]
                }

                return
            }

            if (result.status === 'fulfilled') {
                nextWeather[key] = result.value.weather
                return
            }

            const previousWeather = weatherByLocation.value[key]

            if (previousWeather) {
                nextWeather[key] = previousWeather
            }

            nextErrors[key] =
                'Unable to load weather. Please try again.'
        })

        weatherByLocation.value = nextWeather
        weatherErrors.value = nextErrors
        isLoading.value = false
    }

    async function refreshLocation(location) {
        const key = String(location.id)
        const currentRequestId = nextLocationRequestId(location.id)

        isRefreshingByLocation.value = {
            ...isRefreshingByLocation.value,
            [key]: true,
        }

        const nextErrors = {...weatherErrors.value}
        delete nextErrors[key]
        weatherErrors.value = nextErrors

        try {
            const weather = await fetchWeather(location, {forceRefresh: true})

            if (locationRequestIds.get(key) !== currentRequestId) {
                return
            }

            weatherByLocation.value = {
                ...weatherByLocation.value,
                [key]: weather,
            }

            const clearedErrors = {...weatherErrors.value}
            delete clearedErrors[key]
            weatherErrors.value = clearedErrors
        } catch {
            if (locationRequestIds.get(key) !== currentRequestId) {
                return
            }

            weatherErrors.value = {
                ...weatherErrors.value,
                [key]: 'Unable to load weather. Please try again.',
            }
        } finally {
            if (locationRequestIds.get(key) === currentRequestId) {
                const nextRefreshing = {
                    ...isRefreshingByLocation.value,
                }

                delete nextRefreshing[key]
                isRefreshingByLocation.value = nextRefreshing
            }
        }
    }

    watch(
        selectedLocations,
        (locations) => {
            refreshWeather(locations)
        },
        {immediate: true},
    )

    return {
        weatherByLocation,
        weatherErrors,
        isLoading,
        isRefreshingByLocation,
        hasWeather,
        refreshWeather,
        refreshLocation,
    }
}
