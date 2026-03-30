// client/src/pages/About.tsx - WITH TRANSLATIONS
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Target, 
  Users, 
  Award,
  BookOpen,
  Lightbulb,
  Heart,
  Shield,
  TrendingUp,
  CheckCircle,
  Star,
  Sparkles
} from 'lucide-react';
import { Link } from 'wouter';
import { useLanguage } from '@/context/LanguageContext'; // ✅ ADD THIS

const examsCovered = [
  'UPSC (IAS, IPS, IFS)',
  'SSC (CGL, CHSL, MTS)',
  'Banking (IBPS, SBI, RBI)',
  'Railways (RRB, RRC)',
  'State PSCs',
  'Defence (NDA, CDS)',
  'Teaching (CTET, TET)',
  'Police & Administrative Services',
];

export default function About() {
  const { t } = useLanguage(); // ✅ USE LANGUAGE CONTEXT

  const stats = [
    { value: '50,000+', labelKey: 'about.stats.studentsEmpowered', icon: Users, color: 'text-blue-500' },
    { value: '500+', labelKey: 'about.stats.courses', icon: BookOpen, color: 'text-green-500' },
    { value: '98%', labelKey: 'about.stats.satisfaction', icon: Award, color: 'text-yellow-500' },
    { value: '24/7', labelKey: 'about.stats.support', icon: Shield, color: 'text-purple-500' },
  ];

  const values = [
    {
      icon: Target,
      titleKey: 'about.values.missionTitle',
      descKey: 'about.values.missionDesc',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      icon: Lightbulb,
      titleKey: 'about.values.innovationTitle',
      descKey: 'about.values.innovationDesc',
      color: 'bg-green-500/10 text-green-500',
    },
    {
      icon: Heart,
      titleKey: 'about.values.studentTitle',
      descKey: 'about.values.studentDesc',
      color: 'bg-red-500/10 text-red-500',
    },
    {
      icon: Shield,
      titleKey: 'about.values.trustTitle',
      descKey: 'about.values.trustDesc',
      color: 'bg-purple-500/10 text-purple-500',
    },
  ];

  const achievements = [
    'about.achievements.cleared',
    'about.achievements.topRankers',
    'about.achievements.trusted',
    'about.achievements.featured',
    'about.achievements.awardWinning',
    'about.achievements.expertFaculty',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
            <Sparkles className="w-3 h-3 mr-1" />
            {t('about.hero.badge')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {t('about.hero.title')}
            <br />
            <span className="text-yellow-300">{t('about.hero.titleHighlight')}</span>
          </h1>
          <p className="text-white/90 max-w-3xl mx-auto text-lg md:text-xl mb-8 leading-relaxed">
            {t('about.hero.description')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/courses">
              <Button size="lg" variant="secondary" className="gap-2">
                <BookOpen className="w-5 h-5" />
                {t('about.hero.exploreCourses')}
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Users className="w-5 h-5" />
                {t('about.hero.joinCommunity')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-16 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center hover-elevate border-2">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-full bg-background flex items-center justify-center mx-auto mb-4 ${stat.color}`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{t(stat.labelKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                <Star className="w-3 h-3 mr-1" />
                {t('about.story.badge')}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                {t('about.story.title')}
                <span className="text-primary"> {t('about.story.titleHighlight')}</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{t('about.story.paragraph1')}</p>
                <p>{t('about.story.paragraph2')}</p>
                <p>{t('about.story.paragraph3')}</p>
                <p className="font-medium text-foreground">
                  {t('about.story.paragraph4')}
                </p>
              </div>

              <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
                    SK
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{t('about.founder.name')}</p>
                    <p className="text-sm text-primary mb-2">{t('about.founder.title')}</p>
                    <p className="text-sm text-muted-foreground italic">
                      "{t('about.founder.quote')}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                <CardContent className="p-8">
                  <GraduationCap className="w-16 h-16 text-blue-500 mb-6" />
                  <h3 className="text-2xl font-bold mb-4">{t('about.mission.title')}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.mission.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                <CardContent className="p-8">
                  <Target className="w-16 h-16 text-green-500 mb-6" />
                  <h3 className="text-2xl font-bold mb-4">{t('about.vision.title')}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.vision.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Exams Covered */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <BookOpen className="w-3 h-3 mr-1" />
              {t('about.exams.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('about.exams.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('about.exams.description')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {examsCovered.map((exam, index) => (
              <Card key={index} className="hover-elevate cursor-pointer transition-all hover:border-primary">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="font-medium text-sm">{exam}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/courses">
              <Button size="lg" className="gap-2">
                {t('about.exams.viewAll')}
                <TrendingUp className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Heart className="w-3 h-3 mr-1" />
              {t('about.values.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('about.values.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('about.values.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover-elevate group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl ${value.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl mb-3">{t(value.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(value.descKey)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Award className="w-3 h-3 mr-1" />
              {t('about.achievements.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('about.achievements.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {achievements.map((achievementKey, index) => (
              <Card key={index} className="hover-elevate border-2">
                <CardContent className="p-6 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{t(achievementKey)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('about.cta.title')}
              </h2>
              <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
                {t('about.cta.description')}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Users className="w-5 h-5" />
                    {t('about.cta.startTrial')}
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                    <BookOpen className="w-5 h-5" />
                    {t('about.cta.browseCourses')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
