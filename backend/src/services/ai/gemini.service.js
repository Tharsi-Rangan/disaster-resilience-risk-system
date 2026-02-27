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
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest"  });

  const prompt = `
You are an expert disaster mitigation engineer.
Generate mitigation recommendations based on risk analysis.

Return ONLY JSON in this exact format:

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
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonString = extractJSON(text);
  const parsed = JSON.parse(jsonString);

  return parsed;
};

module.exports = { geminiGenerateMitigation };