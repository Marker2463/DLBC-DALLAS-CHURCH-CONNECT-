import { Link } from 'react-router-dom';
import { 
  AlertTriangle, Phone, PlusSquare, 
  Book, Brain, Users, FileCheck, 
  Clock, Download, Eye 
} from 'lucide-react';

export function Resources() {
  return (
    <div className="max-w-7xl mx-auto px-6 w-full py-16 pb-32">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 tracking-tight">Spiritual Resources</h1>
        <p className="font-sans text-lg text-primary/70 leading-relaxed max-w-2xl mx-auto">
          A curated library of tools, guides, and reflective materials designed to support your pastoral journey and personal stewardship.
        </p>
      </div>

      {/* Immediate Support */}
      <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-8 mb-24 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4 text-secondary">
          <AlertTriangle size={24} fill="currentColor" className="text-secondary" />
          <h2 className="font-serif text-3xl">Emergency &amp; Crisis Support</h2>
        </div>
        <p className="font-sans text-primary/80 mb-6 max-w-2xl leading-relaxed">
          DLBC Church Connect is a volunteer-led pastoral consultation platform and does not provide 24/7 acute crisis or emergency response. If you or someone in your care is experiencing an acute crisis, medical emergency, or immediate threat of harm, please contact emergency services immediately.
        </p>
        <div className="flex flex-wrap gap-4">
          <a 
            href="tel:911" 
            className="bg-[#b93c3c] hover:bg-[#a83232] text-white font-sans text-sm font-semibold px-6 py-3 rounded-lg active-sink flex items-center gap-2 transition-colors shadow-sm"
          >
            <Phone size={18} />
            Call Emergency Services (911)
          </a>
          <a 
            href="tel:988" 
            className="bg-white hover:bg-primary/5 border border-primary/20 text-primary font-sans text-sm font-semibold px-6 py-3 rounded-lg active-sink flex items-center gap-2 transition-colors"
          >
            <Phone size={18} className="text-[#b93c3c]" />
            Suicide &amp; Crisis Lifeline (988)
          </a>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16 max-w-5xl mx-auto">
        
        {/* Prayer Guides */}
        <div>
          <div className="flex justify-between items-end border-b border-primary/10 pb-4 mb-6">
            <h3 className="font-serif text-2xl text-primary">Prayer Guides</h3>
            <Book size={20} className="text-primary/50 mb-1" />
          </div>
          <div className="space-y-6">
            <ResourceItem title="Morning Liturgy of the Hours" time="15 min read" action="download" />
            <ResourceItem title="Prayers for Times of Uncertainty" time="10 min read" action="view" />
            <ResourceItem title="Intercessory Frameworks" time="25 min read" action="download" />
          </div>
        </div>

        {/* Mental Health */}
        <div>
          <div className="flex justify-between items-end border-b border-primary/10 pb-4 mb-6">
            <h3 className="font-serif text-2xl text-primary">Mental Health</h3>
            <Brain size={20} className="text-primary/50 mb-1" />
          </div>
          <div className="space-y-6">
            <ResourceItem title="Recognizing Burnout in Ministry" time="20 min read" action="view" />
            <ResourceItem title="Establishing Healthy Boundaries" time="12 min read" action="download" />
            <ResourceItem title="Sabbath Practices for Leaders" time="18 min read" action="download" />
          </div>
        </div>

        {/* Family Stewardship */}
        <div>
          <div className="flex justify-between items-end border-b border-primary/10 pb-4 mb-6">
            <h3 className="font-serif text-2xl text-primary">Family Stewardship</h3>
            <Users size={20} className="text-primary/50 mb-1" />
          </div>
          <div className="space-y-6">
            <ResourceItem title="Balancing Vocation and Home" time="15 min read" action="view" />
            <ResourceItem title="Financial Planning for Pastors" time="30 min read" action="download" />
          </div>
        </div>

        {/* Ministry Guidelines */}
        <div>
          <div className="flex justify-between items-end border-b border-primary/10 pb-4 mb-6">
            <h3 className="font-serif text-2xl text-primary">Ministry Guidelines</h3>
            <FileCheck size={20} className="text-primary/50 mb-1" />
          </div>
          <div className="space-y-6">
            <ResourceItem title="Ethical Conduct in Counseling" time="45 min read" action="download" />
            <ResourceItem title="Safeguarding Protocols (2024 Update)" time="60 min read" action="download" />
          </div>
        </div>

      </div>
    </div>
  );
}

function ResourceItem({ title, time, action }: { title: string, time: string, action: 'download' | 'view' }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-surface-dim/30 p-2 -mx-2 rounded transition-colors">
      <div>
        <h4 className="font-sans text-sm font-medium text-primary mb-1 group-hover:text-secondary transition-colors">{title}</h4>
        <div className="flex items-center gap-1.5 text-primary/50 font-sans text-xs">
          <Clock size={12} />
          <span>{time}</span>
        </div>
      </div>
      <div className="text-primary/30 group-hover:text-primary transition-colors">
        {action === 'download' ? <Download size={18} /> : <Eye size={18} />}
      </div>
    </div>
  );
}
