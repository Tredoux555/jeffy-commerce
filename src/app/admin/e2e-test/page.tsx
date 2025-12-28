'use client';

import { useState } from 'react';
import { 
  FlaskConical, Play, CheckCircle, XCircle, Clock, 
  Loader2, ChevronDown, ChevronRight, AlertCircle,
  Copy, Check, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TestStep {
  name: string;
  category: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  data?: any;
}

interface TestResult {
  id: string;
  name: string;
  startedAt: string;
  completedAt: string;
  duration: number;
  status: 'passed' | 'failed' | 'partial';
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    byCategory: Record<string, { passed: number; failed: number; total: number }>;
  };
  steps: TestStep[];
  cleanup: { success: boolean; deleted: string[]; errors: string[] };
}

const TEST_TYPES = [
  { id: 'schema', name: 'Schema Only', desc: '13 database tables', time: '~2s', icon: '🗄️' },
  { id: 'legal', name: 'Legal Compliance', desc: '14-day wait, cooling-off', time: '~1s', icon: '⚖️' },
  { id: 'pricing', name: 'Pricing Logic', desc: 'CNY→ZAR, margins', time: '~1s', icon: '💰' },
  { id: 'full', name: 'Full E2E Suite', desc: 'All 60+ operations', time: '~45s', icon: '🚀' },
];

const CATEGORY_ICONS: Record<string, string> = {
  schema: '🗄️',
  products: '📦',
  zones: '🗺️',
  partners: '🤝',
  legal: '⚖️',
  orders: '🛒',
  payment: '💳',
  assignment: '🎯',
  delivery: '🚚',
  rating: '⭐',
  refund: '↩️',
  wants: '🎁',
  pricing: '💰',
  notifications: '🔔',
  api: '🔌',
};

