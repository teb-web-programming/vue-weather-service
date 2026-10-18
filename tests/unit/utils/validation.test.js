import {describe, expect, it} from 'vitest'

import {
    isNonEmptyString,
    isValidCoordinates,
    isValidLocation,
} from '../../../src/utils/validation.js'

describe('isNonEmptyString', () => {
    it('accepts non-empty strings', () => {
        expect(isNonEmptyString('Edinburgh')).toBe(true)
        expect(isNonEmptyString('  London  ')).toBe(true)
    })

    it('rejects empty, whitespace-only and non-string values', () => {
        expect(isNonEmptyString('')).toBe(false)
        expect(isNonEmptyString('   ')).toBe(false)
        expect(isNonEmptyString(null)).toBe(false)
        expect(isNonEmptyString(undefined)).toBe(false)
        expect(isNonEmptyString(123)).toBe(false)
    })
})

describe('isValidCoordinates', () => {
    it('accepts valid coordinates, including geographic boundaries', () => {
        expect(isValidCoordinates(55.9533, -3.1883)).toBe(true)
        expect(isValidCoordinates(0, 0)).toBe(true)
        expect(isValidCoordinates(90, 180)).toBe(true)
        expect(isValidCoordinates(-90, -180)).toBe(true)
    })

    it('rejects coordinates outside valid ranges', () => {
        expect(isValidCoordinates(90.1, 0)).toBe(false)
        expect(isValidCoordinates(-90.1, 0)).toBe(false)
        expect(isValidCoordinates(0, 180.1)).toBe(false)
        expect(isValidCoordinates(0, -180.1)).toBe(false)
    })

    it('rejects missing, non-numeric and non-finite coordinates', () => {
        expect(isValidCoordinates(null, 0)).toBe(false)
        expect(isValidCoordinates(0, undefined)).toBe(false)
        expect(isValidCoordinates('55.95', -3.18)).toBe(false)
        expect(isValidCoordinates(NaN, 0)).toBe(false)
        expect(isValidCoordinates(0, Infinity)).toBe(false)
    })
})

describe('isValidLocation', () => {
    it('accepts a location with a name and valid coordinates', () => {
        expect(
            isValidLocation({
                name: 'Edinburgh',
                latitude: 55.9533,
                longitude: -3.1883,
            }),
        ).toBe(true)
    })

    it('rejects missing locations and invalid objects', () => {
        expect(isValidLocation(null)).toBe(false)
        expect(isValidLocation(undefined)).toBe(false)
        expect(isValidLocation('Edinburgh')).toBe(false)
        expect(isValidLocation({})).toBe(false)
    })

    it('rejects locations with invalid names or coordinates', () => {
        expect(
            isValidLocation({
                name: '  ',
                latitude: 55.9533,
                longitude: -3.1883,
            }),
        ).toBe(false)

        expect(
            isValidLocation({
                name: 'Edinburgh',
                latitude: 91,
                longitude: -3.1883,
            }),
        ).toBe(false)
    })
})
