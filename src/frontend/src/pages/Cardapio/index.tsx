import { EmConstrucao } from "../../components/EmConstrucao";
import { useAuth } from "../../contexts/useAuth";

export function Cardapio() {
  const { estado } = useAuth();
  const primeiroNome = estado.usuario?.nome.split(" ")[0];
  return <EmConstrucao titulo="Cardápio" etapa={4} saudacao={primeiroNome ? `Olá, ${primeiroNome}` : undefined} />;
}
