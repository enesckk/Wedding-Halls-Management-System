# Git Branch Pull Komutları

## İki Branch'i Pull Etmek İçin Komutlar

### Yöntem 1: Her Branch İçin Ayrı Pull (Önerilen)

```bash
# 1. main branch'ine geç ve pull yap
git checkout main
git pull origin main

# 2. backend branch'ine geç ve pull yap
git checkout -b backend origin/backend  # Eğer local backend branch yoksa
# veya
git checkout backend                    # Eğer local backend branch varsa
git pull origin backend
```

### Yöntem 2: Fetch + Merge (Daha Güvenli)

```bash
# Tüm branch'leri fetch et (merge yapmaz, sadece indirir)
git fetch --all

# main branch'ini güncelle
git checkout main
git merge origin/main

# backend branch'ini oluştur/güncelle
git checkout -b backend origin/backend
# veya eğer varsa:
git checkout backend
git merge origin/backend
```

### Yöntem 3: Tek Komutla Her İki Branch'i Güncelleme

```bash
# Önce tüm branch'leri fetch et
git fetch --all

# Sonra her branch'i ayrı ayrı güncelle
git checkout main && git pull origin main
git checkout -b backend origin/backend  # veya git checkout backend && git pull origin backend
```

## Önemli Notlar

1. **Değişiklikleriniz varsa önce commit veya stash yapın:**
   ```bash
   # Değişiklikleri commit et (ÖNERİLEN)
   git add .
   git commit -m "Yapılan değişiklikler"
   git pull origin backend  # Artık pull yapabilirsiniz
   
   # VEYA geçici olarak sakla
   git stash
   git pull origin backend
   git stash pop  # Değişiklikleri geri getir
   
   # VEYA değişiklikleri iptal et (DİKKAT: Değişiklikler kaybolur!)
   git restore .  # Tüm değişiklikleri geri al
   git pull origin backend
   ```

2. **"Your local changes would be overwritten by merge" Hatası:**
   Bu hata, local değişiklikleriniz varken pull yapmaya çalıştığınızda oluşur.
   ```bash
   # Çözüm 1: Commit yap
   git add .
   git commit -m "Local değişiklikler"
   git pull origin backend
   
   # Çözüm 2: Stash yap
   git stash
   git pull origin backend
   git stash pop
   
   # Çözüm 3: Değişiklikleri iptal et (DİKKAT!)
   git restore <dosya_adı>  # Belirli dosyayı geri al
   # veya
   git restore .  # Tüm değişiklikleri geri al
   git pull origin backend
   ```

3. **"fatal: a branch named 'backend' already exists" Hatası:**
   Bu hata, backend branch'i zaten varsa oluşur. `-b` flag'i kullanmayın:
   ```bash
   # YANLIŞ (branch zaten varsa):
   git checkout -b backend origin/backend
   
   # DOĞRU:
   git checkout backend  # Sadece branch'e geç
   git pull origin backend  # Pull yap
   ```

2. **Hangi branch'te olduğunuzu kontrol edin:**
   ```bash
   git branch  # Local branch'leri gösterir
   git branch -a  # Tüm branch'leri gösterir (remote dahil)
   ```

3. **Remote branch'leri görmek için:**
   ```bash
   git branch -r  # Sadece remote branch'leri gösterir
   ```

4. **Branch oluşturma:**
   ```bash
   # Remote'dan yeni local branch oluştur
   git checkout -b backend origin/backend
   
   # Veya daha kısa:
   git checkout backend  # Git otomatik olarak origin/backend'i takip eder
   ```

## Pratik Örnek Senaryo

```bash
# 1. Mevcut durumu kontrol et
git status
git branch -a

# 2. Değişiklikler varsa stash yap
git stash

# 3. Tüm branch'leri fetch et
git fetch --all

# 4. main branch'ini güncelle
git checkout main
git pull origin main

# 5. backend branch'ini oluştur/güncelle
git checkout -b backend origin/backend

# 6. Eğer stash yaptıysan, geri getir
git checkout main  # main'e geri dön
git stash pop      # Değişiklikleri geri getir
```

## Hızlı Referans

| Komut | Açıklama |
|-------|----------|
| `git fetch --all` | Tüm remote branch'leri indirir (merge etmez) |
| `git pull origin main` | main branch'ini çeker ve merge eder |
| `git pull origin backend` | backend branch'ini çeker ve merge eder |
| `git checkout -b backend origin/backend` | Remote backend'den local branch oluşturur |
| `git branch -a` | Tüm branch'leri listeler |
| `git status` | Mevcut durumu gösterir |
