import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateImageRequest {
  prompt: string;
  imageUrl?: string;
  dataUri?: string;
  aspectRatio?: string;
  numImages?: number;
  sceneId?: string;
  userId?: string;
}

serve(async req => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body: GenerateImageRequest = await req.json();
    const { prompt, imageUrl, dataUri, aspectRatio, numImages, sceneId, userId } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Fal AI API key from environment
    const falApiKey = Deno.env.get('FAL_API_KEY');
    if (!falApiKey) {
      console.error('FAL_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine image source
    const imageUrlForFal = dataUri || imageUrl;
    if (!imageUrlForFal) {
      return new Response(JSON.stringify({ error: 'Image URL or data URI is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map aspect ratio
    const mapAspectRatio = (ratio?: string): string => {
      if (!ratio) return 'auto';
      const ratioMap: { [key: string]: string } = {
        '9:16': '9:16',
        '16:9': '16:9',
        '3:2': '3:2',
        '4:3': '4:3',
        '5:4': '5:4',
        '1:1': '1:1',
        '4:5': '4:5',
        '3:4': '3:4',
        '2:3': '2:3',
      };
      return ratioMap[ratio] || 'auto';
    };

    // Prepare request body for Fal AI
    const requestBody = {
      prompt,
      image_urls: [imageUrlForFal],
      num_images: numImages || 1,
      aspect_ratio: mapAspectRatio(aspectRatio),
      output_format: 'png',
    };

    // Call Fal AI queue API
    const baseUrl = 'https://queue.fal.run';
    const submitResponse = await fetch(`${baseUrl}/fal-ai/nano-banana/edit`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error('Fal AI submit error:', {
        status: submitResponse.status,
        statusText: submitResponse.statusText,
        error: errorText,
      });

      let errorMessage = `Fal AI request failed: ${submitResponse.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.message || errorJson.error || errorMessage;
      } catch {
        if (errorText) errorMessage = errorText;
      }

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: submitResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const submitData = await submitResponse.json();
    const requestId = submitData.request_id;
    const statusUrl = submitData.status_url;
    const responseUrl = submitData.response_url;

    if (!requestId) {
      return new Response(JSON.stringify({ error: 'Failed to get request ID from Fal AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Poll for result (simplified - client can poll status_url)
    // Return request info so client can poll
    return new Response(
      JSON.stringify({
        requestId,
        statusUrl,
        responseUrl,
        message: 'Request submitted successfully. Poll statusUrl for result.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
