import dotenv from 'dotenv';
dotenv.config();

import { sendMessage } from './server/services/openrouter.js';

async function test() {
  try {
    console.log('Testing sendMessage with Anthropic...');
    const result = await sendMessage('ENVY', [], 'Hello Envy!');
    console.log('✅ Success! Response:\n', result);
  } catch (err) {
    console.error('❌ Failed! Error:\n', err.message);
  }
}

test();
