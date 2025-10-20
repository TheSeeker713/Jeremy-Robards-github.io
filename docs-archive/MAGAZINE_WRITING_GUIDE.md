# Magazine-Style Article Writing Guide

## Overview
Your writing portfolio now supports **professional web magazine layouts** similar to Medium, The Verge, and other modern publications. This guide shows you how to create rich, visually engaging articles with multiple images, pull quotes, and professional formatting.

---

## Article Metadata Fields

When creating a new article in the CMS admin, you have these fields:

### Required Fields
- **Title**: Main headline (keep under 60 characters for best impact)
- **Body**: Your main article content (supports full Markdown)

### Optional Fields (Highly Recommended)
- **Subtitle**: Secondary headline or "deck" (expands on the title)
- **Author**: Your name (defaults to "Jeremy Robards")
- **Category**: Choose from: Technology, Development, Design, Creative Process, Business, Personal, Tutorial, Case Study
- **Featured Image**: Hero image displayed at top
- **Featured Image Caption**: Credit or description for hero image
- **Excerpt**: 2-3 sentence summary (used in article grid and SEO)
- **Tags**: Simple keywords like "Web Design", "JavaScript" (NO hashtags needed)
- **Publish Date**: When article goes live
- **Draft Toggle**: Turn OFF to publish

---

## Markdown Formatting Guide

### Images in Body

#### Basic Image
```markdown
![Alt text description](./assets/images/uploads/your-image.jpg)
```

#### Image with Caption
```markdown
![Alt text](./assets/images/uploads/your-image.jpg)
*Photo caption goes here with credits or description*
```

The text immediately after the image (in italics with `*text*`) will be styled as a caption.

#### Multiple Images
Place images throughout your article wherever they make sense:

```markdown
First paragraph of text...

![First image](./assets/images/uploads/image1.jpg)
*Caption for first image*

More text in the middle...

![Second image](./assets/images/uploads/image2.jpg)
*Caption for second image*

Final paragraph...
```

### Pull Quotes

For highlighting important quotes or key takeaways:

```markdown
> "This is a pull quote that emphasizes a key point from your article. It will be styled larger and more prominently."
```

### Headings

```markdown
## Main Section Heading

### Subsection Heading

#### Smaller Heading
```

### Text Formatting

```markdown
**Bold text** for emphasis

*Italic text* for subtle emphasis or captions

***Bold and italic*** for maximum emphasis

`inline code` for technical terms or code snippets
```

### Lists

```markdown
**Unordered list:**
- First item
- Second item
- Third item

**Numbered list:**
1. First step
2. Second step
3. Third step
```

### Links

```markdown
[Link text](https://example.com)
```

### Code Blocks

For code examples:

````markdown
```javascript
function example() {
  console.log("Code example here");
}
```
````

---

## Professional Article Structure

### Recommended Structure

1. **Opening Hook** (1-2 paragraphs)
   - Grab attention immediately
   - Set the scene or problem
   - First letter will be styled as a drop cap automatically

2. **Main Content** (Multiple sections)
   - Break into digestible sections with H2/H3 headings
   - Use images strategically to break up text
   - Add captions to provide context
   - Include pull quotes for key insights

3. **Supporting Visuals**
   - Place images every 3-5 paragraphs
   - Use relevant, high-quality images
   - Always add captions for context

4. **Conclusion**
   - Summarize key points
   - Call to action or next steps

### Example Article Template

