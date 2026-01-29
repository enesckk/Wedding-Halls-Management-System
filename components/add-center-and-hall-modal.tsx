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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createCenter, type CreateCenterData } from "@/lib/api/centers";
import { createHall, type CreateHallData } from "@/lib/api/halls";
import type { WeddingHall } from "@/lib/types";
import type { Center } from "@/lib/api/centers";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { toast } from "sonner";
import { Upload, X, Building2 } from "lucide-react";
import { getCenters } from "@/lib/api/centers";
import { getAllUsers } from "@/lib/api/auth";
import type { User } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AddMode = "existing" | "new";

interface AddCenterAndHallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (hall: WeddingHall) => void | Promise<void>;
  /** Belirli bir merkeze salon eklerken bu merkezi önceden seçili getir */
  initialCenterId?: string;
}

const emptyCenterForm: CreateCenterData = {
  name: "",
  address: "",
  description: "",
  imageUrl: "",
};

const emptyHallForm: Omit<CreateHallData, "centerId"> = {
  name: "",
  address: "",
  capacity: 0,
  description: "",
  imageUrl: "",
  technicalDetails: "",
  allowedUserIds: [],
};

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

function parseTechnicalDetails(details: string): Set<string> {
  if (!details) return new Set();
  const foundIds = new Set<string>();
  const items = details.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  items.forEach((item) => {
    const option = TECHNICAL_DETAILS_OPTIONS.find(
      (opt) => opt.label.toLowerCase() === item.toLowerCase() || opt.id === item
    );
    if (option) foundIds.add(option.id);
  });
  return foundIds;
}

function formatTechnicalDetails(selected: Set<string>): string {
  const labels = Array.from(selected)
    .map((id) => {
      const option = TECHNICAL_DETAILS_OPTIONS.find((opt) => opt.id === id);
      return option ? option.label : id;
    })
    .filter(Boolean);
  return labels.join(", ");
}

