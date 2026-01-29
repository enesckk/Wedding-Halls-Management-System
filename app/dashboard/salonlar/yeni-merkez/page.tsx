"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCenter, type CreateCenterData } from "@/lib/api/centers";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { toast } from "sonner";
import { Building2, ArrowLeft } from "lucide-react";

const emptyForm: CreateCenterData & { capacity: number } = {
  name: "",
  address: "",
  description: "",
  imageUrl: "",
  capacity: 0,
};

export default function NewCenterPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Merkez adı girin.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Kapasite bilgisini description'a ekle (backend'de kapasite alanı yok)
      const centerData: CreateCenterData = {
        name: form.name.trim(),
        address: form.address.trim(),
        description: form.capacity > 0 
          ? `${form.description.trim()}\n\nToplam Kapasite: ${form.capacity} kişi`.trim()
          : form.description.trim(),
        imageUrl: form.imageUrl.trim(),
      };

      await createCenter(centerData);
      toast.success("Merkez oluşturuldu.");
      router.push("/dashboard/salonlar");
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/salonlar")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Yeni Merkez Ekle
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Yeni merkez bilgilerini girin.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="center-name">Merkez Adı *</Label>
          <Input
            id="center-name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Örn: Şehitkamil Kültür Kongre Merkezi"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="center-address">Adres</Label>
          <Input
            id="center-address"
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            placeholder="Adres"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="center-capacity">Toplam Kapasite</Label>
          <Input
            id="center-capacity"
            type="number"
            min={0}
            value={form.capacity || ""}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                capacity: parseInt(e.target.value, 10) || 0,
              }))
            }
            placeholder="Kişi sayısı"
          />
          <p className="text-xs text-muted-foreground">
            Merkezin toplam kapasitesi (isteğe bağlı)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="center-imageUrl">Görsel URL</Label>
          <Input
            id="center-imageUrl"
            value={form.imageUrl}
            onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="center-description">Açıklama</Label>
          <Textarea
            id="center-description"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Kısa açıklama"
            className="min-h-24 resize-none"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/salonlar")}
            className="flex-1"
          >
            İptal
          </Button>
          <Button
            type="submit"
            disabled={!form.name.trim() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Kaydediliyor..." : "Oluştur"}
          </Button>
        </div>
      </form>
    </div>
  );
}
