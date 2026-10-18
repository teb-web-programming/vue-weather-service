## Useful Commands

### Prerequisites

```
node --version
npm --version
git --version
```

### Create and run Vue project

```
npm create vite@latest . -- --template vue --> creates Vue project
npm install --> installs dependencies
npm run dev --> starts development server
```

### Unit test setup and execution _[1]_

```
npm install -D vitest @vue/test-utils jsdom --> sets up test environment
npm run test:unit --> runs tests in watch mode
npm run test:unit -- --run --> runs tests once and exits
```

### Acceptance test setup verify and execution _[2]_

```
npm install --save-dev @playwright/test @cucumber/cucumber --> installs Playwright and Cucumber for acceptance tests
npx playwright install chromium --> downloads Chromium for browser-based tests

npx playwright --version
npx cucumber-js --version
npx playwright install --list --> lists the browsers installed for Playwright

npm run test:e2e --> runs configured acceptance tests
```

### Build and production preview

```
npm run build --> builds the application for production in dist/
npm run preview --> enables the production build locally for verification
```

### Notes

[1] Ensure `"test:unit": "vitest"` is added under scripts in `package.json`

[2] Ensure `"test:e2e": "cucumber-js --config cucumber.mjs"` is added under scripts in `package.json`
