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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { Schedule } from "@/lib/types";

function formatTimeRange(s: Schedule): string {
  const start = s.startTime.slice(0, 5);
  const end = s.endTime.slice(0, 5);
  return `${start} - ${end}`;
}

function getEventTypeName(eventType?: number): string {
  switch (eventType) {
    case 0:
      return "Nikah";
    case 1:
      return "Nişan";
    case 2:
      return "Konser";
    case 3:
      return "Toplantı";
    case 4:
      return "Özel Etkinlik";
    default:
      return "Etkinlik";
  }
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
                {slot.status === "Reserved" && (slot.eventName || slot.eventOwner) ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="destructive"
                          className="bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-help"
                        >
                          Dolu
                        </Badge>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1.5">
                        {slot.eventName && (
                          <div>
                            <p className="font-semibold text-xs">Etkinlik:</p>
                            <p className="text-xs">{slot.eventName}</p>
                          </div>
                        )}
                        {slot.eventOwner && (
                          <div>
                            <p className="font-semibold text-xs">Rezervasyon Yapan:</p>
                            <p className="text-xs">{slot.eventOwner}</p>
                          </div>
                        )}
                        {slot.eventType !== undefined && (
                          <div>
                            <p className="font-semibold text-xs">Etkinlik Tipi:</p>
                            <p className="text-xs">{getEventTypeName(slot.eventType)}</p>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
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
                )}
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
