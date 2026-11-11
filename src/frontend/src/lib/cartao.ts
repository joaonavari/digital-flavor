/** Só os dígitos do número do cartão. */
export const digitosCartao = (valor: string) => valor.replace(/\D/g, "").slice(0, 19);

/** Agrupa de 4 em 4 enquanto digita: "4111111111111111" → "4111 1111 1111 1111". */
export const mascararCartao = (valor: string) => digitosCartao(valor).replace(/(\d{4})(?=\d)/g, "$1 ");

/** Confere tamanho e o dígito verificador (Luhn), que pega a maioria dos erros de digitação. */
export function validarCartao(valor: string): string | null {
  const d = digitosCartao(valor);
  if (!d) return "Informe o número do cartão.";
  if (d.length < 13) return "Número do cartão incompleto.";
  let soma = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    soma += n;
  }
  return soma % 10 === 0 ? null : "Confira o número do cartão: algum dígito está errado.";
}

export type Bandeira = "VISA" | "MASTERCARD" | "ELO" | "AMEX" | "HIPERCARD";

/* Faixas de BIN (primeiros dígitos). Elo e Hipercard vêm antes porque algumas faixas começam com 4 ou 5. */
const ELO = [
  "401178", "401179", "431274", "438935", "451416", "457393", "457631", "457632", "504175",
  "627780", "636297", "636368", "650031", "650032", "650033",
];
const ELO_FAIXAS: Array<[number, number]> = [
  [506699, 506778], [509000, 509999], [650035, 650051], [650405, 650439], [650485, 650538],
  [650541, 650598], [650700, 650718], [650720, 650727], [650901, 650978], [651652, 651679],
  [655000, 655019], [655021, 655058],
];
const HIPERCARD = ["606282", "384100", "384140", "384160", "637095", "637568", "637599", "637609", "637612"];

/** Bandeira pelo número; null quando não reconhece (aí o campo não é enviado). */
export function detectarBandeira(valor: string): Bandeira | null {
  const d = digitosCartao(valor);
  const bin = Number(d.slice(0, 6));
  if (d.length >= 6) {
    if (ELO.includes(d.slice(0, 6)) || ELO_FAIXAS.some(([de, ate]) => bin >= de && bin <= ate)) return "ELO";
    if (HIPERCARD.includes(d.slice(0, 6))) return "HIPERCARD";
  }
  if (/^3[47]/.test(d)) return "AMEX";
  const quatro = Number(d.slice(0, 4));
  if (/^5[1-5]/.test(d) || (d.length >= 4 && quatro >= 2221 && quatro <= 2720)) return "MASTERCARD";
  if (/^4/.test(d)) return "VISA";
  return null;
}
