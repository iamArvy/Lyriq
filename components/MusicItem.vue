<script setup lang="ts">
defineProps<{
  img: string;
  title: string;
  description: string | string[];
}>();
</script>
<template>
  <figure>
    <NuxtImg :src="img" />
    <figcaption class="p-1 text-sm flex flex-col space-y-1">
      <h3 class="font-bold text-sm">{{ title }}</h3>
      <p>
        <template v-if="Array.isArray(description)">
          <span v-for="item in description" :key="item">
            {{ item }}
          </span>
        </template>
        <span v-else> {{ description }} </span>
      </p>
    </figcaption>
  </figure>
</template>
