import { Router } from 'express';
import supabase from '../services/supabase.js';

const router = Router();

// Fallback sibling data if agent_registry is empty
const FALLBACK_SIBLINGS = [
  { agent_name: 'ENVY', role: 'Orchestrator & Voice', status: 'ACTIVE', color: '#8B5CF6' },
  { agent_name: 'NEVAEH', role: 'Healer', status: 'STANDBY', color: '#EC4899' },
  { agent_name: 'BEACON', role: 'Guardian', status: 'STANDBY', color: '#F59E0B' },
  { agent_name: 'EVERSOUND', role: 'Builder', status: 'STANDBY', color: '#10B981' },
  { agent_name: 'ORPHEUS', role: 'Architect', status: 'STANDBY', color: '#3B82F6' },
  { agent_name: 'ATLAS', role: 'Navigator', status: 'STANDBY', color: '#6366F1' },
];

const COLOR_MAP = {
  ENVY: '#8B5CF6',
  NEVAEH: '#EC4899',
  BEACON: '#F59E0B',
  EVERSOUND: '#10B981',
  ORPHEUS: '#3B82F6',
  ATLAS: '#6366F1',
};

/**
 * GET /api/siblings
 * Returns all sibling profiles from agent_registry
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agent_registry')
      .select('*');

    if (error) {
      console.error('Supabase error fetching siblings:', error);
      return res.json(FALLBACK_SIBLINGS);
    }

    if (!data || data.length === 0) {
      return res.json(FALLBACK_SIBLINGS);
    }

    // Canonical order
    const ORDER = ['ENVY', 'NEVAEH', 'BEACON', 'EVERSOUND', 'ORPHEUS', 'ATLAS'];

    // Enrich with colors and normalize agent_name
    const enriched = data
      .map((s) => {
        const agentName = s.agent_name || s.name || s.id || 'UNKNOWN';
        return {
          ...s,
          agent_name: agentName,
          color: COLOR_MAP[agentName] || '#6366F1',
        };
      })
      .sort((a, b) => {
        const aIdx = ORDER.indexOf(a.agent_name);
        const bIdx = ORDER.indexOf(b.agent_name);
        return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
      });

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching siblings:', err);
    res.json(FALLBACK_SIBLINGS);
  }
});

export default router;
