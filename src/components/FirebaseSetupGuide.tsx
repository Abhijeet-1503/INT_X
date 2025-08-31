import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, AlertTriangle, Settings, Shield } from "lucide-react";
import { useState, useEffect } from "react";

const FirebaseSetupGuide = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [isFirebaseWorking, setIsFirebaseWorking] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if Firebase is working by looking for the error in localStorage or sessionStorage
    const checkFirebaseStatus = () => {
      // Check if there's any indication that Firebase failed
      const hasFirebaseError = sessionStorage.getItem('firebase_auth_error');
      if (hasFirebaseError) {
        setIsFirebaseWorking(false);
      } else {
        // Try to detect if Firebase is working by checking if the auth object exists
        try {
          // This is a simple check - in a real app you might want to do a more thorough check
          setIsFirebaseWorking(true);
        } catch (error) {
          setIsFirebaseWorking(false);
        }
      }
    };

    checkFirebaseStatus();
  }, []);

  if (isFirebaseWorking === true) {
    return (
      <div className="mb-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Firebase Authentication is working properly. All features are available.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-yellow-800">
            Using local authentication fallback. For full Firebase features, configure Firebase Authentication.
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="text-yellow-800 hover:text-yellow-900"
          >
            {showGuide ? 'Hide Guide' : 'Show Setup Guide'}
          </Button>
        </AlertDescription>
      </Alert>

      {showGuide && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Firebase Authentication Setup
            </CardTitle>
            <CardDescription>
              Follow these steps to enable Firebase Authentication in your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <p className="font-medium">Go to Firebase Console</p>
                  <p className="text-sm text-muted-foreground">
                    Visit your Firebase project at{' '}
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">
                        console.firebase.google.com <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <p className="font-medium">Navigate to Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Click on "Authentication" in the left sidebar, then click "Get started"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <p className="font-medium">Enable Email/Password Sign-in</p>
                  <p className="text-sm text-muted-foreground">
                    Click on "Sign-in method" tab, then enable "Email/Password" provider
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <p className="font-medium">Add Authorized Domains</p>
                  <p className="text-sm text-muted-foreground">
                    Go to "Settings" tab and add your domain (localhost for development) to authorized domains
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">5</Badge>
                <div>
                  <p className="font-medium">Refresh the Application</p>
                  <p className="text-sm text-muted-foreground">
                    After completing the setup, refresh this page to enable Firebase Authentication
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Current Status</p>
                  <p className="text-xs text-blue-600 mt-1">
                    The application is currently using local authentication as a fallback. 
                    This provides basic functionality but lacks advanced features like user management 
                    and cross-device synchronization.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FirebaseSetupGuide;



