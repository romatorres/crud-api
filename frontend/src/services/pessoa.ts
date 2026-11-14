import type { Pessoa } from "../types/pessoas";

const API = import.meta.env.VITE_API_URL;

export async function getPessoas(): Promise<Pessoa[]> {
  const response = await fetch(`${API}/pessoas`);

  return response.json();
}

getPessoas();

/* https://chatgpt.com/share/6af86d05-7240-83e8-9604-04dcb0e234fb */
