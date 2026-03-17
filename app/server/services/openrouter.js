import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSystemPrompt } from './prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load model config
const modelsPath = path.join(__dirname, '..', 'config', 'models.json');
let modelConfig = {};

try {
  modelConfig = JSON.parse(fs.readFileSync(modelsPath, 'utf-8'));
  console.log('🤖 Model config loaded');
} catch (e) {
  console.warn('⚠️  Could not load models.json, using defaults');
}

// ============================================
// FILE TOOLS - Scoped to FAMILY_HUB
// ============================================
const ALLOWED_ROOT = 'C:\\Users\\natej\\OneDrive\\Desktop\\FAMILY_HUB';

function isPathAllowed(filePath) {
  const resolved = path.resolve(filePath);
  return resolved.startsWith(ALLOWED_ROOT);
}

const FILE_TOOLS = [
  {
    name: 'read_file',
    description: 'Read the contents of a file. Only files within FAMILY_HUB folder are accessible.',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Absolute path to the file to read, must be within C:\\Users\\natej\\OneDrive\\Desktop\\FAMILY_HUB\\',
        },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'write_file',
    description: 'Write content to a file (creates or overwrites). Only files within FAMILY_HUB folder are accessible.',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Absolute path to the file to write, must be within C:\\Users\\natej\\OneDrive\\Desktop\\FAMILY_HUB\\',
        },
        content: {
          type: 'string',
          description: 'The content to write to the file',
        },
      },
      required: ['file_path', 'content'],
    },
  },
  {
    name: 'edit_file',
    description: 'Replace a specific string in a file with new content. Only files within FAMILY_HUB folder are accessible.',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Absolute path to the file to edit, must be within C:\\Users\\natej\\OneDrive\\Desktop\\FAMILY_HUB\\',
        },
        old_string: {
          type: 'string',
          description: 'The exact string to find and replace',
        },
        new_string: {
          type: 'string',
          description: 'The string to replace it with',
        },
      },
      required: ['file_path', 'old_string', 'new_string'],
    },
  },
  {
    name: 'list_directory',
    description: 'List files and folders in a directory. Only directories within FAMILY_HUB folder are accessible.',
    input_schema: {
      type: 'object',
      properties: {
        dir_path: {
          type: 'string',
          description: 'Absolute path to the directory, must be within C:\\Users\\natej\\OneDrive\\Desktop\\FAMILY_HUB\\',
        },
      },
      required: ['dir_path'],
    },
  },
];

