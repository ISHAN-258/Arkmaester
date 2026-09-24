import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

/** POST /api/chat — body: { messages: [{role,content}], systemInstruction? } */
router.post("/", async (req, res, next) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY missing in .env. Get a free key at https://aistudio.google.com/apikey",
      });
    }

    const { messages = [], systemInstruction } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Request body must include non-empty 'messages' array" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content ?? "" }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        systemInstruction: systemInstruction || "You are Arkmaester AI, an intelligent study assistant.",
      },
    });

    const text = response.text || "";
    res.json({ role: "assistant", content: text });
  } catch (err) {
    next(err);
  }
});

export default router;
