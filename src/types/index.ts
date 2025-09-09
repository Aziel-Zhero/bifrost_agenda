
export type Client = {
  id: string;
  name: string;
  whatsapp: string;
  telegram?: string;
  avatarUrl: string;
  email: string;
  admin: string;
};

export type AppointmentStatus = 'Agendado' | 'Realizado' | 'Cancelado' | 'Bloqueado';

export type Appointment = {
  id: string;
  clientName: string;
  clientAvatarUrl: string;
  dateTime: Date;
  notes: string;
  status: AppointmentStatus;
  admin: string;
  serviceId: string;
};

export type AppointmentReport = Appointment & {
  whatsapp: string;
  telegram?: string;
}

export type Service = {
  id: string;
  name: string;
  duration: string; // e.g., "30 min", "1 hora"
  price: number;
  icon?: string;
};

export type UserProfile = {
    id: string;
    name: string;
    email: string;
    role: 'Bifrost' | 'Heimdall' | 'Asgard' | 'Midgard';
    permissions: {
      [key: string]: boolean; // key is the route href
    }
}
