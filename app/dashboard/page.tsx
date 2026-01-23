import { CalendarView } from "@/components/calendar-view";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ana Sayfa</h1>
        <p className="text-muted-foreground">
          Nikah salonları doluluk durumunu görüntüleyin ve yönetin
        </p>
      </div>
      <CalendarView />
    </div>
  );
}
