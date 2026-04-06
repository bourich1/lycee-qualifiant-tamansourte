import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AITool = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  link: string;
};

export default function AITools() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setTools(data.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          imageUrl: t.icon,
          link: t.url
        })));
      }
      setLoading(false);
    };

    fetchTools();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16 px-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">AI Study Tools</h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
          Explore our curated collection of AI-powered tools designed to enhance your learning experience and boost productivity.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : tools.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No AI tools available at the moment. Check back later!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Card key={tool.id} className="overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow border-0 shadow-md">
              <div className="h-48 overflow-hidden bg-slate-100">
                <img 
                  src={tool.imageUrl} 
                  alt={tool.name} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900">{tool.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-base text-slate-600 line-clamp-3">
                  {tool.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t pt-4">
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <a href={tool.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    Try it now <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
