# Global Comments & Reactions Setup

Since your site is on GitHub Pages (static hosting with no backend), we need a third-party service to store comments and reactions globally.

## Recommended Solution: Giscus

**Giscus** uses GitHub Discussions as a database - perfect for your setup!

### Why Giscus?
- ✅ Free and open-source
- ✅ No ads or tracking
- ✅ Uses GitHub authentication (users must have GitHub account)
- ✅ Privacy-friendly
- ✅ Supports reactions (👍 👎 and more)
- ✅ Markdown support
- ✅ Easy to integrate

### Setup Steps:

1. **Enable GitHub Discussions** on your repository:
   - Go to https://github.com/TheSeeker713/Jeremy-Robards-github.io/settings
   - Scroll to "Features"
   - Check ✅ "Discussions"

2. **Install Giscus App**:
   - Visit https://github.com/apps/giscus
   - Click "Install"
   - Select your repository: `Jeremy-Robards-github.io`

3. **Configure Giscus**:
   - Go to https://giscus.app
   - Enter your repo: `TheSeeker713/Jeremy-Robards-github.io`
   - Choose Discussion Category: "Announcements" (or create "Blog Comments")
   - Choose Features:
     - ✅ Enable reactions for main post
     - ✅ Emit discussion metadata
   - Copy the generated script

4. **Add to article.html**:
Replace the current comments section with the Giscus script

## Alternative: Firebase (More Complex but More Control)

If you want full control, you could use Firebase:
- Firebase Realtime Database (free tier)
- Requires setting up Firebase project
- More setup but more customizable

Would you like me to:
A) Implement Giscus (recommended - 5 minutes)
B) Set up Firebase (more work - 30 minutes)
C) Keep it local-only (current state)

Let me know and I'll implement it!
