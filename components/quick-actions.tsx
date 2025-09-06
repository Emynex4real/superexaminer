"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Brain, TrendingUp, Zap, BookOpen } from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
  hasDocuments: boolean
  hasQuestions: boolean
}

export function QuickActions({ hasDocuments, hasQuestions }: QuickActionsProps) {
  const actions = [
    {
      title: "Upload Document",
      description: "Add new study materials",
      icon: Upload,
      href: "/upload",
      variant: "default" as const,
      enabled: true,
    },
    {
      title: "Generate Questions",
      description: "Create AI-powered questions",
      icon: Brain,
      href: "/generate",
      variant: "default" as const,
      enabled: hasDocuments,
    },
    {
      title: "Practice Quiz",
      description: "Test your knowledge",
      icon: Zap,
      href: "/quiz",
      variant: "outline" as const,
      enabled: hasQuestions,
    },
    {
      title: "View Analytics",
      description: "Track your progress",
      icon: TrendingUp,
      href: "/analytics",
      variant: "outline" as const,
      enabled: hasQuestions,
    },
    {
      title: "Browse Documents",
      description: "Manage your files",
      icon: BookOpen,
      href: "/documents",
      variant: "outline" as const,
      enabled: hasDocuments,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>Jump into your most common tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.title}
                asChild
                variant={action.variant}
                className="h-auto p-4 flex-col items-start space-y-2"
                disabled={!action.enabled}
              >
                <Link href={action.enabled ? action.href : "#"}>
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{action.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">{action.description}</p>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
