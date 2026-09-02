import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FormEvent, useState, useRef, useEffect } from 'react';
import { auth, db, UserProfile } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ArrowRight, Mail, Lock, User, Loader2 } from 'lucide-react';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';

interface DemoAccount {
  label: string;
  email: string;
  name: string;
  role: 'member' | 'leader' | 'pastor' | 'admin';
  leaderType?: 'pastoral' | 'youth' | 'children';
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Member',
    email: 'member@dlbc.org',
    name: 'Bro. Emmanuel Johnson',
    role: 'member'
  },
  {
    label: 'Youth Leader',
    email: 'leader@dlbc.org',
    name: 'Sister Grace Adeyemi',
    role: 'leader',
    leaderType: 'youth'
  },
  {
    label: 'Pastor',
    email: 'pastor@dlbc.org',
    name: 'Pastor Samuel Olatunji',
    role: 'pastor',
    leaderType: 'pastoral'
  }
];

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickAction, setQuickAction] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const prefilledEmail = searchParams.get('email');
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [searchParams]);

  // Helper to ensure initial weekly schedule exists for leaders
  const ensureLeaderAvailability = async (leaderId: string) => {
    try {
      const availRef = doc(db, 'availability', leaderId);
      const availSnap = await getDoc(availRef);
      if (!availSnap.exists()) {
        const defaultSlots = ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];
        await setDoc(availRef, {
          leaderId,
          weeklySchedule: {
            Monday: { enabled: true, slots: defaultSlots },
            Tuesday: { enabled: true, slots: defaultSlots },
            Wednesday: { enabled: true, slots: defaultSlots },
            Thursday: { enabled: true, slots: defaultSlots },
            Friday: { enabled: true, slots: defaultSlots },
            Saturday: { enabled: true, slots: ["10:00 AM", "02:00 PM"] },
            Sunday: { enabled: true, slots: ["02:00 PM", "03:30 PM", "05:00 PM"] }
          },
          blackoutDates: [],
          updatedAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Could not seed availability:", e);
    }
  };

  const authenticateOrAutoRegister = async (cleanEmail: string, pass: string, demoMeta?: DemoAccount) => {
    let userCredential;
    
    try {
      // First attempt standard sign in
      userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (signInErr: any) {
      if (signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-login-credentials') {
        // Try creating user seamlessly
        try {
          userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            // The user exists, but password was incorrect
            const passErr: any = new Error('Incorrect password. Please check your password or use a quick demo login.');
            passErr.code = 'auth/wrong-password';
            throw passErr;
          } else {
            throw createErr;
          }
        }
      } else {
        throw signInErr;
      }
    }

    const uid = userCredential.user.uid;
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    let role: string = 'member';
    const isAdminEmail = cleanEmail === 'markeroladipo@gmail.com';

    if (userDoc.exists()) {
      const data = userDoc.data() as UserProfile;
      role = data.role || 'member';
      if (isAdminEmail && role !== 'admin') {
        await setDoc(userDocRef, { role: 'admin' }, { merge: true });
        role = 'admin';
      }
    } else {
      const demoConfig = demoMeta || DEMO_ACCOUNTS.find(d => d.email.toLowerCase() === cleanEmail);
      const assignedRole = isAdminEmail ? 'admin' : (demoConfig ? demoConfig.role : 'member');
      const assignedName = demoConfig ? demoConfig.name : (cleanEmail.split('@')[0]);

      try {
        await updateProfile(userCredential.user, { displayName: assignedName });
      } catch (pErr) {
        console.warn('Profile name update skipped:', pErr);
      }

      const newUserData: any = {
        uid,
        displayName: assignedName,
        email: cleanEmail,
        role: assignedRole,
        createdAt: new Date().toISOString()
      };

      if (demoConfig?.leaderType) {
        newUserData.leaderType = demoConfig.leaderType;
      }

      await setDoc(userDocRef, newUserData);
      role = assignedRole;

      if (role === 'leader' || role === 'pastor') {
        await ensureLeaderAvailability(uid);
      }
    }

    if (role === 'leader' || role === 'pastor') {
      await ensureLeaderAvailability(uid);
    }

    return role;
  };

  const handleQuickDemoLogin = async (demo: DemoAccount) => {
    if (loading) return;
    setError('');
    setLoading(true);
    setQuickAction(demo.label);
    setEmail(demo.email);
    setPassword('password123');

    try {
      const role = await authenticateOrAutoRegister(demo.email.toLowerCase(), 'password123', demo);
      
      if (role === 'admin') {
        navigate('/admin/roles');
      } else if (role === 'pastor') {
        navigate('/pastor/dashboard');
      } else if (role === 'leader') {
        navigate('/leader/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err: any) {
      console.error('Demo Login Error:', err);
      setError('Unable to log in to demo account. Please try again.');
    } finally {
      setLoading(false);
      setQuickAction(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setError('');
    setLoading(true);
    
    const cleanEmail = email.trim().toLowerCase();

    try {
      const role = await authenticateOrAutoRegister(cleanEmail, password);
      
      if (role === 'admin' || cleanEmail === 'markeroladipo@gmail.com') {
        navigate('/admin/roles');
      } else if (role === 'pastor') {
        navigate('/pastor/dashboard');
      } else if (role === 'leader') {
        navigate('/leader/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err: any) {
      console.error('Login Error:', err.code, err.message);
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Invalid email or password. If you do not have an account yet, please click "Create an account" below.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Please wait a moment and try again.');
          break;
        default:
          setError(err.message || 'Failed to sign in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 w-full max-w-7xl mx-auto py-16">
      <div className="w-full max-w-md bg-surface rounded-2xl p-8 md:p-10 halo-border flex flex-col items-center text-center shadow-sm">
        
        <h1 className="font-serif text-3xl text-primary mb-6">Sign In</h1>

        {/* Google Sign In Button */}
        <div className="w-full mb-6">
          <GoogleSignInButton
            onSuccess={(userRole) => {
              if (userRole === 'admin') {
                navigate('/admin/roles');
              } else if (userRole === 'pastor') {
                navigate('/pastor/dashboard');
              } else if (userRole === 'leader') {
                navigate('/leader/dashboard');
              } else {
                navigate('/member/dashboard');
              }
            }}
            onError={(msg) => setError(msg)}
          />
        </div>

        <div className="w-full flex items-center gap-3 mb-6">
          <div className="flex-1 h-[1px] bg-primary/10"></div>
          <span className="font-sans text-[11px] text-primary/40 uppercase tracking-wider">Or quick demo access</span>
          <div className="flex-1 h-[1px] bg-primary/10"></div>
        </div>

        {/* 1-Click Quick Demo Sign-Ins */}
        <div className="w-full mb-6 p-4 rounded-xl bg-[#faf8f5] border border-primary/10 text-left">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-sans text-[11px] font-bold text-primary/70 uppercase tracking-widest">
              Quick Demo Access
            </span>
            <span className="font-sans text-[10px] text-primary/50">One-click sign in</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((demo) => (
              <button
                key={demo.label}
                type="button"
                disabled={loading}
                onClick={() => handleQuickDemoLogin(demo)}
                className="px-2.5 py-2 rounded-lg bg-white border border-primary/15 hover:border-[#1c202e] hover:bg-primary/[0.02] transition-all text-left group shadow-sm disabled:opacity-60"
              >
                <span className="block font-sans text-xs font-semibold text-primary group-hover:text-[#b93c3c] transition-colors truncate">
                  {quickAction === demo.label ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                  {demo.label}
                </span>
                <span className="block font-sans text-[10px] text-primary/50 truncate capitalize">
                  {demo.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full flex items-center gap-3 mb-6">
          <div className="flex-1 h-[1px] bg-primary/10"></div>
          <span className="font-sans text-[11px] text-primary/40 uppercase tracking-wider">Or sign in with email</span>
          <div className="flex-1 h-[1px] bg-primary/10"></div>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
          {error && (
            <div className="bg-[#b93c3c]/10 text-[#b93c3c] border border-[#b93c3c]/20 p-3.5 rounded-xl text-xs leading-relaxed">
              {error}
              <div className="mt-2 pt-2 border-t border-[#b93c3c]/20 flex justify-between items-center">
                <span>New here?</span>
                <Link
                  to={`/auth/register?email=${encodeURIComponent(email)}`}
                  className="font-bold underline hover:opacity-80"
                >
                  Create Account Now &rarr;
                </Link>
              </div>
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block font-sans text-xs font-bold uppercase tracking-wider text-primary/80" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-[#e2dcce] focus:border-[#1c202e] focus:ring-1 focus:ring-[#1c202e] rounded-xl text-sm px-3.5 py-2.5 outline-none transition-colors" 
                placeholder="you@dlbc.org" 
                required
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center w-full">
              <label className="block font-sans text-xs font-bold uppercase tracking-wider text-primary/80" htmlFor="password">
                Password
              </label>
            </div>
            <input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#e2dcce] focus:border-[#1c202e] focus:ring-1 focus:ring-[#1c202e] rounded-xl text-sm px-3.5 py-2.5 outline-none transition-colors" 
              placeholder="••••••••" 
              required
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#1e232a] text-white hover:bg-[#2c323b] py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {loading && !quickAction ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center w-full pt-4 border-t border-primary/10">
          <p className="font-sans text-xs text-primary/70">
            Seeking connection? 
            <Link to="/auth/register" className="text-primary font-bold hover:text-[#b93c3c] transition-colors ml-1.5 uppercase tracking-wider">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

