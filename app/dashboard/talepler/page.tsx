"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/user-context";
import { getRequests } from "@/lib/api/requests";
import { getHalls } from "@/lib/api/halls";
import type { Request as Req, WeddingHall } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Clock,
  CheckCircle2,
  MessageSquare,
  Building2,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: Req["status"] }) {
  if (status === "Pending") {
    return (
      <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
        <Clock className="h-3 w-3" />
        Beklemede
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-green-500 text-white">
      <CheckCircle2 className="h-3 w-3" />
      Yanıtlandı
    </Badge>
  );
}

export default function RequestsPage() {
  const { isEditor } = useUser();
  const [requests, setRequests] = useState<Req[]>([]);
  const [halls, setHalls] = useState<WeddingHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Req | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [reqs, h] = await Promise.all([getRequests(), getHalls()]);
        if (cancelled) return;
        setHalls(h ?? []);
        const withHall = (reqs ?? []).map((r) => ({
          ...r,
          hallName: h.find((x) => x.id === r.weddingHallId)?.name ?? "",
        }));
        setRequests(withHall);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Talepler yüklenemedi.";
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const answeredCount = requests.filter((r) => r.status === "Answered").length;

  if (!isEditor) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Talepler</h1>
        <p className="text-muted-foreground">
          Personelden gelen talepleri görüntüleyin
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{requests.length}</p>
              <p className="text-sm text-muted-foreground">Toplam Talep</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Bekleyen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{answeredCount}</p>
              <p className="text-sm text-muted-foreground">Yanıtlanan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tüm Talepler</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Henüz talep yok
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {requests.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      className={`w-full p-4 text-left transition-colors hover:bg-muted/50 ${
                        selected?.id === r.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelected(r)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">
                            {r.hallName || "—"}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(r.createdAt)}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>ID: {r.createdByUserId.slice(0, 8)}…</span>
                          </div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {r.message}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          {selected ? (
            <>
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {selected.hallName || "—"}
                </CardTitle>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selected.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Kullanıcı ID: {selected.createdByUserId.slice(0, 8)}…</span>
                  </div>
                </div>
                <div className="mt-2">
                  <StatusBadge status={selected.status} />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">Mesaj</p>
                    <div className="mt-1 rounded-lg bg-muted p-3">
                      <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-[500px] flex-col items-center justify-center text-center">
              <FileText className="h-16 w-16 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">
                Detayları görmek için bir talep seçin
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
