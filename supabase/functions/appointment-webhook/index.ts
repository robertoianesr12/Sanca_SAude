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

    const { patient_phone, patient_name, service_id, appointment_date, notes } = await req.json()
    const phoneClean = patient_phone?.replace(/\D/g, '');

    if (!phoneClean) {
      return new Response(JSON.stringify({ error: "Telefone é obrigatório." }), { status: 400, headers: corsHeaders })
    }

    console.log(`[appointment-webhook] Processando agendamento para: ${phoneClean}`);

    // 1. Upsert do Cliente usando o Telefone como chave única
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .upsert({ 
        phone: phoneClean, 
        name: patient_name,
        updated_at: new Date().toISOString()
      }, { onConflict: 'phone' })
      .select().single()

    if (clientError) throw clientError;

    // 2. Busca o nome do serviço para histórico
    const { data: serviceData } = await supabaseAdmin.from('services').select('name').eq('id', service_id).single()

    // 3. Cria o agendamento com status 'scheduled' (Confirmado pela IA)
    const { data: appointment, error: appError } = await supabaseAdmin
      .from('appointments')
      .insert({
        client_id: client.id,
        service_id,
        appointment_date,
        status: 'scheduled',
        service: serviceData?.name || "Consulta IA",
        notes: { ...notes, source: 'ia_webhook' }
      })
      .select().single()

    if (appError) throw appError;

    return new Response(JSON.stringify({ ok: true, appointmentId: appointment.id }), { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error("[appointment-webhook] Erro:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  }
})