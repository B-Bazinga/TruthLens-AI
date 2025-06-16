
import { Shield, Menu, User, LogOut, History, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const scrollToSection = (sectionId: string) => {
    // Only scroll if we're on the home page
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page with hash
      navigate(`/#${sectionId}`);
    }
    setIsMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isOnHomePage = location.pathname === '/';
  const isHistoryPage = location.pathname === '/history';
  const isProfilePage = location.pathname === '/profile';

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">TruthLens</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('analyzer')}
              className={`text-foreground/80 hover:text-foreground transition-all duration-200 cursor-pointer px-3 py-2 rounded-md hover:bg-accent hover:shadow-md border border-transparent hover:border-border ${isOnHomePage ? 'font-bold' : ''}`}
            >
              Analyzer
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className={`text-foreground/80 hover:text-foreground transition-all duration-200 cursor-pointer px-3 py-2 rounded-md hover:bg-accent hover:shadow-md border border-transparent hover:border-border ${isOnHomePage ? 'font-bold' : ''}`}
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className={`text-foreground/80 hover:text-foreground transition-all duration-200 cursor-pointer px-3 py-2 rounded-md hover:bg-accent hover:shadow-md border border-transparent hover:border-border ${isOnHomePage ? 'font-bold' : ''}`}
            >
              How It Works
            </button>
            {user && (
              <Link 
                to="/history" 
                className={`text-foreground/80 hover:text-foreground transition-all duration-200 px-3 py-2 rounded-md hover:bg-accent hover:shadow-md border border-transparent hover:border-border ${isHistoryPage ? 'font-bold' : ''}`}
              >
                History
              </Link>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hover:bg-accent hover:shadow-md border border-transparent hover:border-border transition-all duration-200"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-accent hover:shadow-md border border-transparent hover:border-border transition-all duration-200">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">
                      {user.user_metadata?.username || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className={`flex items-center space-x-2 ${isProfilePage ? 'font-bold' : ''}`}>
                      <User className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history" className={`flex items-center space-x-2 ${isHistoryPage ? 'font-bold' : ''}`}>
                      <History className="h-4 w-4" />
                      <span>Analysis History</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-accent hover:shadow-md border border-transparent hover:border-border transition-all duration-200" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2">
            <button 
              onClick={() => scrollToSection('analyzer')}
              className={`block py-2 text-foreground/80 hover:text-foreground transition-all duration-200 w-full text-left px-3 rounded-md hover:bg-accent hover:shadow-md border border-transparent hover:border-border ${isOnHomePage ? 'font-bold' : ''}`}
            >
              Analyzer
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className={`block py-2 text-foreground/80 hover:text-foreground transition-all duration-200 w-full text-left px-3 rounded-md hover:bg-accent hover:shadow-md border border-transparent hover:border-border ${isOnHomePage ? 'font-bold' : ''}`}
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className={`block py-2 text-foreground/80 hover:text-foreground transition-all duration-200 w-full text-left px-3 rounded-md hover:bg-accent hover:shadow-md border border-transparent hover:border-border ${isOnHomePage ? 'font-bold' : ''}`}
            >
              How It Works
            </button>
            {user && (
              <>
                <button 
                  onClick={() => handleNavigation('/history')}
                  className={`block py-2 text-foreground/80 hover:text-foreground transition-all duration-200 w-full text-left px-3 rounded-md hover:bg-accent hover:shadow-md border border-transparent hover:border-border ${isHistoryPage ? 'font-bold' : ''}`}
                >
                  History
                </button>
                <button 
                  onClick={() => handleNavigation('/profile')}
                  className={`block py-2 text-foreground/80 hover:text-foreground transition-all duration-200 w-full text-left px-3 rounded-md hover:bg-accent hover:shadow-md border border-transparent hover:border-border ${isProfilePage ? 'font-bold' : ''}`}
                >
                  Profile Settings
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
