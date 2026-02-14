import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { service_id, doctor_id, appointment_date, contact, source } = await req.json()
    const phoneClean = contact?.phone?.replace(/\D/g, '');

    if (!phoneClean || phoneClean.length < 10) {
      return new Response(JSON.stringify({ error: 'WhatsApp inválido.' }), { status: 400, headers: corsHeaders })
    }

    console.log(`[submit-booking-request] Processando agendamento para: ${phoneClean}`);

    // 1. Upsert do Cliente (Identificação Única por Telefone)
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .upsert({ 
        phone: phoneClean,
        name: contact.name,
        cpf: contact.cpf || null,
        email: contact.email || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'phone' })
      .select().single()

    if (clientError) throw clientError;

    // 2. Registro do Agendamento
    const { data: serviceData } = await supabaseAdmin.from('services').select('name').eq('id', service_id).single()
    
    const { data: appointment, error: appError } = await supabaseAdmin
      .from('appointments')
      .insert({
        service_id,
        client_id: client.id,
        doctor_id: doctor_id || null,
        appointment_date,
        status: 'requested',
        service: serviceData?.name || "Consulta",
        notes: { source: source || "web_portal", contact }
      })
      .select().single()

    if (appError) throw appError;

    return new Response(JSON.stringify({ ok: true, appointmentId: appointment.id }), { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error("[submit-booking-request] Erro:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
})