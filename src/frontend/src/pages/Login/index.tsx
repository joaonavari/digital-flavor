import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { ErroApi, mensagemDeErro, USA_MOCK } from "../../api/http";
import { Button } from "../../components/Button";
import { CampoSenha } from "../../components/CampoSenha";
import { GrupoCampos, TextField } from "../../components/TextField";
import { useAuth } from "../../contexts/useAuth";
import { useFormulario } from "../../hooks/useFormulario";
import { LayoutAcesso } from "../../layouts/LayoutAcesso";
import { notificar } from "../../lib/notificar";
import { LIMITES, validarEmail, validarSenhaLogin } from "../../lib/validacao";
import estilos from "./Login.module.css";

export function Login() {
  const { entrar } = useAuth();
  const formulario = useRef<HTMLFormElement>(null);
  const { valores, campo, validarTudo } = useFormulario(
    { email: "", senha: "" },
    { email: validarEmail, senha: validarSenhaLogin },
  );
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErroGeral(null);
    const invalido = validarTudo();
    if (invalido) {
      formulario.current?.querySelector<HTMLInputElement>(`[name="${invalido}"]`)?.focus();
      return;
    }
    setEnviando(true);
    try {
      // Depois do login, a rota pública leva para a tela certa do perfil.
      await entrar(valores.email, valores.senha);
    } catch (erro) {
      setEnviando(false);
      if (erro instanceof ErroApi && erro.ehErroDeRede) notificar.erro(erro, "Sem conexão");
      else setErroGeral(mensagemDeErro(erro));
    }
  }

  return (
    <LayoutAcesso
      variante="entrar"
      titulo="Entrar"
      subtitulo="Use o e-mail cadastrado na cantina."
      rodape={
        USA_MOCK && (
          <p className={estilos.dica}>
            <strong>Modo de exemplo</strong> · senha 123456 para aluno@escola.com, funcionario@escola.com, gerente@escola.com e admin@escola.com
          </p>
        )
      }
    >
      <form ref={formulario} className={estilos.formulario} onSubmit={enviar} noValidate>
        <GrupoCampos>
          <TextField
            agrupado
            rotulo="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="voce@escola.com"
            maxLength={LIMITES.email}
            {...campo("email")}
          />
          <CampoSenha
            agrupado
            rotulo="Senha"
            autoComplete="current-password"
            placeholder="Sua senha"
            maxLength={LIMITES.senhaMax}
            {...campo("senha")}
          />
        </GrupoCampos>

        {erroGeral && (
          <p className={estilos.alerta} role="alert">
            {erroGeral}
          </p>
        )}

        <Button type="submit" tamanho="grande" larguraTotal carregando={enviando}>
          Entrar
        </Button>
      </form>

      <p className={estilos.rodape}>
        Primeira vez aqui? <Link to="/cadastro">Criar conta</Link>
      </p>

    </LayoutAcesso>
  );
}
