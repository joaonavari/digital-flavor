import { NavLink } from "react-router";
import { IconeCardapio, IconePedidos, IconePerfil } from "./Icones";
import estilos from "./TabBar.module.css";

const ABAS = [
  { para: "/", rotulo: "Cardápio", Icone: IconeCardapio, fim: true },
  { para: "/pedidos", rotulo: "Pedidos", Icone: IconePedidos, fim: false },
  { para: "/perfil", rotulo: "Perfil", Icone: IconePerfil, fim: false },
];

export function TabBar() {
  return (
    <nav aria-label="Navegação principal" className={`${estilos.barra} material-bar`}>
      {ABAS.map(({ para, rotulo, Icone, fim }) => (
        <NavLink
          key={para}
          to={para}
          end={fim}
          className={({ isActive }) => `${estilos.item} pressable ${isActive ? estilos.ativo : ""}`}
        >
          <Icone tamanho={26} />
          {rotulo}
        </NavLink>
      ))}
    </nav>
  );
}
