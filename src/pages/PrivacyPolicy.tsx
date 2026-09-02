import { Clock, PieChart, Lock, Scale, Hand, Download, AlignLeft, XSquare, Mail } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="max-w-5xl mx-auto px-6 w-full py-16 pb-32">
      {/* Header */}
      <div className="flex flex-col items-center mb-16 text-center">
        <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 tracking-tight">Privacy Policy</h1>
        <p className="font-sans text-lg text-primary/70">
          Dedicated to digital stewardship and pastoral care. Your trust is our highest calling.
        </p>
        
        <div className="flex items-center gap-2 mt-8 text-secondary font-sans text-xs tracking-widest font-bold uppercase">
          <Clock size={14} />
          <span>Last Updated: Insert date</span>
        </div>
      </div>

      {/* Section 1 */}
      <div className="bg-surface border border-primary/10 rounded-xl p-8 mb-8 halo-border">
        <div className="flex items-center gap-3 mb-6">
          <Lock size={24} className="text-secondary" />
          <h2 className="font-serif text-3xl text-primary">Our Commitment to Spiritual Confidentiality</h2>
        </div>
        <p className="font-sans text-primary/80 leading-relaxed mb-6 max-w-4xl">
          At DLBC Church Connect, we understand that the conversations and data shared within our platform often carry the weight of spiritual and personal confession. We approach data protection not merely as a legal requirement, but as a sacred duty of stewardship.
        </p>
        <p className="font-sans text-primary/80 leading-relaxed max-w-4xl">
          This policy outlines our transparent approach to data collection, emphasizing minimal extraction and maximum protection.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          {/* Minimal Data Collection */}
          <div className="bg-surface border border-primary/10 rounded-xl p-8 halo-border">
            <div className="flex items-center gap-3 mb-8">
              <PieChart size={24} className="text-primary/70" />
              <h2 className="font-serif text-2xl text-primary">Minimal Data Collection</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-sans text-sm text-primary mb-2">Account Creation</h3>
                <p className="font-sans text-sm text-primary/70 leading-relaxed">
                  We collect only essential information: Name, Email, and Pastoral Affiliation. We do not aggregate behavioral data for third-party marketing.
                </p>
              </div>
              <div className="border-t border-primary/10 pt-6">
                <h3 className="font-sans text-sm text-primary mb-2">Session Data</h3>
                <p className="font-sans text-sm text-primary/70 leading-relaxed">
                  Temporary connection logs are maintained strictly for diagnostic and security purposes, automatically purged every 72 hours.
                </p>
              </div>
              <div className="border-t border-primary/10 pt-6">
                <h3 className="font-sans text-sm text-primary mb-2">Voluntary Disclosures</h3>
                <p className="font-sans text-sm text-primary/70 leading-relaxed">
                  Any notes or reflections you enter are stored locally on your device where possible, or encrypted at rest on our secure servers.
                </p>
              </div>
            </div>
          </div>

          {/* Confidentiality & Law */}
          <div className="bg-surface border border-primary/10 rounded-xl p-8 halo-border">
            <div className="flex items-center gap-3 mb-6">
              <Scale size={24} className="text-primary/70" />
              <h2 className="font-serif text-2xl text-primary">Confidentiality & Law</h2>
            </div>
            <p className="font-sans text-sm text-primary/80 leading-relaxed mb-6">
              We respect the ancient tradition of pastoral confidentiality. Data entered into private counseling modules is treated with the same sanctity as a closed-door session.
            </p>
            <div className="border-l-2 border-secondary pl-4 py-1 mt-6">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-secondary block mb-2">Legal Exceptions</span>
              <p className="font-sans text-sm text-primary/70 leading-relaxed">
                We will only disclose information without your consent if required by a valid legal subpoena, or in immediate, credible situations involving imminent risk of harm to self or others, as mandated by regional laws.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Encryption Standards */}
          <div className="bg-surface border border-primary/10 rounded-xl p-8 halo-border">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} className="text-secondary" />
              <h2 className="font-serif text-2xl text-primary">Encryption Standards</h2>
            </div>
            <p className="font-sans text-sm text-primary/80 leading-relaxed mb-6">
              We employ military-grade encryption to ensure your pastoral interactions remain private.
            </p>
            
            <div className="bg-background rounded p-6 mb-6">
              <div className="flex justify-between items-end border-b-[3px] border-secondary pb-3 mb-4">
                <span className="font-sans text-sm text-primary">In Transit</span>
                <span className="font-sans text-base font-bold text-secondary">TLS 1.3</span>
              </div>
              <div className="flex justify-between items-end border-b-[3px] border-secondary pb-3">
                <span className="font-sans text-sm text-primary">At Rest</span>
                <span className="font-sans text-base font-bold text-secondary">AES-256</span>
              </div>
            </div>

            <p className="font-serif text-sm text-primary/60 italic leading-relaxed">
              End-to-End Encryption (E2EE) is enabled by default for all direct messaging and video consultations.
            </p>
          </div>
          
          {/* Your Rights */}
          <div className="bg-surface border border-primary/10 rounded-xl p-8 halo-border flex-grow">
            <div className="flex items-center gap-3 mb-8">
              <Hand size={24} className="text-primary/70" />
              <h2 className="font-serif text-2xl text-primary">Your Rights</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 border border-primary/10 rounded p-4">
                <Download size={20} className="text-primary/70" />
                <span className="font-sans text-sm text-primary">Right to Access Data</span>
              </div>
              <div className="flex items-center gap-4 border border-primary/10 rounded p-4">
                <AlignLeft size={20} className="text-primary/70" />
                <span className="font-sans text-sm text-primary">Right to Rectification</span>
              </div>
              <div className="flex items-center gap-4 border border-secondary/20 bg-secondary/5 rounded p-4">
                <XSquare size={20} className="text-secondary" />
                <span className="font-sans text-sm text-secondary">Right to Erasure (Right to be Forgotten)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Block */}
      <div className="bg-surface-dim/40 rounded-xl p-12 flex flex-col items-center text-center mt-12 border border-primary/5">
        <h3 className="font-serif text-2xl text-primary mb-4">Questions about our stewardship of your data?</h3>
        <p className="font-sans text-sm text-primary/70 max-w-xl mb-8 leading-relaxed">
          Our Data Protection Officer is available to discuss any concerns regarding how DLBC Church Connect handles your sensitive information.
        </p>
        <button className="bg-primary hover:bg-primary/90 text-white font-sans text-sm font-medium px-6 py-3 rounded active-sink flex items-center gap-2 transition-colors">
          <Mail size={18} />
          Contact Privacy Team
        </button>
      </div>
    </div>
  );
}
