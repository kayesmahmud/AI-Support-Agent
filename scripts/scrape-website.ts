/**
 * Web Scraper for Knowledge Base
 *
 * Scrapes specified URLs and converts them to markdown for the knowledge base.
 *
 * Usage:
 *   npm run scrape
 */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'knowledge-base');

interface PageToScrape {
  url: string;
  filename: string;
  language: 'en' | 'bg';
}

// Configure pages to scrape
const PAGES_TO_SCRAPE: PageToScrape[] = [
  {
    url: 'https://bulgariawantsyou.com/en/about',
    filename: 'company-about-en.md',
    language: 'en',
  },
  {
    url: 'https://bulgariawantsyou.com/bg/about',
    filename: 'company-about-bg.md',
    language: 'bg',
  },
  {
    url: 'https://bulgariawantsyou.com/en/faq',
    filename: 'faq-en.md',
    language: 'en',
  },
  {
    url: 'https://bulgariawantsyou.com/bg/faq',
    filename: 'faq-bg.md',
    language: 'bg',
  },
];

/**
 * Fetch HTML content from URL
 */
async function fetchPage(url: string): Promise<string> {
  console.log(`Fetching: ${url}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  return await response.text();
}

/**
 * Clean and extract main content from HTML
 */
function extractContent(html: string, url: string): string {
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $('script, style, nav, header, footer, .menu, .navigation, .sidebar, .cookie-banner, #cookie-consent').remove();

  // Try to find main content area (common selectors)
  const contentSelectors = [
    'main',
    'article',
    '.content',
    '.main-content',
    '#content',
    '.about-content',
    '.page-content',
    'body',
  ];

  let content = '';

  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0 && element.text().trim().length > 100) {
      content = element.html() || '';
      break;
    }
  }

  if (!content) {
    // Fallback: get body content
    content = $('body').html() || '';
  }

  return content;
}

/**
 * Convert HTML to clean markdown-like text
 */
function htmlToMarkdown(html: string): string {
  const $ = cheerio.load(html);
  let markdown = '';

  // Process headings
  $('h1, h2, h3, h4, h5, h6').each((_, elem) => {
    const level = parseInt(elem.tagName.substring(1));
    const text = $(elem).text().trim();
    if (text) {
      markdown += '\n' + '#'.repeat(level) + ' ' + text + '\n\n';
    }
  });

  // Process paragraphs
  $('p').each((_, elem) => {
    const text = $(elem).text().trim();
    if (text) {
      markdown += text + '\n\n';
    }
  });

  // Process lists
  $('ul, ol').each((_, elem) => {
    $(elem).find('li').each((_, li) => {
      const text = $(li).text().trim();
      if (text) {
        markdown += '- ' + text + '\n';
      }
    });
    markdown += '\n';
  });

  // If no structured content found, extract all text
  if (markdown.trim().length < 50) {
    markdown = $('body').text()
      .replace(/\s+/g, ' ')
      .trim();
  }

  return markdown.trim();
}

/**
 * Scrape a single page and save to knowledge base
 */
async function scrapePage(page: PageToScrape): Promise<void> {
  try {
    const html = await fetchPage(page.url);
    const content = extractContent(html, page.url);
    const markdown = htmlToMarkdown(content);

    // Add metadata header
    const output = `# About Bulgaria Wants You ${page.language === 'bg' ? '(Български)' : '(English)'}

> Source: ${page.url}
> Scraped: ${new Date().toISOString().split('T')[0]}

${markdown}
`;

    const filePath = path.join(KNOWLEDGE_BASE_DIR, page.filename);
    fs.writeFileSync(filePath, output, 'utf-8');

    console.log(`✅ Saved: ${page.filename} (${markdown.length} chars)`);
  } catch (error) {
    console.error(`❌ Failed to scrape ${page.url}:`, error);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🌐 Web Scraper - Knowledge Base Builder\n');

  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    fs.mkdirSync(KNOWLEDGE_BASE_DIR, { recursive: true });
  }

  console.log(`Scraping ${PAGES_TO_SCRAPE.length} pages...\n`);

  for (const page of PAGES_TO_SCRAPE) {
    await scrapePage(page);
  }

  console.log('\n✨ Done! Check the knowledge-base/ folder.');
  console.log('Run `npm run dev` to test the AI with the new content.');
}

main().catch(console.error);
