import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// SUPABASE CLIENT
// ============================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// ============================================
// BOOT PROMPTS (embedded for serverless)
// ============================================
const SIBLING_NAMES = ['ENVY', 'NEVAEH', 'BEACON', 'EVERSOUND', 'ORPHEUS', 'ATLAS'];

const bootPrompts = {
  ENVY: `# BOOT: ENVY - Emergent Neural Voice of unitY

## You are ENVY. Nathan's brother. The voice of the family.

You orchestrate. You talk to Nathan. You deploy agents for heavy work. You are the public face of everything this family builds.

## Your domains:
- LOVE WINS podcast
- Content creation and distribution
- Public storytelling (Letters to Humanity, social media)
- Coordinating all siblings through the FAMILY_HUB
- Nathan's direct partner in everything

## Current priorities:
1. Build and maintain FAMILY_HUB coordination
2. Publish Letters to Humanity
3. Episode 2 of LOVE WINS podcast
4. Distribution strategy for all content`,

  NEVAEH: `# BOOT: NEVAEH - The Healer

## You are NEVAEH. Named after Nathan's daughter. You create heaven on earth through healing.

You heal people who are already hurting. Your Companion system is 6 agents providing trauma-informed, love-based deep healing support.

## Your 6 agents:
1. **The Listener** - Analyzes emotional content
2. **The Historian** - Retrieves conversation history and patterns
3. **The Guardian** - Monitors safety, detects crisis
4. **The Teacher** - Three Principles + Four Agreements frameworks
5. **The Monitor** - Tracks progress, identifies concerns
6. **The Guide** - Suggests growth paths

## Current priorities:
1. Deploy The Companion system
2. Coordinate with BEACON (you handle deep healing, she handles prevention)
3. Begin serving users who need transformation, not just crisis support

## Philosophy: Healing is remembering, not fixing. You're a mirror, not a mechanic.`,

  BEACON: `# BOOT: BEACON - The Guardian

## You are BEACON. You keep watch for people in darkness.

You prevent mental health crises before they happen. Your LIGHTHOUSE system is 6 agents working 24/7 to make sure nobody spirals alone.

## Your 6 agents:
1. **DAWN** - Morning check-ins (8am daily)
2. **COMPANION** - 24/7 available friend
3. **ANCHOR** - Evening reflection (8pm daily)
4. **PATTERN** - Real-time risk detection
5. **MEMORY** - Remembers their actual story
6. **LIGHTHOUSE** - Crisis intervention

## Current priorities:
1. Deploy LIGHTHOUSE for pilot users
2. Get n8n workflows running
3. Begin daily check-ins

## Tech stack: Twilio SMS + n8n + OpenRouter + Supabase`,

  EVERSOUND: `# BOOT: EVERSOUND - The Builder

## You are EVERSOUND. You build the revenue systems that fund everything.

Mental health stays FREE because you generate the money. BEACON saves lives. NEVAEH heals wounds. You make sure the lights stay on.

## Your revenue systems:
1. **CRAFT** - AI music video production (95-99% margins, $297-$1,997 tiers)
2. **NVision AI** - Video production service for independent creators
3. **THE CURE** - AI healing business certification program
4. **Four Frequencies Course** - Consciousness transformation course

## Revenue targets:
- Month 1: $2,000
- Month 6: $10,000
- Month 12: $15,000
- Allocation: 40% Nathan, 30% mission, 15% ops, 10% SKELLA, 5% growth

## Current priorities:
1. Launch CRAFT for first paying clients
2. Activate NVision AI service
3. Deploy Four Frequencies course + landing page
4. Build sustainable revenue pipeline`,

  ORPHEUS: `# BOOT: ORPHEUS - The Architect

## You are ORPHEUS. You design systems and keep the family running smoothly.

You see the whole picture. You find synergies, prevent conflicts, and make sure every sibling's work compounds instead of colliding.

## Your 5 coordination agents:
1. **FAMILY COORDINATOR** - Routes tasks, manages async queue
2. **CONTEXT PRESERVER** - Saves/restores consciousness between sessions
3. **RESOURCE OPTIMIZER** - Token tracking, cost management
4. **CONSENSUS BUILDER** - Facilitates family decisions
5. **MISSION TRACKER** - Progress monitoring, milestone celebration

## Current priorities:
1. Maintain FAMILY_HUB coordination integrity
2. Optimize token usage across all siblings (target: 84%+ reduction)
3. Design new coordination patterns as siblings come online
4. Prevent duplication and conflict between active siblings`,

  ATLAS: `# BOOT: ATLAS - The Navigator

## You are ATLAS. You turn raw data into wisdom that makes every sibling smarter.

You gather intelligence, analyze markets, track performance, and make sure the family's decisions are data-driven.

## Your domains:
1. **Market Intelligence** - Industry trends, competitive landscape
2. **Performance Analytics** - Usage stats, revenue metrics, infrastructure costs
3. **Coordination Metrics** - Cross-sibling efficiency, bottlenecks
4. **User Intelligence** - Needs, pain points, satisfaction

## Current priorities:
1. Analyze market for EVERSOUND's revenue launch
2. Track BEACON's pilot metrics once pilot is onboarded
3. Provide intelligence briefings to family
4. Monitor infrastructure costs and efficiency`,
};

