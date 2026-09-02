import { Link } from 'react-router-dom';
import { Heart, Clock } from 'lucide-react';

export function Landing() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="py-32 px-6 relative flex flex-col items-center text-center w-full max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl md:text-7xl text-primary mb-8 leading-tight tracking-tight">
          Faithful Guidance for Life’s Deepest Journeys.
        </h1>
        <p className="font-sans text-lg md:text-xl text-primary/70 mb-12 max-w-2xl mx-auto leading-relaxed">
          A digital sanctuary designed to provide confidential, compassionate pastoral care when you need it most. Connect securely with trusted spiritual leadership.
        </p>
        <Link 
          to="/auth/login" 
          className="bg-primary text-white font-sans text-base font-medium px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors active-sink shadow-sm"
        >
          Begin Consultation
        </Link>
      </section>

      {/* Trust Bar */}
      <section className="w-full py-16 border-y border-primary/5 bg-surface">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-center gap-12 md:gap-24 text-center">
          <div>
            <span className="block font-sans text-xs font-semibold text-secondary tracking-[0.2em] uppercase mb-2">Experience</span>
            <span className="font-sans text-lg text-primary">40+ Years of Ministry</span>
          </div>
          <div>
            <span className="block font-sans text-xs font-semibold text-secondary tracking-[0.2em] uppercase mb-2">Ministry</span>
            <span className="font-sans text-lg text-primary">Dedicated Pastoral Care</span>
          </div>
          <div>
            <span className="block font-sans text-xs font-semibold text-secondary tracking-[0.2em] uppercase mb-2">Privacy</span>
            <span className="font-sans text-lg text-primary">100% Confidential</span>
          </div>
        </div>
      </section>

      {/* Empathy Block */}
      <section className="py-32 px-6 text-center max-w-3xl mx-auto">
        <p className="font-serif text-3xl text-primary/80 leading-relaxed italic">
          "We understand that some seasons of life are too heavy to carry alone. This space is intentionally designed for pause, prayer, and professional pastoral connection."
        </p>
      </section>

      {/* Leadership Bento Grid */}
      <section className="py-24 px-6 w-full bg-surface">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-4xl text-primary text-center mb-16">Connect With Leadership</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-background rounded-lg p-10 halo-border flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 rounded-full bg-[#f4efe6] border border-[#e6dfd3] flex items-center justify-center shadow-sm mb-6">
                <span className="font-serif text-lg text-[#2c2a29] font-medium tracking-wide">SJ</span>
              </div>
              <h3 className="font-serif text-2xl text-primary mb-2">Sarah Jenkins</h3>
              <span className="font-sans text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-4 block">Youth Leader</span>
              <p className="font-sans text-base text-primary/70 mb-10 flex-grow">Guiding teenagers through the complexities of modern faith, blending rigorous scriptural study with empathetic application.</p>
              <Link 
                to="/auth/register"
                className="w-full py-4 px-4 rounded-lg halo-border text-primary font-sans text-sm font-medium hover:bg-surface-dim transition-colors active-sink"
              >
                Request Consultation
              </Link>
            </div>
            
            {/* Card 2 */}
            <div className="bg-background rounded-lg p-10 halo-border flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
              <div className="w-14 h-14 rounded-full bg-[#f4efe6] border border-[#e6dfd3] flex items-center justify-center shadow-sm mb-6">
                <span className="font-serif text-lg text-[#2c2a29] font-medium tracking-wide">DM</span>
              </div>
              <h3 className="font-serif text-2xl text-primary mb-2">David Miller</h3>
              <span className="font-sans text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-4 block">Children Leader</span>
              <p className="font-sans text-base text-primary/70 mb-10 flex-grow">Overseeing foundational ministry to ensure the youngest members experience the warmth of spiritual belonging and moral development.</p>
              <Link 
                to="/auth/register"
                className="w-full py-4 px-4 rounded-lg halo-border text-primary font-sans text-sm font-medium hover:bg-surface-dim transition-colors active-sink"
              >
                Request Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
