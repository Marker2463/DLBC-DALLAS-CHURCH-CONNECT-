import { Link, useNavigate } from 'react-router-dom';
import { X, CheckCircle2 } from 'lucide-react';

export function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Custom Header */}
      <header className="w-full flex justify-between items-center px-6 py-6 border-b border-primary/5">
        <Link to="/" className="font-serif text-xl font-bold text-[#1c202e] tracking-tight hover:opacity-80 transition-opacity">
          DLBC Church Connect
        </Link>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-primary hover:bg-surface-dim px-3 py-2 rounded transition-colors font-sans text-sm font-medium cursor-pointer"
        >
          <X size={18} />
          Close
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-6 py-16 pb-32 flex flex-col md:flex-row gap-16">
        
        {/* Left Sidebar Content Outline */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white border border-primary/10 rounded-xl p-6 shadow-sm sticky top-8">
            <h3 className="font-sans text-xs text-primary font-bold uppercase tracking-widest mb-6">Contents</h3>
            <nav className="flex flex-col gap-4">
              <a href="#section-1" className="flex items-center gap-4 group">
                <span className="font-serif text-sm text-primary/30 group-hover:text-secondary transition-colors">01</span>
                <span className="font-sans text-sm text-primary/70 group-hover:text-primary transition-colors">Acceptance of Terms</span>
              </a>
              <a href="#section-2" className="flex items-center gap-4 group">
                <span className="font-serif text-sm text-primary/30 group-hover:text-secondary transition-colors">02</span>
                <span className="font-sans text-sm text-primary/70 group-hover:text-primary transition-colors">Scope of Digital Pastoral Care</span>
              </a>
              <a href="#section-3" className="flex items-center gap-4 group">
                <span className="font-serif text-sm text-primary/30 group-hover:text-secondary transition-colors">03</span>
                <span className="font-sans text-sm text-primary/70 group-hover:text-primary transition-colors">User Responsibilities</span>
              </a>
              <a href="#section-4" className="flex items-center gap-4 group">
                <span className="font-serif text-sm text-primary/30 group-hover:text-secondary transition-colors">04</span>
                <span className="font-sans text-sm text-primary/70 group-hover:text-primary transition-colors">Limitation of Liability</span>
              </a>
            </nav>
          </div>
        </aside>

        {/* Right Content */}
        <div className="flex-grow max-w-3xl">
          {/* Header section in content */}
          <div className="mb-16 text-center">
            <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 tracking-tight">Terms of Service</h1>
            <p className="font-sans text-lg text-primary/70 leading-relaxed mb-6">
              Governing your use of PastoralConnect, ensuring a secure and respectful environment for digital stewardship.
            </p>
            <span className="font-sans text-xs text-primary/50 font-bold uppercase tracking-widest">
              LAST UPDATED: OCTOBER 24, 2024
            </span>
          </div>

          <div className="space-y-16">
            {/* Section 1 */}
            <section id="section-1">
              <h2 className="flex items-baseline gap-4 mb-6">
                <span className="font-serif text-4xl text-primary/20">01</span>
                <span className="font-serif text-3xl text-primary">Acceptance of Terms</span>
              </h2>
              <div className="font-sans text-primary/80 leading-relaxed space-y-4">
                <p>
                  By accessing or using the PastoralConnect platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service. These terms constitute a legally binding agreement between you and PastoralConnect regarding your use of the platform.
                </p>
                <p>
                  We reserve the right to update or modify these terms at any time without prior notice. Your continued use of the platform following any changes indicates your acceptance of the new terms.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="pt-8 border-t border-primary/10">
              <h2 className="flex items-baseline gap-4 mb-6">
                <span className="font-serif text-4xl text-primary/20">02</span>
                <span className="font-serif text-3xl text-primary">Scope of Digital Pastoral Care</span>
              </h2>
              <div className="font-sans text-primary/80 leading-relaxed space-y-6">
                <p>
                  PastoralConnect provides a digital sanctuary for pastoral care, counseling, and community support. The platform facilitates communication between spiritual leaders and individuals seeking guidance.
                </p>
                <div className="bg-surface border-l-[3px] border-secondary p-6 rounded-r-md">
                  <p className="font-serif text-sm text-primary/90 italic leading-relaxed">
                    Important Notice: The guidance provided through PastoralConnect is spiritual and pastoral in nature. It is not a substitute for professional medical, psychological, or legal advice. In emergencies, please contact appropriate emergency services.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="pt-8 border-t border-primary/10">
              <h2 className="flex items-baseline gap-4 mb-6">
                <span className="font-serif text-4xl text-primary/20">03</span>
                <span className="font-serif text-3xl text-primary">User Responsibilities</span>
              </h2>
              <p className="font-sans text-primary/80 leading-relaxed mb-6">
                Users are expected to maintain an environment of respect and confidentiality. As a platform dedicated to stewardship and care, we require all interactions to reflect these values.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-secondary shrink-0 mt-0.5" />
                  <span className="font-sans text-primary/80">Provide accurate and current information during registration.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-secondary shrink-0 mt-0.5" />
                  <span className="font-sans text-primary/80">Maintain the confidentiality of your account credentials.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-secondary shrink-0 mt-0.5" />
                  <span className="font-sans text-primary/80">Engage with others in a respectful, non-abusive manner.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-secondary shrink-0 mt-0.5" />
                  <span className="font-sans text-primary/80">Refrain from using the platform for unauthorized commercial purposes.</span>
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="pt-8 border-t border-primary/10">
              <h2 className="flex items-baseline gap-4 mb-6">
                <span className="font-serif text-4xl text-primary/20">04</span>
                <span className="font-serif text-3xl text-primary">Limitation of Liability</span>
              </h2>
              <p className="font-sans text-primary/80 leading-relaxed">
                To the maximum extent permitted by applicable law, PastoralConnect shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your access to or use of or inability to access or use the platform.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer Custom to Terms page */}
      <footer className="w-full pt-16 pb-12 px-6 flex flex-col gap-4 max-w-5xl mx-auto bg-background mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          <div className="font-serif text-2xl text-primary">DLBC Church Connect</div>
          <nav className="flex flex-wrap gap-x-6 gap-y-4">
            <Link to="/privacy" className="font-sans text-xs text-primary/70 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="font-sans text-xs text-primary/70 hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/ministry-guidelines" className="font-sans text-xs text-primary/70 hover:text-primary transition-colors">Ministry Guidelines</Link>
            <Link to="/support" className="font-sans text-xs text-primary/70 hover:text-primary transition-colors">Contact Support</Link>
          </nav>
        </div>
        
        <div className="w-full h-px bg-primary/10 mb-8" />
        
        <div className="text-center font-sans text-xs text-primary/70">
          © {new Date().getFullYear()} DLBC Church Connect. Dedicated to digital stewardship and pastoral care.
        </div>
      </footer>
    </div>
  );
}
