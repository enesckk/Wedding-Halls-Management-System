"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";

/**
 * Unauthorized access message component.
 * Shows when a Viewer tries to access Editor-only pages.
 */
export function Unauthorized() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md border-destructive/20">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Yetkisiz Erişim
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Bu sayfaya erişmek için Editor yetkisine sahip olmanız gerekiyor.
            Lütfen yöneticinizle iletişime geçin.
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            className="gap-2"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
