import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { criarUsuario } from "../../api/usuarios";
import { ErroApi, mensagemDeErro } from "../../api/http";
import { AlertDialog } from "../../components/AlertDialog";
import { Button } from "../../components/Button";
import { CampoSenha } from "../../components/CampoSenha";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Sheet } from "../../components/Sheet";
import { GrupoCampos, TextField } from "../../components/TextField";
import { useFormulario } from "../../hooks/useFormulario";
import { notificar } from "../../lib/notificar";
import {
  LIMITES,
  mascararTelefone,
  validarEmail,
  validarNome,
  validarSenhaNova,
  validarTelefone,
} from "../../lib/validacao";
import type { DadosNovoUsuario, Usuario } from "../../types";
import estilos from "./Usuarios.module.css";

type TipoEquipe = DadosNovoUsuario["tipo"];

/** Limites dos campos extras por tipo (iguais ao banco). nivelAcesso é INT de 1 a 10. */
const LIMITES_EXTRAS = { matriculaFuncional: 20, turno: 20, setor: 60 } as const;
const NIVEL_MIN = 1;
const NIVEL_MAX = 10;

const TIPOS: Array<{ valor: TipoEquipe; rotulo: string }> = [
  { valor: "FUNCIONARIO", rotulo: "Funcionário" },
  { valor: "GERENTE", rotulo: "Gerente" },
  { valor: "ADMINISTRADOR", rotulo: "Admin" },
];

const DESCRICAO_TIPO: Record<TipoEquipe, string> = {
  FUNCIONARIO: "Vê a fila e avança os pedidos.",
  GERENTE: "Tudo do funcionário, mais produtos, estoque e vendas.",
  ADMINISTRADOR: "Acesso total, inclusive a gestão de usuários.",
};

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: (usuario: Usuario) => void;
}

/** Folha para criar funcionário, gerente ou administrador. */
export function FolhaUsuario({ aberto, aoFechar, aoCriar }: Props) {
  const idFormulario = useId();
  const [enviando, setEnviando] = useState(false);
  const [descartar, setDescartar] = useState(false);
  const sujoRef = useRef(false);

  return (
    <>
      <Sheet
        aberto={aberto}
        aoFechar={() => (sujoRef.current ? setDescartar(true) : aoFechar())}
        titulo="Novo usuário"
        larguraLateral={460}
        rodape={
          <Button type="submit" form={idFormulario} tamanho="grande" larguraTotal carregando={enviando}>
            Criar usuário
          </Button>
        }
      >
        <Formulario
          id={idFormulario}
          enviando={enviando}
          setEnviando={setEnviando}
          aoMudarSujo={(s) => {
            sujoRef.current = s;
          }}
          aoCriar={(u) => {
            sujoRef.current = false;
            aoCriar(u);
          }}
        />
      </Sheet>
      <AlertDialog
        aberto={descartar}
        titulo="Descartar o novo usuário?"
        mensagem="Os dados digitados ainda não foram salvos."
        rotuloConfirmar="Descartar"
        rotuloVoltar="Continuar"
        destrutivo
        aoConfirmar={() => {
          setDescartar(false);
          sujoRef.current = false;
          aoFechar();
        }}
        aoFechar={() => setDescartar(false)}
      />
    </>
  );
}

