<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    default: '—',
  },
})
</script>

<template>
  <div class="weather-metric">
        <span class="weather-metric__label">
            {{ label }}
        </span>

    <span class="weather-metric__value">
            {{ value }}
        </span>
  </div>
</template>
