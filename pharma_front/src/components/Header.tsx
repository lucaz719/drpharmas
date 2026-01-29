import { useState, useEffect } from "react";
import { Bell, User, LogOut, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { authService, UserProfile } from "@/services/authService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Test - force show modal after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Auto showing search modal for test');
      setShowSearchModal(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await authService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Fallback to localStorage data
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        setUserProfile(JSON.parse(storedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setSearchLoading(true);
        try {
          const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/pos/search/?q=${encodeURIComponent(searchQuery)}`;
          
          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout properly",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <header className="bg-header text-header-foreground shadow-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-header-foreground hover:bg-header-foreground/10"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center overflow-hidden">
                <img
                  src="/drpharmaslogo.png"
                  alt="DrPharmas Logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold">drpharmas</h1>
                <p className="text-xs text-header-foreground/70">Loading...</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-header text-header-foreground shadow-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-header-foreground hover:bg-header-foreground/10"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center overflow-hidden">
              <img
                src="/drpharmaslogo.png"
                alt="DrPharmas Logo"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold">drpharmas</h1>
              <div className="flex items-center space-x-2 text-xs text-header-foreground/70">
                {userProfile?.organization_name && (
                  <>
                    <span>{userProfile.organization_name}</span>
                    {userProfile.branch_name && (
                      <>
                        <span>•</span>
                        <span>{userProfile.branch_name}</span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="p-2 bg-red-500 text-white hover:bg-red-600 rounded border-2 border-yellow-400"
            onClick={() => {
              console.log('Search button clicked - 4903');
              alert('Search clicked!');
              setShowSearchModal(true);
            }}
            title="Global Search"
            style={{ minWidth: '40px', minHeight: '40px' }}
          >
            <Search size={18} />
          </button>
          
          <Button variant="ghost" size="sm" className="text-header-foreground hover:bg-header-foreground/10">
            <Bell size={18} />
            <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">3</Badge>
          </Button>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <User size={14} className="text-primary-foreground" />
            </div>
            <div className="hidden md:block text-right">
              <div className="font-medium">{userProfile?.name || 'User'}</div>
              <div className="text-xs text-header-foreground/70 flex items-center space-x-1">
                <span>{userProfile?.role_display || userProfile?.role?.replace('_', ' ')}</span>
                {userProfile?.branch_name && (
                  <>
                    <span>•</span>
                    <span>{userProfile.branch_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-header-foreground hover:bg-header-foreground/10"
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
      
      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Global Search</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSearchModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search patients, medicines, suppliers, sales..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {searchLoading ? (
                  <div className="text-center text-gray-500 py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : searchQuery.length >= 2 ? (
                  searchResults.length > 0 ? (
                    searchResults.map((result, index) => (
                      <div 
                        key={`${result.type}-${result.id || index}`}
                        className="p-3 border rounded hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          if (result.url) {
                            navigate(result.url);
                            setShowSearchModal(false);
                            setSearchQuery('');
                            setSearchResults([]);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{result.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{result.description}</div>
                          </div>
                          <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">{result.type}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <div>No results found for "{searchQuery}"</div>
                      <div className="text-xs mt-1">Try different keywords</div>
                    </div>
                  )
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div>Start typing to search</div>
                    <div className="text-xs mt-1">Patients, medicines, suppliers, and more...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}