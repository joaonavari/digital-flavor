/*
 * Validações dos formulários. Cada função devolve a mensagem de erro ou null.
 * Os limites ainda não existem no banco (schema.sql vazio): alinhar com o back.
 */

export const LIMITES = {
  nome: 100,
  email: 120,
  senhaMin: 6,
  senhaMax: 72,
  matricula: 20,
  turma: 20,
  telefone: 15, // "(00) 00000-0000"
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarEmail(valor: string): string | null {
  const v = valor.trim();
  if (!v) return "Informe seu e-mail.";
  if (!EMAIL.test(v)) return "Confira o e-mail. Ex.: voce@escola.com";
  return null;
}

export function validarSenhaLogin(valor: string): string | null {
  return valor ? null : "Informe sua senha.";
}

export function validarSenhaNova(valor: string): string | null {
  if (!valor) return "Crie uma senha.";
  if (valor.length < LIMITES.senhaMin) return `A senha precisa de pelo menos ${LIMITES.senhaMin} caracteres.`;
  return null;
}

export function validarNome(valor: string): string | null {
  const v = valor.trim();
  if (!v) return "Informe seu nome.";
  if (v.length < 3) return "O nome está muito curto.";
  return null;
}

export function validarMatricula(valor: string): string | null {
  return valor.trim() ? null : "Informe sua matrícula.";
}

export function validarTelefone(valor: string): string | null {
  const digitos = valor.replace(/\D/g, "");
  if (!digitos) return null; // opcional
  if (digitos.length < 10) return "Telefone incompleto. Use DDD + número.";
  return null;
}

/** Formata enquanto digita: "44999998888" → "(44) 99999-8888". */
export function mascararTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
