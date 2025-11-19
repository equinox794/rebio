# Retell - Telegram n8n Entegrasyonu

## 📋 Genel Bakış

Bu sistem, Retell AI telefon sistemi ile Telegram arasında otomatik bildirim entegrasyonu sağlar.
Bir müşteri Retell'den aradığında, arama bittiğinde AI tarafından çıkarılan bilgiler (isim, şehir, telefon, amaç) Telegram'a otomatik mesaj olarak gönderilir.

---

## 🔑 Kritik Kimlikler ve Anahtarlar

### Telegram Bot Bilgileri

**Bot Token:**
```
8279248718:AAESD7d5zfrudVI0ZIxzLYNer1p5KT2yFa0
```

**Bot Kullanıcı Adı:**
```
@bioplant_call_bot
```

**Bot ID:**
```
8279248718
```

**Alıcı Chat ID (Serkan Beklen):**
```
7907955424
```

**Telegram Bot Yönetim URL:**
```
https://t.me/BotFather
```

**Telegram API Base URL:**
```
https://api.telegram.org/bot<TOKEN>/
```

**Test Komutu (PowerShell):**
```powershell
Invoke-RestMethod -Uri "https://api.telegram.org/bot8279248718:AAESD7d5zfrudVI0ZIxzLYNer1p5KT2yFa0/getMe"
```

---

### n8n Workflow Bilgileri

**Workflow ID:**
```
npnN0amPhJozdYZz
```

**Workflow Adı:**
```
Retell to Telegram Notifier
```

**Webhook ID:**
```
e47b44d3-e387-453b-9117-190f52c276f0
```

**Webhook URL (Localhost):**
```
http://localhost:5678/webhook/e47b44d3-e387-453b-9117-190f52c276f0
```

**Webhook URL (ngrok Örnek):**
```
https://puisne-pseudoindependently-orville.ngrok-free.dev/webhook/e47b44d3-e387-453b-9117-190f52c276f0
```

> **Not:** ngrok URL'i her ngrok başlatıldığında değişir. Retell'de webhook URL'ini güncellemeniz gerekir.

**n8n Port:**
```
5678
```

---

### Retell AI Bilgileri

**Agent ID:**
```
agent_d659ec09b7af3a99a591d662be
```

**Agent Adı:**
```
bioplant Agent
```

**Retell Webhook Ayarları:**
- Retell dashboard → Settings/Webhooks
- Webhook URL'e n8n webhook'unuzu ekleyin (ngrok ile public URL)
- Method: POST
- Events: `call_started`, `call_analyzed`

---

## 🏗️ Sistem Mimarisi

### n8n Workflow Yapısı

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────────────────────┐
│   Webhook   │────────▶│ Only Call Analyzed   │────────▶│ Send Telegram Message   │
│  (Trigger)  │         │   (IF Filter Node)   │         │   (HTTP Request)        │
└─────────────┘         └──────────────────────┘         └─────────────────────────┘
                                  │
                                  │ (false - call_started)
                                  ▼
                               [STOP]
```

### Node Detayları

#### 1. Webhook Node
- **ID:** `15965773-d033-4221-9c36-b8ae160ce6c5`
- **Tip:** `nodes-base.webhook`
- **HTTP Method:** POST
- **Path:** `e47b44d3-e387-453b-9117-190f52c276f0`
- **Görevi:** Retell'den gelen POST isteklerini alır

#### 2. Only Call Analyzed Node (Filter)
- **ID:** `filter-call-analyzed`
- **Tip:** `nodes-base.if`
- **Koşul:** `$json.body.event === "call_analyzed"`
- **Görevi:** 
  - `call_started` event'lerini durdurur (mesaj gönderMEZ)
  - `call_analyzed` event'lerini geçirir (mesaj gönderir)

#### 3. Send Telegram Message Node
- **ID:** `http-request-telegram`
- **Tip:** `nodes-base.httpRequest`
- **Method:** POST
- **URL:** `https://api.telegram.org/bot8279248718:AAESD7d5zfrudVI0ZIxzLYNer1p5KT2yFa0/sendMessage`
- **Content-Type:** JSON
- **Görevi:** Telegram'a mesaj gönderir

---

## 📝 Retell Post-Call Data Extraction

Retell agent'ının aramadan sonra çıkarması gereken veriler:

### Field Tanımları

| Field Name | Açıklama | Örnek |
|------------|----------|-------|
| `Customer_Name` | Müşterinin adı soyadı | "Serkan Beklen" |
| `City` | Şehir bilgisi | "Adana" |
| `Phone_Number` | Telefon numarası | "0533 533 1010" |
| `Caller_Intent` | Arama nedeni | "Mağlup gübresi fiyat sorgusu" |

### Retell Dashboard Ayarları

**Post-Call Data Extraction** bölümünde şu alanlar tanımlı:

