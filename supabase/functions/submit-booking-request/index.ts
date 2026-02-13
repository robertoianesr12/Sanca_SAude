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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { service_id, doctor_id, appointment_date, contact, source, patient_id } = body

    const phoneClean = contact?.phone?.replace(/\D/g, '');

    console.log("[submit-booking-request] Processando via Portal", { phone: phoneClean });

    if (!phoneClean || phoneClean.length < 10) {
      return new Response(JSON.stringify({ error: 'Telefone (WhatsApp) é obrigatório para identificação.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Buscar o nome do serviço
    const { data: serviceData } = await supabaseAdmin
      .from('services')
      .select('name')
      .eq('id', service_id)
      .single()

    const serviceName = serviceData?.name || "Consulta";

    // 2. Upsert do Cliente pelo Telefone (CPF é complementar)
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .upsert({ 
        phone: phoneClean,
        name: contact.name,
        cpf: contact.cpf || null, // CPF agora é opcional/complementar
        email: contact.email || null,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'phone' 
      })
      .select()
      .single()

    if (clientError) throw clientError;

    // 3. Criar o Agendamento
    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert({
        service_id,
        client_id: client.id,
        doctor_id: doctor_id || null,
        appointment_date,
        status: 'requested',
        patient_id: patient_id || null,
        service: serviceName,
        notes: { source: source || "web_portal", contact }
      })
      .select()
      .single()

    if (appointmentError) throw appointmentError;

    return new Response(JSON.stringify({ ok: true, appointmentId: appointment.id }), {
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