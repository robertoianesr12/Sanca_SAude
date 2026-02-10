import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";
import { Loader2, Lock } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/admin");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Mostra o erro real do Supabase (ex: "Email not confirmed" ou "Invalid login credentials")
        showError(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
        console.error("Erro de login:", error);
      } else if (data.user) {
        showSuccess("Login realizado com sucesso!");
        navigate("/admin");
      }
    } catch (err) {
      showError("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-24">
        <div className="bg-card p-8 rounded-3xl shadow-2xl border border-primary/10">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-primary text-center">Acesso Administrativo</h1>
            <p className="text-muted-foreground text-sm mt-2">Entre com suas credenciais para gerenciar pedidos.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@trembao.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl h-12"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-lg font-bold py-6 rounded-xl shadow-lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;