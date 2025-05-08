<script setup lang="ts">
import type { Album, Chart } from "~/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const { getNewReleases } = useSpotify();
const { getChart } = useGenius();
const releases = ref<Album[]>([]);
const chart = ref<{ item: Chart }[]>([]);
onMounted(async () => {
  releases.value = await getNewReleases();
  chart.value = await getChart();
});
</script>
<template>
  <section id="new-releases" class="py-2">
    <h3 class="font-bold text-2xl">New Releases</h3>
    <div>
      <ScrollArea>
        <div class="flex space-x-3 my-2">
          <NuxtLink
            v-for="item in releases"
            :key="item.id"
            :to="{
              name: 'album',
              query: { id: item.id },
            }"
          >
            <MusicItem
              :title="item.name"
              :img="item.images[0].url"
              :description="[item.album_type, item.artists[0].name]"
              class="w-[150px]"
            />
          </NuxtLink>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  </section>
  <section id="genius-top-chart" class="py-2">
    <h3 class="font-bold text-2xl">Genius Top Chart</h3>
    <div class="space-y-2">
      <div v-for="item in chart" :key="item.item.id">
        <NuxtLink
          :to="{
            name: 'search',
            query: { q: item.item.title + ' ' + item.item.artist_names },
          }"
        >
          <ListItem
            :title="item.item.title"
            :img="item.item.song_art_image_url"
            :artists="item.item.artist_names"
            class="h-[70px] hover:h-[100px] transition-all ease-in-out duration-300 text-sm hover:text-base"
          />
        </NuxtLink>
        <Separator class="my-2" />
      </div>
    </div>
  </section>
</template>
