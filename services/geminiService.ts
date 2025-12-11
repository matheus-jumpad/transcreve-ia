import { GoogleGenAI } from "@google/genai";
import { TranscriptionResult } from "../types";

const API_KEY = process.env.API_KEY;

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/mp3;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const parseTextResponse = (text: string): TranscriptionResult => {
  const result: TranscriptionResult = {
    transcription: "",
    highlights: [],
    summary: ""
  };

  // Extract Highlights
  const highlightsMatch = text.match(/<HIGHLIGHTS>([\s\S]*?)<\/HIGHLIGHTS>/i);
  if (highlightsMatch && highlightsMatch[1]) {
    result.highlights = highlightsMatch[1]
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').replace(/^[0-9]+\.\s*/, '').trim()) // Clean bullets
      .filter(line => line.length > 0);
  }

  // Extract Summary
  const summaryMatch = text.match(/<SUMMARY>([\s\S]*?)<\/SUMMARY>/i);
  if (summaryMatch && summaryMatch[1]) {
    result.summary = summaryMatch[1].trim();
  }

  // Extract Transcription
  // We use a regex that captures everything after the tag, to handle truncated responses gracefully
  const transcriptionMatch = text.match(/<TRANSCRIPTION>([\s\S]*)/i);
  if (transcriptionMatch && transcriptionMatch[1]) {
    // Remove closing tag if it exists (meaning it wasn't truncated)
    result.transcription = transcriptionMatch[1].replace('</TRANSCRIPTION>', '').trim();
  } else {
    // Fallback: if no tags found, assume the whole text is the transcription
    if (result.highlights.length === 0 && !result.summary) {
       result.transcription = text;
    }
  }

  return result;
};

export const transcribeMedia = async (file: File): Promise<TranscriptionResult> => {
  if (!API_KEY) {
    throw new Error("Chave de API não configurada. Por favor, verifique suas variáveis de ambiente.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Load file data
  const mediaPart = await fileToGenerativePart(file);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          mediaPart,
          {
            text: `Você é um especialista em transcrição e sumarização. 
            Analise o arquivo de áudio/vídeo fornecido.
            
            Siga estas instruções ESTRITAMENTE para formatar sua resposta:
            1. Primeiro, liste os principais destaques (highlights). Use a tag <HIGHLIGHTS>.
            2. Segundo, forneça um resumo executivo curto. Use a tag <SUMMARY>.
            3. Por fim, forneça a transcrição completa e literal em Português. Use a tag <TRANSCRIPTION>.
            
            Se o áudio for muito longo, priorize terminar os Highlights e o Resumo antes de começar a Transcrição.
            Se o áudio estiver em outro idioma, traduza tudo para o Português.

            Exemplo de formato esperado:
            <HIGHLIGHTS>
            - Destaque 1
            - Destaque 2
            </HIGHLIGHTS>
            <SUMMARY>
            O áudio trata de...
            </SUMMARY>
            <TRANSCRIPTION>
            Olá pessoal, hoje vamos falar sobre...
            </TRANSCRIPTION>
            `
          }
        ]
      },
      config: {
        // We do NOT use responseMimeType: "application/json" to avoid crashes on long audio truncation
        maxOutputTokens: 8192, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta do modelo.");

    return parseTextResponse(text);

  } catch (error: any) {
    console.error("Gemini Transcription Error:", error);
    throw new Error(error.message || "Falha ao processar o áudio com Gemini.");
  }
};