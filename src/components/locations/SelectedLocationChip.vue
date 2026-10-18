<script setup>
const props = defineProps({
  location: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['remove'])

function handleRemove() {
  emit('remove', props.location.id)
}
</script>

<template>
  <div class="selected-location-chip">
        <span class="selected-location-chip__name">
            {{ location.name }}
        </span>

    <span
        v-if="location.region"
        class="selected-location-chip__region"
    >
            {{ location.region }}
        </span>

    <button
        class="selected-location-chip__remove"
        type="button"
        :aria-label="`Remove ${location.name}`"
        @mousedown.prevent
        @click="handleRemove"
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
</template>
