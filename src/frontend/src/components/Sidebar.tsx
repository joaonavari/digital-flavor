import { NavLink } from "react-router";
import { useAuth } from "../contexts/useAuth";
import { NOME_PERFIL, PERFIS_ADMIN, PERFIS_CANTINA, PERFIS_GESTAO } from "../lib/perfis";
import type { TipoUsuario } from "../types";
import { IconePedidos, IconeProdutos, IconeSair, IconeUsuarios, IconeVendas } from "./Icones";
import estilos from "./Sidebar.module.css";

const ITENS = [
  { para: "/cantina/fila", rotulo: "Fila de pedidos", Icone: IconePedidos, perfis: PERFIS_CANTINA },
  { para: "/cantina/produtos", rotulo: "Produtos e estoque", Icone: IconeProdutos, perfis: PERFIS_GESTAO },
  { para: "/cantina/vendas", rotulo: "Vendas", Icone: IconeVendas, perfis: PERFIS_GESTAO },
  { para: "/cantina/usuarios", rotulo: "Usuários", Icone: IconeUsuarios, perfis: PERFIS_ADMIN },
];

export function Sidebar({ tipo }: { tipo: TipoUsuario }) {
  const { sair } = useAuth();
  const itens = ITENS.filter((item) => item.perfis.includes(tipo));

  return (
    <aside className={estilos.sidebar}>
      <div className={estilos.marca}>
        <span className={estilos.nomeApp}>Digital Flavor</span>
        <span className={estilos.perfil}>Cantina · {NOME_PERFIL[tipo]}</span>
      </div>

      <nav aria-label="Painel da cantina" className={estilos.navegacao}>
        <ul className={estilos.lista}>
          {itens.map(({ para, rotulo, Icone }) => (
            <li key={para}>
              <NavLink
                to={para}
                className={({ isActive }) => `${estilos.item} pressable ${isActive ? estilos.ativo : ""}`}
              >
                <Icone tamanho={18} traco={2} />
                {rotulo}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={estilos.rodape}>
        <button type="button" className={`${estilos.sair} pressable`} onClick={sair}>
          <IconeSair tamanho={18} traco={2} />
          Sair
        </button>
      </div>
    </aside>
  );
}
