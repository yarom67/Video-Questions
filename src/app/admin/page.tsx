'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import styles from './admin.module.css';

interface Question {
    id: string;
    text: string;
    imageUrl?: string;
    answer: string;
    // content.json might still have options field if we don't clean it up, but we won't use it.
    options?: Array<any>;
}

interface Content {
    videoUrl: string;
    backgroundImageUrl: string;
    questions: Question[];
    videoType?: 'upload' | 'youtube';
}

interface Submission {
    id: string;
    name: string;
    employeeId: string;
    answer: string;
    isCorrect: boolean;
    timestamp: string;
}

export default function AdminPage() {
    const [content, setContent] = useState<Content>({ videoUrl: '', backgroundImageUrl: '', questions: [], videoType: 'upload' });
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContent();
        fetchSubmissions();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await fetch('/api/content');
            const data = await res.json();

            // Sanitize questions to ensure options array exists
            if (data.questions) {
                data.questions = data.questions.map((q: Question) => ({
                    ...q,
                    options: q.options || []
                }));
            } else {
                data.questions = [];
            }

            setContent(data);
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/reset');
            const data = await res.json();
            // Sort by timestamp descending
            const sorted = (data.submissions || []).sort((a: Submission, b: Submission) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setSubmissions(sorted);
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
        formData.append('type', 'video');

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

    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (data.success) {
                setContent({ ...content, backgroundImageUrl: data.backgroundImageUrl });
                alert('Background image uploaded successfully!');
            } else {
                alert('Error uploading background image: ' + data.error);
            }
        } catch (error) {
            console.error('Error uploading background:', error);
            alert('Error uploading background image');
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
            imageUrl: '',
            answer: '',
            options: [],
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
        if (!confirm(`Are you sure you want to delete all ${submissions.length} submissions?`)) return;

        try {
            const res = await fetch('/api/reset', { method: 'POST' });
            if (res.ok) {
                alert('All submissions have been reset');
                setSubmissions([]);
            } else {
                alert('Error resetting submissions');
            }
        } catch (error) {
            console.error('Error resetting submissions:', error);
            alert('Error resetting submissions');
        }
    };

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(submissions.map(s => ({
            'Full Name': s.name,
            'Employee ID': s.employeeId,
            'Answer': s.answer,
            'Is Correct': s.isCorrect ? 'Yes' : 'No',
            'Timestamp': new Date(s.timestamp).toLocaleString()
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Submissions");

        XLSX.writeFile(wb, "quiz_submissions.xlsx");
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Admin Dashboard</h1>

            {/* Video Upload/Embed Section */}
            <section className={styles.section}>
                <h2>Video Configuration</h2>

                <div className={styles.typeSelector}>
                    <label>
                        <input
                            type="radio"
                            name="videoType"
                            value="upload"
                            checked={content.videoType !== 'youtube'}
                            onChange={() => setContent({ ...content, videoType: 'upload' })}
                        />
                        Upload Video
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="videoType"
                            value="youtube"
                            checked={content.videoType === 'youtube'}
                            onChange={() => setContent({ ...content, videoType: 'youtube' })}
                        />
                        YouTube Embed
                    </label>
                </div>

                <div className={styles.videoSection}>
                    <p>Current video URL: <code>{content.videoUrl || 'None'}</code></p>

                    {content.videoType === 'youtube' ? (
                        <div className={styles.formGroup}>
                            <label>YouTube URL:</label>
                            <input
                                type="text"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={content.videoUrl}
                                onChange={(e) => setContent({ ...content, videoUrl: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>
                    ) : (
                        <>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoUpload}
                                disabled={uploading}
                            />
                            {uploading && <p>Uploading...</p>}
                        </>
                    )}
                </div>
            </section>

            {/* Background Image Upload Section */}
            <section className={styles.section}>
                <h2>Background Image Upload</h2>
                <div className={styles.videoSection}>
                    <p>Current background: <code>{content.backgroundImageUrl || 'None'}</code></p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
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
                            {question.imageUrl && (
                                <img src={question.imageUrl} alt="Riddle" style={{ maxWidth: '100px', display: 'block', marginTop: '5px' }} />
                            )}
                            <p><strong>Answer:</strong> {question.answer}</p>
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

                            <div className={styles.formGroup}>
                                <label>Riddle Image:</label>
                                {editingQuestion.imageUrl && (
                                    <div style={{ marginBottom: '10px' }}>
                                        <img src={editingQuestion.imageUrl} alt="Current" style={{ maxWidth: '200px' }} />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        // Upload logic customized for question image
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        formData.append('type', 'question-image');

                                        try {
                                            const res = await fetch('/api/upload', {
                                                method: 'POST',
                                                body: formData,
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                setEditingQuestion({ ...editingQuestion, imageUrl: data.url });
                                            } else {
                                                alert('Error uploading image');
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert('Error uploading image');
                                        }
                                    }}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Correct Answer (Single Word):</label>
                                <input
                                    type="text"
                                    value={editingQuestion.answer || ''}
                                    onChange={(e) =>
                                        setEditingQuestion({ ...editingQuestion, answer: e.target.value })
                                    }
                                    placeholder="Enter the correct answer"
                                />
                            </div>

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
                <div className={styles.dataHeader}>
                    <p>Total submissions: <strong>{submissions.length}</strong></p>
                    <div className={styles.dataActions}>
                        <button onClick={handleExport} className={styles.exportBtn}>
                            Export to Excel
                        </button>
                        <button onClick={resetSubmissions} className={styles.deleteBtn}>
                            Reset All Submissions
                        </button>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Name</th>
                                <th>Employee ID</th>
                                <th>Answer</th>
                                <th>Correct</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub) => (
                                <tr key={sub.id}>
                                    <td>{new Date(sub.timestamp).toLocaleString()}</td>
                                    <td>{sub.name}</td>
                                    <td>{sub.employeeId}</td>
                                    <td>{sub.answer}</td>
                                    <td style={{ color: sub.isCorrect ? 'green' : 'red', fontWeight: 'bold' }}>
                                        {sub.isCorrect ? 'Yes' : 'No'}
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>No submissions yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
