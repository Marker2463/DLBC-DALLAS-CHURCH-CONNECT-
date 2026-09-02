import { Link } from 'react-router-dom';
import { ArrowRight, Baby, Heart, Briefcase } from 'lucide-react';
import studyImg from '../assets/images/pastoral_care_study_1787251812830.jpg';
import pewsImg from '../assets/images/church_pews_editorial_1787251824185.jpg';

export function Ministry() {
  return (
    <div className="max-w-7xl mx-auto px-6 w-full py-16">
      <div className="max-w-3xl mb-16">
        <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 tracking-tight">Ministries of Growth</h1>
        <p className="font-sans text-lg text-primary/70 leading-relaxed max-w-2xl">
          Discover paths for spiritual deepening and community engagement. Our carefully curated ministries provide spaces for reflection, connection, and purposeful stewardship.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Youth Leadership Program (Large Card) */}
        <div className="md:col-span-7 bg-surface rounded-xl overflow-hidden halo-border relative min-h-[400px] flex flex-col justify-end p-8 group">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-500 mix-blend-multiply" 
            style={{ backgroundImage: `url(${pewsImg})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent"></div>
          
          <div className="relative z-10">
            <span className="inline-block bg-background px-3 py-1 rounded font-sans text-xs font-semibold text-primary mb-4 shadow-sm">Featured</span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary mb-3">Youth Leadership Program</h2>
            <p className="font-sans text-base text-primary/80 mb-6 max-w-md">
              Guiding the next generation through thoughtful mentorship, scriptural study, and hands-on community service projects.
            </p>
            <Link to="/auth/register" className="inline-flex items-center gap-2 font-sans text-sm font-medium text-primary hover:text-secondary transition-colors border border-primary/10 bg-background/50 backdrop-blur-sm rounded-md px-4 py-2 hover:bg-background">
              Explore Program <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Right Column Stack */}
        <div className="md:col-span-5 flex flex-col gap-6">
           {/* Children's Ministry */}
           <div className="bg-surface rounded-xl p-8 halo-border flex-1 flex flex-col justify-center">
             <div className="mb-4 text-secondary">
               <Baby size={28} />
             </div>
             <h3 className="font-serif text-2xl text-primary mb-3">Children's Ministry</h3>
             <p className="font-sans text-sm text-primary/80 mb-6">
               Foundational teachings tailored for young minds in a safe, nurturing environment.
             </p>
             <Link to="/auth/register" className="inline-flex items-center gap-1 font-sans text-sm font-medium text-primary hover:text-secondary transition-colors">
               Learn More <ArrowRight size={14} />
             </Link>
           </div>
           
           {/* Marriage Enrichment */}
           <div className="bg-surface rounded-xl p-8 halo-border flex-1 flex flex-col justify-center">
             <div className="mb-4 text-secondary">
               <Heart size={28} fill="currentColor" />
             </div>
             <h3 className="font-serif text-2xl text-primary mb-3">Marriage Enrichment</h3>
             <p className="font-sans text-sm text-primary/80 mb-6">
               Resources and counseling focused on strengthening covenants through mutual grace.
             </p>
             <Link to="/auth/register" className="inline-flex items-center gap-1 font-sans text-sm font-medium text-primary hover:text-secondary transition-colors">
               Learn More <ArrowRight size={14} />
             </Link>
           </div>
        </div>

        {/* Career & Calling (Bottom Row) */}
        <div className="md:col-span-12 bg-surface rounded-xl p-8 halo-border flex flex-col md:flex-row items-center gap-12 justify-between">
          <div className="flex-1">
            <div className="mb-4 text-secondary">
              <Briefcase size={28} />
            </div>
            <h3 className="font-serif text-3xl text-primary mb-4">Career & Calling</h3>
            <p className="font-sans text-base text-primary/80 mb-8 max-w-lg">
              Discerning vocation as a spiritual practice. Workshops and guidance for integrating faith into professional life.
            </p>
            <Link to="/resources" className="inline-flex items-center justify-center px-6 py-3 bg-[#1c202e] text-white font-sans text-sm font-medium rounded hover:bg-primary/90 transition-colors">
              View Resources
            </Link>
          </div>
          <div className="flex-1 w-full max-w-sm rounded-lg overflow-hidden border border-primary/10">
            <img src={studyImg} alt="Study" className="w-full h-full object-cover aspect-[4/3] grayscale opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
}
