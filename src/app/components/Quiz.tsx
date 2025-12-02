import React, { useState } from 'react';

interface QuizProps {
    onSubmit: (answer: string, isCorrect: boolean) => void;
    questions: Array<{
        id: string;
        text: string;
        options: Array<{ id: string; text: string; correct?: boolean }>;
    }>;
}

export default function Quiz({ onSubmit, questions }: QuizProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use the first question for now (can be extended for multiple questions)
    const question = questions[0];

    if (!question) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>No questions available</h2>
                    <p>Please contact the administrator.</p>
                </div>
            </div>
        );
    }

    const handleSubmit = () => {
        if (!selectedAnswer) return;

        setIsSubmitting(true);
        const option = question.options.find(o => o.id === selectedAnswer);
        const isCorrect = option?.correct || false;

        onSubmit(option?.text || '', isCorrect);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Question</h2>
                <p className="question-text" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>{question.text}</p>

                <div className="options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {question.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setSelectedAnswer(option.id)}
                            className={`option-btn ${selectedAnswer === option.id ? 'selected' : ''}`}
                            style={{
                                padding: '10px',
                                border: selectedAnswer === option.id ? '2px solid var(--primary)' : '1px solid #ccc',
                                borderRadius: '8px',
                                background: selectedAnswer === option.id ? '#e6f0ff' : 'white',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            {option.text}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    className="tool-btn"
                    disabled={!selectedAnswer || isSubmitting}
                >
                    {isSubmitting ? 'Sending...' : 'Send Answer'} {/* Sending... : Send Answer */}
                </button>
            </div>
        </div>
    );
}
