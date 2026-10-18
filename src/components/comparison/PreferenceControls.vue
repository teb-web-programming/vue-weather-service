<script setup>
defineProps({
  preferences: {
    type: Object,
    required: true,
  },
})

defineEmits(['update'])
</script>

<template>
  <section class="preference-controls" aria-labelledby="preference-controls-title">
    <h3 id="preference-controls-title">What weather are you looking for?</h3>

    <label class="preference-controls__option">
      <input
          type="checkbox"
          :checked="preferences.preferWarmer"
          @change="$emit('update', 'preferWarmer', $event.target.checked)"
      >
      <span>Warmer weather</span>
    </label>

    <label class="preference-controls__option">
      <input
          type="checkbox"
          :checked="preferences.preferLowerRainProbability"
          @change="$emit('update', 'preferLowerRainProbability', $event.target.checked)"
      >
      <span>Lower rain probability</span>
    </label>

    <label class="preference-controls__option">
      <input
          type="checkbox"
          :checked="preferences.preferLowerWindSpeed"
          @change="$emit('update', 'preferLowerWindSpeed', $event.target.checked)"
      >
      <span>Lower wind speed</span>
    </label>
  </section>
</template>
