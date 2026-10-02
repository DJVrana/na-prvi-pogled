import { Link } from 'react-router';
import { Heart, Sparkles, Mail, MapPin, ShieldCheck, Wine, Users } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-brand text-peach-dark pt-16 pb-10 border-t border-brand-light/30 relative overflow-hidden z-10">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-light/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-rose-950/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Trust Badges Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 mb-12 border-b border-brand-light/30 text-white/90">
          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-amber-300 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Balans sudionika</p>
              <p className="text-xs text-peach-dark/70">Jednak broj žena i muškaraca na svakom eventu</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-amber-300 shrink-0">
              <Wine size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Piće dobrodošlice</p>
              <p className="text-xs text-peach-dark/70">Čaša vrhunskog vina uključena uz kotizaciju</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-amber-300 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">100% Diskretno</p>
              <p className="text-xs text-peach-dark/70">Razmjena kontakata isključivo uz obostrani match</p>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          
          {/* Col 1: Brand story */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-peach text-brand flex items-center justify-center shadow-lg">
                <Heart size={22} className="fill-brand" />
              </div>
              <span className="font-serif font-bold text-2xl text-white tracking-tight">
                Na prvi pogled
              </span>
            </div>
            <p className="text-sm text-peach-dark/80 leading-relaxed font-light">
              Manje ekrana, više stvarnih susreta. Ekskluzivni speed dating događaji u Zagrebu u ugodnoj atmosferi probranih gradskih barova. Upoznaj nekoga uživo. Kao nekad.
            </p>
            <div className="pt-2">
              <a 
                href="https://instagram.com/na.prvi.pogled" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/15"
              >
                <FaInstagram size={14} className="text-pink-400" />
                <span>@na.prvi.pogled</span>
              </a>
            </div>
          </div>

          {/* Col 2: Brzi linkovi */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-4">
              Navigacija
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-peach-dark/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" /> Početna stranica
                </Link>
              </li>
              <li>
                <Link to="/eventi" className="text-peach-dark/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" /> Svi događaji & termini
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-peach-dark/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" /> Blog & Savjeti za spojeve
                </Link>
              </li>
              <li>
                <Link to="/kontakt" className="text-peach-dark/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" /> Kontakt & lokacije
                </Link>
              </li>
              <li>
                <Link to="/profil" className="text-peach-dark/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" /> Moj korisnički profil
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Dobne skupine & koncept */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-4">
              Koncept susreta
            </h4>
            <ul className="space-y-2.5 text-sm text-peach-dark/80">
              <li>🎯 Grupa Mladi: 20 – 30 godina</li>
              <li>🥂 Grupa Zreli: 28 – 38 godina</li>
              <li>✨ Grupa 35+: 35 – 48 godina</li>
              <li>⏱️ 5 – 7 minuta po spoju</li>
              <li>🍷 Piće dobrodošlice po izboru</li>
              <li>🔒 100% anonimni matching sustav</li>
            </ul>
          </div>

          {/* Col 4: Kontakt informacije */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-4">
              Direktan kontakt
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5 text-peach-dark/80">
                <MapPin size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <span>Zagreb, Hrvatska (Ugodni barovi u centru grada)</span>
              </div>
              <div className="flex items-center gap-2.5 text-peach-dark/80">
                <Mail size={18} className="text-amber-400 shrink-0" />
                <a href="mailto:naprvipogled.events@gmail.com" className="hover:text-white transition-colors underline">
                  naprvipogled.events@gmail.com
                </a>
              </div>
              <div className="pt-2">
                <Link 
                  to="/kontakt"
                  className="inline-block bg-peach text-brand hover:bg-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md"
                >
                  Pošalji nam upit
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-brand-light/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-peach-dark/60">
          <p>© {currentYear} Na prvi pogled. Sva prava pridržana.</p>
          <p className="flex items-center gap-1.5">
            Stvoreno s <Heart size={13} className="text-rose-400 fill-rose-400" /> za iskrene i nezaboravne susrete u Zagrebu
          </p>
        </div>

      </div>
    </footer>
  );
}
