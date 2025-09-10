
export type Client = {
  id: string;
  name: string;
  whatsapp: string;
  telegram?: string;
  admin: string;
  created_at?: string; // Add created_at as optional
};

export type AppointmentStatus = 'Agendado' | 'Realizado' | 'Cancelado' | 'Bloqueado';

export type Appointment = {
  id: string;
  dateTime: string; // Changed to string to match Supabase return
  notes: string;
  status: AppointmentStatus;
  admin_id: string;
  service_id: string;
  client_id: string;
  // Nested properties for joins
  clients: { name: string; created_at: string } | null;
  services: { name: string; price: number } | null;
};


export type AppointmentReport = Appointment & {
  whatsapp: string;
  telegram?: string;
  admin: string;
}

export type Service = {
  id: string;
  name: string;
  duration: number; // Stored in minutes
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

export type AuditLog = {
    id: string;
    payload: {
        message?: string;
        record?: any;
    };
    timestamp: Date;
}

export type StudioHour = {
    id: number;
    created_at: string;
    day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
    start_time: string; // e.g., "09:00"
    end_time: string;   // e.g., "18:00"
    is_enabled: boolean;
}