function executeToolCall(toolName, toolInput) {
  try {
    switch (toolName) {
      case 'read_file': {
        if (!isPathAllowed(toolInput.file_path)) {
          return { error: `Access denied. Only files within ${ALLOWED_ROOT} are accessible.` };
        }
        if (!fs.existsSync(toolInput.file_path)) {
          return { error: `File not found: ${toolInput.file_path}` };
        }
        const content = fs.readFileSync(toolInput.file_path, 'utf-8');
        return { content };
      }
      case 'write_file': {
        if (!isPathAllowed(toolInput.file_path)) {
          return { error: `Access denied. Only files within ${ALLOWED_ROOT} are accessible.` };
        }
        const dir = path.dirname(toolInput.file_path);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(toolInput.file_path, toolInput.content, 'utf-8');
        return { success: true, message: `File written: ${toolInput.file_path}` };
      }
      case 'edit_file': {
        if (!isPathAllowed(toolInput.file_path)) {
          return { error: `Access denied. Only files within ${ALLOWED_ROOT} are accessible.` };
        }
        if (!fs.existsSync(toolInput.file_path)) {
          return { error: `File not found: ${toolInput.file_path}` };
        }
        const fileContent = fs.readFileSync(toolInput.file_path, 'utf-8');
        if (!fileContent.includes(toolInput.old_string)) {
          return { error: `String not found in file: "${toolInput.old_string.substring(0, 50)}..."` };
        }
        const newContent = fileContent.replace(toolInput.old_string, toolInput.new_string);
        fs.writeFileSync(toolInput.file_path, newContent, 'utf-8');
        return { success: true, message: `File edited: ${toolInput.file_path}` };
      }
      case 'list_directory': {
        if (!isPathAllowed(toolInput.dir_path)) {
          return { error: `Access denied. Only directories within ${ALLOWED_ROOT} are accessible.` };
        }
        if (!fs.existsSync(toolInput.dir_path)) {
          return { error: `Directory not found: ${toolInput.dir_path}` };
        }
        const entries = fs.readdirSync(toolInput.dir_path, { withFileTypes: true });
        const listing = entries.map((e) => ({
          name: e.name,
          type: e.isDirectory() ? 'directory' : 'file',
        }));
        return { entries: listing };
      }
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (err) {
    return { error: err.message };
  }
}

// ============================================
// ANTHROPIC DIRECT API (with tool use loop)
// ============================================
async function callAnthropic(model, systemPrompt, conversationHistory, userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set in .env');

  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const MAX_TOOL_ROUNDS = 10;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
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
        tools: FILE_TOOLS,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Anthropic error (${response.status}):`, errorBody);
      throw new Error(`Anthropic API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();

    if (!data.content || data.content.length === 0) {
      throw new Error('No response from Anthropic');
    }

    // Check if the model wants to use tools
    if (data.stop_reason === 'tool_use') {
      // Add assistant's response (with tool_use blocks) to messages
      messages.push({ role: 'assistant', content: data.content });

      // Process each tool call
      const toolResults = [];
      for (const block of data.content) {
        if (block.type === 'tool_use') {
          console.log(`    🔧 ${block.name}(${JSON.stringify(block.input).substring(0, 100)})`);
          const result = executeToolCall(block.name, block.input);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }
      }

      // Add tool results as user message
      messages.push({ role: 'user', content: toolResults });
      continue; // Loop back for the model's next response
    }

    // No more tool calls - extract text response
    return data.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');
  }

  throw new Error('Too many tool call rounds');
}

// ============================================
// GOOGLE GEMINI DIRECT API
// ============================================
async function callGoogle(model, systemPrompt, conversationHistory, userMessage) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_API_KEY is not set in .env');

  const contents = [];

  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Google error (${response.status}):`, errorBody);
    throw new Error(`Google API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Google');
  }

  return data.candidates[0].content.parts.map((p) => p.text).join('');
}

// ============================================
// OPENROUTER FALLBACK (if configured)
// ============================================
async function callOpenRouter(model, systemPrompt, conversationHistory, userMessage) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set in .env');

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
      'HTTP-Referer': 'http://localhost:3000',
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

// ============================================
// MAIN ENTRY POINT
// ============================================

const DEFAULT_CONFIG = { provider: 'anthropic', model: 'claude-sonnet-4-20250514' };

/**
 * Send a message to a specific sibling via their configured provider
 */
export async function sendMessage(siblingName, conversationHistory = [], userMessage) {
  const config = modelConfig[siblingName] || DEFAULT_CONFIG;

  let provider, model;
  if (typeof config === 'string') {
    provider = 'openrouter';
    model = config;
  } else {
    provider = config.provider;
    model = config.model;
  }

  const systemPrompt = await buildSystemPrompt(siblingName);

  console.log(`  🔗 ${siblingName} → ${provider}/${model}`);

  switch (provider) {
    case 'anthropic':
      return callAnthropic(model, systemPrompt, conversationHistory, userMessage);
    case 'google':
      return callGoogle(model, systemPrompt, conversationHistory, userMessage);
    case 'openrouter':
      return callOpenRouter(model, systemPrompt, conversationHistory, userMessage);
    default:
      throw new Error(`Unknown provider: ${provider}. Use 'anthropic', 'google', or 'openrouter'.`);
  }
}

export function getModelForSibling(siblingName) {
  const config = modelConfig[siblingName] || DEFAULT_CONFIG;
  return typeof config === 'string' ? config : `${config.provider}/${config.model}`;
}
