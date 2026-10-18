import {EVALUATION_RULES} from './evaluation-rules.js'

export function evaluateLocations(locations, weatherByLocation, preferences) {
    const activeRules = Object.values(EVALUATION_RULES).filter(
        (rule) => preferences[rule.preferenceKey],
    )

    if (activeRules.length === 0) {
        return {
            winnerId: null,
            results: [],
            message: 'Choose at least one preference to compare locations.',
        }
    }

    const results = locations.map((location) => {
        const weather = weatherByLocation[location.id]
        const forecast = weather?.forecast?.[0]

        const comparisons = activeRules.map((rule) => ({
            rule,
            value: forecast?.[rule.metric] ?? null,
        }))

        return {
            locationId: location.id,
            locationName: location.name,
            score: 0,
            evaluatedCriteria: 0,
            comparisons,
        }
    })

    activeRules.forEach((rule) => {
        const availableResults = results.filter((result) => {
            const comparison = result.comparisons.find(
                (item) => item.rule === rule,
            )

            return (
                comparison &&
                typeof comparison.value === 'number' &&
                Number.isFinite(comparison.value)
            )
        })

        if (availableResults.length === 0) {
            return
        }

        const bestValue = availableResults.reduce((best, result) => {
            const value = result.comparisons.find(
                (item) => item.rule === rule,
            ).value

            return rule.direction === 'higher'
                ? Math.max(best, value)
                : Math.min(best, value)
        }, availableResults[0].comparisons.find(
            (item) => item.rule === rule,
        ).value)

        availableResults.forEach((result) => {
            const comparison = result.comparisons.find(
                (item) => item.rule === rule,
            )

            result.evaluatedCriteria += 1

            if (comparison.value === bestValue) {
                result.score += 1
            }
        })
    })

    const rankedResults = [...results].sort(
        (a, b) =>
            b.score - a.score ||
            b.evaluatedCriteria - a.evaluatedCriteria,
    )

    const highestScore = rankedResults[0]?.score ?? 0
    const topResults = rankedResults.filter(
        (result) => result.score === highestScore,
    )

    const winnerId =
        topResults.length === 1 && highestScore > 0
            ? topResults[0].locationId
            : null

    return {
        winnerId,
        results: rankedResults,
        message:
            winnerId === null
                ? 'No clear best match for these preferences.'
                : `${topResults[0].locationName} best matches your selected preferences.`,
    }
}
