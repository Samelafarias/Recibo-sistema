"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ExcluirClienteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nomeCliente?: string;
};

export function ExcluirClienteModal({
  isOpen,
  onClose,
  onConfirm,
  nomeCliente,
}: ExcluirClienteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-120 bg-white border-none rounded-2xl p-6 shadow-xl text-gray-800">
        <DialogHeader className="pb-2 text-center">
          <DialogTitle className="text-2xl font-bold text-primary">
            Excluir Cliente
          </DialogTitle>
          <DialogDescription className="text-[16px] font-medium text-gray-500 mt-1 text-center">
            Tem certeza que deseja excluir{" "}
            {nomeCliente ? <strong>{nomeCliente}</strong> : "este cliente"}? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-4 mt-1">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white border border-gray-200 text-gray-800 text-md font-medium px-6 py-3 h-12 rounded-xl shadow-sm flex items-center gap-2"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="bg-danger hover:bg-[#FF4D4F] text-white text-md font-medium px-6 py-3 h-12 rounded-xl shadow-sm flex items-center gap-2"
          >
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}