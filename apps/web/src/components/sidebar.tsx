"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Receipt, Users, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

type Usuario = {
  nome: string;
  email: string;
};

function gerarIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    async function carregarUsuario() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          // token expirado ou inválido — manda de volta pro login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push("/admin/login");
          return;
        }

        if (!response.ok) return;

        const data = await response.json();
        setUser({ nome: data.nome, email: data.email });
      } catch {
        // falha de rede — mantém a sidebar funcional mesmo sem os dados do usuário
      }
    }

    carregarUsuario();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/admin/login");
  }

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
    { label: "Recibos", href: "/admin/recibos", icon: Receipt },
    { label: "Clientes", href: "/admin/clientes", icon: Users },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between min-h-screen bg-[#F2F6F6] text-[#1E293B] border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-1/2 -translate-y-1/2 bg-[#F2F6F6] hover:bg-[#7096AC] text-gray-400 p-1 rounded-full shadow-md transition-colors z-20"
        aria-label="Minimizar menu"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="flex flex-col w-full">
        <div className="flex items-center justify-center p-6 h-20">
          {!isCollapsed ? (
            <img
              src="/Logo-completa.png"
              alt="ReciboFácil Logo"
              width={160}
              height={50}
              className="w-auto h-auto"
            />
          ) : (
            <div className="font-bold text-xl text-[#0D253F]">
              <img
              src="/logo.png"
              alt="ReciboFácil Logo"
              width={160}
              height={50}
              className="w-auto h-auto"
            />
            </div>
          )}
        </div>

        <div className="bg-[#7096AC] text-white px-4 py-3 flex items-center gap-3 rounded-r-full">
          <div className="flex items-center justify-center w-10 h-10 min-w-10 rounded-full bg-[#0D253F] text-white font-bold text-sm">
            {user ? gerarIniciais(user.nome) : "…"}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate leading-tight">
                {user ? user.nome : "Carregando..."}
              </p>
              <p className="text-xs text-blue-100 truncate">{user?.email ?? ""}</p>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-2 p-3 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? "bg-[#7096AC] text-white shadow-sm border-l-5 border-[#0D253F]"
                    : "text-[#1E293B] hover:bg-gray-200/60"
                } ${isCollapsed ? "justify-center px-0" : ""}`}>
                <Icon className="w-5 h-5 min-w-5" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-gray-200/60">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
        >
          <LogOut className="w-5 h-5 min-w-5" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}