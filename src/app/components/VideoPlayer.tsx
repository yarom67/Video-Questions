import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
    onVideoEnd: () => void;
    videoSrc?: string;
    videoType?: 'upload' | 'youtube';
}

function getYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export default function VideoPlayer({ onVideoEnd, videoSrc, videoType = 'upload' }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Auto-play when component mounts
        if (videoType === 'upload' && videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }, [videoType]);

    // Handle YouTube Player Events
    useEffect(() => {
        if (videoType === 'youtube' && videoSrc) {
            const initPlayer = () => {
                const videoId = getYoutubeId(videoSrc);
                if (!videoId) return;

                new (window as any).YT.Player('youtube-player', {
                    height: '100%',
                    width: '100%',
                    videoId: videoId,
                    playerVars: {
                        'playsinline': 1,
                        'autoplay': 1,
                        'controls': 1,
                        'rel': 0
                    },
                    events: {
                        'onStateChange': (event: any) => {
                            // 0 = ENDED
                            if (event.data === 0) {
                                onVideoEnd();
                            }
                        }
                    }
                });
            };

            if ((window as any).YT && (window as any).YT.Player) {
                initPlayer();
            } else {
                // Initialize array to hold callbacks if not already present
                if (!(window as any).onYouTubeIframeAPIReady) {
                    (window as any).onYouTubeIframeAPIReady = () => {
                        // This will be simpler if we just overwrite it or dispatch event, 
                        // but for now let's just assume we are the main consumer.
                        // However, since we might race, let's just set the function.
                    };
                }

                // We need to hook into the ready event. 
                // A common pattern is effectively rewriting the window callback to chain.
                const oldOnReady = (window as any).onYouTubeIframeAPIReady;
                (window as any).onYouTubeIframeAPIReady = () => {
                    if (oldOnReady) oldOnReady();
                    initPlayer();
                };

                // Only append script if not present
                if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                    const tag = document.createElement('script');
                    tag.src = "https://www.youtube.com/iframe_api";
                    const firstScriptTag = document.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
                }
            }
        }
    }, [videoType, videoSrc, onVideoEnd]);


    if (videoType === 'youtube') {
        // Fallback if no src
        if (!videoSrc) return <div style={{ color: 'white' }}>No video URL provided</div>;

        const videoId = getYoutubeId(videoSrc);
        if (!videoId) return <div style={{ color: 'white' }}>Invalid YouTube URL</div>;

        return (
            <div className="video-container" style={{ width: '100%', height: '100vh', background: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div id="youtube-player" style={{ width: '100%', height: '100%' }}></div>
            </div>
        );
    }

    return (
        <div className="video-container" style={{ width: '100%', height: '100vh', background: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <video
                ref={videoRef}
                src={videoSrc}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onEnded={onVideoEnd}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
