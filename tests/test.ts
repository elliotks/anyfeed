import { expect, test } from '@playwright/test'

test('the logo to be visible', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByAltText('logo')).toBeVisible()
})