export default function E2ETestPage() {
  const [selectedType, setSelectedType] = useState('full');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [simpleResults, setSimpleResults] = useState<TestStep[] | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const runTests = async () => {
    setRunning(true);
    setResult(null);
    setSimpleResults(null);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch('/api/e2e-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Test failed');
      }

      if (selectedType === 'full') {
        setResult(data.results);
        // Auto-expand failed categories
        const failed = new Set<string>();
        data.results.steps.forEach((s: TestStep) => {
          if (s.status === 'failed') failed.add(s.category);
        });
        setExpandedCategories(failed);
      } else {
        setSimpleResults(data.results);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  const toggleCategory = (cat: string) => {
    const next = new Set(expandedCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setExpandedCategories(next);
  };

  const groupByCategory = (steps: TestStep[]) => {
    const groups: Record<string, TestStep[]> = {};
    steps.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });
    return groups;
  };

  // Generate export data for Claude
  const generateClaudeExport = () => {
    const steps = result?.steps || simpleResults || [];
    const failedTests = steps.filter(s => s.status === 'failed');
    const passedTests = steps.filter(s => s.status === 'passed');
    
    const timestamp = new Date().toISOString();
    const testType = TEST_TYPES.find(t => t.id === selectedType)?.name || selectedType;
    
    let report = `## JEFFY E2E TEST REPORT
**Generated:** ${timestamp}
**Test Type:** ${testType}
**Summary:** ${passedTests.length} passed, ${failedTests.length} failed out of ${steps.length} total

`;

    if (failedTests.length === 0) {
      report += `### ✅ ALL TESTS PASSED
No issues to fix!\n`;
    } else {
      report += `### ❌ FAILED TESTS (${failedTests.length})
Please fix these issues:\n\n`;

      // Group failed tests by category
      const failedByCategory: Record<string, TestStep[]> = {};
      failedTests.forEach(t => {
        if (!failedByCategory[t.category]) failedByCategory[t.category] = [];
        failedByCategory[t.category].push(t);
      });

      Object.entries(failedByCategory).forEach(([category, tests]) => {
        report += `#### ${CATEGORY_ICONS[category] || '📋'} ${category.toUpperCase()} (${tests.length} failed)\n\n`;
        
        tests.forEach((test, i) => {
          report += `**${i + 1}. ${test.name}**\n`;
          report += `- Error: \`${test.error || 'Unknown error'}\`\n`;
          if (test.data) {
            report += `- Data: \`${JSON.stringify(test.data)}\`\n`;
          }
          report += `- Duration: ${test.duration}ms\n\n`;
        });
      });

      // Add context for common issues
      report += `### 🔧 TECHNICAL CONTEXT

**Database Tables Expected:**
- products, categories, product_categories
- zones, zone_partners  
- customers, orders, order_items
- ratings, refunds, notifications
- wants, want_agrees

**Common Fixes:**
- Missing table → Run the SQL schema in Supabase
- Column missing → ALTER TABLE to add column
- RLS error → Check Supabase Row Level Security policies
- API error → Check /src/app/api/ route handlers

**File Locations:**
- Schema: /src/lib/testing/e2e-complete-test-suite.ts
- API: /src/app/api/e2e-test/route.ts
- Database types: /src/lib/supabase/types.ts
`;
    }

    // Add cleanup info if available
    if (result?.cleanup) {
      report += `\n### 🧹 CLEANUP STATUS
- Success: ${result.cleanup.success ? 'Yes' : 'No'}
- Deleted: ${result.cleanup.deleted.join(', ') || 'None'}
${result.cleanup.errors.length > 0 ? `- Errors: ${result.cleanup.errors.join(', ')}` : ''}
`;
    }

    return report;
  };

  const copyToClipboard = async () => {
    const report = generateClaudeExport();
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = report;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const hasResults = result || simpleResults;
  const hasFailures = (result?.summary.failed || 0) > 0 || 
    (simpleResults?.filter(s => s.status === 'failed').length || 0) > 0;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <FlaskConical className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">E2E Test Suite</h1>
          <p className="text-gray-600">Complete system validation - 60+ tests across 13 categories</p>
        </div>
      </div>

      {/* Test Type Selection */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold mb-4">Select Test Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TEST_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedType === t.id 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-gray-500">{t.desc}</div>
              <div className="text-xs text-gray-400 mt-1">{t.time}</div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button 
            onClick={runTests} 
            disabled={running}
            size="lg"
          >
            {running ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Run {TEST_TYPES.find(t => t.id === selectedType)?.name}
              </>
            )}
          </Button>

          {/* Export for Claude Button */}
          {hasResults && (
            <Button 
              onClick={copyToClipboard}
              variant="outline"
              size="lg"
              className={`${hasFailures ? 'border-orange-500 text-orange-600 hover:bg-orange-50' : 'border-green-500 text-green-600 hover:bg-green-50'}`}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  Export for Claude
                </>
              )}
            </Button>
          )}
        </div>

        {/* Export Instructions */}
        {hasResults && hasFailures && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
            <strong className="text-orange-700">💡 Found issues?</strong>
            <span className="text-orange-600 ml-2">
              Click "Export for Claude" to copy a diagnostic report, then paste it in chat for fixes.
            </span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Test Error</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Simple Results (schema/legal/pricing) */}
      {simpleResults && (
        <div className="bg-white rounded-xl border overflow-hidden mb-6">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                {TEST_TYPES.find(t => t.id === selectedType)?.name} Results
              </span>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">
                  ✓ {simpleResults.filter(s => s.status === 'passed').length} passed
                </span>
                <span className="text-red-600">
                  ✗ {simpleResults.filter(s => s.status === 'failed').length} failed
                </span>
              </div>
            </div>
          </div>
          <div className="divide-y">
            {simpleResults.map((step, i) => (
              <div key={i} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {step.status === 'passed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>{step.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  {step.error && (
                    <span className="text-red-500">{step.error}</span>
                  )}
                  <span>{step.duration}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full E2E Results */}
      {result && (
        <>
          {/* Summary Header */}
          <div className={`rounded-xl p-6 mb-6 ${
            result.status === 'passed' ? 'bg-green-50 border-2 border-green-500' :
            result.status === 'partial' ? 'bg-yellow-50 border-2 border-yellow-500' :
            'bg-red-50 border-2 border-red-500'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {result.status === 'passed' ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : result.status === 'partial' ? (
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    {result.status === 'passed' ? 'All Tests Passed!' :
                     result.status === 'partial' ? 'Some Tests Failed' :
                     'Tests Failed'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Completed in {(result.duration / 1000).toFixed(1)}s
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {result.summary.passed}/{result.summary.total}
                </div>
                <div className="text-sm text-gray-600">tests passed</div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl border overflow-hidden mb-6">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Results by Category</h3>
            </div>
            <div className="divide-y">
              {Object.entries(groupByCategory(result.steps)).map(([cat, steps]) => {
                const passed = steps.filter(s => s.status === 'passed').length;
                const failed = steps.filter(s => s.status === 'failed').length;
                const isExpanded = expandedCategories.has(cat);

                return (
                  <div key={cat}>
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-xl">{CATEGORY_ICONS[cat] || '📋'}</span>
                        <span className="font-medium capitalize">{cat}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {passed > 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                            {passed} ✓
                          </span>
                        )}
                        {failed > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                            {failed} ✗
                          </span>
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="bg-gray-50 px-4 pb-4">
                        <div className="space-y-2 ml-7">
                          {steps.map((step, i) => (
                            <div 
                              key={i}
                              className={`p-3 rounded-lg ${
                                step.status === 'passed' ? 'bg-white' : 'bg-red-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {step.status === 'passed' ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className="text-sm">{step.name}</span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {step.duration}ms
                                </span>
                              </div>
                              {step.error && (
                                <div className="mt-1 text-xs text-red-600 ml-6 font-mono bg-red-100 p-1 rounded">
                                  {step.error}
                                </div>
                              )}
                              {step.data && (
                                <div className="mt-1 text-xs text-gray-500 ml-6 font-mono">
                                  {JSON.stringify(step.data)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cleanup Summary */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span>🧹</span> Cleanup
            </h3>
            {result.cleanup.success ? (
              <div className="text-green-600 text-sm">
                ✓ All test data cleaned up: {result.cleanup.deleted.join(', ')}
              </div>
            ) : (
              <div className="text-red-600 text-sm">
                ✗ Cleanup errors: {result.cleanup.errors.join(', ')}
              </div>
            )}
          </div>
        </>
      )}

      {/* Categories Legend */}
      {!result && !simpleResults && !running && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Test Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => (
              <div key={cat} className="flex items-center gap-2 text-gray-600">
                <span>{icon}</span>
                <span className="capitalize">{cat}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <strong>Full E2E Suite covers:</strong>
            <ul className="mt-2 space-y-1 ml-4">
              <li>• 13 database tables verification</li>
              <li>• Product & category operations</li>
              <li>• Zone & partner management</li>
              <li>• CPA legal compliance (14-day, cooling-off)</li>
              <li>• Complete order flow (create → pay → assign → deliver)</li>
              <li>• PayFast signature generation</li>
              <li>• Customer ratings & refunds</li>
              <li>• Wants system with discount tiers</li>
              <li>• Pricing calculations (CNY → ZAR)</li>
              <li>• Notification logging</li>
              <li>• API endpoint health</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
