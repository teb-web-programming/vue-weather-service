import {computed, nextTick, ref} from 'vue'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {useWeather} from '../../../src/composables/use-weather.js'
import {fetchWeather} from '../../../src/services/weather-service.js'

vi.mock('../../../src/services/weather-service.js', () => ({
    fetchWeather: vi.fn(),
}))

describe('useWeather', () => {
    const london = {
        id: 1,
        name: 'London',
        latitude: 51.5072,
        longitude: -0.1276,
        country: 'United Kingdom',
    }

    const edinburgh = {
        id: 2,
        name: 'Edinburgh',
        latitude: 55.9533,
        longitude: -3.1883,
        country: 'United Kingdom',
    }

    const londonWeather = {
        temperature: 14,
        precipitationProbability: 10,
        windSpeed: 12,
    }

    const edinburghWeather = {
        temperature: 11,
        precipitationProbability: 20,
        windSpeed: 15,
    }

    let selectedLocations

    beforeEach(() => {
        vi.clearAllMocks()
        selectedLocations = ref([])
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('initializes with empty weather and error state', async () => {
        const weather = useWeather(selectedLocations)

        await nextTick()

        expect(weather.weatherByLocation.value).toEqual({})
        expect(weather.weatherErrors.value).toEqual({})
        expect(weather.isLoading.value).toBe(false)
        expect(weather.hasWeather.value).toBe(false)
        expect(fetchWeather).not.toHaveBeenCalled()
    })

    it('fetches weather immediately for initially selected locations', async () => {
        selectedLocations.value = [london, edinburgh]

        fetchWeather
            .mockResolvedValueOnce(londonWeather)
            .mockResolvedValueOnce(edinburghWeather)

        const weather = useWeather(selectedLocations)

        await vi.waitFor(() => {
            expect(weather.isLoading.value).toBe(false)
        })

        expect(fetchWeather).toHaveBeenCalledTimes(2)
        expect(fetchWeather).toHaveBeenNthCalledWith(1, london)
        expect(fetchWeather).toHaveBeenNthCalledWith(2, edinburgh)
        expect(weather.weatherByLocation.value).toEqual({
            1: londonWeather,
            2: edinburghWeather,
        })
        expect(weather.weatherErrors.value).toEqual({})
        expect(weather.hasWeather.value).toBe(true)
    })

    it('fetches weather when selected locations change', async () => {
        fetchWeather.mockResolvedValue(londonWeather)

        const weather = useWeather(selectedLocations)

        await nextTick()

        selectedLocations.value = [london]

        await vi.waitFor(() => {
            expect(weather.weatherByLocation.value[1]).toEqual(londonWeather)
        })

        expect(fetchWeather).toHaveBeenCalledWith(london)
    })

    it('sets loading while a request is pending', async () => {
        let resolveWeather

        fetchWeather.mockReturnValue(
            new Promise((resolve) => {
                resolveWeather = resolve
            }),
        )

        selectedLocations.value = [london]

        const weather = useWeather(selectedLocations)

        await vi.waitFor(() => {
            expect(fetchWeather).toHaveBeenCalledWith(london)
        })

        expect(weather.isLoading.value).toBe(true)

        resolveWeather(londonWeather)

        await vi.waitFor(() => {
            expect(weather.isLoading.value).toBe(false)
        })

        expect(weather.weatherByLocation.value[1]).toEqual(londonWeather)
    })

    it('records an error when a weather request fails', async () => {
        fetchWeather.mockRejectedValue(new Error('Network failure'))
        selectedLocations.value = [london]

        const weather = useWeather(selectedLocations)

        await vi.waitFor(() => {
            expect(weather.isLoading.value).toBe(false)
        })

        expect(weather.weatherByLocation.value).toEqual({})
        expect(weather.weatherErrors.value).toEqual({
            1: 'Unable to load weather. Please try again.',
        })
        expect(weather.hasWeather.value).toBe(false)
    })

    it('handles partial failures across multiple locations', async () => {
        fetchWeather
            .mockResolvedValueOnce(londonWeather)
            .mockRejectedValueOnce(new Error('Network failure'))

        selectedLocations.value = [london, edinburgh]

        const weather = useWeather(selectedLocations)

        await vi.waitFor(() => {
            expect(weather.isLoading.value).toBe(false)
        })

        expect(weather.weatherByLocation.value).toEqual({
            1: londonWeather,
        })
        expect(weather.weatherErrors.value).toEqual({
            2: 'Unable to load weather. Please try again.',
        })
        expect(weather.hasWeather.value).toBe(true)
    })

    it('clears weather and errors when the selection becomes empty', async () => {
        fetchWeather.mockResolvedValue(londonWeather)
        selectedLocations.value = [london]

        const weather = useWeather(selectedLocations)

        await vi.waitFor(() => {
            expect(weather.weatherByLocation.value[1]).toEqual(londonWeather)
        })

        weather.weatherErrors.value = {
            1: 'Previous error',
        }

        selectedLocations.value = []

        await vi.waitFor(() => {
            expect(weather.weatherByLocation.value).toEqual({})
        })

        expect(weather.weatherErrors.value).toEqual({})
        expect(weather.isLoading.value).toBe(false)
        expect(weather.hasWeather.value).toBe(false)
    })

    it('supports manually refreshing weather', async () => {
        fetchWeather
            .mockResolvedValueOnce(londonWeather)
            .mockResolvedValueOnce({
                ...londonWeather,
                temperature: 16,
            })

        selectedLocations.value = [london]

        const weather = useWeather(selectedLocations)

        await vi.waitFor(() => {
            expect(weather.weatherByLocation.value[1]).toEqual(londonWeather)
        })

        await weather.refreshWeather()

        expect(fetchWeather).toHaveBeenCalledTimes(2)
        expect(weather.weatherByLocation.value[1].temperature).toBe(16)
        expect(weather.weatherErrors.value).toEqual({})
        expect(weather.isLoading.value).toBe(false)
    })

    it('allows refreshing an explicitly supplied location list', async () => {
        fetchWeather.mockResolvedValue(edinburghWeather)

        const weather = useWeather(selectedLocations)

        await weather.refreshWeather([edinburgh])

        expect(fetchWeather).toHaveBeenCalledWith(edinburgh)
        expect(weather.weatherByLocation.value).toEqual({
            2: edinburghWeather,
        })
        expect(weather.hasWeather.value).toBe(true)
    })

    it('clears previous errors when a refresh starts', async () => {
        fetchWeather
            .mockRejectedValueOnce(new Error('First failure'))
            .mockResolvedValueOnce(londonWeather)

        selectedLocations.value = [london]

        const weather = useWeather(selectedLocations)

        await vi.waitFor(() => {
            expect(weather.weatherErrors.value[1]).toBeDefined()
        })

        const refreshPromise = weather.refreshWeather()

        expect(weather.weatherErrors.value).toEqual({})

        await refreshPromise

        expect(weather.weatherErrors.value).toEqual({})
        expect(weather.weatherByLocation.value[1]).toEqual(londonWeather)
    })

    it('ignores stale results when a newer request completes first', async () => {
        let resolveFirstRequest

        fetchWeather
            .mockReturnValueOnce(
                new Promise((resolve) => {
                    resolveFirstRequest = resolve
                }),
            )
            .mockResolvedValueOnce({
                ...londonWeather,
                temperature: 18,
            })

        selectedLocations.value = [london]

        const weather = useWeather(selectedLocations)

        await vi.waitFor(() => {
            expect(fetchWeather).toHaveBeenCalledTimes(1)
        })

        const secondRequest = weather.refreshWeather()

        await secondRequest

        expect(weather.weatherByLocation.value[1].temperature).toBe(18)

        resolveFirstRequest({
            ...londonWeather,
            temperature: 10,
        })

        await vi.waitFor(() => {
            expect(weather.weatherByLocation.value[1].temperature).toBe(18)
        })
    })

    it('does not overwrite newer results with an older failed request', async () => {
        let rejectFirstRequest

        fetchWeather
            .mockReturnValueOnce(
                new Promise((resolve, reject) => {
                    rejectFirstRequest = reject
                }),
            )
            .mockResolvedValueOnce(londonWeather)

        selectedLocations.value = [london]

        const weather = useWeather(selectedLocations)

        await vi.waitFor(() => {
            expect(fetchWeather).toHaveBeenCalledTimes(1)
        })

        await weather.refreshWeather()

        rejectFirstRequest(new Error('Old request failed'))

        await nextTick()

        expect(weather.weatherByLocation.value[1]).toEqual(londonWeather)
        expect(weather.weatherErrors.value).toEqual({})
    })

    it('does not call the service when manually refreshing an empty list', async () => {
        const weather = useWeather(selectedLocations)

        await weather.refreshWeather([])

        expect(fetchWeather).not.toHaveBeenCalled()
        expect(weather.weatherByLocation.value).toEqual({})
        expect(weather.weatherErrors.value).toEqual({})
        expect(weather.isLoading.value).toBe(false)
    })
})
