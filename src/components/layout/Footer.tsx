import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="w-full pt-16 pb-12 px-6 flex flex-col gap-4 max-w-5xl mx-auto bg-background mt-auto z-10">
      <div className="font-serif text-2xl text-primary mb-8">DLBC Church Connect</div>
      
      <div className="w-full h-px bg-primary/10 mb-8" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="font-sans text-xs text-primary/70">
          © {new Date().getFullYear()} DLBC Church Connect. Dedicated to digital stewardship and pastoral care.
        </div>
        
        <div className="flex flex-col gap-4">
          <nav className="flex flex-wrap gap-x-8 gap-y-4">
            <Link to="/privacy" className="font-sans text-xs text-primary/70 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="font-sans text-xs text-primary/70 hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/ministry-guidelines" className="font-sans text-xs text-primary/70 hover:text-primary transition-colors">Ministry Guidelines</Link>
          </nav>
          <div className="flex">
             <Link to="/support" className="font-sans text-xs text-primary/70 hover:text-primary transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
