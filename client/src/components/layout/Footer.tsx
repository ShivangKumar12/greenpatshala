// client/src/components/layout/Footer.tsx - PRODUCTION READY - EXACT DESIGN
import { Link } from 'wouter';
import { SiFacebook, SiX, SiInstagram, SiLinkedin, SiYoutube } from 'react-icons/si';

const quickLinks = [
  { label: 'Courses', href: '/courses' },
  { label: 'Quizzes', href: '/quizzes' },
  { label: 'Study Materials', href: '/materials' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Refund Policy', href: '/refund' },
];

const socialLinks = [
  { icon: SiFacebook, href: 'https://facebook.com/unchiudaan', label: 'Facebook' },
  { icon: SiX, href: 'https://twitter.com/unchiudaan', label: 'Twitter' },
  { icon: SiInstagram, href: 'https://instagram.com/unchiudaan', label: 'Instagram' },
  { icon: SiLinkedin, href: 'https://linkedin.com/company/unchiudaan', label: 'LinkedIn' },
  { icon: SiYoutube, href: 'https://youtube.com/@unchiudaan', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 dark:bg-background border-t border-border/20 text-slate-300 dark:text-muted-foreground relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-1/2 h-40 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">

          {/* ✅ Logo & Brand - Left Side */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group" data-testid="footer-logo">
              <img
                src="/logo-footer.png"
                alt="Green Patshala Logo"
                className="h-16 w-auto object-contain group-hover:scale-105 transition-transform bg-white/10 rounded-lg p-2 backdrop-blur-sm"
                loading="lazy"
              />
            </Link>
            <p className="text-slate-400 dark:text-muted-foreground text-sm leading-relaxed pr-4">
              Empowering students to achieve their government job dreams through quality education and expert guidance.
            </p>
          </div>

          {/* ✅ Quick Links - Center */}
          <div>
            <h4 className="font-semibold text-base mb-5 text-slate-100 dark:text-foreground">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 dark:text-muted-foreground hover:text-primary transition-all duration-300 inline-block hover:translate-x-1"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ Connect & Legal - Right Side */}
          <div>
            <h4 className="font-semibold text-base mb-5 text-slate-100 dark:text-foreground">Connect With Us</h4>
            <div className="flex gap-4 mb-10">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-900 dark:bg-muted/30 border border-slate-800 dark:border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 text-slate-300 dark:text-foreground"
                  aria-label={social.label}
                  data-testid={`social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            <h4 className="font-semibold text-base mb-4 text-slate-100 dark:text-foreground">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 dark:text-muted-foreground hover:text-primary transition-all duration-300 inline-block hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ✅ Bottom Bar */}
        <div className="border-t border-slate-800 dark:border-border/40 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400 dark:text-muted-foreground">
            © {new Date().getFullYear()} Unchi Udaan. All rights reserved.
          </p>
          <p className="text-sm text-slate-400 dark:text-muted-foreground flex items-center gap-1.5">
            Made with <span className="text-red-500 animate-pulse">❤️</span> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
