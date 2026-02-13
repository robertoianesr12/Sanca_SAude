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

    if (!phoneClean) throw new Error("Telefone ausente.");

    // 1. Upsert do Cliente
    const { data: client } = await supabaseAdmin
      .from('clients')
      .upsert({ phone: phoneClean, name: patient_name }, { onConflict: 'phone' })
      .select().single()

    // 2. Agendamento Direto (IA)
    const { data: serviceData } = await supabaseAdmin.from('services').select('name').eq('id', service_id).single()

    const { data } = await supabaseAdmin
      .from('appointments')
      .insert({
        client_id: client.id,
        service_id,
        appointment_date,
        status: 'scheduled',
        service: serviceData?.name || "Consulta IA",
        notes: { ...notes, source: 'ia_webhook' }
      })
      .select()

    return new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: corsHeaders })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders })
  }
})