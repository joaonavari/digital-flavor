import { useContext } from "react";
import { AuthContexto, type ValorAuth } from "./authContexto";

export function useAuth(): ValorAuth {
  const valor = useContext(AuthContexto);
  if (!valor) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return valor;
}
