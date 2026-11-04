import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { buscarUsuarioLogado, entrar as entrarApi } from "../api/auth";
import { ErroApi, definirAoNaoAutorizado, lerToken, salvarToken } from "../api/http";
import type { UsuarioLogado } from "../types";
import { AuthContexto, type EstadoAuth, type ValorAuth } from "./authContexto";

const CHAVE_USUARIO = "df.usuario";

function lerUsuarioSalvo(): UsuarioLogado | null {
  try {
    const salvo = localStorage.getItem(CHAVE_USUARIO);
    return salvo ? (JSON.parse(salvo) as UsuarioLogado) : null;
  } catch {
    return null;
  }
}

function salvarUsuario(usuario: UsuarioLogado | null): void {
  try {
    if (usuario) localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
    else localStorage.removeItem(CHAVE_USUARIO);
  } catch {
    /* sem armazenamento */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAuth>(() =>
    lerToken() ? { status: "carregando", usuario: null } : { status: "anonimo", usuario: null },
  );

  const sair = useCallback(() => {
    salvarToken(null);
    salvarUsuario(null);
    setEstado({ status: "anonimo", usuario: null });
  }, []);

  // Resposta 401 em qualquer chamada: limpa a sessão. As rotas protegidas levam para /login.
  useEffect(() => {
    definirAoNaoAutorizado(sair);
  }, [sair]);

  // Ao abrir o app com um token salvo, confirma quem é o usuário.
  useEffect(() => {
    if (!lerToken()) return;
    let ativo = true;
    buscarUsuarioLogado()
      .then((usuario) => {
        if (!ativo) return;
        salvarUsuario(usuario);
        setEstado({ status: "autenticado", usuario });
      })
      .catch((erro: unknown) => {
        if (!ativo) return;
        // Sem rede: usa o último usuário conhecido para não derrubar a sessão.
        const salvo = lerUsuarioSalvo();
        if (erro instanceof ErroApi && erro.ehErroDeRede && salvo) {
          setEstado({ status: "autenticado", usuario: salvo });
        } else {
          sair();
        }
      });
    return () => {
      ativo = false;
    };
  }, [sair]);

  const entrar = useCallback(async (email: string, senha: string) => {
    const { token, usuario } = await entrarApi({ email: email.trim(), senha });
    salvarToken(token);
    salvarUsuario(usuario);
    setEstado({ status: "autenticado", usuario });
    // O login devolve o básico; /me completa com telefone, matrícula e turma (sem travar a entrada).
    buscarUsuarioLogado()
      .then((completo) => {
        salvarUsuario(completo);
        setEstado((atual) =>
          atual.status === "autenticado" && atual.usuario.id === completo.id
            ? { status: "autenticado", usuario: completo }
            : atual,
        );
      })
      .catch(() => undefined);
    return usuario;
  }, []);

  const valor = useMemo<ValorAuth>(() => ({ estado, entrar, sair }), [estado, entrar, sair]);

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
}
