import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import {
    clearWeatherCache,
    getCachedWeather,
    setCachedWeather,
} from '../../../src/services/weather-cache.js'

describe('weather cache', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-10-17T12:00:00Z'))
        clearWeatherCache()
    })

    afterEach(() => {
        clearWeatherCache()
        vi.useRealTimers()
    })

    it('returns null when a key does not exist', () => {
        expect(getCachedWeather('missing-location')).toBeNull()
    })

    it('stores and retrieves weather data', () => {
        const weather = {
            current: {temperature: 12},
            forecast: [],
        }

        setCachedWeather('edinburgh', weather)

        expect(getCachedWeather('edinburgh')).toBe(weather)
    })

    it('keeps different cache keys separate', () => {
        const edinburghWeather = {current: {temperature: 12}}
        const londonWeather = {current: {temperature: 16}}

        setCachedWeather('edinburgh', edinburghWeather)
        setCachedWeather('london', londonWeather)

        expect(getCachedWeather('edinburgh')).toBe(edinburghWeather)
        expect(getCachedWeather('london')).toBe(londonWeather)
    })

    it('replaces an existing entry when the same key is set again', () => {
        const originalWeather = {current: {temperature: 12}}
        const updatedWeather = {current: {temperature: 15}}

        setCachedWeather('edinburgh', originalWeather)
        setCachedWeather('edinburgh', updatedWeather)

        expect(getCachedWeather('edinburgh')).toBe(updatedWeather)
    })

    it('keeps an entry available before the default ten-minute TTL expires', () => {
        const weather = {current: {temperature: 12}}

        setCachedWeather('edinburgh', weather)

        vi.advanceTimersByTime(10 * 60 * 1000 - 1)

        expect(getCachedWeather('edinburgh')).toBe(weather)
    })

    it('expires an entry at the default ten-minute TTL', () => {
        const weather = {current: {temperature: 12}}

        setCachedWeather('edinburgh', weather)

        vi.advanceTimersByTime(10 * 60 * 1000)

        expect(getCachedWeather('edinburgh')).toBeNull()
    })

    it('removes expired entries from the cache', () => {
        const weather = {current: {temperature: 12}}

        setCachedWeather('edinburgh', weather, 1000)

        vi.advanceTimersByTime(1000)

        expect(getCachedWeather('edinburgh')).toBeNull()

        vi.advanceTimersByTime(1)

        expect(getCachedWeather('edinburgh')).toBeNull()
    })

    it('supports a custom TTL', () => {
        const weather = {current: {temperature: 12}}

        setCachedWeather('edinburgh', weather, 5000)

        vi.advanceTimersByTime(4999)

        expect(getCachedWeather('edinburgh')).toBe(weather)

        vi.advanceTimersByTime(1)

        expect(getCachedWeather('edinburgh')).toBeNull()
    })

    it('clears all cached entries', () => {
        setCachedWeather('edinburgh', {current: {temperature: 12}})
        setCachedWeather('london', {current: {temperature: 16}})

        clearWeatherCache()

        expect(getCachedWeather('edinburgh')).toBeNull()
        expect(getCachedWeather('london')).toBeNull()
    })
})
