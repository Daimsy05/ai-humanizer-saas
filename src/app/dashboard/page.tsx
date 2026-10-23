'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, CheckCircle2, User, CreditCard, Zap } from 'lucide-react';

export default function WorkspacePage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUser(user);

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setSubscription(sub);
      setLoading(false);
    };
    getData();
  }, [supabase]);

   const handleUpgrade = async () => {
    // Price in USD for the Pro Plan
    const priceAmount = 19.99; 
    
    const res = await fetch('/api/crypto/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceAmount }),
    });
    
    const { url, error } = await res.json();
    
    if (url) {
      window.location.href = url;
    } else {
      alert(error || 'Failed to create crypto invoice.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isPro = subscription?.status === 'active' || subscription?.status === 'trialing';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tool
            </Link>
            <div className="h-6 w-px bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <span className="font-bold text-slate-900">Workspace</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back!</h1>
          <p className="text-slate-500 mt-1">Here is an overview of your account and usage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Plan Status */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Current Plan</CardTitle>
              <CreditCard className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                {isPro ? 'Pro Plan' : 'Free Tier'}
                {isPro && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isPro ? 'Unlimited AI processing' : 'Limited to 125 words per request'}
              </p>
              
              {!isPro && (
                <Button onClick={handleUpgrade} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                  Upgrade to Pro
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Usage / Limits */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Word Limit</CardTitle>
              <Zap className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {isPro ? 'Unlimited' : '125 words'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Per single request
              </p>
              
              {/* Fake Progress Bar for visual effect */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 mt-4">
                <div className={`h-2.5 rounded-full ${isPro ? 'bg-green-500 w-full' : 'bg-indigo-600 w-1/4'}`}></div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Account Info */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Account Details</CardTitle>
              <User className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-slate-900 truncate">
                {user?.email}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Member since {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Large Call to Action Area */}
        <Card className="bg-linear-to-r from-indigo-50 to-purple-50 border-indigo-100 shadow-sm">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to humanize some text?</h3>
              <p className="text-slate-600">Head back to the tool and start generating natural-sounding content.</p>
            </div>
            <Link href="/" className="mt-4 md:mt-0">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                Open AI Tool
              </Button>
            </Link>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}