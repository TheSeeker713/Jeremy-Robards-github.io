// Main application with lazy loading and error handling
class BulletNoteApp {
    constructor() {
        this.modules = {};
        this.isLoaded = false;
        this.currentView = 'notes';
        
        // Data
        this.notes = [];
        this.trashedNotes = [];
        this.pods = [];
        this.notesCreatedCount = 0;
        this.donationPhase = 0;
        
        // DOM elements will be initialized after DOM loads
        this.elements = {};
    }

    async initialize() {
        try {
            AppUtils.log('Initializing Bullet Note App...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize DOM elements
            this.initializeElements();
            
            // Setup error handling
            this.setupErrorHandling();
            
            // Setup debug panel
            this.setupDebugPanel();
            
            // Initialize database
            await Database.initialize();
            
            // Load data
            const data = await Database.load();
            this.loadData(data);
            
            // Load modules lazily
            await this.loadModules();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initial render
            this.render();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            AppUtils.log('App initialized successfully');
            this.isLoaded = true;
            
        } catch (error) {
            AppUtils.error('Failed to initialize app', error);
            this.showCriticalError('Failed to initialize the application. Please reload the page.');
        }
    }

    initializeElements() {
        AppUtils.updateLoadingProgress('Setting up interface...');
        
        // Get all DOM elements
        this.elements = {
            // Views
            notesView: document.getElementById('notesView'),
            podsView: document.getElementById('podsView'),
            trashView: document.getElementById('trashView'),
            helpView: document.getElementById('helpView'),
            
            // Navigation
            notesViewBtn: document.getElementById('notesViewBtn'),
            podsViewBtn: document.getElementById('podsViewBtn'),
            trashViewBtn: document.getElementById('trashViewBtn'),
            helpViewBtn: document.getElementById('helpViewBtn'),
            
            // Lists
            notesList: document.getElementById('notesList'),
            podsGrid: document.getElementById('podsGrid'),
            trashList: document.getElementById('trashList'),
            
            // Controls
            addNoteBtn: document.getElementById('addNoteBtn'),
            sortNotesBy: document.getElementById('sortNotesBy'),
            archiveToPodBtn: document.getElementById('archiveToPodBtn'),
            newPodBtn: document.getElementById('newPodBtn'),
            emptyTrashBtn: document.getElementById('emptyTrashBtn'),
            
            // Counters
            podsCount: document.getElementById('podsCount'),
            trashCount: document.getElementById('trashCount'),
            
            // Export/Import
            noteNameInput: document.getElementById('noteNameInput'),
            fileInput: document.getElementById('fileInput'),
            importBtn: document.getElementById('importBtn'),
            clearAllBtn: document.getElementById('clearAllBtn'),
            exportBtn: document.getElementById('exportBtn'),
            
            // Buttons
            aboutBtn: document.getElementById('aboutBtn'),
            supportDevBtn: document.getElementById('supportDevBtn'),
            
            // Modals container
            modalsContainer: document.getElementById('modalsContainer'),
            
            // App container
            appContainer: document.getElementById('appContainer'),
            loadingScreen: document.getElementById('loadingScreen')
        };

        // Verify critical elements exist
        const criticalElements = ['appContainer', 'loadingScreen', 'notesList', 'addNoteBtn'];
        for (const elementId of criticalElements) {
            if (!this.elements[elementId]) {
                throw new Error(`Critical element not found: ${elementId}`);
            }
        }

        AppUtils.log('DOM elements initialized');
    }

    async loadModules() {
        AppUtils.updateLoadingProgress('Loading modules...');
        
        const moduleList = [
            { name: 'notes', src: 'js/notes.js', critical: true },
            { name: 'cards', src: 'js/cards.js', critical: true },
            { name: 'pods', src: 'js/pods.js', critical: false },
            { name: 'trash', src: 'js/trash.js', critical: false },
            { name: 'modals', src: 'js/modals.js', critical: false },
            { name: 'donation', src: 'js/donation.js', critical: false }
        ];

        // Load critical modules first
        const criticalModules = moduleList.filter(m => m.critical);
        const nonCriticalModules = moduleList.filter(m => !m.critical);

        try {
            // Load critical modules synchronously
            for (const module of criticalModules) {
                await AppUtils.loadScript(module.src, module.name);
                await AppUtils.wait(50); // Small delay for UX
            }

            // Load non-critical modules asynchronously
            const nonCriticalPromises = nonCriticalModules.map(module => 
                AppUtils.loadScript(module.src, module.name).catch(error => {
                    AppUtils.error(`Non-critical module failed to load: ${module.name}`, error);
                    return null; // Don't fail the entire app
                })
            );

            await Promise.all(nonCriticalPromises);
            AppUtils.log('All modules loaded');

        } catch (error) {
            AppUtils.error('Failed to load critical modules', error);
            throw error;
        }
    }

    loadData(data) {
        this.notes = data.notes || [];
        this.trashedNotes = data.trashedNotes || [];
        this.pods = data.pods || [];
        this.notesCreatedCount = data.donationData?.notesCreatedCount || 0;
        this.donationPhase = data.donationData?.donationPhase || 0;
        
        AppUtils.log(`Data loaded: ${this.notes.length} notes, ${this.pods.length} pods, ${this.trashedNotes.length} trash`);
    }

    async saveData() {
        try {
            await Database.save({
                notes: this.notes,
                trashedNotes: this.trashedNotes,
                pods: this.pods,
                donationData: {
                    notesCreatedCount: this.notesCreatedCount,
                    donationPhase: this.donationPhase
                }
            });
        } catch (error) {
            AppUtils.error('Failed to save data', error);
        }
    }

    setupEventListeners() {
        AppUtils.updateLoadingProgress('Setting up interactions...');
        
        // Navigation
        this.elements.notesViewBtn?.addEventListener('click', () => this.switchView('notes'));
        this.elements.podsViewBtn?.addEventListener('click', () => this.switchView('pods'));
        this.elements.trashViewBtn?.addEventListener('click', () => this.switchView('trash'));
        this.elements.helpViewBtn?.addEventListener('click', () => this.switchView('help'));
        
        // Note creation
        this.elements.addNoteBtn?.addEventListener('click', () => this.addNote());
        
        // Sorting
        this.elements.sortNotesBy?.addEventListener('change', () => this.handleSortChange());
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key returns to Notes view (unless in modal or input field)
            if (e.key === 'Escape' && !e.target.matches('input, textarea') && !window.ModalSystem.currentModal) {
                if (this.currentView !== 'notes') {
                    this.switchView('notes');
                    e.preventDefault();
                }
            }
        });
        
