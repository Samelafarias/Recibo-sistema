"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { LinhaRecibo, formatarMoeda } from "@/lib/recibo-utils";

type Props = {
  linhas: LinhaRecibo[];
  loading: boolean;
  selecionados: number[];
  pagina: number;
  totalPaginas: number;
  onSelecionarTodos: (checked: boolean) => void;
  onSelecionarItem: (clienteId: number, checked: boolean) => void;
  onImprimir: (linha: LinhaRecibo) => void;
  onEditar: (linha: LinhaRecibo) => void;
  onMudarPagina: (pagina: number) => void;
};

export default function TabelaRecibos({
  linhas, loading, selecionados, pagina, totalPaginas,
  onSelecionarTodos, onSelecionarItem, onImprimir, onEditar, onMudarPagina,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm text-gray-700">
        <thead className="border-b border-gray-100 bg-gray-50/50 text-primary">
          <tr>
            <th className="p-4 w-12 text-center">
              <Checkbox
                checked={selecionados.length === linhas.length && linhas.length > 0}
                onCheckedChange={(checked) => onSelecionarTodos(!!checked)}
                className="border-gray-300 rounded"
              />
            </th>
            <th className="p-4 font-bold">Nome</th>
            <th className="p-4 font-bold text-center">Valor</th>
            <th className="p-4 font-bold text-center">Status</th>
            <th className="p-4 font-bold text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Carregando...</td></tr>
          ) : linhas.length === 0 ? (
            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhum cliente encontrado.</td></tr>
          ) : (
            linhas.map((linha) => (
              <tr key={linha.cliente_id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 text-center">
                  <Checkbox
                    checked={selecionados.includes(linha.cliente_id)}
                    onCheckedChange={(checked) => onSelecionarItem(linha.cliente_id, !!checked)}
                    className="border-gray-300 rounded"
                  />
                </td>
                <td className="p-4 font-medium text-gray-800">{linha.nome}</td>
                <td className="p-4 text-center font-medium text-gray-600">
                  {formatarMoeda(linha.valor)}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`inline-block px-4 py-1 text-xs font-semibold rounded-full border ${
                      linha.status === "gerado"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}
                  >
                    {linha.status === "gerado" ? "Gerado" : "Pendente"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onImprimir(linha)}
                      disabled={!linha.recibo_id || linha.status !== "gerado"}
                      className={
                        !linha.recibo_id || linha.status !== "gerado"
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:text-gray-800"
                      }
                      aria-label={`Imprimir recibo de ${linha.nome}`}
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      disabled={!linha.recibo_id || linha.status === "gerado"}
                      onClick={() => onEditar(linha)}
                      className={
                        !linha.recibo_id || linha.status === "gerado"
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:text-gray-800"
                      }
                      aria-label={`Editar recibo de ${linha.nome}`}
                    >
                      <Pencil className="w-5 h-5" />
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
          <Button
            variant="outline" size="icon" className="w-8 h-8 rounded-lg"
            disabled={pagina <= 1}
            onClick={() => onMudarPagina(pagina - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline" size="icon" className="w-8 h-8 rounded-lg"
            disabled={pagina >= totalPaginas}
            onClick={() => onMudarPagina(pagina + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}