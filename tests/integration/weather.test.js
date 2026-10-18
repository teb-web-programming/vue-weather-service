import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {nextTick, ref} from 'vue'

import {useWeather} from '../../src/composables/use-weather.js'
import {clearWeatherCache} from '../../src/services/weather-cache.js'

function createWeatherResponse(overrides = {}) {
    return {
        latitude: 55.9533,
        longitude: -3.1883,
        timezone: 'Europe/London',
        current: {
            time: '2026-10-17T12:00',
            temperature_2m: 12.5,
            apparent_temperature: 11.2,
            relative_humidity_2m: 76,
            is_day: 1,
            precipitation: 0,
            weather_code: 3,
            wind_speed_10m: 14.4,
            wind_direction_10m: 240,
        },
        current_units: {
            temperature_2m: '°C',
            precipitation: 'mm',
            wind_speed_10m: 'km/h',
            relative_humidity_2m: '%',
        },
        daily: {
            time: [
                '2026-10-17',
                '2026-10-18',
                '2026-10-19',
                '2026-10-20',
                '2026-10-21',
            ],
            weather_code: [3, 61, 2, 0, 1],
            temperature_2m_max: [14.2, 11.5, 13, 15, 14],
            temperature_2m_min: [8.1, 6.4, 7, 9, 8],
            precipitation_probability_max: [20, 80, 30, 0, 10],
            precipitation_sum: [0, 4.5, 1, 0, 0.2],
            wind_speed_10m_max: [18, 25, 16, 12, 14],
        },
        ...overrides,
    }
}

function createLocation(overrides = {}) {
    return {
        id: 1,
        name: 'Edinburgh',
        latitude: 55.9533,
        longitude: -3.1883,
        timezone: 'Europe/London',
        ...overrides,
    }
}

function mockWeatherResponse(data = createWeatherResponse()) {
    return {
        ok: true,
        json: vi.fn().mockResolvedValue(data),
    }
}

function createDeferred() {
    let resolve
    let reject

    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise
        reject = rejectPromise
    })

    return {promise, resolve, reject}
}

describe('weather integration', () => {
    beforeEach(() => {
        clearWeatherCache()
        vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
        clearWeatherCache()
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('fetches, normalises and exposes weather through composable state', async () => {
        fetch.mockResolvedValue(mockWeatherResponse())

        const selectedLocations = ref([createLocation()])
        const weather = useWeather(selectedLocations)

        await vi.waitFor(() => {
            expect(weather.isLoading.value).toBe(false)
            expect(weather.hasWeather.value).toBe(true)
        })

        expect(fetch).toHaveBeenCalledTimes(1)
        expect(weather.weatherErrors.value).toEqual({})
        expect(weather.weatherByLocation.value[1]).toMatchObject({
            coordinates: {
                latitude: 55.9533,
                longitude: -3.1883,
            },
            current: {
                temperature: 12.5,
                feelsLike: 11.2,
                humidity: 76,
                precipitation: 0,
                weatherCode: 3,
            },
        })
        expect(weather.weatherByLocation.value[1].forecast).toHaveLength(5)
    })

    it('uses cached weather when refreshing the same location', async () => {
        fetch.mockResolvedValue(mockWeatherResponse())

        const location = createLocation()
        const weather = useWeather(ref([location]))

        await vi.waitFor(() => {
            expect(weather.hasWeather.value).toBe(true)
        })

        const firstResult = weather.weatherByLocation.value[location.id]

        await weather.refreshWeather([location])

        expect(fetch).toHaveBeenCalledTimes(1)
        expect(weather.weatherByLocation.value[location.id]).toBe(firstResult)
    })

    it('exposes an error when the weather API request fails', async () => {
        fetch.mockResolvedValue({
            ok: false,
            status: 503,
        })

        const location = createLocation()
        const weather = useWeather(ref([location]))

        await vi.waitFor(() => {
            expect(weather.isLoading.value).toBe(false)
        })

        expect(weather.weatherErrors.value[location.id]).toBe(
            'Unable to load weather. Please try again.',
        )
        expect(weather.hasWeather.value).toBe(false)
    })

    it('loads weather for multiple selected locations', async () => {
        fetch
            .mockResolvedValueOnce(
                mockWeatherResponse(createWeatherResponse()),
            )
            .mockResolvedValueOnce(
                mockWeatherResponse(
                    createWeatherResponse({
                        latitude: 51.5072,
                        longitude: -0.1276,
                    }),
                ),
            )

        const locations = [
            createLocation(),
            createLocation({
                id: 2,
                name: 'London',
                latitude: 51.5072,
                longitude: -0.1276,
            }),
        ]

        const weather = useWeather(ref(locations))

        await vi.waitFor(() => {
            expect(weather.isLoading.value).toBe(false)
            expect(weather.hasWeather.value).toBe(true)
        })

        expect(fetch).toHaveBeenCalledTimes(2)
        expect(Object.keys(weather.weatherByLocation.value)).toEqual([
            '1',
            '2',
        ])
        expect(weather.weatherByLocation.value[2].coordinates).toEqual({
            latitude: 51.5072,
            longitude: -0.1276,
        })
        expect(weather.weatherErrors.value).toEqual({})
    })

    it('clears weather state when the selected locations become empty', async () => {
        fetch.mockResolvedValue(mockWeatherResponse())

        const selectedLocations = ref([createLocation()])
        const weather = useWeather(selectedLocations)

        await vi.waitFor(() => {
            expect(weather.hasWeather.value).toBe(true)
        })

        selectedLocations.value = []
        await nextTick()

        await vi.waitFor(() => {
            expect(weather.hasWeather.value).toBe(false)
            expect(weather.isLoading.value).toBe(false)
        })

        expect(weather.weatherByLocation.value).toEqual({})
    })

    it('does not let an older request overwrite a newer result', async () => {
        const olderRequest = createDeferred()
        const newerRequest = createDeferred()

        fetch
            .mockReturnValueOnce(olderRequest.promise)
            .mockReturnValueOnce(newerRequest.promise)

        const location = createLocation()
        const weather = useWeather(ref([location]))

        // The immediate watcher starts the first request.
        await vi.waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1)
        })

        // Start a newer request before the first one completes.
        const newerRefresh = weather.refreshWeather([location])

        await vi.waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(2)
        })

        // Complete the newer request first.
        newerRequest.resolve(
            mockWeatherResponse(
                createWeatherResponse({
                    current: {
                        ...createWeatherResponse().current,
                        temperature_2m: 20,
                    },
                }),
            ),
        )

        await newerRefresh

        expect(weather.weatherByLocation.value[location.id].current.temperature)
            .toBe(20)

        // Now complete the older request with a different temperature.
        olderRequest.resolve(
            mockWeatherResponse(
                createWeatherResponse({
                    current: {
                        ...createWeatherResponse().current,
                        temperature_2m: 5,
                    },
                }),
            ),
        )

        await vi.waitFor(() => {
            expect(weather.isLoading.value).toBe(false)
        })

        // The stale result must not replace the newer result.
        expect(weather.weatherByLocation.value[location.id].current.temperature)
            .toBe(20)
    })
})
