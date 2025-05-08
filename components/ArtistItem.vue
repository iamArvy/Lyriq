<script setup lang="ts">
defineProps<{
  img: string;
  name: string;
}>();
</script>
<template>
  <figure class="flex flex-col space-y-1 items-center">
    <NuxtImg :src="img" class="rounded-full w-30 h-30" />
    <figcaption class="font-bold">{{ name }}</figcaption>
  </figure>
</template>
