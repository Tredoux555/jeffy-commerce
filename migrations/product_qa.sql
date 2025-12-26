-- Product Q&A System

CREATE TABLE IF NOT EXISTS product_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  question TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES product_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  answered_by TEXT DEFAULT 'Jeffy Team', -- admin or verified purchaser
  is_official BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_product ON product_questions(product_id);
CREATE INDEX IF NOT EXISTS idx_questions_approved ON product_questions(product_id) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_answers_question ON product_answers(question_id);
