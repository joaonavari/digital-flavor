/** Data local no formato AAAA-MM-DD (o formato das rotas de vendas). */
export function dataISO(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/** Últimos N dias contando hoje: N = 1 é só hoje. */
export function ultimosDias(n: number, hoje = new Date()): { inicio: string; fim: string } {
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - (n - 1));
  return { inicio: dataISO(inicio), fim: dataISO(hoje) };
}

const curta = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" });

/** "28 de out. – 3 de nov." */
export function descreverPeriodo(inicio: string, fim: string): string {
  const [a, b] = [inicio, fim].map((d) => {
    const [ano, mes, dia] = d.split("-").map(Number);
    return curta.format(new Date(ano ?? 0, (mes ?? 1) - 1, dia ?? 1));
  });
  return inicio === fim ? `Hoje, ${a}` : `${a} – ${b}`;
}
