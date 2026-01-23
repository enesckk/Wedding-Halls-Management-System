"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { weddingHalls, mockEvents } from "@/lib/data";
import { useUser } from "@/lib/user-context";
import type { Event, EventType } from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Phone,
  User,
  Music,
  Heart,
  Sparkles,
  Building2,
  Star,
  Trash2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const timeSlots = [
  { time: "09:00", label: "09:00 - 10:00" },
  { time: "10:30", label: "10:30 - 11:30" },
  { time: "12:00", label: "12:00 - 13:00" },
  { time: "14:00", label: "14:00 - 15:00" },
  { time: "15:30", label: "15:30 - 16:30" },
  { time: "17:00", label: "17:00 - 18:00" },
];

const monthNames = [
  "Ocak", "Subat", "Mart", "Nisan", "Mayis", "Haziran",
  "Temmuz", "Agustos", "Eylul", "Ekim", "Kasim", "Aralik",
];

const daysOfWeek = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];
const daysOfWeekFull = ["Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi", "Pazar"];

const eventTypes: { value: EventType; label: string; icon: typeof Heart; color: string; bgColor: string }[] = [
  { value: "nikah", label: "Nikah", icon: Heart, color: "bg-rose-500", bgColor: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "nisan", label: "Nisan", icon: Sparkles, color: "bg-pink-500", bgColor: "bg-pink-50 text-pink-700 border-pink-200" },
  { value: "konser", label: "Konser", icon: Music, color: "bg-purple-500", bgColor: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "toplanti", label: "Toplanti", icon: Building2, color: "bg-blue-500", bgColor: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "ozel", label: "Ozel Etkinlik", icon: Star, color: "bg-amber-500", bgColor: "bg-amber-50 text-amber-700 border-amber-200" },
];

function getEventTypeInfo(type: EventType) {
  return eventTypes.find((t) => t.value === type) || eventTypes[0];
}

