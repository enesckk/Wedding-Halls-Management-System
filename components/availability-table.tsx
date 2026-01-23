"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TimeSlot } from "@/lib/types";

interface AvailabilityTableProps {
  slots: TimeSlot[];
  canEdit: boolean;
}

export function AvailabilityTable({ slots, canEdit }: AvailabilityTableProps) {
  const [availability, setAvailability] = useState(slots);

  const toggleStatus = (id: string) => {
    setAvailability((prev) =>
      prev.map((slot) =>
        slot.id === id
          ? {
              ...slot,
              status: slot.status === "available" ? "booked" : "available",
            }
          : slot
      )
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground">
              Saat Aralığı
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Durum
            </TableHead>
            {canEdit && (
              <TableHead className="text-right font-semibold text-foreground">
                Değiştir
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {availability.map((slot) => (
            <TableRow key={slot.id}>
              <TableCell className="font-medium text-foreground">
                {slot.timeRange}
              </TableCell>
              <TableCell>
                <Badge
                  variant={slot.status === "available" ? "default" : "destructive"}
                  className={
                    slot.status === "available"
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  }
                >
                  {slot.status === "available" ? "Müsait" : "Dolu"}
                </Badge>
              </TableCell>
              {canEdit && (
                <TableCell className="text-right">
                  <Switch
                    checked={slot.status === "available"}
                    onCheckedChange={() => toggleStatus(slot.id)}
                    aria-label={`${slot.timeRange} durumunu değiştir`}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
