<script setup lang="ts">
defineProps<{
  img: string;
}>();
</script>
<template>
  <section class="bg-black text-white w-screen">
    <div class="container grid grid-cols-3 p-4 space-x-1 h-fit">
      <NuxtImg :src="img" />
      <div>
        <slot name="details" />
      </div>
      <div>
        <slot name="others" />
      </div>
    </div>
  </section>
</template>
