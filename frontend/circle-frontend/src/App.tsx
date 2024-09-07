import { useState } from 'react';
import { ModeToggle } from './components/mode-toggle';
import { useTheme } from './components/theme-provider';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Login } from './components/login';
import { Register } from './components/register';
import { Dashboard } from './components/dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { theme } = useTheme();

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{isLoggedIn ? 'Dashboard' : (showRegister ? 'Register' : 'Login')}</CardTitle>
          <CardDescription>
            {isLoggedIn ? 'Welcome to the Space Trade System' : 'Enter your credentials'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoggedIn ? (
            <Dashboard onLogout={handleLogout} />
          ) : showRegister ? (
            <Register onRegisterSuccess={() => setShowRegister(false)} />
          ) : (
            <Login onLoginSuccess={handleLogin} />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {!isLoggedIn && (
            <Button variant="outline" onClick={() => setShowRegister(!showRegister)}>
              {showRegister ? 'Back to Login' : 'Register'}
            </Button>
          )}
          <ModeToggle />
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;