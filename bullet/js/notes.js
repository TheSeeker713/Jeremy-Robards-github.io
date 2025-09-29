// Note management and rendering functionality
window.NotesRenderer = {
    render(notes, container) {
        try {
            if (!container) return;
            
            if (notes.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 text-gray-400">
                        <i class="fas fa-sticky-note text-6xl mb-4 opacity-50"></i>
                        <p class="text-lg">No notes yet</p>
                        <p class="text-sm">Create your first note to get started</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = notes.map(note => this.renderNote(note)).join('');
            
            // Add event listeners after rendering
            this.attachNoteListeners();
            
        } catch (error) {
            AppUtils.error('Failed to render notes', error);
            container.innerHTML = '<div class="text-red-500 p-4">Error rendering notes</div>';
        }
    },

    renderNote(note) {
        const cardContent = note.contents[note.currentCard] || '';
        const isEmpty = !cardContent.trim();
        const hasMultipleCards = note.contents.some((content, index) => index !== note.currentCard && content.trim());
        
        return `
            <li class="note-item flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl border border-slate-600/50 backdrop-blur-sm hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-300 shadow-lg"
                data-note-id="${note.id}">
                
                <div class="flex items-center space-x-4 flex-1">
                    <!-- Bullet point with ocean theme -->
                    <div class="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md flex-shrink-0 ring-2 ring-cyan-300/20"></div>
                    
                    <!-- Note content -->
                    <div class="flex-1 cursor-pointer" onclick="window.NotesRenderer.handleCardClick('${note.id}')">
                        <div class="text-white font-medium leading-relaxed ${isEmpty ? 'text-gray-400 italic' : ''}">
                            ${isEmpty ? 'Empty note - click to edit' : this.formatNoteContent(cardContent)}
                        </div>
                        ${hasMultipleCards ? `
                            <div class="text-xs text-cyan-300 mt-1 flex items-center gap-1">
                                <i class="fas fa-layer-group"></i>
                                <span>Card ${note.currentCard + 1}/5 • Multiple cards • ${AppUtils.formatTimestamp(note.createdAt)}</span>
                            </div>
                        ` : `
                            <div class="text-xs text-slate-400 mt-1">
                                Card ${note.currentCard + 1}/5 • ${AppUtils.formatTimestamp(note.createdAt)}
                            </div>
                        `}
                    </div>
                </div>
                
                <!-- Action buttons -->
                <div class="flex items-center gap-2 ml-4">
                    ${hasMultipleCards ? `
                        <button onclick="event.stopPropagation(); window.CardControls.previousCard('${note.id}')"
                                class="p-2 text-cyan-300 hover:text-cyan-100 hover:bg-slate-600/50 rounded-lg transition-all duration-200"
                                title="Previous card">
                            <i class="fas fa-chevron-left text-sm"></i>
                        </button>
                        <button onclick="event.stopPropagation(); window.CardControls.nextCard('${note.id}')"
                                class="p-2 text-cyan-300 hover:text-cyan-100 hover:bg-slate-600/50 rounded-lg transition-all duration-200"
                                title="Next card">
                            <i class="fas fa-chevron-right text-sm"></i>
                        </button>
                    ` : ''}
                    
                    <button onclick="event.stopPropagation(); window.NotesRenderer.deleteNote('${note.id}')"
                            class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                            title="Delete note">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </li>
        `;
    },

    renderNoteCards(note) {
        let cardsHtml = '';
        const baseRotation = note.rotation;
        
        // Render background cards
        for (let i = 0; i < 5; i++) {
            const cardIndex = (note.currentCard + i + 1) % 5;
            const content = note.contents[cardIndex] || '';
            const rotation = baseRotation + (i + 1) * 2;
            const zIndex = 5 - i;
            const opacity = Math.max(0.1, 1 - (i * 0.2));
            
            if (content.trim() || i === 0) { // Show at least one background card
                cardsHtml += `
                    <div class="card absolute inset-0 bg-amber-50 rounded-lg shadow-md border border-amber-200"
                         style="transform: rotate(${rotation}deg); transform-origin: center center; z-index: ${zIndex}; opacity: ${opacity};">
                    </div>
                `;
            }
        }
        
        return cardsHtml;
    },

    formatNoteContent(content) {
        // Simple formatting: convert line breaks and handle basic markdown-style formatting
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-amber-200 px-1 rounded text-xs">$1</code>');
    },

    handleCardClick(noteId) {
        try {
            const note = window.BulletNoteApp.notes.find(n => n.id == noteId);
            if (!note) return;
            
            if (window.NoteModal) {
                window.NoteModal.show(note);
            } else {
                // Fallback: simple prompt editing
                const currentContent = note.contents[note.currentCard] || '';
                const newContent = prompt('Edit note:', currentContent);
                if (newContent !== null) {
                    note.contents[note.currentCard] = newContent;
                    window.BulletNoteApp.render();
                    window.BulletNoteApp.saveData();
                }
            }
        } catch (error) {
            AppUtils.error('Failed to handle card click', error);
        }
    },

    deleteNote(noteId) {
        try {
            const noteIndex = window.BulletNoteApp.notes.findIndex(n => n.id == noteId);
            if (noteIndex === -1) return;
            
            const note = window.BulletNoteApp.notes[noteIndex];
            
            // Move to trash
            window.BulletNoteApp.trashedNotes.push({
                ...note,
                deletedAt: Date.now()
            });
            
            // Remove from notes
            window.BulletNoteApp.notes.splice(noteIndex, 1);
            
            // Save and refresh
            window.BulletNoteApp.render();
            window.BulletNoteApp.saveData();
            
            AppUtils.log(`Moved note to trash: ${noteId}`);
            
        } catch (error) {
            AppUtils.error('Failed to delete note', error);
        }
    },

    attachNoteListeners() {
        // Any additional event listeners can be attached here
        // Most events are handled inline for performance
    },

    rotateNote(noteId, direction = 1) {
        try {
            const note = window.BulletNoteApp.notes.find(n => n.id == noteId);
            if (!note) return;
            
        const rotationStep = 72; // 360/5 cards
            note.rotation = (note.rotation + (direction * rotationStep)) % 360;
            
            window.BulletNoteApp.render();
            window.BulletNoteApp.saveData();
            
        } catch (error) {
            AppUtils.error('Failed to rotate note', error);
        }
    },

    switchCard(noteId, cardIndex) {
        try {
            const note = window.BulletNoteApp.notes.find(n => n.id == noteId);
        if (!note || cardIndex < 0 || cardIndex >= 5) return;
            
            note.currentCard = cardIndex;
            note.rotation = (cardIndex * rotationStep) % 360; // Sync rotation with card
            
            window.BulletNoteApp.render();
            window.BulletNoteApp.saveData();
            
        } catch (error) {
            AppUtils.error('Failed to switch card', error);
        }
    },

    getNextCardIndex(noteId) {
        const note = window.BulletNoteApp.notes.find(n => n.id == noteId);
        if (!note) return 0;
        
    return (note.currentCard + 1) % 5;
    },

    getPreviousCardIndex(noteId) {
        const note = window.BulletNoteApp.notes.find(n => n.id == noteId);
        if (!note) return 0;
        
    return (note.currentCard - 1 + 5) % 5;
    }
};

// Card navigation controls
window.CardControls = {
    nextCard(noteId) {
        const note = window.BulletNoteApp.notes.find(n => n.id == noteId);
        if (!note) return;
        
        const nextIndex = (note.currentCard + 1) % 5;
        window.NotesRenderer.switchCard(noteId, nextIndex);
    },

    previousCard(noteId) {
        const note = window.BulletNoteApp.notes.find(n => n.id == noteId);
        if (!note) return;
        
        const prevIndex = (note.currentCard - 1 + 5) % 5;
        window.NotesRenderer.switchCard(noteId, prevIndex);
    },

    goToCard(noteId, cardIndex) {
        window.NotesRenderer.switchCard(noteId, cardIndex);
    }
};