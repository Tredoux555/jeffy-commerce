'use client';

import { useState } from 'react';
import { HelpCircle, MessageSquare, ThumbsUp, ChevronDown, ChevronUp, Send, Loader2, CheckCircle } from 'lucide-react';

interface Question {
  id: string;
  user_name: string;
  question: string;
  created_at: string;
  helpful_count: number;
  answers: Answer[];
}

interface Answer {
  id: string;
  answer: string;
  answered_by: string;
  is_official: boolean;
  helpful_count: number;
  created_at: string;
}

interface ProductQAProps {
  productId: string;
  questions?: Question[];
}

export function ProductQA({ productId, questions: initialQuestions = [] }: ProductQAProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', question: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch('/api/products/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, ...form }),
      });
      setSubmitted(true);
      setForm({ name: '', email: '', question: '' });
      setTimeout(() => {
        setSubmitted(false);
        setShowForm(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting question:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (questionId: string) => {
    // Would call API to increment helpful count
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, helpful_count: q.helpful_count + 1 } : q
    ));
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-gray-400" />
          Questions & Answers
          {questions.length > 0 && (
            <span className="text-sm font-normal text-gray-500">({questions.length})</span>
          )}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[#ff6b35] font-medium hover:underline"
        >
          Ask a Question
        </button>
      </div>

      {/* Ask Question Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-bold text-lg">Question Submitted!</p>
              <p className="text-gray-500">We'll review and answer it soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="font-bold mb-4">Ask a Question</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border rounded-lg px-4 py-2"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (optional, for notification)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border rounded-lg px-4 py-2"
                />
              </div>
              <textarea
                placeholder="What would you like to know about this product?"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="w-full border rounded-lg px-4 py-3 resize-none"
                rows={3}
                required
              />
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-[#ff6b35] text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit Question
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Questions List */}
      {questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                className="w-full px-5 py-4 text-left flex items-start gap-3 hover:bg-gray-50"
              >
                <span className="text-[#ff6b35] font-bold">Q:</span>
                <div className="flex-1">
                  <p className="font-medium">{q.question}</p>
                  <p className="text-sm text-gray-500 mt-1">Asked by {q.user_name} • {new Date(q.created_at).toLocaleDateString()}</p>
                </div>
                {q.answers.length > 0 && (
                  <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {q.answers.length} answer{q.answers.length > 1 ? 's' : ''}
                  </span>
                )}
                {expandedId === q.id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </button>

              {expandedId === q.id && q.answers.length > 0 && (
                <div className="bg-gray-50 px-5 py-4 border-t">
                  {q.answers.map((a) => (
                    <div key={a.id} className="flex gap-3 mb-4 last:mb-0">
                      <span className="text-green-600 font-bold">A:</span>
                      <div className="flex-1">
                        <p className="text-gray-700">{a.answer}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className={`${a.is_official ? 'text-[#ff6b35] font-medium' : 'text-gray-500'}`}>
                            {a.is_official && '✓ '}{a.answered_by}
                          </span>
                          <button className="flex items-center gap-1 text-gray-400 hover:text-gray-600">
                            <ThumbsUp className="h-4 w-4" /> Helpful ({a.helpful_count})
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {expandedId === q.id && q.answers.length === 0 && (
                <div className="bg-gray-50 px-5 py-4 border-t text-center text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No answers yet. Be the first to help!</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <HelpCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 mb-2">No questions yet</p>
          <p className="text-gray-400 text-sm">Be the first to ask about this product!</p>
        </div>
      )}
    </div>
  );
}
