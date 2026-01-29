# SQL Server'a Geçiş – Sırayla Adımlar

Bu dosya, projeyi **PostgreSQL yerine SQL Server** (veya LocalDB) ile çalıştırmak için uygulamanız gereken adımları listeler.

---

## Ön koşul

- **SQL Server** veya **LocalDB** yüklü olsun.  
  (Visual Studio ile genelde LocalDB gelir: `(localdb)\mssqllocaldb`)

---

## Adım 1: Yapılandırma (✅ Yapıldı)

`src/NikahSalon.API/appsettings.Development.json` içinde:

- `"DatabaseProvider": "SqlServer"`
- `"ConnectionStrings": { "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=nikahsalon;Trusted_Connection=True;TrustServerCertificate=true;" }`

Farklı bir SQL Server kullanıyorsanız connection string’i buna göre değiştirin (ör. `Server=localhost;Database=nikahsalon;User Id=sa;Password=...;TrustServerCertificate=true;`).

---

## Adım 2: Projeyi derleme

Backend klasöründe:

```powershell
cd C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System-Backend
dotnet restore src/NikahSalon.API/NikahSalon.API.csproj
dotnet build src/NikahSalon.API/NikahSalon.API.csproj
```

Build hatasız bitmeli.

---

## Adım 3: SQL Server’da veritabanını oluşturma

**Seçenek A – PowerShell script (sqlcmd gerekmez, önerilen):**

Backend klasöründeyken:

```powershell
.\scripts\create-database-sqlserver.ps1
```

Bu script LocalDB’ye bağlanıp `nikahsalon` veritabanını oluşturur (yoksa). Farklı sunucu için:  
`$env:SqlServerConnection = "Server=localhost;Database=master;User Id=sa;Password=...;TrustServerCertificate=true;"` sonra aynı komutu çalıştırın.

**Seçenek B – sqlcmd (yüklüyse):**

```powershell
sqlcmd -S "(localdb)\mssqllocaldb" -Q "IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'nikahsalon') CREATE DATABASE [nikahsalon];"
```

**Seçenek C – Script dosyası:**  
`scripts/create-database-sqlserver.sql` dosyasını SSMS veya Azure Data Studio’da çalıştırın.

**Seçenek D – Manuel:**  
SSMS veya Azure Data Studio’da `nikahsalon` adında yeni veritabanı oluşturun.

---

## Adım 4: Migration’ları SQL Server’a uygulama

Backend klasöründe, geliştirme ortamı ayarlarıyla (appsettings.Development.json’daki SQL Server ayarları kullanılır):

```powershell
$env:DatabaseProvider = "SqlServer"
dotnet ef database update --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API
```

İsterseniz tek komutla script’i çalıştırabilirsiniz:

```powershell
.\scripts\run-migrations-sqlserver.ps1
```

(Bu script restore + build + `database update` yapar.)

---

## Adım 5: API’yi çalıştırma

```powershell
dotnet run --project src/NikahSalon.API
```

Geliştirme ortamında çalıştığı için `appsettings.Development.json` okunur ve SQL Server kullanılır.

---

## Tekrar PostgreSQL kullanmak isterseniz

- `appsettings.Development.json` içinde:
  - `"DatabaseProvider": "Postgres"`
  - `"ConnectionStrings": { "DefaultConnection": "Host=localhost;Port=5432;Database=nikahsalon;Username=...;Password=..." }`
- API’yi yeniden başlatın.

---

## Özet sıra

1. ✅ Yapılandırma (appsettings.Development.json – zaten yapıldı)  
2. `dotnet restore` + `dotnet build`  
3. SQL Server’da `nikahsalon` veritabanını oluştur  
4. `DatabaseProvider=SqlServer` ile `dotnet ef database update`  
5. `dotnet run --project src/NikahSalon.API`
