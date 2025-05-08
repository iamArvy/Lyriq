<script setup lang="ts">
const appConfig = useAppConfig();
</script>
<template>
  <div class="flex gap-2 items-center h-full">
    <NuxtImg src="/logo.png" width="30" />
    <span class="text-white font-bold text-2xl">{{ appConfig.appName }}</span>
  </div>
</template>
