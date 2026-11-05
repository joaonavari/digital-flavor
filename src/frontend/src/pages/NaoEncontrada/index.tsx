import { Link } from "react-router";
import estilos from "./NaoEncontrada.module.css";

export function NaoEncontrada() {
  return (
    <main className={estilos.tela}>
      <h1 className={estilos.titulo}>Página não encontrada</h1>
      <p className={estilos.texto}>O endereço pode ter mudado ou não existe.</p>
      <Link to="/" className={`${estilos.link} pressable`}>
        Voltar ao início
      </Link>
    </main>
  );
}
