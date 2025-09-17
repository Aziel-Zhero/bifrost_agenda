

export type Client = {
  id: string;
  name: string;
  whatsapp: string;
  telegram?: string;
  admin: string;
  created_at?: string;
};

export type AppointmentStatus = 'Agendado' | 'Realizado' | 'Cancelado' | 'Bloqueado' | 'Reagendado';

export type Appointment = {
  id: string;
  date_time: string; // Changed to string to match Supabase return
  notes: string;
  status: AppointmentStatus;
  admin_id: string;
  service_id: string;
  client_id: string;
  // Nested properties for joins
  clients: { name: string, telegram?: string } | null;
  services: { name: string; price: number } | null;
  profiles?: { name: string } | null;
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
    avatar?: string;
    role: 'Bifrost' | 'Heimdall' | 'Asgard' | 'Midgard';
    permissions: {
      [key: string]: boolean; // key is the route href
    },
    last_sign_in_at?: string;
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

export type StudioProfile = {
    id: number; // Should only be one row with id 1
    created_at: string;
    studio_name: string;
    monthly_goal: number;
    clients_goal: number;
    new_clients_goal: number;
    google_maps_url?: string;
    address_street?: string;
    address_number?: string;
    address_complement?: string;
    address_neighborhood?: string;
    address_city?: string;
    address_state?: string;
    address_zip_code?: string;
}

export type RoleSettings = {
  name: 'Bifrost' | 'Heimdall' | 'Asgard' | 'Midgard';
  description: string;
  permissions: { [key: string]: boolean };
  isFixed?: boolean; // Indicates if permissions can be changed
};

export type GaiaLog = {
  id: number;
  created_at: string;
  message_content: string;
  sent_to: string;
  status: string;
};

export type AppointmentReminder = {
    id: number;
    appointment_id: string;
    sent_at: string;
    status: string;
};

export type AppNotification = {
  id: string;
  title: string;
  read: boolean;
  timestamp: Date;
  href?: string;
};

export type ApiIntegration = {
    id: number;
    created_at: string;
    name: string;
    webhook_url?: string;
    api_key?: string;
};

export type GaiaMessageTemplate = {
    id: number;
    created_at: string;
    event_type: string;
    template: string;
    is_enabled: boolean;
    description: string;
};

export type AndromedaTrigger = {
    id: number;
    created_at: string;
    trigger_keywords: string[];
    action_type: string;
    response_text: string;
    response_buttons?: any; // JSONB
    is_enabled: boolean;
    description: string;
}
