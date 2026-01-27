# PostgreSQL Kurulum Hatası - Database Cluster Initialisation Failed

## 🔴 Hata Mesajı

```
Problem running post-install step. Installation may not complete correctly
The database cluster initialisation failed.
```

Bu hata, PostgreSQL kurulumu sırasında veritabanı kümesinin (database cluster) başlatılamadığını gösterir.

## ✅ Çözüm Adımları

### 1. Kurulumu Tamamlayın (Eğer Devam Ediyorsa)

1. Uyarı penceresinde **OK** butonuna tıklayın
2. Kurulumun tamamlanmasını bekleyin
3. Kurulum tamamlandıktan sonra PostgreSQL'i **kaldırın** ve **yeniden kurun**

### 2. PostgreSQL'i Tamamen Kaldırın

**Yöntem 1: Windows Ayarlar ile**
1. `Win + I` tuşlarına basın (Ayarlar)
2. "Uygulamalar" → "Uygulamalar ve özellikler" bölümüne gidin
3. "PostgreSQL" araması yapın
4. Tüm PostgreSQL bileşenlerini kaldırın:
   - PostgreSQL XX Server
   - PostgreSQL XX Command Line Tools
   - PostgreSQL XX Documentation
   - Stack Builder

**Yöntem 2: Control Panel ile**
1. Control Panel → Programs and Features
2. PostgreSQL ile ilgili tüm programları kaldırın

**Yöntem 3: Manuel Temizlik (Önemli!)**
1. Kalan klasörleri silin:
   ```
   C:\Program Files\PostgreSQL
   C:\Program Files (x86)\PostgreSQL
   C:\Users\[KullanıcıAdı]\AppData\Local\PostgreSQL
   ```

2. Registry temizliği (Dikkatli olun!):
   - `Win + R` → `regedit`
   - `HKEY_LOCAL_MACHINE\SOFTWARE\PostgreSQL` anahtarını silin
   - `HKEY_CURRENT_USER\SOFTWARE\PostgreSQL` anahtarını silin

3. Servis kayıtlarını temizleyin:
   ```powershell
   # PowerShell'i Yönetici olarak açın
   sc.exe delete postgresql-x64-XX  # XX yerine versiyon numaranız
   ```

### 3. Yeniden Kurulum

1. **Yönetici Olarak Çalıştırın:**
   - PostgreSQL installer'ına sağ tıklayın
   - "Run as administrator" seçeneğini seçin

2. **Kurulum Ayarları:**
   - **Installation Directory:** Varsayılanı kullanın (`C:\Program Files\PostgreSQL\XX`)
   - **Data Directory:** Varsayılanı kullanın (`C:\Program Files\PostgreSQL\XX\data`)
   - **Port:** `5432` (varsayılan)
   - **Locale:** `Turkish, Turkey` veya `English, United States`
   - **Superuser Password:** Güçlü bir şifre belirleyin (unutmayın!)

3. **Önemli Kontroller:**
   - Antivirus yazılımını geçici olarak kapatın
   - Windows Defender'ı geçici olarak kapatın
   - Firewall'u kontrol edin (port 5432'yi engellememeli)

### 4. Alternatif: Manuel Database Cluster Oluşturma

Eğer kurulum tamamlandı ama cluster oluşturulamadıysa:

```powershell
# PowerShell'i Yönetici olarak açın
cd "C:\Program Files\PostgreSQL\15\bin"

# Database cluster'ı manuel oluşturun
.\initdb.exe -U postgres -A password -E UTF8 -D "C:\Program Files\PostgreSQL\15\data" -W
```

### 5. Servis Kontrolü

Kurulum sonrası:

```powershell
# Servis durumunu kontrol edin
Get-Service | Where-Object { $_.DisplayName -like "*postgres*" }

# Servisi başlatın (eğer durmuşsa)
Start-Service -Name "postgresql-x64-15"  # Versiyon numaranızı kullanın
```

