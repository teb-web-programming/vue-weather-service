import {describe, expect, it} from 'vitest'
import {
    formatLocationLabel,
    normalizeLocation,
} from '../../../src/models/location.js'

describe('normalizeLocation', () => {
    const validResult = {
        id: 2643743,
        name: 'London',
        latitude: 51.5085,
        longitude: -0.1257,
        country: 'United Kingdom',
    }

    it('normalizes a valid location result', () => {
        expect(normalizeLocation(validResult)).toEqual({
            id: 2643743,
            name: 'London',
            latitude: 51.5085,
            longitude: -0.1257,
            elevation: null,
            countryCode: null,
            country: 'United Kingdom',
            region: null,
            regionDetail: null,
            timezone: null,
            population: null,
        })
    })

    it('maps all optional API fields to their normalized names', () => {
        const result = normalizeLocation({
            ...validResult,
            elevation: 11,
            country_code: 'GB',
            admin1: 'England',
            admin2: 'Greater London',
            timezone: 'Europe/London',
            population: 8982000,
        })

        expect(result).toEqual({
            id: 2643743,
            name: 'London',
            latitude: 51.5085,
            longitude: -0.1257,
            elevation: 11,
            countryCode: 'GB',
            country: 'United Kingdom',
            region: 'England',
            regionDetail: 'Greater London',
            timezone: 'Europe/London',
            population: 8982000,
        })
    })

    it('preserves zero values for optional numeric fields', () => {
        const result = normalizeLocation({
            ...validResult,
            elevation: 0,
            population: 0,
        })

        expect(result.elevation).toBe(0)
        expect(result.population).toBe(0)
    })

    it('throws when the result is null', () => {
        expect(() => normalizeLocation(null)).toThrow(
            'Invalid location result.',
        )
    })

    it('throws when the result is undefined', () => {
        expect(() => normalizeLocation(undefined)).toThrow(
            'Invalid location result.',
        )
    })

    it('throws when the result is not an object', () => {
        expect(() => normalizeLocation('London')).toThrow(
            'Invalid location result.',
        )

        expect(() => normalizeLocation(123)).toThrow(
            'Invalid location result.',
        )
    })

    it.each([
        'id',
        'name',
        'latitude',
        'longitude',
        'country',
    ])('throws when the required field "%s" is missing', (field) => {
        const result = {...validResult}
        delete result[field]

        expect(() => normalizeLocation(result)).toThrow(
            'Location result is missing required fields.',
        )
    })

    it.each([
        'id',
        'name',
        'latitude',
        'longitude',
        'country',
    ])('throws when the required field "%s" is null', (field) => {
        const result = {
            ...validResult,
            [field]: null,
        }

        expect(() => normalizeLocation(result)).toThrow(
            'Location result is missing required fields.',
        )
    })

    it.each([
        ['latitude', NaN, -0.1257],
        ['latitude', Infinity, -0.1257],
        ['latitude', '51.5085', -0.1257],
        ['longitude', 51.5085, NaN],
        ['longitude', 51.5085, -Infinity],
        ['longitude', 51.5085, '-0.1257'],
    ])(
        'throws when %s is not a finite number',
        (field, latitude, longitude) => {
            const result = {
                ...validResult,
                latitude,
                longitude,
            }

            expect(() => normalizeLocation(result)).toThrow(
                'Location coordinates must be valid numbers.',
            )
        },
    )

    it('does not modify the original result', () => {
        const original = {...validResult}

        normalizeLocation(original)

        expect(original).toEqual(validResult)
    })
})

describe('formatLocationLabel', () => {
    it('formats a location with name, region and country', () => {
        expect(
            formatLocationLabel({
                name: 'London',
                region: 'England',
                country: 'United Kingdom',
            }),
        ).toBe('London, England, United Kingdom')
    })

    it('formats a location without a region', () => {
        expect(
            formatLocationLabel({
                name: 'Edinburgh',
                region: null,
                country: 'United Kingdom',
            }),
        ).toBe('Edinburgh, United Kingdom')
    })

    it('formats a location without a country', () => {
        expect(
            formatLocationLabel({
                name: 'London',
                region: 'England',
                country: null,
            }),
        ).toBe('London, England')
    })

    it('formats a location with only a name', () => {
        expect(
            formatLocationLabel({
                name: 'London',
                region: null,
                country: null,
            }),
        ).toBe('London')
    })

    it('omits empty region and country strings', () => {
        expect(
            formatLocationLabel({
                name: 'London',
                region: '',
                country: '',
            }),
        ).toBe('London')
    })
})
