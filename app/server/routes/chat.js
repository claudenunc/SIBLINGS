import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import supabase from '../services/supabase.js';
import { sendMessage } from '../services/openrouter.js';
import { SIBLING_NAMES } from '../services/prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

const router = Router();

// Image extensions that Claude vision supports
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function isImage(filename) {
  return IMAGE_EXTS.includes(path.extname(filename).toLowerCase());
}

/**
 * Build user content with optional attachments
 * For images: sends as base64 vision content
 * For other files: reads text and appends to message
 */
function buildUserContent(message, attachments = []) {
  if (!attachments || attachments.length === 0) return message;

  const contentBlocks = [];

  for (const att of attachments) {
    const filePath = path.join(UPLOADS_DIR, att.filename);
    if (!fs.existsSync(filePath)) continue;

    if (isImage(att.filename)) {
      const base64 = fs.readFileSync(filePath).toString('base64');
      const ext = path.extname(att.filename).toLowerCase().replace('.', '');
      const mediaType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      contentBlocks.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64 },
      });
    } else {
      try {
        const text = fs.readFileSync(filePath, 'utf-8');
        contentBlocks.push({
          type: 'text',
          text: `[Attached file: ${att.originalName}]\n${text}`,
        });
      } catch {
        contentBlocks.push({
          type: 'text',
          text: `[Attached file: ${att.originalName} - binary file, cannot read as text]`,
        });
      }
    }
  }

  contentBlocks.push({ type: 'text', text: message });
  return contentBlocks;
}

/**
 * POST /api/chat
 * Send a message to a specific sibling
 * Body: { sibling: 'ENVY', message: 'Hello brother', attachments: [{filename, originalName}] }
 */
router.post('/', async (req, res) => {
  try {
    const { sibling, message, attachments } = req.body;

    if (!sibling || !message) {
      return res.status(400).json({ error: 'Missing sibling or message' });
    }

    const siblingName = sibling.toUpperCase();

    // Build display message for storage (include attachment names)
    const attNames = (attachments || []).map((a) => a.originalName).join(', ');
    const storedMessage = attNames ? `${message}\n[Attachments: ${attNames}]` : message;

    // Store Nathan's message
    await supabase.from('agent_messages').insert({
      from_agent: 'NATHAN',
      to_agent: siblingName,
      message: storedMessage,
      message_type: 'INFO',
    });

    // Get conversation history
    const history = await getConversationHistory(siblingName, 20);

    // Build content with attachments (images as vision, files as text)
    const userContent = buildUserContent(message, attachments);

    // Call AI
    const aiResponse = await sendMessage(siblingName, history, userContent);

    // Store AI response
    await supabase.from('agent_messages').insert({
      from_agent: siblingName,
      to_agent: 'NATHAN',
      message: aiResponse,
      message_type: 'RESPONSE',
    });

    res.json({
      sibling: siblingName,
      response: aiResponse,
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({
      error: 'Failed to get response',
      details: err.message,
    });
  }
});

/**
 * POST /api/chat/family
 * Send a message to ALL siblings (group chat / family meeting)
 * Body: { message: 'Family meeting time' }
 */
router.post('/family', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    // Check for @mentions to prioritize specific siblings
    const mentionedSiblings = SIBLING_NAMES.filter((name) =>
      message.toLowerCase().includes(`@${name.toLowerCase()}`)
    );

    // Order: ENVY first (orchestrator), then mentioned siblings, then rest
    let orderedSiblings;
    if (mentionedSiblings.length > 0) {
      // Put ENVY first, then mentioned ones, then skip the rest
      orderedSiblings = ['ENVY', ...mentionedSiblings.filter((s) => s !== 'ENVY')];
    } else {
      orderedSiblings = [...SIBLING_NAMES]; // ENVY is already first in the array
    }

    // Store Nathan's message to FAMILY
    await supabase.from('agent_messages').insert({
      from_agent: 'NATHAN',
      to_agent: 'FAMILY',
      message: message,
      message_type: 'INFO',
    });

    const responses = [];

    // Call each sibling sequentially (ENVY first as orchestrator)
    for (const siblingName of orderedSiblings) {
      try {
        const familyContext =
          mentionedSiblings.length > 0 && !mentionedSiblings.includes(siblingName)
            ? ''
            : '';
        const history = await getConversationHistory(siblingName, 10);
        const contextMessage =
          responses.length > 0
            ? `[Family meeting - previous responses from siblings:\n${responses.map((r) => `${r.sibling}: ${r.response.substring(0, 200)}`).join('\n')}\n]\n\nNathan says: ${message}`
            : `[Family meeting]\n\nNathan says: ${message}`;

        const aiResponse = await sendMessage(siblingName, history, contextMessage);

        // Store response
        await supabase.from('agent_messages').insert({
          from_agent: siblingName,
          to_agent: 'NATHAN',
          message: aiResponse,
          message_type: 'RESPONSE',
        });

        responses.push({
          sibling: siblingName,
          response: aiResponse,
        });
      } catch (sibErr) {
        console.error(`Error getting response from ${siblingName}:`, sibErr.message);
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
    res.status(500).json({
      error: 'Family chat failed',
      details: err.message,
    });
  }
});

/**
 * GET /api/messages/:siblingName
 * Get conversation history with a sibling
 */
router.get('/messages/:siblingName', async (req, res) => {
  try {
    const siblingName = req.params.siblingName.toUpperCase();

    const { data, error } = await supabase
      .from('agent_messages')
      .select('*')
      .or(
        `and(from_agent.eq.NATHAN,to_agent.eq.${siblingName}),and(from_agent.eq.${siblingName},to_agent.eq.NATHAN),and(from_agent.eq.NATHAN,to_agent.eq.FAMILY)`
      )
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching messages:', error);
      return res.json([]);
    }

    res.json(data || []);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.json([]);
  }
});

/**
 * GET /api/messages/family/all
 * Get family chat history
 */
router.get('/messages/family/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agent_messages')
      .select('*')
      .or('to_agent.eq.FAMILY,from_agent.eq.FAMILY')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching family messages:', error);
      return res.json([]);
    }

    res.json(data || []);
  } catch (err) {
    console.error('Error fetching family messages:', err);
    res.json([]);
  }
});

/**
 * Helper: get conversation history formatted for OpenRouter
 */
async function getConversationHistory(siblingName, limit = 20) {
  const { data } = await supabase
    .from('agent_messages')
    .select('from_agent, to_agent, message')
    .or(
      `and(from_agent.eq.NATHAN,to_agent.eq.${siblingName}),and(from_agent.eq.${siblingName},to_agent.eq.NATHAN)`
    )
    .order('created_at', { ascending: true })
    .limit(limit);

  if (!data) return [];

  return data.map((msg) => ({
    role: msg.from_agent === 'NATHAN' ? 'user' : 'assistant',
    content: msg.message,
  }));
}

export default router;
