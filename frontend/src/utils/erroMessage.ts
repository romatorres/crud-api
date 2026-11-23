export function messageError(e: unknown): string {
    if(e instanceof TypeError){
        return "Não foi possível conectar ao servidor. Verifique sua conexão ou tente mais tarde.";
  }if(e instanceof Error){
    return e.message
  }
  return "Erro inesperado. Tente novamente.";
    }
