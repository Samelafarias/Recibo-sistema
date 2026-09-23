"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LinhaRecibo, apiUrl, authHeaders, parseValorBR } from "@/lib/recibo-utils";

export function useRecibos() {
  const router = useRouter();
  const agora = new Date();

  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [linhas, setLinhas] = useState<LinhaRecibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [gerandoLote, setGerandoLote] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [itemParaEditar, setItemParaEditar] = useState<LinhaRecibo | null>(null);

  const [isImprimirOpen, setIsImprimirOpen] = useState(false);
  const [previaImpressao, setPreviaImpressao] = useState<LinhaRecibo[]>([]);
  const [itensParaImprimir, setItensParaImprimir] = useState<LinhaRecibo[] | null>(null);

  const carregarRecibos = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        mes: String(mes),
        ano: String(ano),
        status: statusFiltro,
        busca,
        page: String(pagina),
      });

      const response = await fetch(`${apiUrl()}/api/recibos/por-competencia/?${params}`, {
        headers: authHeaders(),
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/admin/login");
        return;
      }

      if (!response.ok) throw new Error("Não foi possível carregar os recibos.");

      const data = await response.json();
      setLinhas(data.results);
      setTotalPaginas(data.total_paginas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar os recibos.");
    } finally {
      setLoading(false);
    }
  }, [mes, ano, statusFiltro, busca, pagina, router]);

  useEffect(() => {
    carregarRecibos();
  }, [carregarRecibos]);

  // Dispara a impressão real assim que itensParaImprimir é preenchido
  useEffect(() => {
    if (!itensParaImprimir) return;
    window.print();
    const limpar = () => setItensParaImprimir(null);
    window.addEventListener("afterprint", limpar, { once: true });
    return () => window.removeEventListener("afterprint", limpar);
  }, [itensParaImprimir]);

  function mudarMes(novoMes: number, novoAno: number) {
    setMes(novoMes);
    setAno(novoAno);
    setPagina(1);
  }

  function mudarBusca(valor: string) {
    setBusca(valor);
    setPagina(1);
  }

  function mudarStatus(valor: string) {
    setStatusFiltro(valor);
    setPagina(1);
  }

  function selecionarTodos(checked: boolean) {
    setSelecionados(checked ? linhas.map((l) => l.cliente_id) : []);
  }

  function selecionarItem(clienteId: number, checked: boolean) {
    setSelecionados((prev) =>
      checked ? [...prev, clienteId] : prev.filter((id) => id !== clienteId)
    );
  }

  async function gerarRecibos(clienteIds?: number[]) {
    setGerandoLote(true);
    try {
      const response = await fetch(`${apiUrl()}/api/recibos/gerar/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ mes, ano, cliente_ids: clienteIds }),
      });
      if (!response.ok) throw new Error("Não foi possível gerar os recibos.");
      setSelecionados([]);
      await carregarRecibos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar recibos.");
    } finally {
      setGerandoLote(false);
    }
  }

  function abrirModalEditar(linha: LinhaRecibo) {
    setItemParaEditar(linha);
    setIsEditarOpen(true);
  }

  async function salvarEdicao(data: {
    id?: string | number;
    valor: string;
    referente?: string;
    observacao?: string;
  }) {
    if (!data.id) return;
    setSalvandoEdicao(true);
    try {
      const response = await fetch(`${apiUrl()}/api/recibos/${data.id}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          valor: parseValorBR(data.valor),
          referente: data.referente,
          observacao: data.observacao,
        }),
      });
      if (!response.ok) throw new Error("Não foi possível salvar as alterações.");
      setIsEditarOpen(false);
      await carregarRecibos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function abrirModalImprimir(itens: LinhaRecibo[]) {
    const validos = itens.filter((i) => i.recibo_id);
    if (validos.length === 0) return;
    setPreviaImpressao(validos);
    setIsImprimirOpen(true);
  }

  async function confirmarImpressao() {
    setIsImprimirOpen(false);
    const itens = previaImpressao;
    setItensParaImprimir(itens);
    await Promise.all(
      itens
        .filter((i) => i.recibo_id)
        .map((i) =>
          fetch(`${apiUrl()}/api/recibos/${i.recibo_id}/`, {
            method: "PATCH",
            headers: authHeaders(),
            body: JSON.stringify({ impresso: true }),
          })
        )
    );
    carregarRecibos();
  }

  const clientesSelecionadosPendentes = linhas.filter(
    (l) => selecionados.includes(l.cliente_id) && l.status === "pendente"
  ).length;

  const itensGeradosSelecionados = linhas.filter(
    (l) => selecionados.includes(l.cliente_id) && l.recibo_id
  );

  const algumSelecionadoPendente = linhas.some(
    (l) => selecionados.includes(l.cliente_id) && l.status === "pendente"
  );

  return {
    // filtros e dados
    mes, ano, statusFiltro, busca, pagina, totalPaginas,
    linhas, loading, error,
    // seleção
    selecionados, clientesSelecionadosPendentes, itensGeradosSelecionados, algumSelecionadoPendente,
    selecionarTodos, selecionarItem,
    // ações
    mudarMes, mudarBusca, mudarStatus, setPagina,
    gerarRecibos, gerandoLote,
    // modal editar
    isEditarOpen, setIsEditarOpen, itemParaEditar, abrirModalEditar, salvarEdicao, salvandoEdicao,
    // modal imprimir
    isImprimirOpen, setIsImprimirOpen, previaImpressao, abrirModalImprimir, confirmarImpressao,
    // impressão de verdade
    itensParaImprimir,
  };
}