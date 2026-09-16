import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Play, Pause, X, Headphones, Loader2, Volume2 } from 'lucide-react';

interface Track {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
}

interface AudioBayProps {
  onVoiceError?: (msg: string) => void;
}

export default function AudioBay({ onVoiceError }: AudioBayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searched, setSearched] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const playerReadyRef = useRef(false);
  const pendingTrackRef = useRef<Track | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerReadyRef.current = true;
      if (pendingTrackRef.current) {
        createPlayer(pendingTrackRef.current);
        pendingTrackRef.current = null;
      }
    };
  }, []);

  const createPlayer = useCallback((track: Track) => {
    if (!playerContainerRef.current) return;
    const YT = window.YT;
    if (!YT || !YT.Player) return;

    // Destroy existing player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // Ignore
      }
      playerRef.current = null;
    }

    playerContainerRef.current.innerHTML = '<div id="yt-player"></div>';

    playerRef.current = new YT.Player('yt-player', {
      videoId: track.videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
      },
      events: {
        onReady: () => {
          setIsPlaying(true);
        },
        onStateChange: (e: { data: number }) => {
          if (e.data === 1) setIsPlaying(true);
          if (e.data === 2) setIsPlaying(false);
          if (e.data === 0) setIsPlaying(false);
        },
        onError: () => {
          onVoiceError?.('Error al cargar el video. Intenta con otra canción.');
          setIsPlaying(false);
        },
      },
    });
  }, [onVoiceError]);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    if (playerReadyRef.current) {
      createPlayer(track);
    } else {
      pendingTrackRef.current = track;
    }
  }, [createPlayer]);

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch {
      // Player not ready
    }
  };

  const stopPlayback = () => {
    if (playerRef.current) {
      try {
        playerRef.current.stopVideo();
      } catch {
        // Ignore
      }
    }
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  // Search using YouTube search via no-key scraping (Invidious API as fallback)
  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      // Use YouTube's search results via a public API
      const searchQuery = encodeURIComponent(query);
      const res = await fetch(
        `https://corsproxy.io/?url=${encodeURIComponent(`https://www.youtube.com/results?search_query=${searchQuery}`)}`
      );

      if (!res.ok) throw new Error('Search failed');
      const html = await res.text();

      // Extract video data from YouTube page
      const tracks: Track[] = [];
      const videoRegex = /"videoRenderer":\{"videoId":"([^"]+)"[\s\S]*?"title":\{"runs":\[\{"text":"([^"]+)"[\s\S]*?"ownerTextName":\{"runs":\[\{"text":"([^"]+)"[\s\S]*?"thumbnails":\[\{"url":"([^"]+)"/g;

      let match: RegExpExecArray | null;
      let count = 0;
      while ((match = videoRegex.exec(html)) !== null && count < 20) {
        tracks.push({
          videoId: match[1],
          title: match[2].replace(/\\u0026/g, '&').replace(/\\"/g, '"'),
          artist: match[3].replace(/\\"/g, '"'),
          thumbnail: match[4].replace(/\\u0026/g, '&'),
        });
        count++;
      }

      if (tracks.length === 0) {
        // Fallback: try simpler regex
        const simpleRegex = /"videoId":"([^"]{11})"/g;
        const ids = new Set<string>();
        let m: RegExpExecArray | null;
        while ((m = simpleRegex.exec(html)) !== null) {
          if (!ids.has(m[1])) {
            ids.add(m[1]);
            tracks.push({
              videoId: m[1],
              title: `Video ${m[1]}`,
              artist: 'YouTube',
              thumbnail: `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg`,
            });
          }
          if (tracks.length >= 20) break;
        }
      }

      setResults(tracks);
    } catch {
      // Fallback: use YouTube search URL directly
      setResults([]);
      onVoiceError?.('No se pudo buscar. Verifica tu conexión.');
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="hud-panel rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-mono text-[10px] text-amber-500/60 tracking-widest">BAHÍA DE AUDIO</span>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar canción o artista..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="hud-input w-full pl-10"
          />
        </div>
        <button onClick={handleSearch} disabled={loading} className="hud-btn flex items-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>

      {/* Player */}
      {currentTrack && (
        <div className="mb-4 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-16 h-16 rounded-md object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-body font-semibold text-sm text-neutral-200 truncate">{currentTrack.title}</h4>
              <p className="font-body text-xs text-neutral-500 truncate">{currentTrack.artist}</p>
            </div>
            <button onClick={stopPlayback} className="text-neutral-500 hover:text-red-500 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={togglePlayPause} className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 hover:bg-amber-500/30 transition-all">
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500/50 w-1/3" />
            </div>
            <Volume2 size={16} className="text-amber-500/60" />
          </div>
        </div>
      )}

      {/* Hidden YouTube player container */}
      <div ref={playerContainerRef} className="hidden">
        <div id="yt-player" />
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        </div>
      ) : results.length === 0 && searched ? (
        <div className="flex flex-col items-center justify-center h-40 text-neutral-600">
          <Headphones size={32} className="mb-2 opacity-30" />
          <span className="font-body text-sm">Sin resultados. Intenta otra búsqueda.</span>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-neutral-600">
          <Headphones size={32} className="mb-2 opacity-30" />
          <span className="font-body text-sm">Busca tu música favorita</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {results.map((track) => (
            <button
              key={track.videoId}
              onClick={() => playTrack(track)}
              className={`
                group w-full flex items-center gap-3 p-2 rounded-md transition-all text-left
                ${currentTrack?.videoId === track.videoId
                  ? 'bg-amber-500/10 border border-amber-500/20'
                  : 'bg-white/[0.02] hover:bg-white/5 border border-transparent'
                }
              `}
            >
              <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                <img src={track.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play size={16} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-neutral-200 truncate">{track.title}</p>
                <p className="font-body text-xs text-neutral-500 truncate">{track.artist}</p>
              </div>
              {currentTrack?.videoId === track.videoId && isPlaying && (
                <div className="flex items-center gap-0.5 mr-2">
                  <span className="voice-bar" />
                  <span className="voice-bar" />
                  <span className="voice-bar" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


