'use client';

import { useState, useEffect } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState('humanize');
  const [user, setUser] = useState<any>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    // Set the year on the client side to avoid hydration errors
    setCurrentYear(new Date().getFullYear());

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const { complete, completion, isLoading, error } = useCompletion({
    api: '/api/process',
    body: { mode },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await complete(inputText);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* --- NAVBAR --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-slate-900">HumanizeAI</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <Link href="#" className="hover:text-indigo-600 transition">Humanizer</Link>
            <Link href="#" className="hover:text-indigo-600 transition">Paraphraser</Link>
            <Link href="#" className="hover:text-indigo-600 transition">Pricing</Link>
            <Link href="#" className="hover:text-indigo-600 transition">API</Link>
          </nav>
          <div className="flex items-center gap-4">
            
            {/* DYNAMIC NAVBAR LOGIC */}
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Go to Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-indigo-600">Log in</Link>
                <Link href="/login">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Sign up free</Button>
                </Link>
              </>
            )}

          </div>
        </div>
      </header>

      {/* --- HERO & TOOL SECTION --- */}
      <main className="flex-1">
        <section className="pt-20 pb-16 px-4">
          <div className="container mx-auto max-w-5xl text-center space-y-6">
            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800 mb-4">
              <Sparkles className="mr-2 h-4 w-4" />
              Trusted by 1,000,000+ writers
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
              Bring warmth back to <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">
                AI-generated writing
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              Bypass AI detectors and make your text sound 100% human. Paste your text below to humanize or paraphrase it instantly.
            </p>

            {/* --- THE TOOL --- */}
            <form onSubmit={handleSubmit} className="mt-10 text-left">
              <Card className="shadow-lg border-slate-200 overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    
                    {/* Input Side */}
                    <div className="p-6 bg-white border-b lg:border-b-0 lg:border-r border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800">Input Text</h3>
                        <Select value={mode} onValueChange={(value) => setMode(value || 'humanize')}>
                          <SelectTrigger className="w-35 h-9">
                            <SelectValue placeholder="Mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="humanize">Humanize</SelectItem>
                            <SelectItem value="paraphrase">Paraphrase</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea
                        placeholder="Paste your AI-generated text here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-62.5 resize-none border-slate-200 focus-visible:ring-indigo-600 text-base"
                      />
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
                        </span>
                        <Button type="submit" disabled={isLoading || !inputText.trim()} className="bg-indigo-600 hover:bg-indigo-700 w-32">
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Process'}
                        </Button>
                      </div>
                    </div>

                    {/* Output Side */}
                    <div className="p-6 bg-slate-50 relative">
                      <h3 className="font-semibold text-slate-800 mb-4">Output</h3>
                      <div className="min-h-62.5 p-4 bg-white border border-slate-200 rounded-md text-base text-slate-700 whitespace-pre-wrap overflow-y-auto">
                        {completion || <span className="text-slate-400 italic">Your processed text will appear here...</span>}
                      </div>
                      
                      {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                          {error.message}
                        </div>
                      )}
                      
                      {completion && !isLoading && (
                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(completion)}>
                            Copy to clipboard
                          </Button>
                        </div>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Why use our tool?</h2>
              <p className="text-slate-600 mt-2">The most advanced AI bypasser on the market.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="h-10 w-10 text-indigo-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Bypass Detectors</h3>
                <p className="text-slate-600 text-sm">Our multi-pass algorithm completely strips out robotic AI patterns, keeping your text safe from Turnitin and GPTZero.</p>
              </div>
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                <Zap className="h-10 w-10 text-indigo-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                <p className="text-slate-600 text-sm">Powered by the latest streaming AI models. Watch your text transform word-by-word in real-time.</p>
              </div>
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="h-10 w-10 text-indigo-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">100% Meaning Preserved</h3>
                <p className="text-slate-600 text-sm">We don't just swap synonyms. We rewrite the structure while keeping your original message exactly the same.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 max-w-5xl grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold text-white">HumanizeAI</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              The ultimate tool for making AI-generated content sound natural, human, and completely undetectable.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white">Humanizer</Link></li>
              <li><Link href="#" className="hover:text-white">Paraphraser</Link></li>
              <li><Link href="#" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 max-w-5xl mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          © {currentYear || 2026} HumanizeAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}