import { ref } from 'vue'
import axios from 'axios'
import MP3Tag from 'mp3tag.js'

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

const getAudioBlob = async (downloadLink: string): Promise<Blob | null> => {
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
  try {
    const response = await fetch(proxyUrl + downloadLink)
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
    console.log('no audio info')
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

export { createAudio }
