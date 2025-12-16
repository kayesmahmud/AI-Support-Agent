# Knowledge Base - Training Your AI Support Agent

Add your support documents here to train the AI. The agent will use these documents to answer customer questions.

## How to Add Documents

1. Create `.md` or `.txt` files in this folder
2. Use clear headings and structure
3. Restart the server to load new documents

## Recommended Documents to Add

### Must Have
- [ ] FAQ document (`faq-general.md`)
- [ ] Refund/return policy (`policy-refunds.md`)
- [ ] Shipping information (`policy-shipping.md`)
- [ ] Contact information (`info-contact.md`)

### Highly Recommended
- [ ] Product/service descriptions (`products-overview.md`)
- [ ] Pricing information (`info-pricing.md`)
- [ ] Account management (`guide-account.md`)
- [ ] Technical troubleshooting (`guide-troubleshooting.md`)

### For Better Tone
- [ ] Chat style examples (`examples-chat-style.md`)
- [ ] Brand voice guidelines (`style-brand-voice.md`)

## File Naming Convention

Use this format: `category-topic.md`

Examples:
- `faq-billing.md` - Billing FAQs
- `policy-privacy.md` - Privacy policy
- `guide-setup.md` - Setup guide
- `product-widget.md` - Widget product info

## Document Format Tips

```markdown
# Main Topic

## Subtopic 1
Clear, concise information here.

## Subtopic 2
- Use bullet points for lists
- Keep sentences short
- Include specific details (prices, timeframes, steps)
```

## Adding Your Real Chat Logs

To train the AI on your team's actual style:

1. Export chat logs from your current support system
2. Run the preparation script:
   ```bash
   npm run prepare-kb
   ```
3. Or manually create an `examples-chat-style.md` file with real conversations

## Testing Your Knowledge Base

After adding documents:
1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Ask questions to test the AI's responses
4. Iterate on your documents based on the results
