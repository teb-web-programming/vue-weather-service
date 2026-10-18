import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {nextTick} from 'vue'

import {useLocations} from '../../src/composables/use-locations.js'

function createGeocodingResponse() {
    return {
        results: [
            {
                id: 2643743,
                name: 'London',
                latitude: 51.5072,
                longitude: -0.1276,
                country: 'United Kingdom',
                country_code: 'GB',
                admin1: 'England',
                timezone: 'Europe/London',
            },
            {
                id: 2650225,
                name: 'Edinburgh',
                latitude: 55.9533,
                longitude: -3.1883,
                country: 'United Kingdom',
                country_code: 'GB',
                admin1: 'Scotland',
                timezone: 'Europe/London',
            },
        ],
    }
}

describe('geocoding integration', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('searches, normalises results and updates location state', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(createGeocodingResponse()),
        })

        const locations = useLocations()

        await locations.search('London')

        expect(fetch).toHaveBeenCalledTimes(1)
        expect(fetch.mock.calls[0][0]).toContain(
            'https://geocoding-api.open-meteo.com/v1/search',
        )

        expect(locations.results.value).toHaveLength(2)
        expect(locations.results.value[0]).toMatchObject({
            id: 2643743,
            name: 'London',
            latitude: 51.5072,
            longitude: -0.1276,
            country: 'United Kingdom',
            region: 'England',
        })

        locations.addLocation(locations.results.value[0])
        await nextTick()

        expect(locations.selectedLocations.value).toHaveLength(1)
        expect(locations.selectedLocations.value[0].name).toBe('London')
        expect(locations.results.value.map(({name}) => name)).toEqual([
            'Edinburgh',
        ])
        expect(locations.query.value).toBe('')
    })

    it('excludes locations that are already selected from search results', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue(createGeocodingResponse()),
        })

        const locations = useLocations()

        await locations.search('London')
        locations.addLocation(locations.results.value[0])

        await locations.search('London')

        expect(locations.selectedLocations.value).toHaveLength(1)
        expect(locations.results.value.map(({name}) => name)).toEqual([
            'Edinburgh',
        ])
    })

    it('exposes a search error when the API request fails', async () => {
        fetch.mockResolvedValue({
            ok: false,
            status: 503,
        })

        const locations = useLocations()

        await locations.search('London')

        expect(locations.searchError.value).toBe(
            'Unable to search for locations. Please try again.',
        )
        expect(locations.results.value).toEqual([])
        expect(locations.isSearching.value).toBe(false)
    })
})
