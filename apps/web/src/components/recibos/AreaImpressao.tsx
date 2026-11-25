"use client";

import Image from "next/image";
import {
  LinhaRecibo,
  formatarMoeda,
  valorPorExtenso,
  dataPorExtenso,
  montarDataVencimentoISO,
  formatarDataVencimento,
  isoParaBR,
  MESES,
} from "@/lib/recibo-utils";

// Ajuste este número para controlar quantos recibos cabem em cada folha.
const RECIBOS_POR_PAGINA = 3;

const ALTURA_UTIL_MM = 300;
const ESPACO_ENTRE_RECIBOS_MM = 6;
const ALTURA_RECIBO_MM =
  Math.floor((ALTURA_UTIL_MM - ESPACO_ENTRE_RECIBOS_MM * (RECIBOS_POR_PAGINA - 1)) / RECIBOS_POR_PAGINA) - 2;

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
  const dataPagamentoBR = isoParaBR(item.data_pagamento);

  return (
    <div
      className="border border-b-gray-300 px-6 py-5 text-sm text-gray-800 bg-white"
      style={{ height: `${ALTURA_RECIBO_MM}mm`, position: "relative", overflow: "hidden" }}
    >
      {item.pago && (
        <div style={{
          position: "absolute", top: "10px", right: "-32px",
          background: "#065f46", color: "white", fontSize: "11px", fontWeight: 500,
          padding: "3px 40px", transform: "rotate(35deg)", letterSpacing: "1px",
        }}>
          PAGO
        </div>
      )}
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Canhoto */}
        <div className="col-span-4 border-r border-dashed border-gray-400 pr-5 flex flex-col justify-between">
          <div className="space-y-2 text-[15px] leading-snug">
            <p><span className="font-semibold">Recebi de:</span> {item.nome}</p>
            <p className="font-bold text-gray-900 text-base">{formatarMoeda(item.valor)}</p>
            <p><span className="font-semibold">Ref:</span> {referenteCompleto}</p>
            <p><span className="font-semibold">Data:</span> {dataVencimentoBR}</p>
            <p><span className="font-semibold">Observação:</span> {item.observacao || "Não há observações"}</p>
            {item.pago && (
              <p className="text-emerald-700 font-semibold">
                ✓ Pago{dataPagamentoBR ? ` em ${dataPagamentoBR}` : ""}
              </p>
            )}
          </div>
          <div className="border-t border-gray-500 pt-1 text-center font-bold text-[13px] text-gray-600 uppercase tracking-wider">
            Assinatura
          </div>
        </div>

        {/* Recibo principal */}
        <div className="col-span-8 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3">
            <Image src="/sf-logo.png" alt="ReciboFácil Logo" width={330} height={42} className="h-18 w-auto" priority />
            <div className="border border-gray-500 bg-white font-bold text-lg px-4 py-2 rounded-md text-gray-900">
              {formatarMoeda(item.valor)}
            </div>
          </div>

          <div className="space-y-1.5 leading-relaxed">
            <p className="font-bold text-base">Recibo de {item.nome}</p>
            <p>A importância de {valorPorExtenso(valorNum)}.</p>
            <p><span className="font-bold">Referente:</span> {referenteCompleto}</p>
            <p className="pt-1">{dataPorExtenso(dataVencimentoISO)}</p>
            {item.pago && (
              <p className="text-emerald-700 font-semibold">
                ✓ Pagamento confirmado{dataPagamentoBR ? ` em ${dataPagamentoBR}` : ""}
              </p>
            )}
          </div>

          <div className="border-t border-gray-500 pt-1 mx-10 text-center font-bold text-[13px] text-gray-600 uppercase tracking-wider">
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
        <div
          key={i}
          className="pagina-impressao bg-white"
          style={{ display: "flex", flexDirection: "column", gap: `${ESPACO_ENTRE_RECIBOS_MM}mm` }}
        >
          {pagina.map((item) => (
            <ReciboParaImpressao key={item.cliente_id} item={item} mes={mes} ano={ano} />
          ))}
        </div>
      ))}
    </div>
  );
}