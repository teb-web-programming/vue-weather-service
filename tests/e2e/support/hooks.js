import {
    After,
    AfterAll,
    Before,
    BeforeAll,
} from '@cucumber/cucumber'
import {chromium} from '@playwright/test'
import {spawn} from 'node:child_process'
import {setTimeout} from 'node:timers/promises'

const baseURL = 'http://127.0.0.1:4173'

let browser
let serverProcess

const locations = {
    Edinburgh: {
        id: 1001,
        name: 'Edinburgh',
        latitude: 55.9533,
        longitude: -3.1883,
        elevation: 20,
        feature_code: 'PPLC',
        country_code: 'GB',
        country: 'United Kingdom',
        admin1: 'Scotland',
        timezone: 'Europe/London',
    },
    London: {
        id: 1002,
        name: 'London',
        latitude: 51.5072,
        longitude: -0.1276,
        elevation: 11,
        feature_code: 'PPLC',
        country_code: 'GB',
        country: 'United Kingdom',
        admin1: 'England',
        timezone: 'Europe/London',
    },
}

function createWeatherResponse(latitude) {
    const isLondon = Math.abs(latitude - locations.London.latitude) < 0.1
    const temperature = isLondon ? 20 : 12.5

    return {
        latitude,
        longitude: isLondon
            ? locations.London.longitude
            : locations.Edinburgh.longitude,
        timezone: 'Europe/London',
        current: {
            time: '2026-10-17T12:00',
            temperature_2m: temperature,
            apparent_temperature: temperature - 1,
            relative_humidity_2m: 70,
            is_day: 1,
            precipitation: 0,
            weather_code: 3,
            wind_speed_10m: 12,
            wind_direction_10m: 240,
        },
        current_units: {
            temperature_2m: '°C',
            apparent_temperature: '°C',
            relative_humidity_2m: '%',
            precipitation: 'mm',
            wind_speed_10m: 'km/h',
            wind_direction_10m: '°',
        },
        daily: {
            time: [
                '2026-10-17',
                '2026-10-18',
                '2026-10-19',
                '2026-10-20',
                '2026-10-21',
            ],
            weather_code: [3, 61, 2, 0, 1],
            temperature_2m_max: [14, 12, 13, 15, 14],
            temperature_2m_min: [8, 6, 7, 9, 8],
            precipitation_probability_max: [20, 80, 30, 0, 10],
            precipitation_sum: [0, 4.5, 1, 0, 0.2],
            wind_speed_10m_max: [18, 25, 16, 12, 14],
        },
        daily_units: {
            temperature_2m_max: '°C',
            temperature_2m_min: '°C',
            precipitation_probability_max: '%',
            precipitation_sum: 'mm',
            wind_speed_10m_max: 'km/h',
        },
    }
}

async function waitForServer(url) {
    for (let attempt = 0; attempt < 60; attempt += 1) {
        try {
            const response = await fetch(url)

            if (response.ok) {
                return
            }
        } catch {
            // The development server may not be ready yet.
        }

        if (serverProcess?.exitCode !== null && serverProcess?.exitCode !== undefined) {
            throw new Error(
                `Vite exited before becoming ready (exit code ${serverProcess.exitCode}).`,
            )
        }

        await setTimeout(500)
    }

    throw new Error(`Vite did not become ready at ${url}.`)
}

BeforeAll(
    {timeout: 40_000},
    async function () {
        serverProcess = spawn(
            'npm',
            [
                'run',
                'dev',
                '--',
                '--host',
                '127.0.0.1',
                '--port',
                '4173',
                '--strictPort',
            ],
            {stdio: 'ignore'},
        )

        await waitForServer(baseURL)
        browser = await chromium.launch({headless: true})
    },
)

Before(async function () {
    this.context = await browser.newContext()
    this.page = await this.context.newPage()

    await this.page.route('**/v1/search**', async (route) => {
        const url = new URL(route.request().url())
        const query = (url.searchParams.get('name') ?? '').toLowerCase()

        const match = Object.values(locations).find((location) =>
            location.name.toLowerCase().includes(query),
        )

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                results: query && match ? [match] : [],
                generationtime_ms: 0,
            }),
        })
    })

    await this.page.route('**/v1/forecast**', async (route) => {
        const url = new URL(route.request().url())
        const latitude = Number(url.searchParams.get('latitude'))

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(createWeatherResponse(latitude)),
        })
    })

    await this.page.goto(baseURL)
})

After(async function () {
    await this.context?.close()
})

AfterAll(async function () {
    await browser?.close()

    if (serverProcess && serverProcess.exitCode === null) {
        serverProcess.kill()
    }
})
