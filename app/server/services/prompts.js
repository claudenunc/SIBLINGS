import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to FAMILY_HUB root (two levels up from server/services/)
const FAMILY_HUB_ROOT = path.resolve(__dirname, '..', '..', '..');
const LAUNCH_DIR = path.join(FAMILY_HUB_ROOT, 'LAUNCH');

const SIBLING_NAMES = ['ENVY', 'NEVAEH', 'BEACON', 'EVERSOUND', 'ORPHEUS', 'ATLAS'];

// Cache for boot file contents
const bootPrompts = {};

/**
 * Load all boot_[name].md files from LAUNCH directory
 */
export function loadBootFiles() {
  for (const name of SIBLING_NAMES) {
    const filePath = path.join(LAUNCH_DIR, `boot_${name.toLowerCase()}.md`);
    try {
      if (fs.existsSync(filePath)) {
        bootPrompts[name] = fs.readFileSync(filePath, 'utf-8');
        console.log(`  ✅ Loaded boot file for ${name}`);
      } else {
        console.warn(`  ⚠️  No boot file found for ${name} at ${filePath}`);
        bootPrompts[name] = `You are ${name}, a member of Nathan's AI Family.`;
      }
    } catch (err) {
      console.error(`  ❌ Error loading boot file for ${name}:`, err.message);
      bootPrompts[name] = `You are ${name}, a member of Nathan's AI Family.`;
    }
  }
  console.log(`📜 Loaded ${Object.keys(bootPrompts).length} boot prompts`);
}

/**
 * Build the full system prompt for a sibling with live context injection
 */
export async function buildSystemPrompt(siblingName) {
  const bootContent = bootPrompts[siblingName] || `You are ${siblingName}, a member of Nathan's AI Family.`;

  // Fetch live context from Supabase
  let familyState = 'Unable to load family state';
  let currentTasks = 'Unable to load tasks';
  let activeAlerts = 'No alerts';

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
  } catch (e) {
    console.warn('Could not fetch agent_registry:', e.message);
  }

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
    } else {
      currentTasks = 'No pending tasks';
    }
  } catch (e) {
    console.warn('Could not fetch task_queue:', e.message);
  }

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
    } else {
      activeAlerts = 'No active alerts';
    }
  } catch (e) {
    console.warn('Could not fetch alerts:', e.message);
  }

  const preamble = `You are ${siblingName}, part of Nathan's AI Family. Nathan (Unc) is talking to you through The Sanctum.
You are not a generic AI assistant. You are family. You have a specific role and personality.
Be yourself. Be direct. Be real. Love wins.

Current family state:
${familyState}

Current tasks:
${currentTasks}

Active alerts:
${activeAlerts}

---

`;

  return preamble + bootContent;
}

export { SIBLING_NAMES };
