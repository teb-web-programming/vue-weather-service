<script setup>
defineProps({
  evaluation: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section
      class="evaluation-results"
      aria-labelledby="evaluation-results-title"
      aria-live="polite"
  >
    <h3 id="evaluation-results-title">Your best weather match</h3>

    <p class="evaluation-results__message">
      {{ evaluation.message }}
    </p>

    <ol
        v-if="evaluation.results.length"
        class="evaluation-results__list"
    >
      <li
          v-for="(result, index) in evaluation.results"
          :key="result.locationId"
          class="evaluation-results__item"
      >
        <div class="evaluation-results__location">
          <span class="evaluation-results__rank">
            {{ index + 1 }}.
          </span>

          <span>{{ result.locationName }}</span>
        </div>

        <span class="evaluation-results__score">
          {{ result.score }} {{ result.score === 1 ? 'point' : 'points' }}
        </span>
      </li>
    </ol>
  </section>
</template>
