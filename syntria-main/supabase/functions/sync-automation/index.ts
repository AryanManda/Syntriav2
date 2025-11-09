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
    const { data } = await req.json();
    const AUTOMATION_WEBHOOK_URL = Deno.env.get('AUTOMATION_WEBHOOK_URL');

    if (!AUTOMATION_WEBHOOK_URL) {
      throw new Error('AUTOMATION_WEBHOOK_URL not configured');
    }

    console.log('Sending data to automation webhook');

    const response = await fetch(AUTOMATION_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        data,
        timestamp: new Date().toISOString(),
        source: 'automation-tab'
      }),
    });

    if (!response.ok) {
      throw new Error(`Automation webhook returned ${response.status}`);
    }

    console.log('Successfully sent to automation webhook');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Data sent to your automation workflow'
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
