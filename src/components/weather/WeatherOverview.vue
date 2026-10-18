<script setup>
import {computed} from 'vue'
import WeatherCard from './WeatherCard.vue'
import ForecastPanel from './ForecastPanel.vue'

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

const lastUpdated = computed(() => {
  if (!Number.isFinite(props.weather.fetchedAt)) {
    return null
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(props.weather.fetchedAt))
})
</script>

<template>
  <section class="weather-overview">
    <WeatherCard
        :location="location"
        :weather="weather"
        :refreshing="refreshing"
        @refresh="emit('refresh')"
    />

    <p
        v-if="lastUpdated"
        class="weather-overview__updated"
    >
      Updated at {{ lastUpdated }}
    </p>

    <ForecastPanel :forecast="weather.forecast"/>
  </section>
</template>
