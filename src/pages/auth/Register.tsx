import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { auth, db } from '../../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, ArrowRight } from 'lucide-react';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';

export function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requestedRole, setRequestedRole] = useState<'member' | 'leader' | 'pastor'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const prefill = searchParams.get('email');
    if (prefill) {
      setEmail(prefill);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    } catch (err: any) {
      console.error('Registration Error:', err.code, err.message);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account already exists for this email. Please sign in instead.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters long.');
          break;
        case 'auth/invalid-email':
          setError('Please provide a valid email address.');
          break;
        default:
          setError(err.message || 'Failed to create account. Please try again.');
      }
      setLoading(false);
      isSubmittingRef.current = false;
      return;
    }

    try {
      await updateProfile(userCredential.user, {
        displayName: name.trim()
      });

      const isAdmin = cleanEmail === 'markeroladipo@gmail.com';
      const actualRole = isAdmin ? 'admin' : (requestedRole === 'member' ? 'member' : 'member');
      const needsApproval = !isAdmin && (requestedRole === 'leader' || requestedRole === 'pastor');

      const userDocPayload: any = {
        uid: userCredential.user.uid,
        displayName: name.trim(),
        email: cleanEmail,
        role: actualRole,
        requestedRole: requestedRole,
        pendingRoleApproval: needsApproval,
        createdAt: new Date().toISOString()
      };

      if (needsApproval) {
        userDocPayload.roleApprovalRequestedAt = new Date().toISOString();
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), userDocPayload);
    } catch (profileErr: any) {
      console.error('Profile creation error after successful auth.', profileErr);
      
      // Cleanup the orphaned auth user
      try {
        await userCredential.user.delete();
      } catch (deleteErr) {
        console.error('Failed to delete orphaned user', deleteErr);
      }
      
      setError('Failed to setup your profile. Please try again.');
      setLoading(false);
      isSubmittingRef.current = false;
      return;
    }

    setLoading(false);
    isSubmittingRef.current = false;
    
    const isAdmin = cleanEmail === 'markeroladipo@gmail.com';
    if (isAdmin) {
      navigate('/admin/roles');
    } else {
      navigate('/member/dashboard');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 w-full max-w-7xl mx-auto py-16">
      <div className="w-full max-w-md bg-surface rounded-2xl p-8 md:p-10 halo-border flex flex-col items-center text-center shadow-sm">
        
        <h1 className="font-serif text-3xl text-primary mb-6">Create Account</h1>

        {/* Google Sign Up Button */}
        <div className="w-full mb-6">
          <GoogleSignInButton
            text="Sign up with Google"
            desiredRole={requestedRole}
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
          <span className="font-sans text-[11px] text-primary/40 uppercase tracking-wider">Or register with email</span>
          <div className="flex-1 h-[1px] bg-primary/10"></div>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
          {error && (
            <div className="bg-[#b93c3c]/10 text-[#b93c3c] border border-[#b93c3c]/20 p-3.5 rounded-xl text-xs leading-relaxed">
              {error}
              {error.includes('already exists') && (
                <div className="mt-2 pt-2 border-t border-[#b93c3c]/20">
                  <Link to={`/auth/login?email=${encodeURIComponent(email)}`} className="font-bold underline">
                    Sign in with this email &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="block font-sans text-xs font-bold uppercase tracking-wider text-primary/80" htmlFor="name">
              Full Name
            </label>
            <input 
              id="name" 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#e2dcce] focus:border-[#1c202e] focus:ring-1 focus:ring-[#1c202e] rounded-xl text-sm px-3.5 py-2.5 outline-none transition-colors" 
              placeholder="e.g. John Doe" 
              required 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block font-sans text-xs font-bold uppercase tracking-wider text-primary/80" htmlFor="email">
              Email Address
            </label>
            <input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#e2dcce] focus:border-[#1c202e] focus:ring-1 focus:ring-[#1c202e] rounded-xl text-sm px-3.5 py-2.5 outline-none transition-colors" 
              placeholder="you@example.com" 
              required 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block font-sans text-xs font-bold uppercase tracking-wider text-primary/80" htmlFor="password">
              Password (6+ characters)
            </label>
            <input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#e2dcce] focus:border-[#1c202e] focus:ring-1 focus:ring-[#1c202e] rounded-xl text-sm px-3.5 py-2.5 outline-none transition-colors" 
              placeholder="••••••••" 
              minLength={6}
              required 
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="block font-sans text-xs font-bold uppercase tracking-wider text-primary/80">
              Account Purpose / Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRequestedRole('member')}
                className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  requestedRole === 'member'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-primary/70 border-[#e2dcce] hover:border-primary/40'
                }`}
              >
                Church Member
              </button>
              <button
                type="button"
                onClick={() => setRequestedRole('leader')}
                className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  requestedRole === 'leader'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-primary/70 border-[#e2dcce] hover:border-primary/40'
                }`}
              >
                Ministry Leader
              </button>
              <button
                type="button"
                onClick={() => setRequestedRole('pastor')}
                className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  requestedRole === 'pastor'
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-primary/70 border-[#e2dcce] hover:border-primary/40'
                }`}
              >
                Pastor
              </button>
            </div>
            {requestedRole !== 'member' && (
              <p className="text-[11px] text-primary/60 italic pt-1 leading-snug">
                Note: Leader &amp; Pastor accounts activate as member accounts and receive pastoral dashboard privileges upon verification by the administrator.
              </p>
            )}
          </div>
          
          <div className="pt-3">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e232a] text-white hover:bg-[#2c323b] py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Begin Sanctuary Journey <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center w-full pt-4 border-t border-primary/10">
          <p className="font-sans text-xs text-primary/70">
            Already walking with us? 
            <Link to="/auth/login" className="text-primary font-bold hover:text-[#b93c3c] transition-colors ml-1.5 uppercase tracking-wider">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