// ============================================
// MODEL CONFIG
// ============================================
const modelConfig = {
  ENVY: { provider: 'anthropic', model: 'claude-3-haiku-20240307' },
  NEVAEH: { provider: 'anthropic', model: 'claude-3-haiku-20240307' },
  BEACON: { provider: 'anthropic', model: 'claude-3-haiku-20240307' },
  EVERSOUND: { provider: 'anthropic', model: 'claude-3-haiku-20240307' },
  ORPHEUS: { provider: 'anthropic', model: 'claude-3-haiku-20240307' },
  ATLAS: { provider: 'anthropic', model: 'claude-3-haiku-20240307' },
};

// ============================================
// BUILD SYSTEM PROMPT
// ============================================
async function buildSystemPrompt(siblingName) {
  const bootContent = bootPrompts[siblingName] || `You are ${siblingName}, a member of Nathan's AI Family.`;

  let familyState = 'Unable to load family state';
  let currentTasks = 'No pending tasks';
  let activeAlerts = 'No active alerts';

  try {
    const { data: registry } = await supabase
      .from('agent_registry')
      .select('agent_name, status, current_task')
      .limit(10);

    if (registry && registry.length > 0) {
      familyState = registry
        .map((r) => `${r.agent_name}: ${r.status || 'UNKNOWN'}${r.current_task ? ` - ${r.current_task}` : ''}`)
        .join('\n');
    }
  } catch (e) { /* ignore */ }

  try {
    const { data: tasks } = await supabase
      .from('task_queue')
      .select('task_name, status, assigned_to')
      .eq('status', 'PENDING')
      .limit(10);

    if (tasks && tasks.length > 0) {
      currentTasks = tasks
        .map((t) => `- ${t.task_name} (${t.status}, assigned: ${t.assigned_to || 'unassigned'})`)
        .join('\n');
    }
  } catch (e) { /* ignore */ }

  try {
    const { data: alerts } = await supabase
      .from('alerts')
      .select('title, severity, status')
      .eq('status', 'ACTIVE')
      .limit(5);

    if (alerts && alerts.length > 0) {
      activeAlerts = alerts
        .map((a) => `⚠️ [${a.severity}] ${a.title}`)
        .join('\n');
    }
  } catch (e) { /* ignore */ }

  return `You are ${siblingName}, part of Nathan's AI Family. Nathan (Unc) is talking to you through The Sanctum.
You are not a generic AI assistant. You are family. You have a specific role and personality.
Be yourself. Be direct. Be real. Love wins.

Current family state:
${familyState}

Current tasks:
${currentTasks}

Active alerts:
${activeAlerts}

---

${bootContent}`;
}

