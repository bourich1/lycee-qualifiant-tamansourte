import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp, Users, ArrowLeft, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

type Section = {
  id: number;
  name: string;
  total_score: number;
  best_student_name: string | null;
  updated_at: string;
};

const getAbbr = (name: string) => {
  const words = name.split(/[\s-]+/);
  if (words.length === 1) return name.slice(0, 3).toUpperCase();
  return words.map(w => w[0]).join('').toUpperCase().slice(0, 3);
};

const getColor = (name: string) => {
  const colors = [
    'bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 
    'bg-amber-600', 'bg-rose-600', 'bg-indigo-600',
    'bg-cyan-600', 'bg-orange-600'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function PublicCompetition() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRankings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('competition_sections')
      .select('*')
      .order('total_score', { ascending: false });
    
    if (!error && data) {
      setSections(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRankings();
    
    const channel = supabase
      .channel('public_competition_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competition_sections' }, fetchRankings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competition_scores' }, fetchRankings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const topThree = sections.slice(0, 3);
  const podiumOrder = [];
  if (topThree[1]) podiumOrder.push(topThree[1]);
  if (topThree[0]) podiumOrder.push(topThree[0]);
  if (topThree[2]) podiumOrder.push(topThree[2]);

  return (
    <div className="min-h-screen bg-[#FDFCF6] pb-20">
      {/* Dynamic Header */}
      <nav className="p-6 flex justify-center items-center bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <span className="font-black text-xl text-slate-900 tracking-tighter uppercase">Lycée Tamansourte</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pt-16">
        <div className="text-center space-y-4 mb-20">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-bold py-1 px-4 mb-2 uppercase tracking-widest text-[10px]">
             Live Competitions 🏅
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase">
            School Leaderboard
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto italic">
            "See how your class ranks against the school. Every point matters!"
          </p>
        </div>

        {/* Podium Area (Inspired by screenshots) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-24 px-4 md:px-10">
          {podiumOrder.map((section, idx) => {
            const isFirst = section.id === topThree[0]?.id;
            const isSecond = section.id === topThree[1]?.id;
            
            return (
              <motion.div 
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className={`flex flex-col items-center group relative ${isFirst ? 'order-1 md:order-2 scale-110 z-10' : idx === 0 ? 'order-2 md:order-1' : 'order-3 md:order-3'}`}
              >
                {/* Winner Card */}
                <Card className={`w-full overflow-hidden border-none shadow-2xl rounded-[2.5rem] transition-all hover:-translate-y-2 ${isFirst ? 'bg-[#FFF9EA]' : idx === 0 ? 'bg-[#F2F6FF]' : 'bg-[#FFF3EC]'}`}>
                  <div className={`h-2 ${isFirst ? 'bg-yellow-400' : idx === 0 ? 'bg-blue-400' : 'bg-orange-400'}`} />
                  <CardContent className="p-8 text-center flex flex-col items-center">
                    
                    <div className="relative mb-6">
                      <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-2xl ${getColor(section.name)}`}>
                        {getAbbr(section.name)}
                      </div>
                      <div className={`absolute -bottom-2 -right-1 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white text-white font-bold text-sm shadow-lg ${isFirst ? 'bg-yellow-500' : idx === 0 ? 'bg-slate-500' : 'bg-orange-500'}`}>
                        {isFirst ? '1' : idx === 0 ? '2' : '3'}
                      </div>
                      {isFirst && <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl">👑</div>}
                    </div>

                    <h3 className="font-black text-slate-900 text-2xl mb-1 uppercase tracking-tighter truncate max-w-full">
                      {section.name}
                    </h3>
                    <p className="text-slate-400 text-sm font-bold uppercase mb-4 tracking-widest italic">
                      {section.best_student_name || 'Class Representative'}
                    </p>

                    <div className="flex flex-col items-center">
                       <span className="text-5xl font-black text-slate-900 tracking-tighter">{section.total_score}</span>
                       <span className="text-xs font-black text-slate-400 uppercase">Points</span>
                    </div>

                    <Badge className="mt-6 bg-white/50 text-slate-500 border-none px-4 py-1 font-bold">
                       EXPERT LEVEL 🎖️
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Global List Standings */}
        <div className="space-y-4 max-w-4xl mx-auto px-2">
           <div className="flex items-center justify-between mb-8 px-4">
              <h2 className="text-xl font-black text-slate-900 uppercase">All Standings</h2>
              <span className="text-slate-400 font-bold text-sm">{sections.length} CLASSES TOTAL</span>
           </div>

           {sections.map((section, idx) => (
             <motion.div 
               key={section.id} 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className={`group flex items-center p-4 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-primary/20 transition-all cursor-default ${idx < 3 ? 'border-primary/20 bg-primary/5' : ''}`}
             >
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-slate-400 mr-4 group-hover:text-primary transition-colors">
                  {idx + 1}
                </div>

                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black text-white mr-4 shadow-sm ${getColor(section.name)}`}>
                  {getAbbr(section.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 uppercase tracking-tighter truncate md:text-lg">{section.name}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic group-hover:text-primary/70 transition-colors">
                    {section.best_student_name || 'Class Representative'}
                  </p>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-slate-900">{section.total_score}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase -mt-1 tracking-widest">Points</span>
                  </div>
                  <Badge className={`hidden md:flex font-bold text-[10px] px-3 ${idx < 3 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'} border-none`}>
                    TOP RUNNER
                  </Badge>
                </div>
             </motion.div>
           ))}
        </div>

      </div>
    </div>
  );
}
