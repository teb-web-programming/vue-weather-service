import {describe, expect, it} from 'vitest'

import {
    WEATHER_UNITS,
    WEATHER_UNIT_LABELS,
} from '../../../src/utils/units.js'

describe('WEATHER_UNITS', () => {
    it('defines the expected metric units', () => {
        expect(WEATHER_UNITS).toEqual({
            temperature: '°C',
            windSpeed: 'km/h',
            precipitation: 'mm',
            humidity: '%',
        })
    })
})

describe('WEATHER_UNIT_LABELS', () => {
    it('defines labels for all supported weather metrics', () => {
        expect(WEATHER_UNIT_LABELS).toEqual({
            temperature: 'Temperature',
            feelsLike: 'Feels like',
            humidity: 'Humidity',
            precipitation: 'Precipitation',
            precipitationProbability: 'Rain probability',
            windSpeed: 'Wind speed',
            windDirection: 'Wind direction',
        })
    })
})
