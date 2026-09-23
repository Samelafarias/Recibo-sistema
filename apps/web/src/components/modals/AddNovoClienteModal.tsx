"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface NovoClienteData {
  nome: string;
  valor: string;
  referente: string;
  diaVencimento: string;
}

interface AddNovoClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NovoClienteData) => void;
  isLoading?: boolean;
}

const FORM_VAZIO: NovoClienteData = { nome: "", valor: "", referente: "", diaVencimento: "" };

export function AddNovoClienteModal({ isOpen, onClose, onSave, isLoading = false }: AddNovoClienteModalProps) {
  const [formData, setFormData] = useState<NovoClienteData>(FORM_VAZIO);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(formData);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent key={isOpen ? "add-cliente-open" : "add-cliente-closed"} className="sm:max-w-[480px] bg-white border-none rounded-2xl p-6 shadow-xl text-gray-800">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-primary">Adicionar Novo Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nome Completo</label>
            <Input
              type="text" name="nome" value={formData.nome} onChange={handleChange}
              placeholder="Nome completo do cliente" required
              className="bg-[#F8FAFC] border border-gray-200 rounded-xl h-11 text-xs text-gray-700 font-medium px-3.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Valor Mensal</label>
              <Input
                type="text" name="valor" placeholder="R$ 00,00"
                value={formData.valor} onChange={handleChange} required
                className="bg-[#F8FAFC] border border-gray-200 rounded-xl h-11 text-xs text-gray-700 px-3.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Dia do vencimento</label>
              <Input
                type="number" name="diaVencimento" placeholder="Ex: 10" min={1} max={31}
                value={formData.diaVencimento} onChange={handleChange}
                className="bg-[#F8FAFC] border border-gray-200 rounded-xl h-11 text-xs text-gray-800 font-medium px-3.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Referente (padrão do recibo)</label>
            <Input
              type="text" name="referente" placeholder="Ex: Mensalidade"
              value={formData.referente} onChange={handleChange} required
              className="bg-[#F8FAFC] border border-gray-200 rounded-xl h-11 text-xs text-gray-800 font-medium px-3.5"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="bg-white border-gray-300 text-gray-700 font-semibold px-6 py-2 h-10 rounded-xl shadow-sm hover:bg-gray-100">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-[#0A2534] text-white font-medium px-6 py-2 h-10 rounded-xl shadow-sm">
              {isLoading ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}