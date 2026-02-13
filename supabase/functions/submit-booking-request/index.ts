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
    // Usamos a SERVICE_ROLE_KEY para permitir que a função insira dados mesmo sem um usuário logado (walk-in)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { service_id, doctor_id, appointment_date, contact, source, patient_id } = body

    console.log("[submit-booking-request] Recebendo solicitação:", { service_id, contact });

    if (!service_id || !contact?.name || !contact?.cpf || !contact?.phone) {
      return new Response(JSON.stringify({ error: 'Dados obrigatórios ausentes' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const notesPayload = {
      schema: "booking_request_v1",
      source: source || "walk-in",
      requestedAt: new Date().toISOString(),
      contact: contact,
      ai: { status: "pending_contact" }
    }

    // Inserção na tabela appointments
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        service_id,
        doctor_id: doctor_id || null,
        appointment_date,
        status: source === 'auth' ? 'scheduled' : 'requested',
        patient_id: patient_id || null,
        notes: notesPayload,
        // Mantemos compatibilidade com a coluna 'service' se ela for obrigatória no schema
        service: "Solicitação via Portal" 
      })
      .select()
      .single()

    if (error) {
      console.error("[submit-booking-request] Erro no banco:", error);
      throw error;
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error("[submit-booking-request] Erro crítico:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})