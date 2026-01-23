"use client";

import { useState } from "react";
import { useUser } from "@/lib/user-context";
import { mockRequests, weddingHalls } from "@/lib/data";
import type { Request, RequestResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Building2,
  Calendar,
  User,
  Shield,
} from "lucide-react";

function formatDate(date: Date) {
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: Request["status"]) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
          <Clock className="h-3 w-3" />
          Beklemede
        </Badge>
      );
    case "approved":
      return (
        <Badge className="gap-1 bg-green-500 text-white">
          <CheckCircle2 className="h-3 w-3" />
          Onaylandı
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Reddedildi
        </Badge>
      );
  }
}

export default function RequestsPage() {
  const { currentUser, isAdmin } = useUser();
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [newResponse, setNewResponse] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    hallId: "",
    date: "",
    timeSlot: "",
    message: "",
  });

  // Filter requests based on role
  const filteredRequests = isAdmin
    ? requests // Admin sees all requests
    : requests.filter((r) => r.userId === currentUser.id); // Staff sees only their requests

  const pendingCount = filteredRequests.filter((r) => r.status === "pending").length;

  const handleCreateRequest = () => {
    if (!newRequest.hallId || !newRequest.date || !newRequest.timeSlot || !newRequest.message) {
      return;
    }

    const hall = weddingHalls.find((h) => h.id === newRequest.hallId);
    if (!hall) return;

    const request: Request = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      hallId: newRequest.hallId,
      hallName: hall.name,
      date: newRequest.date,
      timeSlot: newRequest.timeSlot,
      status: "pending",
      message: newRequest.message,
      responses: [],
      createdAt: new Date(),
    };

    setRequests([request, ...requests]);
    setNewRequest({ hallId: "", date: "", timeSlot: "", message: "" });
    setIsCreateOpen(false);
  };

  const handleSendResponse = () => {
    if (!selectedRequest || !newResponse.trim()) return;

    const response: RequestResponse = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      content: newResponse,
      timestamp: new Date(),
    };

    const updatedRequests = requests.map((r) =>
      r.id === selectedRequest.id
        ? { ...r, responses: [...r.responses, response] }
        : r
    );

    setRequests(updatedRequests);
    setSelectedRequest({
      ...selectedRequest,
      responses: [...selectedRequest.responses, response],
    });
    setNewResponse("");
  };

  const handleStatusChange = (requestId: string, status: Request["status"]) => {
    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, status } : r
    );
    setRequests(updatedRequests);
    if (selectedRequest?.id === requestId) {
      setSelectedRequest({ ...selectedRequest, status });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Talepler</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Personelden gelen talepleri yönetin"
              : "Rezervasyon taleplerinizi takip edin"}
          </p>
        </div>
        {!isAdmin && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Yeni Talep
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Talep Oluştur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Salon</Label>
                  <Select
                    value={newRequest.hallId}
                    onValueChange={(value) =>
                      setNewRequest({ ...newRequest, hallId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Salon seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {weddingHalls.map((hall) => (
                        <SelectItem key={hall.id} value={hall.id}>
                          {hall.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tarih</Label>
                  <Input
                    type="date"
                    value={newRequest.date}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Saat Aralığı</Label>
                  <Select
                    value={newRequest.timeSlot}
                    onValueChange={(value) =>
                      setNewRequest({ ...newRequest, timeSlot: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Saat seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00 - 10:00">09:00 - 10:00</SelectItem>
                      <SelectItem value="10:30 - 11:30">10:30 - 11:30</SelectItem>
                      <SelectItem value="12:00 - 13:00">12:00 - 13:00</SelectItem>
                      <SelectItem value="14:00 - 15:00">14:00 - 15:00</SelectItem>
                      <SelectItem value="15:30 - 16:30">15:30 - 16:30</SelectItem>
                      <SelectItem value="17:00 - 18:00">17:00 - 18:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mesajınız</Label>
                  <Textarea
                    placeholder="Talebinizi açıklayın..."
                    value={newRequest.message}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, message: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreateRequest} className="w-full">
                  Talep Gönder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {filteredRequests.length}
              </p>
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
              <p className="text-2xl font-bold text-foreground">
                {filteredRequests.filter((r) => r.status === "approved").length}
              </p>
              <p className="text-sm text-muted-foreground">Onaylanan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Requests List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              {isAdmin ? "Tüm Talepler" : "Taleplerim"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Henüz talep yok
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredRequests.map((request) => (
                    <button
                      type="button"
                      key={request.id}
                      className={`w-full p-4 text-left transition-colors hover:bg-muted/50 ${
                        selectedRequest?.id === request.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">
                            {request.hallName}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{request.date}</span>
                            <span>-</span>
                            <span>{request.timeSlot}</span>
                          </div>
                          {isAdmin && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>{request.userName}</span>
                            </div>
                          )}
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {request.message}
                      </p>
                      {request.responses.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                          <MessageSquare className="h-3 w-3" />
                          <span>{request.responses.length} yanıt</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Request Detail */}
        <Card className="lg:col-span-3">
          {selectedRequest ? (
            <>
              <CardHeader className="border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {selectedRequest.hallName}
                    </CardTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{selectedRequest.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{selectedRequest.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{selectedRequest.userName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedRequest.status)}
                    {isAdmin && selectedRequest.status === "pending" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 bg-transparent"
                          onClick={() =>
                            handleStatusChange(selectedRequest.id, "approved")
                          }
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                          onClick={() =>
                            handleStatusChange(selectedRequest.id, "rejected")
                          }
                        >
                          <XCircle className="h-3 w-3" />
                          Reddet
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex h-[420px] flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {/* Original Message */}
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {selectedRequest.userName}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            Personel
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(selectedRequest.createdAt)}
                          </span>
                        </div>
                        <div className="mt-1 rounded-lg bg-muted p-3">
                          <p className="text-sm">{selectedRequest.message}</p>
                        </div>
                      </div>
                    </div>

                    {/* Responses */}
                    {selectedRequest.responses.map((response) => (
                      <div
                        key={response.id}
                        className={`flex gap-3 ${
                          response.userId === currentUser.id
                            ? "flex-row-reverse"
                            : ""
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            response.userRole === "admin"
                              ? "bg-primary/10"
                              : "bg-muted"
                          }`}
                        >
                          {response.userRole === "admin" ? (
                            <Shield className="h-4 w-4 text-primary" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div
                          className={`max-w-[80%] ${
                            response.userId === currentUser.id ? "text-right" : ""
                          }`}
                        >
                          <div
                            className={`flex items-center gap-2 ${
                              response.userId === currentUser.id
                                ? "flex-row-reverse"
                                : ""
                            }`}
                          >
                            <span className="text-sm font-medium text-foreground">
                              {response.userName}
                            </span>
                            <Badge
                              variant={
                                response.userRole === "admin"
                                  ? "default"
                                  : "outline"
                              }
                              className="text-[10px]"
                            >
                              {response.userRole === "admin"
                                ? "Admin"
                                : "Personel"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(response.timestamp)}
                            </span>
                          </div>
                          <div
                            className={`mt-1 rounded-lg p-3 ${
                              response.userId === currentUser.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{response.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Response Input */}
                <div className="border-t border-border p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Yanıtınızı yazın..."
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendResponse();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendResponse}
                      disabled={!newResponse.trim()}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Gönder
                    </Button>
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
