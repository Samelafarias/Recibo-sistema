"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

interface ReciboData {
  id?: string | number;
  nome: string;
  valor: string;
  dataEmissao?: string;
  referente?: string;
  observacao?: string;
  competenciaTexto?: string;
}

interface EditarReciboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReciboData) => void;
  recibo: ReciboData | null;
  isLoading?: boolean;
}

const FORM_VAZIO: ReciboData = {
  nome: "",
  valor: "",
  dataEmissao: "",
  referente: "",
  observacao: "",
  competenciaTexto: "",
};

export function EditarReciboModal({
  isOpen,
  onClose,
  onSave,
  recibo,
  isLoading = false,
}: EditarReciboModalProps) {
  const [formData, setFormData] = useState<ReciboData>(FORM_VAZIO);

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(recibo ?? FORM_VAZIO);
  }, [isOpen, recibo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-white border-none rounded-2xl p-6 shadow-xl text-gray-800">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-primary">
            Editar Recibo
          </DialogTitle>
          <p className="text-md font-semibold text-gray-500 mt-0.5">
            {formData.competenciaTexto}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Campo Cliente */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Cliente
            </label>
            <Input
              type="text"
              name="nome"
              value={formData.nome}
              disabled
              className="bg-[#F8FAFC] border border-gray-200 rounded-xl h-11 text-xs text-gray-700 font-medium px-3.5 focus:ring-0 cursor-not-allowed"
            />
          </div>

          {/* Grid de 2 Colunas: Valor e Data de Emissão */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Valor
              </label>
              <Input
                type="text"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                className="bg-[#F8FAFC] border border-gray-200 rounded-xl h-11 text-xs text-gray-800 px-3.5"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Data de Emissão
              </label>
              <div className="relative">
                <Input
                  type="text"
                  name="dataEmissao"
                  value={formData.dataEmissao || ""}
                  onChange={handleChange}
                  disabled
                  title="A data de emissão é definida automaticamente quando o recibo é gerado."
                  className="bg-[#F8FAFC] border border-gray-200 rounded-xl h-11 text-xs text-gray-800 font-medium px-3.5 pr-9 cursor-not-allowed opacity-70"
                />
                <Calendar className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Campo Referente */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Referente
            </label>
            <Input
              type="text"
              name="referente"
              value={formData.referente || ""}
              onChange={handleChange}
              className="bg-[#F8FAFC] border border-gray-200 rounded-xl h-11 text-xs text-gray-800 font-medium px-3.5"
              required
            />
          </div>

          {/* Campo Observação (Opcional) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Observação (opcional)
            </label>
            <Input
              type="text"
              name="observacao"
              placeholder="Adicionar observação"
              value={formData.observacao || ""}
              onChange={handleChange}
              className="bg-[#F8FAFC] border border-gray-200 rounded-xl h-11 text-xs text-gray-800 font-medium px-3.5 placeholder:text-gray-400"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white border-gray-300 text-gray-700 font-semibold px-6 py-2 h-10 rounded-xl shadow-sm hover:bg-gray-100"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-[#0A2534] text-white font-medium px-6 py-2 h-10 rounded-xl shadow-sm"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}