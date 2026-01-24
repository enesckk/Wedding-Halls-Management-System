"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus, Send } from "lucide-react";
import { createRequest } from "@/lib/api/requests";
import { toUserFriendlyMessage } from "@/lib/utils/api-error";
import { toast } from "sonner";

interface RequestModalProps {
  hallId: string;
  hallName: string;
}

export function RequestModal({ hallId, hallName }: RequestModalProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await createRequest({ weddingHallId: hallId, message: message.trim() });
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Talep iletildi.");
      setTimeout(() => {
        setOpen(false);
        setMessage("");
        setSubmitted(false);
      }, 2000);
    } catch (e) {
      setIsSubmitting(false);
      toast.error(toUserFriendlyMessage(e));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <MessageSquarePlus className="h-4 w-4" />
          Talep Oluştur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Talep Oluştur</DialogTitle>
          <DialogDescription>
            {hallName} için talebinizi aşağıya yazın
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium text-foreground">Talebiniz iletildi!</p>
            <p className="text-sm text-muted-foreground">
              En kısa sürede size dönüş yapılacaktır.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 py-4">
              <Label htmlFor="message" className="text-foreground">
                Mesajınız
              </Label>
              <Textarea
                id="message"
                placeholder="Talebinizi buraya yazın..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-32 resize-none"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                İptal
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? "Gönderiliyor..." : "Gönder"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
