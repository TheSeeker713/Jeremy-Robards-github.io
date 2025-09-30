// Modal system for various app interactions
window.ModalSystem = {
    currentModal: null,
    
    show(modalContent, options = {}) {
        const {
            title = '',
            size = 'md', // sm, md, lg, xl
            closable = true,
            backdrop = true
        } = options;
        
        this.hide(); // Hide any existing modal
        
        const modal = this.createModal(title, modalContent, size, closable, backdrop);
        const container = document.getElementById('modalsContainer') || document.body;
        container.appendChild(modal);
        
        this.currentModal = modal;
        
        // Animate in
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('.modal-content').classList.remove('scale-95');
        }, 10);
        
        // Focus management
        const firstInput = modal.querySelector('input, textarea, button');
        if (firstInput) firstInput.focus();
        
        // Keyboard handling
        modal.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Handle backdrop clicks (but not content clicks)
        if (backdrop) {
            const backdropElement = modal.querySelector('.modal-backdrop');
            if (backdropElement) {
                backdropElement.addEventListener('click', (e) => {
                    if (e.target === backdropElement) {
                        // For NoteModal, save and close; for others, just close
                        if (window.NoteModal && window.NoteModal.currentNote) {
                            window.NoteModal.saveAndClose();
                        } else {
                            this.hide();
                        }
                    }
                });
            }
        }
        
        return modal;
    },
    
    hide() {
        if (!this.currentModal) return;
        
        // Animate out
        this.currentModal.classList.add('opacity-0');
        this.currentModal.querySelector('.modal-content').classList.add('scale-95');
        
        setTimeout(() => {
            if (this.currentModal && this.currentModal.parentNode) {
                this.currentModal.parentNode.removeChild(this.currentModal);
            }
            this.currentModal = null;
        }, 200);
    },
    
    createModal(title, content, size, closable, backdrop) {
        const sizeClasses = {
            sm: 'max-w-md',
            md: 'max-w-lg',
            lg: 'max-w-2xl',
            xl: 'max-w-4xl'
        };
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 overflow-y-auto opacity-0 transition-opacity duration-200';
        modal.innerHTML = `
            <div class="flex min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                ${backdrop ? '<div class="modal-backdrop fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"></div>' : ''}
                
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                
                <div class="modal-content inline-block align-bottom bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:${sizeClasses[size]} sm:w-full sm:p-6 scale-95">
                    ${title ? `
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-medium text-white">${title}</h3>
                            ${closable ? `
                                <button onclick="window.ModalSystem.hide()" class="text-gray-400 hover:text-gray-300">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    },
    
    handleKeydown(e) {
        if (e.key === 'Escape') {
            this.hide();
        }
    }
};

// Note editing modal
window.NoteModal = {
    show(note) {
        // Ensure markdown state exists
        if (!note.markdownEnabled) {
            note.markdownEnabled = new Array(note.contents.length).fill(false);
        }
        
        const isMarkdownEnabled = note.markdownEnabled[note.currentCard] || false;
        
        const content = `
            <div class="space-y-6">
                <!-- Ocean-themed curved card design -->
                <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 border border-slate-600/50 shadow-2xl backdrop-blur-sm">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <div class="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md ring-2 ring-cyan-300/20"></div>
                            <span class="text-slate-300 font-medium">Editing Note</span>
                            ${isMarkdownEnabled ? '<span class="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full"><i class="fas fa-code text-xs"></i> Markdown</span>' : ''}
                        </div>
                        <div class="flex items-center gap-3 text-slate-400">
                            <button onclick="window.NoteModal.toggleMarkdown()" 
                                    class="p-2 hover:text-cyan-300 hover:bg-slate-700/50 rounded-xl transition-all duration-200 ${isMarkdownEnabled ? 'text-purple-400' : ''}" 
                                    title="Toggle Markdown">
                                <i class="fas fa-code"></i>
                            </button>
                            <button onclick="window.NoteModal.togglePreview()" 
                                    class="p-2 hover:text-cyan-300 hover:bg-slate-700/50 rounded-xl transition-all duration-200" 
                                    title="Toggle Preview" 
                                    id="previewToggleBtn"
                                    style="display: ${isMarkdownEnabled ? 'block' : 'none'}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="window.NoteModal.previousCard()" class="p-2 hover:text-cyan-300 hover:bg-slate-700/50 rounded-xl transition-all duration-200">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <span class="text-sm font-medium px-3 py-1 bg-slate-700/50 rounded-xl">
                                Card <span id="currentCardNumber" class="text-cyan-300">${note.currentCard + 1}</span>/5
                            </span>
                            <button onclick="window.NoteModal.nextCard()" class="p-2 hover:text-cyan-300 hover:bg-slate-700/50 rounded-xl transition-all duration-200">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Ocean-themed curved textarea and preview -->
                    <div class="relative">
                        <textarea id="noteContentInput" 
                                  class="w-full h-48 p-6 bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 backdrop-blur-sm shadow-inner transition-all duration-200 font-medium leading-relaxed"
                                  placeholder="Enter your note content... ${isMarkdownEnabled ? '(Markdown enabled) ' : ''}(Shift+Enter to save and close)"
                                  spellcheck="false">${note.contents[note.currentCard] || ''}</textarea>
                        
                        <!-- Markdown Preview Panel -->
                        <div id="markdownPreview" 
                             class="absolute inset-0 p-6 bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 rounded-2xl text-white backdrop-blur-sm shadow-inner overflow-y-auto hidden">
                            <div class="prose prose-invert prose-sm max-w-none">
                                <div id="previewContent">${isMarkdownEnabled ? window.MarkdownParser.parse(note.contents[note.currentCard] || '') : ''}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Markdown Help (shown when markdown is enabled) -->
                    <div id="markdownHelp" class="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-xl" style="display: ${isMarkdownEnabled ? 'block' : 'none'}">
                        <strong>Markdown:</strong> **bold** *italic* \`code\` ~~strike~~ # Header - List [link](url)
                    </div>
                    
                    <!-- Card navigation dots with ocean theme -->
                    <div class="flex justify-center items-center gap-2 mt-6 p-4 bg-slate-700/30 rounded-2xl">
                        ${this.renderCardDots(note)}
                    </div>
                </div>
                
                <!-- Instructions -->
                <div class="text-center text-slate-400 text-sm space-y-1">
                    <p><kbd class="px-2 py-1 bg-slate-700 rounded text-xs">Shift+Enter</kbd> to save and close</p>
                    <p>Click outside to save and close • Auto-saves as you type</p>
                </div>
            </div>
        `;
        
        this.currentNote = note;
        this.currentCardIndex = note.currentCard;
        this.originalContents = [...note.contents];
        
        window.ModalSystem.show(content, { title: '', size: 'xl', backdrop: true });
        
        // Setup auto-save and keyboard shortcuts
        setTimeout(() => {
            this.setupModalControls();
        }, 100);
    },
    
    setupModalControls() {
        const textarea = document.getElementById('noteContentInput');
        if (!textarea) return;
        
        // Focus the textarea
        textarea.focus();
        
        // Setup real-time preview updates for markdown
        textarea.addEventListener('input', () => {
            // Update preview if it's visible and markdown is enabled
            const preview = document.getElementById('markdownPreview');
            if (preview && !preview.classList.contains('hidden')) {
                this.updatePreview();
            }
        });
        
        // Keyboard shortcuts
        textarea.addEventListener('keydown', (e) => {
            // Shift+Enter to save and close
            if (e.shiftKey && e.key === 'Enter') {
                e.preventDefault();
                this.saveAndClose();
                return;
            }
            
            // Ctrl/Cmd + Left/Right for card navigation
            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousCard();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextCard();
            }
            
            // Ctrl/Cmd + M to toggle markdown
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                this.toggleMarkdown();
            }
            
            // Ctrl/Cmd + P to toggle preview (when markdown is enabled)
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                const isMarkdownEnabled = this.currentNote && this.currentNote.markdownEnabled && this.currentNote.markdownEnabled[this.currentCardIndex];
                if (isMarkdownEnabled) {
                    e.preventDefault();
                    this.togglePreview();
                }
            }
            
            // Escape to close without saving current changes
            if (e.key === 'Escape') {
                this.cancel();
            }
        });
        
        // Initialize markdown UI state
        this.updateMarkdownUI();
    },
    
    handleOutsideClick(e) {
        const modal = window.ModalSystem.currentModal;
        if (!modal || !window.NoteModal.currentNote) return;
        
        // Don't close if clicking on interactive elements
        const interactiveElements = [
            'button',
            'input', 
            'textarea',
            '.modal-content',
            '[onclick]',
            'kbd'
        ];
        
        // Check if click is on any interactive element
        for (const selector of interactiveElements) {
            if (e.target.matches(selector) || e.target.closest(selector)) {
                return; // Don't close modal
            }
        }
        
        // Only close if clicking on the modal backdrop (dark area outside the card)
        const modalBackdrop = modal.querySelector('.fixed.inset-0.transition-opacity');
        if (e.target === modalBackdrop) {
            e.preventDefault();
            e.stopPropagation();
            window.NoteModal.saveAndClose();
        }
    },
    
    autoSave() {
        if (!this.currentNote) return;
        
        const textarea = document.getElementById('noteContentInput');
        if (textarea) {
            this.currentNote.contents[this.currentCardIndex] = textarea.value;
            window.BulletNoteApp.saveData();
            // Removed save indicator popup for cleaner UX
        }
    },
    
    saveAndClose() {
        this.autoSave(); // Final save
        window.BulletNoteApp.render(); // Update the UI
        window.ModalSystem.hide();
        
        AppUtils.log(`Saved and closed note: ${this.currentNote.id}`);
    },
    
    renderCardDots(note) {
        let dots = '';
        for (let i = 0; i < 5; i++) {
            const hasContent = note.contents[i] && note.contents[i].trim();
            const isCurrent = i === this.currentCardIndex;
            
            dots += `
                <button onclick="window.NoteModal.switchCard(${i})"
                        class="w-3 h-3 rounded-full transition-all duration-300 ${
                            isCurrent 
                                ? 'bg-gradient-to-br from-cyan-400 to-blue-500 ring-2 ring-cyan-300/50 shadow-lg scale-125' 
                                : hasContent 
                                    ? 'bg-gradient-to-br from-slate-400 to-slate-500 hover:from-cyan-300 hover:to-blue-400 hover:scale-110 shadow-md' 
                                    : 'bg-slate-600/50 hover:bg-slate-500/70 hover:scale-110'
                        }"
                        title="Card ${i + 1}${hasContent ? ' (has content)' : ' (empty)'}">
                </button>
            `;
        }
        return dots;
    },
    
    switchCard(cardIndex) {
        if (!this.currentNote) return;
        
        // Auto-save current card content before switching
        const input = document.getElementById('noteContentInput');
        if (input) {
            this.currentNote.contents[this.currentCardIndex] = input.value;
        }
        
        // Switch to new card
        this.currentCardIndex = cardIndex;
        this.currentNote.currentCard = cardIndex;
        
        // Update UI
        if (input) {
            input.value = this.currentNote.contents[cardIndex] || '';
            input.focus();
        }
        
        const cardNumber = document.getElementById('currentCardNumber');
        if (cardNumber) {
            cardNumber.textContent = cardIndex + 1;
        }
        
        // Update dots
        const dotsContainer = document.querySelector('.flex.justify-center.items-center.gap-2');
        if (dotsContainer) {
            const newDots = this.renderCardDots(this.currentNote);
            dotsContainer.innerHTML = newDots;
        }
        
        // Update markdown UI for new card
        this.updateMarkdownUI();
        
        // Reset preview mode when switching cards
        const preview = document.getElementById('markdownPreview');
        if (preview && !preview.classList.contains('hidden')) {
            this.togglePreview(); // Switch back to editor view
        }
        
        // Auto-save the change
        this.autoSave();
    },
    
    nextCard() {
        const nextIndex = (this.currentCardIndex + 1) % 5;
        this.switchCard(nextIndex);
    },
    
    previousCard() {
        const prevIndex = (this.currentCardIndex - 1 + 5) % 5;
        this.switchCard(prevIndex);
    },
    
    cancel() {
        if (!this.currentNote) return;
        
        // Restore original contents without saving
        this.currentNote.contents = this.originalContents;
        this.currentNote.currentCard = this.currentCardIndex;
        
        window.ModalSystem.hide();
        
        AppUtils.log('Modal cancelled, changes discarded');
    },
    
    toggleMarkdown() {
        if (!this.currentNote) return;
        
        // Ensure markdown state exists
        if (!this.currentNote.markdownEnabled) {
            this.currentNote.markdownEnabled = new Array(this.currentNote.contents.length).fill(false);
        }
        
        // Toggle markdown for current card
        this.currentNote.markdownEnabled[this.currentCardIndex] = !this.currentNote.markdownEnabled[this.currentCardIndex];
        
        // Update UI
        this.updateMarkdownUI();
        
        // Save the change
        window.BulletNoteApp.saveData();
        
        AppUtils.log(`Markdown ${this.currentNote.markdownEnabled[this.currentCardIndex] ? 'enabled' : 'disabled'} for card ${this.currentCardIndex}`);
    },
    
    togglePreview() {
        const textarea = document.getElementById('noteContentInput');
        const preview = document.getElementById('markdownPreview');
        const previewBtn = document.getElementById('previewToggleBtn');
        
        if (!textarea || !preview) return;
        
        const isPreviewVisible = !preview.classList.contains('hidden');
        
        if (isPreviewVisible) {
            // Show textarea, hide preview
            preview.classList.add('hidden');
            textarea.classList.remove('hidden');
            previewBtn.innerHTML = '<i class="fas fa-eye"></i>';
            previewBtn.title = 'Show Preview';
        } else {
            // Show preview, hide textarea
            this.updatePreview();
            preview.classList.remove('hidden');
            textarea.classList.add('hidden');
            previewBtn.innerHTML = '<i class="fas fa-edit"></i>';
            previewBtn.title = 'Show Editor';
        }
    },
    
    updatePreview() {
        const textarea = document.getElementById('noteContentInput');
        const previewContent = document.getElementById('previewContent');
        
        if (!textarea || !previewContent) return;
        
        if (this.currentNote && this.currentNote.markdownEnabled && this.currentNote.markdownEnabled[this.currentCardIndex]) {
            previewContent.innerHTML = window.MarkdownParser.parse(textarea.value);
        } else {
            previewContent.textContent = textarea.value;
        }
    },
    
    updateMarkdownUI() {
        if (!this.currentNote) return;
        
        const isMarkdownEnabled = this.currentNote.markdownEnabled && this.currentNote.markdownEnabled[this.currentCardIndex];
        const textarea = document.getElementById('noteContentInput');
        const markdownHelp = document.getElementById('markdownHelp');
        const previewBtn = document.getElementById('previewToggleBtn');
        
        // Update textarea placeholder
        if (textarea) {
            textarea.placeholder = `Enter your note content... ${isMarkdownEnabled ? '(Markdown enabled) ' : ''}(Shift+Enter to save and close)`;
        }
        
        // Show/hide markdown help
        if (markdownHelp) {
            markdownHelp.style.display = isMarkdownEnabled ? 'block' : 'none';
        }
        
        // Show/hide preview button
        if (previewBtn) {
            previewBtn.style.display = isMarkdownEnabled ? 'block' : 'none';
        }
        
        // Update preview if it's visible
        this.updatePreview();
        
        // Re-render the main notes view to show markdown badge
        setTimeout(() => {
            window.BulletNoteApp.render();
        }, 100);
    }
};

