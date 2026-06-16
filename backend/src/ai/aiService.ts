import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const NVIDIA_INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const DEFAULT_API_KEY = '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';

export interface AIAnalysisResult {
  priority: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  recommendedActions: string[];
  resourceNeeds: string[];
  hasImmediateHazard: boolean;
}

export const aiService = {
  /**
   * Helper to convert a local file path to base64 data URI
   */
  fileToBase64: async (relativeOrAbsolutePath: string): Promise<string | null> => {
    try {
      // Clean leading slash if it's relative to uploads
      let filePath = relativeOrAbsolutePath;
      if (filePath.startsWith('/uploads/')) {
        filePath = filePath.substring(9); // remove '/uploads/'
      }
      
      // Resolve path against backend/uploads directory or project root
      let absolutePath = path.resolve(filePath);
      
      // Check fallback locations
      try {
        await fs.access(absolutePath);
      } catch {
        // Try resolving in backend/uploads
        absolutePath = path.resolve(__dirname, '../../uploads', filePath);
        try {
          await fs.access(absolutePath);
        } catch {
          // Try resolving in public uploads if nested
          absolutePath = path.resolve(__dirname, '../../../uploads', filePath);
          await fs.access(absolutePath);
        }
      }

      const fileBuffer = await fs.readFile(absolutePath);
      const base64 = fileBuffer.toString('base64');
      const ext = path.extname(absolutePath).toLowerCase().replace('.', '');
      
      let mimeType = 'image/jpeg';
      if (ext === 'png') mimeType = 'image/png';
      if (ext === 'webp') mimeType = 'image/webp';
      if (ext === 'gif') mimeType = 'image/gif';
      
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Failed to convert file to base64:', error);
      return null;
    }
  },

  /**
   * Send incident report text and optional image to NVIDIA Minimax-M3 for analysis.
   */
  analyzeIncidentReport: async (
    type: string,
    description: string,
    photoUrl?: string | null
  ): Promise<AIAnalysisResult> => {
    const apiKey = process.env.NVIDIA_API_KEY || DEFAULT_API_KEY;
    
    // System prompt instructing the AI to evaluate the emergency
    const systemPrompt = `You are an AI Dispatch Assistant on the EmergencyTool NET response coordination platform in the Philippines.
Your job is to analyze the emergency report and return a JSON object with assessment data.

You must respond with ONLY a valid raw JSON object. Do not wrap the JSON in markdown code blocks, do not write prefaces, do not write explanations.
Format the JSON exactly like this:
{
  "priority": "low" | "medium" | "high" | "critical",
  "summary": "Short concise summary of the situation. Translate Tagalog/Taglish descriptions into clear English.",
  "recommendedActions": ["First responder step 1", "First responder step 2", ...],
  "resourceNeeds": ["Resource 1", "Resource 2", ...],
  "hasImmediateHazard": true | false
}

Guidelines for priority:
- "critical": Active fires, flood waters trapping citizens, major accidents with severe trauma, active shooter/violence.
- "high": General accident with injuries, crimes in progress, medical emergencies requiring immediate checkup.
- "medium": Low-risk medical concerns, minor theft, minor hazards.
- "low": Non-immediate threats, missing person reports (until verified urgent), minor details.`;

    const userMessageContent: any[] = [
      {
        type: 'text',
        text: `Emergency Type: ${type}\nReport Description: ${description || 'No description provided.'}`
      }
    ];

    // Check if photo is present and convert to base64
    if (photoUrl) {
      const base64DataUri = await aiService.fileToBase64(photoUrl);
      if (base64DataUri) {
        userMessageContent.push({
          type: 'image_url',
          image_url: {
            url: base64DataUri
          }
        });
      }
    }

    try {
      const response = await axios.post(
        NVIDIA_INVOKE_URL,
        {
          model: 'minimaxai/minimax-m3',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessageContent }
          ],
          max_tokens: 2048,
          temperature: 0.2, // low temp for structured output consistency
          top_p: 0.95,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const responseContent = response.data?.choices?.[0]?.message?.content?.trim();
      if (!responseContent) {
        throw new Error('Empty response from NVIDIA Minimax API');
      }

      // Strip markdown code block wrappers if model ignores instruction
      let cleanJson = responseContent;
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.substring(7);
      }
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.substring(3);
      }
      if (cleanJson.endsWith('```')) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
      cleanJson = cleanJson.trim();

      const parsedResult: AIAnalysisResult = JSON.parse(cleanJson);
      return parsedResult;
    } catch (error) {
      console.error('NVIDIA Minimax analysis error:', error);
      // Clean fallback if call/parse fails
      return {
        priority: 'medium',
        summary: `Incident type: ${type}. User described: "${description || 'None'}"`,
        recommendedActions: ['Establish contact with the reporter.', 'Dispatch local barangay responders for inspection.'],
        resourceNeeds: ['Standard responder crew'],
        hasImmediateHazard: false
      };
    }
  },

  /**
   * Citizen Chat Assistant to give advice on safety and first aid
   */
  getSafetyGuidance: async (
    chatHistory: { role: 'user' | 'assistant'; content: string }[],
    userLocation?: { lat: number; lng: number; address?: string } | null
  ): Promise<string> => {
    const apiKey = process.env.NVIDIA_API_KEY || DEFAULT_API_KEY;

    const locationContext = userLocation
      ? `\n\nThe user's current location coordinates are (${userLocation.lat}, ${userLocation.lng}), address: "${userLocation.address || 'Unknown'}". Use this context if they ask about location-specific safety, evacuation, or weather alerts.`
      : '';

    const systemPrompt = `You are a helpful, warm, and calm AI Safety Assistant on the EmergencyTool NET platform.
Your primary role is to give citizens instant first aid instructions, disaster preparedness tips (for typhoons, earthquakes, floods), and emergency coordination guidance in the Philippines.

Keep your tone reassuring, clear, and actionable. Write in clear, straightforward English mixed with simple Tagalog phrases (Taglish) where appropriate to sound friendly and local.
Use markdown bullets for instructions. Keep descriptions concise so they can be read quickly in stressful situations.
If a situation is an extreme emergency, remind them to immediately trigger a Panic Alert using the app's red alarm button or dial local hotlines.${locationContext}`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: msg.content
      }))
    ];

    try {
      const response = await axios.post(
        NVIDIA_INVOKE_URL,
        {
          model: 'minimaxai/minimax-m3',
          messages: apiMessages,
          max_tokens: 1500,
          temperature: 0.7,
          top_p: 0.95,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return response.data?.choices?.[0]?.message?.content || 'Pasensya na po, hindi ko ma-process ang iyong request ngayon. Mangyaring subukan muli mamaya.';
    } catch (error) {
      console.error('NVIDIA Minimax chat error:', error);
      return 'Pasensya na po, nagkaroon ng error sa pagkonekta sa network. Kung may emergency, mangyaring tawagan ang 911 o gamitin ang Panic button.';
    }
  }
};
