import { CalendarView } from "@/components/calendar-view";

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Ana Sayfa</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Nikah salonları doluluk durumunu görüntüleyin ve yönetin
        </p>
      </div>
      <CalendarView />
    </div>
  );
}
