/**
 * Knowledge Base Preparation Script
 *
 * This script helps convert your existing chat logs into
 * a format suitable for training the AI support agent.
 *
 * Usage:
 *   1. Export chat logs from your support system (CSV, JSON, or TXT)
 *   2. Place them in the 'raw-data' folder
 *   3. Run: npm run prepare-kb
 */

import fs from 'fs';
import path from 'path';

const RAW_DATA_DIR = path.join(process.cwd(), 'raw-data');
const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'knowledge-base');

interface ChatMessage {
  role: 'customer' | 'agent';
  content: string;
}

interface Conversation {
  id: string;
  messages: ChatMessage[];
  category?: string;
}

/**
 * Parse CSV chat logs
 * Expected columns: conversation_id, role, message
 */
function parseCSV(content: string): Conversation[] {
  const lines = content.split('\n').filter(line => line.trim());
  const conversations: Map<string, Conversation> = new Map();

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length < 3) continue;

    const [id, role, ...messageParts] = parts;
    const message = messageParts.join(',').replace(/^"|"$/g, '').trim();

    if (!conversations.has(id)) {
      conversations.set(id, { id, messages: [] });
    }

    conversations.get(id)!.messages.push({
      role: role.toLowerCase().includes('agent') ? 'agent' : 'customer',
      content: message,
    });
  }

  return Array.from(conversations.values());
}

/**
 * Parse JSON chat logs
 * Expected format: Array of { id, messages: [{ role, content }] }
 */
function parseJSON(content: string): Conversation[] {
  const data = JSON.parse(content);

  if (Array.isArray(data)) {
    return data.map((conv, index) => ({
      id: conv.id || `conv-${index}`,
      messages: conv.messages || [],
      category: conv.category,
    }));
  }

  return [];
}

/**
 * Parse plain text chat logs
 * Expected format:
 * ---
 * Customer: message
 * Agent: message
 * ---
 */
function parseTXT(content: string): Conversation[] {
  const conversations: Conversation[] = [];
  const convBlocks = content.split('---').filter(block => block.trim());

  convBlocks.forEach((block, index) => {
    const messages: ChatMessage[] = [];
    const lines = block.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.toLowerCase().startsWith('customer:')) {
        messages.push({
          role: 'customer',
          content: line.substring(9).trim(),
        });
      } else if (line.toLowerCase().startsWith('agent:')) {
        messages.push({
          role: 'agent',
          content: line.substring(6).trim(),
        });
      }
    }

    if (messages.length > 0) {
      conversations.push({ id: `conv-${index}`, messages });
    }
  });

  return conversations;
}

/**
 * Convert conversations to markdown format for knowledge base
 */
function conversationsToMarkdown(conversations: Conversation[]): string {
  let markdown = '# Support Conversation Examples\n\n';
  markdown += 'These are real examples of how our support team handles customer inquiries.\n\n';

  conversations.forEach((conv, index) => {
    markdown += `## Example ${index + 1}\n`;

    for (const msg of conv.messages) {
      const role = msg.role === 'customer' ? 'Customer' : 'Agent';
      markdown += `${role}: ${msg.content}\n`;
    }

    markdown += '\n';
  });

  return markdown;
}

/**
 * Analyze conversations and extract common patterns
 */
function analyzeConversations(conversations: Conversation[]): string {
  const patterns: Map<string, string[]> = new Map();

  // Simple keyword extraction
  const keywords = ['refund', 'shipping', 'password', 'order', 'cancel', 'help', 'problem', 'issue'];

  for (const conv of conversations) {
    for (const msg of conv.messages) {
      const content = msg.content.toLowerCase();
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          if (!patterns.has(keyword)) {
            patterns.set(keyword, []);
          }
          // Store agent responses for this topic
          if (msg.role === 'agent') {
            patterns.get(keyword)!.push(msg.content);
          }
        }
      }
    }
  }

  let analysis = '# Common Support Topics Analysis\n\n';

  for (const [topic, responses] of patterns) {
    if (responses.length > 0) {
      analysis += `## ${topic.charAt(0).toUpperCase() + topic.slice(1)} Related\n`;
      analysis += `Found ${responses.length} responses about ${topic}.\n\n`;
      analysis += `Sample response:\n> ${responses[0]}\n\n`;
    }
  }

  return analysis;
}

/**
 * Main function
 */
async function main() {
  console.log('📚 Knowledge Base Preparation Script\n');

  // Create directories if needed
  if (!fs.existsSync(RAW_DATA_DIR)) {
    fs.mkdirSync(RAW_DATA_DIR, { recursive: true });
    console.log('Created raw-data folder. Add your chat logs there and run again.');
    console.log('\nSupported formats:');
    console.log('  - CSV: conversation_id,role,message');
    console.log('  - JSON: [{ id, messages: [{ role, content }] }]');
    console.log('  - TXT: Customer:/Agent: format separated by ---');
    return;
  }

  const files = fs.readdirSync(RAW_DATA_DIR);

  if (files.length === 0) {
    console.log('No files found in raw-data folder.');
    console.log('Add your chat logs and run again.');
    return;
  }

  let allConversations: Conversation[] = [];

  for (const file of files) {
    const filePath = path.join(RAW_DATA_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(file).toLowerCase();

    console.log(`Processing: ${file}`);

    let conversations: Conversation[] = [];

    if (ext === '.csv') {
      conversations = parseCSV(content);
    } else if (ext === '.json') {
      conversations = parseJSON(content);
    } else if (ext === '.txt') {
      conversations = parseTXT(content);
    } else {
      console.log(`  Skipping (unsupported format)`);
      continue;
    }

    console.log(`  Found ${conversations.length} conversations`);
    allConversations = allConversations.concat(conversations);
  }

  if (allConversations.length === 0) {
    console.log('\nNo conversations found. Check your file format.');
    return;
  }

  // Generate knowledge base files
  console.log(`\nProcessing ${allConversations.length} total conversations...`);

  // 1. Create conversation examples file
  const examplesMarkdown = conversationsToMarkdown(allConversations.slice(0, 50)); // First 50
  const examplesPath = path.join(KNOWLEDGE_BASE_DIR, 'examples-real-conversations.md');
  fs.writeFileSync(examplesPath, examplesMarkdown);
  console.log(`✅ Created: ${examplesPath}`);

  // 2. Create analysis file
  const analysisMarkdown = analyzeConversations(allConversations);
  const analysisPath = path.join(KNOWLEDGE_BASE_DIR, 'analysis-topics.md');
  fs.writeFileSync(analysisPath, analysisMarkdown);
  console.log(`✅ Created: ${analysisPath}`);

  console.log('\n🎉 Done! Your knowledge base has been updated.');
  console.log('Start the server with `npm run dev` to test the AI.');
}

main().catch(console.error);
