package br.com.digitalflavor.domain.exception;

/**
 * Lancada quando uma regra de negocio (RN01..RN06) e violada.
 * A camada web vai traduzi-la para uma resposta HTTP 422.
 */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
