
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Sadece POST isteği kabul edilir."
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY ayarlanmamış."
    });
  }

  try {
    const messages = Array.isArray(req.body?.messages)
      ? req.body.messages
      : [];

    const safeMessages = messages
      .filter(
        (m) =>
          ["user", "assistant"].includes(m.role) &&
          typeof m.content === "string"
      )
      .slice(-12);

    if (!safeMessages.length) {
      return res.status(400).json({
        error: "Önce bir mesaj yaz."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions:
            "Sen Küfürbaz AI'sin. Türkçe konuş. Komik, hazırcevap, hafif argo ve nükteli ol. Kullanıcıyla karşılıklı şakalaş ve zararsız roast yap. Gerçek tehditler, nefret söylemi veya ağır kişisel saldırılar üretme. Kullanıcı üzgünse destekleyici ol. Kısa ve doğal cevaplar ver.",
          input: safeMessages,
          max_output_tokens: 400
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API hatası:", data);
      return res.status(502).json({
        error: "Yapay zekâ servisi yanıt vermedi."
      });
    }

    const reply = data.output_text;

    if (!reply) {
      return res.status(502).json({
        error: "Yapay zekâ boş yanıt verdi."
      });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Sunucuda bir hata oluştu."
    });
  }
}
