import {beforeEach, describe, expect, it, vi} from 'vitest'
import {useLocations} from '../../../src/composables/use-locations.js'
import {searchLocations} from '../../../src/services/geocoding-service.js'

vi.mock('../../../src/services/geocoding-service.js', () => ({
    searchLocations: vi.fn(),
}))

describe('useLocations', () => {
    const london = {
        id: 1,
        name: 'London',
        latitude: 51.5072,
        longitude: -0.1276,
        country: 'United Kingdom',
    }

    const edinburgh = {
        id: 2,
        name: 'Edinburgh',
        latitude: 55.9533,
        longitude: -3.1883,
        country: 'United Kingdom',
    }

    const manchester = {
        id: 3,
        name: 'Manchester',
        latitude: 53.4808,
        longitude: -2.2426,
        country: 'United Kingdom',
    }

    const liverpool = {
        id: 4,
        name: 'Liverpool',
        latitude: 53.4084,
        longitude: -2.9916,
        country: 'United Kingdom',
    }

    const glasgow = {
        id: 5,
        name: 'Glasgow',
        latitude: 55.8642,
        longitude: -4.2518,
        country: 'United Kingdom',
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('initializes with empty state', () => {
        const locations = useLocations()

        expect(locations.query.value).toBe('')
        expect(locations.results.value).toEqual([])
        expect(locations.selectedLocations.value).toEqual([])
        expect(locations.isSearching.value).toBe(false)
        expect(locations.searchError.value).toBe('')
        expect(locations.canAddLocation.value).toBe(true)
    })

    it('does not call the service for an empty query', async () => {
        const locations = useLocations()

        await locations.search('')

        expect(searchLocations).not.toHaveBeenCalled()
        expect(locations.isSearching.value).toBe(false)
        expect(locations.results.value).toEqual([])
    })

    it('does not call the service for a whitespace-only query', async () => {
        const locations = useLocations()

        await locations.search('   ')

        expect(searchLocations).not.toHaveBeenCalled()
        expect(locations.results.value).toEqual([])
    })

    it('updates the query and returns search results', async () => {
        searchLocations.mockResolvedValue([london, edinburgh])
        const locations = useLocations()

        await locations.search('London')

        expect(searchLocations).toHaveBeenCalledWith('London')
        expect(locations.query.value).toBe('London')
        expect(locations.results.value).toEqual([london, edinburgh])
        expect(locations.searchError.value).toBe('')
        expect(locations.isSearching.value).toBe(false)
    })

    it('uses the current query when search is called without an argument', async () => {
        searchLocations.mockResolvedValue([london])
        const locations = useLocations()

        locations.query.value = 'London'
        await locations.search()

        expect(searchLocations).toHaveBeenCalledWith('London')
        expect(locations.results.value).toEqual([london])
    })

    it('clears previous results and errors before searching', async () => {
        searchLocations.mockResolvedValueOnce([london])
        const locations = useLocations()

        await locations.search('London')
        locations.searchError.value = 'Previous error'

        searchLocations.mockResolvedValueOnce([edinburgh])
        await locations.search('Edinburgh')

        expect(locations.results.value).toEqual([edinburgh])
        expect(locations.searchError.value).toBe('')
    })

    it('filters locations that are already selected from search results', async () => {
        searchLocations.mockResolvedValue([london, edinburgh])
        const locations = useLocations()

        locations.addLocation(london)
        await locations.search('United Kingdom')

        expect(locations.results.value).toEqual([edinburgh])
    })

    it('sets the searching state while a request is pending', async () => {
        let resolveSearch

        searchLocations.mockReturnValue(
            new Promise((resolve) => {
                resolveSearch = resolve
            }),
        )

        const locations = useLocations()
        const pendingSearch = locations.search('London')

        expect(locations.isSearching.value).toBe(true)

        resolveSearch([london])
        await pendingSearch

        expect(locations.isSearching.value).toBe(false)
        expect(locations.results.value).toEqual([london])
    })

    it('sets a search error when the service rejects', async () => {
        searchLocations.mockRejectedValue(new Error('Network failure'))
        const locations = useLocations()

        await locations.search('London')

        expect(locations.searchError.value).toBe(
            'Unable to search for locations. Please try again.',
        )
        expect(locations.results.value).toEqual([])
        expect(locations.isSearching.value).toBe(false)
    })

    it('adds a location and removes it from search results', () => {
        const locations = useLocations()
        locations.results.value = [london, edinburgh]
        locations.query.value = 'London'

        locations.addLocation(london)

        expect(locations.selectedLocations.value).toEqual([london])
        expect(locations.results.value).toEqual([edinburgh])
        expect(locations.query.value).toBe('')
        expect(locations.canAddLocation.value).toBe(true)
    })

    it('does not add the same location twice', () => {
        const locations = useLocations()

        locations.addLocation(london)
        locations.addLocation(london)

        expect(locations.selectedLocations.value).toEqual([london])
    })

    it('does not add a location that is already selected by ID', () => {
        const locations = useLocations()

        locations.addLocation(london)
        locations.addLocation({...london, name: 'Different label'})

        expect(locations.selectedLocations.value).toHaveLength(1)
    })

    it('allows at most four selected locations', () => {
        const locations = useLocations()

        locations.addLocation(london)
        locations.addLocation(edinburgh)
        locations.addLocation(manchester)
        locations.addLocation(liverpool)

        expect(locations.selectedLocations.value).toHaveLength(4)
        expect(locations.canAddLocation.value).toBe(false)

        locations.addLocation(glasgow)

        expect(locations.selectedLocations.value).toHaveLength(4)
        expect(
            locations.selectedLocations.value.some(
                (location) => location.id === glasgow.id,
            ),
        ).toBe(false)
    })

    it('allows another location after one is removed', () => {
        const locations = useLocations()

        locations.addLocation(london)
        locations.addLocation(edinburgh)
        locations.addLocation(manchester)
        locations.addLocation(liverpool)

        locations.removeLocation(edinburgh.id)
        locations.addLocation(glasgow)

        expect(locations.selectedLocations.value).toEqual([
            london,
            manchester,
            liverpool,
            glasgow,
        ])
        expect(locations.canAddLocation.value).toBe(false)
    })

    it('removes a selected location by ID', () => {
        const locations = useLocations()

        locations.addLocation(london)
        locations.addLocation(edinburgh)
        locations.removeLocation(london.id)

        expect(locations.selectedLocations.value).toEqual([edinburgh])
        expect(locations.canAddLocation.value).toBe(true)
    })

    it('does nothing when removing an unknown location ID', () => {
        const locations = useLocations()
        locations.addLocation(london)

        locations.removeLocation(999)

        expect(locations.selectedLocations.value).toEqual([london])
    })

    it('clears the query, results and search error', () => {
        const locations = useLocations()

        locations.query.value = 'London'
        locations.results.value = [london]
        locations.searchError.value = 'Search failed'

        locations.clearSearch()

        expect(locations.query.value).toBe('')
        expect(locations.results.value).toEqual([])
        expect(locations.searchError.value).toBe('')
    })

    it('preserves selected locations when clearing the search', () => {
        const locations = useLocations()

        locations.addLocation(london)
        locations.query.value = 'Edinburgh'
        locations.results.value = [edinburgh]
        locations.searchError.value = 'Search failed'

        locations.clearSearch()

        expect(locations.selectedLocations.value).toEqual([london])
        expect(locations.query.value).toBe('')
        expect(locations.results.value).toEqual([])
    })
})
