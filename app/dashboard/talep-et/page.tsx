"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { toast } from "sonner";
import { Calendar, Clock, Building2, User, FileText, Send } from "lucide-react";
import type { WeddingHall } from "@/lib/types";
import { useUser } from "@/lib/user-context";
import { isViewer } from "@/lib/utils/role";
import { Unauthorized } from "@/components/unauthorized";

const EVENT_TYPES = [
  { value: 0, label: "Nikah" },
  { value: 1, label: "Nişan" },
  { value: 2, label: "Konser" },
  { value: 3, label: "Toplantı" },
  { value: 4, label: "Özel" },
];

/** İzin verilen başlangıç saatleri (takvim/dashboard ile uyumlu) */
const TIME_SLOTS = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

export default function TalepEtPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [halls, setHalls] = useState<WeddingHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHalls();
  }, [loadHalls]);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Yeni Talep Oluştur</h1>
        <p className="text-muted-foreground">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, weddingHallId: value })
                  }
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-foreground">
                  Tarih <span className="text-destructive">*</span>
                </Label>
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
                    required
                  />
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

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
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
