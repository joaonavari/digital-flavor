import { toast } from "sonner";
import { mensagemDeErro } from "../api/http";

/** Toasts do app. Use estas funções em vez de chamar o Sonner direto. */
export const notificar = {
  sucesso: (titulo: string, descricao?: string) => toast.success(titulo, { description: descricao }),

  /** Mesmo título + texto = mesmo toast (não duplica se a busca rodar duas vezes). */
  info: (titulo: string, descricao?: string) =>
    toast.info(titulo, { description: descricao, id: `${titulo}:${descricao ?? ""}` }),

  /** Mostra a mensagem do back (ou de rede). O id evita empilhar o mesmo erro várias vezes. */
  erro: (erro: unknown, titulo?: string) => {
    const mensagem = mensagemDeErro(erro);
    return titulo
      ? toast.error(titulo, { description: mensagem, id: `${titulo}:${mensagem}` })
      : toast.error(mensagem, { id: mensagem });
  },
};
