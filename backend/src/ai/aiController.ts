import type { Request, Response } from 'express';
import { aiService } from './aiService';
import { pool } from '../config/database';
import { fetchEmergencyById, emitEmergencyEvent } from '../emergency/emergencyController';

export const aiController = {
  /**
   * Conversational safety assistant endpoint for citizens.
   */
  chat: async (req: Request, res: Response) => {
    try {
      const { chatHistory, location } = req.body;

      if (!chatHistory || !Array.isArray(chatHistory)) {
        return res.status(400).json({ error: 'chatHistory is required and must be an array.' });
      }

      const responseText = await aiService.getSafetyGuidance(chatHistory, location);
      return res.json({ response: responseText });
    } catch (error) {
      console.error('AI Chat Controller Error:', error);
      return res.status(500).json({ error: 'Failed to process AI safety guidance.' });
    }
  },

  /**
   * Manually trigger re-analysis of a specific emergency report.
   */
  analyzeReport: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const report = await fetchEmergencyById(id);
      if (!report) {
        return res.status(404).json({ error: 'Emergency report not found.' });
      }

      // Call NVIDIA Minimax AI service
      console.log(`Running manual AI analysis for emergency ${id}...`);
      const analysisResult = await aiService.analyzeIncidentReport(
        report.type,
        report.description,
        report.photoUrl
      );

      // Save to database
      await pool.query(
        'UPDATE emergencies SET ai_analysis = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(analysisResult), id]
      );

      // Fetch the updated report to return and broadcast
      const updatedReport = await fetchEmergencyById(id);
      if (!updatedReport) {
        return res.status(500).json({ error: 'Failed to reload report after analysis.' });
      }

      emitEmergencyEvent(req, 'emergencyUpdate', updatedReport);
      
      return res.json(updatedReport);
    } catch (error) {
      console.error('AI Analyze Report Controller Error:', error);
      return res.status(500).json({ error: 'Failed to run AI analysis on report.' });
    }
  }
};

export default aiController;
