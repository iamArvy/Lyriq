<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import FullWidth from '@/components/FullWidth.vue'
// Page Components
import DialogModal from '@/components/DialogModal.vue'
import PageHero from '@/partials/PageHero.vue'
// @ts-ignore
import MainSection from '@/components/MainSection.vue'
import ListItem from '@/components/ListItem.vue'
import VerticalSwiper from '@/partials/VerticalSwiper.vue'
// @ts-ignore
import MoreInfo from '@/components/MoreInfo.vue'
// @ts-ignore
import ScrollerItem from '@/components/ScrollerItem.vue'
// @ts-ignore
import DownloadButton from '@/components/DownloadButton.vue'
import { useSpotifyStore } from '@/stores/spotify'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import { useDownloadStore } from '@/stores/download'
import { useLoadingStore } from '@/stores/loading'
import ArtistLoop from '@/components/ArtistLoop.vue'
import TrackItem from '@/components/TrackItem.vue'
import { title } from 'process'
const loader = useLoadingStore()
// Variables
const spotify = useSpotifyStore()
const downloader = useDownloadStore()

const album = ref<{
  id: string
  image: string
  name: string
  artists: { name: string; id: string }[]
  date?: string
  spotify?: string
} | null>(null)

const tracks = ref<
  | {
      title: string
      id: string
      artists: string
    }[]
  | null
>(null)

const newrelease = ref<
  | {
      images: { url: string }[]
      name?: string
      artists?: { name: string }[]
      id: number
    }[]
  | null
>(null)

const swiperOptions = ref({
  spaceBetween: 50,
  pagination: {
    el: '.swiper-pagination',
    clickable: true
  },
  breakpoints: {
    1100: {
      slidesPerView: 4,
      spaceBetween: 30
    },
    800: {
      slidesPerView: 3,
      spaceBetween: 20
    },
    570: {
      slidesPerView: 2,
      spaceBetween: 20
    },
    450: {
      slidesPerView: 1,
      spaceBetween: 10
    }
  }
})

const route = useRoute()
const itemId = route.query.id as string
onMounted(async () => {
  try {
    await spotify.albums(itemId)
    await spotify.getNewRelease()
    album.value = spotify.albumgetter
      ? {
          name: spotify.albumgetter.name,
          id: spotify.albumgetter.id,
          image: spotify.albumgetter.images[1].url,
          artists: spotify.albumgetter.artists,
          spotify: spotify.albumgetter.external_urls.spotify,
          date: spotify.albumgetter.release_date
        }
      : null
    tracks.value = spotify.albumgetter.tracks.items
      ? spotify.albumgetter.tracks.items.map(
          (item: { name: string; id: string; artists: { name: string }[] }) => ({
            title: item.name,
            id: item.id,
            artists: item.artists.map((artist) => artist.name).join(', ') || null
          })
        )
      : null
    console.log(tracks)
    newrelease.value = spotify.getnewrelease || null
    loader.setLoading(false)
  } catch (error) {
    console.error('Error fetching album data:', error)
  }
})
const openModal = ref(false)
const loading = ref<boolean>(false)
const download = async () => {
  try {
    openModal.value = true
    await downloader.download(itemId, 'album')
  } catch (error) {
    console.error(error)
  }
}

const closeModal = () => {
  openModal.value = false
}
</script>

<template>
  <DialogModal v-if="openModal" :show="openModal" :close="closeModal" :title="album?.name">
    <MyLoader v-if="loading" />
    <div v-else>
      <div>
        <span>{{ downloader.$state.downloadProgress }}</span>
      </div>
    </div>
  </DialogModal>
  <FullWidth>
    <PageHero v-if="album != null" :img="album.image">
      <template #details>
        <h2>{{ album.name }}</h2>
        <h4><ArtistLoop :artists="album.artists" /></h4>
        <h4>{{ album.date }}</h4>
        <div class="buttons">
          <DownloadButton />
          <DownloadButton />
        </div>
      </template>
      <template #others>
        <div>
          <h3>Tracklist:</h3>
          <VerticalSwiper>
            <TrackItem v-for="(track, index) in tracks" :key="index" :item="track" param="track" />
          </VerticalSwiper>
        </div>
      </template>
    </PageHero>
  </FullWidth>

  <!-- <MainSection title="Tracklist:">
    <VerticalLister>
      <ListItem
        v-for="(item, index) in tracks"
        :key="index"
        :title="item?.name"
        :number="index + 1"
        route="track"
        params="id"
        :value="item?.id"
      />
    </VerticalLister>
  </MainSection> -->
  <DownloadButton @click="download" />
  <!-- <FullWidth>
    <MoreInfo title="New Releases" v-if="album != null">
      <swiper v-bind="swiperOptions">
        <swiper-slide v-for="(item, index) in newrelease" :key="index">
          <ScrollerItem
            :image="item.images[2].url"
            :name="item.name"
            :artists="item.artists"
            route="album"
            params="id"
            :value="item.id"
            :dark="true"
          />
        </swiper-slide>
      </swiper>
    </MoreInfo>
  </FullWidth> -->
</template>
<style scoped>
flex {
  flex: 1;
}
</style>
