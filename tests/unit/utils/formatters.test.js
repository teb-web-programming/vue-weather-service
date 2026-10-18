import {describe, expect, it} from 'vitest'

import {
    formatTemperature,
    formatWindSpeed,
    formatPrecipitation,
    formatPercentage,
    formatHumidity,
    formatDate,
} from '../../../src/utils/formatters.js'

describe('formatTemperature', () => {
    it('formats positive, negative and zero temperatures', () => {
        expect(formatTemperature(12.6)).toBe('+13°C')
        expect(formatTemperature(-3.4)).toBe('-3°C')
        expect(formatTemperature(0)).toBe('0°C')
    })

    it('returns a dash for missing or invalid values', () => {
        expect(formatTemperature(null)).toBe('—')
        expect(formatTemperature(undefined)).toBe('—')
        expect(formatTemperature(NaN)).toBe('—')
        expect(formatTemperature(Infinity)).toBe('—')
    })
})

describe('formatWindSpeed', () => {
    it('rounds the value and appends the unit', () => {
        expect(formatWindSpeed(12.6)).toBe('13 km/h')
        expect(formatWindSpeed(0)).toBe('0 km/h')
    })

    it('returns a dash for missing or invalid values', () => {
        expect(formatWindSpeed(null)).toBe('—')
        expect(formatWindSpeed(undefined)).toBe('—')
        expect(formatWindSpeed(NaN)).toBe('—')
    })
})

describe('formatPrecipitation', () => {
    it('formats precipitation to one decimal place', () => {
        expect(formatPrecipitation(2.36)).toBe('2.4 mm')
        expect(formatPrecipitation(2)).toBe('2 mm')
        expect(formatPrecipitation(0)).toBe('0 mm')
    })

    it('returns a dash for missing or invalid values', () => {
        expect(formatPrecipitation(null)).toBe('—')
        expect(formatPrecipitation(undefined)).toBe('—')
        expect(formatPrecipitation(NaN)).toBe('—')
    })
})

describe('formatPercentage', () => {
    it('rounds the value and appends the percentage sign', () => {
        expect(formatPercentage(64.7)).toBe('65%')
        expect(formatPercentage(0)).toBe('0%')
        expect(formatPercentage(100)).toBe('100%')
    })

    it('returns a dash for missing or invalid values', () => {
        expect(formatPercentage(null)).toBe('—')
        expect(formatPercentage(undefined)).toBe('—')
        expect(formatPercentage(NaN)).toBe('—')
    })
})

describe('formatHumidity', () => {
    it('uses percentage formatting', () => {
        expect(formatHumidity(72.6)).toBe('73%')
        expect(formatHumidity(null)).toBe('—')
    })
})

describe('formatDate', () => {
    it('formats a valid date using the default UK format', () => {
        expect(formatDate('2026-10-17')).toBe('Sat 17 Oct')
    })

    it('returns a dash for missing or invalid dates', () => {
        expect(formatDate(null)).toBe('—')
        expect(formatDate('')).toBe('—')
        expect(formatDate('not-a-date')).toBe('—')
    })

    it('supports custom date-formatting options', () => {
        expect(
            formatDate('2026-10-17', {
                weekday: undefined,
                month: 'long',
            }),
        ).toBe('17 October')
    })
})
