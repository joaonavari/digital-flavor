import { useMediaQuery } from "./useMediaQuery";

/** A parte do aluno vira layout de computador a partir de 900px (mesmo valor dos CSS). */
export const useComputador = () => useMediaQuery("(min-width: 900px)");

/** Meus pedidos mostra lista + detalhe a partir de 1100px. */
export const useTelaLarga = () => useMediaQuery("(min-width: 1100px)");
