"use client";

import { useState, useEffect, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { createHall, updateHall } from "@/lib/api/halls";
import type { CreateHallData, UpdateHallData } from "@/lib/api/halls";
import type { WeddingHall } from "@/lib/types";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { toast } from "sonner";
import { Image as ImageIcon, Upload, X } from "lucide-react";

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
  technicalDetails: "",
};

// Nikah salonu için teknik detay seçenekleri
const TECHNICAL_DETAILS_OPTIONS = [
  { id: "ses-sistemi", label: "Ses Sistemi" },
  { id: "isiklandirma", label: "Işıklandırma" },
  { id: "projeksiyon", label: "Projeksiyon/Perde" },
  { id: "mikrofon", label: "Mikrofon" },
  { id: "muzik-sistemi", label: "Müzik Sistemi" },
  { id: "wifi", label: "WiFi İnternet" },
  { id: "klima", label: "Klima" },
  { id: "park-yeri", label: "Park Yeri" },
  { id: "asansor", label: "Asansör" },
  { id: "engelli-erisim", label: "Engelli Erişimi" },
  { id: "mutfak", label: "Mutfak" },
  { id: "bufe-alani", label: "Büfe Alanı" },
  { id: "dans-pisti", label: "Dans Pisti" },
  { id: "dekorasyon", label: "Dekorasyon Hizmeti" },
  { id: "güvenlik", label: "Güvenlik" },
  { id: "temizlik", label: "Temizlik Hizmeti" },
  { id: "ses-yalitimi", label: "Ses Yalıtımı" },
  { id: "hazirlik-odasi", label: "Hazırlık Odası" },
  { id: "vestiyer", label: "Vestiyer" },
  { id: "tuvalet", label: "Tuvalet" },
];

export function HallFormModal({
  open,
  onOpenChange,
  mode,
  initialHall,
  onSuccess,
}: HallFormModalProps) {
  const [form, setForm] = useState<CreateHallData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedTechnicalDetails, setSelectedTechnicalDetails] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel dosyası seçin.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Görsel boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    // Görseli optimize et (sıkıştır ve boyutlandır)
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        // Canvas ile görseli optimize et
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1920; // Maksimum genişlik
        const MAX_HEIGHT = 1080; // Maksimum yükseklik
        let width = img.width;
        let height = img.height;

        // Boyutları orantılı olarak küçült
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // JPEG olarak sıkıştır (kalite: 0.85)
          const base64String = canvas.toDataURL("image/jpeg", 0.85);
          setForm((p) => ({ ...p, imageUrl: base64String }));
          setImagePreview(base64String);
        } else {
          // Canvas desteklenmiyorsa direkt kullan
          const base64String = reader.result as string;
          setForm((p) => ({ ...p, imageUrl: base64String }));
          setImagePreview(base64String);
        }
      };
      img.onerror = () => {
        // Hata durumunda direkt kullan
        const base64String = reader.result as string;
        setForm((p) => ({ ...p, imageUrl: base64String }));
        setImagePreview(base64String);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Teknik detayları string'den Set'e çevir (label'lardan ID'leri bul)
  const parseTechnicalDetails = (details: string): Set<string> => {
    if (!details) return new Set();
    const foundIds = new Set<string>();
    const items = details.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    
    // Her item için label'a göre ID bul
    items.forEach(item => {
      const option = TECHNICAL_DETAILS_OPTIONS.find(
        opt => opt.label.toLowerCase() === item.toLowerCase() || opt.id === item
      );
      if (option) {
        foundIds.add(option.id);
      }
    });
    
    return foundIds;
  };

  // Set'i string'e çevir (ID'lerden label'ları al)
  const formatTechnicalDetails = (selected: Set<string>): string => {
    const labels = Array.from(selected)
      .map(id => {
        const option = TECHNICAL_DETAILS_OPTIONS.find(opt => opt.id === id);
        return option ? option.label : id;
      })
      .filter(Boolean);
    return labels.join(", ");
  };

  useEffect(() => {
    if (open) {
      if (mode === "update" && initialHall) {
        setForm({
          name: initialHall.name,
          address: initialHall.address,
          capacity: initialHall.capacity,
          description: initialHall.description,
          imageUrl: initialHall.imageUrl || "",
          technicalDetails: initialHall.technicalDetails || "",
        });
        setImagePreview(initialHall.imageUrl || "");
        // Mevcut teknik detayları parse et
        const existingDetails = parseTechnicalDetails(initialHall.technicalDetails || "");
        setSelectedTechnicalDetails(existingDetails);
      } else {
        setForm(emptyForm);
        setImagePreview("");
        setSelectedTechnicalDetails(new Set());
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open, mode, initialHall]);

  const handleTechnicalDetailToggle = (detailId: string) => {
    const newSelected = new Set(selectedTechnicalDetails);
    if (newSelected.has(detailId)) {
      newSelected.delete(detailId);
    } else {
      newSelected.add(detailId);
    }
    setSelectedTechnicalDetails(newSelected);
    // Form state'ini de güncelle
    setForm((p) => ({
      ...p,
      technicalDetails: formatTechnicalDetails(newSelected),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (form.capacity < 1) {
      toast.error("Kapasite 1 veya daha büyük olmalıdır.");
      return;
    }

    // Seçilen teknik detayları form'a ekle
    const finalForm = {
      ...form,
      technicalDetails: formatTechnicalDetails(selectedTechnicalDetails),
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const created = await createHall(finalForm);
        toast.success("Salon oluşturuldu.");
        await onSuccess(created);
        onOpenChange(false);
      } else if (initialHall) {
        const updated = await updateHall(initialHall.id, finalForm);
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-4 py-4">
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
            <Label htmlFor="hall-image">Görsel</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Görsel Seç
                </Button>
                <Input
                  ref={fileInputRef}
                  id="hall-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setImagePreview("");
                      setForm((p) => ({ ...p, imageUrl: "" }));
                    }}
                    className="gap-2 text-destructive"
                  >
                    <X className="h-4 w-4" />
                    Kaldır
                  </Button>
                )}
              </div>
              {imagePreview ? (
                <div className="relative w-full overflow-hidden rounded-lg border border-border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Görsel seçilmedi
                    </p>
                  </div>
                </div>
              )}
              <Input
                id="hall-imageUrl"
                value={form.imageUrl}
                onChange={(e) => {
                  setForm((p) => ({ ...p, imageUrl: e.target.value }));
                  setImagePreview(e.target.value);
                }}
                placeholder="Veya görsel URL'i girin..."
                className="mt-2"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hall-technicalDetails">Teknik Detaylar</Label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 rounded-lg border p-4">
                {TECHNICAL_DETAILS_OPTIONS.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tech-${option.id}`}
                      checked={selectedTechnicalDetails.has(option.id)}
                      onCheckedChange={() => handleTechnicalDetailToggle(option.id)}
                    />
                    <label
                      htmlFor={`tech-${option.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
              <Textarea
                id="hall-technicalDetails"
                value={form.technicalDetails}
                onChange={(e) => {
                  setForm((p) => ({ ...p, technicalDetails: e.target.value }));
                  // Manuel giriş yapılırsa selectedTechnicalDetails'i güncelle
                  const parsed = parseTechnicalDetails(e.target.value);
                  setSelectedTechnicalDetails(parsed);
                }}
                placeholder="Ek teknik detaylar veya özel notlar (isteğe bağlı)..."
                className="min-h-20 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Yukarıdaki seçeneklerden seçim yapabilir veya manuel olarak ek bilgi girebilirsiniz.
              </p>
            </div>
          </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t flex-shrink-0 bg-background">
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
