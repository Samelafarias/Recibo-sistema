"use client";

import Image from "next/image";
import { LinhaRecibo, formatarMoeda, valorPorExtenso, dataPorExtenso } from "@/lib/recibo-utils";

const RECIBOS_POR_PAGINA = 4; // trocar pra 3 se quiser mais espaço entre eles

function agruparEmPaginas(itens: LinhaRecibo[]): LinhaRecibo[][] {
  const paginas: LinhaRecibo[][] = [];
  for (let i = 0; i < itens.length; i += RECIBOS_POR_PAGINA) {
    paginas.push(itens.slice(i, i + RECIBOS_POR_PAGINA));
  }
  return paginas;
}

function ReciboParaImpressao({ item }: { item: LinhaRecibo }) {
  const valorNum = Number(item.valor);

  return (
    <div
      className="border border-gray-300 rounded-xl p-4 text-xs text-gray-700"
      style={{ height: "6.5cm" }}
    >
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Canhoto */}
        <div className="col-span-4 border-r border-dashed border-gray-400 pr-4 flex flex-col justify-between">
          <div className="text-center font-bold text-gray-800 text-sm tracking-wider">
            REO
          </div>
          <div className="space-y-1">
            <p><span className="font-semibold">Recebi de:</span> {item.nome}</p>
            <p className="font-bold text-gray-900 text-sm">{formatarMoeda(item.valor)}</p>
            <p><span className="font-semibold">Ref:</span> {item.referente}</p>
            <p><span className="font-semibold">Data:</span> {dataPorExtenso(item.data_emissao)}</p>
          </div>
          <div className="border-t border-gray-400 pt-1 text-center font-bold text-[10px] text-gray-600 uppercase tracking-wider">
            Assinatura
          </div>
        </div>

        {/* Recibo principal */}
        <div className="col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <Image
              src="/sf-logo.png"
              alt="ReciboFácil Logo"
              width={120}
              height={48}
              className="h-18 w-auto"
            />
            <div className="border border-gray-400 bg-white font-bold text-sm px-3 py-1.5 rounded-md text-gray-900">
              {formatarMoeda(item.valor)}
            </div>
          </div>

          <div className="space-y-1.5 text-gray-800">
            <p className="font-bold text-sm">Recibo de {item.nome}</p>
            <p>A importância de {valorPorExtenso(valorNum)}.</p>
            <p><span className="font-bold">Referente:</span> {item.referente}</p>
            <p className="pt-1">{dataPorExtenso(item.data_emissao)}</p>
          </div>

          <div className="border-t border-gray-400 pt-1 text-center font-bold text-[10px] text-gray-600 uppercase tracking-wider">
            Assinatura
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AreaImpressao({ itens }: { itens: LinhaRecibo[] | null }) {
  if (!itens || itens.length === 0) return null;

  return (
    <div id="area-impressao">
      {agruparEmPaginas(itens).map((pagina, i) => (
        <div key={i} className="pagina-impressao flex flex-col gap-4 p-6">
          {pagina.map((item) => (
            <ReciboParaImpressao key={item.cliente_id} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}