import { Link } from 'react-router-dom';

export function MinistryGuidelines() {
  return (
    <div className="max-w-5xl mx-auto px-6 w-full py-16 pb-32">
      {/* Header */}
      <div className="mb-20">
        <span className="font-sans text-xs text-secondary font-bold uppercase tracking-widest mb-4 block">
          OFFICIAL DOCUMENT
        </span>
        <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 tracking-tight">
          Ministry Guidelines
        </h1>
        <p className="font-sans text-lg text-primary/70 leading-relaxed max-w-3xl">
          Defining the ethical and spiritual standards for pastoral care within the PastoralConnect ecosystem. This document serves as a living covenant for digital stewardship.
        </p>
      </div>

      {/* 1. Introduction */}
      <div className="mb-16 pt-8 border-t border-primary/10">
        <h2 className="font-serif text-3xl text-primary mb-6">1. Introduction to Stewardship</h2>
        <p className="font-sans text-primary/80 leading-relaxed mb-4">
          Stewardship in the digital age requires a profound commitment to the sanctity of interaction. When individuals reach out for pastoral care, they are entrusting us not merely with their problems, but with their spiritual vulnerability.
        </p>
        <p className="font-sans text-primary/80 leading-relaxed">
          PastoralConnect is built on the philosophy of "Digital Sanctuary." This means our platform must remain a space where the weight of pastoral authority is balanced perfectly with the precision and reliability of modern tools. Every feature, from direct messaging to resource sharing, must be treated as an extension of the pastoral office.
        </p>
      </div>

      {/* 2. Ethical Conduct */}
      <div className="mb-16 pt-8 border-t border-primary/10">
        <h2 className="font-serif text-3xl text-primary mb-6">2. Ethical Conduct in Counseling</h2>
        <p className="font-sans text-primary/80 leading-relaxed mb-8">
          The pastoral counselor must maintain a posture of absolute integrity. Our ethical mandate demands that counselors recognize the power dynamics inherent in the relationship and guard rigorously against any exploitation of the counselee.
        </p>
        
        <div className="bg-white border border-primary/10 rounded-xl p-8 shadow-sm max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/80">
              <path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
              <path d="m16 16 6-6" />
              <path d="m8 8 6-6" />
              <path d="m9 7 8 8" />
              <path d="m21 11-8-8" />
            </svg>
            <h3 className="font-sans font-semibold text-primary">Core Ethical Mandates</h3>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-sans text-sm text-primary/80 border-l-[3px] border-secondary/30 pl-4 py-0.5">
              Never use pastoral authority for personal gain.
            </p>
            <p className="font-sans text-sm text-primary/80 border-l-[3px] border-secondary/30 pl-4 py-0.5">
              Maintain clear professional and personal boundaries.
            </p>
            <p className="font-sans text-sm text-primary/80 border-l-[3px] border-secondary/30 pl-4 py-0.5">
              Acknowledge limitations and refer to professional clinical help when necessary.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Confidentiality Protocols */}
      <div className="mb-16 pt-8 border-t border-primary/10">
        <h2 className="font-serif text-3xl text-primary mb-6">3. Confidentiality Protocols</h2>
        <p className="font-sans text-primary/80 leading-relaxed mb-4">
          Confidentiality is the cornerstone of trust in pastoral care. Within PastoralConnect, all communications are treated with the highest degree of technical and spiritual security.
        </p>
        <p className="font-sans text-primary/80 leading-relaxed">
          Information shared in counseling is strictly privileged. Exceptions to this rule are rare and defined solely by legal mandate (such as imminent threat of harm to self or others) and must be handled with profound pastoral sensitivity.
        </p>
      </div>

      {/* 4. Spiritual Fidelity */}
      <div className="pt-8 border-t border-primary/10">
        <h2 className="font-serif text-3xl text-primary mb-6">4. Spiritual Fidelity</h2>
        <p className="font-sans text-primary/80 leading-relaxed mb-8">
          Ultimately, the goal of all pastoral intervention is to align the individual with spiritual truth and wholeness. Counselors using PastoralConnect must remain grounded in their theological convictions while extending grace to those in varying stages of their journey.
        </p>
        <div className="border-l-[3px] border-secondary pl-6 py-2">
          <p className="font-serif text-lg text-primary/90 italic leading-relaxed">
            "The truest form of pastoral care does not seek to fix, but to bear witness to the presence of grace in the midst of suffering."
          </p>
        </div>
      </div>
    </div>
  );
}
