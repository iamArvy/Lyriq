<script setup lang="ts">
import type { Album, Collection, Track } from "~/types";

const route = useRoute();
// const id = route.query.id as string;
const { getTrack, getAlbum, getRecommendations } = useSpotify();
// const { downloadTrack } = useDownloader();
const track = ref<Track>({} as Track);
const album = ref<Album>({} as Album);
const recommendations = ref<Collection<Track>>({} as Collection<Track>);

const fetchTrackData = async () => {
  const id = route.query.id as string;
  if (!id) return;

  track.value = await getTrack(id);

  if (track.value) {
    if (track.value.album.album_type === "album")
      album.value = await getAlbum(track.value.album.id);
    recommendations.value = await getRecommendations(id);
  }
};
onMounted(fetchTrackData);
watch(() => route.query.id, fetchTrackData);
</script>

<template>
  <PageHero :img="track?.album?.images?.[0].url" v-if="track">
    <template #details>
      <h2 class="font-bold text-4xl">{{ track.name }}</h2>
      <h4 class="semi-bold text-2xl">
        <ArtistLoop :artists="track.artists" />
      </h4>
      <h4>{{ track?.album?.release_date }}</h4>
      <div v-if="track.album && track.album.album_type !== 'single'">
        <NuxtLink
          :to="{ name: 'album', query: { id: album.id } }"
          class="capitalize"
        >
          {{ album.name }} - {{ album.album_type }}
        </NuxtLink>
        <h5>Track {{ track.track_number }} of {{ album.total_tracks }}</h5>
      </div>
    </template>
    <template #others>
      <div v-if="album">
        <h3>Songs on Album:</h3>
        <ScrollArea class="h-72">
          <div v-for="item in album?.tracks?.items" :key="item.id">
            <NuxtLink :to="{ name: 'track', query: { id: item.id } }">
              <ListItem
                :title="item.name"
                :img="album.images[0].url"
                :artists="item.artists"
                class="h-[50px] hover:bg-white hover:text-black transition-all ease-in-out duration-300 text-sm"
                :class="item.id === track.id ? 'bg-white text-black' : null"
              />
            </NuxtLink>
            <Separator class="my-1" />
          </div>
        </ScrollArea>
      </div>
    </template>
  </PageHero>
  <section id="recommendations" class="py-2 container">
    <h3 class="font-bold text-2xl">Recommendations</h3>
    <div>
      <ScrollArea>
        <div class="flex space-x-3 my-2">
          <NuxtLink
            v-for="item in recommendations.items"
            :key="item.id"
            :to="{
              name: 'album',
              query: { id: item.id },
            }"
          >
            <MusicItem
              :title="item.name"
              :img="item.album.images[0].url"
              :description="[item.album.album_type, item.artists[0].name]"
              class="w-[150px]"
            />
          </NuxtLink>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  </section>
</template>
