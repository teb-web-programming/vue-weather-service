const REQUIRED_CURRENT_FIELDS = [
    'time',
    'temperature_2m',
    'weather_code',
]

const REQUIRED_DAILY_FIELDS = [
    'time',
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
]

function isValidNumber(value) {
    return typeof value === 'number' && Number.isFinite(value)
}

function normalizeMetric(value) {
    return isValidNumber(value) ? value : null
}

export function normalizeWeather(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid weather response.')
    }

    const current = data.current
    const daily = data.daily

    if (!current || !daily) {
        throw new Error('Weather response is missing current or daily data.')
    }

    const missingCurrentFields = REQUIRED_CURRENT_FIELDS.filter(
        (field) => current[field] === undefined || current[field] === null,
    )

    const missingDailyFields = REQUIRED_DAILY_FIELDS.filter(
        (field) => !Array.isArray(daily[field]),
    )

    if (missingCurrentFields.length || missingDailyFields.length) {
        throw new Error('Weather response is missing required fields.')
    }

    const forecastLength = daily.time.length

    if (
        forecastLength === 0 ||
        !REQUIRED_DAILY_FIELDS.every(
            (field) => daily[field].length === forecastLength,
        )
    ) {
        throw new Error('Weather forecast data has inconsistent lengths.')
    }

    return {
        coordinates: {
            latitude: normalizeMetric(data.latitude),
            longitude: normalizeMetric(data.longitude),
        },
        timezone: data.timezone ?? null,
        current: {
            time: current.time,
            temperature: normalizeMetric(current.temperature_2m),
            feelsLike: normalizeMetric(current.apparent_temperature),
            humidity: normalizeMetric(current.relative_humidity_2m),
            isDay: current.is_day ?? null,
            precipitation: normalizeMetric(current.precipitation),
            weatherCode: current.weather_code,
            windSpeed: normalizeMetric(current.wind_speed_10m),
            windDirection: normalizeMetric(current.wind_direction_10m),
        },
        forecast: daily.time.map((date, index) => ({
            date,
            weatherCode: daily.weather_code[index],
            temperatureMax: normalizeMetric(daily.temperature_2m_max[index]),
            temperatureMin: normalizeMetric(daily.temperature_2m_min[index]),
            precipitationProbability: normalizeMetric(
                daily.precipitation_probability_max?.[index],
            ),
            precipitation: normalizeMetric(daily.precipitation_sum?.[index]),
            windSpeedMax: normalizeMetric(daily.wind_speed_10m_max?.[index]),
        })),
        units: {
            temperature: data.current_units?.temperature_2m ?? null,
            precipitation: data.current_units?.precipitation ?? null,
            windSpeed: data.current_units?.wind_speed_10m ?? null,
            humidity: data.current_units?.relative_humidity_2m ?? null,
        },
    }
}
