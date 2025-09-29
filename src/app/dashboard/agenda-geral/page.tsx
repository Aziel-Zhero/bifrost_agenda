
"use client";

import { useState, useMemo, useEffect } from 'react';
import { isSameDay, format, isBefore, startOfToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import type { Appointment, UserProfile } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { sendAppointmentReminders } from '@/app/actions';

type AppointmentsByDay = {
  [day: string]: {
    [admin: string]: string[]; // Array of appointment times
  };
};

type AdminMap = {
    [id: string]: string;
}

type AdminColorMap = {
    [name: string]: { bg: string; text: string };
}

const colorPalette = [
    { bg: 'bg-blue-100', text: 'text-blue-800' },
    { bg: 'bg-purple-100', text: 'text-purple-800' },
    { bg: 'bg-green-100', text: 'text-green-800' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    { bg: 'bg-pink-100', text: 'text-pink-800' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800' },
];

export default function AgendaGeralPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [adminMap, setAdminMap] = useState<AdminMap>({});
  const [adminColorMap, setAdminColorMap] = useState<AdminColorMap>({});

  useEffect(() => {
    // Fire-and-forget the reminder check
    sendAppointmentReminders();

    const fetchData = async () => {
      // Fetch users to create a map of ID -> Name and assign colors
      const { data: profiles, error: profileError } = await supabase.from('profiles').select('id, full_name');
      if (profileError) {
        console.error("Error fetching profiles", profileError);
      } else {
        const newAdminMap = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile.full_name;
            return acc;
        }, {} as AdminMap);
        setAdminMap(newAdminMap);

        const newAdminColorMap = profiles.reduce((acc, profile, index) => {
            acc[profile.full_name] = colorPalette[index % colorPalette.length];
            return acc;
        }, {} as AdminColorMap);
        setAdminColorMap(newAdminColorMap);
      }
      
      const { data, error } = await supabase.from('appointments').select('id, date_time, admin_id');
       if (error) {
        console.error("Error fetching appointments", error);
      } else {
        setAppointments(data || []);
      }
    };
    fetchData();
  }, []);

  const appointmentsByDay = useMemo(() => {
    return appointments.reduce((acc, appt) => {
      const day = format(parseISO(appt.date_time), 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = {};
      }
      const adminName = adminMap[appt.admin_id] || `Usuário (${appt.admin_id.substring(0, 4)})`;
      if (!acc[day][adminName]) {
        acc[day][adminName] = [];
      }
      acc[day][adminName].push(format(parseISO(appt.date_time), 'HH:mm'));
      acc[day][adminName].sort();
      return acc;
    }, {} as AppointmentsByDay);
  }, [appointments, adminMap]);

  const DayWithAppointments = ({ date }: { date: Date }) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayAppointments = appointmentsByDay[dayKey];
    const admins = dayAppointments ? Object.keys(dayAppointments) : [];
    const maxVisibleAdmins = 2;
    const visibleAdmins = admins.slice(0, maxVisibleAdmins);
    const hiddenAdminsCount = admins.length - maxVisibleAdmins;
    
    if (!dayAppointments) {
      return <div className="h-full w-full p-2">{format(date, 'd')}</div>;
    }
    
    return (
      <div className="h-full w-full p-2 flex flex-col">
        <span className="font-semibold">{format(date, 'd')}</span>
        <div className="mt-1 space-y-1 overflow-y-auto">
          {visibleAdmins.map(admin => {
             const color = adminColorMap[admin] || colorPalette[0];
             return (
                <Popover key={admin}>
                <PopoverTrigger asChild>
                    <div className={cn("text-xs font-semibold p-1 rounded-md cursor-pointer hover:opacity-80 truncate", color.bg, color.text)}>
                    {admin}
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                    <div className="space-y-2">
                        <h4 className="font-semibold">{admin}</h4>
                        <p className="text-sm text-muted-foreground">
                            Horários em {format(date, 'dd/MM/yyyy')}
                        </p>
                        <ul className="list-disc list-inside">
                            {dayAppointments[admin].map(time => (
                                <li key={time} className="text-sm">{time}</li>
                            ))}
                        </ul>
                    </div>
                </PopoverContent>
                </Popover>
             )
          })}
          {hiddenAdminsCount > 0 && (
             <div className="text-xs text-muted-foreground p-1 rounded-md">
              + {hiddenAdminsCount} usuários
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col gap-8">
       <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda Geral</h1>
          <p className="text-muted-foreground">
            Visão geral de todos os agendamentos do estúdio.
          </p>
        </div>
      </div>

       <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="w-full p-0"
          locale={ptBR}
          classNames={{
            caption: "flex justify-center pt-1 relative items-center p-4",
            months: 'h-full',
            month: 'w-full h-full flex flex-col',
            table: 'w-full h-full border-separate border-spacing-0',
            head_row: 'flex w-full py-4',
            head_cell: 'flex-1 text-muted-foreground rounded-md w-full font-normal text-[0.8rem] capitalize py-2 border-b border-r',
            row: 'flex w-full',
            cell: "h-24 sm:h-32 lg:h-36 xl:h-40 w-full text-left text-sm p-0 relative border-b border-r [&:nth-child(7n)]:border-r-0",
            day: (date) => cn(
                "h-full w-full focus-within:relative focus-within:z-20",
                 isBefore(date, startOfToday()) && "opacity-60"
            ),
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
          }}
          components={{
            Day: ({ date }) => <DayWithAppointments date={date} />,
          }}
        />
       </div>
    </div>
  );
}

    