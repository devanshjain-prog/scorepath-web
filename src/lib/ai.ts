export async function getAIChatCompletion(options: {
  messages: Array<{ role: string; content: string }>;
  systemInstruction?: string;
  responseFormat?: 'json_object';
}) {
  const freellmUrl = process.env.FREELLMAPI_BASE_URL || 'http://127.0.0.1:3001/v1';

  // 1. Try FreeLLMAPI first
  try {
    const formattedMessages = [...options.messages];
    if (options.systemInstruction) {
      formattedMessages.unshift({ role: 'system', content: options.systemInstruction });
    }

    const res = await fetch(`${freellmUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer free-key'
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        messages: formattedMessages,
        response_format: options.responseFormat ? { type: options.responseFormat } : undefined
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices[0].message.content;
    }
  } catch (e) {
    console.warn('FreeLLMAPI failed or offline, trying direct providers...');
  }

  // 2. Try Direct Google Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      const model = 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      const body: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: options.messages.map(m => m.content).join('\n\n') }]
          }
        ]
      };

      if (options.systemInstruction) {
        body.systemInstruction = {
          parts: [{ text: options.systemInstruction }]
        };
      }

      if (options.responseFormat === 'json_object') {
        body.generationConfig = {
          responseMimeType: 'application/json'
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errData = await res.json();
        console.error('Gemini API Error details:', errData);
      }
    } catch (e) {
      console.error('Direct Gemini API call failed:', e);
    }
  }

  // 3. Try Direct Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const url = 'https://api.groq.com/openai/v1/chat/completions';
      const formattedMessages = [...options.messages];
      if (options.systemInstruction) {
        formattedMessages.unshift({ role: 'system', content: options.systemInstruction });
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: formattedMessages,
          response_format: options.responseFormat ? { type: options.responseFormat } : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.error('Direct Groq API call failed:', e);
    }
  }

  throw new Error('All AI providers failed or are unconfigured');
}
