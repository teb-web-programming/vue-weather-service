<script setup>
import ComparisonTable from './ComparisonTable.vue'
import PreferenceControls from './PreferenceControls.vue'
import EvaluationResults from './EvaluationResults.vue'

defineProps({
  locations: {
    type: Array,
    default: () => [],
  },
  weatherByLocation: {
    type: Object,
    default: () => ({}),
  },
  preferences: {
    type: Object,
    required: true,
  },
  evaluation: {
    type: Object,
    required: true,
  },
})

defineEmits(['update-preference'])
</script>

<template>
  <section class="comparison-panel" aria-labelledby="comparison-panel-title">
    <h2 id="comparison-panel-title">Compare locations</h2>

    <ComparisonTable
        :locations="locations"
        :weather-by-location="weatherByLocation"
    />

    <PreferenceControls
        :preferences="preferences"
        @update="(name, value) => $emit('update-preference', name, value)"
    />

    <EvaluationResults :evaluation="evaluation"/>
  </section>
</template>
