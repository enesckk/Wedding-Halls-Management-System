"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
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
import { getSchedulesByHall, createSchedule, updateSchedule, type UpdateScheduleData } from "@/lib/api/schedules";
import type { Schedule, WeddingHall } from "@/lib/types";
import { useUser } from "@/lib/user-context";
import { isEditor as isEditorRole } from "@/lib/utils/role";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  RefreshCw,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const daysOfWeek = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const monthNames = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

// Müsaitlik saatleri
const TIME_SLOTS = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

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
  const { user } = useUser();
  const isEditor = isEditorRole(user?.role);
  const [halls, setHalls] = useState<WeddingHall[]>([]);
  const [schedules, setSchedules] = useState<ScheduleWithHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHall, setSelectedHall] = useState<string>("all");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedHallForSchedule, setSelectedHallForSchedule] = useState<string>("");
  const [scheduleStatus, setScheduleStatus] = useState<"Available" | "Reserved">("Reserved");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const h = await getHalls();
      setHalls(h ?? []);
      const all: ScheduleWithHall[] = [];
      for (const hall of h ?? []) {
        const list = await getSchedulesByHall(hall.id);
        for (const s of list ?? []) {
          all.push({ ...s, hallName: hall.name });
        }
      }
      setSchedules(all);
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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

  // Saat bazlı müsaitlik durumu hesaplama
  const hourlyAvailability = useMemo(() => {
    const result: Record<string, Record<string, { available: boolean; schedule?: Schedule }>> = {};
    
    // Her saat için
    TIME_SLOTS.forEach((timeSlot) => {
      result[timeSlot] = {};
      
      // Her salon için
      halls.forEach((hall) => {
        // Bu tarih ve saat için schedule bul
        const schedule = schedules.find(
          (s) =>
            s.date === selectedDateStr &&
            s.hallName === hall.name &&
            s.startTime.startsWith(timeSlot)
        );
        
        if (schedule) {
          result[timeSlot][hall.name] = {
            available: schedule.status === "Available",
            schedule,
          };
        } else {
          // Schedule yoksa varsayılan olarak müsait kabul et
          result[timeSlot][hall.name] = {
            available: true,
          };
        }
      });
    });
    
    return result;
  }, [schedules, selectedDateStr, halls]);

  // Seçilen tarih için saat bazlı istatistikler (hourlyAvailability'dan hesapla)
  const availabilityStats = useMemo(() => {
    let totalSlots = 0;
    let availableSlots = 0;
    let reservedSlots = 0;
    
    // Her saat için
    TIME_SLOTS.forEach((timeSlot) => {
      const slotData = hourlyAvailability[timeSlot];
      
      // Her salon için
      halls.forEach((hall) => {
        const availability = slotData?.[hall.name];
        // Tüm salonlar için slot say (schedule yoksa bile müsait kabul et)
        totalSlots++;
        if (availability?.available ?? true) {
          availableSlots++;
        } else {
          reservedSlots++;
        }
      });
    });
    
    const occupancyRate = totalSlots > 0 ? Math.round((reservedSlots / totalSlots) * 100) : 0;
    const availabilityRate = totalSlots > 0 ? Math.round((availableSlots / totalSlots) * 100) : 0;
    
    return {
      available: availableSlots,
      reserved: reservedSlots,
      total: totalSlots,
      occupancyRate,
      availabilityRate,
    };
  }, [hourlyAvailability, halls]);

  // Genel istatistikler (tüm schedule'lar için)
  const overallStats = useMemo(() => {
    if (!schedules || schedules.length === 0) {
      return {
        available: 0,
        reserved: 0,
        total: 0,
        occupancyRate: 0,
        availabilityRate: 0,
      };
    }
    const available = schedules.filter((s) => s.status === "Available").length;
    const reserved = schedules.filter((s) => s.status === "Reserved").length;
    const total = schedules.length;
    const occupancyRate = total > 0 ? Math.round((reserved / total) * 100) : 0;
    const availabilityRate = total > 0 ? Math.round((available / total) * 100) : 0;
    
    return {
      available,
      reserved,
      total,
      occupancyRate,
      availabilityRate,
    };
  }, [schedules]);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Takvim</h1>
          <p className="text-sm text-muted-foreground">
            Salon müsaitliklerini görüntüleyin
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 self-start sm:self-center"
          onClick={() => refresh()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      {/* Genel Doluluk İstatistikleri */}
      {overallStats.total > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-primary">
                  %{overallStats.occupancyRate}
                </div>
                <p className="text-xs text-muted-foreground">Genel Doluluk Oranı</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="mb-1 text-2xl font-bold text-primary">
                  {overallStats.total}
                </div>
                <p className="text-xs text-muted-foreground">Toplam Slot</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-green-600" />
              <div className="text-xl font-bold text-green-700">
                {overallStats.available}
              </div>
              <p className="text-xs text-green-600">Müsait</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <XCircle className="mx-auto mb-1 h-5 w-5 text-red-600" />
              <div className="text-xl font-bold text-red-700">
                {overallStats.reserved}
              </div>
              <p className="text-xs text-red-600">Dolu</p>
            </CardContent>
          </Card>
        </div>
      )}

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

        <div className="lg:col-span-7 space-y-4">
          {/* Seçilen Tarih İçin Doluluk Oranı Kartı */}
          {availabilityStats.total > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="mb-2 text-3xl font-bold text-primary">
                      %{availabilityStats.availabilityRate}
                    </div>
                    <p className="text-xs text-muted-foreground">Müsaitlik Oranı</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${availabilityStats.availabilityRate}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-600" />
                  <div className="text-2xl font-bold text-green-700">
                    {availabilityStats.available}
                  </div>
                  <p className="text-xs text-green-600">Müsait</p>
                </CardContent>
              </Card>
              
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <XCircle className="mx-auto mb-2 h-6 w-6 text-red-600" />
                  <div className="text-2xl font-bold text-red-700">
                    {availabilityStats.reserved}
                  </div>
                  <p className="text-xs text-red-600">Dolu</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
                  {availabilityStats.total > 0 && (
                    <>
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {availabilityStats.total} slot
                      </Badge>
                      <Badge variant="outline" className="ml-1 text-xs">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        %{availabilityStats.occupancyRate} Doluluk
                      </Badge>
                    </>
                  )}
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
              {halls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Salon Bulunamadı
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Saat
                        </th>
                        {halls.map((hall) => (
                          <th
                            key={hall.id}
                            className="px-4 py-3 text-center text-sm font-semibold text-foreground min-w-[120px]"
                          >
                            {hall.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map((timeSlot) => {
                        const hasAnySchedule = halls.some(
                          (hall) => hourlyAvailability[timeSlot]?.[hall.name]?.schedule
                        );
                        
                        return (
                          <tr
                            key={timeSlot}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {timeSlot}
                              </div>
                            </td>
                            {halls.map((hall) => {
                              const availability = hourlyAvailability[timeSlot]?.[hall.name];
                              
                              // Schedule yoksa varsayılan olarak müsait göster
                              const isAvailable = availability?.available ?? true;
                              const schedule = availability?.schedule;
                              
                              const handleCellClick = () => {
                                if (isEditor) {
                                  setSelectedTimeSlot(timeSlot);
                                  setSelectedHallForSchedule(hall.id);
                                  setScheduleStatus(schedule?.status === "Reserved" ? "Available" : "Reserved");
                                  setScheduleDialogOpen(true);
                                }
                              };
                              
                              return (
                                <td
                                  key={hall.id}
                                  className={cn(
                                    "px-4 py-3 text-center",
                                    isEditor && "cursor-pointer hover:bg-muted/30"
                                  )}
                                  onClick={handleCellClick}
                                >
                                  <div
                                    className={cn(
                                      "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                                      isAvailable
                                        ? "bg-green-100 text-green-700 border border-green-200"
                                        : "bg-red-100 text-red-700 border border-red-200"
                                    )}
                                  >
                                    {isAvailable ? (
                                      <>
                                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                        Müsait
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                        Dolu
                                      </>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {availabilityStats.total === 0 && halls.length > 0 && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                      <p className="text-xs text-green-800 text-center">
                        Bu tarihte henüz müsaitlik kaydı oluşturulmamış. Tüm salonlar varsayılan olarak müsait gösterilmektedir.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Düzenleme Dialog'u (Editor için) */}
      {isEditor && (
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Müsaitlik Düzenle</DialogTitle>
              <DialogDescription>
                {selectedDateStr} tarihinde {selectedTimeSlot} saatinde müsaitlik durumunu ayarlayın
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Salon</Label>
                <Select value={selectedHallForSchedule} onValueChange={setSelectedHallForSchedule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Salon seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {halls.map((hall) => (
                      <SelectItem key={hall.id} value={hall.id}>
                        {hall.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tarih</Label>
                <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
                  {selectedDateStr}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Saat</Label>
                <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
                  {selectedTimeSlot}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Durum</Label>
                <Select
                  value={scheduleStatus}
                  onValueChange={(value: "Available" | "Reserved") => setScheduleStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Müsait</SelectItem>
                    <SelectItem value="Reserved">Dolu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setScheduleDialogOpen(false)}
              >
                İptal
              </Button>
              <Button
                onClick={async () => {
                  if (!selectedHallForSchedule || !selectedTimeSlot) {
                    toast.error("Lütfen salon seçin");
                    return;
                  }

                  try {
                    const hall = halls.find((h) => h.id === selectedHallForSchedule);
                    if (!hall) {
                      toast.error("Salon bulunamadı");
                      return;
                    }

                    // Saat aralığını hesapla (örn: 09:00 -> 09:00-10:30)
                    const timeIndex = TIME_SLOTS.indexOf(selectedTimeSlot);
                    const endTime = timeIndex < TIME_SLOTS.length - 1 
                      ? TIME_SLOTS[timeIndex + 1] 
                      : "18:00";

                    const scheduleData: UpdateScheduleData = {
                      weddingHallId: selectedHallForSchedule,
                      date: selectedDateStr,
                      startTime: `${selectedTimeSlot}:00`,
                      endTime: `${endTime}:00`,
                      status: scheduleStatus,
                    };

                    // Mevcut schedule var mı kontrol et
                    const existingSchedule = schedules.find(
                      (s) =>
                        s.weddingHallId === selectedHallForSchedule &&
                        s.date === selectedDateStr &&
                        s.startTime.startsWith(selectedTimeSlot)
                    );

                    if (existingSchedule) {
                      // Güncelle
                      await updateSchedule(existingSchedule.id, scheduleData);
                      toast.success("Müsaitlik güncellendi");
                    } else {
                      // Yeni oluştur
                      await createSchedule(scheduleData);
                      toast.success("Müsaitlik oluşturuldu");
                    }

                    await refresh();
                    setScheduleDialogOpen(false);
                  } catch (e) {
                    toast.error(toUserFriendlyMessage(e));
                  }
                }}
              >
                Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
