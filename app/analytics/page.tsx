import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { LearningAnalytics } from "@/components/learning-analytics"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <LearningAnalytics />
      </div>
    </div>
  )
}
