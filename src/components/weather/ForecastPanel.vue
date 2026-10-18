<script setup>
import {
  formatDate,
  formatPercentage,
  formatTemperature,
  formatWindSpeed,
} from '../../utils/formatters.js'
import {getWeatherDescription} from '../../utils/weather-codes.js'

defineProps({
  forecast: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="forecast-panel" aria-label="Five-day forecast">
    <h3 class="forecast-panel__title">5-day forecast</h3>

    <div class="forecast-panel__container">
      <div class="forecast-panel__scroll">
        <table class="forecast-table">
          <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Conditions</th>
            <th scope="col">High / Low</th>
            <th scope="col">Rain</th>
            <th scope="col">Wind</th>
          </tr>
          </thead>

          <tbody>
          <tr
              v-for="day in forecast"
              :key="day.date"
          >
            <th scope="row">
              {{ formatDate(day.date) }}
            </th>

            <td>
              {{ getWeatherDescription(day.weatherCode) }}
            </td>

            <td class="forecast-table__temperatures">
              <span>{{ formatTemperature(day.temperatureMax) }}</span>
              <span>{{ formatTemperature(day.temperatureMin) }}</span>
            </td>

            <td>
              {{ formatPercentage(day.precipitationProbability) }}
            </td>

            <td class="forecast-table__wind">
              {{ formatWindSpeed(day.windSpeedMax) }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <span
          class="forecast-panel__fade"
          aria-hidden="true"
      ></span>
    </div>
  </section>
</template>
