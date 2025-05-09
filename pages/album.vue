<script setup lang="ts">
import type { Album, Collection, Track } from "~/types";

const route = useRoute();
// const id = route.query.id as string;

const { getAlbum, getNewReleases } = useSpotify();
// const { downloadTrack } = useDownloader();
const album = ref<Album>({} as Album);
const releases = ref<Album[]>([]);

onMounted(async () => {
  const id = route.query.id as string;
  album.value = await getAlbum(id);
  releases.value = await getNewReleases();
});
</script>

<template>
  <PageHero :img="album?.images?.[0].url" v-if="album">
    <template #details>
      <h2 class="font-bold text-4xl">{{ album.name }}</h2>
      <h4 class="semi-bold text-2xl">
        <ArtistLoop :artists="album.artists" />
      </h4>
      <h4>{{ album.release_date }}</h4>
    </template>
    <template #others>
      <div>
        <h3>Tracklist:</h3>
        <ScrollArea class="h-72">
          <div v-for="item in album?.tracks?.items" :key="item.id">
            <NuxtLink :to="{ name: 'track', query: { id: item.id } }">
              <ListItem
                :title="item.name"
                :img="album.images[0].url"
                :artists="item.artists"
                class="h-[50px] hover:bg-gray-200 transition-all ease-in-out duration-300 text-sm"
              />
            </NuxtLink>
            <Separator class="my-1" />
          </div>
        </ScrollArea>
      </div>
    </template>
  </PageHero>
  <section id="new-releases" class="py-2 container">
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
</template>
