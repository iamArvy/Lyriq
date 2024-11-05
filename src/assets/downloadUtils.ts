import JSZip from 'jszip'
import MP3Tag from 'mp3tag.js'
import axios from 'axios'
import { ref } from 'vue'

const downloaddata = ref()
const getTrackLyrics = async (id: string): Promise<string | null> => {
  interface LyricLine {
    startTimeMs: string
    endTimeMs: string
    words: string
    syllables?: string[]
  }

  const lyricsArray = ref<LyricLine[]>([])

  try {
    const key = import.meta.env.VITE_RAPID_API_KEY
    const response = await axios.get('https://spotify23.p.rapidapi.com/track_lyrics/', {
      params: { id },
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
      }
    })

    if (!response.data || !response.data.lyrics || !response.data.lyrics.lines) {
      console.error('No lyrics data found')
      return null
    }

    lyricsArray.value = response.data.lyrics.lines
    return lyricsArray.value.map((line) => line.words).join('\n')
  } catch (error) {
    console.error('Error fetching lyrics:', error)
    return 'Failed to fetch lyrics, please try again later.' // Optional: return a user-friendly message
  }
}

const getImageData = async (cover: string): Promise<Uint8Array> => {
  const response = await fetch(cover)
  if (!response.ok) {
    throw new Error('Failed to fetch cover image')
  }
  const imageBlob = await response.blob()

  return new Promise<Uint8Array>((resolve) => {
    const imgReader = new FileReader()
    imgReader.onload = (e) => resolve(new Uint8Array(e.target!.result as ArrayBuffer))
    imgReader.readAsArrayBuffer(imageBlob)
  })
}

const getDownloadData = async (requestInfo: {
  pathname: string
  params: { name: string; value: string }[]
}): Promise<any> => {
  const url = new URL('https://spotify-downloader9.p.rapidapi.com')
  url.pathname = requestInfo?.pathname

  requestInfo?.params.forEach((param) => url.searchParams.append(param.name, param.value))

  try {
    const key = import.meta.env.VITE_RAPID_API_KEY
    const response = await axios.get(url.toString(), {
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': 'spotify-downloader9.p.rapidapi.com'
      }
    })

    downloaddata.value = response.data.data
  } catch (error) {
    console.error('Error fetching download data:', error)
    throw error // Re-throw error for upstream handling
  }
}

const getAudioBlob = async (downloadLink: string): Promise<Blob | null> => {
  try {
    const response = await fetch(downloadLink)
    if (!response.ok) {
      console.error('Failed to fetch audio file:', response.statusText)
      return null // Return null instead of throwing an error
    }
    return await response.blob()
  } catch (error) {
    console.error('Error fetching audio file:', error)
    return null // Return null on network errors
  }
}

const getTaggedBlob = (
  audioBlob: Blob,
  data: {
    title: string
    artist: string
    album: string
    albumartist?: string
    year: string
    picture?: { format: string; data: Uint8Array }
    lyrics: string | null
    track?: number
  }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      const arrayBuffer = event.target!.result as ArrayBuffer
      const mp3tag = new MP3Tag(arrayBuffer, true)

      mp3tag.read()
      if (mp3tag.error) {
        return reject(new Error(mp3tag.error))
      }

      // Set ID3 tags
      mp3tag.tags.title = data.title
      mp3tag.tags.artist = data.artist
      if (data.album) mp3tag.tags.album = data.album
      if (data.year) mp3tag.tags.year = data.year

      // Optional fields
      if (data.track) mp3tag.tags.track = data.track.toString()
      if (mp3tag.tags.v2) {
        if (data.albumartist) mp3tag.tags.v2.TPE2 = data.albumartist

        if (data.picture)
          mp3tag.tags.v2.APIC = [
            {
              format: data.picture.format,
              type: 3,
              description: 'Cover',
              data: Array.from(data.picture.data)
            }
          ]
        if (data.lyrics)
          mp3tag.tags.v2.USLT = [
            {
              language: '', // Optional: add language code if needed
              descriptor: 'lyrics',
              text: data.lyrics
            }
          ]
      }

      mp3tag.save()
      resolve(new Blob([mp3tag.buffer], { type: 'audio/mp3' }))
    }

    reader.onerror = (e) => reject(e)
    reader.readAsArrayBuffer(audioBlob)
  })
}

const download = (file: Blob, filename: string) => {
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url) // Clean up object URL
}

// Assuming you are using Vue 3 with the Composition API

