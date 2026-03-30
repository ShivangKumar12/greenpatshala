// client/src/pages/user/MyCertificates.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserCertificates, downloadCertificatePDF } from '@/services/certificateApi';
import {
    Award,
    Download,
    Calendar,
    BookOpen,
    Hash,
    FileText,
    ArrowLeft,
    Loader2,
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function MyCertificates() {
    const { data: certificates, isLoading } = useUserCertificates();
    const [, setLocation] = useLocation();
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleDownload = async (certId: string) => {
        setDownloadingId(certId);
        try {
            await downloadCertificatePDF(certId);
            toast({ title: 'Downloaded!', description: 'Certificate PDF has been downloaded.' });
        } catch {
            toast({ title: 'Error', description: 'Failed to download certificate.', variant: 'destructive' });
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard')}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Award className="h-7 w-7 text-amber-500" />
                            My Certificates
                        </h1>
                        <p className="text-muted-foreground text-sm">Your earned certificates and achievements</p>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && (!certificates || certificates.length === 0) && (
                    <Card className="border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center py-20">
                            <div className="relative mb-6">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                                    <Award className="h-12 w-12 text-amber-500" />
                                </div>
                                <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
                            <p className="text-muted-foreground text-center max-w-md mb-6">
                                Complete quizzes and courses to earn certificates. They will appear here once issued.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setLocation('/quizzes')}>
                                    <BookOpen className="h-4 w-4 mr-2" /> Browse Quizzes
                                </Button>
                                <Button variant="outline" onClick={() => setLocation('/courses')}>
                                    <BookOpen className="h-4 w-4 mr-2" /> Browse Courses
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Certificates Grid */}
                {!isLoading && certificates && certificates.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {certificates.map((cert: any) => (
                            <Card
                                key={cert.id}
                                className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-amber-100 dark:border-amber-900/50"
                            >
                                {/* Certificate Visual */}
                                <div className="relative h-44 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-yellow-950/30 overflow-hidden">
                                    {/* Border decoration */}
                                    <div className="absolute inset-3 border-2 border-amber-300/60 dark:border-amber-700/40 rounded-lg" />
                                    <div className="absolute inset-4 border border-amber-200/40 dark:border-amber-800/30 rounded-lg" />

                                    {/* Content */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                                        <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 font-bold uppercase tracking-[0.2em] mb-1">
                                            ★ Certificate ★
                                        </p>
                                        <p className="text-sm font-bold text-foreground/80 line-clamp-2">{cert.itemName}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{cert.userName}</p>
                                    </div>

                                    {/* Type badge */}
                                    <Badge
                                        className="absolute top-3 right-3 capitalize text-[10px]"
                                        variant="secondary"
                                    >
                                        {cert.type}
                                    </Badge>
                                </div>

                                <CardContent className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-sm line-clamp-1">{cert.itemName}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">{cert.achievementText}</p>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {cert.completionDate}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Hash className="h-3 w-3" />
                                            {cert.certificateId}
                                        </span>
                                    </div>

                                    <Button
                                        onClick={() => handleDownload(cert.certificateId)}
                                        disabled={downloadingId === cert.certificateId}
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                                        size="sm"
                                    >
                                        {downloadingId === cert.certificateId ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-4 w-4 mr-2" />
                                                Download PDF
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
