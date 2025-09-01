import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Shield, User, UserCheck, Crown } from "lucide-react";
import { toast } from "sonner";
import FirebaseSetupGuide from "@/components/FirebaseSetupGuide";

// Demo credentials have been removed for security best practices

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<'student' | 'proctor' | 'admin'>('student');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signUp(email, password, displayName, role);
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const quickSignUp = async (presetRole: 'student' | 'proctor' | 'admin') => {
    const timestamp = Date.now();
    const quickEmail = `${presetRole}${timestamp}@smartproctor.com`;
    const quickPassword = `${presetRole}123`;
    const quickName = `${presetRole.charAt(0).toUpperCase() + presetRole.slice(1)} User`;
    
    setLoading(true);
    setError("");

    try {
      await signUp(quickEmail, quickPassword, quickName, presetRole);
      toast.success(`${presetRole} account created successfully!`);
      navigate("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4">
      <div className="w-full max-w-md space-y-6">
        <FirebaseSetupGuide />
        <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">SmartProctor-X</CardTitle>
          <CardDescription>
            Advanced AI-Powered Proctoring Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Demo Credentials Section Removed for Security */}

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {/* Quick Sign Up Options */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Quick Sign Up</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickSignUp('student')}
                    disabled={loading}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <User className="w-4 h-4 text-green-500" />
                    <span className="text-xs">Student</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickSignUp('proctor')}
                    disabled={loading}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <UserCheck className="w-4 h-4 text-blue-500" />
                    <span className="text-xs">Proctor</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => quickSignUp('admin')}
                    disabled={loading}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs">Admin</span>
                  </Button>
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-muted-foreground">or create custom account below</span>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your full name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'student' | 'proctor' | 'admin')}
                  >
                    <option value="student">Student</option>
                    <option value="proctor">Proctor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Auth;
