import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Stethoscope, Pill, Heart, Loader2, Eye, EyeOff } from "lucide-react";
import heroImage from "@/assets/hero.png";
import logoImage from "/drpharmaslogo.png";
import { useToast } from "@/hooks/use-toast";
import { authAPI, subscriptionAPI } from "@/services/api";
import { getRoleDisplayName } from "@/data/mockData";

export default function LoginModern() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if already logged in
    const currentUser = localStorage.getItem('currentUser');
    const accessToken = localStorage.getItem('access_token');

    if (currentUser && accessToken) {
      const user = JSON.parse(currentUser);
      if (user.role === 'super_admin') {
        navigate('/superadmin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
      return;
    }

    // Load remembered credentials
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    if (rememberedPassword) {
      setPassword(rememberedPassword);
    }

    const canvas = document.getElementById('particles') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number, y: number, vx: number, vy: number, size: number }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      if (response.success && response.data) {
        const { user, tokens } = response.data;

        // Store tokens temporarily for subscription check
        localStorage.setItem("access_token", tokens.access);
        localStorage.setItem("refresh_token", tokens.refresh);
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("userEmail", user.email);

        if (user.organization_id) {
          localStorage.setItem("selectedOrganization", user.organization_id.toString());
        }

        // Skip subscription check for now - allow login
        // TODO: Implement proper subscription validation after fixing API

        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPassword", password);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }

        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.first_name} ${user.last_name}!`,
        });

        // Force immediate navigation
        setTimeout(() => {
          if (user.role === 'super_admin') {
            window.location.href = "/superadmin/dashboard";
          } else {
            window.location.href = "/";
          }
        }, 100);
      } else {
        toast({
          title: "Authentication Failed",
          description: response.message || "Please check your credentials and try again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Connection Error",
        description: error.response?.data?.message || "Unable to connect. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex relative overflow-hidden">
      <canvas id="particles" className="absolute inset-0 pointer-events-none" />

      {/* Left Column - Medical Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 text-center space-y-8">
          {/* Hero Image */}
          <div className="relative w-96 h-96 mx-auto">
            <img
              src={heroImage}
              alt="DrPharmas Hero"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <h1 className="text-5xl font-extrabold text-white tracking-tight">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Dr
              </span>
              <span className="text-blue-300">
                Pharmas
              </span>
            </h1>

            <p className="text-slate-300 max-w-lg mx-auto text-lg leading-relaxed">
              Streamline your pharmacy operations with our comprehensive management system designed for modern healthcare providers.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto overflow-hidden">
              <img
                src={logoImage}
                alt="DrPharmas Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Dr
              </span>
              <span className="text-blue-300">
                Pharmas
              </span>
            </h1>
          </div>

          {/* Login Form */}
          <div className="space-y-6 p-8 border border-white/20 rounded-lg backdrop-blur-sm">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-slate-300">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 focus:border-white/40 focus:bg-white/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-4 pr-12 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 focus:border-white/40 focus:bg-white/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/40"
                />
                <Label htmlFor="rememberMe" className="text-sm text-slate-300 cursor-pointer">
                  Remember my credentials
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}