'use client';

import { useState } from 'react';
import { MessageCircle, Send, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  name: string;
  question: string;
  answer?: string;
  createdAt: string;
}

interface ProductQuestionsProps {
  productId: string;
  productName: string;
}

export function ProductQuestions({ productId, productName }: ProductQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      name: 'Thabo M.',
      question: 'Is this product available in other colors?',
      answer: 'Yes! This product is available in multiple colors. Please check the variants above.',
      createdAt: '2 days ago',
    },
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const [name, setName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !name.trim()) return;

    setSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const question: Question = {
      id: Date.now().toString(),
      name: name.trim(),
      question: newQuestion.trim(),
      createdAt: 'Just now',
    };
    
    setQuestions([question, ...questions]);
    setNewQuestion('');
    setName('');
    setShowForm(false);
    setSubmitting(false);
  };

  return (
    <div className="border-t pt-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-[#ff6b35]" />
          Questions & Answers
        </h3>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          Ask a Question
        </Button>
      </div>

      {/* Question Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John D."
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Your Question</label>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder={`Ask about ${productName}...`}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Submit
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length > 0 ? (
          questions.map((q) => (
            <div key={q.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{q.name}</span>
                    <span className="text-xs text-gray-400">{q.createdAt}</span>
                  </div>
                  <p className="text-gray-700">{q.question}</p>
                  
                  {q.answer && (
                    <div className="mt-3 pl-4 border-l-2 border-[#ff6b35]">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-[#ff6b35]">Jeffy:</span> {q.answer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            No questions yet. Be the first to ask!
          </p>
        )}
      </div>
    </div>
  );
}
