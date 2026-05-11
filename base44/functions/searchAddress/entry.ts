const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { query } = await req.json();
        
        if (!query || query.length < 3) {
            return Response.json({ results: [] }, { headers: corsHeaders });
        }

        // Query Nominatim API with proper headers and rate limiting respect
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=gb`;
        
        const response = await fetch(nominatimUrl, {
            headers: {
                'User-Agent': 'NucleusHealthApp/1.0 (contact@nucleus.health)',
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        
        // Check if response has error
        if (!response.ok) {
            console.error('Nominatim API error:', response.status, data);
            return Response.json({ 
                results: [],
                error: `API returned status ${response.status}` 
            }, { headers: corsHeaders });
        }

        // Format results for easy use
        const results = data.map(item => ({
            display_name: item.display_name,
            address: {
                road: item.address?.road || '',
                house_number: item.address?.house_number || '',
                city: item.address?.city || item.address?.town || item.address?.village || '',
                postcode: item.address?.postcode || '',
                country: item.address?.country || ''
            },
            lat: item.lat,
            lon: item.lon
        }));

        return Response.json({ results }, { headers: corsHeaders });

    } catch (error) {
        console.error('Address search error:', error);
        return Response.json({ 
            results: [],
            error: error.message 
        }, { headers: corsHeaders });
    }
});