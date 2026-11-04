import { useAuth } from "../../contexts/useAuth";
import { NOME_PERFIL } from "../../lib/perfis";
import { inicial } from "../../lib/texto";
import { mascararTelefone } from "../../lib/validacao";
import estilos from "./Perfil.module.css";

export function Perfil() {
  const { estado, sair } = useAuth();
  const usuario = estado.usuario;
  if (!usuario) return null;

  return (
    <>
      <header className={estilos.cabecalho}>
        <h1 className={estilos.titulo}>Perfil</h1>
      </header>
      <div className={estilos.corpo}>
        <div className={estilos.cartao}>
          <div className={estilos.avatar} aria-hidden="true">
            {inicial(usuario.nome)}
          </div>
          <div className={estilos.identidade}>
            <span className={estilos.nome}>{usuario.nome}</span>
            <span className={estilos.email}>{usuario.email}</span>
          </div>
        </div>

        <dl className={estilos.grupo}>
          {usuario.matricula && (
            <div className={estilos.linha}>
              <dt>Matrícula</dt>
              <dd>{usuario.matricula}</dd>
            </div>
          )}
          {usuario.turma && (
            <div className={estilos.linha}>
              <dt>Turma</dt>
              <dd>{usuario.turma}</dd>
            </div>
          )}
          {usuario.telefone && (
            <div className={estilos.linha}>
              <dt>Telefone</dt>
              <dd>{mascararTelefone(usuario.telefone)}</dd>
            </div>
          )}
          <div className={estilos.linha}>
            <dt>Conta</dt>
            <dd>{NOME_PERFIL[usuario.tipo]}</dd>
          </div>
        </dl>

        <button type="button" className={estilos.sair} onClick={sair}>
          Sair
        </button>
      </div>
    </>
  );
}
