<script setup>
import {
  formatPercentage,
  formatTemperature,
  formatWindSpeed,
} from '../../utils/formatters.js'

defineProps({
  locations: {
    type: Array,
    default: () => [],
  },
  weatherByLocation: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <section class="comparison-table">
    <div class="comparison-table__scroll">
      <table>
        <thead>
        <tr>
          <th scope="col">Location</th>
          <th scope="col">High</th>
          <th scope="col">Rain probability</th>
          <th scope="col">Max wind</th>
        </tr>
        </thead>

        <tbody>
        <tr
            v-for="location in locations"
            :key="location.id"
        >
          <th scope="row">{{ location.name }}</th>

          <td>
            {{ formatTemperature(weatherByLocation[location.id]?.forecast?.[0]?.temperatureMax ?? null) }}
          </td>

          <td>
            {{ formatPercentage(weatherByLocation[location.id]?.forecast?.[0]?.precipitationProbability ?? null) }}
          </td>

          <td>
            {{ formatWindSpeed(weatherByLocation[location.id]?.forecast?.[0]?.windSpeedMax ?? null) }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