const createAudio = async (audio: {
  id: string
  title: string
  downloadLink: string
  artist: string
  album: string
  cover: Uint8Array | null
  releaseDate: string
  albumartist?: string | null
  track?: number | null
}) => {
  // Validate input
  if (!audio) {
    throw new Error('Missing required audio information.')
  }

  const lyrics = ref<string | null>(null)
  const audioBlob = ref<Blob | null>(null)

  try {
    const { id, title, downloadLink, artist, album, cover, releaseDate, albumartist, track } = audio

    // Fetch the audio blob
    audioBlob.value = await getAudioBlob(downloadLink)

    if (!audioBlob.value) return null
    // Fetch the track lyrics
    lyrics.value = await getTrackLyrics(id)

    // Prepare data for tagging
    const data = {
      title: title,
      artist: artist,
      album: album,
      year: releaseDate.split('-')[0], // Extract year from release date
      picture: cover ? { format: 'image/jpeg', data: cover } : undefined,
      lyrics: lyrics.value,
      albumartist: albumartist ? albumartist : undefined,
      track: track ? track : undefined
    }

    // Create a tagged music blob
    const musicBlob = await getTaggedBlob(audioBlob.value, data)
    return musicBlob
  } catch (error) {
    console.error('Error creating audio:', error)
    throw new Error('Failed to create audio. Please try again.')
  }
}

const downloadAudio = async (
  id: string,
  updateProgress: (message: string) => void // Progress callback
) => {
  // Validate input
  if (!id) {
    return 'Audio ID is required.'
  }

  const imageData = ref<Uint8Array | null>(null)

  try {
    // Fetch download data
    await getDownloadData({
      pathname: 'downloadSong',
      params: [{ name: 'songId', value: id }]
    })
    const audio = ref(downloaddata.value)
    const { title, downloadLink, artist, album, cover, releaseDate } = audio.value
    // Fetch the cover image if available
    if (cover) {
      imageData.value = await getImageData(cover)
    }

    // Prepare audio data for creation
    const data = {
      id: id,
      title: title,
      downloadLink: downloadLink,
      artist: artist,
      album: album,
      cover: imageData.value,
      releaseDate: releaseDate.split('-')[0] // Extract year from release date
    }

    updateProgress(`Compiling song`)
    // Create audio with tags
    const musicBlob = await createAudio(data)
    if (musicBlob) {
      download(musicBlob, `${artist} - ${album} - ${title}.mp3`)
    } else {
      updateProgress(`Something went wrong, try again`)
    }
  } catch (error) {
    console.error('Error downloading audio:', error)
  }
}

const downloadAlbum = async (
  id: string,
  updateProgress: (message: string) => void // Progress callback
) => {
  const zip = new JSZip()

  const imageData = ref<Uint8Array | null>(null)

  // Validate input
  if (!id) {
    throw new Error('Album ID is required.')
  }

  try {
    // Fetch album data
    await getDownloadData({
      pathname: 'downloadAlbum',
      params: [{ name: 'albumId', value: id }]
    })
    // console.log('start fetch')
    const album = ref(downloaddata.value)
    console.log(album.value)
    if (!album.value) {
      throw new Error('Album not found.')
    }

    const { artist, releaseDate, cover, title } = album.value.albumDetails
    const totalTracks = album.value.songs.length

    // Fetch cover image if available
    if (cover) {
      imageData.value = await getImageData(cover)
    }

    // Download each track and add to the zip file
    console.log('start loop')
    for (let i = 0; i < totalTracks; ) {
      album.value = downloaddata.value
      const track = album.value.songs[i]
      const { title: trackTitle, downloadLink, id: trackId, artist: trackArtist } = track

      const data = {
        id: trackId,
        track: i + 1,
        title: trackTitle,
        downloadLink: downloadLink,
        album: title,
        albumartist: artist,
        artist: trackArtist,
        cover: imageData.value,
        releaseDate: releaseDate.split('-')[0]
      }

      updateProgress(`Downloading track ${i + 1} of ${totalTracks}: ${trackTitle}`)
      const musicBlob = await createAudio(data)
      if (!musicBlob) {
        await getDownloadData({
          pathname: 'downloadAlbum',
          params: [{ name: 'albumId', value: id }]
        })
        continue
      }
      zip.file(`${artist} - ${title} - ${i + 1} - ${trackTitle}.mp3`, musicBlob)
      i++
    }

    updateProgress('Compiling album tracks into a ZIP file...')
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    download(zipBlob, `${title}.zip`)
    updateProgress('Download has started')
  } catch (error) {
    throw new Error('Download failed:' + error)
  }
}

export { downloadAlbum, downloadAudio }
