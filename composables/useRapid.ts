import type {
  AlbumDownloadData,
  AlbumDownloadResponse,
  ChartResponse,
  Lyrics,
  LyricsResponse,
  SongDownloadResponse,
} from "~/types";

const makeRequest = async <T = any>(
  host: string,
  route: string,
  options: any
): Promise<T> => {
  const key = useRuntimeConfig().public.rapidKey;
  try {
    const response = (await $fetch(`https://${host}/${route}`, {
      ...options,
      headers: {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": host,
      },
    })) as T;
    return response;
  } catch (err: any) {
    console.error(`Error in makeRequest for route ${route}:`, err);
    throw err;
  }
};

export const useGenius = () => {
  const getChart = async () => {
    try {
      const data: ChartResponse = await makeRequest<ChartResponse>(
        "genius-song-lyrics1.p.rapidapi.com",
        "chart/songs",
        {
          method: "GET",
          params: { time_period: "day", per_page: "20", page: "1" },
        }
      );
      console.log(data);
      return data.chart_items;
    } catch (error) {
      console.error("Error getting new albums:", error);
      return [];
    }
  };

  return { getChart };
};

export const useSpotifyDownloader = () => {
  const getTrack = async (id: string) => {
    try {
      const data: SongDownloadResponse =
        await makeRequest<SongDownloadResponse>(
          "spotify-downloader9.p.rapidapi.com",
          "downloadSong",
          {
            method: "GET",
            params: { songId: id },
          }
        );
      return data.data;
    } catch (error) {
      console.error("Error getting new albums:", error);
      return {};
    }
  };

  const getAlbum = async (id: string): Promise<AlbumDownloadData> => {
    try {
      const data: AlbumDownloadResponse =
        await makeRequest<AlbumDownloadResponse>(
          "spotify-downloader9.p.rapidapi.com",
          "downloadAlbum",
          {
            method: "GET",
            params: { albumId: id },
          }
        );
      console.log(data);
      return data.data;
    } catch (error) {
      console.error("Error getting new albums:", error);
      return {} as AlbumDownloadData;
    }
  };

  return { getTrack, getAlbum };
};

export const useSpotifyLyrics = () => {
  const getLyrics = async (id: string): Promise<Lyrics> => {
    try {
      const data: LyricsResponse = await makeRequest<LyricsResponse>(
        "spotify23.p.rapidapi.com",
        "track_lyrics",
        {
          method: "GET",
          params: { id },
        }
      );
      return data.lyrics;
    } catch (error) {
      console.error("Error getting new albums:", error);
      return {} as Lyrics;
    }
  };

  return { getLyrics };
};
