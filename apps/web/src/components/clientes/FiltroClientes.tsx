"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Props = {
  busca: string;
  onMudarBusca: (valor: string) => void;
};

export default function FiltrosClientes({ busca, onMudarBusca }: Props) {
  return (
    <div className="mb-6">
      <div className="relative w-full max-w-7xl">
        <Input
          type="text"
          placeholder="Buscar Cliente"
          value={busca}
          onChange={(e) => onMudarBusca(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
        />
        <Search className="w-6 h-6 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}