# SQL Server – Temizlik (sıfırdan başlamak için)

Migration hataları veya yarım kalmış durumdan kurtulmak için bu adımları **sırayla** uygulayın.

---

## 1. API’yi durdurun

Çalışıyorsa API’yi (ve veritabanına bağlanan başka uygulamaları) kapatın. Açık bağlantı varsa veritabanı silinmeyebilir.

---

## 2. Veritabanını silin

Backend klasörüne gidin, sonra:

```powershell
cd C:\Users\Dell\Documents\PROJECT\Wedding-Halls-Management-System-Backend
.\scripts\clean-database-sqlserver.ps1
```

- **LocalDB** kullanıyorsanız başka ayar gerekmez.
- Farklı SQL Server kullanıyorsanız önce:
  ```powershell
  $env:SqlServerConnection = "Server=localhost;Database=master;User Id=sa;Password=SIFRENIZ;TrustServerCertificate=true;"
  ```
  sonra aynı script’i çalıştırın.

Çıktı: `Veritabani silindi.` veya `Veritabani 'nikahsalon' zaten yok.`

---

## 3. Veritabanını yeniden oluşturun

```powershell
.\scripts\create-database-sqlserver.ps1
```

Çıktı: `Veritabani 'nikahsalon' hazir ...`

---

## 4. Migration’ları uygulayın

```powershell
$env:DatabaseProvider = "SqlServer"
dotnet ef database update --project src/NikahSalon.Infrastructure --startup-project src/NikahSalon.API
```

Sırayla uygulanacak migration’lar: InitialCreate → AddDepartmentToUsersAndSchedules → AddEventNameAndOwnerToSchedules → AddPhoneToApplicationUser → AddCentersAndHallAccess.

---

## 5. API’yi çalıştırın

```powershell
dotnet run --project src/NikahSalon.API
```

Temizlik bu adımlarla tamamlanır.

---

## Bağlantı hatası: "server was not found or was not accessible"

Bu hata genelde **LocalDB yüklü değil** veya **çalışmıyor** demektir. Şunları deneyin:

### A) LocalDB’yi başlatın

PowerShell’de (yönetici olması gerekmez):

```powershell
sqllocaldb start mssqllocaldb
```

Sonra tekrar `.\scripts\clean-database-sqlserver.ps1` çalıştırın.

### B) LocalDB yüklü mü kontrol edin

```powershell
sqllocaldb info
```

Komut tanınmıyorsa LocalDB yoktur. Şunlardan biriyle kurabilirsiniz:

- **Visual Studio** (Installer’da “SQL Server Express LocalDB” seçili olsun)
- **SQL Server Express** indirip kurun: https://www.microsoft.com/tr-tr/sql-server/sql-server-downloads

### C) Tam SQL Server kullanıyorsanız

Sunucu adı `localhost` veya `.\SQLEXPRESS` gibi bir instance ise, temizlik ve oluşturma script’lerinden önce connection string’i verin:

```powershell
$env:SqlServerConnection = "Server=localhost;Database=master;User Id=sa;Password=SIFRENIZ;TrustServerCertificate=true;"
.\scripts\clean-database-sqlserver.ps1
.\scripts\create-database-sqlserver.ps1
```

### D) Pipe adı ile bağlanmak (LocalDB başladığı halde hata alıyorsanız)

Bazı ortamlarda `(localdb)\mssqllocaldb` yerine **pipe adı** gerekir. Önce pipe adını alın:

```powershell
sqllocaldb info mssqllocaldb
```

Çıktıda **"Instance pipe name:"** satırındaki değeri kopyalayın (ör. `np:\\.\pipe\LOCALDB#...\tsql\query`). Sonra:

```powershell
$env:SqlServerConnection = "Server=np:\\.\pipe\LOCALDB#BURAYA_PIPE_ADI\\tsql\query;Database=master;Trusted_Connection=True;TrustServerCertificate=true;"
.\scripts\clean-database-sqlserver.ps1
.\scripts\create-database-sqlserver.ps1
```

Pipe adını **tam** kopyalayın (tek ters slash `\` kullanıyorsanız PowerShell’de çift yazın: `\\`).

### E) Veritabanını elle silmek

SSMS veya **Azure Data Studio** ile LocalDB/SQL Server’a bağlanıp `nikahsalon` veritabanına sağ tıklayıp **Delete** ile silebilirsiniz. Sonra Adım 3 (veritabanı oluştur) ve 4 (migration) ile devam edin.