function Formulario({
  id,
  enviando,
  setEnviando,
  aoMudarSujo,
  aoCriar,
}: {
  id: string;
  enviando: boolean;
  setEnviando: (v: boolean) => void;
  aoMudarSujo: (sujo: boolean) => void;
  aoCriar: (usuario: Usuario) => void;
}) {
  const formulario = useRef<HTMLFormElement>(null);
  const [tipo, setTipo] = useState<TipoEquipe>("FUNCIONARIO");
  const { valores, campo, validarTudo, sujo } = useFormulario(
    { nome: "", email: "", senha: "", telefone: "", matriculaFuncional: "", turno: "", setor: "", nivelAcesso: String(NIVEL_MIN) },
    {
      nome: validarNome,
      email: validarEmail,
      senha: validarSenhaNova,
      telefone: validarTelefone,
      // Só é obrigatória quando o tipo é funcionário.
      matriculaFuncional: (v) => (tipo === "FUNCIONARIO" && !v.trim() ? "Informe a matrícula funcional." : null),
      nivelAcesso: (v) => {
        if (tipo !== "ADMINISTRADOR") return null;
        const n = Number(v);
        return /^\d+$/.test(v) && n >= NIVEL_MIN && n <= NIVEL_MAX
          ? null
          : `Use um número inteiro de ${NIVEL_MIN} a ${NIVEL_MAX}.`;
      },
    },
    { telefone: mascararTelefone, nivelAcesso: (v) => v.replace(/\D/g, "").slice(0, 2) },
  );
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  useEffect(() => {
    aoMudarSujo(sujo);
  }, [sujo, aoMudarSujo]);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (enviando) return;
    setErroGeral(null);
    const invalido = validarTudo();
    if (invalido) {
      formulario.current?.querySelector<HTMLElement>(`[name="${invalido}"]`)?.focus();
      return;
    }
    const opcional = (v: string) => (v.trim() ? v.trim() : undefined);
    const telefone = valores.telefone.replace(/\D/g, "");
    const base = {
      nome: valores.nome.trim(),
      email: valores.email.trim(),
      senha: valores.senha,
      ...(telefone ? { telefone } : {}),
    };
    // Envia só os campos extras do tipo escolhido.
    const dados: DadosNovoUsuario =
      tipo === "FUNCIONARIO"
        ? { ...base, tipo, matriculaFuncional: valores.matriculaFuncional.trim(), turno: opcional(valores.turno) }
        : tipo === "GERENTE"
          ? { ...base, tipo, setor: opcional(valores.setor) }
          : { ...base, tipo, nivelAcesso: Number(valores.nivelAcesso) }; // número no JSON, não texto

    setEnviando(true);
    try {
      const criado = await criarUsuario(dados);
      setEnviando(false);
      aoCriar(criado);
    } catch (erro) {
      setEnviando(false);
      if (erro instanceof ErroApi && erro.ehErroDeRede) notificar.erro(erro, "Sem conexão");
      else setErroGeral(mensagemDeErro(erro));
    }
  }

  return (
    <form ref={formulario} id={id} className={estilos.formulario} onSubmit={enviar} noValidate aria-busy={enviando}>
      <div className={estilos.secao}>
        <span className="section-label">Tipo de conta</span>
        <SegmentedControl rotulo="Tipo de conta" tamanho="grande" opcoes={TIPOS} valor={tipo} aoMudar={setTipo} />
        <p className={estilos.dica}>{DESCRICAO_TIPO[tipo]}</p>
      </div>

      <div className={estilos.secao}>
        <span className="section-label">Dados</span>
        <GrupoCampos>
          <TextField agrupado rotulo="Nome completo" autoComplete="off" maxLength={LIMITES.nome} {...campo("nome")} />
          <TextField
            agrupado
            rotulo="E-mail"
            type="email"
            inputMode="email"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={LIMITES.email}
            {...campo("email")}
          />
          <TextField
            agrupado
            rotulo="Telefone (opcional)"
            type="tel"
            inputMode="tel"
            placeholder="(44) 99999-8888"
            maxLength={LIMITES.telefone}
            {...campo("telefone")}
          />
        </GrupoCampos>
      </div>

      {tipo === "FUNCIONARIO" && (
        <GrupoCampos>
          <TextField
            agrupado
            rotulo="Matrícula funcional"
            autoComplete="off"
            maxLength={LIMITES_EXTRAS.matriculaFuncional}
            {...campo("matriculaFuncional")}
          />
          <TextField
            agrupado
            rotulo="Turno (opcional)"
            placeholder="Manhã, Tarde ou Noite"
            list="turnos-sugeridos"
            autoComplete="off"
            maxLength={LIMITES_EXTRAS.turno}
            {...campo("turno")}
          />
          <datalist id="turnos-sugeridos">
            <option value="Manhã" />
            <option value="Tarde" />
            <option value="Noite" />
          </datalist>
        </GrupoCampos>
      )}
      {tipo === "GERENTE" && (
        <TextField rotulo="Setor (opcional)" autoComplete="off" maxLength={LIMITES_EXTRAS.setor} {...campo("setor")} />
      )}
      {tipo === "ADMINISTRADOR" && (
        <TextField
          rotulo="Nível de acesso"
          type="number"
          inputMode="numeric"
          min={NIVEL_MIN}
          max={NIVEL_MAX}
          step={1}
          dica={`Número de ${NIVEL_MIN} a ${NIVEL_MAX} (padrão ${NIVEL_MIN}).`}
          {...campo("nivelAcesso")}
        />
      )}

      <div className={estilos.secao}>
        <span className="section-label">Acesso</span>
        <CampoSenha
          rotulo="Senha inicial"
          autoComplete="new-password"
          placeholder={`Pelo menos ${LIMITES.senhaMin} caracteres`}
          maxLength={LIMITES.senhaMax}
          dica="Passe para a pessoa; ela entra com o e-mail e esta senha."
          {...campo("senha")}
        />
      </div>

      {erroGeral && (
        <p className={estilos.alerta} role="alert">
          {erroGeral}
        </p>
      )}
    </form>
  );
}
