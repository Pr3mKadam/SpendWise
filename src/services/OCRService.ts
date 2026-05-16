export interface OCRResult {
  merchant?: string;
  amount?: number;
  date?: string;
  category?: string;
  rawText: string;
}

export const processReceipt = async (imageFile: File): Promise<OCRResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  // Convert file to base64
  const base64 = await fileToBase64(imageFile);
  const mimeType = imageFile.type;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: "Extract details from this receipt. Return a JSON object with fields: merchant (string), amount (number), date (string, YYYY-MM-DD), category (string), and rawText (string containing all text found). If a field is not found, use null or omit it. Be accurate with the amount (look for total/sum)." },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Gemini API Error:', error);
    throw new Error('Failed to process receipt with Gemini');
  }

  const data = await response.json();
  
  if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts) {
    console.error('Gemini API structure mismatch:', data);
    throw new Error('Receipt analysis returned no results. Please ensure the image is clear.');
  }

  const text = data.candidates[0].content.parts[0].text;
  
  try {
    // Gemini 1.5 Pro/Flash in JSON mode might still wrap in backticks sometimes if not careful
    const cleanJson = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanJson);
    
    return {
      merchant: result.merchant || 'Unknown Merchant',
      amount: result.amount || 0,
      date: result.date || new Date().toISOString().split('T')[0],
      category: result.category || 'Other',
      rawText: result.rawText || text
    };
  } catch (e) {
    console.warn('Failed to parse Gemini response as JSON, falling back to regex:', text);
    // Simple regex fallback for common fields if JSON parsing fails
    const amountMatch = text.match(/(?:total|amount|sum|due)\s*[:$₹Rs]?\s*(\d+[.,]\d{2})/i);
    return {
      merchant: 'Receipt',
      amount: amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0,
      date: new Date().toISOString().split('T')[0],
      rawText: text
    };
  }
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}
