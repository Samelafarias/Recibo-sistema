"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, ChevronLeft, ChevronRight } from "lucide-react";

interface ReciboItem {
  id?: string | number;
  nome: string;
  valor: string;
  valorExtenso?: string;
  referente: string;
  dataEmissao: string;
  observacao?: string;
  cidadeData?: string;
}

interface ImprimirReciboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  recibos?: ReciboItem[];
  isLoading?: boolean;
}

export function ImprimirReciboModal({
  isOpen,
  onClose,
  onConfirm,
  recibos = [],
  isLoading = false,
}: ImprimirReciboModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (recibos.length === 0) return null;

  const reciboAtual = recibos[currentIndex];
  const proximoCliente = recibos[currentIndex + 1]?.nome;

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < recibos.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-190 bg-white border-none rounded-2xl p-6 shadow-xl text-gray-800">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <DialogTitle className="text-xl font-bold text-primary">
              Imprimir Recibo
            </DialogTitle>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              {recibos.length} recibo{recibos.length > 1 ? "s" : ""} selecionado{recibos.length > 1 ? "s" : ""}
            </p>
          </div>
        </DialogHeader>

        {/* Card de Visualização do Recibo (Estilo Talão) */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 my-2 text-xs text-gray-700 font-sans shadow-inner">
          <div className="grid grid-cols-12 gap-4">
            {/* Canhoto do Recibo */}
            <div className="col-span-4 border-r border-gray-300 pr-4 flex flex-col justify-between space-y-3">
              <div className="text-center font-bold text-gray-800 text-sm tracking-wider">
                REO
              </div>
              <div className="space-y-1">
                <p><span className="font-semibold">Recebi de:</span> {reciboAtual.nome}</p>
                <p className="font-bold text-gray-900 text-sm">{reciboAtual.valor}</p>
                <p><span className="font-semibold">Ref:</span> {reciboAtual.referente}</p>
                <p><span className="font-semibold">Data:</span> {reciboAtual.dataEmissao}</p>
                <p><span className="font-semibold">Observação:</span> {reciboAtual.observacao || "Não há observações"}</p>
              </div>
              <div className="border-t border-gray-400 pt-1 text-center font-bold text-[10px] text-gray-600 uppercase tracking-wider mt-4">
                Assinatura
              </div>
            </div>

            {/* Recibo Principal */}
            <div className="col-span-8 flex flex-col justify-between space-y-3 pl-2">
              <div className="flex items-center justify-between gap-2">
                <img src="/sf-logo.png" alt="Logo do Escritório" width={320} height={40} className="w-auto h-auto" />

                <div className="border border-gray-400 bg-white font-bold text-sm px-3 py-1.5 rounded-md text-gray-900 shadow-sm">
                  {reciboAtual.valor}
                </div>
              </div>

              <div className="space-y-1.5 text-gray-800 pt-1">
                <p className="font-bold text-sm">Recibo de {reciboAtual.nome}</p>
                <p>{reciboAtual.valorExtenso}</p>
                <p><span className="font-bold">Referente:</span> {reciboAtual.referente}</p>
                <p className="pt-1">{reciboAtual.cidadeData}</p>
              </div>

              <div className="border-t border-gray-400 pt-1 text-center font-bold text-[10px] text-gray-600 uppercase tracking-wider mt-4">
                Assinatura
              </div>
            </div>
          </div>
        </div>

        {/* Paginação do Recibo */}
        {recibos.length > 1 && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 py-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Recibo {currentIndex + 1} de {recibos.length}
              {proximoCliente ? ` — ${proximoCliente} a seguir` : ""}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === recibos.length - 1}
              className="hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Ações / Botões */}
        <div className="flex items-center justify-end gap-3 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-white border-gray-300 text-gray-700 font-semibold px-6 py-2 h-10 rounded-xl shadow-sm hover:bg-gray-100"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-[#0F354A] hover:bg-[#0A2534] text-white font-semibold px-6 py-2 h-10 rounded-xl flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            {isLoading ? "Aguarde..." : "Imprimir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}