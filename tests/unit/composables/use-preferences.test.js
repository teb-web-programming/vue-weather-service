import {describe, expect, it} from 'vitest'
import {usePreferences} from '../../../src/composables/use-preferences.js'

describe('usePreferences', () => {
    const defaultPreferences = {
        preferWarmer: false,
        preferLowerRainProbability: false,
        preferLowerWindSpeed: false,
    }

    it('initializes with all preferences disabled', () => {
        const {preferences} = usePreferences()

        expect(preferences.value).toEqual(defaultPreferences)
    })

    it.each([
        'preferWarmer',
        'preferLowerRainProbability',
        'preferLowerWindSpeed',
    ])('enables the %s preference', (name) => {
        const {preferences, updatePreference} = usePreferences()

        updatePreference(name, true)

        expect(preferences.value[name]).toBe(true)
    })

    it.each([
        'preferWarmer',
        'preferLowerRainProbability',
        'preferLowerWindSpeed',
    ])('disables the %s preference', (name) => {
        const {preferences, updatePreference} = usePreferences()

        updatePreference(name, true)
        updatePreference(name, false)

        expect(preferences.value[name]).toBe(false)
    })

    it('preserves other preferences when updating one preference', () => {
        const {preferences, updatePreference} = usePreferences()

        updatePreference('preferWarmer', true)

        expect(preferences.value).toEqual({
            preferWarmer: true,
            preferLowerRainProbability: false,
            preferLowerWindSpeed: false,
        })
    })

    it('allows multiple preferences to be enabled together', () => {
        const {preferences, updatePreference} = usePreferences()

        updatePreference('preferWarmer', true)
        updatePreference('preferLowerRainProbability', true)
        updatePreference('preferLowerWindSpeed', true)

        expect(preferences.value).toEqual({
            preferWarmer: true,
            preferLowerRainProbability: true,
            preferLowerWindSpeed: true,
        })
    })

    it('ignores an unknown preference name', () => {
        const {preferences, updatePreference} = usePreferences()
        const originalPreferences = {...preferences.value}

        updatePreference('preferCheaper', true)

        expect(preferences.value).toEqual(originalPreferences)
    })

    it.each([
        'true',
        'false',
        1,
        0,
        null,
        undefined,
        {},
        [],
    ])('ignores a non-boolean preference value: %s', (value) => {
        const {preferences, updatePreference} = usePreferences()
        const originalPreferences = {...preferences.value}

        updatePreference('preferWarmer', value)

        expect(preferences.value).toEqual(originalPreferences)
    })

    it('does not change preferences when an unknown name is supplied', () => {
        const {preferences, updatePreference} = usePreferences()

        updatePreference('unknownPreference', true)

        expect(preferences.value).toEqual(defaultPreferences)
    })

    it('resets all preferences to their defaults', () => {
        const {preferences, updatePreference, resetPreferences} =
            usePreferences()

        updatePreference('preferWarmer', true)
        updatePreference('preferLowerRainProbability', true)
        updatePreference('preferLowerWindSpeed', true)

        resetPreferences()

        expect(preferences.value).toEqual(defaultPreferences)
    })

    it('can update preferences after resetting them', () => {
        const {preferences, updatePreference, resetPreferences} =
            usePreferences()

        updatePreference('preferWarmer', true)
        resetPreferences()
        updatePreference('preferLowerWindSpeed', true)

        expect(preferences.value).toEqual({
            preferWarmer: false,
            preferLowerRainProbability: false,
            preferLowerWindSpeed: true,
        })
    })

    it('returns independent preference state for separate instances', () => {
        const first = usePreferences()
        const second = usePreferences()

        first.updatePreference('preferWarmer', true)

        expect(first.preferences.value.preferWarmer).toBe(true)
        expect(second.preferences.value.preferWarmer).toBe(false)
    })
})
