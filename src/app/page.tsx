
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    
    if (error) {
        toast({
            title: "Erro de login",
            description: "Credenciais inválidas. Verifique seu email e senha.",
            variant: "destructive"
        })
    } else {
        router.push("/dashboard");
    }
    setIsLoggingIn(false);
  };


  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4 bg-muted">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Logo />
          <CardTitle className="pt-4 text-2xl font-bold">
            Bifrost Central
          </CardTitle>
          <CardDescription>Faça login para acessar a agenda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2 relative">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? 'text' : 'password'}
                required 
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
               <Button variant="ghost" size="icon" type="button" className="absolute bottom-1 right-1 h-7 w-7" onClick={() => setShowPassword(prev => !prev)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4 text-sm">
            <p className="text-xs text-muted-foreground">Apenas usuários autorizados podem acessar.</p>
        </CardFooter>
      </Card>
    </main>
  );
}
