const { GoogleGenerativeAI } = require("@google/generative-ai");

const geminiGenerateMitigation = async ({ riskLevel, riskScore, floodScore, earthquakeScore, weatherScore }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing in .env");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert disaster risk mitigation engineer.
Generate 4-6 mitigation recommendations for a project.

Risk summary:
- riskLevel: ${riskLevel}
- riskScore: ${riskScore}
- floodScore: ${floodScore}
- earthquakeScore: ${earthquakeScore}
- weatherScore: ${weatherScore}

Return ONLY JSON in this exact format (no extra text):
{
  "priorityLevel": "LOW|MEDIUM|HIGH",
  "recommendations": [
    { "title": "...", "details": "...", "category": "FLOOD|WEATHER|EARTHQUAKE|GENERAL" }
  ]
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Attempt to parse JSON from the response
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Gemini response did not contain JSON");
  }

  const jsonString = text.slice(jsonStart, jsonEnd + 1);
  const parsed = JSON.parse(jsonString);

  return parsed;
};

module.exports = { geminiGenerateMitigation };