"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Building2, Users, Edit, Trash2, Plus } from "lucide-react";
import type { Center } from "@/lib/api/centers";
import type { WeddingHall } from "@/lib/types";
import { getCenterDetail } from "@/lib/api/centers";
import { getHalls } from "@/lib/api/halls";
import { deleteCenter } from "@/lib/api/centers";
import { deleteHall } from "@/lib/api/halls";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { toast } from "sonner";
import { HallCard } from "@/components/hall-card";
import { useUser } from "@/lib/user-context";
import { isSuperAdmin } from "@/lib/utils/role";
import {
  Dialog as ConfirmDialog,
  DialogContent as ConfirmDialogContent,
  DialogDescription as ConfirmDialogDescription,
  DialogFooter as ConfirmDialogFooter,
  DialogHeader as ConfirmDialogHeader,
  DialogTitle as ConfirmDialogTitle,
} from "@/components/ui/dialog";

interface CenterDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  center: Center | null;
  /** Merkez düzenleme için callback */
  onEdit: (center: Center) => void;
  /** Merkeze salon ekleme için callback */
  onAddHall: (centerId: string) => void;
  /** Salon düzenleme için callback */
  onEditHall: (hall: WeddingHall) => void;
  /** Merkez veya salon silindiğinde refresh için */
  onRefresh: () => void;
}

export function CenterDetailModal({
  open,
  onOpenChange,
  center,
  onEdit,
  onAddHall,
  onEditHall,
  onRefresh,
}: CenterDetailModalProps) {
  const { user } = useUser();
  const [centerDetail, setCenterDetail] = useState<{
    halls: WeddingHall[];
    totalCapacity: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [centerToDelete, setCenterToDelete] = useState<Center | null>(null);
  const [hallToDelete, setHallToDelete] = useState<WeddingHall | null>(null);
  const [deletingCenter, setDeletingCenter] = useState(false);
  const [deletingHall, setDeletingHall] = useState(false);

  useEffect(() => {
    if (open && center) {
      loadCenterDetail();
    } else {
      setCenterDetail(null);
    }
  }, [open, center]);

  const loadCenterDetail = async () => {
    if (!center) return;
    setLoading(true);
    try {
      // Merkez detayını ve salonları yükle
      const [detail, allHalls] = await Promise.all([
        getCenterDetail(center.id),
        getHalls(),
      ]);

      const centerHalls = allHalls.filter((h) => h.centerId === center.id);
      const totalCapacity = centerHalls.reduce((sum, h) => sum + h.capacity, 0);

      setCenterDetail({
        halls: centerHalls,
        totalCapacity,
      });
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCenter = async () => {
    if (!centerToDelete) return;
    setDeletingCenter(true);
    try {
      await deleteCenter(centerToDelete.id);
      toast.success("Merkez silindi.");
      setCenterToDelete(null);
      onRefresh();
      onOpenChange(false);
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setDeletingCenter(false);
    }
  };

  const handleDeleteHall = async () => {
    if (!hallToDelete) return;
    setDeletingHall(true);
    try {
      await deleteHall(hallToDelete.id);
      toast.success("Salon silindi.");
      setHallToDelete(null);
      await loadCenterDetail();
      onRefresh();
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setDeletingHall(false);
    }
  };

  if (!center) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-foreground flex items-center gap-2 text-xl">
                  <Building2 className="h-6 w-6 text-primary" />
                  {center.name}
                </DialogTitle>
                <DialogDescription className="mt-2">
                  Merkez detayları ve salonları
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(center)}
                  title="Düzenle"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCenterToDelete(center)}
                  title="Sil"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Merkez görseli ve genel bilgiler */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
                    <Image
                      src={center.imageUrl || "/placeholder.svg"}
                      alt={center.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Adres</Label>
                      {center.address ? (
                        <div className="flex items-start gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <p className="text-sm text-foreground">{center.address}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">Adres bilgisi yok</p>
                      )}
                    </div>
                    {center.description && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Açıklama</Label>
                        <p className="text-sm text-foreground mt-1">{center.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* İstatistikler */}
                <div className="grid gap-4 sm:grid-cols-3 rounded-lg border border-border p-4 bg-muted/30">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {centerDetail?.halls.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Salon Sayısı</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                      <Users className="h-5 w-5" />
                      {centerDetail?.totalCapacity || 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Toplam Kapasite</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {centerDetail?.halls.length
                        ? Math.round((centerDetail.totalCapacity / centerDetail.halls.length) * 10) / 10
                        : 0}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Ortalama Kapasite</div>
                  </div>
                </div>

                {/* Salonlar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Salonlar</h3>
                    {isSuperAdmin(user?.role) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddHall(center.id)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Salon Ekle
                      </Button>
                    )}
                  </div>
                  {centerDetail?.halls.length ? (
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                      {centerDetail.halls.map((hall) => (
                        <HallCard
                          key={hall.id}
                          hall={hall}
                          onEdit={isSuperAdmin(user?.role) ? (h) => onEditHall(h) : undefined}
                          onDelete={isSuperAdmin(user?.role) ? (h) => setHallToDelete(h) : undefined}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Henüz salon eklenmemiş</p>
                      {isSuperAdmin(user?.role) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddHall(center.id)}
                          className="mt-4 gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          İlk Salonu Ekle
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Merkez silme onayı */}
      <ConfirmDialog open={!!centerToDelete} onOpenChange={(open) => { if (!open) setCenterToDelete(null); }}>
        <ConfirmDialogContent className="sm:max-w-md">
          <ConfirmDialogHeader>
            <ConfirmDialogTitle>Merkezi sil</ConfirmDialogTitle>
            <ConfirmDialogDescription>
              &quot;{centerToDelete?.name}&quot; merkezini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              {centerDetail && centerDetail.halls.length > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Bu merkeze ait {centerDetail.halls.length} salon da silinecektir.
                </span>
              )}
            </ConfirmDialogDescription>
          </ConfirmDialogHeader>
          <ConfirmDialogFooter>
            <Button variant="outline" onClick={() => setCenterToDelete(null)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCenter}
              disabled={deletingCenter}
            >
              {deletingCenter ? "Siliniyor..." : "Sil"}
            </Button>
          </ConfirmDialogFooter>
        </ConfirmDialogContent>
      </ConfirmDialog>

      {/* Salon silme onayı */}
      <ConfirmDialog open={!!hallToDelete} onOpenChange={(open) => { if (!open) setHallToDelete(null); }}>
        <ConfirmDialogContent className="sm:max-w-md">
          <ConfirmDialogHeader>
            <ConfirmDialogTitle>Salonu sil</ConfirmDialogTitle>
            <ConfirmDialogDescription>
              &quot;{hallToDelete?.name}&quot; salonunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </ConfirmDialogDescription>
          </ConfirmDialogHeader>
          <ConfirmDialogFooter>
            <Button variant="outline" onClick={() => setHallToDelete(null)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteHall}
              disabled={deletingHall}
            >
              {deletingHall ? "Siliniyor..." : "Sil"}
            </Button>
          </ConfirmDialogFooter>
        </ConfirmDialogContent>
      </ConfirmDialog>
    </>
  );
}
