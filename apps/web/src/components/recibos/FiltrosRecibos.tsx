"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search } from "lucide-react";
import { MESES, gerarOpcoesDeMes } from "@/lib/recibo-utils";

type Props = {
  mes: number;
  ano: number;
  busca: string;
  statusFiltro: string;
  gerando: boolean;
  onMudarMes: (mes: number, ano: number) => void;
  onMudarBusca: (valor: string) => void;
  onMudarStatus: (valor: string) => void;
  onGerar: () => void;
};

export default function FiltrosRecibos({
  mes, ano, busca, statusFiltro,
  onMudarMes, onMudarBusca, onMudarStatus,
}: Props) {
  const opcoesDeMes = gerarOpcoesDeMes();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Select
          value={`${mes}-${ano}`}
          onValueChange={(v) => {
            const [m, a] = v.split("-").map(Number);
            onMudarMes(m, a);
          }}
        >
          <SelectTrigger className="w-52.5 bg-white border-gray-200 text-gray-800 font-medium h-11 py-6 px-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-gray-700" />
              <SelectValue placeholder="Selecionar data">
                {MESES[mes - 1]} - {ano}
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 shadow-sm rounded-xl">
            {opcoesDeMes.map((o) => (
              <SelectItem key={`${o.mes}-${o.ano}`} value={`${o.mes}-${o.ano}`}>
                {MESES[o.mes - 1]} - {o.ano}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="relative w-full max-w-5xl">
          <Input
            type="text"
            placeholder="Buscar Cliente"
            value={busca}
            onChange={(e) => onMudarBusca(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
          />
          <Search className="w-6 h-6 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
        <Select value={statusFiltro} onValueChange={onMudarStatus}>
          <SelectTrigger className="w-52.5 bg-white border-gray-200 text-gray-800 font-medium h-11 py-6 px-4 rounded-xl shadow-sm">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 shadow-sm rounded-xl">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="gerado">Gerado</SelectItem>
            <SelectItem value="nao-gerado">Não Gerado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}