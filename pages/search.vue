<script setup lang="ts">
import type { SearchResponse } from "~/types";
const { getSearchResults } = useSpotify();
const route = useRoute();
const query = route.query.q as string;
const results = ref<SearchResponse>({
  tracks: {},
  albums: {},
  artists: {},
} as SearchResponse);
onMounted(async () => {
  results.value = await getSearchResults(query);
});
</script>

<template>
  <div class="grid grid-cols-2 gap-5">
    <section id="genius-top-chart" class="py-2">
      <h3 class="font-bold text-2xl">Albums</h3>
      <div class="space-y-2">
        <ScrollArea class="h-72">
          <div v-for="item in results.albums.items" :key="item.id">
            <NuxtLink :to="{ name: 'album', query: { id: item.id } }">
              <ListItem
                :title="item.name"
                :img="item.images[0].url"
                :artists="item.artists"
                class="h-[50px] hover:bg-gray-200 transition-all ease-in-out duration-300 text-sm"
              />
            </NuxtLink>
            <Separator class="my-2" />
          </div>
        </ScrollArea>
      </div>
    </section>
    <section id="genius-top-chart" class="py-2">
      <h3 class="font-bold text-2xl">Tracks</h3>
      <div class="space-y-2">
        <ScrollArea class="h-72">
          <div v-for="item in results.tracks.items" :key="item.id">
            <NuxtLink :to="{ name: 'track', query: { id: item.id } }">
              <ListItem
                :title="item.name"
                :img="item.album.images[0].url"
                :artists="item.artists"
                class="h-[50px] hover:bg-gray-200 transition-all ease-in-out duration-300 text-sm"
              />
            </NuxtLink>
            <Separator class="my-2" />
          </div>
        </ScrollArea>
      </div>
    </section>
  </div>
  <section class="my-3">
    <h3 class="font-bold text-2xl">Artists</h3>
    <div>
      <ScrollArea class="h-fit">
        <div class="flex space-x-3 w-max mb-4">
          <div v-for="item in results.artists.items" :key="item.id">
            <NuxtLink :to="{ name: 'artist', query: { id: item.id } }">
              <ArtistItem :name="item.name" :img="item.images[0].url" />
            </NuxtLink>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  </section>
</template>
