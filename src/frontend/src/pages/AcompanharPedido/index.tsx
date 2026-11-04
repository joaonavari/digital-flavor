import { useParams } from "react-router";
import { EmConstrucao } from "../../components/EmConstrucao";

export function AcompanharPedido() {
  const { id } = useParams();
  return <EmConstrucao titulo={`Pedido #${id ?? ""}`} etapa={5} />;
}
