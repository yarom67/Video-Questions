import { redis } from './redis';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'content.json');
const SUBMISSIONS_FILE_PATH = path.join(process.cwd(), 'data', 'submissions.json');

// Separate Redis keys for media and questions
const MEDIA_KEY = 'quiz:media';
const QUESTIONS_KEY = 'quiz:questions';
const SUBMISSIONS_KEY = 'quiz:submissions';

export const storage = {
    // ============ MEDIA STORAGE ============
    async getMediaConfig() {
        try {
            if (redis.isOpen) {
                const media = await redis.get(MEDIA_KEY);
                if (media) return JSON.parse(media);
            }
        } catch (error) {
            console.warn('Redis get media failed:', error);
        }

        // Fallback to file
        try {
            const fileContent = await readFile(DATA_FILE_PATH, 'utf-8');
            const data = JSON.parse(fileContent);
            return {
                videoUrl: data.videoUrl || '',
                backgroundImageUrl: data.backgroundImageUrl || '',
                videoType: data.videoType || 'upload'
            };
        } catch (error) {
            return { videoUrl: '', backgroundImageUrl: '', videoType: 'upload' };
        }
    },

    async saveMediaConfig(data: { videoUrl?: string; backgroundImageUrl?: string; videoType?: 'upload' | 'youtube' }) {
        try {
            if (redis.isOpen) {
                await redis.set(MEDIA_KEY, JSON.stringify(data));
            }
        } catch (error) {
            console.warn('Redis save media failed:', error);
        }
    },

    // ============ QUESTIONS STORAGE ============
    async getQuestions() {
        try {
            if (redis.isOpen) {
                const questions = await redis.get(QUESTIONS_KEY);
                if (questions) return JSON.parse(questions);
            }
        } catch (error) {
            console.warn('Redis get questions failed:', error);
        }

        // Fallback to file
        try {
            const fileContent = await readFile(DATA_FILE_PATH, 'utf-8');
            const data = JSON.parse(fileContent);
            return data.questions || [];
        } catch (error) {
            return [];
        }
    },

    async saveQuestions(questions: any[]) {
        try {
            if (redis.isOpen) {
                await redis.set(QUESTIONS_KEY, JSON.stringify(questions));
            }
        } catch (error) {
            console.warn('Redis save questions failed:', error);
        }
    },

    // ============ LEGACY COMBINED METHODS ============
    async getContent() {
        const [media, questions] = await Promise.all([
            this.getMediaConfig(),
            this.getQuestions()
        ]);
        return { ...media, questions };
    },

    async saveContent(data: any) {
        // Save media
        if (data.videoUrl !== undefined || data.backgroundImageUrl !== undefined || data.videoType !== undefined) {
            await this.saveMediaConfig({
                videoUrl: data.videoUrl,
                backgroundImageUrl: data.backgroundImageUrl,
                videoType: data.videoType
            });
        }

        // Save questions
        if (data.questions !== undefined) {
            await this.saveQuestions(data.questions);
        }

        // Also save to file as backup
        try {
            await writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('File write failed:', error);
        }
    },

    // ============ SUBMISSIONS STORAGE ============
    async getSubmissions() {
        try {
            if (redis.isOpen) {
                const submissions = await redis.get(SUBMISSIONS_KEY);
                if (submissions) return JSON.parse(submissions);
            }
        } catch (error) {
            console.warn('Redis get submissions failed:', error);
        }

        try {
            const fileContent = await readFile(SUBMISSIONS_FILE_PATH, 'utf-8');
            return JSON.parse(fileContent);
        } catch (error) {
            return [];
        }
    },

    async saveSubmission(submission: any) {
        const submissions = await this.getSubmissions();
        submissions.push(submission);

        try {
            if (redis.isOpen) {
                await redis.set(SUBMISSIONS_KEY, JSON.stringify(submissions));
            }
        } catch (error) {
            console.warn('Redis save submission failed:', error);
        }

        try {
            await writeFile(SUBMISSIONS_FILE_PATH, JSON.stringify(submissions, null, 2));
        } catch (error) {
            console.error('File write submission failed:', error);
        }
    },

    async resetSubmissions() {
        try {
            if (redis.isOpen) {
                await redis.del(SUBMISSIONS_KEY);
            }
        } catch (error) {
            console.warn('Redis delete submissions failed:', error);
        }

        try {
            await writeFile(SUBMISSIONS_FILE_PATH, JSON.stringify([], null, 2));
        } catch (error) {
            console.error('File reset submissions failed:', error);
        }
    }
};
