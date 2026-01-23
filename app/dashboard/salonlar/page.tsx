import { HallCard } from "@/components/hall-card";
import { weddingHalls } from "@/lib/data";

export default function SalonlarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nikah Salonları</h1>
        <p className="text-muted-foreground">
          Tüm nikah salonlarını görüntüleyin ve yönetin
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {weddingHalls.map((hall) => (
          <HallCard key={hall.id} hall={hall} />
        ))}
      </div>
    </div>
  );
}
