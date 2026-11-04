import { EmConstrucao } from "../../components/EmConstrucao";
import { useAuth } from "../../contexts/useAuth";
import estilos from "./Perfil.module.css";

export function Perfil() {
  const { sair } = useAuth();
  return (
    <EmConstrucao titulo="Perfil" etapa={5}>
      <div className={estilos.grupo}>
        <button type="button" className={`${estilos.sair} pressable`} onClick={sair}>
          Sair
        </button>
      </div>
    </EmConstrucao>
  );
}
