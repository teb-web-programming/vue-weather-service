<script setup>
import {computed, onBeforeUnmount, ref, watch} from 'vue'
import LocationSearchResults from './LocationSearchResults.vue'

const props = defineProps({
  selectedLocations: {
    type: Array,
    default: () => [],
  },
  canAddLocation: {
    type: Boolean,
    default: true,
  },
  query: {
    type: String,
    default: '',
  },
  results: {
    type: Array,
    default: () => [],
  },
  isSearching: {
    type: Boolean,
    default: false,
  },
  searchError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'select',
  'search',
  'clear-search',
  'update:query',
])

const isFocused = ref(false)
const activeIndex = ref(-1)

let debounceTimer

const availableResults = computed(() =>
    props.results.filter(
        (location) =>
            !props.selectedLocations.some(
                (selected) =>
                    String(selected.id) === String(location.id),
            ),
    ),
)

const showTypingHint = computed(
    () =>
        isFocused.value &&
        props.query.trim().length < 2 &&
        !props.isSearching &&
        !props.searchError,
)

const activeDescendant = computed(() => {
  const location = availableResults.value[activeIndex.value]

  if (!location) {
    return undefined
  }

  return `location-option-${String(location.id).replace(/[^a-zA-Z0-9_-]/g, '-')}`
})

function cancelPendingSearch() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = undefined
  }
}

watch(
    () => props.query,
    (value) => {
      cancelPendingSearch()
      activeIndex.value = -1

      const normalizedQuery = value.trim()

      if (normalizedQuery.length < 2) {
        emit('clear-search', normalizedQuery.length > 0)
        return
      }

      debounceTimer = setTimeout(() => {
        emit('search', value)
        debounceTimer = undefined
      }, 300)
    },
)

watch(
    availableResults,
    () => {
      activeIndex.value = -1
    },
)

onBeforeUnmount(cancelPendingSearch)

function handleInput(event) {
  emit('update:query', event.target.value)
}

function handleClear() {
  cancelPendingSearch()
  activeIndex.value = -1
  emit('clear-search')
}

function handleKeydown(event) {
  if (event.key === 'ArrowDown') {
    if (!availableResults.value.length) {
      return
    }

    event.preventDefault()
    activeIndex.value =
        activeIndex.value < availableResults.value.length - 1
            ? activeIndex.value + 1
            : 0
    return
  }

  if (event.key === 'ArrowUp') {
    if (!availableResults.value.length) {
      return
    }

    event.preventDefault()
    activeIndex.value =
        activeIndex.value > 0
            ? activeIndex.value - 1
            : availableResults.value.length - 1
    return
  }

  if (event.key === 'Enter') {
    if (activeIndex.value >= 0) {
      event.preventDefault()
      handleSelect(availableResults.value[activeIndex.value])
    }
    return
  }

  if (event.key === 'Escape') {
    if (
        availableResults.value.length ||
        props.isSearching ||
        props.searchError
    ) {
      event.preventDefault()
      cancelPendingSearch()
      activeIndex.value = -1
      emit('clear-search', true)
    }
  }
}

function handleSelect(location) {
  cancelPendingSearch()
  activeIndex.value = -1
  emit('select', location)
  emit('clear-search')
}
</script>

<template>
  <section class="location-search" aria-label="Search for locations">
    <form
        class="location-search__form"
        role="search"
        @submit.prevent
    >
      <div class="location-search__controls">
        <div class="location-search__input-wrapper">
          <input
              id="location-search-input"
              :value="query"
              type="text"
              name="location"
              placeholder="Search a city or town"
              autocomplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-controls="location-search-results"
              :aria-expanded="availableResults.length > 0"
              :aria-activedescendant="activeDescendant"
              :aria-busy="isSearching"
              @input="handleInput"
              @keydown="handleKeydown"
              @focus="isFocused = true"
              @blur="isFocused = false"
          >

          <button
              v-if="query"
              class="location-search__clear"
              type="button"
              aria-label="Clear search"
              @click="handleClear"
          >
            &times;
          </button>
        </div>
      </div>
    </form>

    <p
        v-if="showTypingHint"
        class="location-search__hint"
    >
      Type at least 2 characters to search.
    </p>

    <LocationSearchResults
        :results="availableResults"
        :is-searching="isSearching"
        :error="searchError"
        :can-add-location="canAddLocation"
        :active-index="activeIndex"
        @select="handleSelect"
    />
  </section>
</template>
