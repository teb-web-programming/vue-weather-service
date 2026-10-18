import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import {searchLocations} from '../../../src/services/geocoding-service.js'

describe('searchLocations', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('returns an empty array for an empty query', async () => {
        expect(await searchLocations('')).toEqual([])
        expect(fetch).not.toHaveBeenCalled()
    })

    it('returns an empty array for a whitespace-only query', async () => {
        expect(await searchLocations('   ')).toEqual([])
        expect(fetch).not.toHaveBeenCalled()
    })

    it('trims the query before sending the request', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({results: []}),
        })

        await searchLocations('  Edinburgh  ')

        const requestUrl = new URL(fetch.mock.calls[0][0])

        expect(requestUrl.searchParams.get('name')).toBe('Edinburgh')
    })

    it('requests results using the expected default parameters', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({results: []}),
        })

        await searchLocations('Edinburgh')

        expect(fetch).toHaveBeenCalledTimes(1)

        const requestUrl = new URL(fetch.mock.calls[0][0])

        expect(requestUrl.origin).toBe('https://geocoding-api.open-meteo.com')
        expect(requestUrl.pathname).toBe('/v1/search')
        expect(requestUrl.searchParams.get('name')).toBe('Edinburgh')
        expect(requestUrl.searchParams.get('count')).toBe('8')
        expect(requestUrl.searchParams.get('language')).toBe('en_gb')
        expect(requestUrl.searchParams.get('format')).toBe('json')
    })

    it('uses a custom result limit', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({results: []}),
        })

        await searchLocations('London', {count: 3})

        const requestUrl = new URL(fetch.mock.calls[0][0])

        expect(requestUrl.searchParams.get('count')).toBe('3')
    })

    it('normalizes and returns the locations from the API response', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({
                results: [
                    {
                        id: 2643743,
                        name: 'London',
                        latitude: 51.5085,
                        longitude: -0.1257,
                        country: 'United Kingdom',
                        admin1: 'England',
                        timezone: 'Europe/London',
                    },
                    {
                        id: 2650225,
                        name: 'Edinburgh',
                        latitude: 55.9521,
                        longitude: -3.1965,
                        country: 'United Kingdom',
                        admin1: 'Scotland',
                        timezone: 'Europe/London',
                    },
                ],
            }),
        })

        const result = await searchLocations('London')

        expect(result).toHaveLength(2)
        expect(result[0]).toMatchObject({
            id: 2643743,
            name: 'London',
            latitude: 51.5085,
            longitude: -0.1257,
        })

        expect(result[1]).toMatchObject({
            id: 2650225,
            name: 'Edinburgh',
            latitude: 55.9521,
            longitude: -3.1965,
        })
    })

    it('returns an empty array when the response has no results array', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({}),
        })

        expect(await searchLocations('Unknown place')).toEqual([])
    })

    it('returns an empty array when results is null', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({results: null}),
        })

        expect(await searchLocations('Unknown place')).toEqual([])
    })

    it('throws an error when the API returns an unsuccessful status', async () => {
        fetch.mockResolvedValue({
            ok: false,
            status: 503,
        })

        await expect(searchLocations('Edinburgh')).rejects.toThrow(
            'Location search failed (503). Please try again.',
        )
    })

    it('propagates JSON parsing errors', async () => {
        const parsingError = new Error('Invalid JSON')

        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockRejectedValue(parsingError),
        })

        await expect(searchLocations('Edinburgh')).rejects.toThrow(
            'Invalid JSON',
        )
    })
})
