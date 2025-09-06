import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const { full_name } = await request.json()

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email!,
      full_name,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      return new Response("Failed to update profile", { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error updating profile:", error)
    return new Response("Failed to update profile", { status: 500 })
  }
}
