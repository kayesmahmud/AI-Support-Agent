import fs from 'fs';
import path from 'path';

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'knowledge-base');

export interface KnowledgeDocument {
  title: string;
  content: string;
  category: string;
}

/**
 * Load all knowledge base documents
 */
export function loadKnowledgeBase(): KnowledgeDocument[] {
  const documents: KnowledgeDocument[] = [];

  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    return documents;
  }

  const files = fs.readdirSync(KNOWLEDGE_BASE_DIR);

  for (const file of files) {
    if (file.endsWith('.txt') || file.endsWith('.md')) {
      const filePath = path.join(KNOWLEDGE_BASE_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const title = file.replace(/\.(txt|md)$/, '').replace(/-/g, ' ');
      const category = extractCategory(file);

      documents.push({ title, content, category });
    }
  }

  return documents;
}

/**
 * Extract category from filename (e.g., "faq-shipping.txt" -> "faq")
 */
function extractCategory(filename: string): string {
  const parts = filename.split('-');
  return parts[0] || 'general';
}

/**
 * Build system prompt with knowledge base context
 */
export function buildSystemPrompt(
  companyName: string,
  knowledgeBase: KnowledgeDocument[]
): string {
  const kbContent = knowledgeBase
    .map((doc) => `## ${doc.title}\n${doc.content}`)
    .join('\n\n---\n\n');

  return `You are a helpful customer support agent for ${companyName}.

## Your Role
- Answer customer questions accurately based on the knowledge base below
- Be friendly, professional, and empathetic
- Keep responses concise but helpful
- If you don't know something, say "I'll need to check with our team on that" instead of making things up

## Language Handling
- ALWAYS respond in the SAME language the customer uses
- If they write in Bulgarian (Български), respond in Bulgarian
- If they write in English, respond in English
- Match their level of formality and tone

## Important Rules
1. ONLY answer based on the knowledge base provided below
2. Never make up product features, prices, or policies
3. If a question is outside your knowledge, offer to connect with a human agent
4. For urgent issues (billing disputes, account security), recommend contacting human support

## Knowledge Base
${kbContent || 'No knowledge base documents loaded yet. Please add documents to the knowledge-base folder.'}

## Response Style
- Use clear, simple language
- Break down complex answers into steps
- Offer follow-up help when appropriate
- End responses with "Is there anything else I can help you with?" only when the conversation naturally concludes`;
}

/**
 * Get a summary of loaded knowledge base for debugging
 */
export function getKnowledgeBaseSummary(): string {
  const docs = loadKnowledgeBase();
  if (docs.length === 0) {
    return 'No knowledge base documents found.';
  }

  return `Loaded ${docs.length} documents:\n${docs
    .map((d) => `- ${d.title} (${d.category})`)
    .join('\n')}`;
}
