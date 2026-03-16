import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Enterprise AI Service
 * Purpose: Provides smart productivity enhancements, anomaly detection, 
 * and predictive workflow suggestions for the EduTrack platform.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const aiService = {
  /**
   * Predictive Workflow: Suggests the next 3 logical actions for a user
   * based on their current page and role.
   */
  async suggestNextActions(role: string, currentPage: string): Promise<string[]> {
    if (!process.env.GEMINI_API_KEY) {
      // Fallback for local development without API keys
      const fallbacks: Record<string, string[]> = {
        'Teacher': ['Enter Marks', 'View Class Performance', 'Schedule Exam'],
        'Principal': ['Review Audit Logs', 'Generate Semester Report', 'Manage Staff'],
      };
      return fallbacks[role] || ['Explore Dashboard'];
    }

    const prompt = `User Role: ${role}. Current Page: ${currentPage}. Based on this, suggest 3 short, high-productivity next actions for a school administrator. Return ONLY a JSON array of strings to maximize efficiency.`;
    
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text.match(/\[.*\]/s)?.[0] || '[]');
    } catch (error) {
      console.error("[AI ERROR]: Failed to generate suggestions", error);
      return [];
    }
  },

  /**
   * Smart Question Architect: Generates exam questions based on subject/grade.
   */
  async generateExamQuestions(subject: string, grade: string, count = 5): Promise<any[]> {
    if (!process.env.GEMINI_API_KEY) return [];

    const prompt = `Generate ${count} multiple choice questions for ${subject} grade ${grade}. 
    Return ONLY a JSON array of objects with keys: question, options (array), and correctIndex.`;
    
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text.match(/\[.*\]/s)?.[0] || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Anomaly Detection: Analyzes a series of log entries to find unusual patterns.
   */
  async detectAnomalies(logs: any[]): Promise<string | null> {
    if (!process.env.GEMINI_API_KEY) return null;

    const prompt = `Analyze these system logs for a school management system: ${JSON.stringify(logs)}. Identify if there are any suspicious patterns (e.g. brute force, logic abuse, mass data export). Provide a CONCISE summary if an anomaly is found, otherwise return 'NULL'.`;
    
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text.includes('NULL') ? null : text;
    } catch {
      return null;
    }
  }
};
