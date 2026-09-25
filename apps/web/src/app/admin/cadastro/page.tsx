"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function extrairMensagemDeErro(data: Record<string, unknown>): string {
  if (typeof data.detail === "string") return data.detail;
  const primeiraChave = Object.keys(data)[0];
  const valor = primeiraChave ? data[primeiraChave] : null;
  if (Array.isArray(valor) && typeof valor[0] === "string") return valor[0];
  return "Não foi possível concluir o cadastro.";
}

export default function AdminCadastroPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!nome.trim() || !email.trim() || !password.trim() || !confirmarSenha.trim()) {
      setError("Preencha todos os campos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Digite um e-mail válido.");
      return;
    }

    if (password !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          password,
          confirmar_senha: confirmarSenha,
        }),
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
        setError("Ocorreu um erro ao realizar o cadastro.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-primary relative overflow-y-auto font-sans">
      <div className="absolute inset-0">
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-10">

          <Card className="w-full max-w-md bg-background border border-secondary shadow-lg">
            <CardHeader className="px-7 pt-5 sm:px-10 sm:pt-5 pb-2">
              <div className="flex flex-col items-center mb-10">
                <img
                  src="/logo-completa.png"
                  alt="ReciboFácil logo"
                  width={260}
                  height={92}
                  className="w-55 sm:w-65 h-auto"
                />
              </div>
              <CardTitle className="text-xl font-bold text-primary text-center flex justify-center">
                Cadastre-se ao Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-5 sm:pb-5 pt-2">
              <form onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label className="text-text font-semibold text-base" htmlFor="nome">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      type="text"
                      id="nome"
                      name="nome"
                      placeholder="Digite seu nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      className="h-12 pl-12 border border-secondary/30 text-text"
                    />
                  </div>

                  <Label className="text-text font-semibold text-base" htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 pl-12 border border-secondary/30 text-text"
                    />
                  </div>

                  <Label className="text-text font-semibold text-base" htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
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

                  <Label className="text-text font-semibold text-base" htmlFor="confirmarSenha">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      id="confirmarSenha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
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
                    {loading ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </div>

                <div className="flex justify-center pt-1">
                  Já tem uma conta?
                  <Link href="/admin/login" className="text-sm text-[#1BA5C4] hover:text-secondary transition-colors ml-1">
                    Entrar
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}