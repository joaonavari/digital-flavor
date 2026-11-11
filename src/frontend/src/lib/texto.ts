const segmentador =
  typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter("pt-BR", { granularity: "grapheme" }) : null;

/** Primeira letra visível do nome (respeita acentos e emoji): "água" → "Á". */
export function inicial(nome: string): string {
  const limpo = nome.trim();
  if (!limpo) return "?";
  const primeiro = segmentador ? segmentador.segment(limpo)[Symbol.iterator]().next().value?.segment : limpo[0];
  return (primeiro ?? "?").toLocaleUpperCase("pt-BR");
}

/** "1 item", "2 itens". */
export function plural(quantidade: number, singular: string, pluralTexto: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`;
}