        // Pod management
        this.elements.newPodBtn?.addEventListener('click', () => {
            if (window.PodsRenderer) window.PodsRenderer.createNewPod();
        });
        this.elements.archiveToPodBtn?.addEventListener('click', () => {
            if (window.PodsRenderer) window.PodsRenderer.archiveNotesToPod();
        });
        
        // Trash management
        this.elements.emptyTrashBtn?.addEventListener('click', () => {
            if (window.TrashManager) window.TrashManager.showEmptyConfirm();
        });
        
        // File operations
        this.elements.exportBtn?.addEventListener('click', () => this.showExportModal());
        this.elements.importBtn?.addEventListener('click', () => this.elements.fileInput?.click());
        this.elements.fileInput?.addEventListener('change', (e) => this.importFile(e));
        this.elements.clearAllBtn?.addEventListener('click', () => this.clearAllNotes());
        
        // Help and support
        this.elements.aboutBtn?.addEventListener('click', () => {
            if (window.AboutModal) window.AboutModal.show();
        });
        this.elements.supportDevBtn?.addEventListener('click', () => {
            if (window.DonationSystem) window.DonationSystem.showSupportDeveloper();
        });
        
        // Add click outside functionality to return to Notes view
        this.setupClickOutsideHandler();
        
        AppUtils.log('Event listeners setup complete');
    }

    setupErrorHandling() {
        const reloadBtn = document.getElementById('reloadBtn');
        reloadBtn?.addEventListener('click', () => {
            location.reload();
        });
    }

    setupClickOutsideHandler() {
        // Add click outside functionality to return to Notes view when not in Notes view
        document.addEventListener('click', (e) => {
            // Only handle click outside when not in notes view
            if (this.currentView === 'notes') return;
            
            // Don't switch if there's a modal open
            if (window.ModalSystem && window.ModalSystem.currentModal) return;
            
            // Get the main app container
            const appContainer = this.elements.appContainer;
            if (!appContainer || !appContainer.contains(e.target)) return;
            
            // Define areas where clicks should NOT trigger view switch
            const preserveClickAreas = [
                // Main content area (where pods/trash/help content is)
                '#notesView, #podsView, #trashView, #helpView',
                // Top navigation menu
                'nav',
                // Input areas
                'input, textarea',
                // All buttons
                'button',
                // Modal containers
                '#modalsContainer',
                // Debug panel
                '#debugPanel'
            ];
            
            // Check if click is in any preserve area
            const shouldPreserveClick = preserveClickAreas.some(selector => {
                const element = e.target.closest(selector);
                return element !== null;
            });
            
            if (!shouldPreserveClick) {
                // Click was in empty space - return to notes view
                AppUtils.log('Click in empty space detected, returning to notes view');
                this.switchView('notes');
            }
        });
        
        AppUtils.log('Click outside handler setup complete');
    }

    setupDebugPanel() {
        const debugToggle = document.getElementById('debugToggle');
        const debugPanel = document.getElementById('debugPanel');
        const closeDebug = document.getElementById('closeDebug');

        debugToggle?.addEventListener('click', () => {
            debugPanel?.classList.toggle('hidden');
        });

        closeDebug?.addEventListener('click', () => {
            debugPanel?.classList.add('hidden');
        });

        if (!AppUtils.debug) {
            debugToggle?.style.setProperty('display', 'none');
        }
    }

    switchView(view) {
        try {
            AppUtils.log(`Switching to ${view} view from ${this.currentView}`);
            this.currentView = view;
            
            // Hide all views
            const allViews = ['notesView', 'podsView', 'trashView', 'helpView'];
            allViews.forEach(viewId => {
                const element = this.elements[viewId];
                if (element) {
                    element.classList.add('hidden');
                    AppUtils.log(`Hidden ${viewId}`);
                }
            });
            
            // Reset all button styles
            const allButtons = ['notesViewBtn', 'podsViewBtn', 'trashViewBtn', 'helpViewBtn'];
            allButtons.forEach(btnId => {
                const btn = this.elements[btnId];
                if (btn) {
                    btn.classList.remove('bg-blue-600', 'text-white');
                    btn.classList.add('text-gray-300', 'hover:bg-gray-700/50');
                }
            });
            
            // Show selected view and update button
            const viewElement = this.elements[`${view}View`];
            const btnElement = this.elements[`${view}ViewBtn`];
            
            if (viewElement) {
                viewElement.classList.remove('hidden');
                AppUtils.log(`Showed ${view}View`);
            } else {
                AppUtils.error(`View element not found: ${view}View`);
            }
            
            if (btnElement) {
                btnElement.classList.add('bg-blue-600', 'text-white');
                btnElement.classList.remove('text-gray-300', 'hover:bg-gray-700/50');
                AppUtils.log(`Updated button style for ${view}ViewBtn`);
            } else {
                AppUtils.error(`Button element not found: ${view}ViewBtn`);
            }
            
            // Trigger specific view renders
            this.renderCurrentView();
            
            AppUtils.log(`Successfully switched to ${view} view`);
        } catch (error) {
            AppUtils.error(`Failed to switch to ${view} view`, error);
        }
    }

    handleSortChange() {
        try {
            const sortBy = this.elements.sortNotesBy?.value || 'newest';
            
            switch (sortBy) {
                case 'newest':
                    this.notes.sort((a, b) => b.createdAt - a.createdAt);
                    break;
                case 'oldest':
                    this.notes.sort((a, b) => a.createdAt - b.createdAt);
                    break;
                case 'alphabetical':
                    this.notes.sort((a, b) => {
                        const aText = (a.contents[a.currentCard] || '').toLowerCase();
                        const bText = (b.contents[b.currentCard] || '').toLowerCase();
                        return aText.localeCompare(bText);
                    });
                    break;
                case 'reverse-alphabetical':
                    this.notes.sort((a, b) => {
                        const aText = (a.contents[a.currentCard] || '').toLowerCase();
                        const bText = (b.contents[b.currentCard] || '').toLowerCase();
                        return bText.localeCompare(aText);
                    });
                    break;
            }
            
            this.render();
            this.saveData();
            
            AppUtils.log(`Sorted notes by: ${sortBy}`);
            
        } catch (error) {
            AppUtils.error('Failed to sort notes', error);
        }
    }

    addNote() {
        try {
            // Create a new empty note
            const newNote = {
                id: Date.now(),
                contents: ['', '', '', '', ''], // 5 cards instead of 20
                rotation: 0,
                currentCard: 0,
                createdAt: Date.now()
            };

            this.notes.unshift(newNote); // Add to beginning for newest first
            this.notesCreatedCount++;

            this.render();
            this.saveData();

            // Scroll the newly-created note into view and highlight it briefly
            try {
                const notesList = this.elements.notesList;
                if (notesList) {
                    const selector = `[data-note-id="${newNote.id}"]`;
                    const noteEl = notesList.querySelector(selector);
                    if (noteEl) {
                        // Smooth scroll to center the item
                        try {
                            noteEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } catch (e) {
                            // ignore if not supported
                        }

                        // Add highlight class and remove after animation ends (or fallback timeout)
                        noteEl.classList.add('new-note-highlight');
                        const removeHighlight = () => noteEl.classList.remove('new-note-highlight');
                        noteEl.addEventListener('animationend', removeHighlight, { once: true });
                        // Fallback removal in case animationend doesn't fire
                        setTimeout(removeHighlight, 2500);
                    }
                }
            } catch (e) {
                AppUtils.error('Failed to scroll/highlight new note', e);
            }

            // Open the note modal for editing after a brief delay so the highlight is visible
            if (window.NoteModal) {
                // Show a brief toast so user knows a note was created
                try {
                    AppUtils.showToast('New note created — editing now', { type: 'success', duration: 2200 });
                } catch (e) {
                    AppUtils.error('Failed to show toast', e);
                }

                setTimeout(() => {
                    try {
                        window.NoteModal.show(newNote);
                    } catch (e) {
                        AppUtils.error('Failed to open NoteModal for new note', e);
                    }
                }, 220);
            }

            // Check donation popup
            if (window.DonationSystem) {
                window.DonationSystem.checkPopup(this.notesCreatedCount, this.donationPhase);
            }

            AppUtils.log('Created new note and opened for editing');

        } catch (error) {
            AppUtils.error('Failed to add note', error);
        }
    }

    render() {
        try {
            this.renderCurrentView();
            this.updateCounters();
        } catch (error) {
            AppUtils.error('Failed to render', error);
        }
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'notes':
                if (window.NotesRenderer) {
                    window.NotesRenderer.render(this.notes, this.elements.notesList);
                }
                break;
            case 'pods':
                if (window.PodsRenderer) {
                    window.PodsRenderer.render(this.pods, this.elements.podsGrid);
                }
                break;
            case 'trash':
                if (window.TrashRenderer) {
                    window.TrashRenderer.render(this.trashedNotes, this.elements.trashList);
                }
                break;
        }
    }

    updateCounters() {
        // Update pods count
        if (this.elements.podsCount) {
            if (this.pods.length > 0) {
                this.elements.podsCount.textContent = this.pods.length;
                this.elements.podsCount.classList.remove('hidden');
            } else {
                this.elements.podsCount.classList.add('hidden');
            }
        }
        
        // Update trash count
        if (this.elements.trashCount) {
            if (this.trashedNotes.length > 0) {
                this.elements.trashCount.textContent = this.trashedNotes.length;
                this.elements.trashCount.classList.remove('hidden');
            } else {
                this.elements.trashCount.classList.add('hidden');
            }
        }
        
        // Update button states
        if (this.elements.exportBtn) {
            this.elements.exportBtn.disabled = this.notes.length === 0;
        }
        if (this.elements.clearAllBtn) {
            this.elements.clearAllBtn.disabled = this.notes.length === 0;
        }
        if (this.elements.archiveToPodBtn) {
            this.elements.archiveToPodBtn.disabled = this.notes.length === 0;
        }
        if (this.elements.emptyTrashBtn) {
            this.elements.emptyTrashBtn.disabled = this.trashedNotes.length === 0;
        }
    }

    hideLoadingScreen() {
        const loadingScreen = this.elements.loadingScreen;
        const appContainer = this.elements.appContainer;
        
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
        
        if (appContainer) {
            appContainer.classList.remove('hidden');
            appContainer.classList.add('loading-fade-in');
        }
        
        AppUtils.log('Loading screen hidden, app ready');
    }

    showCriticalError(message) {
        AppUtils.showError(message);
        const loadingScreen = this.elements.loadingScreen;
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    showExportModal() {
        if (this.notes.length === 0) {
            alert('No notes to export');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 p-6 rounded-2xl border border-gray-600 max-w-md w-full mx-4">
                <h2 class="text-xl font-bold text-white mb-4">Export Notes</h2>
                <p class="text-gray-300 mb-4">Choose your export format:</p>
                
                <div class="space-y-3 mb-6">
                    <button id="exportTxt" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg transition duration-200">
                        📄 Export as Text (.txt)
                    </button>
                    <button id="exportMd" class="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-3 rounded-lg transition duration-200">
                        📝 Export as Markdown (.md)
                    </button>
                    <button id="exportHtml" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-3 rounded-lg transition duration-200">
                        🌐 Export as HTML Blog (.html)
                    </button>
                    <button id="exportPdf" class="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-3 rounded-lg transition duration-200">
                        📋 Export as PDF (.pdf)
                    </button>
                </div>
                
                <button id="cancelExport" class="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition duration-200">
                    Cancel
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('#exportTxt').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.exportAsText();
        });
        
        modal.querySelector('#exportMd').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.exportAsMarkdown();
        });
        
        modal.querySelector('#exportHtml').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.exportAsHtml();
        });
        
        modal.querySelector('#exportPdf').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.exportAsPdf();
        });
        
        modal.querySelector('#cancelExport').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    exportAsText() {
        try {
            const noteName = this.elements.noteNameInput?.value.trim() || 'bullet-notes';
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `${noteName}-${timestamp}.txt`;
            
            let content = `${noteName.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}\n`;
            content += `Exported from Bullet Note Taker on ${AppUtils.formatTimestamp(Date.now())}\n\n`;
            content += '='.repeat(60) + '\n\n';
            
            this.notes.forEach((note, index) => {
                const nonEmptyCards = note.contents
                    .map((content, cardIndex) => ({ content, cardIndex }))
                    .filter(card => card.content && card.content.trim());
                
                if (nonEmptyCards.length > 0) {
                    const noteTimestamp = AppUtils.formatTimestamp(note.createdAt);
                    content += `NOTE ${index + 1} (${noteTimestamp})\n`;
                    content += '-'.repeat(40) + '\n';
                    
                    nonEmptyCards.forEach(card => {
                        if (card.cardIndex === 0) {
                            content += `${card.content}\n\n`;
                        } else {
                            content += `[Card ${card.cardIndex + 1}]\n${card.content}\n\n`;
                        }
                    });
                    
                    content += '\n';
                }
            });
            
            this.downloadFile(content, filename, 'text/plain');
            AppUtils.log(`Exported ${this.notes.length} notes as ${filename}`);
            
        } catch (error) {
            AppUtils.error('Failed to export as text', error);
            alert('Failed to export notes as text. Please try again.');
        }
    }

    exportAsMarkdown() {
        try {
            const noteName = this.elements.noteNameInput?.value.trim() || 'bullet-notes';
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `${noteName}-${timestamp}.md`;
            
            let markdown = `# ${noteName.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}\n\n`;
            markdown += `*Exported from Bullet Note Taker on ${AppUtils.formatTimestamp(Date.now())}*\n\n`;
            
            this.notes.forEach((note, index) => {
                const nonEmptyCards = note.contents
                    .map((content, cardIndex) => ({ content, cardIndex }))
                    .filter(card => card.content && card.content.trim());
                
                if (nonEmptyCards.length > 0) {
                    const noteTimestamp = AppUtils.formatTimestamp(note.createdAt);
                    markdown += `## Note ${index + 1} *(${noteTimestamp})*\n\n`;
                    
                    nonEmptyCards.forEach(card => {
                        if (card.cardIndex === 0) {
                            markdown += `${card.content}\n\n`;
                        } else {
                            markdown += `### Card ${card.cardIndex + 1}\n${card.content}\n\n`;
                        }
                    });
                    
                    markdown += '---\n\n';
                }
            });
            
            this.downloadFile(markdown, filename, 'text/markdown');
            AppUtils.log(`Exported ${this.notes.length} notes as ${filename}`);
            
        } catch (error) {
            AppUtils.error('Failed to export as markdown', error);
            alert('Failed to export notes as markdown. Please try again.');
        }
    }

    exportAsHtml() {
        try {
            const noteName = this.elements.noteNameInput?.value.trim() || 'bullet-notes';
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `${noteName}-${timestamp}.html`;
            const title = noteName.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            
            let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Georgia', serif; 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            line-height: 1.7; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #2c3e50;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            animation: fadeInUp 1s ease-out;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        h1 { 
            color: #2c3e50; 
            border-bottom: 4px solid #3498db; 
            padding-bottom: 15px; 
            margin-bottom: 30px;
            font-size: 2.5em;
            text-align: center;
            animation: slideInLeft 1.2s ease-out 0.3s both;
        }
        h2 { 
            color: #34495e; 
            margin-top: 40px; 
            padding: 15px 0 10px 20px; 
            border-left: 6px solid #3498db; 
            background: linear-gradient(90deg, rgba(52, 152, 219, 0.1), transparent);
            border-radius: 0 10px 10px 0;
            font-size: 1.5em;
            animation: slideInRight 1s ease-out calc(var(--delay, 0) * 0.1s) both;
        }
        h3 { 
            color: #7f8c8d; 
            margin-top: 25px; 
            padding-left: 15px;
            border-left: 3px solid #95a5a6;
            font-size: 1.2em;
        }
        .note-card { 
            background: rgba(255, 255, 255, 0.8);
            padding: 25px; 
            margin: 25px 0; 
            border-radius: 15px; 
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(52, 152, 219, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: fadeInUp 0.8s ease-out calc(var(--delay, 0) * 0.15s) both;
        }
        .note-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }
        .note-meta { 
            color: #7f8c8d; 
            font-style: italic; 
            margin-bottom: 20px; 
            font-size: 0.95em;
            padding: 10px 15px;
            background: rgba(127, 140, 141, 0.1);
            border-radius: 8px;
            border-left: 4px solid #bdc3c7;
        }
        .card-content { 
            white-space: pre-wrap; 
            margin-bottom: 20px; 
            padding: 15px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 10px;
            border: 1px solid rgba(189, 195, 199, 0.3);
            font-size: 1.05em;
            line-height: 1.6;
        }
        .export-info { 
            text-align: center; 
            color: #95a5a6; 
            margin-top: 50px; 
            font-size: 0.9em; 
            border-top: 2px solid #ecf0f1; 
            padding-top: 25px;
            animation: fadeInUp 1.5s ease-out 1s both;
        }
        .header-meta {
            text-align: center;
            color: #7f8c8d;
            font-style: italic;
            margin-bottom: 40px;
            font-size: 1.1em;
            animation: slideInLeft 1.2s ease-out 0.6s both;
        }
        /* Responsive design */
        @media (max-width: 768px) {
            body { padding: 20px 15px; }
            .container { padding: 25px; border-radius: 15px; }
            h1 { font-size: 2em; }
            h2 { font-size: 1.3em; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <div class="header-meta">Exported from Bullet Note Taker on ${AppUtils.formatTimestamp(Date.now())}</div>
`;
            
            this.notes.forEach((note, index) => {
                const nonEmptyCards = note.contents
                    .map((content, cardIndex) => ({ content, cardIndex }))
                    .filter(card => card.content && card.content.trim());
                
                if (nonEmptyCards.length > 0) {
                    const noteTimestamp = AppUtils.formatTimestamp(note.createdAt);
                    html += `        <div class="note-card" style="--delay: ${index + 1};">\n`;
                    html += `            <h2 style="--delay: ${index + 1};">Note ${index + 1}</h2>\n`;
                    html += `            <div class="note-meta">${noteTimestamp}</div>\n`;
                    
                    nonEmptyCards.forEach(card => {
                        if (card.cardIndex === 0) {
                            html += `            <div class="card-content">${card.content.replace(/\n/g, '<br>')}</div>\n`;
                        } else {
                            html += `            <h3>Card ${card.cardIndex + 1}</h3>\n`;
                            html += `            <div class="card-content">${card.content.replace(/\n/g, '<br>')}</div>\n`;
                        }
                    });
                    
                    html += `        </div>\n`;
                }
            });
            
            html += `        <div class="export-info">Generated by Bullet Note Taker • ${new Date().getFullYear()}</div>
    </div>
</body>
</html>`;
            
            this.downloadFile(html, filename, 'text/html');
            AppUtils.log(`Exported ${this.notes.length} notes as ${filename}`);
            
        } catch (error) {
            AppUtils.error('Failed to export as HTML', error);
            alert('Failed to export notes as HTML. Please try again.');
        }
    }

    exportAsPdf() {
        try {
            const noteName = this.elements.noteNameInput?.value.trim() || 'bullet-notes';
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `${noteName}-${timestamp}.pdf`;
            const title = noteName.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            
            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // PDF styling constants
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - (margin * 2);
            let yPosition = margin;
            
            // Helper function to add new page if needed
            const checkPageBreak = (requiredHeight = 10) => {
                if (yPosition + requiredHeight > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                }
            };
            
            // Helper function to split long text into multiple lines
            const splitTextToFit = (text, maxWidth, fontSize) => {
                doc.setFontSize(fontSize);
                return doc.splitTextToSize(text, maxWidth);
            };
            
            // Title
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(44, 62, 80); // #2c3e50
            const titleLines = splitTextToFit(title, maxWidth, 24);
            titleLines.forEach(line => {
                checkPageBreak(12);
                doc.text(line, margin, yPosition);
                yPosition += 12;
            });
            
            // Add title underline
            doc.setDrawColor(52, 152, 219); // #3498db
            doc.setLineWidth(1);
            doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
            yPosition += 15;
            
            // Export info
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(127, 140, 141); // #7f8c8d
            doc.text(`Exported from Bullet Note Taker on ${AppUtils.formatTimestamp(Date.now())}`, margin, yPosition);
            yPosition += 20;
            
            // Process notes
            this.notes.forEach((note, noteIndex) => {
                const nonEmptyCards = note.contents
                    .map((content, cardIndex) => ({ content, cardIndex }))
                    .filter(card => card.content && card.content.trim());
                
                if (nonEmptyCards.length > 0) {
                    checkPageBreak(20);
                    
                    // Note title
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(52, 73, 94); // #34495e
                    doc.text(`Note ${noteIndex + 1}`, margin, yPosition);
                    yPosition += 10;
                    
                    // Note timestamp
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'italic');
                    doc.setTextColor(127, 140, 141); // #7f8c8d
                    const noteTimestamp = AppUtils.formatTimestamp(note.createdAt);
                    doc.text(noteTimestamp, margin, yPosition);
                    yPosition += 15;
                    
                    // Note content
                    nonEmptyCards.forEach((card, cardIndex) => {
                        if (card.content && card.content.trim()) {
                            // Card header (if not the first card)
                            if (card.cardIndex > 0) {
                                checkPageBreak(15);
                                doc.setFontSize(12);
                                doc.setFont('helvetica', 'bold');
                                doc.setTextColor(127, 140, 141); // #7f8c8d
                                doc.text(`Card ${card.cardIndex + 1}`, margin + 5, yPosition);
                                yPosition += 10;
                            }
                            
                            // Card content
                            doc.setFontSize(11);
                            doc.setFont('helvetica', 'normal');
                            doc.setTextColor(44, 62, 80); // #2c3e50
                            
                            const contentLines = splitTextToFit(card.content, maxWidth - 10, 11);
                            contentLines.forEach(line => {
                                checkPageBreak(8);
                                doc.text(line, margin + 5, yPosition);
                                yPosition += 6;
                            });
                            
                            yPosition += 5;
                        }
                    });
                    
                    // Add separator line between notes
                    if (noteIndex < this.notes.length - 1) {
                        checkPageBreak(10);
                        doc.setDrawColor(236, 240, 241); // #ecf0f1
                        doc.setLineWidth(0.5);
                        doc.line(margin, yPosition, pageWidth - margin, yPosition);
                        yPosition += 15;
                    }
                }
            });
            
            // Footer on all pages
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(149, 165, 166); // #95a5a6
                doc.text(`Generated by Bullet Note Taker • Page ${i} of ${totalPages}`, margin, pageHeight - 10);
            }
            
            // Save the PDF
            doc.save(filename);
            AppUtils.log(`Exported ${this.notes.length} notes as ${filename}`);
            
        } catch (error) {
            AppUtils.error('Failed to export as PDF', error);
            alert('Failed to export notes as PDF. Please try again. Make sure you have a stable internet connection.');
        }
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importFile(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    const lines = content.split('\n').filter(line => line.trim());
                    
                    lines.forEach(line => {
                        if (line.trim() && !line.startsWith('#') && !line.startsWith('*') && line !== '---') {
                            const newNote = {
                                id: Date.now() + Math.random(),
                                contents: [line, ...new Array(4).fill('')],
                                rotation: 0,
                                currentCard: 0,
                                createdAt: Date.now()
                            };
                            
                            this.notes.push(newNote);
                            this.notesCreatedCount++;
                        }
                    });
                    
                    this.render();
                    this.saveData();
                    
                    AppUtils.log(`Imported ${lines.length} lines from ${file.name}`);
                    alert(`Imported ${lines.length} notes successfully!`);
                    
                } catch (error) {
                    AppUtils.error('Failed to parse imported file', error);
                    alert('Failed to parse the imported file. Please check the format.');
                }
            };
            
            reader.readAsText(file);
            event.target.value = ''; // Clear the input
            
        } catch (error) {
            AppUtils.error('Failed to import file', error);
            alert('Failed to import file. Please try again.');
        }
    }

    clearAllNotes() {
        try {
            if (this.notes.length === 0) return;
            
            const confirmMessage = `Delete all ${this.notes.length} notes?\n\nThey will be moved to trash and auto-deleted after 30 days.`;
            
            if (confirm(confirmMessage)) {
                // Move all notes to trash
                this.notes.forEach(note => {
                    this.trashedNotes.push({
                        ...note,
                        deletedAt: Date.now()
                    });
                });
                
                // Clear notes
                this.notes = [];
                
                this.render();
                this.saveData();
                
                AppUtils.log(`Moved ${this.trashedNotes.length} notes to trash`);
            }
            
        } catch (error) {
            AppUtils.error('Failed to clear all notes', error);
        }
    }
}

// Initialize app when DOM is ready
const app = new BulletNoteApp();

// Start initialization immediately
app.initialize().catch(error => {
    console.error('Critical app initialization failure:', error);
    AppUtils.showError('Critical error during startup. Please reload the page.');
});

// Export for global access
window.BulletNoteApp = app;