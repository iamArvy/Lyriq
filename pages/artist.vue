<script setup lang="ts">
import type { Album, Artist, Collection, Track } from "~/types";

const route = useRoute();
// const id = route.query.id as string;

const { getArtist, getArtistAlbums, getRelatedArtists } = useSpotify();
// const { downloadTrack } = useDownloader();
const artist = ref<Artist>({} as Artist);
const artistAlbums = ref<Collection<Album>>({} as Collection<Album>);
const relatedArtists = ref<Collection<Artist>>({} as Collection<Artist>);
const fetchArtistData = async () => {
  const id = route.query.id as string;
  if (!id) return;
  artist.value = await getArtist(id);
  if (artist.value) {
    // artistAlbums.value = await getArtistAlbums(id);
    // relatedArtists.value = await getRelatedArtists(id);
  }
};
onMounted(fetchArtistData);
watch(() => route.query.id, fetchArtistData);
</script>

<template>
  <PageHero :img="artist?.images?.[0].url" v-if="artist">
    <template #details>
      <h2 class="font-bold text-4xl">{{ artist.name }}</h2>
      <!-- <h4 class="semi-bold text-2xl">
        <ArtistLoop :artists="track.artists" />
      </h4> -->
      <h4>{{ artist?.followers?.total }}</h4>
      <h4>{{ artist.popularity }}</h4>
      <!-- <div v-if="track.album && track.album.album_type !== 'single'">
        <NuxtLink
          :to="{ name: 'album', query: { id: album.id } }"
          class="capitalize"
        >
          {{ album.name }} - {{ album.album_type }}
        </NuxtLink>
        <h5>Track {{ track.track_number }} of {{ album.total_tracks }}</h5>
      </div> -->
    </template>
    <template #others>
      <!-- <div v-if="album">
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
      </div> -->
    </template>
  </PageHero>
  <section id="discography" class="py-2 container">
    <h3 class="font-bold text-2xl">Discography</h3>
    <div>
      <div class="flex space-x-3 my-2">
        <NuxtLink
          v-for="item in artistAlbums.items"
          :key="item.id"
          :to="{
            name: 'album',
            query: { id: item.id },
          }"
        >
          {{ item.name }}
          <MusicItem
            :title="item.name"
            :img="item.images[0].url"
            :description="[item.album_type, item.artists[0].name]"
            class="w-[150px]"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
