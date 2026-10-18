import {describe, expect, it} from 'vitest'

import {normalizeWeather} from '../../../src/models/weather.js'

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
            time: ['2026-10-17', '2026-10-18'],
            weather_code: [3, 61],
            temperature_2m_max: [14.2, 11.5],
            temperature_2m_min: [8.1, 6.4],
            precipitation_probability_max: [20, 80],
            precipitation_sum: [0, 4.5],
            wind_speed_10m_max: [18, 25],
        },
    }
}

describe('normalizeWeather', () => {
    it('normalizes a complete weather response', () => {
        const result = normalizeWeather(createWeatherResponse())

        expect(result).toEqual({
            coordinates: {
                latitude: 55.9533,
                longitude: -3.1883,
            },
            timezone: 'Europe/London',
            current: {
                time: '2026-10-17T12:00',
                temperature: 12.5,
                feelsLike: 11.2,
                humidity: 76,
                isDay: 1,
                precipitation: 0,
                weatherCode: 3,
                windSpeed: 14.4,
                windDirection: 240,
            },
            forecast: [
                {
                    date: '2026-10-17',
                    weatherCode: 3,
                    temperatureMax: 14.2,
                    temperatureMin: 8.1,
                    precipitationProbability: 20,
                    precipitation: 0,
                    windSpeedMax: 18,
                },
                {
                    date: '2026-10-18',
                    weatherCode: 61,
                    temperatureMax: 11.5,
                    temperatureMin: 6.4,
                    precipitationProbability: 80,
                    precipitation: 4.5,
                    windSpeedMax: 25,
                },
            ],
            units: {
                temperature: '°C',
                precipitation: 'mm',
                windSpeed: 'km/h',
                humidity: '%',
            },
        })
    })

    it('preserves valid zero values', () => {
        const data = createWeatherResponse()

        data.current.temperature_2m = 0
        data.current.apparent_temperature = 0
        data.current.precipitation = 0
        data.current.wind_speed_10m = 0
        data.daily.temperature_2m_max = [0, 0]
        data.daily.temperature_2m_min = [0, 0]
        data.daily.precipitation_probability_max = [0, 0]
        data.daily.precipitation_sum = [0, 0]
        data.daily.wind_speed_10m_max = [0, 0]

        const result = normalizeWeather(data)

        expect(result.current.temperature).toBe(0)
        expect(result.current.feelsLike).toBe(0)
        expect(result.current.precipitation).toBe(0)
        expect(result.current.windSpeed).toBe(0)
        expect(result.forecast[0]).toMatchObject({
            temperatureMax: 0,
            temperatureMin: 0,
            precipitationProbability: 0,
            precipitation: 0,
            windSpeedMax: 0,
        })
    })

    it('converts invalid numeric measurements to null', () => {
        const data = createWeatherResponse()

        data.latitude = NaN
        data.longitude = Infinity
        data.current.temperature_2m = NaN
        data.current.apparent_temperature = '11'
        data.current.relative_humidity_2m = undefined
        data.current.precipitation = Infinity
        data.current.wind_speed_10m = '14'
        data.current.wind_direction_10m = NaN
        data.daily.temperature_2m_max[0] = NaN
        data.daily.temperature_2m_min[0] = Infinity
        data.daily.precipitation_probability_max[0] = '20'
        data.daily.precipitation_sum[0] = NaN
        data.daily.wind_speed_10m_max[0] = Infinity

        const result = normalizeWeather(data)

        expect(result.coordinates).toEqual({
            latitude: null,
            longitude: null,
        })
        expect(result.current).toMatchObject({
            temperature: null,
            feelsLike: null,
            humidity: null,
            precipitation: null,
            windSpeed: null,
            windDirection: null,
        })
        expect(result.forecast[0]).toMatchObject({
            temperatureMax: null,
            temperatureMin: null,
            precipitationProbability: null,
            precipitation: null,
            windSpeedMax: null,
        })
    })

    it('uses null for missing optional fields', () => {
        const data = createWeatherResponse()

        delete data.latitude
        delete data.longitude
        delete data.timezone
        delete data.current.apparent_temperature
        delete data.current.relative_humidity_2m
        delete data.current.is_day
        delete data.current.precipitation
        delete data.current.wind_speed_10m
        delete data.current.wind_direction_10m
        delete data.current_units
        delete data.daily.precipitation_probability_max
        delete data.daily.precipitation_sum
        delete data.daily.wind_speed_10m_max

        const result = normalizeWeather(data)

        expect(result.coordinates).toEqual({
            latitude: null,
            longitude: null,
        })
        expect(result.timezone).toBeNull()
        expect(result.current).toMatchObject({
            feelsLike: null,
            humidity: null,
            isDay: null,
            precipitation: null,
            windSpeed: null,
            windDirection: null,
        })
        expect(result.forecast[0]).toMatchObject({
            precipitationProbability: null,
            precipitation: null,
            windSpeedMax: null,
        })
        expect(result.units).toEqual({
            temperature: null,
            precipitation: null,
            windSpeed: null,
            humidity: null,
        })
    })

    it('throws when the response is null or not an object', () => {
        expect(() => normalizeWeather(null)).toThrow(
            'Invalid weather response.',
        )
        expect(() => normalizeWeather(undefined)).toThrow(
            'Invalid weather response.',
        )
        expect(() => normalizeWeather('weather')).toThrow(
            'Invalid weather response.',
        )
    })

    it('throws when current or daily data is missing', () => {
        const missingCurrent = createWeatherResponse()
        delete missingCurrent.current

        const missingDaily = createWeatherResponse()
        delete missingDaily.daily

        expect(() => normalizeWeather(missingCurrent)).toThrow(
            'Weather response is missing current or daily data.',
        )
        expect(() => normalizeWeather(missingDaily)).toThrow(
            'Weather response is missing current or daily data.',
        )
    })

    it('throws when required current fields are missing', () => {
        const data = createWeatherResponse()
        delete data.current.temperature_2m

        expect(() => normalizeWeather(data)).toThrow(
            'Weather response is missing required fields.',
        )
    })

    it('throws when required daily fields are not arrays', () => {
        const data = createWeatherResponse()
        data.daily.temperature_2m_max = null

        expect(() => normalizeWeather(data)).toThrow(
            'Weather response is missing required fields.',
        )
    })

    it('throws when the forecast is empty', () => {
        const data = createWeatherResponse()

        data.daily.time = []
        data.daily.weather_code = []
        data.daily.temperature_2m_max = []
        data.daily.temperature_2m_min = []

        expect(() => normalizeWeather(data)).toThrow(
            'Weather forecast data has inconsistent lengths.',
        )
    })

    it('throws when required daily arrays have inconsistent lengths', () => {
        const data = createWeatherResponse()
        data.daily.temperature_2m_max.pop()

        expect(() => normalizeWeather(data)).toThrow(
            'Weather forecast data has inconsistent lengths.',
        )
    })

    it('preserves forecast dates and weather codes', () => {
        const result = normalizeWeather(createWeatherResponse())

        expect(result.forecast.map(({date}) => date)).toEqual([
            '2026-10-17',
            '2026-10-18',
        ])
        expect(result.forecast.map(({weatherCode}) => weatherCode)).toEqual([
            3,
            61,
        ])
    })
})
