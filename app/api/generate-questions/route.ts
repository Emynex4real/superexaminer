import { generateObject } from "ai"
import { xai } from "@ai-sdk/xai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

const questionSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      type: z.enum(["multiple-choice", "true-false", "short-answer", "essay"]),
      options: z.array(z.string()).optional(),
      correct_answer: z.string(),
      explanation: z.string(),
      difficulty: z.enum(["easy", "medium", "hard"]),
      topic: z.string(),
    }),
  ),
})

export async function POST(request: NextRequest) {
  try {
    const {
      documentId,
      questionCount = 10,
      questionTypes = ["multiple-choice"],
      difficulty = "medium",
    } = await request.json()

    if (!documentId) {
      return new Response("Document ID is required", { status: 400 })
    }

    const supabase = await createClient()

    // Get user from session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get document content
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("title, content")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single()

    if (docError || !document) {
      return new Response("Document not found", { status: 404 })
    }

    // Generate questions using Grok
    const result = await generateObject({
      model: xai("grok-beta", {
        apiKey: process.env.XAI_API_KEY,
      }),
      schema: questionSchema,
      prompt: `Generate ${questionCount} exam questions based on the following document content. 
      
Document Title: ${document.title}
Content: ${document.content}

Requirements:
- Question types: ${questionTypes.join(", ")}
- Difficulty level: ${difficulty}
- For multiple-choice questions, provide 4 options with one correct answer
- For true-false questions, provide true/false options
- Include clear explanations for each answer
- Extract relevant topics from the content
- Ensure questions test understanding, not just memorization

Make the questions comprehensive and educational.`,
      system:
        "You are an expert educator and exam creator. Generate high-quality, educational questions that test comprehension and critical thinking.",
    })

    // Save questions to database
    const questionsToInsert = result.object.questions.map((q) => ({
      document_id: documentId,
      user_id: user.id,
      question: q.question,
      type: q.type,
      options: q.options || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      topic: q.topic,
    }))

    const { data: savedQuestions, error: saveError } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select()

    if (saveError) {
      console.error("Error saving questions:", saveError)
      return new Response("Failed to save questions", { status: 500 })
    }

    return Response.json({
      success: true,
      questions: savedQuestions,
      count: savedQuestions.length,
    })
  } catch (error) {
    console.error("Error generating questions:", error)
    return new Response("Failed to generate questions", { status: 500 })
  }
}
