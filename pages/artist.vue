<script setup lang="ts">
import type { Artist } from "~/types";

const route = useRoute();
const id = route.query.id as string;

const { getArtist } = useSpotify();
const artist = ref<Artist>({} as Artist);
onMounted(async () => {
  artist.value = await getArtist(id);
});
</script>

<template>
  <h1>{{ artist.name }}</h1>
</template>
