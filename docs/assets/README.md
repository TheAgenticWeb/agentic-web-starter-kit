# Assets

This folder contains images and media for documentation.

## Required Screenshot

**`task-manager-demo.png`** - Hero image for the main README

### How to Create the Screenshot

1. **Run the app locally:**
   ```bash
   pnpm dev
   ```

2. **Set up a good demo state:**
   - Create 2-3 tasks in each column
   - Use different priorities (low, medium, high)
   - Add some tags (design, development, review, etc.)
   - Make it look realistic

3. **Take a screenshot:**
   - Use a large browser window (at least 1920x1080)
   - Capture the full task board with the chat panel visible
   - Include the side panel chat showing a conversation
   - Make sure the UI looks clean and professional

4. **Optimize the image:**
   ```bash
   # Example using ImageMagick
   convert task-manager-demo.png -quality 85 -resize 1920x task-manager-demo.png
   ```

5. **Save as:**
   - `task-manager-demo.png` - Main hero image (used in README)
   - Optionally: `task-manager-demo-2x.png` - Retina version

## Recommended Dimensions

- **Width:** 1920px (or 1600px minimum)
- **Height:** Auto (maintain aspect ratio)
- **Format:** PNG (for UI screenshots) or JPG (if file size is an issue)
- **Max file size:** Aim for under 500KB

## Tips for Great Screenshots

1. **Show the conversation in action** - Have the chat panel open with a visible conversation
2. **Diverse task states** - Show different priorities, tags, and columns in use
3. **Clean state** - Remove debug panels, unnecessary browser chrome
4. **Good lighting** - Use a bright, clean background
5. **Real content** - Use realistic task titles, not "Test Task 1, 2, 3"

## Alternative: Use a Screen Recording

You can also create an animated GIF or video showing:
- Creating tasks via chat
- Tasks appearing in real-time
- Moving tasks between columns
- The smooth animations

Tools:
- **Kap** (Mac) - https://getkap.co/
- **ScreenToGif** (Windows) - https://www.screentogif.com/
- **LICEcap** (Cross-platform) - https://www.cockos.com/licecap/

## Example Content for Demo

Try creating these tasks for the screenshot:

**To Do:**
- "Design landing page mockups" (high priority, tags: design, marketing)
- "Research competitor features" (medium priority, tags: research)

**In Progress:**
- "Implement user authentication" (high priority, tags: backend, security)
- "Write API documentation" (medium priority, tags: docs)

**Review:**
- "Review pull request #123" (medium priority, tags: code-review)

**Completed:**
- "Set up CI/CD pipeline" (high priority, tags: devops)
- "Create project roadmap" (low priority, tags: planning)

This creates a realistic, professional-looking board that showcases all the features!
