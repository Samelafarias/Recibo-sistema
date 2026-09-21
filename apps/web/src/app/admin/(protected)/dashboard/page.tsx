"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, FileX, Users } from "lucide-react";

type ReciboRecente = {
  id: number;
  cliente_nome: string;
  status: "gerado" | "pendente";
  data_emissao: string;
  valor: string;
};

type DashboardData = {
  receita_mes: string;
  recibos_nao_gerados: number;
  clientes_cadastrados: number;
  recibos_recentes: ReciboRecente[];
};

function formatarMoeda(valor: string | number) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: string) {
  return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function carregarDashboard() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/dashboard/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Não foi possível carregar o dashboard.");
        }

        const data = await response.json();
        setDados(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro ao carregar os dados.");
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50">
        <h1 className="text-3xl text-primary font-extrabold mb-2 tracking-[0.5px]">Dashboard</h1>
        <p className="text-md text-text font-medium">
          Acompanhe as atividades da geração de recibos em tempo real
        </p>

        {error ? <p className="text-danger mt-4">{error}</p> : null}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-gray-400">Receita dos recibos gerados</h2>
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-4xl text-text font-extrabold">
              {loading ? "…" : formatarMoeda(dados?.receita_mes ?? 0)}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-gray-400">Recibos não gerados</h2>
              <FileX className="w-6 h-6 text-[#FF4141]" />
            </div>
            <p className="text-4xl text-text font-extrabold">
              {loading ? "…" : dados?.recibos_nao_gerados ?? 0}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-gray-400">Clientes Cadastrados</h2>
              <Users className="w-6 h-6 text-text" />
            </div>
            <p className="text-4xl text-text font-extrabold">
              {loading ? "…" : dados?.clientes_cadastrados ?? 0}
            </p>
          </Card>
        </div>

        <div className="mt-6">
          <h1 className="text-xl text-primary font-bold mb-2 mt-6 py-4">Recibos Recentes</h1>
          <div className="flex flex-col gap-4 mt-2 border border-gray-200 rounded-lg p-4 bg-white">
            {loading ? (
              <p className="text-gray-400 p-4">Carregando...</p>
            ) : dados && dados.recibos_recentes.length > 0 ? (
              dados.recibos_recentes.map((recibo) => (
                <div
                  key={recibo.id}
                  className="flex items-center justify-between bg-white p-4 rounded-lg shadow-m border-b border-gray-200"
                >
                  <div className="grid items-center">
                    <h1 className="font-semibold">{recibo.cliente_nome}</h1>
                    <p className="text-gray-400 capitalize">{recibo.status}</p>
                  </div>
                  <div className="grid items-center text-right">
                    <h1 className="font-semibold">{formatarMoeda(recibo.valor)}</h1>
                    <p className="text-gray-400">{formatarData(recibo.data_emissao)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 p-4">Nenhum recibo gerado ainda.</p>
            )}
          </div>
        </div>

        <Button
          onClick={() => router.push("/recibos")}
          className="flex items-center justify-center m-auto mt-6 bg-primary hover:bg-[#5a7f94] text-white font-semibold py-6 px-16 rounded-lg"
        >
          Ver mais
        </Button>
      </main>
    </div>
  );
}