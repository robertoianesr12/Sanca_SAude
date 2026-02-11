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

    const { patient_email, service_id, appointment_date, notes } = await req.json()

    console.log("[appointment-webhook] Recebendo novo agendamento externo", { patient_email, service_id });

    // Buscar usuário pelo email
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', patient_email)
      .single()

    if (userError || !userData) {
      return new Response(JSON.stringify({ error: 'Paciente não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Inserir agendamento
    const { data, error } = await supabaseClient
      .from('appointments')
      .insert({
        patient_id: userData.id,
        service_id,
        appointment_date,
        notes,
        status: 'scheduled'
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