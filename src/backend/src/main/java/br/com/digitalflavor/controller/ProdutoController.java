package br.com.digitalflavor.controller;

import br.com.digitalflavor.dto.AtivoRequest;
import br.com.digitalflavor.dto.EstoqueRequest;
import br.com.digitalflavor.dto.ProdutoAtualizacaoRequest;
import br.com.digitalflavor.dto.ProdutoRequest;
import br.com.digitalflavor.dto.ProdutoResponse;
import br.com.digitalflavor.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping
    public List<ProdutoResponse> disponiveis() {
        return produtoService.listarDisponiveis();
    }

    @GetMapping("/todos")
    public List<ProdutoResponse> todos() {
        return produtoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ProdutoResponse buscar(@PathVariable Long id) {
        return produtoService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutoResponse criar(@Valid @RequestBody ProdutoRequest pedido) {
        return produtoService.criar(pedido);
    }

    @PutMapping("/{id}")
    public ProdutoResponse atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoAtualizacaoRequest pedido) {
        return produtoService.atualizar(id, pedido);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProdutoResponse> excluir(@PathVariable Long id) {
        return produtoService.excluir(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PatchMapping("/{id}/ativo")
    public ProdutoResponse definirAtivo(@PathVariable Long id, @Valid @RequestBody AtivoRequest pedido) {
        return produtoService.definirAtivo(id, pedido.ativo());
    }

    @PatchMapping("/{id}/estoque")
    public ProdutoResponse ajustarEstoque(@PathVariable Long id, @Valid @RequestBody EstoqueRequest pedido) {
        return produtoService.ajustarEstoque(id, pedido);
    }
}
