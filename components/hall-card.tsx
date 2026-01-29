"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Edit, Trash2, MessageSquarePlus } from "lucide-react";
import type { WeddingHall } from "@/lib/types";
import { useUser } from "@/lib/user-context";
import { isViewer } from "@/lib/utils/role";

interface HallCardProps {
  hall: WeddingHall;
  /** SuperAdmin: salon düzenleme */
  onEdit?: (hall: WeddingHall) => void;
  /** SuperAdmin: salon silme */
  onDelete?: (hall: WeddingHall) => void;
}

export function HallCard({ hall, onEdit, onDelete }: HallCardProps) {
  const { user } = useUser();
  const canRequest = isViewer(user?.role);

  return (
    <Card className="group overflow-hidden border border-border bg-card transition-all duration-200 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={hall.imageUrl || "/placeholder.svg"}
          alt={hall.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <CardContent className="space-y-3 p-5">
        <h3 className="text-lg font-semibold text-foreground line-clamp-1">
          {hall.name}
        </h3>
        
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="line-clamp-2">{hall.address}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{hall.capacity} Kişilik Kapasite</span>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2 border-t border-border bg-muted/30 p-4">
        <div className="flex gap-2 w-full">
          <Link href={`/dashboard/${hall.id}`} className="flex-1">
            <Button
              variant="default"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Detayları Gör
            </Button>
          </Link>
          {onEdit && (
            <Button variant="outline" size="icon" onClick={() => onEdit(hall)} title="Düzenle">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="icon" onClick={() => onDelete(hall)} title="Sil" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {canRequest && (
          <Link href={`/dashboard/talep-et?hallId=${hall.id}`} className="w-full">
            <Button variant="outline" className="w-full gap-2">
              <MessageSquarePlus className="h-4 w-4" />
              Talep Oluştur
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
