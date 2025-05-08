import type { ChartResponse } from "~/types";

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
