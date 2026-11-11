package br.com.digitalflavor.controller;

import br.com.digitalflavor.dto.PedidoRequest;
import br.com.digitalflavor.dto.PedidoResponse;
import br.com.digitalflavor.dto.RelatorioVendasResponse;
import br.com.digitalflavor.dto.StatusPedidoRequest;
import br.com.digitalflavor.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping("/pedidos")
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoResponse criar(@Valid @RequestBody PedidoRequest requisicao) {
        return pedidoService.criar(requisicao);
    }

    @GetMapping("/pedidos/meus")
    public List<PedidoResponse> meus() {
        return pedidoService.meusPedidos();
    }

    @GetMapping("/pedidos/fila")
    public List<PedidoResponse> fila() {
        return pedidoService.fila();
    }

    @GetMapping("/pedidos/{id}")
    public PedidoResponse buscar(@PathVariable Long id) {
        return pedidoService.buscar(id);
    }

    @PatchMapping("/pedidos/{id}/status")
    public PedidoResponse alterarStatus(@PathVariable Long id, @Valid @RequestBody StatusPedidoRequest requisicao) {
        return pedidoService.alterarStatus(id, requisicao.status());
    }

    @PostMapping("/pedidos/{id}/cancelar")
    public PedidoResponse cancelar(@PathVariable Long id) {
        return pedidoService.cancelar(id);
    }

    @GetMapping("/vendas")
    public RelatorioVendasResponse vendas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return pedidoService.vendas(inicio, fim);
    }
}
