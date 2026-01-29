# PostgreSQL → SQL Server: Tüm veri taşıma

Bu araç, PostgreSQL'deki **tüm uygulama verilerini** SQL Server (nikahsalon) veritabanına kopyalar. Bağımlılık sırasına göre çalışır; olmayan veya hatalı kayıtları atlar.

## Taşınan tablolar (sırayla)

1. **Centers** – Merkezler  
2. **WeddingHalls** – Salonlar (CenterId SQL Server'da yoksa satır atlanır)  
3. **HallAccesses** – Salon erişimleri (HallId ve UserId SQL Server'da yoksa atlanır)  
4. **Schedules** – Takvim kayıtları  
5. **Requests** – Talepler  
6. **Messages** – Mesajlar (RequestId ve SenderUserId yoksa atlanır)  

## Kontroller

- **Zaten var:** Aynı `Id` SQL Server'da varsa satır eklenmez (duplicate atlanır).  
- **FK eksik:** İlgili tabloda referans yoksa (örn. CenterId, UserId) satır eklenmez, özette "FK yok (atlandi)" olarak sayılır.  
- **AspNetUsers:** HallAccesses / Requests / Messages için SQL Server'da kullanıcı kaydı gerekir. AspNetUsers boşsa bu tabloların satırları FK nedeniyle atlanır; önce kullanıcıları SQL Server'a almanız veya uygulama ile oluşturmanız gerekir.

## Gereksinimler

- PostgreSQL çalışıyor; `appsettings.json` → `ConnectionStrings:DefaultConnection` (ve gerekirse `POSTGRES_PASSWORD`).  
- SQL Server (LocalDB) çalışıyor; `nikahsalon` ve gerekli tablolar mevcut (örn. `apply-add-centers-hallaccess-sqlserver.ps1` çalıştırılmış).

## Çalıştırma

Backend klasöründen:

```powershell
# Şifre gerekirse:
$env:POSTGRES_PASSWORD = "sifreniz"
dotnet run --project scripts/MigrateCentersFromPostgres
```

Çıktıda her tablo için: okunan sayı, eklenen, zaten var, FK yok (atlandi) görünür. Sonda özet: toplam eklenen, atlanan (zaten var), atlanan (FK eksik).

## Bağlantı

- **PostgreSQL:** `appsettings.json` → `DefaultConnection`. Şifre: `POSTGRES_PASSWORD` veya `POSTGRES_CONNECTION_STRING`.  
- **SQL Server:** `appsettings.Development.json` → `ConnectionStrings:SqlServer` veya `SqlServerConnection`; yoksa LocalDB kullanılır.