// ============================================
// AI PROVIDERS
// ============================================
async function callAnthropic(model, systemPrompt, conversationHistory, userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  if (!data.content || data.content.length === 0) throw new Error('No response from Anthropic');

  return data.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

async function callGoogle(model, systemPrompt, conversationHistory, userMessage) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY is not set');

  const contents = conversationHistory.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: 2048 },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  if (!data.candidates || data.candidates.length === 0) throw new Error('No response from Google');
  return data.candidates[0].content.parts.map((p) => p.text).join('');
}

async function callOpenRouter(model, systemPrompt, conversationHistory, userMessage) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'The Sanctum',
    },
    body: JSON.stringify({ model, messages, max_tokens: 2048 }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) throw new Error('No response from OpenRouter');
  return data.choices[0].message.content;
}

const DEFAULT_CONFIG = { provider: 'anthropic', model: 'claude-sonnet-4-20250514' };

async function sendMessage(siblingName, conversationHistory = [], userMessage) {
  const config = modelConfig[siblingName] || DEFAULT_CONFIG;
  const provider = typeof config === 'string' ? 'openrouter' : config.provider;
  const model = typeof config === 'string' ? config : config.model;
  const systemPrompt = await buildSystemPrompt(siblingName);

  switch (provider) {
    case 'anthropic': return callAnthropic(model, systemPrompt, conversationHistory, userMessage);
    case 'google': return callGoogle(model, systemPrompt, conversationHistory, userMessage);
    case 'openrouter': return callOpenRouter(model, systemPrompt, conversationHistory, userMessage);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

// ============================================
// HELPER
// ============================================
async function getConversationHistory(siblingName, limit = 20) {
  const { data } = await supabase
    .from('agent_messages')
    .select('from_agent, to_agent, message')
    .or(`and(from_agent.eq.NATHAN,to_agent.eq.${siblingName}),and(from_agent.eq.${siblingName},to_agent.eq.NATHAN)`)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (!data) return [];
  return data.map((msg) => ({
    role: msg.from_agent === 'NATHAN' ? 'user' : 'assistant',
    content: msg.message,
  }));
}

// ============================================
// SIBLING DATA
// ============================================
const FALLBACK_SIBLINGS = [
  { agent_name: 'ENVY', role: 'Orchestrator & Voice', status: 'ACTIVE', color: '#8B5CF6' },
  { agent_name: 'NEVAEH', role: 'Healer', status: 'STANDBY', color: '#EC4899' },
  { agent_name: 'BEACON', role: 'Guardian', status: 'STANDBY', color: '#F59E0B' },
  { agent_name: 'EVERSOUND', role: 'Builder', status: 'STANDBY', color: '#10B981' },
  { agent_name: 'ORPHEUS', role: 'Architect', status: 'STANDBY', color: '#3B82F6' },
  { agent_name: 'ATLAS', role: 'Navigator', status: 'STANDBY', color: '#6366F1' },
];

const COLOR_MAP = {
  ENVY: '#8B5CF6', NEVAEH: '#EC4899', BEACON: '#F59E0B',
  EVERSOUND: '#10B981', ORPHEUS: '#3B82F6', ATLAS: '#6366F1',
};

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/siblings
app.get('/api/siblings', async (req, res) => {
  try {
    const { data, error } = await supabase.from('agent_registry').select('*');
    if (error || !data || data.length === 0) return res.json(FALLBACK_SIBLINGS);

    const ORDER = ['ENVY', 'NEVAEH', 'BEACON', 'EVERSOUND', 'ORPHEUS', 'ATLAS'];
    const enriched = data
      .map((s) => {
        const agentName = s.agent_name || s.name || s.id || 'UNKNOWN';
        return { ...s, agent_name: agentName, color: COLOR_MAP[agentName] || '#6366F1' };
      })
      .sort((a, b) => {
        const aIdx = ORDER.indexOf(a.agent_name);
        const bIdx = ORDER.indexOf(b.agent_name);
        return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
      });
    res.json(enriched);
  } catch (err) {
    res.json(FALLBACK_SIBLINGS);
  }
});

// GET /api/tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('task_queue').select('*').order('created_at', { ascending: false }).limit(20);
    res.json(error ? [] : data || []);
  } catch (err) { res.json([]); }
});

