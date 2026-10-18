export function formatTemperature(value) {
    if (value === null || value === undefined || !Number.isFinite(value)) {
        return '—'
    }

    const roundedValue = Math.round(value)

    return `${roundedValue > 0 ? '+' : ''}${roundedValue}°C`
}

export function formatWindSpeed(value) {
    if (value === null || value === undefined || !Number.isFinite(value)) {
        return '—'
    }

    return `${Math.round(value)} km/h`
}

export function formatPrecipitation(value) {
    if (value === null || value === undefined || !Number.isFinite(value)) {
        return '—'
    }

    return `${Number(value.toFixed(1))} mm`
}

export function formatPercentage(value) {
    if (value === null || value === undefined || !Number.isFinite(value)) {
        return '—'
    }

    return `${Math.round(value)}%`
}

export function formatHumidity(value) {
    return formatPercentage(value)
}

export function formatDate(date, options = {}) {
    if (typeof date !== 'string' || !date) {
        return '—'
    }

    const parsedDate = new Date(`${date}T12:00:00`)

    if (Number.isNaN(parsedDate.getTime())) {
        return '—'
    }

    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        ...options,
    }).format(parsedDate)
}
