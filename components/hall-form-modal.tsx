"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createHall, updateHall } from "@/lib/api/halls";
import type { CreateHallData, UpdateHallData } from "@/lib/api/halls";
import type { WeddingHall } from "@/lib/types";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { toast } from "sonner";

type Mode = "create" | "update";

interface HallFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  initialHall?: WeddingHall | null;
  onSuccess: (hall: WeddingHall) => void | Promise<void>;
}

const emptyForm: CreateHallData = {
  name: "",
  address: "",
  capacity: 0,
  description: "",
  imageUrl: "",
};

export function HallFormModal({
  open,
  onOpenChange,
  mode,
  initialHall,
  onSuccess,
}: HallFormModalProps) {
  const [form, setForm] = useState<CreateHallData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === "update" && initialHall) {
        setForm({
          name: initialHall.name,
          address: initialHall.address,
          capacity: initialHall.capacity,
          description: initialHall.description,
          imageUrl: initialHall.imageUrl || "",
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, mode, initialHall]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (form.capacity < 1) {
      toast.error("Kapasite 1 veya daha büyük olmalıdır.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const created = await createHall(form);
        toast.success("Salon oluşturuldu.");
        await onSuccess(created);
        onOpenChange(false);
      } else if (initialHall) {
        const updated = await updateHall(initialHall.id, form);
        toast.success("Salon güncellendi.");
        await onSuccess(updated);
        onOpenChange(false);
      }
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === "create" ? "Yeni Salon Ekle" : "Salonu Düzenle";
  const description =
    mode === "create"
      ? "Yeni nikah salonu bilgilerini girin."
      : "Salon bilgilerini güncelleyin.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="hall-name">Ad</Label>
            <Input
              id="hall-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Salon adı"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hall-address">Adres</Label>
            <Input
              id="hall-address"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="Adres"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hall-capacity">Kapasite</Label>
            <Input
              id="hall-capacity"
              type="number"
              min={1}
              value={form.capacity || ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  capacity: parseInt(e.target.value, 10) || 0,
                }))
              }
              placeholder="Kişi sayısı"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hall-description">Açıklama</Label>
            <Textarea
              id="hall-description"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Açıklama"
              className="min-h-20 resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hall-imageUrl">Görsel URL</Label>
            <Input
              id="hall-imageUrl"
              value={form.imageUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, imageUrl: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={!form.name.trim() || isSubmitting}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Kaydediliyor..." : mode === "create" ? "Oluştur" : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
