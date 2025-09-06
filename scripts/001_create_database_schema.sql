-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table for uploaded files
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Create topics table for extracted topics
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table for generated questions
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
  options JSONB, -- For multiple choice options
  correct_answer TEXT,
  explanation TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_sessions table for practice sessions
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  session_name TEXT,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE
);

-- Create quiz_responses table for individual question responses
CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN,
  time_taken INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table for user feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  feedback_type TEXT CHECK (feedback_type IN ('question_quality', 'difficulty', 'relevance', 'general')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for topics
CREATE POLICY "Users can view topics from their documents" ON public.topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = topics.document_id 
      AND documents.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert topics for their documents" ON public.topics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents 
      WHERE documents.id = topics.document_id 
      AND documents.user_id = auth.uid()
    )
  );

-- Create RLS policies for questions
CREATE POLICY "Users can view their own questions" ON public.questions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own questions" ON public.questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own questions" ON public.questions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own questions" ON public.questions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for quiz_sessions
CREATE POLICY "Users can view their own quiz sessions" ON public.quiz_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quiz sessions" ON public.quiz_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quiz sessions" ON public.quiz_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for quiz_responses
CREATE POLICY "Users can view their own quiz responses" ON public.quiz_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quiz_sessions 
      WHERE quiz_sessions.id = quiz_responses.session_id 
      AND quiz_sessions.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert their own quiz responses" ON public.quiz_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_sessions 
      WHERE quiz_sessions.id = quiz_responses.session_id 
      AND quiz_sessions.user_id = auth.uid()
    )
  );

-- Create RLS policies for feedback
CREATE POLICY "Users can view their own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON public.feedback
  FOR UPDATE USING (auth.uid() = user_id);
