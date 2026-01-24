"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquarePlus, Send, Calendar, Clock, User } from "lucide-react";
import { createRequest } from "@/lib/api/requests";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { toast } from "sonner";

const EVENT_TYPES = [
  { value: 0, label: "Nikah" },
  { value: 1, label: "Nişan" },
  { value: 2, label: "Konser" },
  { value: 3, label: "Toplantı" },
  { value: 4, label: "Özel" },
];

interface RequestModalProps {
  hallId: string;
  hallName: string;
}

export function RequestModal({ hallId, hallName }: RequestModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    eventType: "",
    eventName: "",
    eventOwner: "",
    eventDate: "",
    eventTime: "",
    message: "",
  });

  const handleSubmit = async () => {
    if (
      !formData.eventType ||
      !formData.eventName.trim() ||
      !formData.eventOwner.trim() ||
      !formData.eventDate ||
      !formData.eventTime
    ) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        weddingHallId: hallId,
        message: formData.message.trim() || "Açıklama yok",
        eventType: parseInt(formData.eventType),
        eventName: formData.eventName.trim(),
        eventOwner: formData.eventOwner.trim(),
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
      });
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Talep başarıyla oluşturuldu.");
      setTimeout(() => {
        setOpen(false);
        setFormData({
          eventType: "",
          eventName: "",
          eventOwner: "",
          eventDate: "",
          eventTime: "",
          message: "",
        });
        setSubmitted(false);
      }, 2000);
    } catch (e) {
      setIsSubmitting(false);
      toast.error(toUserFriendlyMessage(e));
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setFormData({
        eventType: "",
        eventName: "",
        eventOwner: "",
        eventDate: "",
        eventTime: "",
        message: "",
      });
      setSubmitted(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Talep Oluştur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Talep Oluştur</DialogTitle>
          <DialogDescription>
            {hallName} için etkinlik talebinizi oluşturun
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium text-foreground">Talebiniz iletildi!</p>
            <p className="text-sm text-muted-foreground">
              En kısa sürede size dönüş yapılacaktır.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
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

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="eventTime" className="text-foreground">
                  Saat <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="eventTime"
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) =>
                      setFormData({ ...formData, eventTime: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
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
                className="min-h-24 resize-none"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Gönderiliyor..." : "Talep Oluştur"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
