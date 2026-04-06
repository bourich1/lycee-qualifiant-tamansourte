import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Megaphone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

type Announcement = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setAnnouncements(data.map(a => ({
          id: a.id,
          title: a.title,
          content: a.content,
          createdAt: a.created_at
        })));
      }
      setLoading(false);
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-16 px-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Megaphone className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">School Announcements</h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-500">
          Stay up to date with the latest news and important notices.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No announcements available at the moment.
        </div>
      ) : (
        <div className="space-y-8">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-slate-50 border-b pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">{announcement.title}</CardTitle>
                  <div className="flex items-center text-xs sm:text-sm text-slate-500 bg-white px-3 py-1 rounded-full border">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {format(new Date(announcement.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
