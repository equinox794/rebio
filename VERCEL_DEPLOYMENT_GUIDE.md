# Vercel Deployment Rehberi

## 📦 Hazırlık Tamamlandı

Aşağıdaki dosyalar oluşturuldu:
- ✅ `package.json` - Proje ayarları
- ✅ `api/retell-webhook.js` - Webhook fonksiyonu
- ✅ `vercel.json` - Vercel konfigürasyonu
- ✅ `.gitignore` - Git ignore dosyası

---

## 🚀 Deployment Adımları

### 1. Vercel Hesabı Aç

Tarayıcıda: https://vercel.com

- **Sign Up** → **Continue with GitHub** (önerilen)
- veya Email ile kayıt ol

### 2. Vercel CLI Kur

Terminal'de (PowerShell):

```powershell
npm install -g vercel
```

### 3. Vercel'e Giriş Yap

```powershell
vercel login
```

Tarayıcıda onay ekranı açılacak → **Confirm** bas

### 4. Projeyi Deploy Et

**İlk deployment:**

```powershell
cd C:\cursor\n8n_2
vercel
```

Sorular:
- `Set up and deploy "C:\cursor\n8n_2"?` → **Y** (Yes)
- `Which scope?` → **Kendi hesabını seç**
- `Link to existing project?` → **N** (No)
- `What's your project's name?` → **retell-telegram-webhook** (veya istediğin isim)
- `In which directory is your code located?` → **./** (Enter)
- `Want to override the settings?` → **N** (No)

### 5. Production'a Deploy Et

```powershell
vercel --prod
```

**Çıktı örneği:**
```
✅  Production: https://retell-telegram-webhook.vercel.app [copied to clipboard]
```

---

## 🔗 Webhook URL'ini Kopyala

Deployment tamamlandığında verilen URL:

```
https://retell-telegram-webhook.vercel.app/api/retell-webhook
```

Bu URL'i **Retell dashboard**'a ekleyeceksin.

---

## 🔧 Retell'de Webhook Ayarı

1. Retell dashboard'a gir: https://dashboard.retellai.com
2. **Settings** → **Webhooks**
3. **Add Webhook** butonuna tıkla
4. URL'i yapıştır:
   ```
   https://retell-telegram-webhook.vercel.app/api/retell-webhook
   ```
5. **Save** bas

---

## ✅ Test Et

### Test 1: Manuel Test (PowerShell)

```powershell
$body = @'
{
  "event": "call_analyzed",
  "call": {
    "duration_ms": 45000,
    "call_analysis": {
      "call_summary": "Test araması - Vercel'den gönderildi",
      "call_successful": true,
      "user_sentiment": "Positive",
      "Customer_Name": "Test Kullanıcı",
      "City": "İstanbul",
      "Phone_Number": "0555 123 4567",
      "Caller_Intent": "Vercel deployment testi"
    }
  }
}
'@

Invoke-WebRequest -Uri "https://retell-telegram-webhook.vercel.app/api/retell-webhook" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
```

**Beklenen sonuç:** Telegram'da mesaj gelecek ✅

### Test 2: Retell'den Gerçek Arama

1. Retell test call yap
2. Aramayı bitir
3. Telegram'ı kontrol et

---

## 📊 Vercel Dashboard'da İzleme

### Logları Görme

1. https://vercel.com/dashboard
2. Projeyi seç: **retell-telegram-webhook**
3. **Deployments** → Son deployment'a tıkla
4. **Functions** → `retell-webhook`
5. **Logs** sekmesinde tüm logları görebilirsin

### Örnek Log Çıktısı

```
Received event: call_analyzed
Telegram message sent successfully
```

---

## 🔄 Güncelleme Yapmak

Kod değiştirdikten sonra:

```powershell
# Tekrar deploy et
vercel --prod
```

Vercel otomatik olarak yeni versiyonu yayınlar.

---

## 🛠️ Değişiklik Yapma

### Telegram Chat ID Değiştirme

`api/retell-webhook.js` dosyasında:

```javascript
const chatId = '7907955424'; // Bu satırı değiştir
```

Sonra:
```powershell
vercel --prod
```

### Mesaj Formatını Değiştirme

`api/retell-webhook.js` dosyasında `text` değişkenini düzenle.

---

## 💰 Maliyet

**Vercel Free Plan:**
- ✅ 100 GB bandwidth/ay
- ✅ 100,000 fonksiyon çağrısı/ay
- ✅ Sınırsız proje
- ✅ SSL sertifikası

**Bioplant için yeterli mi?**
Günde 100 arama × 30 gün = 3,000 çağrı/ay → ✅ **Bolca yeterli**

---

## 🐛 Hata Çözümleri

### "Command not found: vercel"

```powershell
npm install -g vercel
```

### "No token found"

```powershell
vercel login
```

### "Function timeout"

Vercel fonksiyonları 10 saniye sonra timeout yapar (ücretsiz plan).
Telegram API genelde 1-2 saniyede yanıt verir, sorun olmaz.

### Türkçe karakter sorunu

Vercel otomatik UTF-8 kullanır, sorun olmaz.

---

## 📱 Telegram'da Mesaj Gelmiyor?

1. **Vercel loglarına bak:**
   - Dashboard → Proje → Functions → Logs
   - Hata mesajı var mı?

2. **Manuel test yap:**
   ```powershell
   Invoke-WebRequest -Uri "https://[senin-url].vercel.app/api/retell-webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"event":"call_analyzed","call":{"duration_ms":1000,"call_analysis":{"call_summary":"test","call_successful":true,"user_sentiment":"Positive","Customer_Name":"Test","City":"Test","Phone_Number":"Test","Caller_Intent":"Test"}}}'
   ```

3. **Telegram bot token'ı doğru mu?**
   - `api/retell-webhook.js` dosyasında kontrol et

---

## 🎯 Özet

**Yapılacaklar:**

1. ✅ Dosyalar hazır
2. ⬜ Terminal'de `vercel login` çalıştır
3. ⬜ Terminal'de `vercel --prod` çalıştır
4. ⬜ Verilen URL'i kopyala
5. ⬜ Retell dashboard'a ekle
6. ⬜ Test et

**Deployment tamamlandığında:**
- ✅ Bilgisayar kapalıyken çalışır
- ✅ Ücretsiz
- ✅ SSL sertifikası var
- ✅ Otomatik scaling
- ✅ Logları görebilirsin

---

## 📞 Next Steps

Deployment bittikten sonra:

1. **n8n'i kapat** (artık gerek yok)
2. **ngrok'u kapat** (artık gerek yok)
3. **Retell webhook URL'ini güncelle** (Vercel URL'i ile)
4. **Test et**
5. **README.md'yi güncelle** (yeni URL ile)

**Tüm sistem Vercel'de çalışacak!** 🚀