```
1. Customer_Name (Text)
   Description: Extract the caller's full name from the conversation

2. City (Text)
   Description: Extract the city name mentioned by the caller

3. Phone_Number (Text)
   Description: Extract or identify the caller's phone number

4. Caller_Intent (Text)
   Description: What is the main purpose of the call? (e.g., product inquiry, price question, complaint)
```

**AI Model:** Claude 4.5 Sonnet

---

## 📱 Telegram Mesaj Formatı

### Gönderilen Mesaj Örneği

```
🤖 AI Analizli Yeni Arama!

📞 Arama Tipi: call_analyzed
⏱ Süre: 62 saniye

📝 Özet:
Serkan Adana'dan aradı, mağlup gübresi hakkında bilgi istedi. İletişim bilgileri alındı.

🚀 Sonuç: ✅ Başarılı
👤 Duygu Durumu: Positive

👤 Müşteri: Serkan Beklen
🌍 Şehir: Adana
📞 Tel: 0533 533 1010
📋 Amaç: Mağlup gübresi fiyat sorgusu
```

### Mesaj İçeriği Mapping

```javascript
{
  "chat_id": "7907955424",
  "text": 
    "🤖 AI Analizli Yeni Arama!\n\n" +
    "📞 Arama Tipi: " + $json.body.event + "\n" +
    "⏱ Süre: " + Math.round($json.body.call.duration_ms / 1000) + " saniye\n\n" +
    "📝 Özet:\n" + $json.body.call.call_analysis.call_summary + "\n\n" +
    "🚀 Sonuç: " + (call_successful ? '✅ Başarılı' : '❌ Başarısız') + "\n" +
    "👤 Duygu Durumu: " + $json.body.call.call_analysis.user_sentiment + "\n\n" +
    "👤 Müşteri: " + $json.body.call.call_analysis.Customer_Name + "\n" +
    "🌍 Şehir: " + $json.body.call.call_analysis.City + "\n" +
    "📞 Tel: " + $json.body.call.call_analysis.Phone_Number + "\n" +
    "📋 Amaç: " + $json.body.call.call_analysis.Caller_Intent
}
```

---

## 🔄 Retell Webhook Payload Yapısı

### Event Tipleri

Retell 3 farklı event gönderir:

1. **`call_started`** - Arama başladığında
2. **`call_analyzed`** - Arama sona erdiğinde (1. analiz)
3. **`call_analyzed`** - Arama bittikten sonra (2. analiz - tam veri)

> **Önemli:** Sistem sadece `call_analyzed` event'lerine yanıt verir.

### call_analyzed Payload Örneği

```json
{
  "event": "call_analyzed",
  "call": {
    "call_id": "call_4038c31ce47696ce214311f6db9",
    "call_type": "web_call",
    "agent_id": "agent_d659ec09b7af3a99a591d662be",
    "agent_version": 13,
    "agent_name": "bioplant Agent",
    "call_status": "ended",
    "start_timestamp": 1763575277283,
    "end_timestamp": 1763575340136,
    "duration_ms": 62853,
    "transcript": "Agent: İyi günler...\nUser: Merhaba...",
    "call_analysis": {
      "call_summary": "Serkan Adana'dan aradı...",
      "call_successful": true,
      "user_sentiment": "Positive",
      "Customer_Name": "Serkan Beklen",
      "City": "Adana",
      "Phone_Number": "0533 533 1010",
      "Caller_Intent": "Mağlup gübresi fiyat sorgusu"
    }
  }
}
```

---

## 🚀 Kurulum ve Başlatma

### 1. n8n Başlatma

```powershell
# n8n'i başlat
n8n start

# n8n web arayüzü
http://localhost:5678
```

### 2. ngrok ile Public URL Oluşturma

```powershell
# ngrok indir ve kur: https://ngrok.com/download

# n8n portunu public'e aç
ngrok http 5678

# Çıktıda gösterilen URL'i kopyala:
# Örnek: https://abc-123-def.ngrok-free.app
```

### 3. Retell Webhook Ayarı

1. Retell dashboard'a gir
2. Settings → Webhooks
3. Webhook URL ekle:
   ```
   https://[ngrok-url].ngrok-free.app/webhook/e47b44d3-e387-453b-9117-190f52c276f0
   ```
4. Save

### 4. Test

```powershell
# Test webhook (localhost için)
$body = @'
{
  "event": "call_analyzed",
  "call": {
    "duration_ms": 45000,
    "call_analysis": {
      "call_summary": "Test araması",
      "call_successful": true,
      "user_sentiment": "Positive",
      "Customer_Name": "Test Kullanıcı",
      "City": "İstanbul",
      "Phone_Number": "0555 123 4567",
      "Caller_Intent": "Test"
    }
  }
}
'@

Invoke-WebRequest -Uri "http://localhost:5678/webhook/e47b44d3-e387-453b-9117-190f52c276f0" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
```

Telegram'da mesaj gelirse ✅ çalışıyor demektir.

---

## 🔧 Değişiklik Yapılması Gereken Durumlar

### Telegram Chat ID Değiştirme

