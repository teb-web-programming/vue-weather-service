import {computed, ref} from 'vue'
import {searchLocations} from '../services/geocoding-service.js'

const MAX_LOCATIONS = 4
const STORAGE_KEY = 'vue-weather-service:selected-locations'

function loadSelectedLocations() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)

        if (!stored) {
            return []
        }

        const locations = JSON.parse(stored)

        if (!Array.isArray(locations)) {
            return []
        }

        return locations
            .filter(
                (location) =>
                    location &&
                    (
                        typeof location.id === 'string' ||
                        typeof location.id === 'number'
                    ) &&
                    typeof location.name === 'string' &&
                    Number.isFinite(location.latitude) &&
                    Number.isFinite(location.longitude),
            )
            .slice(0, MAX_LOCATIONS)
    } catch {
        return []
    }
}

function saveSelectedLocations(locations) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(locations),
        )
    } catch {
        // Keep the app usable if browser storage is unavailable.
    }
}

export function useLocations() {
    const query = ref('')
    const results = ref([])
    const selectedLocations = ref(loadSelectedLocations())
    const isSearching = ref(false)
    const searchError = ref('')

    let searchRequestId = 0

    const canAddLocation = computed(
        () => selectedLocations.value.length < MAX_LOCATIONS,
    )

    async function search(queryText = query.value) {
        const normalizedQuery = queryText.trim()
        const requestId = ++searchRequestId

        query.value = queryText
        searchError.value = ''
        results.value = []

        if (normalizedQuery.length < 2) {
            isSearching.value = false
            return
        }

        isSearching.value = true

        try {
            const locations = await searchLocations(normalizedQuery)

            if (requestId !== searchRequestId) {
                return
            }

            results.value = locations.filter(
                (location) =>
                    !selectedLocations.value.some(
                        (selected) =>
                            String(selected.id) === String(location.id),
                    ),
            )
        } catch {
            if (requestId === searchRequestId) {
                searchError.value =
                    'Unable to search for locations. Please try again.'
            }
        } finally {
            if (requestId === searchRequestId) {
                isSearching.value = false
            }
        }
    }

    function addLocation(location) {
        if (!canAddLocation.value) {
            return
        }

        const alreadySelected = selectedLocations.value.some(
            (selected) => String(selected.id) === String(location.id),
        )

        if (alreadySelected) {
            return
        }

        selectedLocations.value = [
            ...selectedLocations.value,
            location,
        ]

        saveSelectedLocations(selectedLocations.value)

        results.value = results.value.filter(
            (result) =>
                String(result.id) !== String(location.id),
        )

        query.value = ''
    }

    function removeLocation(locationId) {
        selectedLocations.value = selectedLocations.value.filter(
            (location) =>
                String(location.id) !== String(locationId),
        )

        saveSelectedLocations(selectedLocations.value)
    }

    function clearLocations() {
        selectedLocations.value = []
        saveSelectedLocations([])
        clearSearch()
    }

    function clearSearch(preserveQuery = false) {
        // Invalidate any request that is still in flight.
        searchRequestId += 1

        if (!preserveQuery) {
            query.value = ''
        }

        results.value = []
        searchError.value = ''
        isSearching.value = false
    }

    return {
        query,
        results,
        selectedLocations,
        isSearching,
        searchError,
        canAddLocation,
        search,
        addLocation,
        removeLocation,
        clearSearch,
        clearLocations,
    }
}
