export const EVALUATION_RULES = {
    temperature: {
        preferenceKey: 'preferWarmer',
        metric: 'temperatureMax',
        direction: 'higher',
        label: 'Warmer weather',
    },
    rain: {
        preferenceKey: 'preferLowerRainProbability',
        metric: 'precipitationProbability',
        direction: 'lower',
        label: 'Lower rain probability',
    },
    wind: {
        preferenceKey: 'preferLowerWindSpeed',
        metric: 'windSpeedMax',
        direction: 'lower',
        label: 'Lower wind speed',
    },
}
