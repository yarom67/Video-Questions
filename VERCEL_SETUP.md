# Vercel Blob Setup Instructions

## What Changed
I've migrated your app from local file storage to **Vercel Blob** storage. This fixes the "read-only file system" error on Vercel.

## Setup Steps

### 1. Get Environment Variables from Vercel
After you've connected the `quiz-media` Blob store to your project:

1. Go to your project settings in Vercel
2. Click on **Environment Variables**
3. You should see these variables automatically added:
   - `BLOB_READ_WRITE_TOKEN`
   - Other Blob-related variables

### 2. Pull Environment Variables Locally (Optional, for local testing)
Run this command in your project directory:
```bash
vercel env pull .env.local
```

This will download the environment variables to your local machine.

### 3. Deploy to Vercel
Push your code to GitHub (or your git provider), and Vercel will automatically deploy with the new Blob storage.

```bash
git add .
git commit -m "Migrate to Vercel Blob storage"
git push
```

## How It Works Now

- **Quiz data** (questions, video URLs): Stored as JSON in Blob
- **User submissions**: Stored as JSON in Blob  
- **Uploaded videos/images**: Stored directly in Blob

Everything persists across deployments and works on Vercel's read-only file system.

## Testing

1. Deploy to Vercel
2. Visit your live site
3. Upload a video in the admin panel
4. Submit a quiz answer
5. Check that everything persists after refresh
