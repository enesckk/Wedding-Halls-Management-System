"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getHalls } from "@/lib/api/halls";
import { getSchedulesByHall } from "@/lib/api/schedules";
import type { Schedule, WeddingHall } from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const daysOfWeek = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const monthNames = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function formatDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTimeRange(s: Schedule): string {
  const start = s.startTime.slice(0, 5);
  const end = s.endTime.slice(0, 5);
  return `${start} - ${end}`;
}

type ScheduleWithHall = Schedule & { hallName: string };

export default function TakvimPage() {
  const [halls, setHalls] = useState<WeddingHall[]>([]);
  const [schedules, setSchedules] = useState<ScheduleWithHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHall, setSelectedHall] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const h = await getHalls();
        if (cancelled) return;
        setHalls(h ?? []);
        const all: ScheduleWithHall[] = [];
        for (const hall of h ?? []) {
          const list = await getSchedulesByHall(hall.id);
          for (const s of list ?? []) {
            all.push({ ...s, hallName: hall.name });
          }
        }
        if (!cancelled) setSchedules(all);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Veri yüklenemedi.";
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  };

  const navigateMonth = (delta: number) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1)
    );
  };

  const isToday = (d: Date) => {
    const t = new Date();
    return (
      d.getDate() === t.getDate() &&
      d.getMonth() === t.getMonth() &&
      d.getFullYear() === t.getFullYear()
    );
  };

  const isSelected = (d: Date) =>
    selectedDate &&
    d.getDate() === selectedDate.getDate() &&
    d.getMonth() === selectedDate.getMonth() &&
    d.getFullYear() === selectedDate.getFullYear();

  const isCurrentMonth = (d: Date) =>
    d.getMonth() === currentDate.getMonth();

  const selectedDateStr = formatDateString(selectedDate);
  const selectedDateSchedules = useMemo(() => {
    let list = schedules.filter((s) => s.date === selectedDateStr);
    if (selectedHall && selectedHall !== "all") {
      const hall = halls.find((h) => h.id === selectedHall);
      if (hall) list = list.filter((s) => s.hallName === hall.name);
    }
    return list.sort((a, b) =>
      `${a.startTime} ${a.hallName}`.localeCompare(`${b.startTime} ${b.hallName}`)
    );
  }, [schedules, selectedDateStr, selectedHall, halls]);

  const days = getDaysInMonth(currentDate);

  const getEventsForDate = (d: Date) => {
    const ds = formatDateString(d);
    return schedules.filter((s) => s.date === ds);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Takvim</h1>
        <p className="text-sm text-muted-foreground">
          Salon müsaitliklerini görüntüleyin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigateMonth(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigateMonth(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-1 grid grid-cols-7 gap-1">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  const dayEvents = getEventsForDate(day);
                  const hasEvents = dayEvents.length > 0;
                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "relative aspect-square rounded-lg p-1 text-sm transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                        !isCurrentMonth(day) && "text-muted-foreground/40",
                        isToday(day) && "bg-primary text-primary-foreground hover:bg-primary/90",
                        isSelected(day) && !isToday(day) && "bg-secondary text-primary ring-2 ring-primary"
                      )}
                    >
                      {day.getDate()}
                      {hasEvents && !isToday(day) && (
                        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                          {dayEvents.slice(0, 3).map((_, j) => (
                            <div
                              key={j}
                              className="h-1.5 w-1.5 rounded-full bg-primary"
                            />
                          ))}
                        </div>
                      )}
                      {hasEvents && isToday(day) && (
                        <div className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-medium text-primary">
                          {dayEvents.length}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full bg-transparent"
                onClick={() => {
                  setSelectedDate(new Date());
                  setCurrentDate(new Date());
                }}
              >
                Bugüne Git
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {selectedDateSchedules.length} müsaitlik
                  </Badge>
                </CardTitle>
                <Select value={selectedHall} onValueChange={setSelectedHall}>
                  <SelectTrigger className="h-9 w-full text-sm sm:w-[180px]">
                    <SelectValue placeholder="Tüm Salonlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Salonlar</SelectItem>
                    {halls.map((hall) => (
                      <SelectItem key={hall.id} value={hall.id}>
                        {hall.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedDateSchedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Müsaitlik Bulunamadı
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bu tarihte müsaitlik kaydı yok
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateSchedules.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {s.hallName}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTimeRange(s)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {s.hallName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={s.status === "Available" ? "default" : "secondary"}
                        className={
                          s.status === "Available"
                            ? "bg-primary/10 text-primary"
                            : ""
                        }
                      >
                        {s.status === "Available" ? "Müsait" : "Dolu"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
