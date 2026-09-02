import { Mail, Wrench, AlertCircle, ArrowRight } from 'lucide-react';

export function ContactSupport() {
  return (
    <div className="max-w-7xl mx-auto px-6 w-full py-16 pb-32">
      {/* Header */}
      <div className="mb-16">
        <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 tracking-tight">Contact Support</h1>
        <p className="font-sans text-lg text-primary/70 leading-relaxed max-w-2xl">
          Our pastoral care and technical stewardship teams are here to assist you. Please select the nature of your inquiry so we can route it with care.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Contact Methods */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="bg-surface rounded-xl p-6 halo-border cursor-pointer hover:bg-surface-dim transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-base font-medium text-primary group-hover:text-secondary transition-colors">General Inquiry</h3>
                <p className="font-sans text-sm text-primary/70">Questions about our ministries or programs.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-xl p-6 halo-border cursor-pointer hover:bg-surface-dim transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                <Wrench size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-base font-medium text-primary group-hover:text-secondary transition-colors">Technical Support</h3>
                <p className="font-sans text-sm text-primary/70">Issues with your account or platform access.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface border border-secondary/20 rounded-xl p-6 cursor-pointer hover:bg-secondary/5 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-sans text-base font-medium text-secondary">Pastoral Emergency</h3>
                <p className="font-sans text-sm text-secondary/80">Immediate spiritual or pastoral assistance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="md:col-span-7">
          <div className="bg-surface rounded-xl p-8 halo-border">
            <h2 className="font-serif text-2xl text-primary mb-6">Send a Message</h2>
            <form className="space-y-6">
              <div>
                <label className="block font-sans text-sm font-medium text-primary mb-2">Subject</label>
                <input 
                  type="text" 
                  placeholder="How can we help?"
                  className="w-full bg-background border border-primary/10 rounded-md p-4 font-sans text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-1 focus:ring-secondary/40 transition-all"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-primary mb-2">Email Address</label>
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  className="w-full bg-background border border-primary/10 rounded-md p-4 font-sans text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-1 focus:ring-secondary/40 transition-all"
                />
              </div>
              <div>
                <label className="block font-sans text-sm font-medium text-primary mb-2">Message</label>
                <textarea 
                  rows={5}
                  placeholder="Please provide details..."
                  className="w-full bg-background border border-primary/10 rounded-md p-4 font-sans text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-1 focus:ring-secondary/40 transition-all resize-y"
                />
              </div>
              <button 
                type="button"
                className="w-full bg-primary hover:bg-primary/90 text-white font-sans text-sm font-medium py-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                Submit Request <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
