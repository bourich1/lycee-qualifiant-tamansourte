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
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 lg:py-32 relative overflow-hidden">
        <PixelGrid />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 pointer-events-none">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Welcome to <span className="text-primary">Lycee Qualifiant Tamansourte</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Empowering students and administrators with modern tools for a better educational experience.
          </p>
          <div className="flex justify-center gap-4 pointer-events-auto">
            <Link to="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                Login to Dashboard
              </Button>
            </Link>
            <a href="#about">
              <Button size="lg" variant="outline" className="px-8 border-primary text-primary hover:bg-primary/5">
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <GraduationCap className="h-4 w-4" />
                About Lycee Qualifiant Tamansourte
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-6">
                A modern approach to school management and student engagement.
              </h2>
              <div className="space-y-4 text-slate-600 text-lg leading-relaxed">
                <p>
                  Lycee Qualifiant Tamansourte is a comprehensive platform designed to streamline communication between school administration and students. 
                  By empowering class representatives with dedicated tools, we ensure that student voices are heard and administrative tasks are handled efficiently.
                </p>
                <p>
                  Our mission is to provide a seamless, transparent, and efficient digital environment that supports the educational journey of every student while simplifying the workload of our dedicated staff.
                </p>
              </div>
              
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Secure & Private</h4>
                    <p className="text-sm text-slate-500">Your data is protected with modern security standards.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Direct Feedback</h4>
                    <p className="text-sm text-slate-500">Real-time communication between students and staff.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-primary/10 overflow-hidden relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" 
                  alt="Students collaborating" 
                  className="w-full h-full object-cover mix-blend-multiply opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-100 rounded-full -z-0"></div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-primary/5 rounded-full -z-0"></div>
              
              <div className="absolute bottom-8 right-8 bg-white p-6 rounded-2xl shadow-xl z-20 max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Class Reps</div>
                    <div className="text-xs text-slate-500">Direct Liaison</div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "Lycee Qualifiant Tamansourte has completely transformed how our class communicates with the administration. It's fast and transparent."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Megaphone className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                Latest Announcements
              </h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base">Stay updated with the latest school news.</p>
            </div>
            <Link to="/announcements" className="w-full sm:w-auto">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/5 w-full sm:w-auto justify-between sm:justify-center">
                Show All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl">
              No announcements available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {announcements.map((announcement) => (
                <motion.div 
                  key={announcement.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow h-full bg-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center text-xs text-slate-500 mb-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                      </div>
                      <CardTitle className="text-lg font-bold line-clamp-1 text-slate-900">{announcement.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm line-clamp-3">{announcement.content}</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Link to="/announcements" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                        Read more <ArrowRight className="h-3 w-3" />
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Tools Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                Featured AI Tools
              </h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base">Boost your productivity with AI.</p>
            </div>
            <Link to="/ai-tools" className="w-full sm:w-auto">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 w-full sm:w-auto justify-between sm:justify-center">
                Show All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl">
              No AI tools available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tools.map((tool) => (
                <motion.div 
                  key={tool.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow h-full bg-white">
                    <div className="h-40 overflow-hidden bg-slate-100">
                      <img 
                        src={tool.imageUrl} 
                        alt={tool.name} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-bold text-slate-900">{tool.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2 text-slate-600">{tool.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button asChild variant="link" className="p-0 h-auto text-blue-600 font-medium hover:text-blue-700">
                        <a href={tool.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                          Try it now <ExternalLink className="h-3 w-3" />
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

      {/* Features Section (Original) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">Why Choose Lycee Qualifiant Tamansourte?</h2>
            <p className="text-slate-500 mt-4 text-sm sm:text-base md:text-lg">Everything you need to succeed in one place.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 rounded-2xl bg-slate-50 hover:shadow-lg transition-all border border-slate-100">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Latest Announcements</h3>
              <p className="text-slate-600 mb-6">Stay updated with the latest news and important notices from the administration.</p>
              <Link to="/announcements" className="text-primary font-medium hover:text-primary hover:underline flex items-center justify-center gap-1">
                View Announcements <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="text-center p-8 rounded-2xl bg-slate-50 hover:shadow-lg transition-all border border-slate-100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Study Tools</h3>
              <p className="text-slate-600 mb-6">Access our curated list of AI-powered tools designed to help you excel in your studies.</p>
              <Link to="/ai-tools" className="text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-1">
                Explore Tools <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="text-center p-8 rounded-2xl bg-slate-50 hover:shadow-lg transition-all border border-slate-100">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Class Representatives</h3>
              <p className="text-slate-600 mb-6">Dedicated dashboards for class representatives to communicate directly with administration.</p>
              <Link to="/login" className="text-purple-600 font-medium hover:text-purple-700 flex items-center justify-center gap-1">
                Student Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="text-center p-8 rounded-2xl bg-slate-50 hover:shadow-lg transition-all border border-slate-100">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Megaphone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Modern Management</h3>
              <p className="text-slate-600 mb-6">Powerful tools for school administrators to manage users, content, and requests efficiently.</p>
              <Link to="/login" className="text-amber-600 font-medium hover:text-amber-700 flex items-center justify-center gap-1">
                Admin Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section id="developer" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-6">Meet the Developer</h2>
              <p className="text-slate-600 mb-6 text-lg">
                Hi, I'm [Developer Name], a passionate software developer dedicated to building innovative technical solutions that simplify daily life. I believe that technology can make a real difference in education.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-primary hover:text-primary hover:underline font-medium">LinkedIn</a>
                <a href="#" className="text-primary hover:text-primary hover:underline font-medium">GitHub</a>
              </div>
            </div>
            <div className="w-full aspect-square rounded-2xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
              <Users className="h-32 w-32" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Contact Us</h2>
            <p className="mt-4 text-lg text-slate-500">Have questions? We're here to help.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Get in Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Our Location</div>
                      <p className="text-slate-500 text-sm">Lycee Qualifiant Tamansourte, Tamansourte, Morocco</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Phone Number</div>
                      <p className="text-slate-500 text-sm">+1 (555) 123-4567 (Mon-Fri 8am-5pm)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Email Address</div>
                      <p className="text-slate-500 text-sm">contact@tamansourte.edu</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Need immediate help?</h3>
                  <p className="text-white/90 mb-6 text-sm">Our support team is available during school hours to assist you with any technical issues.</p>
                  <Button variant="outline" className="bg-white text-primary hover:bg-slate-50 border-white">
                    Live Chat Support
                  </Button>
                </div>
                <GraduationCap className="absolute -bottom-6 -right-6 h-32 w-32 text-white/10 rotate-12" />
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-100">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" required placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input type="email" id="email" required placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" required placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={5} required placeholder="Your message here..." />
                </div>
                <button type="submit" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary px-2.5 py-1.5 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 w-full h-12 text-lg transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
