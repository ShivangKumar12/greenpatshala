// client/src/pages/Contact.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Headphones,
  Globe,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';
import { SiWhatsapp, SiTelegram } from 'react-icons/si';

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    value: 'unchiudaanofficial@gmail.com',
    description: 'We reply within 24 hours',
    action: 'mailto:unchiudaanofficial@gmail.com',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: '+91 75448 23818',
    description: 'Mon-Sat, 9 AM - 6 PM',
    action: 'tel:+917544823818',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    value: 'Vidyapathi Dham, Dalsingh Sarai',
    description: 'Samastipur, Bihar - 848503',
    action: 'https://maps.google.com',
    color: 'bg-red-500/10 text-red-500',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    value: '9 AM - 6 PM IST',
    description: 'Monday to Saturday',
    action: null,
    color: 'bg-purple-500/10 text-purple-500',
  },
];

const quickContact = [
  {
    icon: SiWhatsapp,
    title: 'WhatsApp Support',
    description: 'Quick response to your queries',
    action: 'https://wa.me/917544823818',
    color: 'bg-green-500 hover:bg-green-600',
    iconColor: 'text-white',
  },
  {
    icon: SiTelegram,
    title: 'Telegram Channel',
    description: 'Join our community',
    action: 'https://t.me/unchiudaan',
    color: 'bg-blue-500 hover:bg-blue-600',
    iconColor: 'text-white',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our team',
    action: '/support',
    color: 'bg-purple-500 hover:bg-purple-600',
    iconColor: 'text-white',
  },
];

const socialLinks = [
  { icon: Facebook, link: 'https://facebook.com/unchiudaan', label: 'Facebook' },
  { icon: Instagram, link: 'https://instagram.com/unchiudaan', label: 'Instagram' },
  { icon: Linkedin, link: 'https://linkedin.com/company/unchiudaan', label: 'LinkedIn' },
  { icon: Globe, link: 'https://unchiudaan.com', label: 'Website' },
];

const faqs = [
  {
    question: 'How do I enroll in a course?',
    answer: 'Browse our courses, select the one you want, and click "Enroll Now". Pay using UPI, cards, or net banking. You\'ll get instant access to all course materials.',
  },
  {
    question: 'Are the study materials available offline?',
    answer: 'Yes! You can download video lectures, PDFs, and study notes for offline viewing through our mobile app. Perfect for studying on the go.',
  },
  {
    question: 'What is your refund policy?',
    answer: 'We offer a 7-day money-back guarantee for all paid courses. If you\'re not satisfied, contact our support team for a full refund, no questions asked.',
  },
  {
    question: 'How can I contact my instructor?',
    answer: 'You can ask questions in the course discussion forum, attend live doubt clearing sessions, or send direct messages to your instructor through the platform.',
  },
  {
    question: 'Do you provide test series and mock exams?',
    answer: 'Absolutely! We offer comprehensive test series with detailed solutions, performance analytics, and all-India rankings to track your preparation.',
  },
  {
    question: 'Is there any free trial available?',
    answer: 'Yes! Most of our courses offer free preview lessons. You can also access our free study materials and sample quizzes before purchasing.',
  },
];

const supportOptions = [
  {
    icon: Headphones,
    title: 'Technical Support',
    description: 'Help with login, payment, or platform issues',
    tag: 'Priority Support',
  },
  {
    icon: HelpCircle,
    title: 'Course Guidance',
    description: 'Get recommendations for your exam preparation',
    tag: 'Free Counseling',
  },
  {
    icon: MessageSquare,
    title: 'General Inquiries',
    description: 'Any other questions or feedback',
    tag: 'Quick Response',
  },
];

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
            <Headphones className="w-3 h-3 mr-1" />
            Contact Support
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            We're Here to
            <br />
            <span className="text-yellow-300">Help You Succeed</span>
          </h1>
          <p className="text-white/90 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
            Have questions about our courses, quizzes, or platform? Our dedicated support team is ready to assist you on your journey to success.
          </p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <section className="py-16 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card 
                key={index} 
                className="hover-elevate cursor-pointer group border-2 transition-all hover:border-primary"
                onClick={() => info.action && window.open(info.action, '_blank')}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-14 h-14 rounded-2xl ${info.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <info.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                  <p className="font-medium text-primary mb-1 text-sm">{info.value}</p>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                  {info.action && (
                    <ExternalLink className="w-4 h-4 mx-auto mt-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Contact Methods */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <MessageSquare className="w-3 h-3 mr-1" />
              Quick Connect
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Preferred Way
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with us instantly through your favorite platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {quickContact.map((contact, index) => (
              <Card 
                key={index}
                className="hover-elevate cursor-pointer group overflow-hidden"
                onClick={() => window.open(contact.action, '_blank')}
              >
                <CardContent className="p-0">
                  <div className={`${contact.color} p-6 text-center transition-all`}>
                    <contact.icon className={`w-10 h-10 mx-auto mb-3 ${contact.iconColor}`} />
                    <h3 className="font-bold text-white text-lg mb-1">{contact.title}</h3>
                    <p className="text-white/90 text-sm">{contact.description}</p>
                  </div>
                  <div className="p-4 text-center bg-background group-hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-medium text-primary flex items-center justify-center gap-2">
                      Connect Now
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <HelpCircle className="w-3 h-3 mr-1" />
              Support Services
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Can We Assist You?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {supportOptions.map((option, index) => (
              <Card key={index} className="hover-elevate text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <option.icon className="w-8 h-8 text-primary" />
                  </div>
                  <Badge variant="secondary" className="mb-3">
                    {option.tag}
                  </Badge>
                  <h3 className="font-bold text-xl mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <HelpCircle className="w-3 h-3 mr-1" />
              FAQs
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Quick answers to common questions about our platform and services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 leading-tight">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Card className="inline-block bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Can't find your answer?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our support team is here to help you with any questions
                </p>
                <Button size="lg" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <Badge variant="outline" className="mb-4">
            <Globe className="w-3 h-3 mr-1" />
            Follow Us
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Connected
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Follow us on social media for daily updates, exam tips, and success stories
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            {socialLinks.map((social, index) => (
              <Button
                key={index}
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={() => window.open(social.link, '_blank')}
              >
                <social.icon className="w-5 h-5" />
                {social.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of successful students preparing for government exams with Unchi Udaan
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" variant="secondary" className="gap-2" onClick={() => window.location.href = '/courses'}>
                  Browse Courses
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 border-white/30 text-white hover:bg-white/10"
                  onClick={() => window.open('https://wa.me/917544823818', '_blank')}
                >
                  <SiWhatsapp className="w-4 h-4" />
                  WhatsApp Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
