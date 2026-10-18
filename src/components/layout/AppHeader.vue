<script setup>
defineProps({
  theme: {
    type: String,
    default: 'light',
  },
})

defineEmits(['toggle-theme'])
</script>

<template>
  <header class="app-header">
    <a class="app-header__brand" href="/" aria-label="Weather Service home">
      Weather Service
    </a>

    <div class="app-header__actions">
      <button
          class="theme-toggle"
          type="button"
          :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
          :title="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="$emit('toggle-theme')"
      >
        <span aria-hidden="true">{{ theme === 'dark' ? '☀' : '☾' }}</span>
        <span>{{ theme === 'dark' ? 'Light' : 'Dark' }}</span>
      </button>
    </div>
  </header>
</template>