Farklı bir kullanıcıya mesaj göndermek için:

1. Kullanıcıdan bot'a `/start` yazmasını iste
2. Chat ID'yi al:
   ```powershell
   (Invoke-RestMethod -Uri "https://api.telegram.org/bot8279248718:AAESD7d5zfrudVI0ZIxzLYNer1p5KT2yFa0/getUpdates").result[-1].message.chat.id
   ```
3. n8n'de "Send Telegram Message" node'unu aç
4. `jsonBody` içindeki `chat_id` değerini değiştir

### Mesaj Formatını Değiştirme

n8n'de "Send Telegram Message" node → `jsonBody` parametresini düzenle.

**Örnek:**
```javascript
={{ {"chat_id": "7907955424", "text": "Yeni format: " + $json.body.call.call_analysis.Customer_Name} }}
```

### Yeni Alan Ekleme

1. Retell dashboard → Agent → Post-Call Data Extraction
2. `+ Add` ile yeni field ekle (örn: `Email`)
3. n8n mesaj formatına ekle:
   ```javascript
   "📧 Email: " + String($json.body?.call?.call_analysis?.Email || 'Bilinmiyor')
   ```

---

## 🐛 Hata Çözümleri

### n8n Execution Loglarını Görme

```javascript
// n8n web arayüzü
http://localhost:5678

// Executions → Workflow seç → Son çalıştırmaları gör
```

**veya CLI ile:**
```powershell
# n8n MCP tools kullanarak
mcp_n8n-mcp_n8n_list_executions -workflowId npnN0amPhJozdYZz -limit 10
```

### Telegram Mesajı Gelmiyor

1. **n8n çalışıyor mu kontrol et:**
   ```powershell
   curl http://localhost:5678
   ```

2. **ngrok çalışıyor mu kontrol et:**
   ```powershell
   ngrok status
   ```

3. **Retell webhook URL'i doğru mu:**
   - Retell dashboard → Webhooks
   - URL tam olmalı: `https://[ngrok].ngrok-free.app/webhook/e47b44d3-e387-453b-9117-190f52c276f0`

4. **Execution loglarına bak:**
   - n8n web arayüzü → Executions
   - Hata varsa "error" mesajını oku

### Türkçe Karakter Sorunu

PowerShell testlerinde Türkçe karakterler bozuk görünebilir (`ş` → `ÅŸ`).
Bu normal, Retell'den gerçek arama geldiğinde düzgün görünür.

### call_started Mesajları Geliyor

Filter node çalışmıyor demektir. Kontrol:
- "Only Call Analyzed" node'u var mı?
- Condition: `$json.body.event` === `"call_analyzed"` mi?
- Connection: Webhook → Filter → Send Telegram

---

## 📊 Monitoring ve İstatistikler

### n8n Workflow İstatistikleri

```bash
# Workflow durumunu kontrol et
curl http://localhost:5678/api/v1/workflows/npnN0amPhJozdYZz

# Son execution'ları listele
curl http://localhost:5678/api/v1/executions?workflowId=npnN0amPhJozdYZz
```

### Telegram Bot İstatistikleri

```powershell
# Bot bilgilerini al
Invoke-RestMethod -Uri "https://api.telegram.org/bot8279248718:AAESD7d5zfrudVI0ZIxzLYNer1p5KT2yFa0/getMe"

# Son mesajları listele
Invoke-RestMethod -Uri "https://api.telegram.org/bot8279248718:AAESD7d5zfrudVI0ZIxzLYNer1p5KT2yFa0/getUpdates"
```

---

## 🔐 Güvenlik Notları

1. **Bot Token'ı gizli tut** - Public repoya push etme
2. **ngrok URL** her başlatmada değişir - Production için sabit URL kullan (Vercel, AWS, etc.)
3. **Webhook'a kimlik doğrulama ekle** - `x-retell-signature` header'ını kontrol et
4. **Chat ID** sadece yetkili kişilere mesaj gönder

---

## 📞 İletişim ve Destek

**Proje:** Bioplant CRM - Retell Telegram Integration
**Tarih:** 19 Kasım 2025
**Geliştirici:** Serkan Beklen

**Yararlı Linkler:**
- n8n Docs: https://docs.n8n.io
- Telegram Bot API: https://core.telegram.org/bots/api
- Retell AI Docs: https://docs.retellai.com
- ngrok Docs: https://ngrok.com/docs

---

## 🎯 Özet Checklist

Yeni programcı için yapılacaklar:

- [ ] n8n'i başlat (`n8n start`)
- [ ] ngrok'u başlat (`ngrok http 5678`)
- [ ] ngrok URL'ini kopyala
- [ ] Retell webhook URL'ini güncelle
- [ ] Test araması yap
- [ ] Telegram'da mesaj geldiğini doğrula
- [ ] Workflow'u backup al (`n8n export:workflow --id=npnN0amPhJozdYZz`)

**Tüm sistem hazır ve çalışır durumda!** 🚀

