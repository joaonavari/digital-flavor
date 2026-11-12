import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { cadastrar } from "../../api/auth";
import { ErroApi, mensagemDeErro } from "../../api/http";
import { Button } from "../../components/Button";
import { CampoSenha } from "../../components/CampoSenha";
import { GrupoCampos, TextField } from "../../components/TextField";
import { useAuth } from "../../contexts/useAuth";
import { useFormulario } from "../../hooks/useFormulario";
import { LayoutAcesso } from "../../layouts/LayoutAcesso";
import { notificar } from "../../lib/notificar";
import {
  LIMITES,
  mascararTelefone,
  validarEmail,
  validarMatricula,
  validarNome,
  validarSenhaNova,
  validarTelefone,
} from "../../lib/validacao";
import estilos from "../Login/Login.module.css";

export function Cadastro() {
  const { iniciarSessao } = useAuth();
  const formulario = useRef<HTMLFormElement>(null);
  const { valores, campo, validarTudo } = useFormulario(
    { nome: "", matricula: "", turma: "", telefone: "", email: "", senha: "" },
    {
      nome: validarNome,
      matricula: validarMatricula,
      telefone: validarTelefone,
      email: validarEmail,
      senha: validarSenhaNova,
    },
    { telefone: mascararTelefone },
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
      const telefone = valores.telefone.replace(/\D/g, "");
      const resposta = await cadastrar({
        nome: valores.nome.trim(),
        email: valores.email.trim(),
        senha: valores.senha,
        matricula: valores.matricula.trim(),
        ...(valores.turma.trim() ? { turma: valores.turma.trim() } : {}),
        ...(telefone ? { telefone } : {}),
      });
      // O cadastro já devolve { token, usuario }: entra direto e a rota pública leva para o cardápio.
      iniciarSessao(resposta);
      notificar.sucesso("Conta criada", "Tudo pronto para o seu primeiro pedido.");
    } catch (erro) {
      setEnviando(false);
      if (erro instanceof ErroApi && erro.ehErroDeRede) notificar.erro(erro, "Sem conexão");
      else setErroGeral(mensagemDeErro(erro));
    }
  }

  return (
    <LayoutAcesso variante="cadastro" titulo="Criar conta" subtitulo="Use os dados da sua matrícula na escola.">
      <form ref={formulario} className={estilos.formulario} onSubmit={enviar} noValidate>
        <div className={estilos.secao}>
          <span className="section-label">Seus dados</span>
          <GrupoCampos>
            <TextField
              agrupado
              rotulo="Nome completo"
              autoComplete="name"
              autoCapitalize="words"
              placeholder="Maria Souza"
              maxLength={LIMITES.nome}
              {...campo("nome")}
            />
            <TextField
              agrupado
              rotulo="Matrícula"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="2025001"
              maxLength={LIMITES.matricula}
              {...campo("matricula")}
            />
            <TextField
              agrupado
              rotulo="Turma (opcional)"
              autoComplete="off"
              placeholder="3º A"
              maxLength={LIMITES.turma}
              {...campo("turma")}
            />
            <TextField
              agrupado
              rotulo="Telefone (opcional)"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(44) 99999-8888"
              maxLength={LIMITES.telefone}
              {...campo("telefone")}
            />
          </GrupoCampos>
        </div>

        <div className={estilos.secao}>
          <span className="section-label">Acesso</span>
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
              autoComplete="new-password"
              placeholder={`Pelo menos ${LIMITES.senhaMin} caracteres`}
              maxLength={LIMITES.senhaMax}
              {...campo("senha")}
            />
          </GrupoCampos>
        </div>

        {erroGeral && (
          <p className={estilos.alerta} role="alert">
            {erroGeral}
          </p>
        )}

        <Button type="submit" tamanho="grande" larguraTotal carregando={enviando}>
          Criar conta
        </Button>
      </form>

      <p className={estilos.rodape}>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </LayoutAcesso>
  );
}
