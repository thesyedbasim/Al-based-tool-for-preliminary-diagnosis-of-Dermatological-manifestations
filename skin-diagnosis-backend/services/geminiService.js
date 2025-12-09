import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class GeminiService {
  static async analyzeSkinImage(imageUrl, symptoms = {}) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      const prompt = `
        Analyze this skin image for dermatological conditions and provide a preliminary diagnosis.
        
        Patient Symptoms:
        - Itchiness: ${symptoms.itchiness || 'Not specified'}
        - Pain Level: ${symptoms.painLevel || 'Not specified'}
        - Duration: ${symptoms.duration || 'Not specified'}
        - Size Change: ${symptoms.sizeChange || 'Not specified'}
        - Bleeding: ${symptoms.bleeding || 'Not specified'}
        - Additional Notes: ${symptoms.additionalNotes || 'None'}
        
        Please provide analysis in this exact JSON format:
        {
          "conditions": [
            {
              "name": "condition name",
              "probability": "high/medium/low",
              "description": "brief description"
            }
          ],
          "confidence": "percentage",
          "recommendations": [
            "recommendation 1",
            "recommendation 2"
          ],
          "emergencyIndicators": [
            "indicator 1 if any"
          ],
          "severity": "low/medium/high/critical",
          "nextSteps": [
            "step 1",
            "step 2"
          ]
        }
        
        Be medical accurate but cautious. Always recommend professional consultation.
      `;

      // For Gemini Pro Vision, we can use image URLs directly
      const result = await model.generateContent([
        prompt,
        { imageUrl: imageUrl }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Gemini AI Error:', error);
      throw new Error('AI analysis failed: ' + error.message);
    }
  }

  static async generateQuestions(symptoms) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        Based on these initial skin condition responses: ${JSON.stringify(symptoms)}
        Generate 3-5 follow-up questions to better diagnose the skin condition.
        Return ONLY JSON format:
        {
          "questions": [
            "question 1",
            "question 2",
            "question 3"
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Gemini Questions Error:', error);
      return {
        questions: [
          "How long have you noticed this skin condition?",
          "Has the appearance changed over time?",
          "Is there any family history of skin conditions?"
        ]
      };
    }
  }
}