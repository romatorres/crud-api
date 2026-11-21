import type { Pessoa, ErroApi } from "../types/pessoas";

const API = import.meta.env.VITE_API_URL;

export async function getPessoas(): Promise<Pessoa[]> {
  const response = await fetch(`${API}/pessoas`);

  if (!response.ok) {
    throw new Error(`Error http ${response.status}`);
  }

  const dados: Pessoa[] = await response.json();

  return dados;
}

export async function createPessoa(
  pessoa: Omit<Pessoa, "id">,
): Promise<Pessoa> {
  const response = await fetch(`${API}/pessoas`, {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(pessoa),
  });

  if (!response.ok) {
    const erro: ErroApi = await response.json();
    throw new Error(erro.erro ?? `Erro HTTP ${response.status}`);
  }

  const dados: Pessoa = await response.json();

  return dados;
}
