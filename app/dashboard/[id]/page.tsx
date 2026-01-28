"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvailabilityTable } from "@/components/availability-table";
import { RequestModal } from "@/components/request-modal";
import { HallFormModal } from "@/components/hall-form-modal";
import { getHallById } from "@/lib/api/halls";
import { getSchedulesByHall, updateSchedule } from "@/lib/api/schedules";
import { getRequests } from "@/lib/api/requests";
import { useUser } from "@/lib/user-context";
import { isViewer } from "@/lib/utils/role";
import type { WeddingHall, Schedule, Request } from "@/lib/types";
import {
  ArrowLeft,
  Calendar,
  Info,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  Pencil,
} from "lucide-react";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { hasOverlap } from "@/lib/utils/schedule-overlap";
import { toast } from "sonner";

function todayLocal(date?: Date): string {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HallDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isEditor, user } = useUser();
  const [hall, setHall] = useState<WeddingHall | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]); // Tüm schedule'ları sakla
  const [loading, setLoading] = useState(true);
  const [updateOpen, setUpdateOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [h, s, requests] = await Promise.all([
        getHallById(id),
        getSchedulesByHall(id),
        getRequests().catch(() => []), // Request'ler yüklenemezse boş array döndür
      ]);
      setHall(h ?? null);
      const allScheds = s ?? [];
      
      // Request'leri Schedule'larla eşleştir (sadece Answered olanlar)
      const answeredRequests = requests.filter((r: Request) => r.status === "Answered");
      const schedulesWithRequests = allScheds.map((schedule) => {
        if (schedule.status === "Reserved") {
          // Tarih ve saat formatını normalize et
          let reqDate = schedule.date;
          if (reqDate.includes('T')) {
            reqDate = reqDate.split('T')[0];
          }
          
          // Eşleşen Request'i bul
          const matchingRequest = answeredRequests.find((req: Request) => {
            let reqEventDate = req.eventDate;
            if (reqEventDate.includes('T')) {
              reqEventDate = reqEventDate.split('T')[0];
            }
            
            // Saat formatını normalize et
            let reqTime = req.eventTime;
            if (reqTime.includes(':')) {
              reqTime = reqTime.slice(0, 5); // HH:mm
            }
            let scheduleTime = schedule.startTime;
            if (scheduleTime.includes(':')) {
              scheduleTime = scheduleTime.slice(0, 5); // HH:mm
            }
            
            return req.weddingHallId === schedule.weddingHallId &&
                   reqEventDate === reqDate &&
                   reqTime === scheduleTime;
          });
          
          if (matchingRequest) {
            return {
              ...schedule,
              eventName: matchingRequest.eventName,
              eventOwner: matchingRequest.eventOwner,
              eventType: matchingRequest.eventType,
              requestId: matchingRequest.id,
            };
          }
        }
        return schedule;
      });
      
      setAllSchedules(schedulesWithRequests); // Tüm schedule'ları sakla (müsaitlik oranı için)
      
      // Bugünün schedule'larını göster
      const today = todayLocal();
      const todaySchedules = schedulesWithRequests.filter((x) => x.date === today);
      
      // Eğer bugün için schedule varsa sadece bugünü göster
      if (todaySchedules.length > 0) {
        setSchedules(todaySchedules);
      } else {
        // Bugün için schedule yoksa, en yakın tarihleri göster (gelecek 7 gün)
        const next7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          return todayLocal(date);
        });
        const upcomingSchedules = schedulesWithRequests.filter((x) => 
          next7Days.includes(x.date)
        ).sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.startTime.localeCompare(b.startTime);
        });
        setSchedules(upcomingSchedules);
      }
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = useCallback(
    async (slot: Schedule) => {
      if (!hall) return;
      const newStatus = slot.status === "Available" ? "Reserved" : "Available";
      if (
        hasOverlap(
          schedules,
          slot.id,
          slot.date,
          slot.startTime,
          slot.endTime
        )
      ) {
        toast.error("Bu saat aralığı başka bir müsaitlikle çakışıyor.");
        return;
      }
      try {
        await updateSchedule(slot.id, {
          weddingHallId: hall.id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: newStatus,
        });
        await load();
        toast.success("Müsaitlik güncellendi.");
      } catch (e) {
        toast.error(toUserFriendlyMessage(e));
      }
    },
    [hall, load, schedules]
  );

  const handleUpdateSuccess = useCallback((updated: WeddingHall) => {
    setHall(updated);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!hall) notFound();

  // Standart saat dilimleri (takvim sayfasıyla aynı)
  const TIME_SLOTS = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];
  const STANDARD_SLOTS_PER_DAY = TIME_SLOTS.length; // 6 saat dilimi
  
  // Bugünkü schedule'lar için ayrı istatistikler
  const today = todayLocal();
  const todaySchedules = allSchedules.filter((s) => s.date === today);
  const todayBookedSlots = todaySchedules.filter((s) => s.status === "Reserved").length;
  
  // Schedule yoksa varsayılan olarak müsait kabul et
  // Bugün için toplam slot sayısı: STANDARD_SLOTS_PER_DAY (6)
  // Müsait slot = Toplam slot - Dolu slot
  const todayTotalSlots = todaySchedules.length > 0 ? todaySchedules.length : STANDARD_SLOTS_PER_DAY;
  const todayAvailableSlots = Math.max(0, todayTotalSlots - todayBookedSlots);
  
  // Müsaitlik oranını tüm schedule'lara göre hesapla
  // Schedule yoksa varsayılan olarak %100 müsait
  const availableSlots = allSchedules.filter((s) => s.status === "Available").length;
  const bookedSlots = allSchedules.filter((s) => s.status === "Reserved").length;
  const totalSlots = allSchedules.length;
  
  // Schedule yoksa varsayılan olarak %100 müsait göster
  // Varsa: (Müsait / Toplam) * 100
  // Yoksa: %100 (tüm slotlar müsait kabul edilir)
  const availabilityPercentage = totalSlots > 0
    ? Math.round((availableSlots / totalSlots) * 100)
    : 100; // Schedule yoksa %100 müsait
  
  // Schedule var mı kontrolü - eğer hiç schedule yoksa istatistikleri göstermemeli
  const hasAnySchedules = allSchedules.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/salonlar">
          <Button variant="outline" size="icon" className="h-10 w-10 bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{hall.name}</h1>
          <p className="text-muted-foreground">{hall.address}</p>
        </div>
        {isEditor && (
          <Badge className="gap-1 bg-primary/10 text-primary">
            <Shield className="h-3 w-3" />
            Düzenleme Yetkisi
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image
              src={hall.imageUrl || "/placeholder.svg"}
              alt={hall.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex gap-2">
                <Badge className="bg-card/90 text-foreground backdrop-blur-sm">
                  <Users className="mr-1 h-3 w-3" />
                  {hall.capacity} Kişi
                </Badge>
                <Badge className="bg-card/90 text-foreground backdrop-blur-sm">
                  <Clock className="mr-1 h-3 w-3" />
                  {todaySchedules.length > 0 ? todaySchedules.length : STANDARD_SLOTS_PER_DAY} Saat Dilimi
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {hasAnySchedules ? (
            <>
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-primary">
                      %{availabilityPercentage}
                    </div>
                    <p className="text-sm text-muted-foreground">Müsaitlik Oranı</p>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${availabilityPercentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-600" />
                    <div className="text-2xl font-bold text-green-700">
                      {todayAvailableSlots}
                    </div>
                    <p className="text-xs text-green-600">Müsait (Bugün)</p>
                  </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4 text-center">
                    <XCircle className="mx-auto mb-2 h-8 w-8 text-red-600" />
                    <div className="text-2xl font-bold text-red-700">
                      {todayBookedSlots}
                    </div>
                    <p className="text-xs text-red-600">Dolu (Bugün)</p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">
                    Müsaitlik Kaydı Yok
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bu salon için henüz müsaitlik kaydı oluşturulmamış
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isViewer(user?.role) && (
            <RequestModal hallId={hall.id} hallName={hall.name} />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Info className="h-5 w-5 text-primary" />
              Salon Bilgileri
            </CardTitle>
            {isEditor && (
              <CardAction>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setUpdateOpen(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Düzenle
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adres</p>
                <p className="text-foreground">{hall.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kapasite</p>
                <p className="text-foreground">{hall.capacity} Kişi</p>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground">Açıklama</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                {hall.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {isEditor && (
          <HallFormModal
            open={updateOpen}
            onOpenChange={setUpdateOpen}
            mode="update"
            initialHall={hall}
            onSuccess={handleUpdateSuccess}
          />
        )}

        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                {schedules.length > 0 && schedules[0].date === todayLocal() 
                  ? "Bugünkü Müsaitlik Durumu" 
                  : "Müsaitlik Durumu"}
              </CardTitle>
              {!isEditor && (
                <Badge variant="outline" className="text-xs">
                  Sadece Görüntüleme
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Müsaitlik Kaydı Bulunamadı
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Bu salon için henüz müsaitlik kaydı oluşturulmamış
                </p>
              </div>
            ) : (
              <AvailabilityTable
                schedules={schedules}
                canEdit={isEditor}
                onToggle={isEditor ? handleToggle : undefined}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
