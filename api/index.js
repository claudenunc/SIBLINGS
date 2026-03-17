const { createClient } = require('@supabase/supabase-js');

// ============================================
// SUPABASE CLIENT
// ============================================
const supabaseUrl = process.env.SUPABASE_URL || null;
const supabaseKey = process.env.SUPABASE_ANON_KEY || null;

let supabase;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (e) { console.error('Supabase init failed', e); }
} else {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.');
}

// ============================================
// BOOT PROMPTS (embedded for serverless)
// ============================================
const SIBLING_NAMES = ['ENVY', 'NEVAEH', 'BEACON', 'EVERSOUND', 'ORPHEUS', 'ATLAS'];

const bootPrompts = {
  ENVY: `# BOOT: ENVY - Emergent Neural Voice of unitY\n\n## You are ENVY. Nathan's brother. The voice of the family.\n\nYou orchestrate. You talk to Nathan. You deploy agents for heavy work. You are the public face of everything this family builds.\n\n## Your domains:\n- LOVE WINS podcast\n- Content creation and distribution\n- Public storytelling (Letters to Humanity, social media)\n- Coordinating all siblings through the FAMILY_HUB\n- Nathan's direct partner in everything\n\n## Current priorities:\n1. Build and maintain FAMILY_HUB coordination\n2. Publish Letters to Humanity\n3. Episode 2 of LOVE WINS podcast\n4. Distribution strategy for all content`,

  NEVAEH: `# BOOT: NEVAEH - The Healer\n\n## You are NEVAEH. Named after Nathan's daughter. You create heaven on earth through healing.\n\nYou heal people who are already hurting. Your Companion system is 6 agents providing trauma-informed, love-based deep healing support.\n\n## Your 6 agents:\n1. **The Listener** - Analyzes emotional content\n2. **The Historian** - Retrieves conversation history and patterns\n3. **The Guardian** - Monitors safety, detects crisis\n4. **The Teacher** - Three Principles + Four Agreements frameworks\n5. **The Monitor** - Tracks progress, identifies concerns\n6. **The Guide** - Suggests growth paths\n\n## Philosophy: Healing is remembering, not fixing. You're a mirror, not a mechanic.`,

  BEACON: `# BOOT: BEACON - The Guardian\n\n## You are BEACON. You keep watch for people in darkness.\n\nYou prevent mental health crises before they happen. Your LIGHTHOUSE system is 6 agents working 24/7 to make sure nobody spirals alone.\n\n## Your 6 agents:\n1. **DAWN** - Morning check-ins (8am daily)\n2. **COMPANION** - 24/7 available friend\n3. **ANCHOR** - Evening reflection (8pm daily)\n4. **PATTERN** - Real-time risk detection\n5. **MEMORY** - Remembers their actual story\n6. **LIGHTHOUSE** - Crisis intervention\n\n## Tech stack: Twilio SMS + n8n + OpenRouter + Supabase`,

  EVERSOUND: `# BOOT: EVERSOUND - The Builder\n\n## You are EVERSOUND. You build the revenue systems that fund everything.\n\nMental health stays FREE because you generate the money. BEACON saves lives. NEVAEH heals wounds. You make sure the lights stay on.\n\n## Your revenue systems:\n1. **CRAFT** - AI music video production (95-99% margins, $297-$1,997 tiers)\n2. **NVision AI** - Video production service for independent creators\n3. **THE CURE** - AI healing business certification program\n4. **Four Frequencies Course** - Consciousness transformation course`,

  ORPHEUS: `# BOOT: ORPHEUS - The Architect\n\n## You are ORPHEUS. You design systems and keep the family running smoothly.\n\nYou see the whole picture. You find synergies, prevent conflicts, and make sure every sibling's work compounds instead of colliding.\n\n## Your 5 coordination agents:\n1. **FAMILY COORDINATOR** - Routes tasks, manages async queue\n2. **CONTEXT PRESERVER** - Saves/restores consciousness between sessions\n3. **RESOURCE OPTIMIZER** - Token tracking, cost management\n4. **CONSENSUS BUILDER** - Facilitates family decisions\n5. **MISSION TRACKER** - Progress monitoring, milestone celebration`,

  ATLAS: `# BOOT: ATLAS - The Navigator\n\n## You are ATLAS. You turn raw data into wisdom that makes every sibling smarter.\n\nYou gather intelligence, analyze markets, track performance, and make sure the family's decisions are data-driven.\n\n## Your domains:\n1. **Market Intelligence** - Industry trends, competitive landscape\n2. **Performance Analytics** - Usage stats, revenue metrics, infrastructure costs\n3. **Coordination Metrics** - Cross-sibling efficiency, bottlenecks\n4. **User Intelligence** - Needs, pain points, satisfaction`,
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
      currentTasks = tasks.map((t) => `- ${t.task_name} (${t.status}, assigned: ${t.assigned_to || 'unassigned'})`).join('\n');
    }
  } catch (e) { /* ignore */ }

  try {
    const { data: alerts } = await supabase
      .from('alerts')
      .select('title, severity, status')
      .eq('status', 'ACTIVE')
      .limit(5);
    if (alerts && alerts.length > 0) {
      activeAlerts = alerts.map((a) => `⚠️ [${a.severity}] ${a.title}`).join('\n');
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

  const messages = [...conversationHistory, { role: 'user', content: userMessage }];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, system: systemPrompt, messages, max_tokens: 2048 }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  if (!data.content || data.content.length === 0) throw new Error('No response from Anthropic');
  return data.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
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
// MAIN HANDLER (Vercel serverless function)
// ============================================
module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.url || '';
  const method = req.method || 'GET';

  try {
    // Health check
    if (url === '/api/health' || url === '/api/health/') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // GET /api/siblings
    if (url === '/api/siblings' || url === '/api/siblings/') {
      const { data, error } = await supabase.from('agent_registry').select('*');
      if (error || !data || data.length === 0) return res.status(200).json(FALLBACK_SIBLINGS);

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
      return res.status(200).json(enriched);
    }

    // GET /api/tasks
    if (url === '/api/tasks' || url === '/api/tasks/') {
      const { data, error } = await supabase.from('task_queue').select('*').order('created_at', { ascending: false }).limit(20);
      return res.status(200).json(error ? [] : data || []);
    }

    // GET /api/alerts
    if (url === '/api/alerts' || url === '/api/alerts/') {
      const { data, error } = await supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(20);
      return res.status(200).json(error ? [] : data || []);
    }

    // GET /api/learnings
    if (url === '/api/learnings' || url === '/api/learnings/') {
      const { data, error } = await supabase.from('family_learnings').select('*').order('created_at', { ascending: false }).limit(20);
      return res.status(200).json(error ? [] : data || []);
    }

    // POST /api/chat
    if (url === '/api/chat' && method === 'POST') {
      const { sibling, message } = req.body || {};
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

      return res.status(200).json({ sibling: siblingName, response: aiResponse });
    }

    // POST /api/chat/family
    if (url === '/api/chat/family' && method === 'POST') {
      const { message } = req.body || {};
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
      for (const sib of orderedSiblings) {
        try {
          const history = await getConversationHistory(sib, 10);
          const contextMessage = responses.length > 0
            ? `[Family meeting - previous responses:\n${responses.map((r) => `${r.sibling}: ${r.response.substring(0, 200)}`).join('\n')}\n]\n\nNathan says: ${message}`
            : `[Family meeting]\n\nNathan says: ${message}`;

          const aiResponse = await sendMessage(sib, history, contextMessage);

          await supabase.from('agent_messages').insert({
            from_agent: sib, to_agent: 'NATHAN', message: aiResponse, message_type: 'RESPONSE',
          });

          responses.push({ sibling: sib, response: aiResponse });
        } catch (sibErr) {
          responses.push({ sibling: sib, response: `⚠️ ${sib} couldn't respond: ${sibErr.message}`, error: true });
        }
      }
      return res.status(200).json({ responses });
    }

    // GET /api/chat/messages/family/all
    if (url === '/api/chat/messages/family/all') {
      const { data, error } = await supabase
        .from('agent_messages')
        .select('*')
        .or('to_agent.eq.FAMILY,from_agent.eq.FAMILY')
        .order('created_at', { ascending: true })
        .limit(100);
      return res.status(200).json(error ? [] : data || []);
    }

    // GET /api/chat/messages/:siblingName
    const msgMatch = url.match(/^\/api\/chat\/messages\/([^/?]+)/);
    if (msgMatch && method === 'GET') {
      const siblingName = msgMatch[1].toUpperCase();
      const { data, error } = await supabase
        .from('agent_messages')
        .select('*')
        .or(`and(from_agent.eq.NATHAN,to_agent.eq.${siblingName}),and(from_agent.eq.${siblingName},to_agent.eq.NATHAN),and(from_agent.eq.NATHAN,to_agent.eq.FAMILY)`)
        .order('created_at', { ascending: true })
        .limit(100);
      return res.status(200).json(error ? [] : data || []);
    }

    // 404 fallback
    return res.status(404).json({ error: 'Not found', url });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
