// Note management and rendering functionality with mobile optimization// Note management and rendering functionality// Note management and rendering functionality// Note management and rendering functionality

window.NotesRenderer = {

    render(notes, container) {window.NotesRenderer = {

        try {

            if (!container) return;    render(notes, container) {window.NotesRenderer = {window.NotesRenderer = {

            

            if (notes.length === 0) {        try {

                container.innerHTML = `

                    <div class="text-center py-8 sm:py-12 text-gray-400">            if (!container) return;    render(notes, container) {    render(notes, container) {

                        <i class="fas fa-sticky-note text-4xl sm:text-6xl mb-4 opacity-50"></i>

                        <p class="text-base sm:text-lg">No notes yet</p>            

                        <p class="text-xs sm:text-sm">Create your first note to get started</p>

                    </div>            if (notes.length === 0) {        try {        try {

                `;

                return;                container.innerHTML = `

            }

                                <div class="text-center py-8 sm:py-12 text-gray-400">            if (!container) return;            if (!container) return;

            container.innerHTML = notes.map(note => this.renderNote(note)).join('');

                                    <i class="fas fa-sticky-note text-4xl sm:text-6xl mb-4 opacity-50"></i>

        } catch (error) {

            AppUtils.error('Failed to render notes', error);                        <p class="text-base sm:text-lg">No notes yet</p>                        

            container.innerHTML = '<div class="text-red-500 p-4">Error rendering notes</div>';

        }                        <p class="text-xs sm:text-sm">Create your first note to get started</p>

    },

                    </div>            if (notes.length === 0) {            if (notes.length === 0) {

    renderNote(note) {

        const cardContent = note.contents[note.currentCard] || '';                `;

        const isEmpty = !cardContent.trim();

        const hasMultipleCards = note.contents.some((content, index) => index !== note.currentCard && content.trim());                return;                this.renderEmptyState(container);                this.renderEmptyState(container);

        

        return `            }

            <li class="note-item flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl border border-slate-600/50 backdrop-blur-sm hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-300 shadow-lg"

                data-note-id="${note.id}">                            return;                return;

                

                <div class="flex items-center space-x-3 sm:space-x-4 flex-1">            container.innerHTML = notes.map(note => this.renderNote(note)).join('');

                    <div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md flex-shrink-0 ring-2 ring-cyan-300/20"></div>

                                            }            }

                    <div class="flex-1 cursor-pointer" onclick="window.NotesRenderer.handleCardClick('${note.id}')">

                        <div class="text-white font-medium leading-relaxed text-sm sm:text-base ${isEmpty ? 'text-gray-400 italic' : ''}">        } catch (error) {

                            ${isEmpty ? 'Empty note - click to edit' : this.formatNoteContent(cardContent)}

                        </div>            AppUtils.error('Failed to render notes', error);                        

                        ${hasMultipleCards ? `

                            <div class="text-xs text-cyan-300 mt-1 flex items-center gap-1">            container.innerHTML = '<div class="text-red-500 p-4">Error rendering notes</div>';

                                <i class="fas fa-layer-group"></i>

                                <span class="hidden sm:inline">Card ${note.currentCard + 1}/5 • Multiple cards • ${AppUtils.formatTimestamp(note.createdAt)}</span>        }            // Use DocumentFragment for better performance            // Use DocumentFragment for better performance

                                <span class="sm:hidden">Card ${note.currentCard + 1}/5</span>

                            </div>    },

                        ` : `

                            <div class="text-xs text-slate-400 mt-1">            const fragment = document.createDocumentFragment();            const fragment = document.createDocumentFragment();

                                <span class="hidden sm:inline">${AppUtils.formatTimestamp(note.createdAt)}</span>

                                <span class="sm:hidden">${AppUtils.formatTimestamp(note.createdAt, true)}</span>    renderNote(note) {

                            </div>

                        `}        const cardContent = note.contents[note.currentCard] || '';            notes.forEach(note => {            notes.forEach(note => {

                    </div>

                </div>        const isEmpty = !cardContent.trim();

                

                <div class="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">        const hasMultipleCards = note.contents.some((content, index) => index !== note.currentCard && content.trim());                const noteElement = this.createNoteElement(note);                const noteElement = this.createNoteElement(note);

                    ${hasMultipleCards ? `

                        <button onclick="event.stopPropagation(); window.CardControls.previousCard('${note.id}')"        

                                class="text-cyan-400 hover:text-cyan-300 transition-colors p-1 sm:p-2 rounded-lg hover:bg-slate-700/50 min-h-[40px] min-w-[40px]"

                                title="Previous card">        return `                fragment.appendChild(noteElement);                fragment.appendChild(noteElement);

                            <i class="fas fa-chevron-left text-xs sm:text-sm"></i>

                        </button>            <li class="note-item flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl border border-slate-600/50 backdrop-blur-sm hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-300 shadow-lg"

                        <button onclick="event.stopPropagation(); window.CardControls.nextCard('${note.id}')"

                                class="text-cyan-400 hover:text-cyan-300 transition-colors p-1 sm:p-2 rounded-lg hover:bg-slate-700/50 min-h-[40px] min-w-[40px]"                data-note-id="${note.id}">            });            });

                                title="Next card">

                            <i class="fas fa-chevron-right text-xs sm:text-sm"></i>                

                        </button>

                    ` : ''}                <div class="flex items-center space-x-3 sm:space-x-4 flex-1">                        

                    <button onclick="event.stopPropagation(); window.NotesRenderer.deleteNote('${note.id}')"

                            class="text-red-400 hover:text-red-300 transition-colors p-1 sm:p-2 rounded-lg hover:bg-slate-700/50 min-h-[40px] min-w-[40px]"                    <div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md flex-shrink-0 ring-2 ring-cyan-300/20"></div>

                            title="Delete note">

                        <i class="fas fa-trash text-xs sm:text-sm"></i>                                // Clear and append in one operation            // Clear and append in one operation

                    </button>

                </div>                    <div class="flex-1 cursor-pointer" onclick="window.NotesRenderer.handleCardClick('${note.id}')">

            </li>

        `;                        <div class="text-white font-medium leading-relaxed text-sm sm:text-base ${isEmpty ? 'text-gray-400 italic' : ''}">            container.innerHTML = '';            container.innerHTML = '';

    },

                            ${isEmpty ? 'Empty note - click to edit' : this.formatNoteContent(cardContent)}

    formatNoteContent(content) {

        const maxLength = window.innerWidth < 640 ? 50 : 100;                        </div>            container.appendChild(fragment);            container.appendChild(fragment);

        const escaped = AppUtils.escapeHtml(content);

        if (escaped.length > maxLength) {                        ${hasMultipleCards ? `

            return escaped.substring(0, maxLength) + '...';

        }                            <div class="text-xs text-cyan-300 mt-1 flex items-center gap-1">                        

        return escaped;

    },                                <i class="fas fa-layer-group"></i>



    handleCardClick(noteId) {                                <span class="hidden sm:inline">Card ${note.currentCard + 1}/5 • Multiple cards • ${AppUtils.formatTimestamp(note.createdAt)}</span>        } catch (error) {        } catch (error) {

        try {

            const note = app.notes.find(n => n.id === noteId);                                <span class="sm:hidden">Card ${note.currentCard + 1}/5</span>

            if (!note) {

                AppUtils.error('Note not found');                            </div>            AppUtils.error('Failed to render notes', error);            AppUtils.error('Failed to render notes', error);

                return;

            }                        ` : `



            const currentContent = note.contents[note.currentCard] || '';                            <div class="text-xs text-slate-400 mt-1">            container.innerHTML = '<div class="text-red-500 p-4">Error rendering notes</div>';            container.innerHTML = '<div class="text-red-500 p-4">Error rendering notes</div>';

            

            window.ModalsManager.showEditModal({                                <span class="hidden sm:inline">${AppUtils.formatTimestamp(note.createdAt)}</span>

                title: `Edit Note - Card ${note.currentCard + 1}/5`,

                content: currentContent,                                <span class="sm:hidden">${AppUtils.formatTimestamp(note.createdAt, true)}</span>        }        }

                onSave: (newContent) => {

                    note.contents[note.currentCard] = newContent.trim();                            </div>

                    note.updatedAt = Date.now();

                                            `}    },    },

                    app.render();

                    app.saveData();                    </div>

                    

                    AppUtils.showToast('Note updated successfully', 'success');                </div>

                },

                onCancel: () => {}                

            });

        } catch (error) {                <div class="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">    renderEmptyState(container) {    renderEmptyState(container) {

            AppUtils.error('Failed to edit note', error);

        }                    ${hasMultipleCards ? `

    },

                        <button onclick="event.stopPropagation(); window.CardControls.previousCard('${note.id}')"        container.innerHTML = `        container.innerHTML = `

    deleteNote(noteId) {

        try {                                class="text-cyan-400 hover:text-cyan-300 transition-colors p-1 sm:p-2 rounded-lg hover:bg-slate-700/50 min-h-[40px] min-w-[40px]"

            const noteIndex = app.notes.findIndex(n => n.id === noteId);

            if (noteIndex === -1) {                                title="Previous card">            <div class="text-center py-8 sm:py-12 text-gray-400">            <div class="text-center py-8 sm:py-12 text-gray-400">

                AppUtils.error('Note not found');

                return;                            <i class="fas fa-chevron-left text-xs sm:text-sm"></i>

            }

                        </button>                <i class="fas fa-sticky-note text-4xl sm:text-6xl mb-4 opacity-50"></i>                <i class="fas fa-sticky-note text-4xl sm:text-6xl mb-4 opacity-50"></i>

            const note = app.notes[noteIndex];

                                    <button onclick="event.stopPropagation(); window.CardControls.nextCard('${note.id}')"

            app.trashedNotes.push({

                ...note,                                class="text-cyan-400 hover:text-cyan-300 transition-colors p-1 sm:p-2 rounded-lg hover:bg-slate-700/50 min-h-[40px] min-w-[40px]"                <p class="text-base sm:text-lg">No notes yet</p>                <p class="text-base sm:text-lg">No notes yet</p>

                deletedAt: Date.now()

            });                                title="Next card">



            app.notes.splice(noteIndex, 1);                            <i class="fas fa-chevron-right text-xs sm:text-sm"></i>                <p class="text-xs sm:text-sm">Create your first note to get started</p>                <p class="text-xs sm:text-sm">Create your first note to get started</p>



            app.render();                        </button>

            app.saveData();

            app.updateCounters();                    ` : ''}            </div>            </div>

            

            AppUtils.showToast('Note moved to trash', 'info');                    <button onclick="event.stopPropagation(); window.NotesRenderer.deleteNote('${note.id}')"

        } catch (error) {

            AppUtils.error('Failed to delete note', error);                            class="text-red-400 hover:text-red-300 transition-colors p-1 sm:p-2 rounded-lg hover:bg-slate-700/50 min-h-[40px] min-w-[40px]"        `;        `;

        }

    }                            title="Delete note">

};

                        <i class="fas fa-trash text-xs sm:text-sm"></i>    },    },

window.CardControls = {

    nextCard(noteId) {                    </button>

        this.navigateCard(noteId, 1);

    },                </div>



    previousCard(noteId) {            </li>

        this.navigateCard(noteId, -1);

    },        `;    createNoteElement(note) {    createNoteElement(note) {



    navigateCard(noteId, direction) {    },

        try {

            const note = app.notes.find(n => n.id === noteId);        const cardContent = note.contents[note.currentCard] || '';        const cardContent = note.contents[note.currentCard] || '';

            if (!note) return;

    formatNoteContent(content) {

            const newCardIndex = note.currentCard + direction;

            if (newCardIndex >= 0 && newCardIndex < 5) {        const maxLength = window.innerWidth < 640 ? 50 : 100;        const isEmpty = !cardContent.trim();        const isEmpty = !cardContent.trim();

                note.currentCard = newCardIndex;

                note.updatedAt = Date.now();        const escaped = AppUtils.escapeHtml(content);

                

                app.render();        if (escaped.length > maxLength) {        const hasMultipleCards = note.contents.some((content, index) => index !== note.currentCard && content.trim());        const hasMultipleCards = note.contents.some((content, index) => index !== note.currentCard && content.trim());

                app.saveData();

            }            return escaped.substring(0, maxLength) + '...';

        } catch (error) {

            AppUtils.error('Failed to navigate card', error);        }                

        }

    }        return escaped;

};
    },        const li = document.createElement('li');        const li = document.createElement('li');



    handleCardClick(noteId) {        li.className = 'note-item flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl border border-slate-600/50 backdrop-blur-sm hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-300 shadow-lg';        li.className = 'note-item flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-xl border border-slate-600/50 backdrop-blur-sm hover:from-slate-700/50 hover:to-slate-600/50 transition-all duration-300 shadow-lg';

        try {

            const note = app.notes.find(n => n.id === noteId);        li.dataset.noteId = note.id;        li.dataset.noteId = note.id;

            if (!note) {

                AppUtils.error('Note not found');                

                return;

            }        li.innerHTML = `        li.innerHTML = `



            const currentContent = note.contents[note.currentCard] || '';            <div class="flex items-center space-x-3 sm:space-x-4 flex-1">            <div class="flex items-center space-x-3 sm:space-x-4 flex-1">

            

            window.ModalsManager.showEditModal({                <div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md flex-shrink-0 ring-2 ring-cyan-300/20"></div>                <!-- Bullet point with ocean theme -->

                title: `Edit Note - Card ${note.currentCard + 1}/5`,

                content: currentContent,                                <div class="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-md flex-shrink-0 ring-2 ring-cyan-300/20"></div>

                onSave: (newContent) => {

                    note.contents[note.currentCard] = newContent.trim();                <div class="flex-1 cursor-pointer" onclick="window.NotesRenderer.handleCardClick('${note.id}')">                

                    note.updatedAt = Date.now();

                                        <div class="text-white font-medium leading-relaxed text-sm sm:text-base ${isEmpty ? 'text-gray-400 italic' : ''}">                <!-- Note content -->

                    app.render();

                    app.saveData();                        ${isEmpty ? 'Empty note - click to edit' : this.formatNoteContent(cardContent)}                <div class="flex-1 cursor-pointer" onclick="window.NotesRenderer.handleCardClick('${note.id}')">

                    

                    AppUtils.showToast('Note updated successfully', 'success');                    </div>                    <div class="text-white font-medium leading-relaxed text-sm sm:text-base ${isEmpty ? 'text-gray-400 italic' : ''}">

                },

                onCancel: () => {}                    ${hasMultipleCards ? `                        ${isEmpty ? 'Empty note - click to edit' : this.formatNoteContent(cardContent)}

            });

        } catch (error) {                        <div class="text-xs text-cyan-300 mt-1 flex items-center gap-1">                    </div>

            AppUtils.error('Failed to edit note', error);

        }                            <i class="fas fa-layer-group"></i>                    ${hasMultipleCards ? `

    },

                            <span class="hidden sm:inline">Card ${note.currentCard + 1}/5 • Multiple cards • ${AppUtils.formatTimestamp(note.createdAt)}</span>                        <div class="text-xs text-cyan-300 mt-1 flex items-center gap-1">

    deleteNote(noteId) {

        try {                            <span class="sm:hidden">Card ${note.currentCard + 1}/5</span>                            <i class="fas fa-layer-group"></i>

            const noteIndex = app.notes.findIndex(n => n.id === noteId);

            if (noteIndex === -1) {                        </div>                            <span class="hidden sm:inline">Card ${note.currentCard + 1}/5 • Multiple cards • ${AppUtils.formatTimestamp(note.createdAt)}</span>

                AppUtils.error('Note not found');

                return;                    ` : `                            <span class="sm:hidden">Card ${note.currentCard + 1}/5</span>

            }

                        <div class="text-xs text-slate-400 mt-1">                        </div>

            const note = app.notes[noteIndex];

                                        <span class="hidden sm:inline">${AppUtils.formatTimestamp(note.createdAt)}</span>                    ` : `

            app.trashedNotes.push({

                ...note,                            <span class="sm:hidden">${AppUtils.formatTimestamp(note.createdAt, true)}</span>                        <div class="text-xs text-slate-400 mt-1">

                deletedAt: Date.now()

            });                        </div>                            <span class="hidden sm:inline">${AppUtils.formatTimestamp(note.createdAt)}</span>



            app.notes.splice(noteIndex, 1);                    `}                            <span class="sm:hidden">${AppUtils.formatTimestamp(note.createdAt, true)}</span>



            app.render();                </div>                        </div>

            app.saveData();

            app.updateCounters();            </div>                    `}

            

            AppUtils.showToast('Note moved to trash', 'info');                            </div>

        } catch (error) {

            AppUtils.error('Failed to delete note', error);            <div class="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">            </div>

        }

    }                ${hasMultipleCards ? `            

};

                    <button onclick="event.stopPropagation(); window.CardControls.previousCard('${note.id}')"            <!-- Controls -->

window.CardControls = {

    nextCard(noteId) {                            class="text-cyan-400 hover:text-cyan-300 transition-colors p-1 sm:p-2 rounded-lg hover:bg-slate-700/50 min-h-[44px] sm:min-h-auto min-w-[44px] sm:min-w-auto"            <div class="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">

        this.navigateCard(noteId, 1);

    },                            title="Previous card">                ${hasMultipleCards ? `



    previousCard(noteId) {                        <i class="fas fa-chevron-left text-xs sm:text-sm"></i>                    <button onclick="event.stopPropagation(); window.CardControls.previousCard('${note.id}')"

        this.navigateCard(noteId, -1);

    },                    </button>                            class="text-cyan-400 hover:text-cyan-300 transition-colors p-1 sm:p-2 rounded-lg hover:bg-slate-700/50"



    navigateCard(noteId, direction) {                    <button onclick="event.stopPropagation(); window.CardControls.nextCard('${note.id}')"                            title="Previous card">

        try {

            const note = app.notes.find(n => n.id === noteId);                            class="text-cyan-400 hover:text-cyan-300 transition-colors p-1 sm:p-2 rounded-lg hover:bg-slate-700/50 min-h-[44px] sm:min-h-auto min-w-[44px] sm:min-w-auto"                        <i class="fas fa-chevron-left text-xs sm:text-sm"></i>

            if (!note) return;

                            title="Next card">                    </button>

            const newCardIndex = note.currentCard + direction;

            if (newCardIndex >= 0 && newCardIndex < 5) {                        <i class="fas fa-chevron-right text-xs sm:text-sm"></i>                    <button onclick="event.stopPropagation(); window.CardControls.nextCard('${note.id}')"

                note.currentCard = newCardIndex;

                note.updatedAt = Date.now();                    </button>                            class="text-cyan-400 hover:text-cyan-300 transition-colors p-1 sm:p-2 rounded-lg hover:bg-slate-700/50"

                

                app.render();                ` : ''}                            title="Next card">

                app.saveData();

            }                <button onclick="event.stopPropagation(); window.NotesRenderer.deleteNote('${note.id}')"                        <i class="fas fa-chevron-right text-xs sm:text-sm"></i>

        } catch (error) {

            AppUtils.error('Failed to navigate card', error);                        class="text-red-400 hover:text-red-300 transition-colors p-1 sm:p-2 rounded-lg hover:bg-slate-700/50 min-h-[44px] sm:min-h-auto min-w-[44px] sm:min-w-auto"                    </button>

        }

    }                        title="Delete note">                ` : ''}

};
                    <i class="fas fa-trash text-xs sm:text-sm"></i>                <button onclick="event.stopPropagation(); window.NotesRenderer.deleteNote('${note.id}')"

                </button>                        class="text-red-400 hover:text-red-300 transition-colors p-1 sm:p-2 rounded-lg hover:bg-slate-700/50"

            </div>                        title="Delete note">

        `;                    <i class="fas fa-trash text-xs sm:text-sm"></i>

                        </button>

        return li;            </div>

    },        `;

        

    formatNoteContent(content) {        return li;

        const maxLength = window.innerWidth < 640 ? 50 : 100;    },

        const escaped = AppUtils.escapeHtml(content);                            </div>

        if (escaped.length > maxLength) {                        ` : `

            return escaped.substring(0, maxLength) + '...';                            <div class="text-xs text-slate-400 mt-1">

        }                                Card ${note.currentCard + 1}/5 • ${AppUtils.formatTimestamp(note.createdAt)}

        return escaped;                            </div>

    },                        `}

                    </div>

    handleCardClick(noteId) {                </div>

        try {                

            const note = app.notes.find(n => n.id === noteId);                <!-- Action buttons -->

            if (!note) {                <div class="flex items-center gap-2 ml-4">

                AppUtils.error('Note not found');                    ${hasMultipleCards ? `

                return;                        <button onclick="event.stopPropagation(); window.CardControls.previousCard('${note.id}')"

            }                                class="p-2 text-cyan-300 hover:text-cyan-100 hover:bg-slate-600/50 rounded-lg transition-all duration-200"

                                title="Previous card">

            const currentContent = note.contents[note.currentCard] || '';                            <i class="fas fa-chevron-left text-sm"></i>

                                    </button>

            window.ModalsManager.showEditModal({                        <button onclick="event.stopPropagation(); window.CardControls.nextCard('${note.id}')"

                title: `Edit Note - Card ${note.currentCard + 1}/5`,                                class="p-2 text-cyan-300 hover:text-cyan-100 hover:bg-slate-600/50 rounded-lg transition-all duration-200"

                content: currentContent,                                title="Next card">

                onSave: (newContent) => {                            <i class="fas fa-chevron-right text-sm"></i>

                    note.contents[note.currentCard] = newContent.trim();                        </button>

                    note.updatedAt = Date.now();                    ` : ''}

                                        

                    this.updateNoteInDOM(note);                    <button onclick="event.stopPropagation(); window.NotesRenderer.deleteNote('${note.id}')"

                    app.saveData();                            class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"

                                                title="Delete note">

                    AppUtils.showToast('Note updated successfully', 'success');                        <i class="fas fa-trash text-sm"></i>

                },                    </button>

                onCancel: () => {}                </div>

            });            </li>

        } catch (error) {        `;

            AppUtils.error('Failed to edit note', error);    },

        }

    },    renderNoteCards(note) {

        let cardsHtml = '';

    updateNoteInDOM(note) {        const baseRotation = note.rotation;

        const noteElement = document.querySelector(`[data-note-id="${note.id}"]`);        

        if (noteElement) {        // Render background cards

            const newElement = this.createNoteElement(note);        for (let i = 0; i < 5; i++) {

            noteElement.parentNode.replaceChild(newElement, noteElement);            const cardIndex = (note.currentCard + i + 1) % 5;

        }            const content = note.contents[cardIndex] || '';

    },            const rotation = baseRotation + (i + 1) * 2;

            const zIndex = 5 - i;

    deleteNote(noteId) {            const opacity = Math.max(0.1, 1 - (i * 0.2));

        try {            

            const noteIndex = app.notes.findIndex(n => n.id === noteId);            if (content.trim() || i === 0) { // Show at least one background card

            if (noteIndex === -1) {                cardsHtml += `

                AppUtils.error('Note not found');                    <div class="card absolute inset-0 bg-amber-50 rounded-lg shadow-md border border-amber-200"

                return;                         style="transform: rotate(${rotation}deg); transform-origin: center center; z-index: ${zIndex}; opacity: ${opacity};">

            }                    </div>

                `;

            const note = app.notes[noteIndex];            }

                    }

            app.trashedNotes.push({        

                ...note,        return cardsHtml;

                deletedAt: Date.now()    },

            });

    formatNoteContent(content) {

            app.notes.splice(noteIndex, 1);        // Simple formatting: convert line breaks and handle basic markdown-style formatting

        return content

            const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);            .replace(/\n/g, '<br>')

            if (noteElement) {            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

                noteElement.remove();            .replace(/\*(.*?)\*/g, '<em>$1</em>')

            }            .replace(/`(.*?)`/g, '<code class="bg-amber-200 px-1 rounded text-xs">$1</code>');

    },

            if (app.notes.length === 0) {

                const container = document.getElementById('notesList');    handleCardClick(noteId) {

                this.renderEmptyState(container);        try {

            }            const note = window.BulletNoteApp.notes.find(n => n.id == noteId);

            if (!note) return;

            app.saveData();            

            app.updateCounters();            if (window.NoteModal) {

                            window.NoteModal.show(note);

            AppUtils.showToast('Note moved to trash', 'info');            } else {

        } catch (error) {                // Fallback: simple prompt editing

            AppUtils.error('Failed to delete note', error);                const currentContent = note.contents[note.currentCard] || '';

        }                const newContent = prompt('Edit note:', currentContent);

    }                if (newContent !== null) {

};                    note.contents[note.currentCard] = newContent;

                    window.BulletNoteApp.render();

window.CardControls = {                    window.BulletNoteApp.saveData();

    nextCard(noteId) {                }

        this.navigateCard(noteId, 1);            }

    },        } catch (error) {

            AppUtils.error('Failed to handle card click', error);

    previousCard(noteId) {        }

        this.navigateCard(noteId, -1);    },

    },

    deleteNote(noteId) {

    navigateCard(noteId, direction) {        try {

        try {            const noteIndex = window.BulletNoteApp.notes.findIndex(n => n.id == noteId);

            const note = app.notes.find(n => n.id === noteId);            if (noteIndex === -1) return;

            if (!note) return;            

            const note = window.BulletNoteApp.notes[noteIndex];

            const newCardIndex = note.currentCard + direction;            

            if (newCardIndex >= 0 && newCardIndex < 5) {            // Move to trash

                note.currentCard = newCardIndex;            window.BulletNoteApp.trashedNotes.push({

                note.updatedAt = Date.now();                ...note,

                                deletedAt: Date.now()

                window.NotesRenderer.updateNoteInDOM(note);            });

                app.saveData();            

            }            // Remove from notes

        } catch (error) {            window.BulletNoteApp.notes.splice(noteIndex, 1);

            AppUtils.error('Failed to navigate card', error);            

        }            // Save and refresh

    }            window.BulletNoteApp.render();

};            window.BulletNoteApp.saveData();
            
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