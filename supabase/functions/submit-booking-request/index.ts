import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type BookingRequestBody = {
  service_id: string
  doctor_id?: string | null
  appointment_date: string // ISO
  requested_time?: string
  contact: {
    name: string
    cpf: string
    phone: string
  }
  source?: "auth" | "walk-in"
  patient_id?: string | null
}

function stripNonDigits(v: string) {
  return (v ?? "").replace(/\D/g, "")
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") ?? "",
        },
      },
    })

    const body = (await req.json()) as BookingRequestBody

    const service_id = (body?.service_id ?? "").trim()
    const doctor_id = (body?.doctor_id ?? null) || null
    const appointment_date_raw = (body?.appointment_date ?? "").trim()

    const contactName = (body?.contact?.name ?? "").trim()
    const cpfDigits = stripNonDigits(body?.contact?.cpf ?? "")
    const phoneDigits = stripNonDigits(body?.contact?.phone ?? "")

    if (!service_id) {
      return new Response(JSON.stringify({ error: "service_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (!contactName || cpfDigits.length !== 11 || phoneDigits.length < 10) {
      return new Response(
        JSON.stringify({
          error: "Invalid contact data",
          details: {
            name: !!contactName,
            cpfDigits: cpfDigits.length,
            phoneDigits: phoneDigits.length,
          },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const appointmentDate = new Date(appointment_date_raw)
    if (Number.isNaN(appointmentDate.getTime())) {
      return new Response(JSON.stringify({ error: "Invalid appointment_date" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user ?? null

    const source: "auth" | "walk-in" = user ? "auth" : (body?.source ?? "walk-in")

    const notesPayload = {
      schema: "booking_request_v1",
      source,
      requestedAt: new Date().toISOString(),
      requestedTime: body?.requested_time ?? null,
      contact: {
        name: contactName,
        cpf: cpfDigits,
        phone: phoneDigits,
      },
      ai: {
        status: "pending_contact",
      },
      meta: {
        userAgent: req.headers.get("user-agent"),
        timezone: "America/Sao_Paulo",
      },
    }

    const { data: inserted, error } = await supabase
      .from("appointments")
      .insert({
        service_id,
        doctor_id,
        appointment_date: appointmentDate.toISOString(),
        status: user ? "scheduled" : "requested",
        patient_id: user?.id ?? body?.patient_id ?? null,
        notes: JSON.stringify(notesPayload),
      })
      .select("id")
      .single()

    if (error) {
      console.error("[submit-booking-request] insert error", { error })
      return new Response(JSON.stringify({ error: "Database insert failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ ok: true, appointment_id: inserted?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[submit-booking-request] unhandled error", { error })
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})