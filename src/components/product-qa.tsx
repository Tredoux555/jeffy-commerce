'use client';

import { useState } from 'react';
import { MessageCircle, Send, ThumbsUp, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface Question {
  id: string;
  question: string;
  askerName: string;
  createdAt: string;
  answer?: string;
  answeredAt?: string;
  helpful: number;
}

interface ProductQAProps {
  productId: string;
  questions: Question[];
}

export function ProductQA({ productId, questions: initialQuestions }: ProductQAProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const visibleQuestions = showAll ? questions : questions.slice(0, 3);
  const answeredQuestions = questions.filter(q => q.answer);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setLoading(true);
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('product_questions')
        .insert({
          product_id: productId,
          question: newQuestion,
          asker_name: name || 'Anonymous',
        })
        .select()
        .single();

      if (error) throw error;

      setQuestions([data, ...questions]);
      setNewQuestion('');
      setName('');
      setSuccess(true);
      setShowForm(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit question:', err);
    } finally {
      setLoading(false);
    }
  };

  const markHelpful = async (questionId: string) => {
    const supabase = createClient();
    await supabase.rpc('increment_helpful', { question_id: questionId });
    
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, helpful: q.helpful + 1 } : q
    ));
  };

  return (
    <div className="border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Questions & Answers ({answeredQuestions.length})
        </h3>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          Ask a Question
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          Your question has been submitted! We'll answer it soon.
        </div>
      )}

      {/* Question Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Your Question</label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="What would you like to know about this product?"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] resize-none"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Your Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anonymous"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Submit Question
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleQuestions.map((q) => (
            <div key={q.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-[#ff6b35] font-bold">Q:</span>
                <div className="flex-1">
                  <p className="font-medium">{q.question}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Asked by {q.askerName} • {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {q.answer ? (
                <div className="flex items-start gap-3 mt-4 pl-6 border-l-2 border-green-500">
                  <span className="text-green-600 font-bold">A:</span>
                  <div className="flex-1">
                    <p className="text-gray-700">{q.answer}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-gray-500">
                        Answered {new Date(q.answeredAt!).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => markHelpful(q.id)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#ff6b35]"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        Helpful ({q.helpful})
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2 pl-6">Awaiting answer...</p>
              )}
            </div>
          ))}

          {questions.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2 text-center text-[#ff6b35] hover:underline flex items-center justify-center gap-1"
            >
              {showAll ? (
                <>Show Less <ChevronUp className="h-4 w-4" /></>
              ) : (
                <>Show All {questions.length} Questions <ChevronDown className="h-4 w-4" /></>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
