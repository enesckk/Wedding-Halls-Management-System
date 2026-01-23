"use client";

import { useState } from "react";
import { useUser } from "@/lib/user-context";
import { mockMessages } from "@/lib/data";
import type { Message } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  User,
  Shield,
  Megaphone,
  Hash,
} from "lucide-react";

function formatTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  if (hours < 24) return `${hours} saat önce`;
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesPage() {
  const { currentUser, isAdmin } = useUser();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [activeChannel, setActiveChannel] = useState<"general" | "duyurular">(
    "general"
  );

  const filteredMessages = messages
    .filter((m) => m.channel === activeChannel)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Only admins can post in announcements channel
    if (activeChannel === "duyurular" && !isAdmin) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      content: newMessage,
      timestamp: new Date(),
      channel: activeChannel,
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mesajlar</h1>
        <p className="text-muted-foreground">
          Ekip ile iletişim kurun ve duyuruları takip edin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Channels Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Kanallar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0">
            <Button
              variant={activeChannel === "general" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveChannel("general")}
            >
              <Hash className="h-4 w-4" />
              <span>Genel Sohbet</span>
              <Badge variant="outline" className="ml-auto text-[10px]">
                {messages.filter((m) => m.channel === "general").length}
              </Badge>
            </Button>
            <Button
              variant={activeChannel === "duyurular" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => setActiveChannel("duyurular")}
            >
              <Megaphone className="h-4 w-4" />
              <span>Duyurular</span>
              {!isAdmin && (
                <Badge variant="outline" className="ml-auto text-[10px]">
                  Sadece Oku
                </Badge>
              )}
            </Button>
          </CardContent>

          {/* Channel Info */}
          <div className="border-t border-border p-4">
            <p className="text-xs text-muted-foreground">
              {activeChannel === "general"
                ? "Tüm personel mesaj gönderebilir ve okuyabilir."
                : "Sadece adminler duyuru yayınlayabilir."}
            </p>
          </div>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-3">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center gap-2">
              {activeChannel === "general" ? (
                <Hash className="h-5 w-5 text-primary" />
              ) : (
                <Megaphone className="h-5 w-5 text-primary" />
              )}
              <CardTitle className="text-lg">
                {activeChannel === "general" ? "Genel Sohbet" : "Duyurular"}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="flex h-[500px] flex-col p-0">
            {/* Messages List */}
            <ScrollArea className="flex-1 p-4">
              {filteredMessages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Henüz mesaj yok
                  </p>
                  <p className="text-xs text-muted-foreground">
                    İlk mesajı siz gönderin!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.userId === currentUser.id
                          ? "flex-row-reverse"
                          : ""
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          message.userRole === "admin"
                            ? "bg-primary/10"
                            : "bg-muted"
                        }`}
                      >
                        {message.userRole === "admin" ? (
                          <Shield className="h-4 w-4 text-primary" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div
                        className={`max-w-[70%] ${
                          message.userId === currentUser.id ? "text-right" : ""
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 ${
                            message.userId === currentUser.id
                              ? "flex-row-reverse"
                              : ""
                          }`}
                        >
                          <span className="text-sm font-medium text-foreground">
                            {message.userName}
                          </span>
                          <Badge
                            variant={
                              message.userRole === "admin"
                                ? "default"
                                : "outline"
                            }
                            className="text-[10px]"
                          >
                            {message.userRole === "admin" ? "Admin" : "Personel"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <div
                          className={`mt-1 rounded-lg p-3 ${
                            message.userId === currentUser.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              {activeChannel === "duyurular" && !isAdmin ? (
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    Sadece adminler duyuru yayınlayabilir
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder={
                      activeChannel === "general"
                        ? "Mesajınızı yazın..."
                        : "Duyurunuzu yazın..."
                    }
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Gönder
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
