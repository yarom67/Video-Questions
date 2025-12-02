import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
    onVideoEnd: () => void;
    videoSrc?: string;
}

export default function VideoPlayer({ onVideoEnd, videoSrc }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Auto-play when component mounts
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }, []);

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
