import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ErroApi, mensagemDeErro } from "../../api/http";
import { criarProduto, editarProduto } from "../../api/produtos";
import { AlertDialog } from "../../components/AlertDialog";
import { Button } from "../../components/Button";
import { ProdutoFoto } from "../../components/ProdutoFoto";
import { Sheet } from "../../components/Sheet";
import { GrupoCampos, TextField } from "../../components/TextField";
import { useFormulario } from "../../hooks/useFormulario";
import { notificar } from "../../lib/notificar";
import {
  LIMITES_PRODUTO,
  mascararPreco,
  paraDadosProduto,
  validarProduto,
  VALORES_VAZIOS,
  valoresDe,
} from "../../lib/produto";
import type { Produto } from "../../types";
import estilos from "./Produtos.module.css";

interface Props {
  aberto: boolean;
  /** null = novo produto. */
  produto: Produto | null;
  categorias: string[];
  aoFechar: () => void;
  aoSalvar: (produto: Produto, novo: boolean) => void;
}

/** Folha (painel lateral no computador) para criar ou editar um produto. */
export function FolhaProduto({ aberto, produto, categorias, aoFechar, aoSalvar }: Props) {
  const [descartar, setDescartar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const sujoRef = useRef(false);

  function pedirFechar() {
    if (sujoRef.current) setDescartar(true);
    else aoFechar();
  }

  const novo = produto === null;
  const idFormulario = useId();

  return (
    <>
      <Sheet
        aberto={aberto}
        aoFechar={pedirFechar}
        titulo={novo ? "Novo produto" : "Editar produto"}
        larguraLateral={460}
        rodape={
          <Button type="submit" form={idFormulario} tamanho="grande" larguraTotal carregando={enviando}>
            {novo ? "Criar produto" : "Salvar alterações"}
          </Button>
        }
      >
        {/* A chave recria o formulário (e seus valores) a cada produto aberto. */}
        <Formulario
          key={produto?.id ?? "novo"}
          id={idFormulario}
          produto={produto}
          categorias={categorias}
          enviando={enviando}
          setEnviando={setEnviando}
          aoMudarSujo={(sujo) => {
            sujoRef.current = sujo;
          }}
          aoSalvar={(salvo) => {
            sujoRef.current = false;
            setEnviando(false);
            aoSalvar(salvo, novo);
          }}
        />
      </Sheet>

      <AlertDialog
        aberto={descartar}
        titulo="Descartar alterações?"
        mensagem="O que você mudou neste produto ainda não foi salvo."
        rotuloConfirmar="Descartar"
        rotuloVoltar="Continuar editando"
        destrutivo
        aoConfirmar={() => {
          setDescartar(false);
          sujoRef.current = false;
          aoFechar();
        }}
        aoFechar={() => setDescartar(false)}
      />
    </>
  );
}

function Formulario({
  id,
  produto,
  categorias,
  enviando,
  setEnviando,
  aoMudarSujo,
  aoSalvar,
}: {
  id: string;
  produto: Produto | null;
  categorias: string[];
  enviando: boolean;
  setEnviando: (enviando: boolean) => void;
  aoMudarSujo: (sujo: boolean) => void;
  aoSalvar: (produto: Produto) => void;
}) {
  const formulario = useRef<HTMLFormElement>(null);
  const idLista = useId();
  const { valores, campo, validarTudo, sujo } = useFormulario(
    produto ? valoresDe(produto) : VALORES_VAZIOS,
    validarProduto,
    { preco: mascararPreco, quantidadeEstoque: (v) => v.replace(/\D/g, "").slice(0, 5) },
  );
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  useEffect(() => {
    aoMudarSujo(sujo);
  }, [sujo, aoMudarSujo]);

  const urlValida = validarProduto.imagemUrl(valores.imagemUrl) === null && valores.imagemUrl.trim() !== "";

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (enviando) return;
    setErroGeral(null);
    const invalido = validarTudo();
    if (invalido) {
      formulario.current?.querySelector<HTMLElement>(`[name="${invalido}"]`)?.focus();
      return;
    }
    setEnviando(true);
    try {
      const dados = paraDadosProduto(valores);
      const salvo = produto ? await editarProduto(produto.id, dados) : await criarProduto(dados);
      aoSalvar(salvo);
    } catch (erro) {
      setEnviando(false);
      if (erro instanceof ErroApi && erro.ehErroDeRede) notificar.erro(erro, "Sem conexão");
      else setErroGeral(mensagemDeErro(erro));
    }
  }

  return (
    <form ref={formulario} id={id} className={estilos.formulario} onSubmit={enviar} noValidate aria-busy={enviando}>
      <div className={estilos.previa}>
        <ProdutoFoto nome={valores.nome || "?"} imagemUrl={urlValida ? valores.imagemUrl.trim() : null} />
        <div className={estilos.previaTexto}>
          <span className={estilos.previaNome}>{valores.nome.trim() || "Nome do produto"}</span>
          <span className={estilos.previaDica}>Assim o produto aparece no cardápio.</span>
        </div>
      </div>

      <GrupoCampos>
        <TextField agrupado rotulo="Nome" placeholder="Coxinha de frango" maxLength={LIMITES_PRODUTO.nome} {...campo("nome")} />
        <TextField
          agrupado
          multilinha
          rotulo="Descrição (opcional)"
          placeholder="Massa leve, recheio cremoso"
          maxLength={LIMITES_PRODUTO.descricao}
          rows={2}
          {...campo("descricao")}
        />
      </GrupoCampos>

      <GrupoCampos>
        <TextField agrupado rotulo="Preço" prefixo="R$" inputMode="decimal" placeholder="0,00" {...campo("preco")} />
        <TextField
          agrupado
          rotulo="Estoque"
          inputMode="numeric"
          placeholder="0"
          dica="Com 0, o produto some do cardápio dos alunos."
          {...campo("quantidadeEstoque")}
        />
        <TextField
          agrupado
          rotulo="Categoria (opcional)"
          placeholder="Salgados"
          list={idLista}
          maxLength={LIMITES_PRODUTO.categoria}
          autoComplete="off"
          {...campo("categoria")}
        />
      </GrupoCampos>
      <datalist id={idLista}>
        {categorias.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <TextField
        rotulo="URL da imagem (opcional)"
        type="url"
        inputMode="url"
        placeholder="https://…/foto.jpg"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={LIMITES_PRODUTO.imagemUrl}
        dica="Sem imagem (ou se ela não carregar), aparece a inicial do nome."
        {...campo("imagemUrl")}
      />

      {erroGeral && (
        <p className={estilos.alerta} role="alert">
          {erroGeral}
        </p>
      )}
    </form>
  );
}
