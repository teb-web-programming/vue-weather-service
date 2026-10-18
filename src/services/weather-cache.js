const DEFAULT_TTL_MS = 10 * 60 * 1000

const cache = new Map()

export function getCachedWeather(key) {
    const entry = cache.get(key)

    if (!entry) {
        return null
    }

    if (Date.now() >= entry.expiresAt) {
        cache.delete(key)
        return null
    }

    return entry.data
}

export function setCachedWeather(key, data, ttlMs = DEFAULT_TTL_MS) {
    cache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
    })
}

export function clearWeatherCache() {
    cache.clear()
}
