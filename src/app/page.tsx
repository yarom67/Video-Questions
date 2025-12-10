'use client';

import React, { useState, useEffect } from 'react';
import UserInfoModal from './components/UserInfoModal';
import VideoPlayer from './components/VideoPlayer';
import Quiz from './components/Quiz';

type Step = 'info' | 'video' | 'quiz' | 'success';

interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  answer: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>('info');
  const [userInfo, setUserInfo] = useState<{ name: string; employeeId: string } | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoType, setVideoType] = useState<'upload' | 'youtube'>('upload');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setVideoUrl(data.videoUrl || '');
      setVideoType(data.videoType || 'upload');
      setBackgroundImageUrl(data.backgroundImageUrl || '');
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserInfoSubmit = (name: string, employeeId: string) => {
    setUserInfo({ name, employeeId });
    setStep('video');
  };

  const handleVideoEnd = () => {
    setStep('quiz');
  };

  const handleQuizSubmit = async (answer: string, isCorrect: boolean) => {
    if (!userInfo) return;

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userInfo.name,
          employeeId: userInfo.employeeId,
          answer,
          isCorrect,
        }),
      });

      if (response.ok) {
        setStep('success');
      } else {
        const data = await response.json();
        alert('Error sending data: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error sending data. Please try again.');
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  // Apply background only when NOT showing video
  const showBackground = step !== 'video' && backgroundImageUrl;

  return (
    <main style={showBackground ? {
      backgroundImage: `url(${backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    } : {}}>
      {(step === 'info' || step === 'quiz') && (
        <img
          src="/logo.png"
          alt="Company Logo"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '150px',
            height: 'auto',
            zIndex: 1100, // Ensure it's above the modal overlay
          }}
        />
      )}

      {step === 'info' && (
        <UserInfoModal onSubmit={handleUserInfoSubmit} />
      )}

      {step === 'video' && (
        <VideoPlayer onVideoEnd={handleVideoEnd} videoSrc={videoUrl} videoType={videoType} />
      )}

      {step === 'quiz' && (
        <Quiz onSubmit={handleQuizSubmit} questions={questions} />
      )}

      {step === 'success' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: 'green' }}>Answer sent successfully!</h2> {/* Answer sent successfully! */}
            <p>Thank you for participating.</p> {/* Thank you for participating */}
            <button
              className="tool-btn"
              onClick={() => window.location.reload()}
              style={{ marginTop: '20px' }}
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
