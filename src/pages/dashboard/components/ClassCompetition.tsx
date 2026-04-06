import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp, Users, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, parseISO } from 'date-fns';

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

export default function ClassCompetition() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

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
      .channel('competition_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competition_sections' }, fetchRankings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competition_scores' }, fetchRankings)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading && sections.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const topThree = sections.slice(0, 3);
  
  // Reorder for podium: [2nd, 1st, 3rd]
  const podiumOrder = [];
  if (topThree[1]) podiumOrder.push(topThree[1]);
  if (topThree[0]) podiumOrder.push(topThree[0]);
  if (topThree[2]) podiumOrder.push(topThree[2]);

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-2"
        >
          <Trophy className="h-10 w-10 text-primary" />
        </motion.div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-6xl uppercase">
          Class Competition
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          The battle of the sections. 🏅 Every point earned by a student brings the class closer to the championship.
        </p>
      </div>

      {/* Podium Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end pt-12 pb-20">
        <AnimatePresence mode="popLayout">
          {podiumOrder.map((section, idx) => {
            const isFirst = section.id === topThree[0]?.id;
            const isSecond = section.id === topThree[1]?.id;
            const isThird = section.id === topThree[2]?.id;

            return (
              <motion.div
                key={section.id}
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`flex flex-col items-center group ${isFirst ? 'order-1 md:order-2' : isSecond ? 'order-2 md:order-1' : 'order-3 md:order-3'}`}
              >
                {/* Best Student Display */}
                <div className="mb-6 text-center">
                  <div className="relative group transition-transform hover:scale-105">
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-xl border-4 ${isFirst ? 'border-yellow-400' : isSecond ? 'border-slate-300' : 'border-orange-300'} ${getColor(section.name)}`}>
                      {getAbbr(section.name)}
                    </div>
                    <div className={`absolute -bottom-2 -right-1 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-lg ${isFirst ? 'bg-yellow-500' : isSecond ? 'bg-slate-500' : 'bg-orange-500'}`}>
                      BEST STUDENT
                    </div>
                  </div>
                  <p className="mt-4 font-bold text-slate-900 tracking-tight">{section.best_student_name || 'Class Rep'}</p>
                </div>

                {/* Podium Column */}
                <div className={`
                  w-full rounded-2xl flex flex-col items-center justify-end p-8 border shadow-xl relative
                  ${isFirst ? 'h-72 bg-gradient-to-t from-yellow-100 via-white to-white border-yellow-200 z-10' : 
                    isSecond ? 'h-52 bg-gradient-to-t from-slate-100 via-white to-white border-slate-200' : 
                    'h-44 bg-gradient-to-t from-orange-100 via-white to-white border-orange-100'}
                `}>
                  <div className={`absolute -top-6 w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-xl shadow-2xl transition-transform group-hover:scale-110 ${isFirst ? 'bg-yellow-500' : isSecond ? 'bg-slate-400' : 'bg-orange-500'}`}>
                    {isFirst ? '1' : isSecond ? '2' : '3'}
                  </div>
                  <h3 className="font-black text-slate-900 text-2xl mb-1 uppercase tracking-tighter">{section.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black ${isFirst ? 'text-yellow-600' : isSecond ? 'text-slate-600' : 'text-orange-600'}`}>
                      {section.total_score}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Points</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Full Leaderboard Table */}
      <Card className="border-0 shadow-2xl overflow-hidden rounded-3xl">
        <CardHeader className="bg-slate-900 text-white py-10 px-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black flex items-center gap-3 uppercase tracking-tight">
              <TrendingUp className="h-8 w-8 text-primary" />
              Official Standings
            </CardTitle>
            <Badge variant="outline" className="text-slate-400 border-slate-700 bg-slate-800 font-bold px-4 py-1">
              LIVE DATA 📡
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-24 text-center font-black text-slate-400 uppercase text-xs">Rank</TableHead>
                <TableHead className="font-black text-slate-400 uppercase text-xs">Class Section</TableHead>
                <TableHead className="hidden md:table-cell font-black text-slate-400 uppercase text-xs">Best Representative</TableHead>
                <TableHead className="text-right font-black text-slate-400 uppercase text-xs pr-10">Total Accumulation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section, idx) => (
                <TableRow key={section.id} className="hover:bg-slate-50/50 transition-colors border-b last:border-0 group h-20">
                  <TableCell className="text-center">
                    {idx === 0 ? <Badge className="bg-yellow-500 text-xs font-black">1st</Badge> : 
                     idx === 1 ? <Badge className="bg-slate-400 text-xs font-black">2nd</Badge> : 
                     idx === 2 ? <Badge className="bg-orange-500 text-xs font-black">3rd</Badge> : 
                     <span className="font-black text-slate-300 text-xl">{idx + 1}</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 uppercase tracking-tighter text-lg">{section.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Users className="h-3 w-3" /> ACTIVE SINCE {parseISO(section.updated_at).getFullYear()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm ${getColor(section.name)}`}>
                        {getAbbr(section.name)}
                      </div>
                      {section.best_student_name ? (
                        <span className="font-bold text-slate-600 text-sm italic">"{section.best_student_name}"</span>
                      ) : <span className="text-slate-300 italic text-xs">No Nominee</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-10">
                    <span className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">{section.total_score}</span>
                    <span className="ml-2 text-[10px] font-black text-slate-400 uppercase">pts</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
