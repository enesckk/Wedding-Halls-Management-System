"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvailabilityTable } from "@/components/availability-table";
import { RequestModal } from "@/components/request-modal";
import { getHallById } from "@/lib/data";
import { useUser } from "@/lib/user-context";
import {
  ArrowLeft,
  Calendar,
  Info,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
} from "lucide-react";

export default function HallDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const hall = getHallById(id);
  const { isAdmin } = useUser();

  if (!hall) {
    notFound();
  }

  const availableSlots = hall.availability.filter(
    (s) => s.status === "available"
  ).length;
  const bookedSlots = hall.availability.filter(
    (s) => s.status === "booked"
  ).length;
  const totalSlots = hall.availability.length;
  const availabilityPercentage = Math.round((availableSlots / totalSlots) * 100);

  return (
    <div className="space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/salonlar">
          <Button variant="outline" size="icon" className="h-10 w-10 bg-transparent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{hall.name}</h1>
          <p className="text-muted-foreground">{hall.address}</p>
        </div>
        {isAdmin && (
          <Badge className="gap-1 bg-primary/10 text-primary">
            <Shield className="h-3 w-3" />
            Düzenleme Yetkisi
          </Badge>
        )}
      </div>

      {/* Hero Image & Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image
              src={hall.imageUrl || "/placeholder.svg"}
              alt={hall.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex gap-2">
                <Badge className="bg-card/90 text-foreground backdrop-blur-sm">
                  <Users className="mr-1 h-3 w-3" />
                  {hall.capacity} Kişi
                </Badge>
                <Badge className="bg-card/90 text-foreground backdrop-blur-sm">
                  <Clock className="mr-1 h-3 w-3" />
                  {totalSlots} Saat Dilimi
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-primary">
                  %{availabilityPercentage}
                </div>
                <p className="text-sm text-muted-foreground">Müsaitlik Oranı</p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${availabilityPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <div className="text-2xl font-bold text-green-700">
                  {availableSlots}
                </div>
                <p className="text-xs text-green-600">Müsait</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-center">
                <XCircle className="mx-auto mb-2 h-8 w-8 text-red-600" />
                <div className="text-2xl font-bold text-red-700">
                  {bookedSlots}
                </div>
                <p className="text-xs text-red-600">Dolu</p>
              </CardContent>
            </Card>
          </div>

          <RequestModal hallName={hall.name} />
        </div>
      </div>

      {/* Info & Schedule Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hall Info */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Info className="h-5 w-5 text-primary" />
              Salon Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Adres
                </p>
                <p className="text-foreground">{hall.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Kapasite
                </p>
                <p className="text-foreground">{hall.capacity} Kişi</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground">
                Açıklama
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                {hall.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Availability Schedule */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                Bugünkü Müsaitlik Durumu
              </CardTitle>
              {!isAdmin && (
                <Badge variant="outline" className="text-xs">
                  Sadece Görüntüleme
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <AvailabilityTable slots={hall.availability} canEdit={isAdmin} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
