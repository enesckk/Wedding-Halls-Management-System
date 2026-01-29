"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Eye, Edit, Trash2 } from "lucide-react";
import type { Center } from "@/lib/api/centers";

interface CenterCardProps {
  center: Center;
  /** SuperAdmin: merkez düzenleme */
  onEdit?: (center: Center) => void;
  /** SuperAdmin: merkez silme */
  onDelete?: (center: Center) => void;
}

export function CenterCard({ center, onEdit, onDelete }: CenterCardProps) {
  return (
    <Card className="group overflow-hidden border border-border bg-card transition-all duration-200 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={center.imageUrl || "/placeholder.svg"}
          alt={center.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <CardContent className="space-y-3 p-5">
        <h3 className="text-lg font-semibold text-foreground line-clamp-1 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {center.name}
        </h3>
        
        {center.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="line-clamp-2">{center.address}</span>
          </div>
        )}
        
        {center.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {center.description}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2 border-t border-border bg-muted/30 p-4">
        <div className="flex gap-2 w-full">
          <Link href={`/dashboard/salonlar/${center.id}`} className="flex-1">
            <Button
              variant="default"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <Eye className="h-4 w-4" />
              Detay ve Salonları Gör
            </Button>
          </Link>
          {onEdit && (
            <Button variant="outline" size="icon" onClick={() => onEdit(center)} title="Düzenle">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(center)}
              title="Sil"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
