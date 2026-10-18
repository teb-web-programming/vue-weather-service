import {describe, expect, it} from 'vitest'
import {EVALUATION_RULES} from '../../../src/evaluation/evaluation-rules.js'

describe('EVALUATION_RULES', () => {
    it('defines temperature, rain and wind rules', () => {
        expect(Object.keys(EVALUATION_RULES)).toEqual([
            'temperature',
            'rain',
            'wind',
        ])
    })

    it('maps the temperature rule to the warmer preference', () => {
        expect(EVALUATION_RULES.temperature).toEqual({
            preferenceKey: 'preferWarmer',
            metric: 'temperatureMax',
            direction: 'higher',
            label: 'Warmer weather',
        })
    })

    it('maps the rain rule to the lower rain probability preference', () => {
        expect(EVALUATION_RULES.rain).toEqual({
            preferenceKey: 'preferLowerRainProbability',
            metric: 'precipitationProbability',
            direction: 'lower',
            label: 'Lower rain probability',
        })
    })

    it('maps the wind rule to the lower wind speed preference', () => {
        expect(EVALUATION_RULES.wind).toEqual({
            preferenceKey: 'preferLowerWindSpeed',
            metric: 'windSpeedMax',
            direction: 'lower',
            label: 'Lower wind speed',
        })
    })

    it('uses only supported comparison directions', () => {
        for (const rule of Object.values(EVALUATION_RULES)) {
            expect(['higher', 'lower']).toContain(rule.direction)
        }
    })
})
