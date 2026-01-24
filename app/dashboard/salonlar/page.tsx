"use client";

import { useCallback, useEffect, useState } from "react";
import { HallCard } from "@/components/hall-card";
import { HallFormModal } from "@/components/hall-form-modal";
import { getHalls } from "@/lib/api/halls";
import type { WeddingHall } from "@/lib/types";
import { useUser } from "@/lib/user-context";
import { isEditor as isEditorRole } from "@/lib/utils/role";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SalonlarPage() {
  const { user } = useUser();
  const [halls, setHalls] = useState<WeddingHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

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
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const data = await getHalls();
        if (!cancelled) setHalls(data);
      } catch (e) {
        if (!cancelled) toast.error(toUserFriendlyMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCreateSuccess = useCallback(async () => {
    setLoading(true);
    await loadHalls();
  }, [loadHalls]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nikah Salonları</h1>
          <p className="text-muted-foreground">
            Tüm nikah salonlarını görüntüleyin ve yönetin
          </p>
        </div>
        {isEditorRole(user?.role) && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Yeni Salon Ekle
          </Button>
        )}
      </div>

      {isEditorRole(user?.role) && (
        <HallFormModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode="create"
          onSuccess={handleCreateSuccess}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {halls.map((hall) => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
      )}
    </div>
  );
}
