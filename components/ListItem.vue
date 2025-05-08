<script setup lang="ts">
defineProps<{
  img: string;
  title: string;
  album_type?: string;
  artists: string | { name: string; id: string }[];
}>();
</script>
<template>
  <div class="flex">
    <NuxtImg :src="img" />
    <div class="p-2 flex flex-col justify-center">
      <p class="font-bold">{{ title }}</p>
      <p class="flex space-x-2 capitalize">
        <template v-if="album_type">
          <span>{{ album_type }}</span>
          <span>.</span>
        </template>
        <span>
          <template v-if="Array.isArray(artists)">
            <template v-for="(item, index) in artists" :key="item.id">
              {{ item.name }}
              <template v-if="index !== artists.length - 1">
                <span>, </span>
              </template>
            </template>
          </template>
          <template v-else>
            {{ artists }}
          </template>
        </span>
      </p>
    </div>
  </div>
</template>
