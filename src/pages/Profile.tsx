import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, User, Edit2 } from 'lucide-react';

const Profile = () => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [casteCommunity, setCasteCommunity] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setName(data.name || '');
        setGender(data.gender || '');
        setAge(data.age?.toString() || '');
        setCasteCommunity(data.caste_community || '');
        setOccupation(data.occupation || '');
        setEducation(data.education || '');
        setHasProfile(true);
      }
      setChecking(false);
    };

    checkProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const profileData = {
      user_id: user.id,
      name,
      gender,
      age: parseInt(age),
      caste_community: casteCommunity,
      occupation,
      education,
    };

    const { error } = hasProfile
      ? await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id)
      : await supabase
          .from('profiles')
          .insert(profileData);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: hasProfile ? 'Profile Updated!' : 'Profile Created!',
        description: hasProfile ? 'Your profile has been updated successfully.' : 'Your profile has been saved successfully.',
      });
      setHasProfile(true);
      setIsEditing(false);
      if (!hasProfile) {
        navigate('/dashboard');
      }
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {hasProfile ? 'Your Profile' : 'Complete Your Profile'}
            </CardTitle>
            <CardDescription>
              {hasProfile 
                ? 'View and manage your profile information' 
                : 'Help us find the best government schemes for you'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasProfile && !isEditing && (
              <div className="space-y-4 mb-6">
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="font-medium text-muted-foreground">Full Name</Label>
                    <p className="text-foreground">{name || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-muted-foreground">Age</Label>
                    <p className="text-foreground">{age || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-muted-foreground">Gender</Label>
                    <p className="text-foreground">{gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-muted-foreground">Caste/Community</Label>
                    <p className="text-foreground">{casteCommunity || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-muted-foreground">Occupation</Label>
                    <p className="text-foreground">{occupation || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-muted-foreground">Education</Label>
                    <p className="text-foreground">{education || 'Not provided'}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
            )}
            
            {(!hasProfile || isEditing) && (
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min="1"
                    max="120"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caste">Caste/Community</Label>
                  <Select value={casteCommunity} onValueChange={setCasteCommunity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="obc">OBC</SelectItem>
                      <SelectItem value="sc">SC</SelectItem>
                      <SelectItem value="st">ST</SelectItem>
                      <SelectItem value="ews">EWS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Select value={occupation} onValueChange={setOccupation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="farmer">Farmer</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="private_employee">Private Employee</SelectItem>
                      <SelectItem value="government_employee">Government Employee</SelectItem>
                      <SelectItem value="self_employed">Self Employed</SelectItem>
                      <SelectItem value="business">Business Owner</SelectItem>
                      <SelectItem value="homemaker">Homemaker</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary School</SelectItem>
                      <SelectItem value="secondary">Secondary School</SelectItem>
                      <SelectItem value="higher_secondary">Higher Secondary</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="graduation">Graduation</SelectItem>
                      <SelectItem value="post_graduation">Post Graduation</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                {hasProfile && isEditing && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {hasProfile ? 'Update Profile' : 'Save Profile & Continue'}
                </Button>
              </div>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;