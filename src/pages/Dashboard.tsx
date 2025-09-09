import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Calendar, Bookmark, LogOut, User, Home, Bell, Info, BookmarkPlus, AlertTriangle } from 'lucide-react';
import { NotificationCenter } from '@/components/NotificationCenter';

interface Scheme {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  category: string | null;
  source_url: string | null;
}

const Dashboard = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [savedSchemes, setSavedSchemes] = useState<Set<string>>(new Set());
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSchemes();
    if (user) {
      fetchSavedSchemes();
    }
  }, [user]);

  const fetchSchemes = async () => {
    const { data, error } = await supabase
      .from('schemes')
      .select('*')
      .eq('is_active', true)
      .order('deadline', { ascending: true });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch schemes',
        variant: 'destructive',
      });
    } else {
      setSchemes(data || []);
    }
    setLoading(false);
  };

  const fetchSavedSchemes = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('saved_schemes')
      .select('scheme_id')
      .eq('user_id', user.id);

    if (data) {
      setSavedSchemes(new Set(data.map(item => item.scheme_id)));
    }
  };

  const handleSaveScheme = async (schemeId: string) => {
    if (!user) return;

    const isSaved = savedSchemes.has(schemeId);
    
    if (isSaved) {
      const { error } = await supabase
        .from('saved_schemes')
        .delete()
        .eq('user_id', user.id)
        .eq('scheme_id', schemeId);

      if (!error) {
        setSavedSchemes(prev => {
          const newSet = new Set(prev);
          newSet.delete(schemeId);
          return newSet;
        });
        toast({
          title: 'Scheme removed',
          description: 'Scheme removed from your saved list',
        });
      }
    } else {
      const { error } = await supabase
        .from('saved_schemes')
        .insert({
          user_id: user.id,
          scheme_id: schemeId,
        });

      if (!error) {
        setSavedSchemes(prev => new Set([...prev, schemeId]));
        toast({
          title: 'Scheme saved',
          description: 'Scheme added to your saved list',
        });
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const saveInfoSection = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_schemes')
        .insert({
          user_id: user.id,
          scheme_id: 'info-section'
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Saved!',
        description: 'Information section saved to My Schemes',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getDeadlineStatus = (deadline: string | null) => {
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Expired', variant: 'destructive' as const };
    if (diffDays <= 7) return { text: `${diffDays} days left`, variant: 'destructive' as const };
    if (diffDays <= 30) return { text: `${diffDays} days left`, variant: 'secondary' as const };
    return { text: `${diffDays} days left`, variant: 'outline' as const };
  };

  const isDeadlineExpiringSoon = (deadline: string | null) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(schemes.map(s => s.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary">SchemeSeva</h1>
              <nav className="hidden md:flex space-x-6">
                <Link to="/dashboard" className="flex items-center text-primary font-medium">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link to="/saved" className="flex items-center text-muted-foreground hover:text-foreground">
                  <Bookmark className="h-4 w-4 mr-2" />
                  My Schemes
                </Link>
                <Link to="/profile" className="flex items-center text-muted-foreground hover:text-foreground">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-2">
              <NotificationCenter />
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Information Section */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary-glow/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Info className="h-6 w-6 text-primary mt-1" />
                <div>
                  <CardTitle className="text-lg">About Government Schemes</CardTitle>
                  <CardDescription className="mt-2">
                    Government schemes are scattered across multiple portals with complex eligibility criteria. 
                    SchemeSeva brings them together in one place, making it easier for you to discover and apply 
                    for schemes that match your profile.
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={saveInfoSection}
                className="flex-shrink-0"
              >
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Search and Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Discover Government Schemes</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schemes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Schemes Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading schemes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => {
              const deadlineStatus = getDeadlineStatus(scheme.deadline);
              return (
                <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {scheme.category || 'General'}
                      </Badge>
                      {deadlineStatus && (
                        <Badge variant={deadlineStatus.variant} className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {deadlineStatus.text}
                        </Badge>
                      )}
                      {scheme.deadline && isDeadlineExpiringSoon(scheme.deadline) && (
                        <Badge variant="destructive" className="bg-orange-500/10 text-orange-600 border-orange-200 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expires Soon
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{scheme.name}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {scheme.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Button
                        variant={savedSchemes.has(scheme.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSaveScheme(scheme.id)}
                      >
                        <Bookmark className="h-4 w-4 mr-2" />
                        {savedSchemes.has(scheme.id) ? 'Saved' : 'Save'}
                      </Button>
                      {scheme.source_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={scheme.source_url} target="_blank" rel="noopener noreferrer">
                            Learn More
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && filteredSchemes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No schemes found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;