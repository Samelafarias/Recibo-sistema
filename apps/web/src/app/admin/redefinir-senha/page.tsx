"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, KeyRound, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function extrairMensagemDeErro(data: Record<string, unknown>): string {
  if (typeof data.detail === "string") return data.detail;
  const primeiraChave = Object.keys(data)[0];
  const valor = primeiraChave ? data[primeiraChave] : null;
  if (Array.isArray(valor) && typeof valor[0] === "string") return valor[0];
  return "Não foi possível redefinir sua senha.";
}

export default function AdminRedefinirSenhaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!uid || !token) {
      setError("Link inválido ou expirado. Solicite a recuperação de senha novamente.");
      return;
    }

    if (!password.trim() || !confirmarSenha.trim()) {
      setError("Preencha os dois campos de senha.");
      return;
    }

    if (password !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/password-reset-confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password: password }),
      });

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};

      if (!response.ok) {
        throw new Error(extrairMensagemDeErro(data));
      }

      router.push("/admin/login");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro ao redefinir sua senha.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-primary relative overflow-hidden font-sans">
      <div className="absolute inset-0">
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-10">

          <Card className="w-full max-w-md bg-background border border-secondary shadow-lg">
            <CardHeader className="px-7 pt-5 sm:px-10 sm:pt-5 pb-2">
              <div className="flex flex-col items-center mb-10">
                <Image
                  src="/Logo-completa.png"
                  alt="ReciboFácil logo"
                  width={260}
                  height={92}
                  priority
                  className="w-55 sm:w-65 h-auto"
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-secondary/20 rounded-full p-3">
                  <KeyRound className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-primary text-center">
                  Redefina sua Senha
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="px-3 pb-3 sm:px-5 sm:pb-5 pt-2">
              <form onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label className="text-text font-semibold text-base" htmlFor="password">Nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua nova senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 pl-12 border border-secondary/30 text-text"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ACACAC] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <Label className="text-text font-semibold text-base" htmlFor="confirmarSenha">Confirme sua senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      id="confirmarSenha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite a senha novamente"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                      className="h-12 pl-12 border border-secondary/30 text-text"
                    />
                  </div>

                  {error ? <p className="text-sm text-danger mt-1">{error}</p> : null}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-primary text-background hover:bg-secondary transition-colors mt-4"
                  >
                    {loading ? "Redefinindo..." : "Salvar nova senha"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}