"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users } from "lucide-react";
import type { WeddingHall } from "@/lib/types";
import { RequestModal } from "@/components/request-modal";

interface HallCardProps {
  hall: WeddingHall;
}

export function HallCard({ hall }: HallCardProps) {
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
        <Link href={`/dashboard/${hall.id}`} className="w-full">
          <Button
            variant="default"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Detayları Gör
          </Button>
        </Link>
        <RequestModal hallId={hall.id} hallName={hall.name} />
      </CardFooter>
    </Card>
  );
}
