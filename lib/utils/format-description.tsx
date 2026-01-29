"use client";

import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types";

/**
 * Açıklamayı düzenler: tekrar eden kapasite bilgisini temizler,
 * teknik özellikleri düzenler ve GUID'leri kullanıcı isimlerine çevirir.
 * Salon ve merkez detay sayfalarında kullanılır.
 */
export function formatDescription(description: string, users: User[]): JSX.Element | null {
  if (!description) return null;

  // Teknik Özellikler bölümünü bul ve çıkar
  // "Teknik Özellikler:" ifadesinden sonraki metni yakala, "Erişim İzni Olan Editörler:" ifadesine kadar
  const techFeaturesMatch = description.match(/Teknik Özellikler:\s*(.+?)(?=\s*Erişim İzni Olan Editörler:|$)/is);
  const techFeatures = techFeaturesMatch
    ? techFeaturesMatch[1].split(",").map((f) => f.trim()).filter((f) => f)
    : [];

  // Erişim İzni Olan Editörler bölümünü bul ve çıkar
  const editorsMatch = description.match(/Erişim İzni Olan Editörler:\s*\[([^\]]+)\]/i);
  const editorIds = editorsMatch
    ? editorsMatch[1].split(",").map((id) => id.trim()).filter((id) => id)
    : [];

  // GUID'leri kullanıcı isimlerine çevir
  const editorNames = editorIds
    .map((id) => {
      const user = users.find((u) => u.id === id);
      return user ? user.name : null;
    })
    .filter((name): name is string => name !== null);

  // Açıklamadan teknik özellikler ve editörler bölümlerini temizle
  let cleaned = description
    .replace(/Toplam Kapasite:\s*\d+\s*kişi\s*/gi, "")
    .replace(/Teknik Özellikler:\s*.+?(?=\s*Erişim İzni Olan Editörler:|$)/is, "")
    .replace(/Erişim İzni Olan Editörler:\s*\[[^\]]+\]/i, "")
    .trim();

  const hasContent = cleaned || techFeatures.length > 0 || editorNames.length > 0;
  if (!hasContent) return null;

  return (
    <div className="space-y-3">
      {cleaned && (
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {cleaned}
        </p>
      )}
      {techFeatures.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Teknik Özellikler</p>
          <div className="flex flex-wrap gap-2">
            {techFeatures.map((feature, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {editorNames.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Erişim İzni Olan Editörler</p>
          <div className="flex flex-wrap gap-2">
            {editorNames.map((name, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
