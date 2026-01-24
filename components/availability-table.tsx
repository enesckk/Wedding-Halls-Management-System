"use client";

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
import type { Schedule } from "@/lib/types";

function formatTimeRange(s: Schedule): string {
  const start = s.startTime.slice(0, 5);
  const end = s.endTime.slice(0, 5);
  return `${start} - ${end}`;
}

interface AvailabilityTableProps {
  schedules: Schedule[];
  canEdit: boolean;
  onToggle?: (schedule: Schedule) => void;
}

export function AvailabilityTable({ schedules, canEdit, onToggle }: AvailabilityTableProps) {
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
          {schedules.map((slot) => (
            <TableRow key={slot.id}>
              <TableCell className="font-medium text-foreground">
                {formatTimeRange(slot)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={slot.status === "Available" ? "default" : "destructive"}
                  className={
                    slot.status === "Available"
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  }
                >
                  {slot.status === "Available" ? "Müsait" : "Dolu"}
                </Badge>
              </TableCell>
              {canEdit && onToggle && (
                <TableCell className="text-right">
                  <Switch
                    checked={slot.status === "Available"}
                    onCheckedChange={() => onToggle(slot)}
                    aria-label={`${formatTimeRange(slot)} durumunu değiştir`}
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
