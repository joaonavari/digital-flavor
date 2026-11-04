import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { mensagemDeErro, USA_MOCK } from "../../api/http";
import { useAuth } from "../../contexts/useAuth";
import { rotaInicial } from "../../lib/perfis";
import estilos from "./Login.module.css";

/* Versão básica para testar as rotas. Na etapa 3 ganha os componentes e a validação completa. */
export function Login() {
  const { entrar } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const usuario = await entrar(email, senha);
      const de = (local.state as { de?: string } | null)?.de;
      // Volta para onde a pessoa tentou ir; se o perfil não puder, a rota protegida redireciona.
      navegar(de ?? rotaInicial(usuario.tipo), { replace: true });
    } catch (e) {
      setErro(mensagemDeErro(e));
      setEnviando(false);
    }
  }

  return (
    <main className={estilos.tela}>
      <header className={estilos.cabecalho}>
        <h1 className={estilos.titulo}>Entrar</h1>
        <p className={estilos.subtitulo}>Peça na cantina sem pegar fila.</p>
      </header>

      <form className={estilos.formulario} onSubmit={enviar} noValidate>
        <div className={estilos.grupo}>
          <label className={estilos.campo}>
            <span className={estilos.rotulo}>E-mail</span>
            <input
              className={estilos.entrada}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="voce@escola.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className={estilos.campo}>
            <span className={estilos.rotulo}>Senha</span>
            <input
              className={estilos.entrada}
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </label>
        </div>

        {erro && (
          <p className={estilos.erro} role="alert">
            {erro}
          </p>
        )}

        <button type="submit" className={`${estilos.botao} pressable`} disabled={enviando || !email || !senha}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className={estilos.rodape}>
        Não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>

      {USA_MOCK && (
        <p className={estilos.dica}>
          Modo de exemplo (sem back-end). Senha 123456 para todos: aluno@escola.com, funcionario@escola.com,
          gerente@escola.com, admin@escola.com.
        </p>
      )}
    </main>
  );
}
