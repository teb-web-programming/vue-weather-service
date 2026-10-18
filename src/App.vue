<script setup>
import {computed, ref} from 'vue'

import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

import LocationSearch from './components/locations/LocationSearch.vue'
import SelectedLocationChip from './components/locations/SelectedLocationChip.vue'

import WeatherOverview from './components/weather/WeatherOverview.vue'
import ComparisonPanel from './components/comparison/ComparisonPanel.vue'

import LoadingState from './components/feedback/LoadingState.vue'
import ErrorMessage from './components/feedback/ErrorMessage.vue'
import EmptyState from './components/feedback/EmptyState.vue'

import {useLocations} from './composables/use-locations.js'
import {useWeather} from './composables/use-weather.js'
import {usePreferences} from './composables/use-preferences.js'

import {evaluateLocations} from './evaluation/evaluate-locations.js'

const THEME_STORAGE_KEY = 'vue-weather-service:theme'

function loadTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark'
        ? 'dark'
        : 'light'
  } catch {
    return 'light'
  }
}

const theme = ref(loadTheme())

document.documentElement.setAttribute('data-theme', theme.value)

const {
  query,
  results,
  selectedLocations,
  isSearching,
  searchError,
  canAddLocation,
  search,
  addLocation,
  removeLocation,
  clearSearch,
  clearLocations,
} = useLocations()

const {
  weatherByLocation,
  weatherErrors,
  isLoading,
  isRefreshingByLocation,
  refreshLocation,
} = useWeather(selectedLocations)

const {
  preferences,
  updatePreference,
} = usePreferences()

const evaluation = computed(() =>
    evaluateLocations(
        selectedLocations.value,
        weatherByLocation.value,
        preferences.value,
    ),
)

const comparisonWidth = computed(() => {
  const count = selectedLocations.value.length

  if (count === 2) return 'calc(50% - 0.5rem)'
  if (count === 3) return 'calc(75% - 0.25rem)'
  return '100%'
})

function handleLocationSelect(location) {
  if (canAddLocation.value) {
    addLocation(location)
  }
}

function handleQueryUpdate(value) {
  query.value = value
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'

  document.documentElement.setAttribute('data-theme', theme.value)

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme.value)
  } catch {
    // Theme switching still works when browser storage is unavailable.
  }
}
</script>

<template>
  <div class="app">
    <AppHeader
        :theme="theme"
        @toggle-theme="toggleTheme"
    />

    <main class="app-main">
      <section class="dashboard-intro">
        <h1>Weather Comparison</h1>
        <p>Compare conditions across your selected locations</p>
      </section>

      <section
          class="location-section"
          aria-label="Location search and selected locations"
      >
        <LocationSearch
            :selected-locations="selectedLocations"
            :can-add-location="canAddLocation"
            :query="query"
            :results="results"
            :is-searching="isSearching"
            :search-error="searchError"
            @update:query="handleQueryUpdate"
            @search="search"
            @clear-search="clearSearch"
            @select="handleLocationSelect"
        />

        <p
            v-if="!canAddLocation"
            class="location-section__limit"
            role="status"
        >
          You can compare up to four locations. Remove one to add another.
        </p>

        <div
            v-if="selectedLocations.length"
            class="selected-locations"
            aria-label="Selected locations"
        >
          <SelectedLocationChip
              v-for="location in selectedLocations"
              :key="location.id"
              :location="location"
              @remove="removeLocation"
          />

          <button
              class="selected-locations__clear"
              type="button"
              @click="clearLocations"
          >
            Clear all
          </button>
        </div>
      </section>

      <EmptyState v-if="selectedLocations.length === 0"/>

      <section
          v-else
          class="weather-section"
      >
        <LoadingState
            v-if="isLoading && !Object.keys(weatherByLocation).length"
        />

        <div
            v-else
            class="weather-grid"
        >
          <article
              v-for="location in selectedLocations"
              :key="location.id"
              class="weather-grid__item"
          >
            <ErrorMessage
                v-if="weatherErrors[location.id]"
                :message="weatherErrors[location.id]"
                retryable
                @retry="refreshLocation(location)"
            />

            <WeatherOverview
                v-if="weatherByLocation[location.id]"
                :location="location"
                :weather="weatherByLocation[location.id]"
                :refreshing="Boolean(isRefreshingByLocation[location.id])"
                @refresh="refreshLocation(location)"
            />

            <LoadingState
                v-else-if="isLoading && !weatherErrors[location.id]"
            />

            <ErrorMessage
                v-else-if="!weatherErrors[location.id]"
                message="Weather data is unavailable for this location."
                retryable
                @retry="refreshLocation(location)"
            />
          </article>
        </div>
      </section>

      <ComparisonPanel
          v-if="selectedLocations.length > 1"
          :style="{ width: comparisonWidth }"
          :locations="selectedLocations"
          :weather-by-location="weatherByLocation"
          :preferences="preferences"
          :evaluation="evaluation"
          @update-preference="updatePreference"
      />
    </main>

    <AppFooter/>
  </div>
</template>
