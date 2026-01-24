"use client";

import { useEffect, useState } from "react";
import { HallCard } from "@/components/hall-card";
import { getHalls } from "@/lib/api/halls";
import type { WeddingHall } from "@/lib/types";
import { toast } from "sonner";

export default function SalonlarPage() {
  const [halls, setHalls] = useState<WeddingHall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getHalls();
        if (!cancelled) setHalls(data);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Salonlar yüklenemedi.";
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nikah Salonları</h1>
        <p className="text-muted-foreground">
          Tüm nikah salonlarını görüntüleyin ve yönetin
        </p>
      </div>

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
