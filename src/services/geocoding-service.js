import {normalizeLocation} from '../models/location.js'

const GEOCODING_API_URL =
    'https://geocoding-api.open-meteo.com/v1/search'

const DEFAULT_RESULT_LIMIT = 8

export async function searchLocations(
    query,
    {count = DEFAULT_RESULT_LIMIT} = {},
) {
    const searchTerm = query.trim()

    if (!searchTerm) {
        return []
    }

    const params = new URLSearchParams({
        name: searchTerm,
        count: String(count),
        language: 'en_gb',
        format: 'json',
    })

    const response = await fetch(`${GEOCODING_API_URL}?${params}`)

    if (!response.ok) {
        throw new Error(
            `Location search failed (${response.status}). Please try again.`,
        )
    }

    const data = await response.json()

    if (!Array.isArray(data.results)) {
        return []
    }

    return data.results.map(normalizeLocation)
}
