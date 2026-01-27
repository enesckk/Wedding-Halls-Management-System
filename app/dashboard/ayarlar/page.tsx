"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/user-context";
import { isEditor as isEditorRole } from "@/lib/utils/role";
import { Unauthorized } from "@/components/unauthorized";
import { Lock, User } from "lucide-react";
import { getHalls } from "@/lib/api/halls";
import { getSchedulesByHall, updateSchedule } from "@/lib/api/schedules";
import { toast } from "sonner";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";

export default function AyarlarPage() {
  const { user, loading } = useUser();
  const [clearingSchedules, setClearingSchedules] = useState(false);

  const handleClearAllSchedules = async () => {
    setClearingSchedules(true);
    try {
      const halls = await getHalls();
      let totalUpdated = 0;
      let totalProcessed = 0;

      for (const hall of halls) {
        try {
          const schedules = await getSchedulesByHall(hall.id);
          const reservedSchedules = schedules.filter((s) => s.status === "Reserved");
          
          for (const schedule of reservedSchedules) {
            try {
              await updateSchedule(schedule.id, {
                weddingHallId: schedule.weddingHallId,
                date: schedule.date,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                status: "Available",
              });
              totalUpdated++;
            } catch (e) {
              console.error(`Error updating schedule ${schedule.id}:`, e);
            }
            totalProcessed++;
          }
        } catch (e) {
          console.error(`Error loading schedules for hall ${hall.id}:`, e);
        }
      }

      if (totalUpdated > 0) {
        toast.success(`${totalUpdated} müsaitlik kaydı temizlendi.`);
      } else {
        toast.info("Temizlenecek müsaitlik kaydı bulunamadı.");
      }
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setClearingSchedules(false);
    }
  };

  // Otomatik temizleme kaldırıldı - sadece manuel buton ile yapılacak

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isEditorRole(user?.role)) {
    return <Unauthorized />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
        <p className="text-muted-foreground">
          Hesap ve sistem ayarlarınızı yönetin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="h-5 w-5 text-primary" />
              Profil Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input id="name" defaultValue={user?.name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" type="email" defaultValue={user?.email ?? ""} />
            </div>
            <Button className="w-full">Değişiklikleri Kaydet</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lock className="h-5 w-5 text-primary" />
              Güvenlik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mevcut Şifre</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Yeni Şifre</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Şifreyi Değiştir
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
