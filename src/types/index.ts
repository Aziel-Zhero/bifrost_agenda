export type Client = {
  id: string;
  name: string;
  whatsapp: string;
  telegram?: string;
  avatarUrl: string;
  email: string;
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
};
