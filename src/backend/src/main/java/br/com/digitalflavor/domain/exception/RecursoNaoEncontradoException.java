package br.com.digitalflavor.domain.exception;

/**
 * Lancada quando um recurso pedido nao existe.
 * A camada web vai traduzi-la para uma resposta HTTP 404.
 */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
