"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createRequest } from "@/lib/api/requests";
import { getHalls } from "@/lib/api/halls";
import { getSchedulesByHall } from "@/lib/api/schedules";
import { getCenterById } from "@/lib/api/centers";
import type { Center } from "@/lib/api/centers";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { toast } from "sonner";
import { Calendar, Clock, Building2, User, FileText, Send, CheckCircle2, XCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import type { WeddingHall, Schedule } from "@/lib/types";
import { useUser } from "@/lib/user-context";
import { isViewer } from "@/lib/utils/role";
import { Unauthorized } from "@/components/unauthorized";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { value: 0, label: "Nikah" },
  { value: 1, label: "Nişan" },
  { value: 2, label: "Konser" },
  { value: 3, label: "Toplantı" },
  { value: 4, label: "Özel" },
];

/** İzin verilen başlangıç saatleri (takvim/dashboard ile uyumlu) */
const TIME_SLOTS = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

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

export default function TalepEtPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useUser();
  const [halls, setHalls] = useState<WeddingHall[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [center, setCenter] = useState<Center | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [formData, setFormData] = useState({
    eventType: "",
    eventName: "",
    eventOwner: "",
    weddingHallId: "",
    eventDate: "",
    eventTime: "",
    message: "",
  });

  const loadHalls = useCallback(async () => {
    try {
      const data = await getHalls();
      setHalls(data);
      
      // Query parametresinden salon ID'sini al ve otomatik seç
      const hallId = searchParams.get("hallId");
      if (hallId) {
        const selectedHall = data.find(h => h.id === hallId);
        if (selectedHall) {
          setFormData(prev => ({ ...prev, weddingHallId: hallId }));
          // Merkez bilgisini de yükle
          try {
            const centerData = await getCenterById(selectedHall.centerId);
            setCenter(centerData);
          } catch (e) {
            console.error("Error loading center:", e);
          }
        }
      }
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const loadSchedules = useCallback(async () => {
    if (!formData.weddingHallId) {
      setSchedules([]);
      return;
    }
    try {
      const data = await getSchedulesByHall(formData.weddingHallId);
      setSchedules(data ?? []);
    } catch (e) {
      console.error("Error loading schedules:", e);
      setSchedules([]);
    }
  }, [formData.weddingHallId]);

  useEffect(() => {
    loadHalls();
  }, [loadHalls]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

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

  const isSelected = (d: Date) => {
    if (!formData.eventDate) return false;
    const selected = new Date(formData.eventDate);
    return (
      d.getDate() === selected.getDate() &&
      d.getMonth() === selected.getMonth() &&
      d.getFullYear() === selected.getFullYear()
    );
  };

  const isCurrentMonth = (d: Date) =>
    d.getMonth() === currentDate.getMonth();

  const getEventsForDate = (d: Date) => {
    if (!formData.weddingHallId) return [];
    const ds = formatDateString(d);
    return schedules.filter((s) => {
      let sDate = s.date;
      if (sDate.includes('T')) {
        sDate = sDate.split('T')[0];
      }
      // Salon ID'sine göre filtrele (güvenlik için)
      return sDate === ds && s.status === "Reserved" && s.weddingHallId === formData.weddingHallId;
    });
  };

  const getAvailabilityForDate = (d: Date) => {
    if (!formData.weddingHallId) {
      return { reserved: 0, available: TIME_SLOTS.length, total: TIME_SLOTS.length };
    }
    const dateStr = formatDateString(d);
    const dateSchedules = schedules.filter((s) => {
      let sDate = s.date;
      if (sDate.includes('T')) {
        sDate = sDate.split('T')[0];
      }
      // Salon ID'sine göre filtrele (güvenlik için)
      return sDate === dateStr && s.weddingHallId === formData.weddingHallId;
    });
    const reservedCount = dateSchedules.filter((s) => s.status === "Reserved").length;
    const totalSlots = TIME_SLOTS.length;
    const availableCount = totalSlots - reservedCount;
    return { reserved: reservedCount, available: availableCount, total: totalSlots };
  };

  const getTimeSlotAvailability = (dateStr: string) => {
    if (!formData.weddingHallId) {
      return TIME_SLOTS.map((slot) => ({
        time: slot,
        status: "available" as const,
        eventName: null,
      }));
    }
    const dateSchedules = schedules.filter((s) => {
      let sDate = s.date;
      if (sDate.includes('T')) {
        sDate = sDate.split('T')[0];
      }
      // Salon ID'sine göre filtrele (güvenlik için)
      return sDate === dateStr && s.weddingHallId === formData.weddingHallId;
    });

    return TIME_SLOTS.map((slot) => {
      const schedule = dateSchedules.find((s) => {
        const startTime = s.startTime.slice(0, 5);
        return startTime === slot;
      });
      return {
        time: slot,
        status: schedule?.status === "Reserved" ? "reserved" : "available",
        eventName: schedule?.eventName || null,
      };
    });
  };

  const days = getDaysInMonth(currentDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.eventType ||
      !formData.eventName.trim() ||
      !formData.eventOwner.trim() ||
      !formData.weddingHallId ||
      !formData.eventDate ||
      !formData.eventTime
    ) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    // Geçmiş tarih kontrolü
    const selectedDate = new Date(formData.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error("Geçmiş bir tarih seçemezsiniz. Lütfen bugün veya gelecekteki bir tarih seçin.");
      return;
    }

    // Bugün seçildiyse saat kontrolü
    if (selectedDate.getTime() === today.getTime()) {
      const selectedTime = formData.eventTime.split(":");
      const selectedHour = parseInt(selectedTime[0]);
      const selectedMinute = parseInt(selectedTime[1]);
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute <= currentMinute)) {
        toast.error("Geçmiş bir saat seçemezsiniz. Lütfen gelecekteki bir saat seçin.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await createRequest({
        weddingHallId: formData.weddingHallId,
        message: formData.message.trim() || "Açıklama yok",
        eventType: parseInt(formData.eventType),
        eventName: formData.eventName.trim(),
        eventOwner: formData.eventOwner.trim(),
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
      });
      toast.success("Talep başarıyla oluşturuldu.");
      router.push("/dashboard/talepler");
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Only Viewer can create requests
  if (!isViewer(user?.role)) {
    return <Unauthorized />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Yeni Talep Oluştur</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Etkinlik bilgilerinizi doldurarak talep oluşturun
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Talep Formu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-foreground">
                  Etkinlik Türü <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.eventType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, eventType: value })
                  }
                >
                  <SelectTrigger id="eventType">
                    <SelectValue placeholder="Etkinlik türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={String(type.value)}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventName" className="text-foreground">
                  Etkinlik Adı <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="eventName"
                    placeholder="Örn: Ahmet & Ayşe Nikah Töreni"
                    value={formData.eventName}
                    onChange={(e) =>
                      setFormData({ ...formData, eventName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventOwner" className="text-foreground">
                  Etkinlik Sahibi <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="eventOwner"
                    placeholder="Etkinlik sahibinin adı"
                    value={formData.eventOwner}
                    onChange={(e) =>
                      setFormData({ ...formData, eventOwner: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weddingHallId" className="text-foreground">
                  Salon Seçimi <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.weddingHallId}
                  onValueChange={async (value) => {
                    const selectedHall = halls.find(h => h.id === value);
                    setFormData({ ...formData, weddingHallId: value, eventDate: "", eventTime: "" });
                    setCurrentDate(new Date());
                    // Merkez bilgisini yükle
                    if (selectedHall) {
                      try {
                        const centerData = await getCenterById(selectedHall.centerId);
                        setCenter(centerData);
                      } catch (e) {
                        console.error("Error loading center:", e);
                        setCenter(null);
                      }
                    }
                  }}
                >
                  <SelectTrigger id="weddingHallId">
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
                {formData.weddingHallId && (() => {
                  const selectedHall = halls.find(h => h.id === formData.weddingHallId);
                  return selectedHall && center ? (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span className="font-medium">{center.name}</span>
                      <span>-</span>
                      <span>{selectedHall.name}</span>
                    </p>
                  ) : null;
                })()}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-foreground">
                  Tarih <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) =>
                        setFormData({ ...formData, eventDate: e.target.value })
                      }
                      className="pl-10"
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  {/* Müsaitlik Takvimi - Açılır Kapanır */}
                  {formData.weddingHallId && (
                    <div className="border rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Müsaitlik durumunu göster
                        </span>
                        {showCalendar ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      {showCalendar && (
                        <div className="border-t bg-gradient-to-br from-card via-card to-muted/30">
                          <div className="p-4 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                  <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-foreground leading-tight">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">Müsaitlik takvimi</p>
                                </div>
                              </div>
                              <div className="flex gap-1 rounded-lg border border-border/50 p-0.5 bg-muted/30">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-background"
                                  onClick={() => navigateMonth(-1)}
                                >
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-background"
                                  onClick={() => navigateMonth(1)}
                                >
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="space-y-2">
                              {/* Weekday Headers */}
                              <div className="grid grid-cols-7 gap-1">
                                {daysOfWeek.map((day) => (
                                  <div
                                    key={day}
                                    className="py-1.5 text-center text-[10px] font-bold text-muted-foreground/70 uppercase"
                                  >
                                    {day}
                                  </div>
                                ))}
                              </div>
                              
                              {/* Calendar Days */}
                              <div className="grid grid-cols-7 gap-1">
                                {days.map((day, i) => {
                                  const availability = getAvailabilityForDate(day);
                                  const isPast = day < new Date() && !isToday(day);
                                  const isSelectedDate = isSelected(day);
                                  const isCurrentMonthDay = isCurrentMonth(day);
                                  
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => {
                                        if (!isPast && isCurrentMonthDay) {
                                          setFormData({ ...formData, eventDate: formatDateString(day) });
                                          setCurrentDate(new Date(day.getFullYear(), day.getMonth(), 1));
                                        }
                                      }}
                                      disabled={isPast || !isCurrentMonthDay}
                                      className={cn(
                                        "relative aspect-square rounded-xl text-xs font-semibold transition-all",
                                        "flex flex-col items-center justify-center group",
                                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                                        !isCurrentMonthDay && "opacity-20 cursor-default",
                                        isCurrentMonthDay && !isPast && !isToday(day) && !isSelectedDate && 
                                          "text-foreground bg-background border border-border/60 hover:border-primary/40 hover:bg-accent/50 hover:shadow-sm",
                                        isPast && "opacity-30 cursor-not-allowed text-muted-foreground bg-muted/20",
                                        isToday(day) && !isSelectedDate && 
                                          "bg-primary/15 text-primary font-bold border-2 border-primary/40 shadow-sm",
                                        isSelectedDate && 
                                          "bg-primary text-primary-foreground font-bold border-2 border-primary shadow-lg scale-105"
                                      )}
                                    >
                                      <span className="leading-none">{day.getDate()}</span>
                                      
                                      {/* Availability Indicators */}
                                      {isCurrentMonthDay && !isPast && (
                                        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                                          {availability.available > 0 && (
                                            <div 
                                              className={cn(
                                                "h-1 w-1 rounded-full transition-all",
                                                isSelectedDate ? "bg-green-300" : "bg-green-500"
                                              )} 
                                              title={`${availability.available} müsait`} 
                                            />
                                          )}
                                          {availability.reserved > 0 && (
                                            <div 
                                              className={cn(
                                                "h-1 w-1 rounded-full transition-all",
                                                isSelectedDate ? "bg-red-300" : "bg-red-500"
                                              )} 
                                              title={`${availability.reserved} dolu`} 
                                            />
                                          )}
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            {/* Legend */}
                            <div className="flex items-center justify-center gap-4 pt-2 border-t border-border/50">
                              <div className="flex items-center gap-1.5 text-xs">
                                <div className="h-2 w-2 rounded-full bg-green-500 shadow-sm" />
                                <span className="font-medium text-muted-foreground">Müsait</span>
                              </div>
                              <div className="h-3 w-px bg-border" />
                              <div className="flex items-center gap-1.5 text-xs">
                                <div className="h-2 w-2 rounded-full bg-red-500 shadow-sm" />
                                <span className="font-medium text-muted-foreground">Dolu</span>
                              </div>
                            </div>

                            {/* Selected Date Details */}
                            {formData.eventDate && (
                              <div className="space-y-3 pt-2 border-t border-border/50">
                                {/* Date Summary Card */}
                                <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 shadow-sm">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <p className="text-sm font-bold text-foreground mb-0.5">
                                        {new Date(formData.eventDate).toLocaleDateString("tr-TR", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric"
                                        })}
                                      </p>
                                      <p className="text-xs text-muted-foreground capitalize">
                                        {new Date(formData.eventDate).toLocaleDateString("tr-TR", {
                                          weekday: "long"
                                        })}
                                      </p>
                                    </div>
                                    {(() => {
                                      const selectedAvailability = getAvailabilityForDate(new Date(formData.eventDate));
                                      return (
                                        <div className="flex items-center gap-2 text-xs">
                                          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                                            <span className="font-bold text-green-700 dark:text-green-300">
                                              {selectedAvailability.available}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                                            <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
                                            <span className="font-bold text-red-700 dark:text-red-300">
                                              {selectedAvailability.reserved}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                                
                                {/* Time Slots Grid */}
                                <div className="space-y-2">
                                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                                    Saat Bazlı Müsaitlik
                                  </p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {getTimeSlotAvailability(formData.eventDate).map((slot) => (
                                      <button
                                        key={slot.time}
                                        type="button"
                                        onClick={() => {
                                          if (slot.status === "available") {
                                            setFormData({ ...formData, eventTime: slot.time });
                                          }
                                        }}
                                        disabled={slot.status === "reserved"}
                                        className={cn(
                                          "rounded-lg border p-2.5 text-center transition-all",
                                          "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary",
                                          slot.status === "reserved"
                                            ? "border-red-200/60 bg-red-50/80 dark:bg-red-950/15 dark:border-red-900/50 cursor-not-allowed opacity-75"
                                            : "border-green-200/60 bg-green-50/80 dark:bg-green-950/15 dark:border-green-900/50 hover:border-green-300 hover:bg-green-100 dark:hover:bg-green-950/25 cursor-pointer"
                                        )}
                                      >
                                        <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                          <Clock className={cn(
                                            "h-3.5 w-3.5",
                                            slot.status === "reserved" 
                                              ? "text-red-600 dark:text-red-400" 
                                              : "text-green-600 dark:text-green-400"
                                          )} />
                                          <span className={cn(
                                            "text-xs font-bold",
                                            slot.status === "reserved" 
                                              ? "text-red-700 dark:text-red-300" 
                                              : "text-green-700 dark:text-green-300"
                                          )}>
                                            {slot.time}
                                          </span>
                                        </div>
                                        {slot.status === "reserved" ? (
                                          <div className="space-y-0.5">
                                            <div className="h-1 w-1 rounded-full bg-red-500 mx-auto" />
                                            <span className="text-[10px] font-medium text-red-600 dark:text-red-400 line-clamp-1">
                                              {slot.eventName || "Dolu"}
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="space-y-0.5">
                                            <div className="h-1 w-1 rounded-full bg-green-500 mx-auto" />
                                            <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                                              Müsait
                                            </span>
                                          </div>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventTime" className="text-foreground">
                  Saat <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.eventTime}
                  onValueChange={(value) =>
                    setFormData({ ...formData, eventTime: value })
                  }
                >
                  <SelectTrigger id="eventTime" className="gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <SelectValue placeholder="Saat seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Sadece müsait slot saatleri seçilebilir.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-foreground">
                Açıklama <span className="text-muted-foreground">(Opsiyonel)</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Ek bilgiler, özel istekler vb..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="min-h-32 resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Gönderiliyor..." : "Talep Oluştur"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
