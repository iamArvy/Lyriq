import JSZip from "jszip";
// import axios from 'axios'
// import { ref } from 'vue'
// import { createAudio } from './createAudio'

import type { AlbumDownloadData, Song } from "~/types";
import { useSpotifyDownloader } from "./useRapid";
import { useCreateAudio } from "./useCreateAudio";
// const downloaddata = ref()
const { getTrack, getAlbum } = useSpotifyDownloader();
const { createAudio } = useCreateAudio();
const getImageData = async (cover: string): Promise<Uint8Array> => {
  const response = await fetch(cover);
  if (!response.ok) {
    throw new Error("Failed to fetch cover image");
  }
  const imageBlob = await response.blob();

  return new Promise<Uint8Array>((resolve) => {
    const imgReader = new FileReader();
    imgReader.onload = (e) =>
      resolve(new Uint8Array(e.target!.result as ArrayBuffer));
    imgReader.readAsArrayBuffer(imageBlob);
  });
};

// const getDownloadData = async (requestInfo: {
//   pathname: string
//   params: { name: string; value: string }[]
// }): Promise<any> => {
//   const url = new URL('https://spotify-downloader9.p.rapidapi.com')
//   url.pathname = requestInfo?.pathname

//   requestInfo?.params.forEach((param) => url.searchParams.append(param.name, param.value))

//   try {
//     const key = import.meta.env.VITE_RAPID_API_KEY
//     const response = await axios.get(url.toString(), {
//       headers: {
//         'X-RapidAPI-Key': key,
//         'X-RapidAPI-Host': 'spotify-downloader9.p.rapidapi.com'
//       }
//     })

//     downloaddata.value = response.data.data
//   } catch (error) {
//     console.error('Error fetching download data:', error)
//     throw error // Re-throw error for upstream handling
//   }
// }

const download = (file: Blob, filename: string) => {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url); // Clean up object URL
};

// // Assuming you are using Vue 3 with the Composition API

// export { downloadAlbum, downloadAudio }

export const useDownloader = () => {
  const progress = useState("downloadProgress");
  const downloadTrack = async (id: string) => {
    if (!id) {
      return "Audio ID is required.";
    }

    const imageData = ref<Uint8Array | null>(null);

    try {
      const { title, cover, downloadLink, artist, album, releaseDate } =
        (await getTrack(id)) as Song;
      if (cover) {
        imageData.value = await getImageData(cover);
      }
      // Prepare audio data for creation
      const data = {
        id: id,
        title: title,
        downloadLink: downloadLink,
        artist: artist,
        album: album,
        cover: imageData.value,
        releaseDate: releaseDate.split("-")[0], // Extract year from release date
      };

      progress.value = `Compiling song`;
      // Create audio with tags
      const musicBlob = await createAudio(data);
      if (musicBlob) {
        download(musicBlob, `${artist} - ${album} - ${title}.mp3`);
      } else {
        progress.value = `Something went wrong, try again`;
      }
    } catch (error) {
      console.error("Error downloading audio:", error);
    }
  };

  const downloadAlbum = async (id: string) => {
    const zip = new JSZip();
    const imageData = ref<Uint8Array | null>(null);

    // Validate input
    if (!id) {
      throw new Error("Album ID is required.");
    }

    try {
      // Fetch album data
      progress.value = "Fetching album data...";
      progress.value = "Fetching album data...";
      const album = ref<AlbumDownloadData>({} as AlbumDownloadData);
      album.value = await getAlbum(id);

      if (!album.value) {
        progress.value = "Album not found";
        throw new Error("Album not found.");
      }

      const { artist, releaseDate, cover, title } = album.value.albumDetails;
      const totalTracks = album.value.songs.length;

      // Fetch cover image if available
      if (cover) {
        progress.value = "Fetching album cover...";
        imageData.value = await getImageData(cover);
      }

      // Download each track and add to the zip file
      progress.value = "Downloading tracks...";
      for (let i = 0; i < totalTracks; ) {
        // album.value = downloaddata.value;
        // console.log(album.value);
        const track = album.value.songs[i];
        const {
          title: trackTitle,
          downloadLink,
          id: trackId,
          artist: trackArtist,
        } = track;

        const data = {
          id: trackId,
          track: i + 1,
          title: trackTitle,
          downloadLink: downloadLink,
          album: title,
          albumartist: artist,
          artist: trackArtist,
          cover: imageData.value,
          releaseDate: releaseDate.split("-")[0],
        };

        progress.value = `Downloading track ${
          i + 1
        } of ${totalTracks}: ${trackTitle}`;
        const musicBlob = await createAudio(data);

        // If we fail to create the audio blob, log the error and continue
        if (!musicBlob) {
          console.error(
            `Failed to create blob for track ${trackTitle}. Skipping...`
          );
          progress.value = `Unable to get music blob for track ${
            i + 1
          } : ${trackTitle} retrying`;
          album.value = await getAlbum(id);
          console.error(
            `Failed to create blob for track ${trackTitle}. Skipping...`
          );
          continue;
        }

        // Add the track to the zip
        zip.file(
          `${artist} - ${title} - ${i + 1} - ${trackTitle}.mp3`,
          musicBlob
        );
        i++;
      }

      progress.value = "Compiling album tracks into a ZIP file...";
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Start the download of the zip file
      download(zipBlob, `${title}.zip`);
      progress.value = "Download has started";
    } catch (error) {
      console.error("Error in downloadAlbum:", error);
      throw new Error("Download failed:" + error);
    }
  };
  return { downloadTrack, downloadAlbum, progress };
};
