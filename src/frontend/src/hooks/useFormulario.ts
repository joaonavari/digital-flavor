import { useState, type ChangeEvent } from "react";

type Validadores<T> = { [K in keyof T]?: (valor: T[K], todos: T) => string | null };

/**
 * Estado de formulário com validação junto ao campo:
 * o erro aparece ao sair do campo e, depois disso, é atualizado enquanto a pessoa digita.
 */
export function useFormulario<T extends Record<string, string>>(
  iniciais: T,
  validadores: Validadores<T>,
  formatadores: { [K in keyof T]?: (valor: string) => string } = {},
) {
  const [valores, setValores] = useState<T>(iniciais);
  const [tocados, setTocados] = useState<Partial<Record<keyof T, boolean>>>({});

  function erroDe(nome: keyof T): string | null {
    return validadores[nome]?.(valores[nome], valores) ?? null;
  }

  /** Props para ligar direto no <TextField>. */
  function campo(nome: keyof T & string) {
    return {
      name: nome,
      value: valores[nome],
      onChange: (evento: ChangeEvent<HTMLInputElement>) => {
        const bruto = evento.target.value;
        const formatar = formatadores[nome];
        setValores((atual) => ({ ...atual, [nome]: formatar ? formatar(bruto) : bruto }));
      },
      onBlur: () => {
        // Só marca como tocado se a pessoa escreveu algo, para não acusar erro só por passar pelo campo.
        if (valores[nome] !== "") setTocados((atual) => ({ ...atual, [nome]: true }));
      },
      erro: tocados[nome] ? erroDe(nome) : null,
    };
  }

  /** Mostra todos os erros. Devolve o nome do primeiro campo inválido, ou null se está tudo certo. */
  function validarTudo(): (keyof T & string) | null {
    const nomes = Object.keys(valores) as Array<keyof T & string>;
    setTocados(Object.fromEntries(nomes.map((n) => [n, true])) as Record<keyof T, boolean>);
    return nomes.find((n) => erroDe(n) !== null) ?? null;
  }

  return { valores, campo, validarTudo };
}