### 6. Bağlantı Testi

```powershell
cd "C:\Program Files\PostgreSQL\15\bin"
.\psql.exe -U postgres
```

Bağlantı başarılıysa, kurulum tamamlanmıştır.

## 🚨 Yaygın Nedenler

1. **İzin Sorunları:**
   - PostgreSQL klasörüne yazma izni yok
   - Çözüm: Yönetici olarak kurun

2. **Port Kullanımda:**
   - Port 5432 başka bir program tarafından kullanılıyor
   - Çözüm: Port'u kontrol edin: `netstat -ano | findstr :5432`

3. **Antivirus/Firewall:**
   - Güvenlik yazılımı kurulumu engelliyor
   - Çözüm: Geçici olarak kapatın

4. **Eski Kurulum Kalıntıları:**
   - Önceki kurulum tamamen temizlenmemiş
   - Çözüm: Yukarıdaki temizlik adımlarını uygulayın

5. **Disk Alanı:**
   - Yeterli disk alanı yok
   - Çözüm: En az 1 GB boş alan olduğundan emin olun

6. **Windows Kullanıcı Adı:**
   - Kullanıcı adında Türkçe karakter veya özel karakter var
   - Çözüm: İngilizce karakterli kullanıcı adı kullanın

## 🔧 Hızlı Çözüm Scripti

PowerShell'i **Yönetici olarak** açın ve çalıştırın:

```powershell
# Eski PostgreSQL servislerini durdur ve sil
$services = Get-Service | Where-Object { $_.DisplayName -like "*postgres*" }
foreach ($service in $services) {
    if ($service.Status -eq 'Running') {
        Stop-Service -Name $service.Name -Force
    }
    sc.exe delete $service.Name
}

# Klasörleri temizle (dikkatli!)
$paths = @(
    "C:\Program Files\PostgreSQL",
    "C:\Program Files (x86)\PostgreSQL",
    "$env:LOCALAPPDATA\PostgreSQL"
)

foreach ($path in $paths) {
    if (Test-Path $path) {
        Write-Host "Siliniyor: $path" -ForegroundColor Yellow
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Temizlik tamamlandi. PostgreSQL'i yeniden kurun." -ForegroundColor Green
```

## 📋 Kontrol Listesi

Kurulum öncesi:
- [ ] Eski PostgreSQL kurulumları kaldırıldı
- [ ] Klasörler temizlendi
- [ ] Registry temizlendi
- [ ] Servis kayıtları silindi
- [ ] Antivirus geçici olarak kapatıldı
- [ ] Yeterli disk alanı var
- [ ] Yönetici hakları var

Kurulum sırası:
- [ ] Installer yönetici olarak çalıştırıldı
- [ ] Port 5432 boş
- [ ] Şifre güçlü ve hatırlanabilir
- [ ] Locale doğru seçildi

Kurulum sonrası:
- [ ] Servis çalışıyor
- [ ] psql ile bağlantı başarılı
- [ ] Port 5432 dinleniyor

## 🆘 Hala Çalışmıyorsa

1. **Log Dosyalarını Kontrol Edin:**
   ```
   C:\Program Files\PostgreSQL\15\data\log\
   ```
   veya
   ```
   C:\Users\[KullanıcıAdı]\AppData\Local\Temp\
   ```

2. **Alternatif: Docker Kullanın:**
   ```powershell
   docker run --name postgres -e POSTGRES_PASSWORD=your_password -e POSTGRES_USER=postgres -e POSTGRES_DB=nikahsalon -p 5432:5432 -d postgres:15
   ```

3. **PostgreSQL Portable Sürümü:**
   - Portable PostgreSQL sürümlerini deneyin
   - Veya farklı bir veritabanı (SQL Server, MySQL) kullanın

---

**Önemli:** Bu hata genellikle izin sorunlarından kaynaklanır. Mutlaka **Yönetici olarak** kurun!
