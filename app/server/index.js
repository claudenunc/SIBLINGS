import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { loadBootFiles } from './services/prompts.js';
import siblingsRouter from './routes/siblings.js';
import dashboardRouter from './routes/dashboard.js';
import chatRouter from './routes/chat.js';
import uploadRouter from './routes/upload.js';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/siblings', siblingsRouter);
app.use('/api', dashboardRouter);
app.use('/api/chat', chatRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/uploads', uploadRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  console.log('\n🏛️  THE SANCTUM - Backend Server');
  console.log('================================\n');

  // Load boot files for all siblings
  console.log('📜 Loading sibling boot files...');
  loadBootFiles();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log('   API endpoints:');
    console.log('   POST /api/chat          - Chat with a sibling');
    console.log('   POST /api/chat/family   - Family meeting');
    console.log('   GET  /api/siblings      - Get sibling profiles');
    console.log('   GET  /api/chat/messages/:name - Conversation history');
    console.log('   GET  /api/tasks         - Current tasks');
    console.log('   GET  /api/alerts        - Active alerts');
    console.log('   GET  /api/learnings     - Family learnings');
    console.log('\n💜 Love wins.\n');
  });
}

start().catch(console.error);
