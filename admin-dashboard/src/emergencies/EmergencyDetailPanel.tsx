import { useState } from 'react';
import type { Emergency } from '../shared/types/emergency.types';
import { getEmergencyStatusMeta, getEmergencyTypeMeta } from '../shared/constants/emergencyTypes';
import emergencyService from '../services/emergencyService';

interface EmergencyDetailPanelProps {
  emergency: Emergency | null;
  onUpdateStatus?: (status: Emergency['status']) => void;
  updating?: boolean;
  onClose: () => void;
}

export const EmergencyDetailPanel: React.FC<EmergencyDetailPanelProps> = ({ emergency, onUpdateStatus, updating, onClose }) => {
  const [analyzing, setAnalyzing] = useState(false);

  if (!emergency) return null;

  const statusMeta = getEmergencyStatusMeta(emergency.status);
  const typeMeta = getEmergencyTypeMeta(emergency.type);
  const nextStatus =
    emergency.status === 'pending'
      ? 'dispatched'
      : emergency.status === 'dispatched'
        ? 'arrived'
        : null;

  const handleRunAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      await emergencyService.runAiAnalysis(emergency.id);
    } catch (error) {
      console.error('Failed to run AI analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const renderPriorityBadge = (priority: 'low' | 'medium' | 'high' | 'critical') => {
    const badges = {
      critical: { bg: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171' },
      high: { bg: 'rgba(249, 115, 22, 0.2)', border: '1px solid #f97316', color: '#fb923c' },
      medium: { bg: 'rgba(234, 179, 8, 0.2)', border: '1px solid #eab308', color: '#facc15' },
      low: { bg: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#4ade80' },
    };
    const style = badges[priority] || badges.medium;
    return (
      <span style={{ display: 'inline-block', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', ...style }}>
        {priority}
      </span>
    );
  };

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, width: '400px', height: '100vh', background: 'white', borderLeft: '1px solid #e5e7eb', padding: '1.5rem', overflowY: 'auto', zIndex: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Emergency Details</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Type</p>
          <p style={{ fontWeight: '600' }}>{emergency.typeIcon || typeMeta.icon} {emergency.typeLabel || typeMeta.label}</p>
        </div>

        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Status</p>
          <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: `${statusMeta.color}20`, color: statusMeta.color, fontWeight: '600' }}>
            {statusMeta.label.toUpperCase()}
          </span>
        </div>

        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Location</p>
          <p style={{ fontWeight: '600' }}>{emergency.location.address}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{emergency.location.lat}, {emergency.location.lng}</p>
        </div>

        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Caller</p>
          <p style={{ fontWeight: '600' }}>{emergency.caller.name}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{emergency.caller.phone}</p>
          {emergency.caller.email && <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{emergency.caller.email}</p>}
        </div>

        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Description</p>
          <p>{emergency.description}</p>
        </div>

        {/* 🤖 AI Dispatch Assistant Insights */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: 'white',
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          marginTop: '0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#60a5fa' }}>
              ⚡ AI Dispatch Insights
            </span>
            {emergency.aiAnalysis && renderPriorityBadge(emergency.aiAnalysis.priority)}
          </div>

          {emergency.aiAnalysis ? (
            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Incident Summary</p>
                <p style={{ margin: 0, lineHeight: '1.4' }}>{emergency.aiAnalysis.summary}</p>
              </div>

              {emergency.aiAnalysis.recommendedActions?.length > 0 && (
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Recommended Responder Actions</p>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.4' }}>
                    {emergency.aiAnalysis.recommendedActions.map((action: string, idx: number) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {emergency.aiAnalysis.resourceNeeds?.length > 0 && (
                <div>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Resource Recommendations</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {emergency.aiAnalysis.resourceNeeds.map((need: string, idx: number) => (
                      <span key={idx} style={{ background: '#334155', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {emergency.aiAnalysis.hasImmediateHazard && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px', color: '#fca5a5', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  ⚠️ IMMEDIATE HAZARDS DETECTED AT SCENE
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0.5rem 0 0.75rem' }}>
              No AI analysis generated yet or report is being processed.
            </p>
          )}

          <button
            onClick={handleRunAiAnalysis}
            disabled={analyzing}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: analyzing ? 'not-allowed' : 'pointer',
              marginTop: '0.75rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem'
            }}
          >
            {analyzing ? 'Analyzing Incident...' : '🔄 Recalculate AI Insights'}
          </button>
        </div>

        {/* 🚓 Geospatial Auto-Dispatch: Recommended Responders */}
        {(emergency as any).recommendedResponders && (emergency as any).recommendedResponders.length > 0 && (
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              🚓 Recommended Responders (Nearest)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(emergency as any).recommendedResponders.map((responder: any) => (
                <div key={responder.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}>
                  <div>
                    <p style={{ fontWeight: '600', margin: 0 }}>{responder.name}</p>
                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.75rem' }}>{responder.agency}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{responder.distance_km.toFixed(1)} km</p>
                    <button 
                      onClick={() => {
                        // Optional: wire up to an assign API if implemented
                        // onUpdateStatus?.('dispatched');
                      }}
                      style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', marginTop: '0.25rem', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Dispatch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Reported</p>
          <p>{new Date(emergency.createdAt).toLocaleString()}</p>
        </div>

        {emergency.photoUrl && (
          <div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Photo Evidence</p>
            <img src={emergency.photoUrl} alt={emergency.title} style={{ width: '100%', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          </div>
        )}

        {emergency.videoUrl && (
          <div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Video Evidence</p>
            <video src={emergency.videoUrl} controls style={{ width: '100%', borderRadius: '8px' }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          {nextStatus && (
            <button
              onClick={() => onUpdateStatus?.(nextStatus)}
              disabled={updating}
              style={{ flex: 1, padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: updating ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: updating ? 0.7 : 1 }}
            >
              {updating ? 'Updating...' : nextStatus === 'dispatched' ? 'Mark Dispatched' : 'Mark Arrived'}
            </button>
          )}
          {emergency.status !== 'resolved' && emergency.status !== 'cancelled' && (
            <button
              onClick={() => onUpdateStatus?.('resolved')}
              disabled={updating}
              style={{ padding: '0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: updating ? 'not-allowed' : 'pointer', opacity: updating ? 0.7 : 1 }}
            >
              ✓ Resolve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyDetailPanel;
