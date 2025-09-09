
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { signUpUser } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (data) {
            setProfiles(data);
        }
    }
    fetchProfiles();
  }, [])

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
            description: error.message,
            variant: "destructive"
        })
    } else {
        router.push("/dashboard");
    }
    setIsLoggingIn(false);
  };

  const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRegistering(true);
    const formData = new FormData(e.currentTarget);
    const result = await signUpUser(formData);

    if (result.error) {
      toast({
        title: "Erro ao criar conta",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta Criada!",
        description: "Verifique seu email para confirmar sua conta antes de fazer login.",
        className: 'bg-green-100 border-green-300 text-green-800'
      });
      // Refresh profiles list
      const { data } = await supabase.from('profiles').select('*');
      if(data) setProfiles(data);

      setDialogOpen(false); // Close the dialog on success
    }
    setIsRegistering(false);
  };

  const handleUserSelection = (userId: string) => {
      const selectedProfile = profiles.find(p => p.id === userId);
      if (selectedProfile) {
          setEmail(selectedProfile.email);
          setPassword('password'); // Hardcoded password for development
      }
  }

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
                <Label htmlFor="user-select">Selecionar Usuário (Dev)</Label>
                <Select onValueChange={handleUserSelection}>
                    <SelectTrigger id="user-select">
                        <SelectValue placeholder="Escolha um perfil para login rápido" />
                    </SelectTrigger>
                    <SelectContent>
                        {profiles.map(profile => (
                            <SelectItem key={profile.id} value={profile.id}>
                                {profile.name} ({profile.role})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
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
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4 text-sm">
            <p>Não tem uma conta?</p>
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    Criar conta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Criar nova conta</DialogTitle>
                  <DialogDescription>
                    Preencha seus dados para se registrar. A senha padrão será "password".
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRegistration} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nome
                    </Label>
                    <Input id="name" name="name" required className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email-reg" className="text-right">
                      Email
                    </Label>
                    <Input id="email-reg" name="email" type="email" required className="col-span-3" />
                  </div>
                  <Button type="submit" disabled={isRegistering} className="mt-4 w-full col-span-4">
                    {isRegistering ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
        </CardFooter>
      </Card>
    </main>
  );
}
