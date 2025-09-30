// Note management and rendering functionality with mobile optimization and markdown support

// Simple Markdown Parser for notes
window.MarkdownParser = {
    parse: function(text) {
        if (!text) return '';
        
        let html = text
            // Bold **text** or __text__
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            
            // Italic *text* or _text_
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            
            // Code `code`
            .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
            
            // Strikethrough ~~text~~
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            
            // Headers
            .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-800 mt-3 mb-2">$1</h3>')
            .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-gray-800 mt-4 mb-2">$1</h2>')
            .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-800 mt-4 mb-3">$1</h1>')
            
            // Unordered lists
            .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
            .replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
            
            // Ordered lists
            .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
            
            // Links [text](url)
            .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank">$1</a>')
            
            // Line breaks
            .replace(/\n/g, '<br>');
            
        // Wrap consecutive list items
        html = html.replace(/(<li[^>]*>.*?<\/li>)(\s*<br>\s*<li[^>]*>.*?<\/li>)*/g, (match) => {
            return '<ul class="space-y-1">' + match.replace(/<br>\s*/g, '') + '</ul>';
        });
        
        return html;
    },
    
    // Check if text contains markdown syntax
    hasMarkdown: function(text) {
        if (!text) return false;
        const markdownPatterns = [
            /\*\*.*?\*\*/,  // Bold
            /__.*?__/,      // Bold alt
            /\*.*?\*/,      // Italic
            /_.*?_/,        // Italic alt
            /`.*?`/,        // Code
            /~~.*?~~/,      // Strikethrough
            /^#{1,3} /m,    // Headers
            /^[-*] /m,      // Lists
            /^\d+\. /m,     // Ordered lists
            /\[.*?\]\(.*?\)/ // Links
        ];
        return markdownPatterns.some(pattern => pattern.test(text));
    }
};

