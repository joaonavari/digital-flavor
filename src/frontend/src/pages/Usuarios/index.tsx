import { useMemo, useState } from "react";
import { mensagemDeErro } from "../../api/http";
import { alterarUsuarioAtivo, listarUsuarios } from "../../api/usuarios";
import { Button } from "../../components/Button";
import { CampoBusca } from "../../components/CampoBusca";
import { EmptyState, EstadoErro } from "../../components/EmptyState";
import { IconeUsuarios } from "../../components/Icones";
import { Selo } from "../../components/SeloStatus";
import { Carregando, Skeleton } from "../../components/Skeleton";
import { Switch } from "../../components/Switch";
import { useAuth } from "../../contexts/useAuth";
import { useRecurso } from "../../hooks/useRecurso";
import { notificar } from "../../lib/notificar";
import { NOME_PERFIL } from "../../lib/perfis";
import { normalizar } from "../../lib/produto";
import { inicial, plural } from "../../lib/texto";
import type { TipoUsuario, Usuario } from "../../types";
import { FolhaUsuario } from "./FormularioUsuario";
import estilos from "./Usuarios.module.css";

/** Equipe primeiro (quem administra a cantina), alunos depois. */
const ORDEM: Record<TipoUsuario, number> = { ADMINISTRADOR: 0, GERENTE: 1, FUNCIONARIO: 2, ALUNO: 3 };
const COR: Record<TipoUsuario, "azul" | "verde" | "laranja" | "neutro"> = {
  ADMINISTRADOR: "azul",
  GERENTE: "verde",
  FUNCIONARIO: "laranja",
  ALUNO: "neutro",
};

export function Usuarios() {
  const { estado } = useAuth();
  const meuId = estado.usuario?.id;
  const { dados, setDados, erro, carregando, tentandoDeNovo, tentarDeNovo } = useRecurso(listarUsuarios);
  const [busca, setBusca] = useState("");
  const [folhaAberta, setFolhaAberta] = useState(false);

  const usuarios = useMemo(
    () =>
      [...(dados ?? [])].sort((a, b) => ORDEM[a.tipo] - ORDEM[b.tipo] || a.nome.localeCompare(b.nome, "pt-BR")),
    [dados],
  );
  const termo = normalizar(busca.trim());
  const visiveis = termo ? usuarios.filter((u) => normalizar(`${u.nome} ${u.email}`).includes(termo)) : usuarios;
  const equipe = usuarios.filter((u) => u.tipo !== "ALUNO").length;
  const inativos = usuarios.filter((u) => !u.ativo).length;

  function substituir(usuario: Usuario) {
    setDados((lista) => (lista ?? []).map((u) => (u.id === usuario.id ? usuario : u)));
  }

  async function alternar(usuario: Usuario, ativo: boolean) {
    substituir({ ...usuario, ativo }); // otimista
    try {
      substituir(await alterarUsuarioAtivo(usuario.id, ativo));
    } catch (e) {
      substituir(usuario);
      notificar.erro(e, `Não deu para ${ativo ? "ativar" : "desativar"} ${usuario.nome}`);
    }
  }

  return (
    <>
      <div className={estilos.topo}>
        <header className={estilos.cabecalho}>
          <h1 className={estilos.titulo}>Usuários</h1>
          {dados && (
            <p className={estilos.resumo}>
              {plural(usuarios.length, "usuário", "usuários")} · {equipe} na equipe da cantina
              {inativos > 0 && ` · ${plural(inativos, "desativado", "desativados")}`}
            </p>
          )}
        </header>
        <div className={estilos.ferramentas}>
          <CampoBusca className={estilos.busca} rotulo="Buscar usuário" valor={busca} aoMudar={setBusca} />
          <Button tamanho="pequeno" onClick={() => setFolhaAberta(true)}>
            Novo usuário
          </Button>
        </div>
      </div>

      {carregando ? (
        <Carregando rotulo="Carregando usuários…">
          <div className={estilos.estado} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Skeleton largura={40} altura={40} raio={999} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <Skeleton largura={`${36 - i * 4}%`} altura={15} />
                  <Skeleton largura="50%" altura={13} />
                </div>
              </div>
            ))}
          </div>
        </Carregando>
      ) : erro && !dados ? (
        <div className={estilos.estado}>
          <EstadoErro mensagem={mensagemDeErro(erro)} aoTentarDeNovo={tentarDeNovo} tentando={tentandoDeNovo} />
        </div>
      ) : visiveis.length === 0 ? (
        <div className={estilos.estado}>
          {busca ? (
            <EmptyState
              titulo={`Ninguém encontrado para “${busca.trim()}”`}
              acao={{ rotulo: "Limpar busca", aoClicar: () => setBusca("") }}
            />
          ) : (
            <EmptyState icone={<IconeUsuarios tamanho={26} />} titulo="Nenhum usuário ainda" />
          )}
        </div>
      ) : (
        <ul className={estilos.lista} aria-label="Usuários">
          {visiveis.map((u) => {
            const souEu = u.id === meuId;
            return (
              <li key={u.id} className={`${estilos.linha} ${u.ativo ? "" : estilos.inativo}`}>
                <span className={estilos.avatar} aria-hidden="true">
                  {inicial(u.nome)}
                </span>
                <span className={estilos.texto}>
                  <span className={estilos.nome}>
                    {u.nome}
                    {!u.ativo && <Selo cor="vermelho">Desativado</Selo>}
                  </span>
                  <span className={estilos.email} title={u.email}>
                    {u.email}
                  </span>
                </span>
                <span className={estilos.direita}>
                  <Selo cor={COR[u.tipo]}>{NOME_PERFIL[u.tipo]}</Selo>
                  {souEu ? (
                    <span className={estilos.voce}>Você</span>
                  ) : (
                    <Switch
                      ligado={u.ativo}
                      rotulo={`Conta de ${u.nome} ativa`}
                      aoMudar={(v) => void alternar(u, v)}
                    />
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <FolhaUsuario
        aberto={folhaAberta}
        aoFechar={() => setFolhaAberta(false)}
        aoCriar={(novo) => {
          setDados((lista) => [...(lista ?? []), novo]);
          setFolhaAberta(false);
          notificar.sucesso("Usuário criado", `${novo.nome} já pode entrar.`);
        }}
      />
    </>
  );
}
