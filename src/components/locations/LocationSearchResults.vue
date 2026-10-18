<script setup>
import {formatLocationLabel} from '../../models/location.js'

defineProps({
  results: {
    type: Array,
    default: () => [],
  },
  isSearching: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  canAddLocation: {
    type: Boolean,
    default: true,
  },
  activeIndex: {
    type: Number,
    default: -1,
  },
})

defineEmits(['select'])

function optionId(location) {
  return `location-option-${String(location.id).replace(/[^a-zA-Z0-9_-]/g, '-')}`
}
</script>

<template>
  <div
      v-if="isSearching"
      id="location-search-results"
      class="location-search-results"
      role="status"
      aria-live="polite"
  >
    Searching locations…
  </div>

  <div
      v-else-if="error"
      id="location-search-results"
      class="location-search-results"
      role="alert"
  >
    {{ error }}
  </div>

  <ul
      v-else-if="results.length"
      id="location-search-results"
      class="location-search-results"
      role="listbox"
      aria-label="Location search results"
  >
    <li
        v-for="(location, index) in results"
        :id="optionId(location)"
        :key="location.id"
        class="location-search-results__item"
        role="option"
        :aria-selected="index === activeIndex"
        @mousedown.prevent
        @click="$emit('select', location)"
    >
      <span
          class="location-search-results__option"
          :class="{
          'location-search-results__option--active': index === activeIndex,
          'location-search-results__option--disabled': !canAddLocation,
        }"
      >
        <span class="location-search-results__name">
          {{ location.name }}
        </span>

        <span class="location-search-results__details">
          {{ formatLocationLabel(location) }}
        </span>
      </span>
    </li>
  </ul>
</template>
