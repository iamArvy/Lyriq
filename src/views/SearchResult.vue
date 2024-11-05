<script setup lang="ts">
// @ts-ignore
import { useRoute } from 'vue-router'
const route = useRoute()
import { useSpotifyStore } from '@/stores/spotify'
import { onMounted, ref } from 'vue'
import { useLoadingStore } from '@/stores/loading'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import MainSection from '@/partials/MainSection.vue'
import VerticalSwiper from '@/partials/VerticalSwiper.vue'
import TrackItem from '@/components/TrackItem.vue'
import ArtistItem from '@/components/ArtistItem.vue'
const swiperOptions = ref({
  // spaceBetween: 50,
  pagination: {
    el: '.swiper-pagination',
    clickable: true
  },
  breakpoints: {
    1100: {
      slidesPerView: 5,
      spaceBetween: 30
    },
    881: {
      slidesPerView: 3,
      spaceBetween: 10
    },
    851: {
      slidesPerView: 2,
      spaceBetween: 10
    },
    501: {
      slidesPerView: 2,
      spaceBetween: 1
    }
  }
})
const loader = useLoadingStore()
const spotify = useSpotifyStore()
const tracks = ref<
  | {
      img: string
      title: string
      id: string
      artists: string
    }[]
  | null
>(null)
const artists = ref<
  | {
      img: string
      title: string
      id: string
    }[]
  | null
>(null)
const albums = ref<
  | {
      img: string
      title: string
      id: string
      artists: string
    }[]
  | null
>(null)
const itemId = route.query.q as string
onMounted(async () => {
  await spotify.search(itemId)
  console.log(spotify.artistresult)

  // tracks.value = spotify.trackresult || null
  tracks.value = spotify.trackresult
    ? spotify.trackresult.map(
        (item: {
          name: string
          id: string
          album: { images: { url: string }[] }
          artists: { name: string }[]
        }) => ({
          title: item.name,
          id: item.id,
          img: item.album.images[0].url,
          artists: item.artists.map((artist) => artist.name).join(', ')
        })
      )
    : null
  artists.value = spotify.artistresult
    ? spotify.artistresult.map((item: { name: string; images: { url: string }[]; id: string }) => ({
        title: item.name,
        img: item?.images?.[1]?.url || '',
        id: item.id
      }))
    : null
  albums.value = spotify.albumresult
    ? spotify.albumresult.map(
        (item: {
          name: string
          images: { url: string }[]
          id: string
          artists: { name: string }[]
        }) => ({
          title: item.name,
          id: item.id,
          img: item.images[0].url,
          artists: item.artists.map((artist) => artist.name).join(', ')
        })
      )
    : null
  loader.setLoading(false)
})
</script>

<template>
  <div class="soa">
    <MainSection>
      <template #header>Songs</template>
      <VerticalSwiper>
        <TrackItem v-for="(track, index) in tracks" :key="index" :item="track" param="track" />
      </VerticalSwiper>
    </MainSection>
    <MainSection>
      <template #header>Albums</template>
      <VerticalSwiper>
        <TrackItem v-for="(album, index) in albums" :key="index" :item="album" param="album" />
      </VerticalSwiper>
    </MainSection>
  </div>
  <MainSection>
    <template #header>Artists</template>
    <swiper v-bind="swiperOptions">
      <swiper-slide v-for="(item, index) in artists" :key="index">
        <ArtistItem :item="item" route="artist" params="id" rounded />
      </swiper-slide>
    </swiper>
    <!-- <HorizontalSwiper :items="artists" /> -->
  </MainSection>
  <!-- <SecondarySection title="Artists" v-if="artistsdata"> -->
  <!-- <swiper v-bind="swiperOptions">
      <swiper-slide v-for="(item, index) in artistsdata" :key="index"
        ><ScrollerItem
          :name="item.name"
          :followers="item.followers"
          :image="item?.images?.[1]?.url"
          :value="item.id"
          route="artist"
          params="id"
      /></swiper-slide>
    </swiper> -->
  <!-- </SecondarySection> -->
</template>

<style scoped>
.soa {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
section {
  font-family: poppins;
}
</style>
