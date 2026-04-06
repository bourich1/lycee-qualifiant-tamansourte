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
      <section className="bg-primary/5 py-12 md:py-24 lg:py-32 relative overflow-hidden">
        <PixelGrid />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 px-2 leading-[1.1]">
              Shaping the <span className="text-primary italic">Future Leaders</span> of Tomorrow
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto px-4 font-light leading-relaxed">
              At Lycée Qualifiant Tamansourt, we combine rigorous academic excellence with innovative enrichment to develop brilliant, well-rounded minds.
            </p>
          </motion.div>
          <div className="flex flex-col sm:flex-row justify-center gap-6 px-4">
            <Link to="/login" className="w-full sm:w-auto overflow-hidden group">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white w-full px-12 py-7 text-lg rounded-full transition-all duration-300 transform group-hover:scale-105 shadow-xl shadow-primary/20">
                Explore Our Campus <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#about" className="w-full sm:w-auto overflow-hidden group">
              <Button size="lg" variant="outline" className="w-full px-12 py-7 text-lg rounded-full border-primary/30 text-primary hover:bg-primary/5 transition-all duration-300">
                Our Vision
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="px-2 sm:px-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-6">
                <GraduationCap className="h-4 w-4" />
                A Tradition of Excellence & Innovation
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-8">
                Innovating Education for the Brighter Tomorrow.
              </h2>
              <div className="space-y-6 text-slate-600 text-base sm:text-lg leading-relaxed">
                <p>
                  As a leading prestigious school in our community, Lycée Qualifiant Tamansourt is dedicated to fostering an environment where academic rigor meets creative innovation. We don't just teach; we inspire students to push boundaries and achieve their fullest potential.
                </p>
                <p>
                  Our curriculum is designed to prepare students for the complexities of the modern world, ensuring they graduate not only with top-tier knowledge but also with the resilience, critical thinking, and character needed to lead in their respective fields.
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
            
            <div className="relative mt-8 lg:mt-0">
              <div className="aspect-[4/3] sm:aspect-square rounded-3xl bg-primary/10 overflow-hidden relative z-10 shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" 
                  alt="Students collaborating" 
                  className="w-full h-full object-cover mix-blend-multiply opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden sm:block absolute -top-6 -right-6 w-32 h-32 bg-blue-100 rounded-full -z-0"></div>
              <div className="hidden sm:block absolute -bottom-6 -left-6 w-48 h-48 bg-primary/5 rounded-full -z-0"></div>
              
              <div className="absolute -bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 bg-white p-4 sm:p-6 rounded-2xl shadow-xl z-20 max-w-sm sm:max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-700 border border-slate-100">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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

      {/* Pillars of Excellence Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Our Pillars of <span className="text-primary italic">Excellence</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
              We uphold the highest standards to ensure our students are safe, intellectually challenged, and prepared for future success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            <motion.div 
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 rotate-3">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Academic Rigor</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Our curriculum is taught by top-tier faculty who challenge students to achieve excellence in every discipline, from advanced sciences to the humanities.
              </p>
              <ul className="space-y-3 text-sm text-slate-500">
                <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Specialized STEM Programs</li>
                <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Advanced Placement Tracking</li>
              </ul>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-blue-50/30 border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 -rotate-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Unwavering Safety</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                The safety of our students is our absolute priority. We provide a secure, nurturing environment where every child feels protected and supported.
              </p>
              <ul className="space-y-3 text-sm text-slate-500">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-600" /> 24/7 Campus Monitoring</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-600" /> Dedicated Student Support</li>
              </ul>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-purple-50/30 border border-purple-100 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-8 rotate-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Innovative Minds</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Through unique enrichment activities like our <Link to="/cyber-team" className="text-purple-600 font-bold hover:underline">Cyber Security Team</Link>, we foster innovative thinking and technical expertise.
              </p>
              <ul className="space-y-3 text-sm text-slate-500">
                <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-600" /> Elite Robotics & Tech Clubs</li>
                <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-600" /> Creative Arts Enrichment</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section id="developer" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm border border-slate-100 max-w-5xl mx-auto flex flex-col md:flex-row gap-10 md:gap-12 items-center text-center md:text-left">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6">Built for Excellence</h2>
              <p className="text-slate-600 mb-8 text-base sm:text-lg leading-relaxed">
                This platform is crafted by a dedicated team of innovators who believe that technology is the ultimate catalyst for educational transformation. Our mission is to provide the digital tools necessary for the next generation of Moroccan leaders.
              </p>
              <div className="flex justify-center md:justify-start gap-8">
                <a href="#" className="text-primary hover:text-primary/80 transition-colors font-bold flex items-center gap-2 underline underline-offset-4">LinkedIn</a>
                <a href="#" className="text-primary hover:text-primary/80 transition-colors font-bold flex items-center gap-2 underline underline-offset-4">GitHub</a>
              </div>
            </div>
            <div className="w-full max-w-[280px] sm:max-w-xs aspect-square rounded-2xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden shadow-inner">
              <Users className="h-24 w-24 sm:h-32 sm:w-32" />
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
                      <p className="text-slate-500 text-sm">{/* Placeholder for school phone number */}+212 (0) 5XX XX XX XX</p>
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
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-100">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" required placeholder="John Doe" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input type="email" id="email" required placeholder="john@example.com" className="h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" required placeholder="How can we help?" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={5} required placeholder="Your message here..." className="resize-none" />
                </div>
                <button type="submit" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary px-2.5 py-1.5 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 w-full h-12 text-lg transition-colors shadow-md">
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
