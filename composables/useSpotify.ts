import type {
  Album,
  Artist,
  Collection,
  NewReleaseResponse,
  RelatedArtistResponse,
  SearchResponse,
  Track,
  TrackRecommendationResponse,
} from "~/types";

export const useSpotify = () => {
  const token = useState<{ token: string; expiry: Date; type: string } | null>(
    "spotifyToken",
    () => null
  );
  const init = async () => {
    try {
      const data = await $fetch("/api/spotify/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (data) {
        const expiryTime = new Date();
        expiryTime.setSeconds(expiryTime.getSeconds() + data.expires_in);
        token.value = {
          token: data.access_token,
          expiry: expiryTime,
          type: data.token_type,
        };
      } else {
        console.error("No token data returned from Spotify API.");
        throw new Error("No token data returned");
      }
    } catch (err) {
      console.error("Exception in init:", err);
      throw err;
    }
  };

  const makeRequest = async <T = any>(
    route: string,
    options: any
  ): Promise<T> => {
    try {
      if (!token.value) {
        await init();
      }

      const { token: tokenValue, expiry, type } = token.value || {};
      if (expiry && expiry < new Date()) {
        console.log("Token has expired, fetching a new one...");
        await init();
      }

      const {
        token: freshToken,
        expiry: freshExpiry,
        type: freshType,
      } = token.value || {};
      if (!freshToken) {
        throw new Error("Spotify token is unavailable after initialization.");
      }

      const response = (await $fetch(`https://api.spotify.com/v1/${route}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `${freshType} ${freshToken}`,
          "Content-Type": "application/json",
        },
      })) as T;
      return response;
    } catch (err: any) {
      console.error(`Error in makeRequest for route ${route}:`, err);
      throw err;
    }
  };

  const getNewReleases = async () => {
    try {
      const data: NewReleaseResponse = await makeRequest<NewReleaseResponse>(
        "browse/new-releases",
        {
          method: "GET",
        }
      );
      return data.albums.items;
    } catch (error) {
      console.error("Error getting new albums:", error);
      return [];
    }
  };

  const getRecommendations = async (id: string): Promise<Collection<Track>> => {
    try {
      const data: TrackRecommendationResponse =
        await makeRequest<TrackRecommendationResponse>("recommendations", {
          method: "GET",
          params: {
            seed_tracks: id,
          },
        });
      return data.tracks;
    } catch (error) {
      console.error("Error getting new albums:", error);
      return {} as Collection<Track>;
    }
  };

  const getArtistAlbums = async (id: string) => {
    try {
      const data: Collection<Album> = await makeRequest<Collection<Album>>(
        "artists/" + id + "/albums",
        {
          method: "GET",
        }
      );
      return data;
    } catch (error) {
      console.error("Error getting new albums:", error);
      return {} as Collection<Album>;
    }
  };

  const getRelatedArtists = async (id: string) => {
    try {
      const data: RelatedArtistResponse =
        await makeRequest<RelatedArtistResponse>(
          "artists/" + id + "/related-artists",
          {
            method: "GET",
          }
        );
      return data.artists;
    } catch (error) {
      console.error("Error getting new albums:", error);
      return {} as Collection<Artist>;
    }
  };

  const getArtist = async (id: string) => {
    try {
      const data: Artist = await makeRequest<Artist>("artists/" + id, {
        method: "GET",
      });
      return data;
    } catch (error) {
      console.error("Error getting new albums:", error);
      return {} as Artist;
    }
  };

  const getAlbum = async (id: string) => {
    try {
      const data: Album = await makeRequest<Album>("albums/" + id, {
        method: "GET",
      });
      return data;
    } catch (error) {
      console.error("Error getting new albums:", error);
      return {} as Album;
    }
  };

  const getTrack = async (id: string) => {
    try {
      const data: Track = await makeRequest<Track>("tracks/" + id, {
        method: "GET",
      });
      return data;
    } catch (error) {
      console.error("Error getting new albums:", error);
      return {} as Track;
    }
  };

  const getSearchResults = async (query: string) => {
    try {
      const data: SearchResponse = await makeRequest<SearchResponse>("search", {
        method: "GET",
        params: {
          q: query,
          type: "album,artist,track",
          limit: 20,
        },
      });
      return data;
    } catch (error) {
      console.error("Error getting new albums:", error);
      return {} as SearchResponse;
    }
  };
  return {
    getNewReleases,
    getRecommendations,
    getArtistAlbums,
    getRelatedArtists,
    getArtist,
    getAlbum,
    getTrack,
    getSearchResults,
  };
};
