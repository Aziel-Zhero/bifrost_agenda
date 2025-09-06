
import type { Appointment, Client, Service, UserProfile } from "@/types";
import {
  CalendarClock,
  Ban,
  Users,
  UserPlus,
  Home,
  Briefcase,
  Heart,
  Scissors,
  Smile,
} from "lucide-react";

export const clients: Client[] = [
  {
    id: "1",
    name: "Ana Silva",
    whatsapp: "+55 11 98765-4321",
    telegram: "@anasilva",
    avatarUrl: "https://picsum.photos/id/1011/100/100",
    email: "ana.silva@example.com",
    admin: "Admin Master",
  },
  {
    id: "2",
    name: "Bruno Costa",
    whatsapp: "+55 21 91234-5678",
    telegram: "@brunocosta",
    avatarUrl: "https://picsum.photos/id/1012/100/100",
    email: "bruno.costa@example.com",
    admin: "Admin Comum",
  },
  {
    id: "3",
    name: "Carla Dias",
    whatsapp: "+55 31 99876-5432",
    avatarUrl: "https://picsum.photos/id/1013/100/100",
    email: "carla.dias@example.com",
    admin: "Admin Master",
  },
  {
    id: "4",
    name: "Daniel Farias",
    whatsapp: "+55 51 98765-1234",
    telegram: "@danielfarias",
    avatarUrl: "https://picsum.photos/id/1014/100/100",
    email: "daniel.farias@example.com",
    admin: "Admin Comum",
  },
   {
    id: "5",
    name: "Elisa Martins",
    whatsapp: "+55 81 91234-8765",
    avatarUrl: "https://picsum.photos/id/1027/100/100",
    email: "elisa.martins@example.com",
    admin: "Admin Master",
  },
];

export const services: Service[] = [
    { id: 'serv-1', name: 'Maquiagem para Casamento', duration: '2 horas', price: 450.00, icon: 'Heart' },
    { id: 'serv-2', name: 'Maquiagem para Festa de 15 anos', duration: '1 hora 30 min', price: 300.00, icon: 'Smile' },
    { id: 'serv-3', name: 'Maquiagem Social (a domicílio)', duration: '1 hora', price: 250.00, icon: 'Home' },
    { id: 'serv-4', name: 'Penteado', duration: '1 hora', price: 150.00, icon: 'Scissors' },
    { id: 'serv-5', name: 'Design de Sobrancelhas', duration: '30 min', price: 50.00, icon: 'Briefcase' },
];

export const appointments: Appointment[] = [
  {
    id: "appt-1",
    clientName: "Ana Silva",
    clientAvatarUrl: "https://picsum.photos/id/1011/100/100",
    dateTime: new Date(new Date().setHours(9, 0, 0, 0)),
    notes: "Maquiagem para Casamento",
    status: "Agendado",
    admin: "Admin Master",
    serviceId: "serv-1",
  },
  {
    id: "appt-2",
    clientName: "Bruno Costa",
    clientAvatarUrl: "https://picsum.photos/id/1012/100/100",
    dateTime: new Date(new Date().setHours(11, 30, 0, 0)),
    notes: "Maquiagem Social",
    status: "Agendado",
    admin: "Admin Comum",
    serviceId: "serv-3",
  },
  {
    id: "appt-3",
    clientName: "Carla Dias",
    clientAvatarUrl: "https://picsum.photos/id/1013/100/100",
    dateTime: new Date(new Date().setHours(14, 0, 0, 0)),
    notes: "Penteado",
    status: "Realizado",
    admin: "Admin Master",
    serviceId: "serv-4",
  },
  {
    id: "appt-4",
    clientName: "Daniel Farias",
    clientAvatarUrl: "https://picsum.photos/id/1014/100/100",
    dateTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(16, 0, 0, 0)),
    notes: "Motivo: Conflito de agenda.",
    status: "Cancelado",
    admin: "Admin Comum",
    serviceId: "serv-2",
  },
  {
    id: "appt-5",
    clientName: "Elisa Martins",
    clientAvatarUrl: "https://picsum.photos/id/1027/100/100",
    dateTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(10, 0, 0, 0)),
    notes: "Design de Sobrancelhas",
    status: "Agendado",
    admin: "Admin Master",
    serviceId: "serv-5",
  },
  {
    id: "appt-6",
    clientName: "Horário Bloqueado",
    clientAvatarUrl: "",
    dateTime: new Date(new Date().setHours(13, 0, 0, 0)),
    notes: "Almoço",
    status: "Bloqueado",
    admin: "Sistema",
    serviceId: "",
  },
    {
    id: "appt-7",
    clientName: "Carla Dias",
    clientAvatarUrl: "https://picsum.photos/id/1013/100/100",
    dateTime: new Date(new Date(new Date().setDate(new Date().getDate() - 5)).setHours(14, 0, 0, 0)),
    notes: "Maquiagem",
    status: "Realizado",
    admin: "Admin Master",
    serviceId: "serv-3",
  },
   {
    id: "appt-8",
    clientName: "Carla Dias",
    clientAvatarUrl: "https://picsum.photos/id/1013/100/100",
    dateTime: new Date(new Date(new Date().setDate(new Date().getDate() - 10)).setHours(14, 0, 0, 0)),
    notes: "Penteado",
    status: "Realizado",
    admin: "Admin Master",
    serviceId: "serv-4",
  },
  // Adding more data for better chart/kpi representation
  {
    id: "appt-9",
    clientName: "Ana Silva",
    dateTime: new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(10, 0, 0, 0)),
    status: "Realizado",
    serviceId: "serv-1",
    clientAvatarUrl: '',
    notes: '',
    admin: 'Admin Master',
  },
  {
    id: "appt-10",
    clientName: "Bruno Costa",
    dateTime: new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(15, 0, 0, 0)),
    status: "Realizado",
    serviceId: "serv-2",
    clientAvatarUrl: '',
    notes: '',
    admin: 'Admin Comum',
  },
  {
    id: "appt-11",
    clientName: "Carla Dias",
    dateTime: new Date(new Date(new Date().setMonth(new Date().getMonth() - 2)).setHours(10, 0, 0, 0)),
    status: "Realizado",
    serviceId: "serv-4",
    clientAvatarUrl: '',
    notes: '',
    admin: 'Admin Master',
  },
];


export const kpiIcons = {
  gains: CalendarClock,
  cancellations: Ban,
  clients: Users,
  newClients: UserPlus,
};

export const serviceIcons: Record<string, React.ElementType> = {
  Home,
  Briefcase,
  Heart,
  Scissors,
  Smile,
};

export const users: UserProfile[] = [
    { id: 'user-1', name: 'Admin Master', email: 'admin@example.com', role: 'Bifrost' },
    { id: 'user-2', name: 'Heitor V.', email: 'heitor@example.com', role: 'Heimdall' },
    { id: 'user-3', name: 'Laura P.', email: 'laura@example.com', role: 'Asgard' },
    { id: 'user-4', name: 'Pedro M.', email: 'pedro@example.com', role: 'Midgard' },
];


export const chartData = [
  { name: "Jan", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Fev", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Mar", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Abr", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Mai", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Jun", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Jul", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Ago", Math: 45, total: Math.floor(Math.random() * 50) + 10 },
  { name: "Set", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Out", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Nov", total: Math.floor(Math.random() * 50) + 10 },
  { name: "Dez", total: Math.floor(Math.random() * 50) + 10 },
];
