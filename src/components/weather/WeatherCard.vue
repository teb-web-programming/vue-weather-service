<script setup>
import {computed} from 'vue'
import {
  formatHumidity,
  formatPrecipitation,
  formatTemperature,
  formatWindSpeed,
} from '../../utils/formatters.js'
import {getWeatherDescription} from '../../utils/weather-codes.js'
import WeatherMetric from './WeatherMetric.vue'
import refreshIcon from '../../assets/images/refresh.svg'

const props = defineProps({
  location: {
    type: Object,
    required: true,
  },
  weather: {
    type: Object,
    required: true,
  },
  refreshing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh'])

const temperatureClass = computed(() => {
  const temperature = props.weather.current.temperature

  if (typeof temperature !== 'number' || !Number.isFinite(temperature)) {
    return ''
  }

  if (temperature < 10) {
    return 'weather-card--cold-cool'
  }

  if (temperature < 20) {
    return 'weather-card--cool-mild'
  }

  if (temperature <= 32) {
    return 'weather-card--mild-warm'
  }

  return 'weather-card--warm-hot'
})

const refreshIconStyle = {
  maskImage: `url("${refreshIcon}")`,
  WebkitMaskImage: `url("${refreshIcon}")`,
}
</script>

<template>
  <article class="weather-card" :class="temperatureClass">
    <header class="weather-card__header">
      <div class="weather-card__heading">
        <h2 class="weather-card__location">
          {{ location.name }}
        </h2>

        <p class="weather-card__region">
          {{ [location.region, location.country].filter(Boolean).join(', ') }}
        </p>
      </div>

      <button
          class="weather-card__refresh"
          type="button"
          :aria-label="`Refresh weather for ${location.name}`"
          :title="`Refresh weather for ${location.name}`"
          :disabled="refreshing"
          @click="emit('refresh')"
      >
        <span
            class="weather-card__refresh-icon"
            :class="{ 'weather-card__refresh-icon--spinning': refreshing }"
            :style="refreshIconStyle"
            aria-hidden="true"
        ></span>
      </button>
    </header>

    <div class="weather-card__current">
      <p class="weather-card__condition">
        {{ getWeatherDescription(weather.current.weatherCode) }}
      </p>

      <p class="weather-card__temperature">
        {{ formatTemperature(weather.current.temperature) }}
      </p>

      <p class="weather-card__feels-like">
        Feels like {{ formatTemperature(weather.current.feelsLike) }}
      </p>
    </div>

    <div class="weather-card__metrics">
      <WeatherMetric
          label="Humidity"
          :value="formatHumidity(weather.current.humidity)"
      />

      <WeatherMetric
          label="Precipitation"
          :value="formatPrecipitation(weather.current.precipitation)"
      />

      <WeatherMetric
          label="Wind"
          :value="formatWindSpeed(weather.current.windSpeed)"
      />
    </div>
  </article>
</template>

<style scoped>
.weather-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.weather-card__heading {
  min-width: 0;
}

.weather-card__refresh {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  margin: -0.35rem -0.35rem 0 0;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  transition: background-color 150ms ease,
  border-color 150ms ease,
  color 150ms ease;
}

.weather-card__refresh:hover:not(:disabled) {
  border-color: var(--color-border);
  background: var(--color-surface);
  color: var(--color-accent);
}

.weather-card__refresh:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

.weather-card__refresh:disabled {
  cursor: wait;
  opacity: 0.7;
}

.weather-card__refresh-icon {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  background-color: currentColor;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
}

.weather-card__refresh-icon--spinning {
  animation: weather-refresh-spin 800ms linear infinite;
}

@keyframes weather-refresh-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather-card__refresh,
  .weather-card__refresh-icon--spinning {
    transition: none;
    animation: none;
  }
}
</style>
