<script setup>
defineProps({
  message: {
    type: String,
    required: true,
  },
  retryable: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['retry'])
</script>

<template>
  <div class="error-message" role="alert">
    <p class="error-message__text">{{ message }}</p>

    <button
        v-if="retryable"
        class="error-message__retry"
        type="button"
        @click="$emit('retry')"
    >
      Try again
    </button>
  </div>
</template>
