
"use client";

import { useState, useMemo, useEffect } from 'react';
import { isSameDay, format, isBefore, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import type { Appointment } from '@/types';
import { supabase } from '@/lib/supabase/client';

type AppointmentsByDay = {
  [day: string]: {
    [admin: string]: string[]; // Array of appointment times
  };
};

export default function AgendaGeralPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase.from('appointments').select('id, date_time, admin_id'); // Assuming admin_id maps to a user
       if (error) {
        console.error("Error fetching appointments", error);
      } else {
        const formattedAppointments = data.map((appt: any) => ({
          id: appt.id,
          dateTime: new Date(appt.date_time),
          admin: appt.admin_id, // This will be a UUID, you might need to fetch user names
          // Add dummy values for other required Appointment fields
          clientName: '',
          clientAvatarUrl: '',
          notes: '',
          status: 'Agendado',
          serviceId: '',
        }));
        setAppointments(formattedAppointments);
      }
    };
    fetchAppointments();
  }, []);

  const appointmentsByDay = useMemo(() => {
    return appointments.reduce((acc, appt) => {
      const day = format(appt.dateTime, 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = {};
      }
      const adminName = `User ${appt.admin.substring(0, 4)}`; // Placeholder for admin name
      if (!acc[day][adminName]) {
        acc[day][adminName] = [];
      }
      acc[day][adminName].push(format(appt.dateTime, 'HH:mm'));
      acc[day][adminName].sort();
      return acc;
    }, {} as AppointmentsByDay);
  }, [appointments]);

  const DayWithAppointments = ({ date }: { date: Date }) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const dayAppointments = appointmentsByDay[dayKey];
    const admins = dayAppointments ? Object.keys(dayAppointments) : [];
    const maxVisibleAdmins = 2;
    const visibleAdmins = admins.slice(0, maxVisibleAdmins);
    const hiddenAdminsCount = admins.length - maxVisibleAdmins;
    
    const isPast = isBefore(date, startOfToday()) && !isSameDay(date, new Date());

    if (isPast) {
      return (
         <div className="h-full w-full p-2 flex flex-col bg-gradient-to-b from-[#A5F3FC] via-[#C4B5FD] to-[#E0E7FF]">
            <span className="font-semibold text-primary-foreground">{format(date, 'd')}</span>
        </div>
      )
    }

    if (!dayAppointments) {
      return <div className="h-full w-full p-2">{format(date, 'd')}</div>;
    }
    
    return (
      <div className="h-full w-full p-2 flex flex-col">
        <span className="font-semibold">{format(date, 'd')}</span>
        <div className="mt-1 space-y-1 overflow-y-auto">
          {visibleAdmins.map(admin => (
            <Popover key={admin}>
              <PopoverTrigger asChild>
                <div className="text-xs bg-primary/10 text-primary font-semibold p-1 rounded-md cursor-pointer hover:bg-primary/20 truncate">
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
          ))}
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
       <div>
        <h1 className="text-2xl font-bold">Agenda Geral</h1>
        <p className="text-muted-foreground">
          Visão geral de todos os agendamentos do estúdio.
        </p>
      </div>

       <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Calendar
          mode="single"
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          className="w-full p-0"
          locale={ptBR}
          classNames={{
            months: 'h-full',
            month: 'w-full h-full flex flex-col',
            table: 'w-full h-full border-separate border-spacing-0',
            head_row: 'flex w-full',
            head_cell: 'flex-1 text-muted-foreground rounded-md w-full font-normal text-[0.8rem] capitalize py-2 border-b border-r',
            row: 'flex w-full',
            cell: cn(
              "h-24 sm:h-28 w-full text-left text-sm p-0 relative border-b border-r",
               "[&:nth-child(7n)]:border-r-0"
            ),
            day: 'h-full w-full focus-within:relative focus-within:z-20',
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
