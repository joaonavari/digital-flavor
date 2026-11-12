/* Ícones SVG com traço, iguais aos dos mockups. Sempre decorativos (aria-hidden). */
import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { tamanho?: number; traco?: number };

function Icone({ tamanho = 24, traco = 1.8, children, ...resto }: Props) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={traco}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...resto}
    >
      {children}
    </svg>
  );
}

export const IconeCardapio = (p: Props) => (
  <Icone {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </Icone>
);

export const IconePedidos = (p: Props) => (
  <Icone {...p}>
    <path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2z" />
    <path d="M9 8.5h6M9 12.5h6" />
  </Icone>
);

export const IconePerfil = (p: Props) => (
  <Icone {...p}>
    <circle cx="12" cy="8.5" r="4" />
    <path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
  </Icone>
);

export const IconeProdutos = (p: Props) => (
  <Icone {...p}>
    <path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
    <path d="M3.5 7.5L12 12l8.5-4.5M12 12v9" />
  </Icone>
);

export const IconeVendas = (p: Props) => (
  <Icone {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Icone>
);

export const IconeUsuarios = (p: Props) => (
  <Icone {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.9-3.3 3.4-5 6.5-5s5.6 1.7 6.5 5" />
    <path d="M16 4.5a3.5 3.5 0 010 7M18.5 15.5c1.5.8 2.5 2.4 3 4.5" />
  </Icone>
);

export const IconeSair = (p: Props) => (
  <Icone {...p}>
    <path d="M14 4.5h3.5a2 2 0 012 2v11a2 2 0 01-2 2H14" />
    <path d="M10 8l-4 4 4 4M6 12h9" />
  </Icone>
);

/* Sacola do ícone do app. */
export const IconeApp = (p: Props) => (
  <Icone {...p}>
    <path d="M5 9.5h14l-1.3 9.2a2 2 0 01-2 1.8H8.3a2 2 0 01-2-1.8z" />
    <path d="M9 9.5V7.5a3 3 0 016 0v2" />
  </Icone>
);

export const IconeFolha = (p: Props) => (
  <Icone {...p}>
    <path d="M5 19c0-8 5-13 14-14 0 9-5 14-12 14" />
    <path d="M5 19l7-7" />
  </Icone>
);

export const IconeEstoque = (p: Props) => (
  <Icone {...p}>
    <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
    <path d="M4 8l8 4 8-4M12 12v8" />
  </Icone>
);

export const IconeCartao = (p: Props) => (
  <Icone {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M3 10h18M7 15h3" />
  </Icone>
);

export const IconeCheck = (p: Props) => (
  <Icone {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icone>
);
