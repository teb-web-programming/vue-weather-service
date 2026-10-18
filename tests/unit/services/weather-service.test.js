import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import {fetchWeather} from '../../../src/services/weather-service.js'
import {
    getCachedWeather,
    setCachedWeather,
} from '../../../src/services/weather-cache.js'

vi.mock('../../../src/services/weather-cache.js', () => ({
    getCachedWeather: vi.fn(),
    setCachedWeather: vi.fn(),
}))

function createWeatherResponse() {
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
            weather_code: [3, 61, 2, 1, 3],
            temperature_2m_max: [14, 11, 13, 15, 12],
            temperature_2m_min: [8, 6, 7, 9, 8],
            precipitation_probability_max: [20, 80, 10, 0, 30],
            precipitation_sum: [0, 4.5, 0, 0, 1],
            wind_speed_10m_max: [18, 25, 12, 10, 16],
        },
    }
}

const location = {
    id: 'edinburgh',
    name: 'Edinburgh',
    latitude: 55.9533,
    longitude: -3.1883,
    timezone: 'Europe/London',
}

describe('fetchWeather', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubGlobal('fetch', vi.fn())

        getCachedWeather.mockReturnValue(null)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('throws when the location is missing', async () => {
        await expect(fetchWeather(null)).rejects.toThrow(
            'A valid location is required to fetch weather.',
        )

        expect(fetch).not.toHaveBeenCalled()
    })

    it('throws when coordinates are missing or invalid', async () => {
        const invalidLocations = [
            {},
            {latitude: 55.9533},
            {longitude: -3.1883},
            {latitude: NaN, longitude: -3.1883},
            {latitude: 55.9533, longitude: Infinity},
            {latitude: '55.9533', longitude: -3.1883},
        ]

        for (const invalidLocation of invalidLocations) {
            await expect(fetchWeather(invalidLocation)).rejects.toThrow(
                'A valid location is required to fetch weather.',
            )
        }

        expect(fetch).not.toHaveBeenCalled()
    })

    it('returns cached weather without making an API request', async () => {
        const cachedWeather = {
            current: {temperature: 12},
            forecast: [],
        }

        getCachedWeather.mockReturnValue(cachedWeather)

        const result = await fetchWeather(location)

        expect(result).toBe(cachedWeather)
        expect(getCachedWeather).toHaveBeenCalledWith(
            '55.9533:-3.1883:Europe/London',
        )
        expect(fetch).not.toHaveBeenCalled()
        expect(setCachedWeather).not.toHaveBeenCalled()
    })

    it('uses Europe/London when the location has no timezone', async () => {
        const locationWithoutTimezone = {
            latitude: 55.9533,
            longitude: -3.1883,
        }

        getCachedWeather.mockReturnValue(null)
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(createWeatherResponse()),
        })

        await fetchWeather(locationWithoutTimezone)

        expect(getCachedWeather).toHaveBeenCalledWith(
            '55.9533:-3.1883:Europe/London',
        )

        const requestUrl = new URL(fetch.mock.calls[0][0])

        expect(requestUrl.searchParams.get('timezone')).toBe('Europe/London')
    })

    it('requests weather with the expected parameters', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(createWeatherResponse()),
        })

        await fetchWeather(location)

        expect(fetch).toHaveBeenCalledTimes(1)

        const requestUrl = new URL(fetch.mock.calls[0][0])

        expect(requestUrl.origin).toBe('https://api.open-meteo.com')
        expect(requestUrl.pathname).toBe('/v1/forecast')

        expect(requestUrl.searchParams.get('latitude')).toBe('55.9533')
        expect(requestUrl.searchParams.get('longitude')).toBe('-3.1883')
        expect(requestUrl.searchParams.get('timezone')).toBe('Europe/London')
        expect(requestUrl.searchParams.get('forecast_days')).toBe('5')
        expect(requestUrl.searchParams.get('temperature_unit')).toBe('celsius')
        expect(requestUrl.searchParams.get('wind_speed_unit')).toBe('kmh')
        expect(requestUrl.searchParams.get('precipitation_unit')).toBe('mm')

        expect(requestUrl.searchParams.get('current').split(',')).toEqual([
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'is_day',
            'precipitation',
            'weather_code',
            'wind_speed_10m',
            'wind_direction_10m',
        ])

        expect(requestUrl.searchParams.get('daily').split(',')).toEqual([
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_probability_max',
            'precipitation_sum',
            'wind_speed_10m_max',
        ])
    })

    it('normalizes the API response and caches the result', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(createWeatherResponse()),
        })

        const result = await fetchWeather(location)

        expect(result.current.temperature).toBe(12.5)
        expect(result.current.feelsLike).toBe(11.2)
        expect(result.forecast).toHaveLength(5)
        expect(result.forecast[0]).toMatchObject({
            date: '2026-10-17',
            temperatureMax: 14,
            temperatureMin: 8,
        })

        expect(setCachedWeather).toHaveBeenCalledTimes(1)
        expect(setCachedWeather).toHaveBeenCalledWith(
            '55.9533:-3.1883:Europe/London',
            result,
        )
    })

    it('throws an error when the API returns an unsuccessful status', async () => {
        fetch.mockResolvedValue({
            ok: false,
            status: 503,
        })

        await expect(fetchWeather(location)).rejects.toThrow(
            'Weather request failed (503). Please try again.',
        )

        expect(setCachedWeather).not.toHaveBeenCalled()
    })

    it('propagates JSON parsing errors', async () => {
        const parsingError = new Error('Invalid JSON')

        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockRejectedValue(parsingError),
        })

        await expect(fetchWeather(location)).rejects.toThrow('Invalid JSON')

        expect(setCachedWeather).not.toHaveBeenCalled()
    })

    it('propagates errors from weather response normalization', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({invalid: true}),
        })

        await expect(fetchWeather(location)).rejects.toThrow(
            'Weather response is missing current or daily data.',
        )

        expect(setCachedWeather).not.toHaveBeenCalled()
    })

    it('uses different cache keys for different coordinates', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(createWeatherResponse()),
        })

        await fetchWeather(location)

        await fetchWeather({
            ...location,
            latitude: 51.5072,
            longitude: -0.1276,
        })

        expect(getCachedWeather).toHaveBeenNthCalledWith(
            1,
            '55.9533:-3.1883:Europe/London',
        )

        expect(getCachedWeather).toHaveBeenNthCalledWith(
            2,
            '51.5072:-0.1276:Europe/London',
        )

        expect(fetch).toHaveBeenCalledTimes(2)
    })
})
