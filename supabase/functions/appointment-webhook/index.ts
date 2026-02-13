import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { patient_phone, patient_name, service_id, appointment_date, notes } = await req.json()

    console.log("[appointment-webhook] Recebendo agendamento via IA", { patient_phone, patient_name });

    if (!patient_phone || patient_phone.length < 10) {
      return new Response(JSON.stringify({ error: 'Telefone inválido ou ausente' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Upsert do Cliente pelo Telefone
    const { data: client, error: clientError } = await supabaseClient
      .from('clients')
      .upsert({ 
        phone: patient_phone.replace(/\D/g, ''),
        name: patient_name,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'phone' 
      })
      .select()
      .single()

    if (clientError) throw clientError;

    // 2. Inserir agendamento vinculado ao cliente
    const { data, error } = await supabaseClient
      .from('appointments')
      .insert({
        client_id: client.id,
        service_id,
        appointment_date,
        notes: { ...notes, source: 'ia_webhook' },
        status: 'scheduled' // Status definido como agendado (IA)
      })
      .select()

    if (error) throw error

    return new Response(JSON.stringify({ message: 'Agendamento criado com sucesso', data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error("[appointment-webhook] Erro ao processar webhook", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})