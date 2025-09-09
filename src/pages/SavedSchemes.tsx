import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Bookmark, LogOut, User, Home, Trash2 } from 'lucide-react';

interface SavedScheme {
  id: string;
  scheme_id: string;
  saved_at: string;
  schemes: {
    id: string;
    name: string;
    description: string | null;
    deadline: string | null;
    category: string | null;
    source_url: string | null;
  };
}

const SavedSchemes = () => {
  const [savedSchemes, setSavedSchemes] = useState<SavedScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSavedSchemes();
  }, [user]);

  const fetchSavedSchemes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('saved_schemes')
      .select(`
        id,
        scheme_id,
        saved_at,
        schemes (
          id,
          name,
          description,
          deadline,
          category,
          source_url
        )
      `)
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch saved schemes',
        variant: 'destructive',
      });
    } else {
      setSavedSchemes(data || []);
    }
    setLoading(false);
  };

  const handleRemoveScheme = async (savedSchemeId: string) => {
    const { error } = await supabase
      .from('saved_schemes')
      .delete()
      .eq('id', savedSchemeId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove scheme',
        variant: 'destructive',
      });
    } else {
      setSavedSchemes(prev => prev.filter(item => item.id !== savedSchemeId));
      toast({
        title: 'Scheme removed',
        description: 'Scheme removed from your saved list',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-primary">SchemeSeva</h1>
              <nav className="hidden md:flex space-x-6">
                <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link to="/saved" className="flex items-center text-primary font-medium">
                  <Bookmark className="h-4 w-4 mr-2" />
                  My Schemes
                </Link>
                <Link to="/profile" className="flex items-center text-muted-foreground hover:text-foreground">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </nav>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">My Saved Schemes</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading saved schemes...</p>
          </div>
        ) : savedSchemes.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved schemes yet</h3>
            <p className="text-muted-foreground mb-4">
              Start exploring schemes and save the ones that interest you
            </p>
            <Button asChild>
              <Link to="/dashboard">Browse Schemes</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSchemes.map((savedScheme) => {
              const scheme = savedScheme.schemes;
              const deadlineStatus = getDeadlineStatus(scheme.deadline);
              return (
                <Card key={savedScheme.id} className="hover:shadow-lg transition-shadow">
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
                    </div>
                    <CardTitle className="text-lg">{scheme.name}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {scheme.description || 'No description available'}
                    </CardDescription>
                    <p className="text-xs text-muted-foreground mt-2">
                      Saved on {new Date(savedScheme.saved_at).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center gap-2">
                      {scheme.source_url && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <a href={scheme.source_url} target="_blank" rel="noopener noreferrer">
                            Learn More
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveScheme(savedScheme.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSchemes;