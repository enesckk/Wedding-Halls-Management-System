"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/lib/user-context";
import { canEdit, isViewer as isViewerRole } from "@/lib/utils/role";
import { getRequests, approveRequest, rejectRequest, updateRequest, deleteRequest, type UpdateRequestData } from "@/lib/api/requests";
import { getHalls } from "@/lib/api/halls";
import { getSchedulesByHall } from "@/lib/api/schedules";
import { getMessagesByRequestId, createMessage, type MessageDto } from "@/lib/api/messages";
import type { Request as Req, WeddingHall, Schedule } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Unauthorized } from "@/components/unauthorized";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  Info,
  Edit,
  Trash2,
} from "lucide-react";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { sanitizeText } from "@/lib/utils/sanitize";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { value: 0, label: "Nikah" },
  { value: 1, label: "Nişan" },
  { value: 2, label: "Konser" },
  { value: 3, label: "Toplantı" },
  { value: 4, label: "Özel" },
];

function getEventTypeLabel(eventType: number): string {
  return EVENT_TYPES.find((t) => t.value === eventType)?.label ?? "Bilinmeyen";
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEventDate(dateStr: string, timeStr: string) {
  try {
    const date = new Date(dateStr);
    const time = timeStr.split(":")[0] + ":" + timeStr.split(":")[1];
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) + " " + time;
  } catch {
    return dateStr + " " + timeStr;
  }
}

