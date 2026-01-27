"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@/lib/user-context";
import { isEditor as isEditorRole } from "@/lib/utils/role";
import { getRequests, approveRequest, rejectRequest } from "@/lib/api/requests";
import { getHalls } from "@/lib/api/halls";
import { getMessagesByRequestId, createMessage, type MessageDto } from "@/lib/api/messages";
import type { Request as Req, WeddingHall } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Unauthorized } from "@/components/unauthorized";
import {
  FileText,
  Clock,
  CheckCircle2,
  MessageSquare,
  Building2,
  Calendar,
  User,
  Send,
  XCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { sanitizeText } from "@/lib/utils/sanitize";
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
  if (status === "Rejected") {
    return (
      <Badge variant="outline" className="gap-1 border-red-500 text-red-600">
        <XCircle className="h-3 w-3" />
        Reddedildi
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-green-500 text-white">
      <CheckCircle2 className="h-3 w-3" />
      Onaylandı
    </Badge>
  );
}

export default function RequestsPage() {
  const { user, loading: authLoading } = useUser();
  const [requests, setRequests] = useState<Req[]>([]);
  const [halls, setHalls] = useState<WeddingHall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Req | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const loadMessagesIdRef = useRef(0);

  const loadRequests = useCallback(async () => {
    try {
      const [reqs, h] = await Promise.all([getRequests(), getHalls()]);
      setHalls(h ?? []);
      // Debug: Status değerlerini kontrol et
      console.log("Loaded requests:", reqs.map(r => ({ id: r.id, status: r.status })));
      const withHall = (reqs ?? []).map((r) => ({
        ...r,
        hallName: h.find((x) => x.id === r.weddingHallId)?.name ?? "",
      }));
      setRequests(withHall);
      setSelected((prev) => {
        if (!prev) return null;
        const next = withHall.find((x) => x.id === prev.id);
        return next ?? prev;
      });
    } catch (e) {
      console.error("loadRequests error:", e);
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadRequests();
  }, [loadRequests]);

  const loadMessages = useCallback(async (requestId: string) => {
    const id = ++loadMessagesIdRef.current;
    setLoadingMessages(true);
    try {
      const msgs = await getMessagesByRequestId(requestId);
      if (id !== loadMessagesIdRef.current) return;
      setMessages(msgs);
    } catch (e) {
      if (id !== loadMessagesIdRef.current) return;
      toast.error(toUserFriendlyMessage(e));
    } finally {
      if (id === loadMessagesIdRef.current) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    setNewMessage("");
    if (selected) {
      loadMessages(selected.id);
    } else {
      setMessages([]);
    }
  }, [selected?.id, loadMessages]);

  const handleSendMessage = async () => {
    if (!selected || !newMessage.trim()) return;
    setSendingMessage(true);
    try {
      await createMessage(selected.id, { content: newMessage.trim() });
      setNewMessage("");
      await loadMessages(selected.id);
      toast.success("Mesaj gönderildi.");
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setSendingMessage(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Answered").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isEditorRole(user?.role)) {
    return <Unauthorized />;
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Onaylanan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">Reddedilen</p>
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
                        {sanitizeText(r.message)}
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
              <CardContent className="flex flex-col p-0">
                <div className="space-y-4 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">Talep Mesajı</p>
                      <div className="mt-1 rounded-lg bg-muted p-3">
                        <p className="text-sm whitespace-pre-wrap">{sanitizeText(selected.message)}</p>
                      </div>
                    </div>
                  </div>
                  {selected.status === "Pending" && (
                    <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                      <p className="w-full text-sm text-muted-foreground">
                        Talep onaylanırsa müsaitlik oluşturulur; reddedilirse işlem yapılmaz.
                        Aynı salonda aynı saate başka etkinlik varsa onay verilemez.
                      </p>
                      <Button
                        className="gap-2 bg-green-600 text-white hover:bg-green-700"
                        disabled={actionId === selected.id}
                        onClick={async () => {
                          if (!selected) return;
                          console.log("Approving request:", { id: selected.id, status: selected.status });
                          setActionId(selected.id);
                          try {
                            const updated = await approveRequest(selected.id);
                            toast.success("Talep onaylandı. Müsaitlik oluşturuldu.");
                            // State'i hemen güncelle
                            setRequests((prev) =>
                              prev.map((r) =>
                                r.id === selected.id
                                  ? { ...updated, hallName: r.hallName }
                                  : r
                              )
                            );
                            setSelected((prev) =>
                              prev?.id === selected.id
                                ? { ...updated, hallName: prev.hallName }
                                : prev
                            );
                            // Sonra tüm listeyi yenile
                            await loadRequests();
                          } catch (e) {
                            console.error("approveRequest error:", e);
                            toast.error(toUserFriendlyMessage(e));
                          } finally {
                            setActionId(null);
                          }
                        }}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {actionId === selected.id ? "İşleniyor..." : "Onayla"}
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={actionId === selected.id}
                        onClick={async () => {
                          if (!selected) return;
                          console.log("Rejecting request:", { id: selected.id, status: selected.status });
                          setActionId(selected.id);
                          try {
                            const updated = await rejectRequest(selected.id);
                            toast.success("Talep reddedildi.");
                            // State'i hemen güncelle
                            setRequests((prev) =>
                              prev.map((r) =>
                                r.id === selected.id
                                  ? { ...updated, hallName: r.hallName }
                                  : r
                              )
                            );
                            setSelected((prev) =>
                              prev?.id === selected.id
                                ? { ...updated, hallName: prev.hallName }
                                : prev
                            );
                            // Sonra tüm listeyi yenile
                            await loadRequests();
                          } catch (e) {
                            console.error("rejectRequest error:", e);
                            toast.error(toUserFriendlyMessage(e));
                          } finally {
                            setActionId(null);
                          }
                        }}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Reddet
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t border-border">
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">Mesajlar</p>
                      {loadingMessages && (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      )}
                    </div>
                    <ScrollArea className="h-[200px]">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                          <p className="mt-2 text-xs text-muted-foreground">
                            Henüz mesaj yok
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 pr-4">
                          {messages.map((msg) => {
                            const isCurrentUser = msg.senderUserId === user?.id;
                            return (
                              <div
                                key={msg.id}
                                className={`flex gap-2 ${
                                  isCurrentUser ? "flex-row-reverse" : ""
                                }`}
                              >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <div
                                  className={`max-w-[75%] ${
                                    isCurrentUser ? "text-right" : ""
                                  }`}
                                >
                                  <div
                                    className={`rounded-lg p-2.5 ${
                                      isCurrentUser
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    }`}
                                  >
                                    <p className="text-xs whitespace-pre-wrap">
                                      {sanitizeText(msg.content)}
                                    </p>
                                  </div>
                                  <p className="mt-1 text-[10px] text-muted-foreground">
                                    {formatDate(msg.createdAt)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                  <div className="border-t border-border p-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Mesaj yazın..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && newMessage.trim()) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="min-h-16 resize-none"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Send className="h-4 w-4" />
                        Gönder
                      </Button>
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
