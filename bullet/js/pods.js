// Pod management and rendering system
window.PodsRenderer = {
    render(pods, container) {
        try {
            if (!container) return;
            
            if (pods.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 text-gray-400">
                        <i class="fas fa-folder text-6xl mb-4 opacity-50"></i>
                        <p class="text-lg">No pods yet</p>
                        <p class="text-sm">Archive notes into pods to organize them</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = pods.map(pod => this.renderPod(pod)).join('');
            
            // Add event listeners
            this.attachPodListeners();
            
        } catch (error) {
            AppUtils.error('Failed to render pods', error);
            container.innerHTML = '<div class="text-red-500 p-4">Error rendering pods</div>';
        }
    },

    renderPod(pod) {
        const noteCount = pod.notes?.length || 0;
        const lastUpdated = pod.updatedAt ? AppUtils.formatTimestamp(pod.updatedAt) : 'Unknown';
        
        return `
            <div class="pod-card bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200 cursor-pointer border border-gray-700 hover:border-${pod.color || 'blue'}-500"
                 data-pod-id="${pod.id}"
                 onclick="window.PodsRenderer.openPod('${pod.id}')">
                
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-4 h-4 rounded-full bg-${pod.color || 'blue'}-500"></div>
                        <h3 class="text-lg font-semibold text-white truncate">${this.escapeHtml(pod.name)}</h3>
                    </div>
                    
                    <div class="flex gap-1">
                        <button onclick="event.stopPropagation(); window.PodsRenderer.editPod('${pod.id}')"
                                class="text-gray-400 hover:text-blue-400 transition-colors p-1"
                                title="Edit pod">
                            <i class="fas fa-edit text-sm"></i>
                        </button>
                        <button onclick="event.stopPropagation(); window.PodsRenderer.deletePod('${pod.id}')"
                                class="text-gray-400 hover:text-red-400 transition-colors p-1"
                                title="Delete pod">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
                
                ${pod.description ? `
                    <p class="text-gray-300 text-sm mb-4 line-clamp-2">
                        ${this.escapeHtml(pod.description)}
                    </p>
                ` : ''}
                
                <div class="flex items-center justify-between text-sm text-gray-400">
                    <span class="flex items-center gap-2">
                        <i class="fas fa-sticky-note"></i>
                        ${noteCount} note${noteCount !== 1 ? 's' : ''}
                    </span>
                    <span>${lastUpdated}</span>
                </div>
                
                ${noteCount > 0 ? `
                    <div class="mt-4 flex gap-1">
                        ${pod.notes.slice(0, 3).map(note => `
                            <div class="flex-1 h-2 bg-${pod.color || 'blue'}-500 opacity-60 rounded-full"></div>
                        `).join('')}
                        ${noteCount > 3 ? `<div class="text-gray-500 text-xs ml-1">+${noteCount - 3}</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    },

    openPod(podId) {
        try {
            const pod = window.BulletNoteApp.pods.find(p => p.id == podId);
            if (!pod) return;
            
            if (window.PodModal) {
                window.PodModal.show(pod);
            } else {
                // Fallback: show alert with pod info
                alert(`Pod: ${pod.name}\nNotes: ${pod.notes?.length || 0}\nDescription: ${pod.description || 'None'}`);
            }
            
            AppUtils.log(`Opened pod: ${pod.name}`);
            
        } catch (error) {
            AppUtils.error('Failed to open pod', error);
        }
    },

    editPod(podId) {
        try {
            const pod = window.BulletNoteApp.pods.find(p => p.id == podId);
            if (!pod) return;
            
            if (window.PodEditModal) {
                window.PodEditModal.show(pod);
            } else {
                // Fallback: simple prompt editing
                const newName = prompt('Pod name:', pod.name);
                if (newName && newName.trim()) {
                    pod.name = newName.trim();
                    pod.updatedAt = Date.now();
                    window.BulletNoteApp.render();
                    window.BulletNoteApp.saveData();
                }
            }
            
        } catch (error) {
            AppUtils.error('Failed to edit pod', error);
        }
    },

    deletePod(podId) {
        try {
            const podIndex = window.BulletNoteApp.pods.findIndex(p => p.id == podId);
            if (podIndex === -1) return;
            
            const pod = window.BulletNoteApp.pods[podIndex];
            const hasNotes = pod.notes && pod.notes.length > 0;
            
            const confirmMessage = hasNotes 
                ? `Delete "${pod.name}"? This will also delete ${pod.notes.length} archived notes.`
                : `Delete "${pod.name}"?`;
            
            if (confirm(confirmMessage)) {
                // If pod has notes, move them to trash
                if (hasNotes) {
                    pod.notes.forEach(note => {
                        window.BulletNoteApp.trashedNotes.push({
                            ...note,
                            deletedAt: Date.now(),
                            fromPod: pod.name
                        });
                    });
                }
                
                // Remove pod
                window.BulletNoteApp.pods.splice(podIndex, 1);
                
                window.BulletNoteApp.render();
                window.BulletNoteApp.saveData();
                
                AppUtils.log(`Deleted pod: ${pod.name}`);
            }
            
        } catch (error) {
            AppUtils.error('Failed to delete pod', error);
        }
    },

    createNewPod() {
        try {
            if (window.PodCreateModal) {
                window.PodCreateModal.show();
            } else {
                // Fallback: simple prompt creation
                const podName = prompt('Pod name:');
                if (podName && podName.trim()) {
                    const newPod = {
                        id: Date.now(),
                        name: podName.trim(),
                        description: '',
                        color: 'blue',
                        notes: [],
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    
                    window.BulletNoteApp.pods.push(newPod);
                    window.BulletNoteApp.render();
                    window.BulletNoteApp.saveData();
                }
            }
            
        } catch (error) {
            AppUtils.error('Failed to create pod', error);
        }
    },

    archiveNotesToPod() {
        try {
            if (window.BulletNoteApp.notes.length === 0) {
                alert('No notes to archive');
                return;
            }
            
            if (window.BulletNoteApp.pods.length === 0) {
                alert('Create a pod first');
                return;
            }
            
            if (window.ArchiveToPodModal) {
                window.ArchiveToPodModal.show();
            } else {
                // Fallback: simple selection
                const podNames = window.BulletNoteApp.pods.map(p => p.name);
                const selectedPod = prompt(`Archive all notes to which pod?\n\nAvailable pods:\n${podNames.join('\n')}\n\nEnter pod name:`);
                
                if (selectedPod) {
                    const pod = window.BulletNoteApp.pods.find(p => p.name.toLowerCase() === selectedPod.toLowerCase());
                    if (pod) {
                        this.archiveAllNotesToPod(pod.id);
                    } else {
                        alert('Pod not found');
                    }
                }
            }
            
        } catch (error) {
            AppUtils.error('Failed to archive notes', error);
        }
    },

    archiveAllNotesToPod(podId) {
        try {
            const pod = window.BulletNoteApp.pods.find(p => p.id == podId);
            if (!pod) return;
            
            // Move all notes to pod
            pod.notes = pod.notes || [];
            pod.notes.push(...window.BulletNoteApp.notes);
            pod.updatedAt = Date.now();
            
            // Clear notes
            window.BulletNoteApp.notes = [];
            
            window.BulletNoteApp.render();
            window.BulletNoteApp.saveData();
            
            AppUtils.log(`Archived ${pod.notes.length} notes to pod: ${pod.name}`);
            
        } catch (error) {
            AppUtils.error('Failed to archive notes to pod', error);
        }
    },

    attachPodListeners() {
        // Any additional event listeners for pods
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Pod management utilities
window.PodManager = {
    colors: ['blue', 'green', 'purple', 'red', 'yellow', 'pink', 'indigo', 'teal'],

    createPod(name, description = '', color = 'blue') {
        return {
            id: Date.now(),
            name: name.trim(),
            description: description.trim(),
            color: color,
            notes: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
    },

    addNoteToPod(podId, note) {
        const pod = window.BulletNoteApp.pods.find(p => p.id == podId);
        if (!pod) return false;
        
        pod.notes = pod.notes || [];
        pod.notes.push(note);
        pod.updatedAt = Date.now();
        
        return true;
    },

    removeNoteFromPod(podId, noteId) {
        const pod = window.BulletNoteApp.pods.find(p => p.id == podId);
        if (!pod || !pod.notes) return false;
        
        const noteIndex = pod.notes.findIndex(n => n.id == noteId);
        if (noteIndex === -1) return false;
        
        pod.notes.splice(noteIndex, 1);
        pod.updatedAt = Date.now();
        
        return true;
    },

    updatePod(podId, updates) {
        const pod = window.BulletNoteApp.pods.find(p => p.id == podId);
        if (!pod) return false;
        
        Object.assign(pod, updates, { updatedAt: Date.now() });
        return true;
    },

    searchPods(query) {
        if (!query.trim()) return window.BulletNoteApp.pods;
        
        const searchTerm = query.toLowerCase();
        return window.BulletNoteApp.pods.filter(pod => {
            return pod.name.toLowerCase().includes(searchTerm) ||
                   (pod.description && pod.description.toLowerCase().includes(searchTerm)) ||
                   (pod.notes && pod.notes.some(note => 
                       note.contents.some(content => 
                           content && content.toLowerCase().includes(searchTerm)
                       )
                   ));
        });
    },

    getPodStats() {
        const totalPods = window.BulletNoteApp.pods.length;
        const totalArchivedNotes = window.BulletNoteApp.pods.reduce((sum, pod) => sum + (pod.notes?.length || 0), 0);
        const colorDistribution = {};
        
        window.BulletNoteApp.pods.forEach(pod => {
            colorDistribution[pod.color] = (colorDistribution[pod.color] || 0) + 1;
        });
        
        return {
            totalPods,
            totalArchivedNotes,
            colorDistribution,
            averageNotesPerPod: totalPods > 0 ? Math.round(totalArchivedNotes / totalPods * 10) / 10 : 0
        };
    }
};