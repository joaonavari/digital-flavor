import { useRef } from "react";
import estilos from "./CampoBusca.module.css";

interface Props {
  valor: string;
  aoMudar: (valor: string) => void;
  rotulo: string;
  className?: string;
}

/** Busca em pílula. Esc limpa. */
export function CampoBusca({ valor, aoMudar, rotulo, className }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  return (
    <label className={`${estilos.campo} ${className ?? ""}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" />
        <path d="M20 20l-4-4" />
      </svg>
      <span className="sr-only">{rotulo}</span>
      <input
        ref={entrada}
        type="search"
        className={estilos.entrada}
        placeholder={rotulo}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && valor) {
            e.preventDefault();
            aoMudar("");
          }
        }}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
      />
      {valor && (
        <button
          type="button"
          className={estilos.limpar}
          aria-label="Limpar busca"
          onClick={() => {
            aoMudar("");
            entrada.current?.focus();
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </label>
  );
}
