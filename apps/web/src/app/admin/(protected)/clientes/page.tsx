"use client";

import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { EditarClienteModal } from "@/components/modals/EditarClienteModal";
import { AddNovoClienteModal } from "@/components/modals/AddNovoClienteModal";
import FiltrosClientes from "@/components/clientes/FiltroClientes";
import TabelaClientes from "@/components/clientes/TabelaClientes";
import { useClientes } from "@/hooks/useClientes";
import { formatarMoeda } from "@/lib/recibo-utils";

export default function ClientesPage() {
  const c = useClientes();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl text-primary font-extrabold mb-1">Clientes</h1>
              <p className="text-md text-text font-medium mb-6">Gerencie seus clientes cadastrados</p>
            </div>
            <Button
              onClick={() => c.setIsAddOpen(true)}
              className="bg-primary hover:bg-[#0A2534] text-white text-md font-medium px-6 py-3 h-12 rounded-xl shadow-sm flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5 text-white" /> Adicionar Cliente
            </Button>
          </div>

          {c.error ? <p className="text-danger mb-4">{c.error}</p> : null}

          <FiltrosClientes busca={c.busca} onMudarBusca={c.mudarBusca} />

          <TabelaClientes
            clientes={c.clientes}
            loading={c.loading}
            selecionados={c.selecionados}
            pagina={c.pagina}
            totalPaginas={c.totalPaginas}
            onSelecionarTodos={c.selecionarTodos}
            onSelecionarItem={c.selecionarItem}
            onEditar={c.abrirModalEditar}
            onMudarPagina={c.setPagina}
            onExcluirCliente={c.excluirCliente}
          />
        </div>

        <EditarClienteModal
          isOpen={c.isEditarOpen}
          onClose={() => c.setIsEditarOpen(false)}
          isLoading={c.salvandoEdicao}
          cliente={
            c.clienteEditando
              ? {
                  id: c.clienteEditando.id,
                  nome: c.clienteEditando.nome,
                  valor: formatarMoeda(c.clienteEditando.valor_mensal),
                  referente: c.clienteEditando.referente_padrao,
                  diaVencimento: c.clienteEditando.dia_vencimento ? String(c.clienteEditando.dia_vencimento) : "",
                }
              : null
          }
          onSave={c.salvarEdicao}
        />

        <AddNovoClienteModal
          isOpen={c.isAddOpen}
          onClose={() => c.setIsAddOpen(false)}
          onSave={c.adicionarCliente}
          isLoading={c.salvandoNovo}
        />
      </main>
    </div>
  );
}