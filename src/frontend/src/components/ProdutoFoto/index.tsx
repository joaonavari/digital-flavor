import { useState } from "react";
import { inicial } from "../../lib/texto";
import estilos from "./ProdutoFoto.module.css";

interface Props {
  nome: string;
  imagemUrl: string | null;
  tamanho?: "grande" | "pequena";
}

/** Foto do produto; sem foto (ou se a imagem falhar), mostra a inicial num quadrado azul-claro. */
export function ProdutoFoto({ nome, imagemUrl, tamanho = "grande" }: Props) {
  const [falhou, setFalhou] = useState<string | null>(null);
  const mostrarFoto = Boolean(imagemUrl) && falhou !== imagemUrl;

  return (
    <div className={`${estilos.foto} ${estilos[tamanho]}`} aria-hidden="true">
      {mostrarFoto && imagemUrl ? (
        <img src={imagemUrl} alt="" loading="lazy" decoding="async" onError={() => setFalhou(imagemUrl)} />
      ) : (
        inicial(nome)
      )}
    </div>
  );
}