export default function TakvimPage() {
  const { isAdmin, currentUser } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHall, setSelectedHall] = useState<string>("");
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Form state
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "nikah" as EventType,
    hallId: "",
    timeSlot: "",
    description: "",
    guestCount: "",
    contactName: "",
    contactPhone: "",
  });

  const formatDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    for (let i = startDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
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
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = formatDateString(date);
    return events.filter((e) => e.date === dateStr);
  };

  const days = getDaysInMonth(currentDate);

  const selectedDateEvents = useMemo(() => {
    const dateStr = formatDateString(selectedDate);
    let filtered = events.filter((e) => e.date === dateStr);
    if (selectedHall) {
      filtered = filtered.filter((e) => e.hallId === selectedHall);
    }
    return filtered.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [selectedDate, selectedHall, events]);

  const getAvailableTimeSlots = (hallId: string, date: Date) => {
    const dateStr = formatDateString(date);
    const bookedSlots = events
      .filter((e) => e.date === dateStr && e.hallId === hallId)
      .map((e) => e.timeSlot);
    return timeSlots.filter((slot) => !bookedSlots.includes(slot.label));
  };

  const resetForm = () => {
    setNewEvent({
      title: "",
      type: "nikah",
      hallId: "",
      timeSlot: "",
      description: "",
      guestCount: "",
      contactName: "",
      contactPhone: "",
    });
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.hallId || !newEvent.timeSlot) return;

    const hall = weddingHalls.find((h) => h.id === newEvent.hallId);
    const event: Event = {
      id: `e${Date.now()}`,
      title: newEvent.title,
      type: newEvent.type,
      hallId: newEvent.hallId,
      hallName: hall?.name || "",
      date: formatDateString(selectedDate),
      timeSlot: newEvent.timeSlot,
      description: newEvent.description,
      guestCount: newEvent.guestCount ? parseInt(newEvent.guestCount) : undefined,
      contactName: newEvent.contactName,
      contactPhone: newEvent.contactPhone,
      createdBy: currentUser.id,
      createdAt: new Date(),
    };

    setEvents([...events, event]);
    resetForm();
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId));
    setSelectedEvent(null);
  };

  const availableSlots = newEvent.hallId
    ? getAvailableTimeSlots(newEvent.hallId, selectedDate)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Takvim</h1>
        <p className="text-sm text-muted-foreground">
          Etkinlikleri goruntuleyin ve yonetin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Panel - Add Event Form (Admin Only) */}
        {isAdmin && (
          <div className="lg:col-span-3">
            <Card className="sticky top-6 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Plus className="h-4 w-4" />
                  Etkinlik Ekle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Date */}
                <div className="rounded-lg bg-primary/5 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Secilen Tarih
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {daysOfWeekFull[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]}
                  </p>
                </div>

                {/* Event Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Etkinlik Turu</Label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value: EventType) =>
                      setNewEvent({ ...newEvent, type: value })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2.5 w-2.5 rounded-full", type.color)} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hall */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Salon</Label>
                  <Select
                    value={newEvent.hallId}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, hallId: value, timeSlot: "" })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Salon secin" />
                    </SelectTrigger>
                    <SelectContent>
                      {weddingHalls.map((hall) => (
                        <SelectItem key={hall.id} value={hall.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate">{hall.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Slot */}
                {newEvent.hallId && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Saat</Label>
                    {availableSlots.length > 0 ? (
                      <Select
                        value={newEvent.timeSlot}
                        onValueChange={(value) =>
                          setNewEvent({ ...newEvent, timeSlot: value })
                        }
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Saat secin" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.map((slot) => (
                            <SelectItem key={slot.time} value={slot.label}>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                {slot.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                        Bu tarihte musait saat yok
                      </div>
                    )}
                  </div>
                )}

                {/* Event Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Etkinlik Adi</Label>
                  <Input
                    placeholder="Ornek: Yilmaz - Demir Nikahi"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="h-9 text-sm"
                  />
                </div>

                {/* Guest Count */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Kisi Sayisi</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={newEvent.guestCount}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, guestCount: e.target.value })
                    }
                    className="h-9 text-sm"
                  />
                </div>

                {/* Contact */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Iletisim Kisi</Label>
                  <Input
                    placeholder="Ali Yilmaz"
                    value={newEvent.contactName}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, contactName: e.target.value })
                    }
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Telefon</Label>
                  <Input
                    placeholder="0532 123 4567"
                    value={newEvent.contactPhone}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, contactPhone: e.target.value })
                    }
                    className="h-9 text-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Aciklama</Label>
                  <Textarea
                    placeholder="Ek notlar..."
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    className="min-h-[60px] resize-none text-sm"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={resetForm}
                  >
                    Temizle
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleAddEvent}
                    disabled={!newEvent.title || !newEvent.hallId || !newEvent.timeSlot}
                  >
                    Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calendar */}
        <div className={cn(isAdmin ? "lg:col-span-4" : "lg:col-span-5")}>
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
              {/* Day headers */}
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

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const hasEvents = dayEvents.length > 0;
                  return (
                    <button
                      type="button"
                      key={index}
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
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div
                              key={i}
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                getEventTypeInfo(event.type).color
                              )}
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

              {/* Today button */}
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full bg-transparent"
                onClick={() => {
                  setSelectedDate(new Date());
                  setCurrentDate(new Date());
                }}
              >
                Bugune Git
              </Button>

              {/* Legend */}
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Etkinlik Turleri
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {eventTypes.map((type) => (
                    <div key={type.value} className="flex items-center gap-1.5">
                      <div className={cn("h-2 w-2 rounded-full", type.color)} />
                      <span className="text-xs text-muted-foreground">{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className={cn(isAdmin ? "lg:col-span-5" : "lg:col-span-7")}>
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {selectedDateEvents.length} etkinlik
                  </Badge>
                </CardTitle>
                <Select value={selectedHall} onValueChange={setSelectedHall}>
                  <SelectTrigger className="h-9 w-full text-sm sm:w-[180px]">
                    <SelectValue placeholder="Tum Salonlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tum Salonlar</SelectItem>
                    {weddingHalls.map((hall) => (
                      <SelectItem key={hall.id} value={hall.id}>
                        {hall.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Etkinlik Bulunamadi</p>
                  <p className="text-xs text-muted-foreground">Bu tarihte etkinlik yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => {
                    const typeInfo = getEventTypeInfo(event.type);
                    return (
                      <button
                        type="button"
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full rounded-lg border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("h-2.5 w-2.5 shrink-0 rounded-full", typeInfo.color)} />
                            <span className="text-sm font-medium text-foreground">{event.title}</span>
                          </div>
                          <Badge variant="outline" className={cn("shrink-0 text-[10px]", typeInfo.bgColor)}>
                            {typeInfo.label}
                          </Badge>
                        </div>
                        <div className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {event.timeSlot}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.hallName}
                          </div>
                          {event.guestCount && (
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              {event.guestCount} kisi
                            </div>
                          )}
                          {event.contactName && (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              {event.contactName}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && (
                <>
                  <div className={cn("h-3 w-3 rounded-full", getEventTypeInfo(selectedEvent.type).color)} />
                  {selectedEvent.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <Badge variant="outline" className={getEventTypeInfo(selectedEvent.type).bgColor}>
                {getEventTypeInfo(selectedEvent.type).label}
              </Badge>

              <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">Tarih</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedEvent.date).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">Saat</p>
                    <p className="text-sm font-medium">{selectedEvent.timeSlot}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">Salon</p>
                    <p className="text-sm font-medium">{selectedEvent.hallName}</p>
                  </div>
                </div>
                {selectedEvent.guestCount && (
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Kisi Sayisi</p>
                      <p className="text-sm font-medium">{selectedEvent.guestCount} kisi</p>
                    </div>
                  </div>
                )}
                {selectedEvent.contactName && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Iletisim</p>
                      <p className="text-sm font-medium">{selectedEvent.contactName}</p>
                    </div>
                  </div>
                )}
                {selectedEvent.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">Telefon</p>
                      <p className="text-sm font-medium">{selectedEvent.contactPhone}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div>
                  <p className="mb-1 text-[11px] font-medium text-muted-foreground">Aciklama</p>
                  <p className="text-sm text-foreground">{selectedEvent.description}</p>
                </div>
              )}

              {isAdmin && (
                <div className="flex gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Kapat
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Sil
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
