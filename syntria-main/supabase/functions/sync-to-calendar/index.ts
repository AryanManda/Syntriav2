import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strategyData } = await req.json();
    const STRATEGY_WEBHOOK_URL = Deno.env.get('STRATEGY_WEBHOOK_URL');

    if (!STRATEGY_WEBHOOK_URL) {
      throw new Error('STRATEGY_WEBHOOK_URL not configured');
    }

    console.log('Sending strategy data to n8n webhook');

    // Extract deliverables and dates from strategy
    const events: Array<{ title: string; date: string; description: string }> = [];
    
    // Extract from PRD if it contains dates
    if (strategyData?.prd) {
      const dateRegex = /(\d{4}-\d{2}-\d{2})/g;
      const dates = strategyData.prd.match(dateRegex) || [];
      
      // Create events from deliverables
      if (strategyData.successMetrics) {
        strategyData.successMetrics.forEach((metric: string, idx: number) => {
          events.push({
            title: metric,
            date: dates[idx] || new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: 'Product strategy deliverable'
          });
        });
      }
    }

    // Send to n8n
    const response = await fetch(STRATEGY_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events, strategyData }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook returned ${response.status}`);
    }

    console.log('Successfully sent to n8n');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Events sent to your n8n workflow',
        eventsCount: events.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
