"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Merkezler artık Salonlar sayfasında yönetiliyor.
 * Eski linklere gelenleri salonlara yönlendir.
 */
export default function MerkezlerPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/salonlar");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p className="text-muted-foreground">Yönlendiriliyor...</p>
    </div>
  );
}
