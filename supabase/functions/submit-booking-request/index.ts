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

    console.log("[submit-booking-request] Iniciando processamento:", { cpf: contact?.cpf });

    if (!service_id || !contact?.cpf || !contact?.name) {
      return new Response(JSON.stringify({ error: 'Dados do cliente ou serviço ausentes' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 1. Gerenciar o Cadastro do Cliente (Validando pelo CPF)
    // Tentamos encontrar o cliente ou criar um novo
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .upsert({ 
        cpf: contact.cpf,
        name: contact.name,
        phone: contact.phone,
        email: contact.email || null,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'cpf' 
      })
      .select()
      .single()

    if (clientError) {
      console.error("[submit-booking-request] Erro ao gerenciar cliente:", clientError);
      throw new Error("Falha ao registrar dados do paciente.");
    }

    // 2. Criar o Agendamento vinculado ao Cliente
    const notesPayload = {
      schema: "booking_request_v2",
      source: source || "web_portal",
      requestedAt: new Date().toISOString(),
      contact: contact,
      client_id: client.id
    }

    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert({
        service_id,
        client_id: client.id, // Vínculo direto com a tabela de clientes
        doctor_id: doctor_id || null,
        appointment_date,
        status: 'requested',
        patient_id: patient_id || null, // ID de autenticação se houver
        notes: notesPayload,
        service: "Solicitação via Portal"
      })
      .select()
      .single()

    if (appointmentError) {
      console.error("[submit-booking-request] Erro ao criar agendamento:", appointmentError);
      throw appointmentError;
    }

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