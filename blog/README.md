# Blog (Demo) — Developer Access

This blog is a static-site demo with a local, in-browser editing workflow.

- Developer unlock: Click the padlock in the header and answer the prompt question "who has NiN like no other?" with `713` to unlock editing tools.
- Posts are stored in the browser via IndexedDB (`jr_blog_db_v1`). A seed `posts.json` provides initial content.
- To export posts for committing to GitHub Pages: open the blog index, click `Export JSON` (visible when dev access is unlocked) and save `posts.json`. Commit and push to your repo to publish changes.

Notes:
- This is a client-side demo only. For any production use, add a backend and proper authentication.
- Drafts are stored as posts with `status: "draft"` in the same IndexedDB store.
- Deleting marks a post with `deleted: true` and moves it to the recycle bin; recycle entries older than 30 days are auto-removed locally.
