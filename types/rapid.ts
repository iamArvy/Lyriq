export interface Chart {
  artist_names: string;
  full_title: string;
  id: number;
  song_art_image_url: string;
  title: string;
}

export type ChartResponse = {
  chart_items: {
    item: Chart;
  }[];
};

export interface Song {
  id: string;
  artist: string;
  title: string;
  album: string;
  cover: string;
  releaseDate: string;
  downloadLink: string;
}

export interface AlbumDetails {
  artist: string;
  title: string;
  cover: string;
  releaseDate: string;
}
export type SongDownloadResponse = {
  data: Song;
};

export type AlbumDownloadData = {
  albumDetails: AlbumDetails;
  count: number;
  songs: Song[];
};

export type AlbumDownloadResponse = {
  data: AlbumDownloadData;
};

export interface Lyric {
  words: string;
}

export type Lyrics = {
  lines: Lyric[];
};

export type LyricsResponse = {
  lyrics: Lyrics;
};
