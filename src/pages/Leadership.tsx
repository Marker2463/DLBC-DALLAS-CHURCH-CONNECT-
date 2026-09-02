import { Link } from 'react-router-dom';
import counselingImg from '../assets/images/pastoral_counseling_editorial_1787251983401.jpg';

export function Leadership() {
  return (
    <div className="max-w-7xl mx-auto px-6 w-full py-16">
      
      {/* Asymmetrical Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24 max-w-6xl mx-auto items-end">
        <div className="lg:col-span-5">
          <h1 className="font-serif text-5xl md:text-6xl text-primary tracking-tight">Our Leadership</h1>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="font-sans text-lg text-primary/70 leading-relaxed border-l border-primary/10 pl-6">
            Dedicated to spiritual stewardship, our pastoral team guides with wisdom, compassion, and a commitment to nurturing faith in every stage of life.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-32 max-w-5xl mx-auto relative">
        {/* Sarah Jenkins */}
        <div className="w-full md:w-1/2 bg-surface rounded-xl p-10 halo-border flex flex-col items-start text-left group hover:-translate-y-1 transition-transform duration-300">
          <div className="w-14 h-14 rounded-full bg-[#f4efe6] border border-[#e6dfd3] flex items-center justify-center shadow-sm mb-6 overflow-hidden">
            <span className="font-serif text-lg text-[#2c2a29] font-medium tracking-wide">SJ</span>
          </div>
          <h3 className="font-serif text-3xl text-primary mb-2">Sarah Jenkins</h3>
          <span className="font-sans text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-6 block">Youth Leader</span>
          <p className="font-sans text-sm text-primary/70 mb-10 leading-relaxed flex-grow">
            Sarah brings over a decade of experience guiding teenagers through the complexities of modern faith. Her approach blends rigorous scriptural study with empathetic, real-world application, creating a safe space for youth to question, grow, and anchor their beliefs.
          </p>
          <Link to="/auth/register" className="inline-flex items-center justify-center border border-primary/20 text-primary font-sans text-sm font-medium px-6 py-3 rounded-md hover:bg-surface-dim transition-colors active-sink w-full md:w-auto">
            Request Consultation
          </Link>
        </div>

        {/* David Miller */}
        <div className="w-full md:w-1/2 bg-surface rounded-xl p-10 halo-border flex flex-col items-start text-left group hover:-translate-y-1 transition-transform duration-300 md:mt-20">
          <div className="w-14 h-14 rounded-full bg-[#f4efe6] border border-[#e6dfd3] flex items-center justify-center shadow-sm mb-6 overflow-hidden">
            <span className="font-serif text-lg text-[#2c2a29] font-medium tracking-wide">DM</span>
          </div>
          <h3 className="font-serif text-3xl text-primary mb-2">David Miller</h3>
          <span className="font-sans text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-6 block">Children Leader</span>
          <p className="font-sans text-sm text-primary/70 mb-10 leading-relaxed flex-grow">
            David oversees our foundational ministry, ensuring that the youngest members of our community experience the warmth of spiritual belonging. His curriculum focuses on joy, moral development, and early theological understanding in an accessible, engaging format.
          </p>
          <Link to="/auth/register" className="inline-flex items-center justify-center border border-primary/20 text-primary font-sans text-sm font-medium px-6 py-3 rounded-md hover:bg-surface-dim transition-colors active-sink w-full md:w-auto">
            Request Consultation
          </Link>
        </div>
      </div>

      {/* The Pastoral Vocation Block */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
        <div className="flex-1">
          <h2 className="font-serif text-4xl text-primary mb-6">The Pastoral Vocation</h2>
          <div className="space-y-6 font-sans text-base text-primary/70 leading-relaxed">
            <p>
              Leadership within the spiritual community is not merely an administrative role; it is a profound vocation. We view pastoral care as a sacred trust, demanding continual reflection, deep empathy, and an unwavering commitment to truth.
            </p>
            <p>
              Our team is bound by strict ministry guidelines and a code of ethical stewardship. Whether seeking counsel in times of crisis or guidance in daily spiritual practice, our leaders provide a structured, compassionate environment rooted in enduring wisdom.
            </p>
          </div>
        </div>
        <div className="w-full md:w-5/12">
          <div className="rounded-xl overflow-hidden halo-border relative aspect-[3/4]">
            <img 
              src={counselingImg} 
              alt="Pastoral counseling corner" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
