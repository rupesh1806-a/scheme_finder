import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              Government Scheme Discovery Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Discover the Government
              <span className="text-primary block">Schemes You Qualify For</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Personalized scheme recommendations based on your profile. Never miss out on benefits you're entitled to.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/auth">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Learn More
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Comprehensive Database</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access to hundreds of government schemes across education, healthcare, employment, and more.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Personalized Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get scheme recommendations tailored to your age, occupation, education, and background.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Deadline Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Never miss application deadlines with our smart notification system for saved schemes.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How SchemeSeva Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Create Your Profile</h3>
              <p className="text-muted-foreground">
                Tell us about yourself - age, occupation, education, and background
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Get Recommendations</h3>
              <p className="text-muted-foreground">
                Our system matches you with relevant government schemes
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Apply & Track</h3>
              <p className="text-muted-foreground">
                Save schemes and get alerts for upcoming deadlines
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Discover Your Benefits?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who have already found schemes they qualify for
          </p>
          <Button size="lg" asChild className="text-lg px-8">
            <Link to="/auth">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 SchemeSeva. Empowering citizens through information.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
