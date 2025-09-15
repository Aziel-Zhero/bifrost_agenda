import type { ReactNode } from "react";
import Header from "@/components/dashboard/header";
import RealtimeNotifier from "@/components/dashboard/realtime-notifier";
import { NotificationProvider } from "@/contexts/notification-context";

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
        <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        <RealtimeNotifier />
        </div>
    </NotificationProvider>
  );
}
