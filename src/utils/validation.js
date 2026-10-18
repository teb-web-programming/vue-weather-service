export function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0
}

export function isValidCoordinates(latitude, longitude) {
    return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    )
}

export function isValidLocation(location) {
    return (
        Boolean(location) &&
        typeof location === 'object' &&
        isNonEmptyString(location.name) &&
        isValidCoordinates(location.latitude, location.longitude)
    )
}
