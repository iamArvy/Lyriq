<script setup lang="ts">
import type { Album } from "~/types";

const route = useRoute();
const id = route.query.id as string;

const { getAlbum } = useSpotify();
const album = ref<Album>({} as Album);
onMounted(async () => {
  album.value = await getAlbum(id);
});
</script>

<template>
  <h1>{{ album.name }}</h1>
</template>