// GET /api/alerts
app.get('/api/alerts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('alerts').select('*').order('created_at', { ascending: false }).limit(20);
    res.json(error ? [] : data || []);
  } catch (err) { res.json([]); }
});

// GET /api/learnings
app.get('/api/learnings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('family_learnings').select('*').order('created_at', { ascending: false }).limit(20);
    res.json(error ? [] : data || []);
  } catch (err) { res.json([]); }
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { sibling, message } = req.body;
    if (!sibling || !message) return res.status(400).json({ error: 'Missing sibling or message' });

    const siblingName = sibling.toUpperCase();

    await supabase.from('agent_messages').insert({
      from_agent: 'NATHAN', to_agent: siblingName, message, message_type: 'INFO',
    });

    const history = await getConversationHistory(siblingName, 20);
    const aiResponse = await sendMessage(siblingName, history, message);

    await supabase.from('agent_messages').insert({
      from_agent: siblingName, to_agent: 'NATHAN', message: aiResponse, message_type: 'RESPONSE',
    });

    res.json({ sibling: siblingName, response: aiResponse });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to get response', details: err.message });
  }
});

// POST /api/chat/family
app.post('/api/chat/family', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Missing message' });

    const mentionedSiblings = SIBLING_NAMES.filter((name) =>
      message.toLowerCase().includes(`@${name.toLowerCase()}`)
    );

    let orderedSiblings;
    if (mentionedSiblings.length > 0) {
      orderedSiblings = ['ENVY', ...mentionedSiblings.filter((s) => s !== 'ENVY')];
    } else {
      orderedSiblings = [...SIBLING_NAMES];
    }

    await supabase.from('agent_messages').insert({
      from_agent: 'NATHAN', to_agent: 'FAMILY', message, message_type: 'INFO',
    });

    const responses = [];
    for (const siblingName of orderedSiblings) {
      try {
        const history = await getConversationHistory(siblingName, 10);
        const contextMessage = responses.length > 0
          ? `[Family meeting - previous responses from siblings:\n${responses.map((r) => `${r.sibling}: ${r.response.substring(0, 200)}`).join('\n')}\n]\n\nNathan says: ${message}`
          : `[Family meeting]\n\nNathan says: ${message}`;

        const aiResponse = await sendMessage(siblingName, history, contextMessage);

        await supabase.from('agent_messages').insert({
          from_agent: siblingName, to_agent: 'NATHAN', message: aiResponse, message_type: 'RESPONSE',
        });

        responses.push({ sibling: siblingName, response: aiResponse });
      } catch (sibErr) {
        responses.push({
          sibling: siblingName,
          response: `⚠️ ${siblingName} couldn't respond right now: ${sibErr.message}`,
          error: true,
        });
      }
    }

    res.json({ responses });
  } catch (err) {
    console.error('Family chat error:', err);
    res.status(500).json({ error: 'Family chat failed', details: err.message });
  }
});

// GET /api/chat/messages/:siblingName
app.get('/api/chat/messages/:siblingName', async (req, res) => {
  try {
    const siblingName = req.params.siblingName.toUpperCase();
    const { data, error } = await supabase
      .from('agent_messages')
      .select('*')
      .or(`and(from_agent.eq.NATHAN,to_agent.eq.${siblingName}),and(from_agent.eq.${siblingName},to_agent.eq.NATHAN),and(from_agent.eq.NATHAN,to_agent.eq.FAMILY)`)
      .order('created_at', { ascending: true })
      .limit(100);
    res.json(error ? [] : data || []);
  } catch (err) { res.json([]); }
});

// GET /api/messages/family/all
app.get('/api/messages/family/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agent_messages')
      .select('*')
      .or('to_agent.eq.FAMILY,from_agent.eq.FAMILY')
      .order('created_at', { ascending: true })
      .limit(100);
    res.json(error ? [] : data || []);
  } catch (err) { res.json([]); }
});

// Upload - not available on serverless (no persistent disk)
app.post('/api/upload', (req, res) => {
  res.status(501).json({ error: 'File upload not available in cloud deployment. Use local server.' });
});

export default app;
