'use client';

import React, { useState, useEffect } from 'react';
import styles from './admin.module.css';

interface Question {
    id: string;
    text: string;
    options: Array<{ id: string; text: string; correct?: boolean }>;
}

interface Content {
    videoUrl: string;
    questions: Question[];
}

export default function AdminPage() {
    const [content, setContent] = useState<Content>({ videoUrl: '', questions: [] });
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [submissionsCount, setSubmissionsCount] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContent();
        fetchSubmissionsCount();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await fetch('/api/content');
            const data = await res.json();
            setContent(data);
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    };

    const fetchSubmissionsCount = async () => {
        try {
            const res = await fetch('/api/reset');
            const data = await res.json();
            setSubmissionsCount(data.count || 0);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                setContent({ ...content, videoUrl: data.videoUrl });
                alert('Video uploaded successfully!');
            } else {
                alert('Error uploading video: ' + data.error);
            }
        } catch (error) {
            console.error('Error uploading video:', error);
            alert('Error uploading video');
        } finally {
            setUploading(false);
        }
    };

    const saveContent = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content),
            });

            if (res.ok) {
                alert('Content saved successfully!');
            } else {
                alert('Error saving content');
            }
        } catch (error) {
            console.error('Error saving content:', error);
            alert('Error saving content');
        } finally {
            setSaving(false);
        }
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            text: '',
            options: [
                { id: 'a', text: '' },
                { id: 'b', text: '' },
                { id: 'c', text: '' },
                { id: 'd', text: '' },
            ],
        };
        setEditingQuestion(newQuestion);
    };

    const saveQuestion = () => {
        if (!editingQuestion) return;

        const existingIndex = content.questions.findIndex(q => q.id === editingQuestion.id);
        const updatedQuestions = [...content.questions];

        if (existingIndex >= 0) {
            updatedQuestions[existingIndex] = editingQuestion;
        } else {
            updatedQuestions.push(editingQuestion);
        }

        setContent({ ...content, questions: updatedQuestions });
        setEditingQuestion(null);
    };

    const deleteQuestion = (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        setContent({
            ...content,
            questions: content.questions.filter(q => q.id !== id),
        });
    };

    const resetSubmissions = async () => {
        if (!confirm(`Are you sure you want to delete all ${submissionsCount} submissions?`)) return;

        try {
            const res = await fetch('/api/reset', { method: 'POST' });
            if (res.ok) {
                alert('All submissions have been reset');
                setSubmissionsCount(0);
            } else {
                alert('Error resetting submissions');
            }
        } catch (error) {
            console.error('Error resetting submissions:', error);
            alert('Error resetting submissions');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Admin Dashboard</h1>

            {/* Video Upload Section */}
            <section className={styles.section}>
                <h2>Video Upload</h2>
                <div className={styles.videoSection}>
                    <p>Current video: <code>{content.videoUrl || 'None'}</code></p>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        disabled={uploading}
                    />
                    {uploading && <p>Uploading...</p>}
                </div>
            </section>

            {/* Question Management Section */}
            <section className={styles.section}>
                <h2>Question Management</h2>
                <button onClick={addQuestion} className={styles.addBtn}>
                    Add New Question
                </button>

                <div className={styles.questionsList}>
                    {content.questions.map((question, index) => (
                        <div key={question.id} className={styles.questionCard}>
                            <h3>Question {index + 1}</h3>
                            <p>{question.text}</p>
                            <ul>
                                {question.options.map(opt => (
                                    <li key={opt.id}>
                                        {opt.text} {opt.correct && <strong>(Correct)</strong>}
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.actions}>
                                <button onClick={() => setEditingQuestion(question)}>Edit</button>
                                <button onClick={() => deleteQuestion(question.id)} className={styles.deleteBtn}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Question Editor Modal */}
                {editingQuestion && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3>Edit Question</h3>
                            <div className={styles.formGroup}>
                                <label>Question Text:</label>
                                <input
                                    type="text"
                                    value={editingQuestion.text}
                                    onChange={(e) =>
                                        setEditingQuestion({ ...editingQuestion, text: e.target.value })
                                    }
                                    placeholder="Enter question text"
                                />
                            </div>

                            {editingQuestion.options.map((option, idx) => (
                                <div key={option.id} className={styles.formGroup}>
                                    <label>Option {option.id.toUpperCase()}:</label>
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => {
                                            const newOptions = [...editingQuestion.options];
                                            newOptions[idx].text = e.target.value;
                                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                                        }}
                                        placeholder={`Option ${option.id.toUpperCase()}`}
                                    />
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={option.correct || false}
                                            onChange={(e) => {
                                                const newOptions = editingQuestion.options.map((opt, i) => ({
                                                    ...opt,
                                                    correct: i === idx ? e.target.checked : false,
                                                }));
                                                setEditingQuestion({ ...editingQuestion, options: newOptions });
                                            }}
                                        />
                                        Correct Answer
                                    </label>
                                </div>
                            ))}

                            <div className={styles.modalActions}>
                                <button onClick={saveQuestion} className={styles.saveBtn}>Save Question</button>
                                <button onClick={() => setEditingQuestion(null)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* User Data Section */}
            <section className={styles.section}>
                <h2>User Data</h2>
                <p>Total submissions: <strong>{submissionsCount}</strong></p>
                <button onClick={resetSubmissions} className={styles.deleteBtn}>
                    Reset All Submissions
                </button>
            </section>

            {/* Save All Changes */}
            <div className={styles.saveSection}>
                <button onClick={saveContent} disabled={saving} className={styles.mainSaveBtn}>
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
}
