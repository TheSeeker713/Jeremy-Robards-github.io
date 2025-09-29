// Note management and rendering functionality with mobile optimization

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
                    
                    // Get first non-empty content for display
                    const displayContent = note.contents.find(content => content && content.trim()) || 'Empty note';
                    const truncatedContent = displayContent.length > 200 
                        ? displayContent.substring(0, 200) + '...' 
                        : displayContent;
                        
                    // Format timestamp safely
                    const timestamp = window.AppUtils ? window.AppUtils.formatTimestamp(note.createdAt) : new Date(note.createdAt).toLocaleDateString();
                        
                    // Mobile-optimized card design matching the app structure
                    html += `
                        <div class="note-card bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm transform-gpu will-change-transform touch-action-manipulation cursor-pointer hover:shadow-md transition-all duration-200" 
                             data-note-id="${note.id}" onclick="window.NotesRenderer.editNote('${note.id}')">
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                                <div class="flex items-center gap-2 flex-shrink-0">
                                    <span class="text-xs text-gray-500">${timestamp}</span>
                                    <span class="text-xs text-blue-600">Card ${note.currentCard + 1}/${note.contents.length}</span>
                                </div>
                            </div>
                            
                            <div class="text-gray-700 mb-3 break-words whitespace-pre-wrap leading-relaxed">${this.escapeHtml(truncatedContent)}</div>
                            
                            <div class="flex flex-wrap gap-2 justify-end">
                                <button class="edit-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm min-h-[44px] touch-action-manipulation transform-gpu transition-colors" 
                                        onclick="event.stopPropagation(); window.NotesRenderer.editNote('${note.id}')"
                                        title="Edit note">
                                    <i class="fas fa-edit mr-1"></i>Edit
                                </button>
                                <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm min-h-[44px] touch-action-manipulation transform-gpu transition-colors" 
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
