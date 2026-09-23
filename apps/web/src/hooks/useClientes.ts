"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Cliente, apiUrl, authHeaders, parseValorBR } from "@/lib/recibo-utils";
import { NovoClienteData } from "@/components/modals/AddNovoClienteModal";

export function useClientes() {
  const router = useRouter();

  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selecionados, setSelecionados] = useState<number[]>([]);

  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [salvandoNovo, setSalvandoNovo] = useState(false);

  const carregarClientes = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ busca, page: String(pagina) });
      const response = await fetch(`${apiUrl()}/api/clientes/?${params}`, {
        headers: authHeaders(),
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/admin/login");
        return;
      }

      if (!response.ok) throw new Error("Não foi possível carregar os clientes.");

      const data = await response.json();
      setClientes(data.results);
      setTotalPaginas(Math.max(1, Math.ceil(data.count / 8)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }, [busca, pagina, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregarClientes();
  }, [carregarClientes]);

  function mudarBusca(valor: string) {
    setBusca(valor);
    setPagina(1);
  }

  function selecionarTodos(checked: boolean) {
    setSelecionados(checked ? clientes.map((c) => c.id) : []);
  }

  function selecionarItem(id: number, checked: boolean) {
    setSelecionados((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  }

  function abrirModalEditar(cliente: Cliente) {
    setClienteEditando(cliente);
    setIsEditarOpen(true);
  }

  async function salvarEdicao(data: {
    id?: string | number;
    nome: string;
    valor: string;
    referente?: string;
    diaVencimento?: string;
  }) {
    if (!data.id) return;
    setSalvandoEdicao(true);
    try {
      const response = await fetch(`${apiUrl()}/api/clientes/${data.id}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          nome: data.nome,
          valor_mensal: parseValorBR(data.valor),
          referente_padrao: data.referente,
          dia_vencimento: data.diaVencimento ? Number(data.diaVencimento) : null,
        }),
      });
      if (!response.ok) throw new Error("Não foi possível salvar as alterações.");
      setIsEditarOpen(false);
      await carregarClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function adicionarCliente(data: NovoClienteData) {
    setSalvandoNovo(true);
    try {
      const response = await fetch(`${apiUrl()}/api/clientes/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          nome: data.nome,
          valor_mensal: parseValorBR(data.valor),
          referente_padrao: data.referente || "Mensalidade",
          dia_vencimento: data.diaVencimento ? Number(data.diaVencimento) : null,
        }),
      });
      if (!response.ok) throw new Error("Não foi possível cadastrar o cliente.");
      setIsAddOpen(false);
      await carregarClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar.");
    } finally {
      setSalvandoNovo(false);
    }
  }

  async function excluirCliente(id: number) {
    try {
      const response = await fetch(`${apiUrl()}/api/clientes/${id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error("Não foi possível excluir o cliente.");
      await carregarClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  }

  return {
    busca, pagina, totalPaginas, setPagina, mudarBusca,
    clientes, loading, error,
    selecionados, selecionarTodos, selecionarItem,
    isEditarOpen, setIsEditarOpen, clienteEditando, abrirModalEditar, salvarEdicao, salvandoEdicao,
    isAddOpen, setIsAddOpen, adicionarCliente, salvandoNovo,
    excluirCliente,
  };
}