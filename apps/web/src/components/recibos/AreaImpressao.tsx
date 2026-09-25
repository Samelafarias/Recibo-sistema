"use client";

import { LinhaRecibo, formatarMoeda, valorPorExtenso, dataPorExtenso, montarDataVencimentoISO, formatarDataVencimento, MESES } from "@/lib/recibo-utils";

const RECIBOS_POR_PAGINA = 4;

function agruparEmPaginas(itens: LinhaRecibo[]): LinhaRecibo[][] {
  const paginas: LinhaRecibo[][] = [];
  for (let i = 0; i < itens.length; i += RECIBOS_POR_PAGINA) {
    paginas.push(itens.slice(i, i + RECIBOS_POR_PAGINA));
  }
  return paginas;
}

function ReciboParaImpressao({ item, mes, ano }: { item: LinhaRecibo; mes: number; ano: number }) {
  const valorNum = Number(item.valor);
  const dataVencimentoISO = montarDataVencimentoISO(item.dia_vencimento, mes, ano);
  const dataVencimentoBR = formatarDataVencimento(item.dia_vencimento, mes, ano);
  const referenteCompleto = `${item.referente} - ${MESES[mes - 1]}/${ano}`;

  return (
    <div className="border rounded-xl p-4 text-xs text-gray-700 bg-white" style={{ height: "6.5cm" }}>
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Canhoto */}
        <div className="col-span-4 border-r border-gray-200 pr-4 flex flex-col justify-between bg-white">
          <div className="space-y-1">
            <p><span className="font-semibold">Recebi de:</span> {item.nome}</p>
            <p className="font-bold text-gray-900 text-sm">{formatarMoeda(item.valor)}</p>
            <p><span className="font-semibold">Ref:</span> {referenteCompleto}</p>
            <p><span className="font-semibold">Data:</span> {dataVencimentoBR}</p>
            <p><span className="font-semibold">Observação:</span> {item.observacao || "Não há observações"}</p>
          </div>
          <div className="border-t border-gray-400 pt-1 text-center font-bold text-[10px] text-gray-600 uppercase tracking-wider">
            Assinatura
          </div>
        </div>

        {/* Recibo principal */}
        <div className="col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <img src="/sf-logo.png" alt="ReciboFácil Logo" width={320} height={40} className="h-18 w-auto" />
            <div className="border border-gray-400 bg-white font-bold text-sm px-3 py-1.5 rounded-md text-gray-900">
              {formatarMoeda(item.valor)}
            </div>
          </div>

          <div className="space-y-1.5 text-gray-800">
            <p className="font-bold text-sm">Recibo de {item.nome}</p>
            <p>A importância de {valorPorExtenso(valorNum)}.</p>
            <p><span className="font-bold">Referente:</span> {referenteCompleto}</p>
            <p className="pt-1">{dataPorExtenso(dataVencimentoISO)}</p>
          </div>

          <div className="border-t border-gray-400 pt-1 text-center font-bold text-[10px] text-gray-600 uppercase tracking-wider">
            Assinatura
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AreaImpressao({
  itens,
  mes,
  ano,
}: {
  itens: LinhaRecibo[] | null;
  mes: number;
  ano: number;
}) {
  if (!itens || itens.length === 0) return null;

  return (
    <div id="area-impressao">
      {agruparEmPaginas(itens).map((pagina, i) => (
        <div key={i} className="pagina-impressao flex flex-col gap-4 p-6 bg-white min-h-screen">
          {pagina.map((item) => (
            <ReciboParaImpressao key={item.cliente_id} item={item} mes={mes} ano={ano} />
          ))}
        </div>
      ))}
    </div>
  );
}