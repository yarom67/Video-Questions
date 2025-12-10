import React, { useState } from 'react';

interface QuizProps {
    onSubmit: (answer: string, isCorrect: boolean) => void;
    questions: Array<{
        id: string;
        text: string;
        imageUrl?: string;
        answer: string;
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
        // Clean the input: trim and lowercase for comparison
        const cleanAnswer = selectedAnswer.trim().toLowerCase();
        const correctAnswer = question.answer.trim().toLowerCase();

        const isCorrect = cleanAnswer === correctAnswer;

        onSubmit(selectedAnswer, isCorrect);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Question</h2>
                <p className="question-text" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>{question.text}</p>

                <div className="riddle-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
                    {question.imageUrl && (
                        <img
                            src={question.imageUrl}
                            alt="Riddle"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '300px',
                                borderRadius: '8px',
                                objectFit: 'contain'
                            }}
                        />
                    )}

                    <input
                        type="text"
                        value={selectedAnswer || ''}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '1rem',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}
                    />
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
