import { useAuth } from "../../contexts/useAuth";
import { NOME_PERFIL } from "../../lib/perfis";
import { inicial } from "../../lib/texto";
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

        {/* Matrícula: o /api/auth/me do contrato não devolve esse campo (combinar com o back). */}
        <dl className={estilos.grupo}>
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
