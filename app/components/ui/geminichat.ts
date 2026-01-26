import { useState, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

type ThinkingLevel = "minimal" | "low" | "medium" | "high";

interface Message {
  role: "user" | "model";
  text: string;
  codeEdit?: {
    original: string;
    modified: string;
    explanation: string;
  };
}

export const useGeminiChat = (
  lessonContext: string,
  moduleName: string,
  thinkingLevel: ThinkingLevel,
  fileContent?: string,
  fileName?: string
) => {
  const [chatSession, setChatSession] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
          console.error("Gemini API key not found");
          return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-3-flash-preview",
          systemInstruction: `You are the NeuroLearn AI Tutor for "${moduleName}". 
Context: "${lessonContext}".
${fileContent ? `Current file (${fileName}):\n${fileContent}\n\n` : ''}

When suggesting code changes, use this format:
[Your explanation here]

\`\`\`ORIGINAL
[original code snippet]
\`\`\`
\`\`\`MODIFIED
[modified code snippet]
\`\`\`

Use Gemini 3 reasoning to be deep yet concise. Avoid asterisks/markdown symbols in regular text.
Voice mode responses must be under 3 sentences.`,
          generationConfig: {
            //@ts-ignore
            thinkingConfig: {
              thinkingLevel: thinkingLevel,
              includeThoughts: false,
            },
          },
        });

        // Create chat with existing message history
        const history = messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));

        const session = model.startChat({ history });
        setChatSession(session);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Gemini chat:", error);
      }
    };

    initChat();
  }, [lessonContext, moduleName, thinkingLevel, fileContent, fileName, messages.length]);

  const parseCodeEdit = useCallback((responseText: string) => {
    const codeEditRegex = /```ORIGINAL\n([\s\S]*?)\n```\s*```MODIFIED\n([\s\S]*?)\n```/;
    const match = responseText.match(codeEditRegex);
    
    if (match) {
      const explanation = responseText.split('```ORIGINAL')[0].trim();
      return {
        original: match[1].trim(),
        modified: match[2].trim(),
        explanation: explanation || "Code modification suggested",
      };
    }
    return null;
  }, []);

  const sendMessage = useCallback(async (text: string, isVoice = false) => {
    if (!text.trim() || isThinking) {
      console.log("Cannot send: empty text or already thinking");
      return;
    }

    if (!chatSession || !isInitialized) {
      console.error("Chat session not initialized");
      setMessages((prev) => [
        ...prev,
        { role: "user", text },
        { role: "model", text: "Chat is initializing, please wait a moment and try again." }
      ]);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text }]);
    setIsThinking(true);

    try {
      const result = await chatSession.sendMessage(text);
      const responseText = result.response.text();
      
      const codeEdit = parseCodeEdit(responseText);
      const cleanText = codeEdit 
        ? responseText.split('```ORIGINAL')[0].trim()
        : responseText;

      const newMessage: Message = { 
        role: "model", 
        text: cleanText,
        codeEdit: codeEdit || undefined
      };

      setMessages((prev) => [...prev, newMessage]);
      
      if (isVoice && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Gemini 3 Error:", error);
      console.log('api issues!')
      setMessages((prev) => [
        ...prev,
        { 
          role: "model", 
          text: "I encountered an error. This might be due to API limits or network issues. Please try again in a moment." 
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }, [chatSession, isThinking, isInitialized, parseCodeEdit]);

  return {
    messages,
    isThinking,
    sendMessage,
    setMessages,
    isInitialized,
  };
};