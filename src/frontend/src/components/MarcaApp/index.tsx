import { IconeApp } from "../Icones";
import estilos from "./MarcaApp.module.css";

/** Tamanhos do ícone do app: [lado, raio, ícone]. */
const TAMANHOS = {
  76: [76, 22, 40],
  56: [56, 16, 30],
  32: [32, 9, 18],
} as const;

/** Ícone do app (sacola branca no quadrado azul). Sempre decorativo. */
export function IconeDoApp({ tamanho = 32, sombra = false }: { tamanho?: keyof typeof TAMANHOS; sombra?: boolean }) {
  const [lado, raio, icone] = TAMANHOS[tamanho];
  return (
    <span
      className={`${estilos.icone} ${sombra ? estilos.sombra : ""}`}
      style={{ width: lado, height: lado, borderRadius: raio }}
      aria-hidden="true"
    >
      <IconeApp tamanho={icone} traco={tamanho === 32 ? 2 : 1.8} />
    </span>
  );
}
