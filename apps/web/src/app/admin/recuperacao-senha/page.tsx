"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, KeyRound, MailCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminRecuperacaoSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Informe seu e-mail.");
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
      const response = await fetch(`${apiUrl}/api/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível processar sua solicitação. Tente novamente.");
      }

      setEnviado(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro ao processar sua solicitação.");
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
                <img
                  src="/logo-completa.png"
                  alt="ReciboFácil logo"
                  width={260}
                  height={92}
                  className="w-55 sm:w-65 h-auto"
                />
              </div>

              {!enviado ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-secondary/20 rounded-full p-3">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary text-center">
                    Recuperação de Senha
                  </CardTitle>
                  <p className="text-sm text-text text-center px-2">
                    Informe seu e-mail cadastrado e enviaremos as instruções para redefinir sua senha.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-success/20 rounded-full p-3">
                    <MailCheck className="w-6 h-6 text-success" />
                  </div>
                  <CardTitle className="text-xl font-bold text-primary text-center">
                    Verifique seu e-mail
                  </CardTitle>
                  <p className="text-sm text-text text-center px-2">
                    Se o e-mail informado estiver cadastrado, você vai receber um link com as instruções em instantes.
                  </p>
                </div>
              )}
            </CardHeader>

            <CardContent className="px-3 pb-3 sm:px-5 sm:pb-5 pt-2">
              {!enviado ? (
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

                    {error ? <p className="text-sm text-danger mt-1">{error}</p> : null}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-primary text-background hover:bg-secondary transition-colors mt-4"
                    >
                      {loading ? "Enviando..." : "Enviar link de recuperação"}
                    </Button>
                  </div>
                </form>
              ) : null}

              <div className="flex justify-center pt-4">
                <Link href="/admin/login" className="text-sm text-[#1BA5C4] hover:text-secondary transition-colors">
                  Voltar para o login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}