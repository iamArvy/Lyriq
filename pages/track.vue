<script setup lang="ts">
import type { Track } from "~/types";

const route = useRoute();
const id = route.query.id as string;

const { getTrack } = useSpotify();
const track = ref<Track>({} as Track);
onMounted(async () => {
  track.value = await getTrack(id);
});
</script>

<template>
  <h1>{{ track.name }}</h1>
</template>