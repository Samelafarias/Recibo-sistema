"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExcluirClienteModal } from "../modals/ExcluirClienteModal";
import { Pencil, ChevronLeft, ChevronRight, Trash } from "lucide-react";
import { Cliente, formatarMoeda } from "@/lib/recibo-utils";

type Props = {
  clientes: Cliente[];
  loading: boolean;
  selecionados: number[];
  pagina: number;
  totalPaginas: number;
  onSelecionarTodos: (checked: boolean) => void;
  onSelecionarItem: (clienteId: number, checked: boolean) => void;
  onEditar: (cliente: Cliente) => void;
  onMudarPagina: (pagina: number) => void;
  onExcluirCliente: (clienteId: number) => void;
};

export default function TabelaClientes({
  clientes, loading, selecionados, pagina, totalPaginas,
  onSelecionarTodos, onSelecionarItem, onEditar, onMudarPagina, onExcluirCliente,
}: Props) {
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null);

  function handleConfirmarExclusao() {
    if (clienteParaExcluir) onExcluirCliente(clienteParaExcluir.id);
    setClienteParaExcluir(null);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm text-gray-700">
        <thead className="border-b border-gray-100 bg-gray-50/50 text-primary">
          <tr>
            <th className="p-4 w-12 text-center">
              <Checkbox
                checked={selecionados.length === clientes.length && clientes.length > 0}
                onCheckedChange={(checked) => onSelecionarTodos(!!checked)}
                className="border-gray-300 rounded"
              />
            </th>
            <th className="p-4 font-bold">Nome</th>
            <th className="p-4 font-bold text-center">Valor Mensal</th>
            <th className="p-4 font-bold text-center">Referente</th>
            <th className="p-4 font-bold text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Carregando...</td></tr>
          ) : clientes.length === 0 ? (
            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhum cliente encontrado.</td></tr>
          ) : (
            clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 text-center">
                  <Checkbox
                    checked={selecionados.includes(cliente.id)}
                    onCheckedChange={(checked) => onSelecionarItem(cliente.id, !!checked)}
                    className="border-gray-300 rounded"
                  />
                </td>
                <td className="p-4 font-medium text-gray-800">{cliente.nome}</td>
                <td className="p-4 text-center font-medium text-gray-600">
                  {formatarMoeda(cliente.valor_mensal)}
                </td>
                <td className="p-4 text-center font-medium text-gray-600">{cliente.referente_padrao}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center items-center gap-3">
                    <button onClick={() => onEditar(cliente)} className="text-gray-500 hover:text-gray-800">
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button onClick={() => setClienteParaExcluir(cliente)}>
                      <Trash className="w-5 h-5 text-danger hover:text-red-700 transition-colors" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between p-4 border-t border-gray-100 text-xs text-gray-500">
        <span>
          Página <strong className="text-gray-700">{pagina}</strong> de{" "}
          <strong className="text-gray-700">{totalPaginas}</strong>
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg" disabled={pagina <= 1} onClick={() => onMudarPagina(pagina - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="w-8 h-8 rounded-lg" disabled={pagina >= totalPaginas} onClick={() => onMudarPagina(pagina + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ExcluirClienteModal
        isOpen={!!clienteParaExcluir}
        onClose={() => setClienteParaExcluir(null)}
        onConfirm={handleConfirmarExclusao}
        nomeCliente={clienteParaExcluir?.nome}
      />
    </div>
  );
}