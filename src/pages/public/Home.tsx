import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Users, Sparkles, Megaphone, Calendar, ExternalLink, GraduationCap, ShieldCheck, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import PixelGrid from '@/components/ui/PixelGrid';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import GhostCursor from "@/components/ui/GhostCursor";
import Hyperspeed from "@/components/ui/Hyperspeed";

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

type AITool = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  link: string;
};

export default function Home() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will get back to you soon.');
    (e.target as HTMLFormElement).reset();
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [announcementsRes, toolsRes] = await Promise.all([
          supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('tools')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3)
        ]);

        if (announcementsRes.data) {
          setAnnouncements(announcementsRes.data.map(a => ({
            id: a.id,
            title: a.title,
            content: a.content,
            createdAt: a.created_at
          })));
        }

        if (toolsRes.data) {
          setTools(toolsRes.data.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            imageUrl: t.icon,
            link: t.url
          })));
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-white py-16 sm:py-24 md:py-32 relative overflow-hidden flex items-center justify-center min-h-[90vh]">
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
          <PixelGrid />
        </div>
        
        {/* Mouse Effect (Ghost Cursor) - Hidden per request
        <div className="absolute inset-0 pointer-events-none z-0">
          <GhostCursor 
            trailLength={50}
            inertia={0.5}
            grainIntensity={0.05}
            bloomStrength={0.1}
            bloomRadius={1}
            brightness={2}
            color="#B19EEF"
            edgeIntensity={0}
          />
        </div>
        */}

        {/* Hyperspeed Warp Effect */}
        <div className="absolute inset-0 pointer-events-none z-0 w-full h-full">
          <Hyperspeed 
            speed={1.5}
            density={1.2}
            color="79, 70, 229" // Indigo
          />
        </div>
        
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-blue-400/20 rounded-full blur-[80px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 text-center relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-primary/20 shadow-sm text-primary font-bold text-sm">
              <Sparkles className="h-4 w-4" /> Welcome to Excellence
            </div>
            
            <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold text-slate-900 tracking-tighter mb-6 leading-[1.05] max-w-5xl">
              Shaping the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 italic pr-2">Future Leaders</span> of Tomorrow
            </h1>
            
            <p className="text-[clamp(1.125rem,3vw,1.5rem)] text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              At Lycée Qualifiant Tamansourt, we combine rigorous academic excellence with innovative enrichment to develop brilliant, well-rounded minds.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 w-full max-w-md sm:max-w-none mx-auto"
          >
            <Link to="/login" className="w-full sm:w-auto block">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-8 text-[clamp(1rem,2vw,1.125rem)] font-bold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/30 group">
                Explore Our Campus <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <a href="#about" className="w-full sm:w-auto block">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 sm:px-12 py-6 sm:py-8 text-[clamp(1rem,2vw,1.125rem)] font-bold rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 transition-all duration-300 bg-white/50 backdrop-blur-md">
                Our Vision
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            
            {/* Text Content */}
            <div className="order-2 lg:order-1 space-y-8">
              <div>
                <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                  Innovating Education for the Brighter Tomorrow.
                </h2>
                <div className="space-y-6 text-slate-600 text-[clamp(1rem,2vw,1.125rem)] leading-relaxed">
                  <p>
                    As a premier educational institution, Lycée Qualifiant Tamansourt is dedicated to fostering a resilient environment where academic rigor seamlessly merges with creative innovation.
                  </p>
                  <p>
                    Our dynamic curriculum prepares students to navigate modern complexities, ensuring they graduate equipped with top-tier knowledge, critical thinking, and steadfast character.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="flex gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Secure Environment</h4>
                    <p className="text-sm text-slate-500 leading-snug">Data and physical protection via modern standards.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Direct Feedback</h4>
                    <p className="text-sm text-slate-500 leading-snug">Transparent communication loops for continual growth.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Image Composite */}
            <div className="order-1 lg:order-2 relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="aspect-[4/3] rounded-[2rem] bg-slate-100 overflow-hidden relative z-10 shadow-2xl border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" 
                  alt="Students collaborating" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-100 rounded-full blur-2xl -z-0"></div>
              <div className="absolute -bottom-12 -left-8 w-48 h-48 bg-primary/20 rounded-full blur-3xl -z-0"></div>
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 left-4 sm:-left-8 bg-white/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-xl z-20 max-w-[85%] sm:max-w-xs border border-white/50">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-inner">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Student First</div>
                    <div className="text-xs text-primary font-medium">Active Engagement</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 italic font-medium leading-relaxed">
                  "LQT transformed how we interact with education. It's fluid and transparent."
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-20 md:py-32 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 lg:mb-16">
            <div className="max-w-2xl">
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-slate-900 flex items-center gap-3 tracking-tight mb-3">
                <Megaphone className="h-8 w-8 text-primary shrink-0" />
                Latest Announcements
              </h2>
              <p className="text-slate-500 text-[clamp(1rem,1.5vw,1.125rem)]">Stay updated with breaking school news, schedules, and imperative notices.</p>
            </div>
            <Link to="/announcements" className="w-full sm:w-auto shrink-0">
              <Button variant="outline" className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border-slate-200 font-bold rounded-2xl h-12 px-6 group">
                View All Board <ArrowRight className="ml-2 h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-sm font-medium">
              No recent announcements.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {announcements.map((announcement, index) => (
                <motion.div 
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link to="/announcements" className="block h-full outline-none focus-visible:ring-4 ring-primary/20 rounded-3xl group">
                    <Card className="h-full bg-white border border-slate-100/60 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col relative z-0">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <CardHeader className="p-6 md:p-8 pb-4">
                        <div className="flex items-center text-xs font-semibold text-slate-400 bg-slate-50 w-fit px-3 py-1.5 rounded-lg mb-4">
                          <Calendar className="h-3.5 w-3.5 mr-2" />
                          {format(new Date(announcement.createdAt), 'MMMM d, yyyy')}
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-bold line-clamp-2 text-slate-900 tracking-tight">{announcement.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 md:px-8 flex-grow">
                        <p className="text-slate-600 text-[clamp(0.95rem,1.2vw,1rem)] line-clamp-3 leading-relaxed">{announcement.content}</p>
                      </CardContent>
                      <CardFooter className="p-6 md:p-8 pt-4 border-t border-slate-50 mt-auto bg-slate-50/50">
                        <span className="text-primary text-sm font-bold flex items-center gap-1 group-hover:underline underline-offset-4">
                          Read full article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pillars of Excellence Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold text-slate-900 mb-6 tracking-tight">
              Pillars of <span className="text-primary italic relative">
                Excellence
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg>
              </span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-[clamp(1.125rem,2vw,1.25rem)] leading-relaxed">
              We uphold the highest standards to ensure our students are safe, intellectually challenged, and primed for the future.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: BookOpen,
                title: "Academic Rigor",
                color: "primary",
                desc: "Our curriculum challenges students to achieve excellence in every discipline, from advanced sciences to comprehensive humanities.",
                points: ["Specialized STEM Programs", "Advanced Placement Tracking"]
              },
              {
                icon: ShieldCheck,
                title: "Unwavering Safety",
                color: "blue",
                desc: "The safety of our students is absolute. We provide a secure, nurturing environment where every child feels protected.",
                points: ["24/7 Campus Monitoring", "Dedicated Support Staff"]
              },
              {
                icon: Users,
                title: "Innovative Minds",
                color: "purple",
                desc: "Through unique enrichment activities, we foster innovative thinking and robust technical expertise for tomorrow's leaders.",
                points: ["Elite Tech & Cyber Clubs", "Creative Arts Immersion"]
              }
            ].map((pillar, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -8 }}
                className={`p-8 sm:p-10 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group
                  ${pillar.color === 'primary' ? 'bg-slate-50 border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5' : 
                    pillar.color === 'blue' ? 'bg-blue-50/30 border-blue-100/50 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5' : 
                    'bg-purple-50/30 border-purple-100/50 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5'}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300
                  ${pillar.color === 'primary' ? 'bg-primary/10 text-primary rotate-3' : 
                    pillar.color === 'blue' ? 'bg-blue-100 text-blue-600 -rotate-3' : 
                    'bg-purple-100 text-purple-600 rotate-6'}`}
                >
                  <pillar.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{pillar.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-8 text-[clamp(0.95rem,1.2vw,1.05rem)]">
                  {pillar.desc}
                </p>
                <ul className="space-y-4">
                  {pillar.points.map((point, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-700 bg-white/50 p-3 rounded-xl border border-white">
                      <Sparkles className={`h-4 w-4 shrink-0 ${pillar.color === 'primary' ? 'text-primary' : pillar.color === 'blue' ? 'text-blue-600' : 'text-purple-600'}`} /> 
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools Section */}
      <section className="py-20 md:py-32 bg-slate-900 border-t border-slate-800 relative z-0 overflow-hidden">
        {/* Dark Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 lg:mb-16">
            <div className="max-w-2xl">
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-white flex items-center gap-3 tracking-tight mb-3">
                <Sparkles className="h-8 w-8 text-blue-400 shrink-0" />
                Featured Intelligence
              </h2>
              <p className="text-slate-400 text-[clamp(1rem,1.5vw,1.125rem)]">Boost productivity with our curated suite of modern AI tools.</p>
            </div>
            <Link to="/ai-tools" className="w-full sm:w-auto shrink-0">
              <Button variant="outline" className="w-full sm:w-auto border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-white font-bold rounded-2xl h-12 px-6 group backdrop-blur-md">
                View Arsenal <ArrowRight className="ml-2 h-4 w-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-20 text-slate-400 bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700 font-medium">
              No AI tools cataloged yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {tools.map((tool) => (
                <motion.div 
                  key={tool.id}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Card className="h-full bg-slate-800/80 backdrop-blur-xl border-slate-700 overflow-hidden shadow-2xl rounded-3xl flex flex-col group">
                    <div className="aspect-[16/9] w-full overflow-hidden bg-slate-900 relative">
                      <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                      <img 
                        src={tool.imageUrl} 
                        alt={tool.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <CardHeader className="p-6 md:p-8 pb-2 border-none">
                      <CardTitle className="text-xl md:text-2xl font-bold text-white tracking-tight">{tool.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 md:px-8 border-none flex-grow">
                      <CardDescription className="line-clamp-3 text-slate-400 text-base leading-relaxed">{tool.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-6 md:p-8 pt-4 border-t border-slate-700/50 mt-auto bg-slate-800/30">
                      <Button asChild variant="link" className="p-0 h-auto text-blue-400 font-bold hover:text-blue-300 text-base flex items-center gap-2 group-hover:underline underline-offset-4">
                        <a href={tool.link} target="_blank" rel="noopener noreferrer">
                          Launch Tool <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-[clamp(2.5rem,5vw,3.5rem)] font-extrabold text-slate-900 tracking-tight">Contact Administrations</h2>
            <p className="mt-4 text-[clamp(1.125rem,2vw,1.25rem)] text-slate-500 max-w-2xl mx-auto">Have inquiries? Our staff is here to provide exceptional support.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
                <h3 className="text-2xl font-extrabold text-slate-900 mb-8 tracking-tight">Direct Lines</h3>
                <div className="space-y-8">
                  {[
                    { icon: MapPin, title: "Our Location", desc: "Lycée Qualifiant Tamansourte, Morocco", color: "text-primary", bg: "bg-primary/10" },
                    { icon: Phone, title: "Phone Support", desc: "+212 (0) 5XX XX XX XX", color: "text-blue-600", bg: "bg-blue-50" },
                    { icon: Mail, title: "Email Address", desc: "contact@tamansourte.edu", color: "text-purple-600", bg: "bg-purple-50" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-5">
                      <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0 border border-white shadow-inner`}>
                        <item.icon className={`h-6 w-6 ${item.color}`} />
                      </div>
                      <div className="pt-1">
                        <div className="font-bold text-slate-900 text-lg mb-1">{item.title}</div>
                        <p className="text-slate-500 font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
