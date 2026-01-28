"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getHalls } from "@/lib/api/halls";
import { getSchedulesByHall } from "@/lib/api/schedules";
import { getRequests } from "@/lib/api/requests";
import type { Schedule, WeddingHall, Request } from "@/lib/types";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SLOTS = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];
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

type ScheduleWithHall = Schedule & { 
  hallName: string;
  eventName?: string;
  eventOwner?: string;
  eventType?: number;
  requestId?: string;
};

export function CalendarView() {
  const router = useRouter();
  const [halls, setHalls] = useState<WeddingHall[]>([]);
  const [schedules, setSchedules] = useState<ScheduleWithHall[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ScheduleWithHall | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const h = await getHalls();
      setHalls(h ?? []);
      
      // Schedule'ları çek
      const all: ScheduleWithHall[] = [];
      for (const hall of h ?? []) {
        const list = await getSchedulesByHall(hall.id);
        for (const s of list ?? []) {
          all.push({ ...s, hallName: hall.name });
        }
      }
      
      // Request'leri çek (onaylanmış olanlar)
      const allRequests = await getRequests();
      const answeredRequests = allRequests.filter(r => r.status === "Answered");
      setRequests(answeredRequests);
      
      // Schedule'larla Request'leri eşleştir (eventName ekle)
      const schedulesWithEvents = all.map(schedule => {
        // Request'i bul: aynı salon, tarih ve saat
        const matchingRequest = answeredRequests.find(req => {
          // Tarih formatını normalize et (YYYY-MM-DD)
          let reqDate = req.eventDate;
          if (reqDate.includes('T')) {
            reqDate = reqDate.split('T')[0];
          }
          const scheduleDate = schedule.date.split('T')[0]; // ISO date varsa sadece tarih kısmını al
          
          // Saat formatını normalize et (HH:mm)
          let reqTime = req.eventTime;
          if (reqTime.includes(':')) {
            reqTime = reqTime.slice(0, 5); // HH:mm formatına çevir
          }
          let scheduleTime = schedule.startTime;
          if (scheduleTime.includes(':')) {
            scheduleTime = scheduleTime.slice(0, 5); // HH:mm formatına çevir
          }
          
          return req.weddingHallId === schedule.weddingHallId &&
                 reqDate === scheduleDate &&
                 reqTime === scheduleTime;
        });
        
        return {
          ...schedule,
          eventName: matchingRequest?.eventName,
          eventOwner: matchingRequest?.eventOwner,
          eventType: matchingRequest?.eventType,
          requestId: matchingRequest?.id,
        };
      });
      
      setSchedules(schedulesWithEvents);
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const todayStr = useMemo(() => formatDateString(new Date()), []);
  const selectedStr = selectedDate ? formatDateString(selectedDate) : null;

  const schedulesForDate = useMemo(() => {
    if (!selectedStr) return [];
    return schedules.filter((s) => s.date === selectedStr);
  }, [schedules, selectedStr]);

  const schedulesToday = useMemo(() => {
    return schedules.filter((s) => {
      // Tarih formatını normalize et
      let sDate = s.date;
      if (sDate.includes('T')) {
        sDate = sDate.split('T')[0];
      }
      return sDate === todayStr;
    });
  }, [schedules, todayStr]);

  // Bugünkü rezervasyon sayısı (sadece Reserved olanlar)
  const todayReserved = useMemo(
    () => schedulesToday.filter((s) => s.status === "Reserved").length,
    [schedulesToday]
  );

  // Müsait saat sayısı: Tüm salonlar × Tüm saatler - Reserved olanlar
  // Schedule yoksa varsayılan olarak müsait kabul et
  const todayAvailable = useMemo(() => {
    if (halls.length === 0) return 0;
    
    // Tüm salonlar için tüm saatler = toplam slot sayısı
    const totalSlots = halls.length * SLOTS.length;
    
    // Bugünkü Reserved schedule sayısı
    const reservedCount = schedulesToday.filter((s) => s.status === "Reserved").length;
    
    // Müsait saat = Toplam slot - Reserved
    return Math.max(0, totalSlots - reservedCount);
  }, [halls, schedulesToday]);

  // Toplam kapasite (güvenli hesaplama)
  const totalCapacity = useMemo(() => {
    if (!halls || halls.length === 0) return 0;
    return halls.reduce((acc, h) => acc + (h.capacity || 0), 0);
  }, [halls]);

  const getSlotStatus = useCallback(
    (hallId: string, slotTime: string): { status: "available" | "booked"; eventName?: string } => {
      if (!schedulesForDate || schedulesForDate.length === 0) {
        return { status: "available" }; // Schedule yoksa varsayılan olarak müsait
      }
      const s = schedulesForDate.find(
        (x) => x.weddingHallId === hallId && x.startTime.slice(0, 5) === slotTime
      );
      if (!s) return { status: "available" }; // Schedule yoksa varsayılan olarak müsait
      return {
        status: s.status === "Reserved" ? "booked" : "available",
        eventName: s.eventName
      };
    },
    [schedulesForDate]
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;
    const days: Date[] = [];
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    const lastDay = new Date(year, month + 1, 0);
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  const isToday = (date: Date) => {
    const t = new Date();
    return (
      date.getDate() === t.getDate() &&
      date.getMonth() === t.getMonth() &&
      date.getFullYear() === t.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) =>
    date.getMonth() === currentDate.getMonth();

  const days = getDaysInMonth(currentDate);

  const todayReservations = useMemo(
    () => {
      if (!schedulesToday || schedulesToday.length === 0) return [];
      return schedulesToday
        .filter((s) => s.status === "Reserved")
        .map((s) => ({
          ...s,
          eventName: (s as ScheduleWithHall).eventName || "Etkinlik Adı Yok",
          eventOwner: (s as ScheduleWithHall).eventOwner || "Bilinmiyor",
          eventType: (s as ScheduleWithHall).eventType,
        }))
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .slice(0, 5);
    },
    [schedulesToday]
  );

  const getEventTypeName = (eventType?: number): string => {
    switch (eventType) {
      case 0:
        return "Nikah";
      case 1:
        return "Nişan";
      case 2:
        return "Konser";
      case 3:
        return "Toplantı";
      case 4:
        return "Özel Etkinlik";
      default:
        return "Etkinlik";
    }
  };

  function formatTimeRange(s: Schedule): string {
    const start = s.startTime.slice(0, 5);
    const end = s.endTime.slice(0, 5);
    return `${start} - ${end}`;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div />
        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start sm:self-center"
          onClick={() => refresh()}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Yenile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {todayReserved ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  Bugünkü Rezervasyon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {todayAvailable ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Müsait Saat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalCapacity ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Toplam Kapasite</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {halls?.length ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Aktif Salon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mini Calendar */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground">
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
            <div className="grid grid-cols-7 gap-1">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              {days.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square rounded-lg p-1 text-sm transition-colors hover:bg-muted",
                    !isCurrentMonth(day) && "text-muted-foreground/50",
                    isToday(day) &&
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                    isSelected(day) &&
                      !isToday(day) &&
                      "bg-secondary text-primary",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  )}
                >
                  {day.getDate()}
                </button>
              ))}
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
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Renk Kodları
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">Müsait</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-xs text-muted-foreground">Dolu</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Grid */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground">
                {selectedDate
                  ? `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                  : "Tarih Seçin"}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "day" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("day")}
                >
                  Gün
                </Button>
                <Button
                  variant={viewMode === "week" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                >
                  Hafta
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-xs font-medium text-muted-foreground">
                      Salon
                    </th>
                    {SLOTS.map((slot) => (
                      <th
                        key={slot}
                        className="p-2 text-center text-xs font-medium text-muted-foreground"
                      >
                        {slot}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {halls.map((hall) => (
                    <tr key={hall.id} className="border-t border-border">
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/dashboard/${hall.id}`)}
                          className="text-left text-sm font-medium text-foreground hover:text-primary"
                        >
                          {hall.name.length > 20
                            ? hall.name.substring(0, 18) + "..."
                            : hall.name}
                        </button>
                      </td>
                      {SLOTS.map((slot) => {
                        const slotInfo = getSlotStatus(hall.id, slot);
                        const isBooked = slotInfo.status === "booked";
                        return (
                          <td key={slot} className="p-1 text-center align-top">
                            <button
                              type="button"
                              onClick={() =>
                                !isBooked &&
                                router.push(`/dashboard/${hall.id}`)
                              }
                              className={cn(
                                "mx-auto flex min-h-[48px] w-full max-w-[90px] items-center justify-center rounded-md px-1.5 py-1.5 text-[10px] font-medium leading-tight transition-colors",
                                !isBooked &&
                                  "bg-green-100 hover:bg-green-200 cursor-pointer",
                                isBooked &&
                                  "bg-red-100 cursor-not-allowed text-red-800 hover:bg-red-200"
                              )}
                              title={
                                !isBooked
                                  ? "Müsait — Detay için tıklayın"
                                  : slotInfo.eventName 
                                    ? `${slotInfo.eventName} - Dolu`
                                    : "Dolu"
                              }
                            >
                              {isBooked && slotInfo.eventName ? (
                                <span className="line-clamp-2 break-words text-center">
                                  {slotInfo.eventName.length > 15
                                    ? slotInfo.eventName.substring(0, 13) + "..."
                                    : slotInfo.eventName}
                                </span>
                              ) : isBooked ? (
                                <span className="text-[9px] opacity-70">Dolu</span>
                              ) : (
                                <span className="text-[8px] text-green-700 opacity-50">Müsait</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Reservations */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Bugünkü Rezervasyonlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayReservations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 py-8 text-center">
                <CalendarIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Bugün için rezervasyon yok
                </p>
              </div>
            ) : (
              todayReservations.map((r, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <CalendarIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {(r as ScheduleWithHall).eventName || "Etkinlik Adı Yok"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTimeRange(r)} • {r.hallName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-700"
                    >
                      Dolu
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedReservation(r as ScheduleWithHall);
                        setDetailDialogOpen(true);
                      }}
                    >
                      Detay
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detay Dialog'u */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rezervasyon Detayları</DialogTitle>
            <DialogDescription>
              {selectedReservation && (
                <>
                  {selectedReservation.eventName || "Rezervasyon Detayları"} - {formatTimeRange(selectedReservation)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Etkinlik Adı</Label>
                <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
                  {selectedReservation.eventName || "Etkinlik Adı Yok"}
                </div>
              </div>
              {selectedReservation.eventOwner && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Rezervasyon Yapan</Label>
                  <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
                    {selectedReservation.eventOwner}
                  </div>
                </div>
              )}
              {selectedReservation.eventType !== undefined && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Etkinlik Tipi</Label>
                  <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
                    {getEventTypeName(selectedReservation.eventType)}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Tarih</Label>
                <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
                  {selectedReservation.date.split('T')[0]}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Saat Aralığı</Label>
                <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
                  {formatTimeRange(selectedReservation)}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Salon</Label>
                <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
                  {selectedReservation.hallName}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
