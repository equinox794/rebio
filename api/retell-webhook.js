// Retell to Telegram Webhook Handler
// Vercel Serverless Function

export default async function handler(req, res) {
  // CORS headers (opsiyonel)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS request için
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece POST kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { event, call } = req.body;

    // Log (Vercel dashboard'da görebilirsin)
    console.log('Received event:', event);

    // Sadece call_analyzed event'lerini işle
    if (event !== 'call_analyzed') {
      console.log('Ignoring event:', event);
      return res.status(200).json({ message: 'Event ignored', event });
    }

    // Telegram mesajı hazırla (Environment Variables'dan al)
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!telegramBotToken || !chatId) {
      return res.status(500).json({ error: 'Missing Telegram credentials' });
    }
    
    const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    const durationSeconds = Math.round((call?.duration_ms || 0) / 1000);
    const callSummary = call?.call_analysis?.call_summary || 'Analiz yok';
    const callSuccessful = call?.call_analysis?.call_successful;
    const userSentiment = call?.call_analysis?.user_sentiment || 'Bilinmiyor';
    const customerName = call?.call_analysis?.Customer_Name || 'Bilinmiyor';
    const city = call?.call_analysis?.City || 'Bilinmiyor';
    
    // Telefon numarası: Önce from_number (gerçek arama), yoksa AI'dan çıkarılan
    const phoneNumber = call?.from_number || call?.call_analysis?.Phone_Number || 'Bilinmiyor';
    
    const callerIntent = call?.call_analysis?.Caller_Intent || 'Bilinmiyor';

    const text = `🤖 AI Analizli Yeni Arama!

📞 Arama Tipi: ${event}
⏱ Süre: ${durationSeconds} saniye

📝 Özet:
${callSummary}

🚀 Sonuç: ${callSuccessful ? '✅ Başarılı' : '❌ Başarısız'}
👤 Duygu Durumu: ${userSentiment}

👤 Müşteri: ${customerName}
🌍 Şehir: ${city}
📞 Tel: ${phoneNumber}
📋 Amaç: ${callerIntent}`;

    // Telegram'a gönder
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

    const telegramData = await telegramResponse.json();

    if (!telegramData.ok) {
      console.error('Telegram error:', telegramData);
      return res.status(500).json({ 
        error: 'Failed to send Telegram message', 
        details: telegramData 
      });
    }

    console.log('Telegram message sent successfully');

    return res.status(200).json({ 
      success: true, 
      message: 'Notification sent',
      telegram_message_id: telegramData.result.message_id 
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