```markdown
---
title: "Building a Modern Web Portfolio"
subtitle: "A practical guide to creating a professional online presence"
date: 2025-10-17
author: Jeremy Robards
category: Tutorial
thumbnail: ./assets/images/uploads/portfolio-hero.jpg
thumbnail_caption: "A modern web portfolio design"
excerpt: "Learn how to build a professional web portfolio that showcases your work and attracts clients. This step-by-step guide covers design, development, and deployment."
tags:
  - Web Design
  - Portfolio
  - Tutorial
draft: false
---

Your opening paragraph starts here. The first letter will automatically be styled as a large drop cap. Make this paragraph compelling and set the stage for what's to come.

Continue with your second paragraph, expanding on the topic and drawing readers in.

## Understanding Your Goals

Before diving into development, it's crucial to understand what you want your portfolio to achieve. Are you looking to attract freelance clients? Showcase your skills to potential employers? Or simply document your creative journey?

![Portfolio planning sketch](./assets/images/uploads/planning.jpg)
*Initial sketches help clarify your vision before coding begins*

Your portfolio should reflect your unique style and capabilities. Take time to...

> "A portfolio is not just a showcase—it's a conversation starter with potential collaborators and clients."

## Design Principles

When designing your portfolio, keep these principles in mind:

1. **Simplicity**: Less is more
2. **Focus**: Highlight your best work
3. **Personality**: Let your unique voice shine through

![Design mockup](./assets/images/uploads/design-mockup.jpg)
*High-fidelity mockups help visualize the final product*

...continue your article...

## Conclusion

Building a professional portfolio takes time and iteration. Start with a solid foundation, showcase your best work, and continuously refine based on feedback. Your portfolio is never truly "done"—it evolves with your skills and experience.
```

---

## Tips for Professional Articles

### Visual Content
- **Upload high-quality images** (1200px width minimum recommended)
- **Use WebP format** when possible for faster loading
- **Name files descriptively**: `portfolio-design-mockup.jpg` not `IMG_1234.jpg`
- **Add captions** to every image for context and SEO

### Writing Style
- **Short paragraphs**: 2-4 sentences maximum for web readability
- **Active voice**: "I built" instead of "was built by me"
- **Clear headings**: Use descriptive section titles
- **Scannable**: Use lists, headings, and pull quotes to break up text

### SEO Optimization
- **Write compelling excerpts**: This appears in search results
- **Use relevant tags**: 3-5 focused keywords (no hashtags)
- **Descriptive titles**: Include main keywords naturally
- **Alt text for images**: Describe what's in the image

### Tags Best Practices
❌ **Don't use hashtags**: `#WebDesign #JavaScript`  
✅ **Use clean keywords**: `Web Design`, `JavaScript`

The system will automatically style and format your tags properly.

---

## Uploading Images

1. **In the CMS admin**, when editing an article
2. Click on any **image field** (Featured Image, or in Body)
3. Click **"Choose an image"**
4. **Upload your file** or select from existing uploads
5. The path will automatically be inserted: `./assets/images/uploads/filename.jpg`

Images are stored in: `assets/images/uploads/`

---

## Publishing Workflow

1. **Create article** in CMS admin (`http://localhost:8000/admin/`)
2. **Write content** with markdown formatting
3. **Add images** throughout article body
4. **Preview** your work (in CMS preview mode)
5. **Set Draft toggle to OFF** when ready to publish
6. **Save** the article
7. **Regenerate manifest**: Run `npm run generate:manifest` in terminal
8. **Refresh browser** to see your article live

---

## Advanced Techniques

### Embedding Videos

While the CMS doesn't have a video widget yet, you can embed YouTube videos using HTML in your markdown:

```markdown
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" 
    src="https://www.youtube.com/embed/VIDEO_ID" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>
```

Replace `VIDEO_ID` with your YouTube video ID.

---

## Need Help?

- **Markdown syntax**: [Markdown Guide](https://www.markdownguide.org/basic-syntax/)
- **Writing tips**: Study articles on Medium, CSS-Tricks, Smashing Magazine
- **Image editing**: Use tools like Figma, Photoshop, or free alternatives like Photopea

---

## Example Screenshots

### Article Grid View
- Shows thumbnail, category badge, title, subtitle, date, read time, excerpt, and tags
- Cards have hover effects with scale and border color change

### Individual Article View
- Magazine-style layout with large title
- Hero image with optional caption
- Author byline and read time
- Drop cap on first paragraph
- Professional typography optimized for reading
- Tags displayed as pills at the end (no hashtags)
- Social interactions (like/dislike/share)
- Comments section

---

**Your writing portfolio is now a professional publication platform. Create content that showcases your expertise and engages your audience!**
