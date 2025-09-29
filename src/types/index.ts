

// ========================================
// PERFIS DE USUÁRIOS (profissionais/admins)
// ========================================
export type UserProfile = {
    id: string; // UUID
    created_at?: string;
    full_name: string;
    email: string;
    phone?: string;
    role: 'Bifrost' | 'Heimdall' | 'Asgard' | 'Midgard';
    avatar?: string; // Not in DB schema but useful for UI
    last_sign_in_at?: string; // From auth.users table
    permissions?: { [key: string]: boolean };
};


// ========================================
// PERFIL DO ESTÚDIO
// ========================================
export type StudioProfile = {
    id: string; // UUID
    profile_id: string; // UUID of the owner
    created_at?: string;
    studio_name: string;
    monthly_goal?: number;
    clients_goal?: number;
    new_clients_goal?: number;
    address_street?: string;
    address_number?: string;
    address_complement?: string;
    address_neighborhood?: string;
    address_city?: string;
    address_state?: string;
    address_zip_code?: string;
    google_maps_url?: string;
};


// ========================================
// HORÁRIOS DE FUNCIONAMENTO
// ========================================
export type StudioHour = {
    id: string; // UUID
    profile_id: string; // UUID of the owner
    created_at?: string;
    day_of_week: number; // 0-6
    start_time: string; // "HH:mm:ss"
    end_time: string; // "HH:mm:ss"
    is_enabled: boolean;
};

// ========================================
// CLIENTES
// ========================================
export type Client = {
  id: string; // UUID
  created_at?: string;
  full_name: string;
  email?: string;
  phone?: string;
  notes?: string;
  whatsapp?: string; // Not in DB, but useful from old schema
  telegram?: string; // Not in DB, but useful from old schema
};


// ========================================
// SERVIÇOS
// ========================================
export type Service = {
  id: string; // UUID
  profile_id: string; // UUID of the owner
  created_at?: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  icon?: string;
};

// ========================================
// AGENDAMENTOS
// ========================================
export type AppointmentStatus = 'Agendado' | 'Concluido' | 'Cancelado' | 'Reagendado' | 'Bloqueado';

export type Appointment = {
  id: string; // UUID
  client_id: string;
  service_id: string;
  admin_id: string; // This is the profile_id of the staff who is performing the service
  date_time: string; // TIMESTAMPTZ
  notes?: string;
  status: AppointmentStatus;
  // Joined data for UI
  clients: { full_name: string, whatsapp?: string, telegram?: string } | null;
  services: { name: string; price: number } | null;
  profiles?: { full_name: string } | null;
};


export type AppointmentReport = {
    id: string;
    dateTime: string;
    notes: string;
    status: AppointmentStatus;
    clientName: string;
    whatsapp: string;
    telegram?: string;
    admin: string;
    serviceId: string;
}

export type RoleSettings = {
  name: 'Bifrost' | 'Heimdall' | 'Asgard';
  description: string;
  permissions: { [key: string]: boolean };
};

export type GaiaLog = {
  id: number;
  created_at: string;
  message_content: string;
  sent_to: string;
  status: string;
};

export type AppNotification = {
  id: string;
  title: string;
  read: boolean;
  timestamp: Date;
  href?: string;
};

export type GaiaMessageTemplate = {
    id: number;
    created_at: string;
    event_type: string;
    template: string;
    is_enabled: boolean;
    description: string;
};

// From the new schema, these might be useful later
export type AppointmentReminder = {
    id: string;
    appointment_id: string;
    reminder_time: string;
    sent: boolean;
};

export type AppointmentCancellation = {
    id: string;
    appointment_id: string;
    cancelled_by_type: 'client' | 'profile';
    client_id?: string;
    profile_id?: string;
    reason?: string;
    cancelled_at: string;
}

export type AuditLog = {
    id: string;
    payload: any;
    timestamp: Date;
}
