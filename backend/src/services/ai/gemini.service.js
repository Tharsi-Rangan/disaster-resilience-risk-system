const { GoogleGenerativeAI } = require("@google/generative-ai");

const extractJSON = (text) => {
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No valid JSON found in Gemini response");
  }

  return text.slice(firstBrace, lastBrace + 1);
};

const geminiGenerateMitigation = async ({
  riskLevel,
  riskScore,
  floodScore,
  earthquakeScore,
  weatherScore,
  locationContext,
  weatherContext,
  customFocus,
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest"  });

  const prompt = `
You are an expert disaster mitigation engineer.
Generate exactly 5 practical, action-oriented mitigation recommendations based on the provided risk analysis.

Rules:
1. Use simple English for general users.
2. Avoid overly technical jargon.
3. Keep details short and readable.
4. If location or weather data is provided below, incorporate it subtly into your reasoning.
5. The core driver of priority MUST be the riskScore and riskLevel.

Return ONLY JSON in this exact format, with exactly 5 objects in the array:

{
  "priorityLevel": "LOW|MEDIUM|HIGH",
  "recommendations": [
    {
      "title": "...",
      "details": "...",
      "category": "FLOOD|EARTHQUAKE|WEATHER|GENERAL"
    }
  ]
}

Risk Data:
- riskLevel: ${riskLevel}
- riskScore: ${riskScore}
- floodScore: ${floodScore}
- earthquakeScore: ${earthquakeScore}
- weatherScore: ${weatherScore}
${locationContext ? `- Location Context: ${locationContext}` : ''}
${weatherContext ? `- Environmental Context: ${weatherContext}` : ''}
${customFocus ? `\nCRITICAL USER REQUEST: The user specifically requested that you base the new plan around this focus area:\n"${customFocus}"\nPrioritize this focus while generating recommendations.` : ''}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonString = extractJSON(text);
  const parsed = JSON.parse(jsonString);

  return parsed;
};

const geminiChatResponse = async (message, contextTitle, contextDetails) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `You are a highly intelligent Disaster Mitigation AI Advisor.
The user is asking a specific question regarding an active mitigation task in their project.

TASK CONTEXT:
Title: ${contextTitle}
Details: ${contextDetails}

USER QUESTION:
"${message}"

Provide a concise, professional, and directly applicable answer. Focus on practical construction and mitigation knowledge. Keep your response brief but highly valuable. Do not use markdown format block elements unless necessary.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = { geminiGenerateMitigation, geminiChatResponse };