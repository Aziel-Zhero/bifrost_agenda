
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Combine, Shield, Users, ArrowRight } from "lucide-react";
import { gsap } from "gsap";

const features = [
  {
    icon: Combine,
    title: "A Ponte Bifrost",
    description: "Assim como a ponte mítica, nosso sistema é o elo que conecta seu estúdio ao universo de seus clientes, garantindo que processos e dados fluam em perfeita harmonia e segurança.",
  },
  {
    icon: Shield,
    title: "A Visão de Heimdall",
    description: "Assuma o papel do guardião. Com permissões de administrador, tenha uma visão completa de todos os reinos (usuários, relatórios, finanças), protegendo a integridade do seu negócio.",
  },
  {
    icon: Users,
    title: "O Domínio de Asgard",
    description: "Seus profissionais são os deuses de Asgard. Cada um com seu domínio, gerenciando seus próprios agendamentos e clientes com autonomia e poder, construindo suas próprias lendas.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.set(mainRef.current, { visibility: 'visible' });

    const tl = gsap.timeline();

    tl.from("#main-title", {
      duration: 1,
      y: 50,
      opacity: 0,
      ease: "power3.out",
    })
    .from("#subtitle", {
      duration: 1,
      y: 30,
      opacity: 0,
      ease: "power3.out",
    }, "-=0.7")
    .from(cardsRef.current, {
      duration: 0.8,
      y: 50,
      opacity: 0,
      stagger: 0.2,
      ease: "power3.out",
    }, "-=0.5")
    .from("#footer-cta", {
        duration: 1,
        y: 20,
        opacity: 0,
        ease: "power3.out"
    }, "-=0.5");

  }, []);

  return (
    <div ref={mainRef} className="invisible">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button 
          onClick={() => router.push("/login")}
          className="bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20"
        >
          Acessar <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>


      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a091e] p-4 text-white">
        {/* Efeitos de fundo com gradiente */}
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[600px] h-[600px] bg-gradient-radial from-[#8ce8f1]/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] bg-gradient-radial from-[#cb70c4]/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse-slow animation-delay-3000"></div>

        <div className="z-10 flex flex-col items-center text-center space-y-12">
          <div className="space-y-4">
            <div className="inline-block" id="logo">
                <Logo isHeader={false} />
            </div>
            <h1 id="main-title" className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
              Onde a Gestão Encontra a Mitologia.
            </h1>
            <p id="subtitle" className="max-w-2xl text-lg text-gray-300">
              Desvende um sistema forjado para estúdios que não se contentam com o comum. Aqui, cada agendamento é uma saga, cada cliente uma lenda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
            {features.map((feature, index) => (
              <div key={feature.title} ref={el => cardsRef.current[index] = el}>
                <Card className="bg-white/5 border-white/10 backdrop-blur-lg h-full transition-all duration-300 hover:border-white/30 hover:bg-white/10">
                  <CardHeader className="items-center text-center">
                    <div className="p-3 rounded-full bg-gradient-to-br from-[#8ce8f1]/30 to-[#cb70c4]/30 mb-2">
                       <feature.icon className="h-8 w-8 text-[#d1b5f8]" />
                    </div>
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-center text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          <div id="footer-cta" className="text-center">
              <p className="text-lg text-gray-300">Pronto para transcender a gestão comum?</p>
              <div className="flex gap-4 justify-center">
                 <Button 
                    onClick={() => router.push("/login")}
                    className="mt-4 bg-gradient-to-r from-[#8ce8f1] to-[#cb70c4] text-black font-bold text-base py-6 px-8 rounded-lg shadow-[0_0_20px_#cb70c4] hover:shadow-[0_0_30px_#8ce8f1] transition-shadow duration-300"
                  >
                    Atravesse a Bifrost
                  </Button>
              </div>
          </div>

        </div>
      </main>
    </div>
  );
}
