import api from "./client";

export async function registerPlayer(data: {
  username: string;
  email: string;
  password: string;
  race: string;
}) {
  const res = await api.post("/players", data);
  return res.data as { id: string };
}

export async function loginPlayer(data: { username: string; password: string }) {
  const res = await api.post("/players/login", data);
  return res.data as { token: string };
}
