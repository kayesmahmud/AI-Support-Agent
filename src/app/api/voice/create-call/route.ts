import { NextRequest, NextResponse } from 'next/server';
import { loadKnowledgeBase, buildSystemPrompt } from '@/lib/knowledge-base';

export const runtime = 'nodejs';

/**
 * POST /api/voice/create-call
 * Creates an Ultravox voice call with your knowledge base
 */
export async function POST(req: NextRequest) {
  try {
    const ultravoxApiKey = process.env.ULTRAVOX_API_KEY;

    if (!ultravoxApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'ULTRAVOX_API_KEY not configured. Get your free API key at https://app.ultravox.ai/settings/'
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { language = 'en', voice = 'terrence' } = body;

    // Load knowledge base and build system prompt
    const companyName = process.env.COMPANY_NAME || 'AI Support Agent';
    const knowledgeBase = loadKnowledgeBase();
    const systemPrompt = buildSystemPrompt(companyName, knowledgeBase);

    console.log('🎙️ Creating Ultravox call...');
    console.log('📚 Knowledge base documents:', knowledgeBase.length);
    console.log('🌐 Language:', language);
    console.log('🔊 Voice:', voice);

    // Create Ultravox call
    const ultravoxResponse = await fetch('https://api.ultravox.ai/api/calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ultravoxApiKey,
      },
      body: JSON.stringify({
        systemPrompt,
        voice,
        languageHint: language === 'bg' ? 'bg' : 'en',
        model: 'fixie-ai/ultravox-v0.7', // Latest GLM 4.6 model
        temperature: 0.7,
      }),
    });

    if (!ultravoxResponse.ok) {
      const errorText = await ultravoxResponse.text();
      console.error('❌ Ultravox API error:', errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Ultravox API error: ${ultravoxResponse.status} - ${errorText}`
        },
        { status: ultravoxResponse.status }
      );
    }

    const callData = await ultravoxResponse.json();

    console.log('✅ Ultravox call created:', callData.callId);

    return NextResponse.json({
      success: true,
      callId: callData.callId,
      joinUrl: callData.joinUrl,
      message: 'Voice call created successfully! Click the joinUrl to start.',
    });

  } catch (error: unknown) {
    console.error('❌ Error creating voice call:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create voice call'
      },
      { status: 500 }
    );
  }
}

// Enable CORS for widget
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
