import {describe, expect, it} from 'vitest'

import {evaluateLocations} from '../../../src/evaluation/evaluate-locations.js'

const locations = [
    {id: 'edinburgh', name: 'Edinburgh'},
    {id: 'london', name: 'London'},
    {id: 'liverpool', name: 'Liverpool'},
]

const allPreferences = {
    preferWarmer: true,
    preferLowerRainProbability: true,
    preferLowerWindSpeed: true,
}

function createWeather(temperatureMax, precipitationProbability, windSpeedMax) {
    return {
        forecast: [
            {
                temperatureMax,
                precipitationProbability,
                windSpeedMax,
            },
        ],
    }
}

describe('evaluateLocations', () => {
    it('asks the user to select a preference when none are enabled', () => {
        const result = evaluateLocations(
            locations,
            {},
            {
                preferWarmer: false,
                preferLowerRainProbability: false,
                preferLowerWindSpeed: false,
            },
        )

        expect(result.winnerId).toBeNull()
        expect(result.results).toEqual([])
        expect(result.message).toBe(
            'Choose at least one preference to compare locations.',
        )
    })

    it('selects the warmest location when only warmer weather is preferred', () => {
        const weather = {
            edinburgh: createWeather(9, 20, 10),
            london: createWeather(14, 40, 20),
            liverpool: createWeather(12, 10, 15),
        }

        const result = evaluateLocations(locations, weather, {
            preferWarmer: true,
            preferLowerRainProbability: false,
            preferLowerWindSpeed: false,
        })

        expect(result.winnerId).toBe('london')
        expect(result.results[0].score).toBe(1)
        expect(result.message).toBe(
            'London best matches your selected preferences.',
        )
    })

    it('awards points to every location tied for the lowest rain probability', () => {
        const weather = {
            edinburgh: createWeather(9, 0, 10),
            london: createWeather(14, 0, 20),
            liverpool: createWeather(12, 5, 15),
        }

        const result = evaluateLocations(locations, weather, {
            preferWarmer: false,
            preferLowerRainProbability: true,
            preferLowerWindSpeed: false,
        })

        expect(result.winnerId).toBeNull()

        expect(
            result.results
                .filter((item) => item.score === 1)
                .map((item) => item.locationId)
                .sort(),
        ).toEqual(['edinburgh', 'london'])

        expect(
            result.results.find((item) => item.locationId === 'liverpool')
                .score,
        ).toBe(0)
    })

    it('identifies the location with the lowest wind speed', () => {
        const weather = {
            edinburgh: createWeather(9, 20, 10),
            london: createWeather(14, 40, 20),
            liverpool: createWeather(12, 10, 15),
        }

        const result = evaluateLocations(locations, weather, {
            preferWarmer: false,
            preferLowerRainProbability: false,
            preferLowerWindSpeed: true,
        })

        expect(result.winnerId).toBe('edinburgh')
    })

    it('returns no single winner when the highest scores are tied', () => {
        const weather = {
            edinburgh: createWeather(14, 0, 10),
            london: createWeather(14, 0, 10),
            liverpool: createWeather(12, 5, 15),
        }

        const result = evaluateLocations(locations, weather, allPreferences)

        expect(result.winnerId).toBeNull()

        expect(
            result.results
                .filter((item) => item.score === 3)
                .map((item) => item.locationId)
                .sort(),
        ).toEqual(['edinburgh', 'london'])
    })

    it('ignores missing metric values when scoring a preference', () => {
        const weather = {
            edinburgh: createWeather(null, 0, 10),
            london: createWeather(14, 0, 10),
            liverpool: createWeather(12, 5, 15),
        }

        const result = evaluateLocations(locations, weather, {
            preferWarmer: true,
            preferLowerRainProbability: false,
            preferLowerWindSpeed: false,
        })

        expect(result.winnerId).toBe('london')

        expect(
            result.results.find((item) => item.locationId === 'edinburgh')
                .evaluatedCriteria,
        ).toBe(0)
    })

    it('returns no winner when all values for active preferences are missing', () => {
        const weather = {
            edinburgh: createWeather(null, null, null),
            london: createWeather(undefined, undefined, undefined),
            liverpool: createWeather(null, null, null),
        }

        const result = evaluateLocations(locations, weather, allPreferences)

        expect(result.winnerId).toBeNull()
        expect(result.results.every((item) => item.score === 0)).toBe(true)
        expect(result.message).toBe(
            'No clear best match for these preferences.',
        )
    })

    it('returns an empty result when there are no locations and preferences are active', () => {
        const result = evaluateLocations([], {}, allPreferences)

        expect(result.winnerId).toBeNull()
        expect(result.results).toEqual([])
        expect(result.message).toBe(
            'No clear best match for these preferences.',
        )
    })
})
