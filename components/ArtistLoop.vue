<script setup lang="ts">
defineProps<{
  artists: {
    name: string;
    id: string;
  }[];
}>();
</script>
<template>
  <span v-for="(artist, index) in artists" :key="artist.id">
    <NuxtLink :to="{ name: 'artist', query: { id: artist.id } }" class="link">
      {{ artist.name }}
    </NuxtLink>
    <span v-if="index < artists.length - 1">, </span>
  </span>
</template>