function StatusBadge({ status }: { status: Req["status"] }) {
  if (status === "Pending") {
    return (
      <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600 bg-yellow-50">
        <Clock className="h-3 w-3" />
        Beklemede
      </Badge>
    );
  }
  if (status === "Rejected") {
    return (
      <Badge variant="outline" className="gap-1 border-red-500 text-red-600 bg-red-50">
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
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionMessages, setRejectionMessages] = useState<Record<string, string>>({}); // requestId -> rejection message
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Req | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateRequestData>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);
  const [conflictCheckLoading, setConflictCheckLoading] = useState<Record<string, boolean>>({});
  const [conflicts, setConflicts] = useState<Record<string, Schedule[]>>({}); // requestId -> conflicting schedules

  const loadRequests = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [reqs, h] = await Promise.all([getRequests(), getHalls()]);
      setHalls(h ?? []);
      
      // Viewer için sadece kendi taleplerini filtrele
      // Editor için sadece kendi departmanına ait talepleri göster
      const isViewer = isViewerRole(user.role);
      const isEditor = canEdit(user.role);
      let filteredReqs = reqs ?? [];
      
      if (isViewer && user.id) {
        filteredReqs = filteredReqs.filter((r) => r.createdByUserId === user.id);
      } else if (isEditor && user.department !== undefined && user.department !== null) {
        // Editor için: Sadece kendi departmanına ait talepleri göster
        // eventType: 0=Nikah, 1=Nişan, 2=Konser, 3=Toplantı, 4=Özel
        filteredReqs = filteredReqs.filter((r) => r.eventType === user.department);
      }
      
      const withHall = filteredReqs.map((r) => ({
        ...r,
        hallName: h.find((x) => x.id === r.weddingHallId)?.name ?? "Bilinmeyen Salon",
      }));
      
      setRequests(withHall);
      
      // Reddedilen talepler için mesajları yükle (Viewer için)
      if (isViewer && user.id) {
        const rejectedRequests = withHall.filter((r) => r.status === "Rejected");
        const rejectionMsgs: Record<string, string> = {};
        
        for (const req of rejectedRequests) {
          try {
            const msgs = await getMessagesByRequestId(req.id);
            // Reddedilme mesajını bul (genellikle Editor'dan gelen ve ❌ içeren mesaj)
            const rejectionMsg = msgs.find((msg) => 
              msg.senderUserId !== user.id && 
              (msg.content.includes("❌") || msg.content.includes("Reddedildi") || msg.content.toLowerCase().includes("red"))
            );
            if (rejectionMsg) {
              // Mesajı parse et: "Talebiniz . Sebep: [sebep]" formatından sebep kısmını çıkar
              let cleanMessage = rejectionMsg.content
                .replace(/❌/g, "")
                .replace(/Reddedildi/gi, "")
                .trim();
              
              // "Sebep:" veya "Sebep :" sonrasındaki metni al
              const sebepMatch = cleanMessage.match(/Sebep\s*:\s*(.+)/i);
              if (sebepMatch && sebepMatch[1]) {
                cleanMessage = sebepMatch[1].trim();
              } else {
                // "Talebiniz . Sebep:" formatını temizle
                cleanMessage = cleanMessage
                  .replace(/Talebiniz\s*\.\s*Sebep\s*:\s*/i, "")
                  .trim();
              }
              
              if (cleanMessage) {
                rejectionMsgs[req.id] = cleanMessage;
              }
            }
          } catch (e) {
            console.error(`Error loading messages for request ${req.id}:`, e);
          }
        }
        
        setRejectionMessages(rejectionMsgs);
      }
    } catch (e) {
      console.error("loadRequests error:", e);
      toast.error(toUserFriendlyMessage(e));
      setRequests([]);
      setHalls([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      loadRequests();
    }
  }, [authLoading, user?.id, loadRequests]);

  const checkConflict = useCallback(async (req: Req) => {
    if (!req || req.status !== "Pending") {
      setConflicts((prev) => ({ ...prev, [req.id]: [] }));
      return;
    }

    // Eğer zaten kontrol ediliyorsa tekrar kontrol etme
    if (conflictCheckLoading[req.id]) return;

    setConflictCheckLoading((prev) => ({ ...prev, [req.id]: true }));
    try {
      const schedules = await getSchedulesByHall(req.weddingHallId);
      const requestDate = req.eventDate.includes('T') ? req.eventDate.split('T')[0] : req.eventDate;
      const requestTime = req.eventTime.slice(0, 5); // "HH:MM" formatına getir
      
      const conflicting = (schedules ?? []).filter((s) => {
        let scheduleDate = s.date;
        if (scheduleDate.includes('T')) {
          scheduleDate = scheduleDate.split('T')[0];
        }
        const scheduleStartTime = s.startTime.slice(0, 5);
        
        return (
          scheduleDate === requestDate &&
          scheduleStartTime === requestTime &&
          s.status === "Reserved"
        );
      });
      
      setConflicts((prev) => ({ ...prev, [req.id]: conflicting }));
    } catch (e) {
      console.error("Conflict check error:", e);
      setConflicts((prev) => ({ ...prev, [req.id]: [] }));
    } finally {
      setConflictCheckLoading((prev) => ({ ...prev, [req.id]: false }));
    }
  }, []);

  // Sayfa yüklendiğinde tüm bekleyen talepler için çakışma kontrolü yap
  useEffect(() => {
    if (!loading && requests.length > 0) {
      const pendingRequests = requests.filter((r) => r.status === "Pending");
      pendingRequests.forEach((req) => {
        // Sadece daha önce kontrol edilmemişse kontrol et
        if (!conflictCheckLoading[req.id] && !conflicts[req.id]) {
          checkConflict(req);
        }
      });
    }
  }, [loading, requests, checkConflict]);

  const loadMessages = useCallback(async (requestId: string) => {
    setLoadingMessages(true);
    try {
      const msgs = await getMessagesByRequestId(requestId);
      setMessages(msgs);
    } catch (e) {
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    setNewMessage("");
    if (selected) {
      loadMessages(selected.id);
      checkConflict(selected);
    } else {
      setMessages([]);
    }
  }, [selected?.id, loadMessages, checkConflict]);

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

  const handleRejectConfirm = async () => {
    if (!rejectingRequestId) return;
    if (!rejectReason.trim()) {
      toast.error("Lütfen reddetme sebebini girin.");
      return;
    }
    
    setActionId(rejectingRequestId);
    setRejectDialogOpen(false);
    
    try {
      await rejectRequest(rejectingRequestId, rejectReason.trim());
      toast.success("Talep reddedildi.");
      await loadRequests();
      setRejectReason("");
      setRejectingRequestId(null);
    } catch (e) {
      console.error("rejectRequest error:", e);
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setActionId(null);
    }
  };

  const handleEditClick = (req: Req) => {
    setEditingRequest(req);
    setEditFormData({
      weddingHallId: req.weddingHallId,
      eventName: req.eventName,
      eventOwner: req.eventOwner,
      eventType: req.eventType,
      eventDate: req.eventDate.split('T')[0], // Sadece tarih kısmını al
      eventTime: req.eventTime,
      message: req.message,
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingRequest) return;
    
    if (!editFormData.eventName?.trim() || !editFormData.eventOwner?.trim() || !editFormData.eventDate || !editFormData.eventTime) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setActionId(editingRequest.id);
    try {
      await updateRequest(editingRequest.id, editFormData);
      toast.success("Talep başarıyla güncellendi.");
      await loadRequests();
      setEditDialogOpen(false);
      setEditingRequest(null);
      setEditFormData({});
    } catch (e) {
      console.error("updateRequest error:", e);
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteClick = (req: Req) => {
    setDeletingRequestId(req.id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRequestId) return;
    
    setActionId(deletingRequestId);
    try {
      await deleteRequest(deletingRequestId);
      toast.success("Talep başarıyla silindi.");
      await loadRequests();
      setDeleteDialogOpen(false);
      setDeletingRequestId(null);
    } catch (e) {
      console.error("deleteRequest error:", e);
      toast.error(toUserFriendlyMessage(e));
    } finally {
      setActionId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!canEdit(user?.role) && !isViewerRole(user?.role)) {
    return <Unauthorized />;
  }

  const isViewer = isViewerRole(user?.role);

  // Viewer için basit görünüm
  if (isViewer) {
    const pendingCount = requests.filter((r) => r.status === "Pending").length;
    const approvedCount = requests.filter((r) => r.status === "Answered").length;
    const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

    return (
      <div className="space-y-4 sm:space-y-6 w-full">
        <div className="w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Taleplerim</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Oluşturduğunuz talepleri ve durumlarını görüntüleyin
          </p>
        </div>

        {/* İstatistikler */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Bekleyen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                  <p className="text-xs text-muted-foreground">Onaylanan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
                  <p className="text-xs text-muted-foreground">Reddedilen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Talep Listesi */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">
                Henüz talep oluşturmadınız
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((req) => (
              <Card 
                key={req.id} 
                className="cursor-pointer border-l-4 transition-colors hover:bg-muted/50"
                style={{
                  borderLeftColor: 
                    req.status === "Answered" ? "#22c55e" :
                    req.status === "Rejected" ? "#ef4444" : "#eab308"
                }}
                onClick={() => setSelected(req)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground text-lg">
                          {req.hallName}
                        </h3>
                        <StatusBadge status={req.status} />
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatEventDate(req.eventDate, req.eventTime)}</span>
                      </div>
                      
                      {/* Reddedilme sebebi göster */}
                      {req.status === "Rejected" && rejectionMessages[req.id] && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-red-800 mb-1">Geri Bildirim:</p>
                              <p className="text-sm text-red-700">{sanitizeText(rejectionMessages[req.id])}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Viewer için düzenleme ve silme butonları - sadece Pending durumunda */}
                      {req.status === "Pending" && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(req);
                            }}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Düzenle
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(req);
                            }}
                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Sil
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Viewer için Talep Detay Dialog'u (sadece görüntüleme + mesajlar) */}
        {selected && (
          <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {selected.hallName}
                </DialogTitle>
                <DialogDescription>
                  Talep detaylarını ve gelen mesajları görüntüleyin
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Durum</Label>
                  <div className="mt-1">
                    <StatusBadge status={selected.status} />
                  </div>
                </div>

                {selected.eventName && (
                  <div>
                    <Label className="text-sm font-medium">Etkinlik Adı</Label>
                    <p className="mt-1 text-sm text-foreground">{selected.eventName}</p>
                  </div>
                )}

                {selected.eventOwner && (
                  <div>
                    <Label className="text-sm font-medium">Etkinlik Sahibi</Label>
                    <p className="mt-1 text-sm text-foreground">{selected.eventOwner}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Etkinlik Türü</Label>
                  <p className="mt-1 text-sm text-foreground">{getEventTypeLabel(selected.eventType)}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Etkinlik Tarihi ve Saati</Label>
                  <p className="mt-1 text-sm text-foreground">
                    {formatEventDate(selected.eventDate, selected.eventTime)}
                  </p>
                </div>

                {selected.message && (
                  <div>
                    <Label className="text-sm font-medium">Açıklama</Label>
                    <div className="mt-1 rounded-lg bg-muted p-3">
                      <p className="text-sm whitespace-pre-wrap">{sanitizeText(selected.message)}</p>
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <Label className="text-sm font-medium mb-2 block">Mesajlar</Label>
                  <div className="max-h-[200px] overflow-y-auto space-y-3 border rounded-lg p-4">
                    {loadingMessages ? (
                      <div className="flex justify-center py-4">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                        <p className="mt-2 text-xs text-muted-foreground">Henüz mesaj yok</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => {
                          const isCurrentUser = msg.senderUserId === user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex gap-2 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                            >
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <div className={`max-w-[75%] ${isCurrentUser ? "text-right" : ""}`}>
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
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Kapat
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Düzenleme Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            // Edit dialog açıldığında detay dialog'unu kapat
            if (open && selected) {
              setSelected(null);
            }
          }}
        >
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Talep Düzenle</DialogTitle>
              <DialogDescription>
                Talebinizi düzenleyin. Sadece bekleyen talepler düzenlenebilir.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-hall">
                  Salon <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={editFormData.weddingHallId || ""}
                  onValueChange={(value) => setEditFormData({ ...editFormData, weddingHallId: value })}
                >
                  <SelectTrigger id="edit-hall">
                    <SelectValue placeholder="Salon seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {halls.map((hall) => (
                      <SelectItem key={hall.id} value={hall.id}>
                        {hall.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-event-name">
                  Etkinlik Adı <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-event-name"
                  value={editFormData.eventName || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, eventName: e.target.value })}
                  placeholder="Örn: Ahmet ve Ayşe'nin Nikahı"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-event-owner">
                  Etkinlik Sahibi <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-event-owner"
                  value={editFormData.eventOwner || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, eventOwner: e.target.value })}
                  placeholder="Örn: Ahmet Yılmaz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-event-type">
                  Etkinlik Türü <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={editFormData.eventType?.toString() || ""}
                  onValueChange={(value) => setEditFormData({ ...editFormData, eventType: parseInt(value) })}
                >
                  <SelectTrigger id="edit-event-type">
                    <SelectValue placeholder="Etkinlik türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value.toString()}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-event-date">
                    Etkinlik Tarihi <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-event-date"
                    type="date"
                    value={editFormData.eventDate || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, eventDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-event-time">
                    Etkinlik Saati <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-event-time"
                    type="time"
                    value={editFormData.eventTime || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, eventTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-message">Açıklama</Label>
                <Textarea
                  id="edit-message"
                  value={editFormData.message || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 1000) {
                      setEditFormData({ ...editFormData, message: value });
                    }
                  }}
                  placeholder="Ek bilgiler (opsiyonel)"
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {(editFormData.message || "").length}/1000 karakter
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditingRequest(null);
                  setEditFormData({});
                }}
              >
                İptal
              </Button>
              <Button
                onClick={handleEditSave}
                disabled={actionId === editingRequest?.id || !editFormData.eventName?.trim() || !editFormData.eventOwner?.trim() || !editFormData.eventDate || !editFormData.eventTime}
              >
                {actionId === editingRequest?.id ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Silme Onay Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Talep Sil</DialogTitle>
              <DialogDescription>
                Bu talebi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingRequestId(null);
                }}
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={actionId === deletingRequestId}
              >
                {actionId === deletingRequestId ? "Siliniyor..." : "Sil"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Editor ve SuperAdmin için yönetim görünümü
  const isEditor = canEdit(user?.role);
  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Answered").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Talepler</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Personelden gelen talepleri görüntüleyin ve yönetin
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Bekleyen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                <p className="text-xs text-muted-foreground">Onaylanan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
                <p className="text-xs text-muted-foreground">Reddedilen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30" />
            <p className="mt-4 text-muted-foreground">Henüz talep yok</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => {
            const hasConflict = conflicts[req.id] && conflicts[req.id].length > 0;
            return (
            <Card 
              key={req.id} 
              className={cn(
                "cursor-pointer hover:bg-muted/50 transition-colors border-l-4",
                hasConflict && req.status === "Pending" && "border-orange-500 bg-orange-50/30 dark:bg-orange-950/10"
              )}
              style={{
                borderLeftColor: 
                  hasConflict && req.status === "Pending" ? "#f97316" :
                  req.status === "Answered" ? "#22c55e" :
                  req.status === "Rejected" ? "#ef4444" : "#eab308"
              }}
              onClick={() => setSelected(req)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground text-lg">
                        {req.hallName}
                      </h3>
                      <StatusBadge status={req.status} />
                      {hasConflict && req.status === "Pending" && (
                        <Badge variant="outline" className="gap-1 border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/30">
                          <Info className="h-3 w-3" />
                          Çakışma Var
                        </Badge>
                      )}
                    </div>
                    
                    {req.eventName && (
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{req.eventName}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{getEventTypeLabel(req.eventType)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatEventDate(req.eventDate, req.eventTime)}</span>
                    </div>
                    
                    {req.message && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {sanitizeText(req.message)}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Oluşturulma: {formatDate(req.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* Talep Detay Dialog - Editor için */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                {selected.hallName}
              </DialogTitle>
              <DialogDescription>
                Talep Detayları ve Yönetim
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Durum</Label>
                <div className="mt-1">
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {selected.eventName && (
                <div>
                  <Label className="text-sm font-medium">Etkinlik Adı</Label>
                  <p className="mt-1 text-sm text-foreground">{selected.eventName}</p>
                </div>
              )}

              {selected.eventOwner && (
                <div>
                  <Label className="text-sm font-medium">Etkinlik Sahibi</Label>
                  <p className="mt-1 text-sm text-foreground">{selected.eventOwner}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Etkinlik Türü</Label>
                <p className="mt-1 text-sm text-foreground">{getEventTypeLabel(selected.eventType)}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Etkinlik Tarihi ve Saati</Label>
                <p className="mt-1 text-sm text-foreground">
                  {formatEventDate(selected.eventDate, selected.eventTime)}
                </p>
              </div>

              {selected.message && (
                <div>
                  <Label className="text-sm font-medium">Açıklama</Label>
                  <div className="mt-1 rounded-lg bg-muted p-3">
                    <p className="text-sm whitespace-pre-wrap">{sanitizeText(selected.message)}</p>
                  </div>
                </div>
              )}

              {/* Editor için işlem butonları */}
              {isEditor && (
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 border-t border-border pt-4">
                  {/* Düzenleme butonu - tüm durumlar için - ŞİMDİLİK KAPALI */}
                  {/* <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      if (!selected) return;
                      handleEditClick(selected);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    Düzenle
                  </Button> */}

                  {/* Çakışma Uyarısı */}
                  {selected.status === "Pending" && conflicts[selected.id] && conflicts[selected.id].length > 0 && (
                    <div className="w-full rounded-lg border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-3 mb-2">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-1">
                            ⚠️ Çakışma Uyarısı
                          </p>
                          <p className="text-xs text-orange-700 dark:text-orange-400 mb-2">
                            Bu talep için seçilen tarih ve saatte zaten bir rezervasyon bulunmaktadır:
                          </p>
                          <div className="space-y-1">
                            {conflicts[selected.id].map((conflict) => (
                              <div key={conflict.id} className="text-xs bg-white dark:bg-orange-900/30 rounded px-2 py-1 border border-orange-200 dark:border-orange-800">
                                <span className="font-medium">• {conflict.eventName || "Etkinlik Adı Yok"}</span>
                                {conflict.eventOwner && (
                                  <span className="text-muted-foreground"> - {conflict.eventOwner}</span>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs font-medium text-orange-800 dark:text-orange-300 mt-2">
                            Bu talebi onaylarsanız, mevcut rezervasyonun üzerine yazılacaktır.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Onayla butonu - sadece Pending durumunda */}
                  {selected.status === "Pending" && (
                    <Button
                      className={cn(
                        "gap-2",
                        conflicts[selected.id] && conflicts[selected.id].length > 0
                          ? "bg-orange-600 text-white hover:bg-orange-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      )}
                      disabled={actionId === selected.id || conflictCheckLoading[selected.id]}
                      onClick={async () => {
                        if (!selected) return;
                        
                        // Çakışma varsa onay iste
                        if (conflicts[selected.id] && conflicts[selected.id].length > 0) {
                          const confirmed = window.confirm(
                            `Bu talep mevcut ${conflicts[selected.id].length} rezervasyonla çakışıyor. ` +
                            `Onaylamaya devam etmek istediğinizden emin misiniz? ` +
                            `Mevcut rezervasyon(lar) silinecek ve yeni rezervasyon oluşturulacaktır.`
                          );
                          if (!confirmed) return;
                        }
                        
                        setActionId(selected.id);
                        try {
                          await approveRequest(selected.id);
                          toast.success("Talep onaylandı. Müsaitlik oluşturuldu.");
                          await loadRequests();
                          setSelected(null);
                        } catch (e) {
                          console.error("approveRequest error:", e);
                          toast.error(toUserFriendlyMessage(e));
                        } finally {
                          setActionId(null);
                        }
                      }}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {actionId === selected.id 
                        ? "İşleniyor..." 
                        : conflictCheckLoading[selected.id]
                        ? "Kontrol ediliyor..."
                        : conflicts[selected.id] && conflicts[selected.id].length > 0
                        ? "Yine de Onayla"
                        : "Onayla"}
                    </Button>
                  )}

                  {/* Reddet butonu - sadece Pending durumunda */}
                  {selected.status === "Pending" && (
                    <Button
                      variant="outline"
                      className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={actionId === selected.id}
                      onClick={() => {
                        if (!selected) return;
                        setRejectingRequestId(selected.id);
                        setRejectReason("");
                        setRejectDialogOpen(true);
                      }}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Reddet
                    </Button>
                  )}
                </div>
              )}

              <div className="border-t border-border pt-4">
                <Label className="text-sm font-medium mb-2 block">Mesajlar</Label>
                <div className="max-h-[200px] overflow-y-auto space-y-3 border rounded-lg p-4">
                  {loadingMessages ? (
                    <div className="flex justify-center py-4">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                      <p className="mt-2 text-xs text-muted-foreground">Henüz mesaj yok</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => {
                        const isCurrentUser = msg.senderUserId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div className={`max-w-[75%] ${isCurrentUser ? "text-right" : ""}`}>
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
                </div>
                
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Mesaj yazın... (Maksimum 1000 karakter)"
                    value={newMessage}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 1000) {
                        setNewMessage(value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && newMessage.trim()) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-16 resize-none"
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {newMessage.length}/1000 karakter
                    </p>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage || newMessage.length > 1000}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Gönder
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reddetme Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Talep Reddet</DialogTitle>
            <DialogDescription>
              Bu talebi reddetmek için lütfen sebep belirtin. Sebep, talep sahibine gösterilecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">
                Reddetme Sebebi <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="Örn: İstenen tarihte salon müsait değil..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason("");
                setRejectingRequestId(null);
              }}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim() || actionId === rejectingRequestId}
            >
              {actionId === rejectingRequestId ? "Reddediliyor..." : "Reddet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
