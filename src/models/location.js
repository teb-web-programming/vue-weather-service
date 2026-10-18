const REQUIRED_LOCATION_FIELDS = [
    'id',
    'name',
    'latitude',
    'longitude',
    'country',
]

export function normalizeLocation(result) {
    if (!result || typeof result !== 'object') {
        throw new Error('Invalid location result.')
    }

    const hasRequiredFields = REQUIRED_LOCATION_FIELDS.every(
        (field) => result[field] !== undefined && result[field] !== null,
    )

    if (!hasRequiredFields) {
        throw new Error('Location result is missing required fields.')
    }

    if (
        !Number.isFinite(result.latitude) ||
        !Number.isFinite(result.longitude)
    ) {
        throw new Error('Location coordinates must be valid numbers.')
    }

    return {
        id: result.id,
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        elevation: result.elevation ?? null,
        countryCode: result.country_code ?? null,
        country: result.country,
        region: result.admin1 ?? null,
        regionDetail: result.admin2 ?? null,
        timezone: result.timezone ?? null,
        population: result.population ?? null,
    }
}

export function formatLocationLabel(location) {
    return [
        location.name,
        location.region,
        location.country,
    ]
        .filter(Boolean)
        .join(', ')
}
