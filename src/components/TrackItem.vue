<script setup lang="ts">
import ImgFigure from './ImgFigure.vue'
import { navigate } from '@/assets/navigate'
defineProps<{
  item: {
    title: string | null
    artists: string | null
    img?: string
    id: string
  }
  param: string
}>()
</script>
<template>
  <li @click="navigate(item.id, param, 'id')">
    <!-- @vue-ignore -->
    <ImgFigure :src="item.img" class="img" v-if="item.img" />
    <figcaption>
      <h1>{{ item.title }}</h1>
      <p>{{ item.artists }}</p>
    </figcaption>
  </li>
</template>

<style scoped>
.img {
  height: 100%;
  margin-right: 10px;
}
li {
  height: 70px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  cursor: pointer;
}
h1 {
  font-size: 16px;
}
p {
  font-size: 14px;
}
</style>
