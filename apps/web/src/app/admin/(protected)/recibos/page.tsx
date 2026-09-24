"use client";

import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Printer, FilePlus } from "lucide-react";
import { ImprimirReciboModal } from "@/components/modals/ImprimirReciboModal";
import { EditarReciboModal } from "@/components/modals/EditarReciboModal";
import FiltrosRecibos from "@/components/recibos/FiltrosRecibos";
import TabelaRecibos from "@/components/recibos/TabelaRecibos";
import AreaImpressao from "@/components/recibos/AreaImpressao";
import { useRecibos } from "@/hooks/useRecibos";
import { MESES, formatarMoeda, valorPorExtenso, isoParaBR, dataPorExtenso } from "@/lib/recibo-utils";

export default function AdminRecibosPage() {
  const r = useRecibos();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl text-primary font-extrabold mb-1">Recibos</h1>
          <p className="text-md text-gray-500 font-medium mb-6">
            Gerencie seus recibos de forma prática
          </p>

          {r.error ? <p className="text-danger mb-4">{r.error}</p> : null}

          <FiltrosRecibos
            mes={r.mes}
            ano={r.ano}
            busca={r.busca}
            statusFiltro={r.statusFiltro}
            gerando={r.gerandoLote}
            onMudarMes={r.mudarMes}
            onMudarBusca={r.mudarBusca}
            onMudarStatus={r.mudarStatus}
            onGerar={() => r.gerarRecibos()}
          />

          <TabelaRecibos
            linhas={r.linhas}
            loading={r.loading}
            selecionados={r.selecionados}
            pagina={r.pagina}
            totalPaginas={r.totalPaginas}
            onSelecionarTodos={r.selecionarTodos}
            onSelecionarItem={r.selecionarItem}
            onImprimir={(linha) => r.abrirModalImprimir([linha])}
            onEditar={r.abrirModalEditar}
            onMudarPagina={r.setPagina}
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button
            variant="outline"
            disabled={
              r.selecionados.length === 0 || r.algumSelecionadoPendente
            }
            onClick={() => r.abrirModalImprimir(r.itensGeradosSelecionados)}
            className="bg-white border-gray-300 text-gray-800 hover:bg-gray-50 text-[15px] font-semibold h-12 px-6 rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-5 h-5" />
            Imprimir Selecionados
          </Button>

          <Button
            disabled={r.clientesSelecionadosPendentes === 0 || r.gerandoLote}
            onClick={() => r.gerarRecibos(r.selecionados)}
            className="bg-[#0F354A] hover:bg-[#0A2534] text-[15px] text-white font-semibold h-12 px-6 rounded-xl flex items-center gap-2 shadow-sm"
          >
            <FilePlus className="w-5 h-5" />
            Gerar Recibos
          </Button>
        </div>

        <ImprimirReciboModal
          key={`${r.isImprimirOpen}-${r.previaImpressao.map((item) => item.recibo_id).join("-")}`}
          isOpen={r.isImprimirOpen}
          onClose={() => r.setIsImprimirOpen(false)}
          onConfirm={r.confirmarImpressao}
          recibos={r.previaImpressao.map((linha) => ({
            id: linha.recibo_id ?? linha.cliente_id,
            nome: linha.nome,
            valor: formatarMoeda(linha.valor),
            valorExtenso: `A importância de ${valorPorExtenso(Number(linha.valor))}.`,
            referente: linha.referente,
            dataEmissao: isoParaBR(linha.data_emissao),
            observacao: linha.observacao || "Não há observações",
            cidadeData: dataPorExtenso(linha.data_emissao),
          }))}
        />

        <EditarReciboModal
          key={`${r.isEditarOpen}-${r.itemParaEditar?.recibo_id ?? "novo"}`}
          isOpen={r.isEditarOpen}
          onClose={() => r.setIsEditarOpen(false)}
          isLoading={r.salvandoEdicao}
          recibo={
            r.itemParaEditar
              ? {
                  id: r.itemParaEditar.recibo_id ?? undefined,
                  nome: r.itemParaEditar.nome,
                  valor: formatarMoeda(r.itemParaEditar.valor),
                  dataEmissao: isoParaBR(r.itemParaEditar.data_emissao),
                  referente: r.itemParaEditar.referente,
                  observacao: r.itemParaEditar.observacao || "",
                  competenciaTexto: `${MESES[r.mes - 1]} - ${r.ano}`,
                }
              : null
          }
          onSave={r.salvarEdicao}
        />

        <AreaImpressao itens={r.itensParaImprimir} />
      </main>
    </div>
  );
}