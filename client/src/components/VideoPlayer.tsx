// client/src/components/VideoPlayer.tsx - ULTRA MINIMAL VERSION
import { useEffect, useState, useRef } from 'react';
import { Loader2, AlertCircle, Play, Pause } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
  controls?: boolean;
}

const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

export default function VideoPlayer({
  videoUrl,
  title = 'Video',
  className = '',
  controls = false,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    if (!videoUrl) {
      setError('No video URL provided');
      setLoading(false);
      return;
    }
    const id = extractYouTubeId(videoUrl);
    if (id) {
      setVideoId(id);
      setError(null);
      setIsPlaying(false);
    } else {
      setError('Invalid YouTube URL');
    }
    setLoading(false);
  }, [videoUrl]);

  // Hide button after 3 seconds when playing
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying) {
      timeout = setTimeout(() => setShowButton(false), 3000);
    } else {
      setShowButton(true);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!iframeRef.current || !videoId) return;

    const action = isPlaying ? 'pauseVideo' : 'playVideo';
    iframeRef.current.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: action }),
      '*'
    );
    setIsPlaying(!isPlaying);
    setShowButton(true);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (loading || !videoId) {
    return (
      <div
        className="flex items-center justify-center bg-muted rounded-lg"
        style={{ aspectRatio: '16/9' }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ✅ MAXIMUM HIDING - Remove ALL YouTube UI elements
  const embedParams = new URLSearchParams({
    autoplay: '0',
    controls: controls ? '1' : '0', // Hide all native controls for users
    modestbranding: '1', // Remove YouTube logo
    rel: '0', // Don't show related videos
    showinfo: '0', // Hide title
    fs: controls ? '1' : '0', // Fullscreen only for admin
    disablekb: '1', // Disable keyboard shortcuts
    iv_load_policy: '3', // Hide annotations
    cc_load_policy: '0', // Hide captions by default
    playsinline: '1', // Play inline on mobile
    enablejsapi: '1', // Enable JS control
    origin: window.location.origin,
    widget_referrer: window.location.origin,
    // ✅ CRITICAL: These hide end screen overlays
    loop: '0',
    playlist: videoId, // Required for loop to work
  });

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?${embedParams.toString()}`;

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={containerRef}
        className="relative rounded-lg overflow-hidden bg-black video-player-container"
        style={{ paddingBottom: '56.25%' }}
        onMouseEnter={() => setShowButton(true)}
      >
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          className="absolute top-0 left-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={controls}
          style={{
            border: 'none',
            pointerEvents: controls ? 'auto' : 'none',
          }}
        />

        {/* ✅ ULTRA MINIMAL: Only Play/Pause Button */}
        {!controls && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Play/Pause Button - Fades out when playing */}
            <div
              className={`
                transition-all duration-500 ease-out transform
                ${
                  showButton
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-75 pointer-events-none'
                }
              `}
            >
              <div
                className="
                  rounded-full bg-white/90 backdrop-blur-sm p-4 
                  shadow-2xl hover:bg-white hover:scale-110 
                  transition-all duration-200
                "
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-black fill-black" />
                ) : (
                  <Play className="w-8 h-8 text-black fill-black ml-1" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
