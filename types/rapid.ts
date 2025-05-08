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
