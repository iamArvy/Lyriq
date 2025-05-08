import { TokenResponse } from "~/types";

// server/api/spotify/token.ts
export default defineEventHandler(async () => {
  const { spotifyId: id, spotifySecret: secret } = useRuntimeConfig();
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const body = new URLSearchParams({ grant_type: "client_credentials" });

  const res: TokenResponse = await $fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    }
  );
  return res;
});
