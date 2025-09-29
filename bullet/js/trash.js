// Trash management system
window.TrashRenderer = {
    render(trashedNotes, container) {
        try {
            if (!container) return;
            
            if (trashedNotes.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 text-gray-400">
                        <i class="fas fa-trash text-6xl mb-4 opacity-50"></i>
                        <p class="text-lg">Trash is empty</p>
                        <p class="text-sm">Deleted notes will appear here</p>
                    </div>
                `;
                return;
            }
            
            // Sort by deletion date (newest first)
            const sortedNotes = [...trashedNotes].sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
            
            container.innerHTML = `
                <div class="mb-6 flex justify-between items-center">
                    <p class="text-gray-400 text-sm">
                        ${trashedNotes.length} item${trashedNotes.length !== 1 ? 's' : ''} in trash
                        • Auto-delete after 30 days
                    </p>
                    <button onclick="window.TrashManager.showEmptyConfirm()" 
                            class="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
                        <i class="fas fa-trash-alt mr-1"></i> Empty Trash
                    </button>
                </div>
                
                <div class="space-y-4">
                    ${sortedNotes.map(note => this.renderTrashedNote(note)).join('')}
                </div>
            `;
            
        } catch (error) {
            AppUtils.error('Failed to render trash', error);
            container.innerHTML = '<div class="text-red-500 p-4">Error rendering trash</div>';
        }
    },

    renderTrashedNote(note) {
        const deletedDate = new Date(note.deletedAt || Date.now());
        const daysInTrash = Math.floor((Date.now() - note.deletedAt) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, 30 - daysInTrash);
        
        // Get first non-empty content for preview
        const previewContent = note.contents.find(content => content && content.trim()) || 'Empty note';
        const truncatedContent = previewContent.length > 100 
            ? previewContent.substring(0, 100) + '...' 
            : previewContent;
        
        const statusColor = daysRemaining <= 7 ? 'text-red-400' : daysRemaining <= 14 ? 'text-yellow-400' : 'text-gray-400';
        
        return `
            <div class="trashed-note bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                 data-note-id="${note.id}">
                
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs text-gray-500">
                                Deleted ${AppUtils.formatTimestamp(note.deletedAt)}
                            </span>
                            ${note.fromPod ? `
                                <span class="text-xs bg-purple-600 text-white px-2 py-0.5 rounded">
                                    From: ${this.escapeHtml(note.fromPod)}
                                </span>
                            ` : ''}
                        </div>
                        
                        <p class="text-sm text-gray-300 leading-relaxed mb-2">
                            ${this.formatContent(truncatedContent)}
                        </p>
                        
                        <div class="flex items-center justify-between text-xs">
                            <span class="text-gray-500">
                                Card ${note.currentCard + 1}/5 • Created ${AppUtils.formatTimestamp(note.createdAt)}
                            </span>
                            <span class="${statusColor}">
                                ${daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expires today'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="flex gap-1 ml-4">
                        <button onclick="window.TrashManager.restoreNote('${note.id}')"
                                class="text-green-400 hover:text-green-300 transition-colors p-1"
                                title="Restore note">
                            <i class="fas fa-undo text-sm"></i>
                        </button>
                        <button onclick="window.TrashManager.deleteNotePermanently('${note.id}')"
                                class="text-red-400 hover:text-red-300 transition-colors p-1"
                                title="Delete permanently">
                            <i class="fas fa-times text-sm"></i>
                        </button>
                        <button onclick="window.TrashRenderer.previewNote('${note.id}')"
                                class="text-blue-400 hover:text-blue-300 transition-colors p-1"
                                title="Preview note">
                            <i class="fas fa-eye text-sm"></i>
                        </button>
                    </div>
                </div>
                
                ${this.renderContentPreview(note)}
            </div>
        `;
    },

    renderContentPreview(note) {
        const nonEmptyCards = note.contents
            .map((content, index) => ({ content, index }))
            .filter(card => card.content && card.content.trim())
            .slice(0, 3); // Show up to 3 cards
        
        if (nonEmptyCards.length <= 1) return '';
        
        return `
            <div class="mt-3 pt-3 border-t border-gray-700">
                <div class="text-xs text-gray-400 mb-2">Other cards with content:</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    ${nonEmptyCards.slice(1).map(card => `
                        <div class="bg-gray-700 rounded p-2">
                            <div class="text-xs text-gray-400 mb-1">Card ${card.index + 1}</div>
                            <div class="text-xs text-gray-300">
                                ${card.content.length > 50 ? card.content.substring(0, 50) + '...' : card.content}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    previewNote(noteId) {
        try {
            const note = window.BulletNoteApp.trashedNotes.find(n => n.id == noteId);
            if (!note) return;
            
            if (window.TrashPreviewModal) {
                window.TrashPreviewModal.show(note);
            } else {
                // Fallback: show in alert
                const allContent = note.contents
                    .map((content, index) => content.trim() ? `Card ${index + 1}: ${content}` : '')
                    .filter(Boolean)
                    .join('\n\n');
                
                alert(`Preview Note\n\nDeleted: ${new Date(note.deletedAt).toLocaleString()}\nCreated: ${new Date(note.createdAt).toLocaleString()}\n\n${allContent || 'No content'}`);
            }
            
        } catch (error) {
            AppUtils.error('Failed to preview note', error);
        }
    },

    formatContent(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-600 px-1 rounded text-xs">$1</code>');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Trash management utilities
window.TrashManager = {
    restoreNote(noteId) {
        try {
            const noteIndex = window.BulletNoteApp.trashedNotes.findIndex(n => n.id == noteId);
            if (noteIndex === -1) return;
            
            const note = window.BulletNoteApp.trashedNotes[noteIndex];
            
            // Remove from trash
            window.BulletNoteApp.trashedNotes.splice(noteIndex, 1);
            
            // Clean up trash-specific properties
            delete note.deletedAt;
            delete note.fromPod;
            
            // Add back to notes
            window.BulletNoteApp.notes.push(note);
            
            window.BulletNoteApp.render();
            window.BulletNoteApp.saveData();
            
            AppUtils.log(`Restored note: ${noteId}`);
            
            // Show success message
            this.showMessage('Note restored successfully', 'success');
            
        } catch (error) {
            AppUtils.error('Failed to restore note', error);
            this.showMessage('Failed to restore note', 'error');
        }
    },

    deleteNotePermanently(noteId) {
        try {
            const note = window.BulletNoteApp.trashedNotes.find(n => n.id == noteId);
            if (!note) return;
            
            const previewContent = note.contents.find(content => content && content.trim()) || 'Empty note';
            const truncatedPreview = previewContent.length > 50 
                ? previewContent.substring(0, 50) + '...' 
                : previewContent;
            
            if (confirm(`Permanently delete this note?\n\n"${truncatedPreview}"\n\nThis action cannot be undone.`)) {
                const noteIndex = window.BulletNoteApp.trashedNotes.findIndex(n => n.id == noteId);
                window.BulletNoteApp.trashedNotes.splice(noteIndex, 1);
                
                window.BulletNoteApp.render();
                window.BulletNoteApp.saveData();
                
                AppUtils.log(`Permanently deleted note: ${noteId}`);
                this.showMessage('Note permanently deleted', 'success');
            }
            
        } catch (error) {
            AppUtils.error('Failed to permanently delete note', error);
            this.showMessage('Failed to delete note', 'error');
        }
    },

    showEmptyConfirm() {
        const count = window.BulletNoteApp.trashedNotes.length;
        if (count === 0) return;
        
        if (confirm(`Permanently delete all ${count} items in trash?\n\nThis action cannot be undone.`)) {
            this.emptyTrash();
        }
    },

    emptyTrash() {
        try {
            const count = window.BulletNoteApp.trashedNotes.length;
            window.BulletNoteApp.trashedNotes = [];
            
            window.BulletNoteApp.render();
            window.BulletNoteApp.saveData();
            
            AppUtils.log(`Emptied trash: ${count} items deleted`);
            this.showMessage(`Trash emptied (${count} items deleted)`, 'success');
            
        } catch (error) {
            AppUtils.error('Failed to empty trash', error);
            this.showMessage('Failed to empty trash', 'error');
        }
    },

    cleanExpiredNotes() {
        try {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const originalCount = window.BulletNoteApp.trashedNotes.length;
            
            window.BulletNoteApp.trashedNotes = window.BulletNoteApp.trashedNotes.filter(note => {
                return (note.deletedAt || Date.now()) > thirtyDaysAgo;
            });
            
            const deletedCount = originalCount - window.BulletNoteApp.trashedNotes.length;
            
            if (deletedCount > 0) {
                window.BulletNoteApp.saveData();
                AppUtils.log(`Auto-deleted ${deletedCount} expired notes from trash`);
            }
            
            return deletedCount;
            
        } catch (error) {
            AppUtils.error('Failed to clean expired notes', error);
            return 0;
        }
    },

    getTrashStats() {
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = now - (14 * 24 * 60 * 60 * 1000);
        
        const stats = {
            total: window.BulletNoteApp.trashedNotes.length,
            expiringSoon: 0,
            expiringToday: 0,
            fromPods: 0,
            oldestItem: null,
            newestItem: null
        };
        
        window.BulletNoteApp.trashedNotes.forEach(note => {
            const deletedAt = note.deletedAt || now;
            const daysInTrash = (now - deletedAt) / (1000 * 60 * 60 * 24);
            
            if (daysInTrash >= 29) stats.expiringToday++;
            else if (daysInTrash >= 23) stats.expiringSoon++;
            
            if (note.fromPod) stats.fromPods++;
            
            if (!stats.oldestItem || deletedAt < stats.oldestItem.deletedAt) {
                stats.oldestItem = note;
            }
            if (!stats.newestItem || deletedAt > stats.newestItem.deletedAt) {
                stats.newestItem = note;
            }
        });
        
        return stats;
    },

    showMessage(message, type = 'info') {
        // Create a temporary toast message
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-3 rounded-lg text-white transition-all duration-300 ${
            type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
        }, 3000);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3300);
    }
};

// Auto-cleanup expired notes on app load
if (window.BulletNoteApp) {
    // Run cleanup when app loads
    setTimeout(() => {
        window.TrashManager.cleanExpiredNotes();
    }, 5000);
    
    // Set up periodic cleanup (every 24 hours)
    setInterval(() => {
        window.TrashManager.cleanExpiredNotes();
    }, 24 * 60 * 60 * 1000);
}