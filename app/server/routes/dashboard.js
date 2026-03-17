import { Router } from 'express';
import supabase from '../services/supabase.js';

const router = Router();

/**
 * GET /api/tasks
 * Returns current tasks from task_queue
 */
router.get('/tasks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('task_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching tasks:', error);
      return res.json([]);
    }

    res.json(data || []);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.json([]);
  }
});

/**
 * GET /api/alerts
 * Returns alerts from alerts table
 */
router.get('/alerts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching alerts:', error);
      return res.json([]);
    }

    res.json(data || []);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.json([]);
  }
});

/**
 * GET /api/learnings
 * Returns family learnings
 */
router.get('/learnings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('family_learnings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching learnings:', error);
      return res.json([]);
    }

    res.json(data || []);
  } catch (err) {
    console.error('Error fetching learnings:', err);
    res.json([]);
  }
});

export default router;
