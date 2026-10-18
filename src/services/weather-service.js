import {normalizeWeather} from '../models/weather.js'
import {
    getCachedWeather,
    setCachedWeather,
} from './weather-cache.js'

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast'

const CURRENT_VARIABLES = [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'is_day',
    'precipitation',
    'weather_code',
    'wind_speed_10m',
    'wind_direction_10m',
]

const DAILY_VARIABLES = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_probability_max',
    'precipitation_sum',
    'wind_speed_10m_max',
]

export async function fetchWeather(location, {forceRefresh = false} = {}) {
    if (
        !location ||
        !Number.isFinite(location.latitude) ||
        !Number.isFinite(location.longitude)
    ) {
        throw new Error('A valid location is required to fetch weather.')
    }

    const cacheKey = [
        location.latitude,
        location.longitude,
        location.timezone || 'Europe/London',
    ].join(':')

    if (!forceRefresh) {
        const cachedWeather = getCachedWeather(cacheKey)

        if (cachedWeather) {
            return cachedWeather
        }
    }

    const params = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        current: CURRENT_VARIABLES.join(','),
        daily: DAILY_VARIABLES.join(','),
        forecast_days: '5',
        timezone: location.timezone || 'Europe/London',
        temperature_unit: 'celsius',
        wind_speed_unit: 'kmh',
        precipitation_unit: 'mm',
    })

    const response = await fetch(`${WEATHER_API_URL}?${params}`)

    if (!response.ok) {
        throw new Error(
            `Weather request failed (${response.status}). Please try again.`,
        )
    }

    const data = await response.json()
    const weather = {
        ...normalizeWeather(data),
        fetchedAt: Date.now(),
    }

    setCachedWeather(cacheKey, weather)

    return weather
}
