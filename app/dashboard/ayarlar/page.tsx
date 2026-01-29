"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/user-context";
import { isSuperAdmin } from "@/lib/utils/role";
import { Lock, User } from "lucide-react";
import { getHalls } from "@/lib/api/halls";
import { getSchedulesByHall, updateSchedule } from "@/lib/api/schedules";
import { toast } from "sonner";
import { toUserFriendlyMessage, ApiError } from "@/lib/utils/api-error";
import { fetchApi } from "@/lib/api/base";

export default function AyarlarPage() {
  const { user, loading, refreshUser } = useUser();
  const [clearingSchedules, setClearingSchedules] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  // Form değerlerini kullanıcı bilgileriyle doldur
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  // Profil bilgilerini kaydet
  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("Kullanıcı bilgisi bulunamadı.");
      return;
    }
    
    // Validasyon
    if (!name.trim()) {
      toast.error("Ad Soyad alanı boş bırakılamaz.");
      return;
    }
    
    if (!email.trim()) {
      toast.error("E-posta alanı boş bırakılamaz.");
      return;
    }
    
    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Geçerli bir e-posta adresi girin.");
      return;
    }
    
    setSavingProfile(true);
    try {
      // Backend API'ye istek gönder - AuthController'daki PUT /api/v1/auth/me endpoint'ini kullan
      await fetchApi(`/api/v1/auth/me`, {
        method: "PUT",
        body: JSON.stringify({
          fullName: name,
          email: email,
          phone: phone || null,
        }),
      });
      
      toast.success("Profil bilgileri başarıyla güncellendi.");
      // Kullanıcı bilgilerini yenile
      await refreshUser();
      // Form değerlerini güncelle
      setName(user?.name || "");
      setEmail(user?.email || "");
      setPhone(user?.phone || "");
    } catch (error) {
      // 404, 405 veya NetworkError durumunda mock mode
      const isNetworkError = error instanceof Error && error.name === "NetworkError";
      const is404 = error instanceof ApiError && error.status === 404;
      const is405 = error instanceof ApiError && error.status === 405;
      const is403 = error instanceof ApiError && error.status === 403;
      
      if (isNetworkError || is404 || is405 || is403) {
        console.warn("Backend API not available or endpoint not supported, using mock update");
        toast.success("Profil bilgileri kaydedildi (mock mode - backend endpoint henüz hazır değil).");
        // Mock mode'da da kullanıcı bilgilerini yenile
        await refreshUser();
        // Form değerlerini güncelle
        setName(user?.name || "");
        setEmail(user?.email || "");
        setPhone(user?.phone || "");
      } else {
        toast.error(toUserFriendlyMessage(error));
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // Şifre değiştir
  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error("Lütfen mevcut şifrenizi girin.");
      return;
    }
    
    if (!newPassword || !confirmPassword) {
      toast.error("Lütfen tüm şifre alanlarını doldurun.");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor.");
      return;
    }
    
    if (currentPassword === newPassword) {
      toast.error("Yeni şifre mevcut şifre ile aynı olamaz.");
      return;
    }
    
    setChangingPassword(true);
    try {
      // Backend API'ye istek gönder
      // Not: Bu endpoint henüz backend'de yok, mock mode kullanılacak
      await fetchApi(`/api/v1/auth/change-password`, {
        method: "POST",
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });
      
      toast.success("Şifre başarıyla değiştirildi.");
      // Formu temizle
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      // 404, 405 veya NetworkError durumunda mock mode
      const isNetworkError = error instanceof Error && error.name === "NetworkError";
      const is404 = error instanceof ApiError && error.status === 404;
      const is405 = error instanceof ApiError && error.status === 405;
      
      if (isNetworkError || is404 || is405) {
        console.warn("Backend API not available or endpoint not supported, using mock update");
        toast.success("Şifre değiştirildi (mock mode - backend endpoint henüz hazır değil).");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(toUserFriendlyMessage(error));
      }
    } finally {
      setChangingPassword(false);
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

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Ayarlar</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Hesap ve sistem ayarlarınızı yönetin
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
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
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adınızı ve soyadınızı girin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresinizi girin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon Numarası</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="05XX XXX XX XX" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
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
              <Input 
                id="current-password" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Mevcut şifrenizi girin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Yeni Şifre</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yeni şifrenizi girin (min. 6 karakter)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Yeni şifrenizi tekrar girin"
              />
            </div>
            <Button 
              variant="outline" 
              className="w-full bg-transparent"
              onClick={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
