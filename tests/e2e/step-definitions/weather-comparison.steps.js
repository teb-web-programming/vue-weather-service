import {Given, When, Then} from '@cucumber/cucumber'
import {expect} from '@playwright/test'

Given('the weather dashboard is open', async function () {
    await expect(
        this.page.getByRole('heading', {name: 'Weather Comparison'}),
    ).toBeVisible()
})

When('I search for {string}', async function (locationName) {
    await this.page
        .getByPlaceholder('Search a city or town')
        .fill(locationName)

    await expect(
        this.page.getByRole('option', {
            name: new RegExp(locationName),
        }),
    ).toBeVisible()
})

When('I select {string} from the results', async function (locationName) {
    await this.page.getByRole('option', {
        name: new RegExp(locationName),
    }).click()
})

Then('the weather for {string} should be displayed', async function (locationName) {
    await expect(
        this.page.locator('.weather-card').filter({
            has: this.page.getByRole('heading', {
                name: locationName,
                exact: true,
            }),
        }),
    ).toBeVisible()
})

Then('the comparison panel should be visible', async function () {
    await expect(
        this.page.locator('.comparison-panel'),
    ).toBeVisible()
})

When('I remove {string} from the selected locations', async function (locationName) {
    const removeButton = this.page.getByRole('button', {
        name: `Remove ${locationName}`,
        exact: true,
    })

    await removeButton.locator('span[aria-hidden="true"]').click()

    await expect(removeButton).toHaveCount(0, {timeout: 3000})
})

Then('{string} should remain selected', async function (locationName) {
    await expect(
        this.page.locator('.weather-card').filter({
            has: this.page.getByRole('heading', {
                name: locationName,
                exact: true,
            }),
        }),
    ).toBeVisible()

    await expect(
        this.page.getByRole('button', {
            name: `Remove ${locationName}`,
            exact: true,
        }),
    ).toBeVisible()
})

Then('{string} should no longer be displayed', async function (locationName) {
    await expect(
        this.page.getByRole('button', {
            name: `Remove ${locationName}`,
            exact: true,
        }),
    ).toHaveCount(0, {timeout: 10_000})

    await expect(
        this.page.locator('.weather-card').filter({
            has: this.page.getByRole('heading', {
                name: locationName,
                exact: true,
            }),
        }),
    ).toHaveCount(0, {timeout: 10_000})
})
