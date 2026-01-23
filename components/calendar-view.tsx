"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { weddingHalls } from "@/lib/data";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const timeSlots = [
  "09:00",
  "10:30",
  "12:00",
  "14:00",
  "15:30",
  "17:00",
];

const daysOfWeek = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const monthNames = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export function CalendarView() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<"week" | "day">("week");

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Get the day of the week of the first day (0 = Sunday, 1 = Monday, etc.)
    let startDay = firstDay.getDay();
    // Convert to Monday-based (0 = Monday)
    startDay = startDay === 0 ? 6 : startDay - 1;

    // Add days from previous month
    for (let i = startDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push(prevDate);
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month to complete the grid
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
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getAvailabilityForHall = (hallId: string, slotIndex: number) => {
    const hall = weddingHalls.find((h) => h.id === hallId);
    if (!hall) return "available";
    return hall.availability[slotIndex]?.status || "available";
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-6">
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
                  {weddingHalls.reduce(
                    (acc, hall) =>
                      acc +
                      hall.availability.filter((s) => s.status === "booked")
                        .length,
                    0
                  )}
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
                  {weddingHalls.reduce(
                    (acc, hall) =>
                      acc +
                      hall.availability.filter((s) => s.status === "available")
                        .length,
                    0
                  )}
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
                  {weddingHalls.reduce((acc, hall) => acc + hall.capacity, 0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Toplam Kapasite
                </p>
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
                  {weddingHalls.length}
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
                    isToday(day) && "bg-primary text-primary-foreground hover:bg-primary/90",
                    isSelected(day) && !isToday(day) && "bg-secondary text-primary",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  )}
                >
                  {day.getDate()}
                </button>
              ))}
            </div>

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
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    Beklemede
                  </span>
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
                    {timeSlots.map((slot) => (
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
                  {weddingHalls.map((hall) => (
                    <tr key={hall.id} className="border-t border-border">
                      <td className="p-2">
                        <button
                          onClick={() => router.push(`/dashboard/${hall.id}`)}
                          className="text-left text-sm font-medium text-foreground hover:text-primary"
                        >
                          {hall.name.length > 20
                            ? hall.name.substring(0, 18) + "..."
                            : hall.name}
                        </button>
                      </td>
                      {timeSlots.map((_, slotIndex) => {
                        const status = getAvailabilityForHall(
                          hall.id,
                          slotIndex
                        );
                        return (
                          <td key={slotIndex} className="p-1 text-center">
                            <div
                              className={cn(
                                "mx-auto h-8 w-full max-w-[60px] rounded-md transition-colors",
                                status === "available" &&
                                  "bg-green-100 hover:bg-green-200 cursor-pointer",
                                status === "booked" &&
                                  "bg-red-100 cursor-not-allowed",
                                status === "pending" &&
                                  "bg-amber-100 cursor-pointer hover:bg-amber-200"
                              )}
                              title={
                                status === "available"
                                  ? "Müsait"
                                  : status === "booked"
                                  ? "Dolu"
                                  : "Beklemede"
                              }
                            />
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

      {/* Upcoming Reservations */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Bugünkü Rezervasyonlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weddingHalls
              .flatMap((hall) =>
                hall.availability
                  .filter((slot) => slot.status === "booked")
                  .map((slot) => ({
                    hallName: hall.name,
                    hallId: hall.id,
                    timeRange: slot.timeRange,
                    capacity: hall.capacity,
                  }))
              )
              .slice(0, 5)
              .map((reservation, index) => (
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
                        {reservation.hallName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.timeRange}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      Dolu
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/${reservation.hallId}`)
                      }
                    >
                      Detay
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
