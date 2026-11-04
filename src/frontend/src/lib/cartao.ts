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
