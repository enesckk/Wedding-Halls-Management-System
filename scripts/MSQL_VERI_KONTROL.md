# MS SQL ile çalışırken merkez/salon gelmiyorsa

Backend MS SQL (LocalDB) ile çalışıyor ama ekranda **merkezler** ve **kayıtlı salonlar** görünmüyorsa aşağıdakileri kontrol edin.

## 1. Veritabanında veri var mı?

Backend klasöründen:

```powershell
.\scripts\query-sqlserver.ps1 "SELECT COUNT(*) AS MerkezSayisi FROM Centers"
.\scripts\query-sqlserver.ps1 "SELECT COUNT(*) AS SalonSayisi FROM WeddingHalls"
```

- **0 görüyorsanız:** Veri taşıma aracını çalıştırın (PostgreSQL’de veri olmalı):

  ```powershell
  $env:POSTGRES_PASSWORD = "postgres_sifreniz"
  dotnet run --project scripts/MigrateCentersFromPostgres
  ```

- **Sayı 0’dan büyükse:** Veri SQL Server’da; backend’in bağlandığı veritabanı veya yetkilendirme tarafına bakın (2. ve 3. adımlar).

## 2. Backend gerçekten MS SQL’e mi bağlı?

Backend’i **Development** ortamıyla başlatın (böylece `appsettings.Development.json` ve MS SQL connection kullanılır):

```powershell
.\scripts\run-backend-sqlserver.ps1
```

veya:

```powershell
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet run --project src/NikahSalon.API
```

`appsettings.Development.json` içinde:

- `DatabaseProvider`: **SqlServer**
- `ConnectionStrings:DefaultConnection`: **Server=(localdb)\mssqllocaldb;Database=nikahsalon;...**

olmalı.

## 3. Giriş yapılmış kullanıcı MS SQL’de var mı?

`/api/v1/centers` ve `/api/v1/halls` **[Authorize]** ile korunuyor; isteklerde JWT gönderilmesi gerekir.

- Giriş yaptığınız kullanıcı **SQL Server**’daki `AspNetUsers` tablosunda olmalı.
- Daha önce sadece PostgreSQL kullandıysanız, kullanıcılar Postgres’te; MS SQL’de kullanıcı yoksa giriş başarısız olur veya token geçersiz sayılır.
- **Çözüm:** MS SQL ile çalışırken ya bu veritabanında yeni bir kullanıcı kaydedin (register/seed) ya da kullanıcıları Postgres’ten SQL Server’a taşıyacak bir araç kullanın.

## 4. Tarayıcıda API cevabını kontrol etme

1. F12 → **Network** sekmesi.
2. Salonlar sayfasını yenileyin.
3. **api/v1/centers** ve **api/v1/halls** isteklerine tıklayın:
   - **200** ve body’de dizi/veri varsa: Backend veriyi dönüyor; sorun frontend tarafında olabilir.
   - **401**: Token yok/geçersiz veya kullanıcı MS SQL’de yok; tekrar giriş yapın veya kullanıcıyı SQL Server’da oluşturun.
   - **200** ama body boş/`[]`: Backend bağlandığı veritabanında merkez/salon bulamıyor; 1. adımdaki veri kontrolünü ve 2. adımdaki connection ayarını tekrar yapın.

## Özet

| Belirti | Olası neden | Yapılacak |
|--------|-------------|-----------|
| Centers/WeddingHalls sayısı 0 | Veri taşınmamış | `MigrateCentersFromPostgres` çalıştır |
| Backend farklı ortam/connection | Postgres’e bağlanıyor | `ASPNETCORE_ENVIRONMENT=Development` ve `run-backend-sqlserver.ps1` kullan |
| 401 Unauthorized | Kullanıcı SQL Server’da yok / token yok | MS SQL’de kullanıcı oluştur, tekrar giriş yap |