// Pod creation modal
window.PodCreateModal = {
    show() {
        const content = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Pod Name</label>
                    <input id="podNameInput" 
                           type="text" 
                           class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                           placeholder="Enter pod name..."
                           maxlength="50">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                    <textarea id="podDescriptionInput" 
                              class="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                              placeholder="Enter pod description..."
                              maxlength="200"></textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Color</label>
                    <div class="flex gap-2 flex-wrap">
                        ${window.PodManager.colors.map(color => `
                            <button onclick="window.PodCreateModal.selectColor('${color}')"
                                    class="w-8 h-8 rounded-full bg-${color}-500 hover:ring-2 ring-white transition-all pod-color-btn"
                                    data-color="${color}">
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="flex justify-end gap-2 pt-4">
                    <button onclick="window.ModalSystem.hide()" 
                            class="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button onclick="window.PodCreateModal.create()" 
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Create Pod
                    </button>
                </div>
            </div>
        `;
        
        this.selectedColor = 'blue';
        window.ModalSystem.show(content, { title: 'Create New Pod', size: 'md' });
        
        // Select default color
        setTimeout(() => {
            this.selectColor('blue');
        }, 100);
    },
    
    selectColor(color) {
        this.selectedColor = color;
        
        // Update button styles
        document.querySelectorAll('.pod-color-btn').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-white');
        });
        
        const selectedBtn = document.querySelector(`[data-color="${color}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('ring-2', 'ring-white');
        }
    },
    
    create() {
        const nameInput = document.getElementById('podNameInput');
        const descriptionInput = document.getElementById('podDescriptionInput');
        
        const name = nameInput?.value.trim();
        const description = descriptionInput?.value.trim();
        
        if (!name) {
            nameInput?.focus();
            return;
        }
        
        // Check for duplicate names
        const existingPod = window.BulletNoteApp.pods.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (existingPod) {
            alert('A pod with that name already exists');
            nameInput?.focus();
            return;
        }
        
        const newPod = window.PodManager.createPod(name, description, this.selectedColor);
        window.BulletNoteApp.pods.push(newPod);
        
        window.BulletNoteApp.render();
        window.BulletNoteApp.saveData();
        window.ModalSystem.hide();
        
        AppUtils.log(`Created pod: ${name}`);
    }
};

// About modal
window.AboutModal = {
    show() {
        const content = `
            <div class="space-y-6 text-gray-300">
                <div class="text-center">
                    <h2 class="text-2xl font-bold text-white mb-2">Bullet Note Taking App</h2>
                    <p class="text-gray-400">A minimalist note organization system</p>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-2">Features</h3>
                        <ul class="list-disc list-inside space-y-1 text-sm">
                            <li>5-card rotating note system</li>
                            <li>Pod organization for archiving</li>
                            <li>30-day trash retention</li>
                            <li>Multiple export formats (TXT, HTML, PDF)</li>
                            <li>Local data storage</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-2">How to Use</h3>
                        <ul class="list-disc list-inside space-y-1 text-sm">
                            <li><strong>Notes:</strong> Click cards to edit, use arrows to navigate</li>
                            <li><strong>Pods:</strong> Archive notes into organized collections</li>
                            <li><strong>Trash:</strong> Deleted items auto-delete after 30 days</li>
                            <li><strong>Export:</strong> Save notes as TXT, HTML blog, or PDF</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-semibold text-white mb-2">Keyboard Shortcuts</h3>
                        <ul class="list-disc list-inside space-y-1 text-sm">
                            <li><strong>Enter:</strong> Add new note</li>
                            <li><strong>Escape:</strong> Clear input / Close modal</li>
                            <li><strong>Arrow keys:</strong> Navigate cards in edit mode</li>
                        </ul>
                    </div>
                </div>
                
                <div class="pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
                    <p>© 2025 Bullet Note App • Built with ❤️ for productivity</p>
                    <p class="mt-2">
                        <a href="#" onclick="window.AboutModal.showLicense()" class="text-blue-400 hover:text-blue-300">
                            View License
                        </a>
                    </p>
                </div>
                
                <div class="flex justify-center">
                    <button onclick="window.ModalSystem.hide()" 
                            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        window.ModalSystem.show(content, { title: '', size: 'lg' });
    },
    
    showLicense() {
        const content = `
            <div class="space-y-4 text-gray-300">
                <h3 class="text-lg font-semibold text-white">MIT License</h3>
                <div class="bg-gray-700 p-4 rounded-lg text-xs font-mono leading-relaxed">
                    <p>Copyright (c) 2025 Bullet Note App</p><br>
                    <p>Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:</p><br>
                    <p>The above copyright notice and this permission notice shall be included in all
                    copies or substantial portions of the Software.</p><br>
                    <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                    SOFTWARE.</p>
                </div>
                
                <div class="flex justify-center">
                    <button onclick="window.AboutModal.show()" 
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Back
                    </button>
                </div>
            </div>
        `;
        
        window.ModalSystem.show(content, { title: 'License', size: 'lg' });
    }
};