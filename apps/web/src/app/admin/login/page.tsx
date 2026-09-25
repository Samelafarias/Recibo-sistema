"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Informe seu e-mail e sua senha.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Digite um e-mail válido.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};

      if (!response.ok) {
        const errorMessage = data.detail || data.non_field_errors?.[0] || "E-mail ou senha inválidos.";
        throw new Error(errorMessage);
      }

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      router.push("/admin/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro ao realizar o login.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-primary relative overflow-hidden font-sans">
      <div className="absolute inset-0">
        <div className="relative z-10 min-h-screen flex flex-co items-center justify-center px-6 py-10">

         {/*Card Login*/}
            <Card className="w-full max-w-md bg-background border border-secondary shadow-lg">
                <CardHeader className="px-7 pt-5 sm:px-10 sm:pt-5 pb-2">
                     <div className="flex flex-col items-center mb-10">
                        <Image
                        src="/logo-completa.png"
                        alt="ReciboFácil logo"
                        width={260}
                        height={92}
                        className="w-55 sm:w-65 h-auto"
                        priority
                        />
                    </div>
                    <CardTitle className="text-xl font-bold text-primary aling-center flex justify-center">
                        Acessar Sistema
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 sm:px-5 sm:pb-5 pt-2">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-2">
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
                                    {showPassword ? (
                                      <EyeOff className="w-5 h-5" />
                                    ) : (
                                      <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {error ? (
                              <p className="text-sm text-danger mt-1">{error}</p>
                            ) : null}

                            <div className="flex justify-end pt-1">
                                <Link href="/admin/recuperacao-senha" className="text-sm text-[#1BA5C4] hover:text-secondary transition-colors">
                                    Esqueceu sua senha?
                                </Link>
                            </div>

                            <Button
                              type="submit"
                              disabled={loading}
                              className="w-full h-12 bg-primary text-background hover:bg-secondary transition-colors mt-4"
                            >
                               {loading ? "Entrando..." : "Entrar"}
                            </Button>
                        </div>

                         <div className="flex justify-center pt-1">Ainda não tem uma conta?
                                <Link href="/admin/cadastro" className="text-sm text-[#1BA5C4] hover:text-secondary transition-colors ml-1">
                                     Cadastre-se
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