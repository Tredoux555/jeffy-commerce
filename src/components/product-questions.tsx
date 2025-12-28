'use client';

import { useState } from 'react';
import { MessageCircle, Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

interface ProductQuestionsProps {
  productId: string;
  productName: string;
}

export function ProductQuestions({ productId, productName }: ProductQuestionsProps) {
  const [question, setQuestion] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !name.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      const { error: insertError } = await supabase
        .from('product_questions')
        .insert({
          product_id: productId,
          question: question.trim(),
          customer_name: name.trim(),
          customer_email: email.trim(),
          status: 'pending',
        });

      if (insertError) throw insertError;
      
      setSuccess(true);
      setQuestion('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit question');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div>
          <p className="font-medium text-green-800">Question Submitted!</p>
          <p className="text-sm text-green-600">We'll get back to you via email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-6 mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[#ff6b35] font-medium hover:underline"
      >
        <MessageCircle className="h-5 w-5" />
        Have a question about this product?
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 bg-gray-50 p-4 rounded-xl">
          <div>
            <label className="block text-sm font-medium mb-1">Your Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about size, material, shipping..."
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit Question
          </Button>
        </form>
      )}
    </div>
  );
}