export function AddCenterAndHallModal({
  open,
  onOpenChange,
  onSuccess,
  initialCenterId,
}: AddCenterAndHallModalProps) {
  const [addMode, setAddMode] = useState<AddMode>("existing");
  const [centerForm, setCenterForm] = useState<CreateCenterData>(emptyCenterForm);
  const [hallForm, setHallForm] = useState<Omit<CreateHallData, "centerId"> & { centerId: string }>({
    ...emptyHallForm,
    centerId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hallImagePreview, setHallImagePreview] = useState("");
  const [selectedTechnicalDetails, setSelectedTechnicalDetails] = useState<Set<string>>(new Set());
  const [selectedEditorIds, setSelectedEditorIds] = useState<Set<string>>(new Set());
  const hallFileInputRef = useRef<HTMLInputElement>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [editors, setEditors] = useState<User[]>([]);

  useEffect(() => {
    if (open) {
      getCenters()
        .then(setCenters)
        .catch(() => setCenters([]));
      getAllUsers()
        .then((users) => users.filter((u) => u.role === "Editor"))
        .then(setEditors)
        .catch(() => setEditors([]));
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setCenterForm(emptyCenterForm);
      const defaultCenterId = initialCenterId || centers[0]?.id || "";
      setHallForm({ ...emptyHallForm, centerId: defaultCenterId });
      setHallImagePreview("");
      setSelectedTechnicalDetails(new Set());
      setSelectedEditorIds(new Set());
      if (hallFileInputRef.current) hallFileInputRef.current.value = "";
      // Eğer initialCenterId varsa, "existing" modunu seç
      if (initialCenterId) {
        setAddMode("existing");
      }
    }
  }, [open, initialCenterId]);

  useEffect(() => {
    if (open && addMode === "existing" && centers.length > 0) {
      const targetCenterId = initialCenterId || centers[0]?.id;
      if (targetCenterId && !hallForm.centerId) {
        setHallForm((p) => ({ ...p, centerId: targetCenterId }));
      }
    }
  }, [open, addMode, centers, initialCenterId, hallForm.centerId]);

  const handleHallImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel dosyası seçin.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Görsel boyutu 5MB'dan küçük olmalıdır.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 400;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          const scale = Math.min(MAX_SIZE / width, MAX_SIZE / height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          let quality = 0.3;
          let base64String = canvas.toDataURL("image/jpeg", quality);
          let attempts = 0;
          while (base64String.length > 1000 && attempts < 5) {
            const scale = Math.sqrt(900 / base64String.length);
            width = Math.max(50, Math.floor(width * scale));
            height = Math.max(50, Math.floor(height * scale));
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            base64String = canvas.toDataURL("image/jpeg", quality);
            attempts++;
          }
          if (base64String.length > 1000) {
            toast.error("Görsel çok büyük. Lütfen görsel URL'i kullanın veya daha küçük bir görsel seçin.");
            setHallForm((p) => ({ ...p, imageUrl: "" }));
            setHallImagePreview("");
            return;
          }
          setHallForm((p) => ({ ...p, imageUrl: base64String }));
          setHallImagePreview(base64String);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleTechnicalDetailToggle = (detailId: string) => {
    const newSelected = new Set(selectedTechnicalDetails);
    if (newSelected.has(detailId)) newSelected.delete(detailId);
    else newSelected.add(detailId);
    setSelectedTechnicalDetails(newSelected);
    setHallForm((p) => ({ ...p, technicalDetails: formatTechnicalDetails(newSelected) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hallForm.name.trim()) {
      toast.error("Salon adı girin.");
      return;
    }
    if (hallForm.capacity < 1) {
      toast.error("Kapasite 1 veya daha büyük olmalıdır.");
      return;
    }
    if (hallForm.imageUrl && hallForm.imageUrl.length > 1000) {
      toast.error("Görsel çok büyük. Lütfen daha küçük bir görsel seçin veya görsel URL'i kullanın.");
      return;
    }

    let centerId: string;

    if (addMode === "new") {
      if (!centerForm.name.trim()) {
        toast.error("Merkez adı girin.");
        return;
      }
      setIsSubmitting(true);
      try {
        const newCenter = await createCenter(centerForm);
        centerId = newCenter.id;
      } catch (err) {
        toast.error(toUserFriendlyMessage(err));
        setIsSubmitting(false);
        return;
      }
    } else {
      if (!hallForm.centerId) {
        toast.error("Lütfen bir merkez seçin.");
        return;
      }
      centerId = hallForm.centerId;
      setIsSubmitting(true);
    }

    const finalHallData: CreateHallData = {
      centerId,
      name: hallForm.name.trim(),
      address: hallForm.address.trim(),
      capacity: hallForm.capacity,
      description: hallForm.description.trim(),
      imageUrl: hallForm.imageUrl.trim() || "",
      technicalDetails: formatTechnicalDetails(selectedTechnicalDetails),
      allowedUserIds: Array.from(selectedEditorIds),
    };

    try {
      const created = await createHall(finalHallData);
      toast.success(addMode === "new" ? "Merkez ve salon oluşturuldu." : "Salon oluşturuldu.");
      await onSuccess(created);
      onOpenChange(false);
    } catch (err) {
      toast.error(toUserFriendlyMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Yeni Ekle (Merkez / Salon)
          </DialogTitle>
          <DialogDescription>
            Mevcut bir merkeze salon ekleyebilir veya yeni merkez oluşturup ilk salonu ekleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label>Ne eklemek istiyorsunuz?</Label>
                <RadioGroup
                  value={addMode}
                  onValueChange={(v) => setAddMode(v as AddMode)}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="mode-existing" />
                    <Label htmlFor="mode-existing" className="font-normal cursor-pointer">
                      Mevcut merkeze salon ekle
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="mode-new" />
                    <Label htmlFor="mode-new" className="font-normal cursor-pointer">
                      Yeni merkez oluştur ve salon ekle
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {addMode === "existing" ? (
                <div className="space-y-2">
                  <Label htmlFor="center-select">Merkez *</Label>
                  <Select
                    value={hallForm.centerId}
                    onValueChange={(value) => setHallForm((p) => ({ ...p, centerId: value }))}
                  >
                    <SelectTrigger id="center-select">
                      <SelectValue placeholder="Merkez seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {centers.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Henüz merkez yok. Aşağıdan &quot;Yeni merkez oluştur ve salon ekle&quot; seçin.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
                  <h4 className="font-medium text-sm text-foreground">Yeni merkez bilgileri</h4>
                  <div className="space-y-2">
                    <Label htmlFor="center-name">Merkez adı *</Label>
                    <Input
                      id="center-name"
                      value={centerForm.name}
                      onChange={(e) => setCenterForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Örn: Şehitkamil Kültür Kongre Merkezi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="center-address">Merkez adresi</Label>
                    <Input
                      id="center-address"
                      value={centerForm.address}
                      onChange={(e) => setCenterForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Adres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="center-description">Açıklama</Label>
                    <Textarea
                      id="center-description"
                      value={centerForm.description}
                      onChange={(e) => setCenterForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Kısa açıklama"
                      className="min-h-16 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="center-imageUrl">Görsel URL</Label>
                    <Input
                      id="center-imageUrl"
                      value={centerForm.imageUrl}
                      onChange={(e) => setCenterForm((p) => ({ ...p, imageUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium text-sm text-foreground">Salon bilgileri</h4>
                <div className="space-y-2">
                  <Label htmlFor="hall-name">Salon adı *</Label>
                  <Input
                    id="hall-name"
                    value={hallForm.name}
                    onChange={(e) => setHallForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Salon adı"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hall-capacity">Kapasite *</Label>
                  <Input
                    id="hall-capacity"
                    type="number"
                    min={1}
                    value={hallForm.capacity || ""}
                    onChange={(e) =>
                      setHallForm((p) => ({
                        ...p,
                        capacity: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    placeholder="Kişi sayısı"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hall-address">Adres</Label>
                  <Input
                    id="hall-address"
                    value={hallForm.address}
                    onChange={(e) => setHallForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Adres"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hall-description">Açıklama</Label>
                  <Textarea
                    id="hall-description"
                    value={hallForm.description}
                    onChange={(e) => setHallForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Açıklama"
                    className="min-h-16 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salon görseli</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => hallFileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Görsel Seç
                    </Button>
                    <input
                      ref={hallFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleHallImageSelect}
                      className="hidden"
                    />
                    {hallImagePreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setHallImagePreview("");
                          setHallForm((p) => ({ ...p, imageUrl: "" }));
                        }}
                        className="gap-2 text-destructive"
                      >
                        <X className="h-4 w-4" />
                        Kaldır
                      </Button>
                    )}
                  </div>
                  {hallImagePreview ? (
                    <div className="relative w-full overflow-hidden rounded-lg border border-border">
                      <img src={hallImagePreview} alt="Preview" className="h-32 w-full object-cover" />
                    </div>
                  ) : (
                    <Input
                      value={hallForm.imageUrl}
                      onChange={(e) => {
                        setHallForm((p) => ({ ...p, imageUrl: e.target.value }));
                        setHallImagePreview(e.target.value);
                      }}
                      placeholder="Veya görsel URL'i girin..."
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Teknik detaylar</Label>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 max-h-40 overflow-y-auto">
                    {TECHNICAL_DETAILS_OPTIONS.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tech-add-${option.id}`}
                          checked={selectedTechnicalDetails.has(option.id)}
                          onCheckedChange={() => handleTechnicalDetailToggle(option.id)}
                        />
                        <label
                          htmlFor={`tech-add-${option.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Textarea
                    value={hallForm.technicalDetails}
                    onChange={(e) => {
                      setHallForm((p) => ({ ...p, technicalDetails: e.target.value }));
                      setSelectedTechnicalDetails(parseTechnicalDetails(e.target.value));
                    }}
                    placeholder="Ek teknik detaylar (isteğe bağlı)"
                    className="min-h-16 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Erişim izni olan editörler</Label>
                  <div className="space-y-2 rounded-lg border p-3 max-h-36 overflow-y-auto">
                    {editors.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Henüz editör kullanıcı yok.</p>
                    ) : (
                      editors.map((editor) => (
                        <div key={editor.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`editor-add-${editor.id}`}
                            checked={selectedEditorIds.has(editor.id)}
                            onCheckedChange={(checked) => {
                              const next = new Set(selectedEditorIds);
                              if (checked) next.add(editor.id);
                              else next.delete(editor.id);
                              setSelectedEditorIds(next);
                            }}
                          />
                          <label
                            htmlFor={`editor-add-${editor.id}`}
                            className="text-sm font-medium leading-none cursor-pointer flex-1"
                          >
                            {editor.name} ({editor.email})
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t flex-shrink-0 bg-background">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button
              type="submit"
              disabled={!hallForm.name.trim() || hallForm.capacity < 1 || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? "Kaydediliyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
