import { Link } from 'react-router-dom';
import { Lock, Users, CheckCircle2, Clock, Flame, Heart } from 'lucide-react';

export function Process() {
  return (
    <div className="w-full bg-[#fefefe] min-h-screen text-primary pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-24">
          <h1 className="font-serif text-5xl md:text-6xl mb-6 tracking-tight">The Journey of Care</h1>
          <p className="font-sans text-lg text-primary/70 leading-relaxed max-w-2xl mx-auto">
            A deliberate, structured pathway designed to hold space for your needs while ensuring absolute privacy and pastoral fidelity. Every step is handled with reverence and secure precision.
          </p>
        </div>

        <div className="relative border-l border-primary/10 pl-8 md:pl-16 space-y-24 ml-4 md:ml-8">
          
          {/* Step 1 */}
          <div className="relative">
            <div className="absolute -left-[57px] md:-left-[89px] top-0 w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-serif text-4xl shadow-xl">
              1
            </div>
            <div>
              <h2 className="font-serif text-3xl mb-6 text-primary">Confidential Request</h2>
              <div className="bg-surface text-primary rounded-xl p-8 halo-border">
                <p className="font-sans text-sm md:text-base leading-relaxed mb-6">
                  Your initial outreach is handled with pastoral care and confidentiality. Your request is logged securely for pastoral leadership review, allowing you to define the category and context of your need.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Lock size={20} className="text-secondary mt-0.5" />
                    <span className="font-sans text-sm text-primary/80">Role-restricted consultation access and review.</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle2 size={20} className="text-secondary mt-0.5" />
                    <span className="font-sans text-sm text-primary/80">Private consultation request logged directly to church ministers.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="absolute -left-[57px] md:-left-[89px] top-0 w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-serif text-4xl shadow-xl">
              2
            </div>
            <div>
              <h2 className="font-serif text-3xl mb-6 text-primary">Pastoral Review</h2>
              <div className="bg-surface text-primary rounded-xl p-8 halo-border">
                <p className="font-sans text-sm md:text-base leading-relaxed mb-6">
                  A designated leader or pastor reviews the request. This is a prayerful consideration of who within the leadership team is best equipped to offer counsel, prayer, and support for your specific journey.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Users size={20} className="text-secondary mt-0.5" />
                    <span className="font-sans text-sm text-primary/80">Intentional matching with experienced pastoral leaders.</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock size={20} className="text-secondary mt-0.5" />
                    <span className="font-sans text-sm text-primary/80">Pastoral team reviews and responds as volunteer availability permits.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="absolute -left-[57px] md:-left-[89px] top-0 w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-serif text-4xl shadow-xl">
              3
            </div>
            <div>
              <h2 className="font-serif text-3xl mb-6 text-primary">Sacred Connection</h2>
              <div className="bg-surface text-primary rounded-xl p-8 halo-border">
                <p className="font-sans text-sm md:text-base leading-relaxed mb-6">
                  A secure, private Google Meet link or on-campus appointment is scheduled for your session. The space is dedicated to listening, scriptural guidance, and spiritual accompaniment.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Flame size={20} className="text-secondary mt-0.5" />
                    <span className="font-sans text-sm text-primary/80">Secure video consultation rooms hosted via Google Meet.</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <Heart size={20} fill="currentColor" className="text-secondary mt-0.5" />
                    <span className="font-sans text-sm text-primary/80">Compassionate pastoral follow-up and prayer support as availability permits.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32 text-center">
          <div className="flex justify-center mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary/70">
              <path d="M12 22C12 22 17 17 17 12C17 7 12 2 12 2C12 2 7 7 7 12C7 17 12 22 12 22Z" fill="currentColor" />
            </svg>
          </div>
          <h3 className="font-serif text-2xl text-primary mb-4">Holding Space</h3>
          <p className="font-sans text-base text-primary/70 italic max-w-lg mx-auto mb-10">
            "In the spaces between our speaking and our listening, grace resides. Take a breath here. You are seen, and your request is held with care."
          </p>
          <Link to="/auth/register" className="inline-block border border-primary/10 hover:border-primary/30 text-primary/80 hover:text-primary font-sans text-xs uppercase tracking-[0.2em] px-8 py-4 rounded transition-all duration-300">
            Begin The Journey
          </Link>
        </div>
      </div>
    </div>
  );
}