window.NotesRenderer = {
    render: function(notes, container) {
        try {
            if (!container) {
                console.error('NotesRenderer: No container provided');
                return;
            }
            
            // Handle empty notes array
            if (!notes || !Array.isArray(notes) || notes.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 text-gray-400">
                        <i class="fas fa-sticky-note text-6xl mb-4 opacity-50"></i>
                        <p class="text-lg">No notes yet</p>
                        <p class="text-sm">Click "Add Note" to get started</p>
                    </div>
                `;
                return;
            }
            
            let html = '';
            
            notes.forEach(note => {
                try {
                    // Validate note structure
                    if (!note || typeof note !== 'object' || !note.id) {
                        console.warn('Invalid note structure:', note);
                        return;
                    }
                    
                    // Ensure contents array exists
                    if (!note.contents || !Array.isArray(note.contents)) {
                        note.contents = ['', '', '', '', ''];
                    }
                    
                    // Ensure currentCard is valid
                    if (typeof note.currentCard !== 'number' || note.currentCard < 0 || note.currentCard >= note.contents.length) {
                        note.currentCard = 0;
                    }
                    
                    // Ensure markdown state exists (per-card markdown toggle)
                    if (!note.markdownEnabled) {
                        note.markdownEnabled = new Array(note.contents.length).fill(false);
                    }
                    if (note.markdownEnabled.length !== note.contents.length) {
                        note.markdownEnabled = note.markdownEnabled.slice(0, note.contents.length);
                        while (note.markdownEnabled.length < note.contents.length) {
                            note.markdownEnabled.push(false);
                        }
                    }
                    
                    // Get first non-empty content for display
                    const displayContent = note.contents.find(content => content && content.trim()) || 'Empty note';
                    const truncatedContent = displayContent.length > 200 
                        ? displayContent.substring(0, 200) + '...' 
                        : displayContent;
                        
                    // Check if current card has markdown enabled
                    const currentCardHasMarkdown = note.markdownEnabled && note.markdownEnabled[note.currentCard];
                    const hasAnyMarkdown = note.contents.some((content, index) => 
                        note.markdownEnabled[index] && window.MarkdownParser.hasMarkdown(content)
                    );
                    
                    // Render content based on markdown state
                    let renderedContent;
                    if (currentCardHasMarkdown) {
                        renderedContent = window.MarkdownParser.parse(truncatedContent);
                    } else {
                        renderedContent = this.escapeHtml(truncatedContent);
                    }
                        
                    // Format timestamp safely
                    const timestamp = window.AppUtils ? window.AppUtils.formatTimestamp(note.createdAt) : new Date(note.createdAt).toLocaleDateString();
                        
                    // Mobile-optimized card design with dark theme like in the image
                    html += `
                        <div class="note-card rounded-xl p-5 mb-4 shadow-lg hover:shadow-xl transform-gpu will-change-transform touch-action-manipulation cursor-pointer transition-all duration-300" 
                             style="background: linear-gradient(135deg, #334155 0%, #1e293b 100%); border: 1px solid rgba(71, 85, 105, 0.5);"
                             data-note-id="${note.id}" onclick="window.NotesRenderer.editNote('${note.id}')">
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                                <div class="flex items-center gap-2 flex-shrink-0">
                                    <span class="text-xs font-medium" style="color: #cbd5e1;">${timestamp}</span>
                                    <span class="text-xs font-medium px-2 py-1 rounded-full" style="color: #3b82f6; background-color: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2);">Card ${note.currentCard + 1}/${note.contents.length}</span>
                                    ${hasAnyMarkdown ? '<span class="text-xs font-medium px-2 py-1 rounded-full" style="color: #a855f7; background-color: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2);"><i class="fas fa-code text-xs"></i> MD</span>' : ''}
                                </div>
                            </div>
                            
                            <div class="mb-4 break-words ${currentCardHasMarkdown ? '' : 'whitespace-pre-wrap'} leading-relaxed font-medium" style="color: #f1f5f9;">${renderedContent}</div>
                            
                            <div class="flex flex-wrap gap-3 justify-end">
                                <button class="markdown-btn text-white px-4 py-2 rounded-lg text-sm min-h-[44px] touch-action-manipulation transform-gpu transition-all duration-200 font-medium shadow-sm hover:shadow-md" 
                                        style="background-color: ${currentCardHasMarkdown ? '#7c3aed' : '#94a3b8'}; border: none;"
                                        onclick="event.stopPropagation(); window.NotesRenderer.toggleMarkdown('${note.id}')"
                                        title="${currentCardHasMarkdown ? 'Disable' : 'Enable'} Markdown for current card">
                                    <i class="fas fa-code mr-1"></i>MD
                                </button>
                                <button class="edit-btn text-white px-4 py-2 rounded-lg text-sm min-h-[44px] touch-action-manipulation transform-gpu transition-all duration-200 font-medium shadow-sm hover:shadow-md" 
                                        style="background-color: #2563eb; border: none;"
                                        onclick="event.stopPropagation(); window.NotesRenderer.editNote('${note.id}')"
                                        title="Edit note">
                                    <i class="fas fa-edit mr-1"></i>Edit
                                </button>
                                <button class="delete-btn text-white px-4 py-2 rounded-lg text-sm min-h-[44px] touch-action-manipulation transform-gpu transition-all duration-200 font-medium shadow-sm hover:shadow-md" 
                                        style="background-color: #dc2626; border: none;"
                                        onclick="event.stopPropagation(); window.NotesRenderer.deleteNote('${note.id}')"
                                        title="Delete note">
                                    <i class="fas fa-trash mr-1"></i>Delete
                                </button>
                            </div>
                        </div>
                    `;
                } catch (noteError) {
                    console.error('Error rendering note:', note.id, noteError);
                    // Skip problematic notes instead of crashing
                }
            });
            
            container.innerHTML = html;
            console.log(`NotesRenderer: Successfully rendered ${notes.length} notes`);
            
        } catch (error) {
            console.error('NotesRenderer: Failed to render notes:', error);
            if (container) {
                container.innerHTML = `
                    <div class="p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Error loading notes. Please refresh the page.
                    </div>
                `;
            }
        }
    },
    
    
    editNote: function(noteId) {
        try {
            const note = window.BulletNoteApp.notes.find(n => n.id == noteId);
            if (note && window.NoteModal) {
                window.NoteModal.show(note);
            }
        } catch (error) {
            console.error('Failed to edit note:', error);
        }
    },
    
    toggleMarkdown: function(noteId) {
        try {
            const note = window.BulletNoteApp.notes.find(n => n.id == noteId);
            if (!note) return;
            
            // Ensure markdown state exists
            if (!note.markdownEnabled) {
                note.markdownEnabled = new Array(note.contents.length).fill(false);
            }
            
            // Toggle markdown for current card
            note.markdownEnabled[note.currentCard] = !note.markdownEnabled[note.currentCard];
            
            // Re-render and save
            window.BulletNoteApp.render();
            window.BulletNoteApp.saveData();
            
            console.log(`Markdown ${note.markdownEnabled[note.currentCard] ? 'enabled' : 'disabled'} for note ${noteId}, card ${note.currentCard}`);
            
        } catch (error) {
            console.error('Failed to toggle markdown:', error);
        }
    },
    
    deleteNote: function(noteId) {
        try {
            const noteIndex = window.BulletNoteApp.notes.findIndex(n => n.id == noteId);
            if (noteIndex === -1) return;
            
            const note = window.BulletNoteApp.notes[noteIndex];
            
            // Get preview content for confirmation
            const previewContent = note.contents.find(content => content && content.trim()) || 'Empty note';
            const truncatedPreview = previewContent.length > 50 
                ? previewContent.substring(0, 50) + '...' 
                : previewContent;
            
            if (confirm(`Delete this note?\n\n"${truncatedPreview}"\n\nIt will be moved to trash and auto-deleted after 30 days.`)) {
                // Remove from notes
                window.BulletNoteApp.notes.splice(noteIndex, 1);
                
                // Move to trash
                window.BulletNoteApp.trashedNotes.push({
                    ...note,
                    deletedAt: Date.now()
                });
                
                // Re-render and save
                window.BulletNoteApp.render();
                window.BulletNoteApp.saveData();
                
                console.log('Note moved to trash:', noteId);
            }
            
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    },
    
    escapeHtml: function(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
