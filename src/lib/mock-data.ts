import type { Appointment, Client } from "@/types";
import {
  CalendarClock,
  Ban,
  Users,
  UserPlus,
} from "lucide-react";

export const clients: Client[] = [
  {
    id: "1",
    name: "Ana Silva",
    whatsapp: "+55 11 98765-4321",
    telegram: "@anasilva",
    avatarUrl: "https://picsum.photos/id/1011/100/100",
    email: "ana.silva@example.com",
  },
  {
    id: "2",
    name: "Bruno Costa",
    whatsapp: "+55 21 91234-5678",
    telegram: "@brunocosta",
    avatarUrl: "https://picsum.photos/id/1012/100/100",
    email: "bruno.costa@example.com",
  },
  {
    id: "3",
    name: "Carla Dias",
    whatsapp: "+55 31 99876-5432",
    avatarUrl: "https://picsum.photos/id/1013/100/100",
    email: "carla.dias@example.com",
  },
  {
    id: "4",
    name: "Daniel Farias",
    whatsapp: "+55 51 98765-1234",
    telegram: "@danielfarias",
    avatarUrl: "https://picsum.photos/id/1014/100/100",
    email: "daniel.farias@example.com",
  },
   {
    id: "5",
    name: "Elisa Martins",
    whatsapp: "+55 81 91234-8765",
    avatarUrl: "https://picsum.photos/id/1027/100/100",
    email: "elisa.martins@example.com",
  },
];

export const appointments: Appointment[] = [
  {
    id: "appt-1",
    clientName: "Ana Silva",
    clientAvatarUrl: "https://picsum.photos/id/1011/100/100",
    dateTime: new Date(new Date().setHours(9, 0, 0, 0)),
    notes: "Reunião de alinhamento.",
    status: "Agendado",
    admin: "Admin Master",
  },
  {
    id: "appt-2",
    clientName: "Bruno Costa",
    clientAvatarUrl: "https://picsum.photos/id/1012/100/100",
    dateTime: new Date(new Date().setHours(11, 30, 0, 0)),
    notes: "Apresentação do projeto.",
    status: "Agendado",
    admin: "Admin Comum",
  },
  {
    id: "appt-3",
    clientName: "Carla Dias",
    clientAvatarUrl: "https://picsum.photos/id/1013/100/100",
    dateTime: new Date(new Date().setHours(14, 0, 0, 0)),
    notes: "Discussão de contrato.",
    status: "Realizado",
    admin: "Admin Master",
  },
  {
    id: "appt-4",
    clientName: "Daniel Farias",
    clientAvatarUrl: "https://picsum.photos/id/1014/100/100",
    dateTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(16, 0, 0, 0)),
    notes: "Motivo: Conflito de agenda.",
    status: "Cancelado",
    admin: "Admin Comum",
  },
  {
    id: "appt-5",
    clientName: "Elisa Martins",
    clientAvatarUrl: "https://picsum.photos/id/1027/100/100",
    dateTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(10, 0, 0, 0)),
    notes: "Sessão de fotos.",
    status: "Agendado",
    admin: "Admin Master",
  },
  {
    id: "appt-6",
    clientName: "Horário Bloqueado",
    clientAvatarUrl: "",
    dateTime: new Date(new Date().setHours(13, 0, 0, 0)),
    notes: "Almoço",
    status: "Bloqueado",
    admin: "Sistema",
  },
];

export const recentAppointments = appointments.filter(a => a.status === 'Agendado' || a.status === 'Realizado').slice(0, 5);

export const kpiData = [
  {
    title: "Total Agendamentos (Mês)",
    value: "124",
    icon: CalendarClock,
    change: "+15.2%",
  },
  {
    title: "Taxa de Cancelamento",
    value: "8.1%",
    icon: Ban,
    change: "-1.5%",
  },
  {
    title: "Clientes Ativos",
    value: "57",
    icon: Users,
    change: "+5",
  },
  {
    title: "Novos Clientes (Mês)",
    value: "8",
    icon: UserPlus,
    change: "+20%",
  },
];

export const chartData = [
  { name: "Admin 1", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Admin 2", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Admin 3", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Admin 4", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Admin 5", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Admin 6", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Admin 7", total: Math.floor(Math.random() * 50) + 10 },
];
