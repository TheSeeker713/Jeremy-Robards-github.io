// Card rendering and animation system
window.CardRenderer = {
    createCard(note, isMain = true) {
        const cardContent = note.contents[note.currentCard] || '';
        const isEmpty = !cardContent.trim();
        
        const card = document.createElement('div');
        card.className = `card absolute inset-0 ${isMain ? 'bg-amber-100 border-2 border-amber-200' : 'bg-amber-50 border border-amber-200'} rounded-lg shadow-lg p-4 cursor-pointer`;
        card.style.transform = `rotate(${note.rotation}deg)`;
        card.style.transformOrigin = 'center center';
        card.style.zIndex = isMain ? '10' : '5';
        
        if (isMain) {
            card.onclick = () => window.NotesRenderer.handleCardClick(note.id);
        }
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs text-amber-600 font-medium">Card ${note.currentCard + 1}/5</span>
                ${isMain ? `
                    <div class="flex gap-1">
                        <button onclick="event.stopPropagation(); window.CardControls.previousCard('${note.id}')"
                                class="text-amber-600 hover:text-amber-800 transition-colors"
                                title="Previous card">
                            <i class="fas fa-chevron-left text-xs"></i>
                        </button>
                        <button onclick="event.stopPropagation(); window.CardControls.nextCard('${note.id}')"
                                class="text-amber-600 hover:text-amber-800 transition-colors"
                                title="Next card">
                            <i class="fas fa-chevron-right text-xs"></i>
                        </button>
                        <button onclick="event.stopPropagation(); window.NotesRenderer.deleteNote('${note.id}')"
                                class="text-red-400 hover:text-red-600 transition-colors"
                                title="Delete note">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
            
            <div class="text-sm text-gray-700 leading-relaxed ${isEmpty ? 'text-gray-400 italic' : ''}">
                ${isEmpty ? 'Empty card - click to edit' : this.formatContent(cardContent)}
            </div>
            
            ${isMain ? `
                <div class="absolute bottom-2 left-4 right-4 flex justify-between items-center text-xs text-amber-600">
                    <span>${AppUtils.formatTimestamp(note.createdAt)}</span>
                    <div class="flex gap-1">
                        ${this.renderCardDots(note)}
                    </div>
                </div>
            ` : ''}
        `;
        
        return card;
    },

    formatContent(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-amber-200 px-1 rounded text-xs">$1</code>');
    },

    renderCardDots(note) {
        let dots = '';
        for (let i = 0; i < 5; i++) {
            const hasContent = note.contents[i] && note.contents[i].trim();
            const isCurrent = i === note.currentCard;
            
            dots += `
                <button onclick="event.stopPropagation(); window.CardControls.goToCard('${note.id}', ${i})"
                        class="w-2 h-2 rounded-full transition-all duration-200 ${
                            isCurrent 
                                ? 'bg-amber-600' 
                                : hasContent 
                                    ? 'bg-amber-400 hover:bg-amber-600' 
                                    : 'bg-amber-200 hover:bg-amber-400'
                        }"
                        title="Card ${i + 1}${hasContent ? ' (has content)' : ''}">
                </button>
            `;
        }
        return dots;
    },

    animateCardFlip(noteId, direction = 'next') {
        const noteContainer = document.querySelector(`[data-note-id="${noteId}"]`);
        if (!noteContainer) return;
        
        const mainCard = noteContainer.querySelector('.card:last-child');
        if (!mainCard) return;
        
        // Add flip animation class
        mainCard.classList.add('card-flip');
        
        setTimeout(() => {
            // Update content after half the animation
            window.BulletNoteApp.render();
        }, 150);
        
        setTimeout(() => {
            mainCard.classList.remove('card-flip');
        }, 300);
    },

    animateCardShuffle(noteId) {
        const noteContainer = document.querySelector(`[data-note-id="${noteId}"]`);
        if (!noteContainer) return;
        
        const cards = noteContainer.querySelectorAll('.card');
        
        cards.forEach((card, index) => {
            card.style.transition = 'transform 0.5s ease-in-out';
            card.style.transform += ' scale(1.05)';
            
            setTimeout(() => {
                card.style.transform = card.style.transform.replace(' scale(1.05)', '');
            }, 250 + (index * 50));
        });
    },

    createStackedCards(note, maxCards = 5) {
        const container = document.createElement('div');
        container.className = 'relative w-80 h-48 mx-auto';
        
        // Background cards
        for (let i = maxCards - 1; i > 0; i--) {
            const cardIndex = (note.currentCard + i) % 5;
            const hasContent = note.contents[cardIndex] && note.contents[cardIndex].trim();
            
            if (hasContent || i === 1) { // Always show at least one background card
                const bgCard = document.createElement('div');
                bgCard.className = 'card absolute inset-0 bg-amber-50 rounded-lg shadow-md border border-amber-200';
                bgCard.style.transform = `rotate(${note.rotation + (i * 2)}deg)`;
                bgCard.style.transformOrigin = 'center center';
                bgCard.style.zIndex = maxCards - i;
                bgCard.style.opacity = Math.max(0.2, 1 - (i * 0.15));
                
                container.appendChild(bgCard);
            }
        }
        
        // Main card
        const mainCard = this.createCard(note, true);
        container.appendChild(mainCard);
        
        return container;
    },

    updateCardPosition(noteId, rotation, currentCard) {
        const noteContainer = document.querySelector(`[data-note-id="${noteId}"]`);
        if (!noteContainer) return;
        
        const mainCard = noteContainer.querySelector('.card:last-child');
        if (mainCard) {
            mainCard.style.transform = `rotate(${rotation}deg)`;
        }
        
        // Update background cards
        const bgCards = noteContainer.querySelectorAll('.card:not(:last-child)');
        bgCards.forEach((card, index) => {
            card.style.transform = `rotate(${rotation + ((index + 1) * 2)}deg)`;
        });
    }
};

// Card animation effects
window.CardAnimations = {
    flipIn(element, direction = 'right') {
        element.style.transform += ` rotateY(${direction === 'right' ? '180' : '-180'}deg)`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
            element.style.transform = element.style.transform.replace(/rotateY\([^)]+\)/, '');
            element.style.opacity = '1';
        }, 50);
    },

    slideIn(element, direction = 'right') {
        const distance = direction === 'right' ? '100px' : '-100px';
        element.style.transform += ` translateX(${distance})`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            element.style.transform = element.style.transform.replace(/translateX\([^)]+\)/, '');
            element.style.opacity = '1';
        }, 50);
    },

    bounce(element) {
        element.style.transition = 'transform 0.3s ease-out';
        element.style.transform += ' scale(1.1)';
        
        setTimeout(() => {
            element.style.transform = element.style.transform.replace(' scale(1.1)', '');
        }, 300);
    },

    shake(element) {
        element.classList.add('card-shake');
        setTimeout(() => {
            element.classList.remove('card-shake');
        }, 500);
    },

    pulse(element) {
        element.classList.add('card-pulse');
        setTimeout(() => {
            element.classList.remove('card-pulse');
        }, 1000);
    }
};

// Card interaction handlers
window.CardInteractions = {
    handleSwipe(noteId, direction) {
        if (direction === 'left') {
            window.CardControls.nextCard(noteId);
        } else if (direction === 'right') {
            window.CardControls.previousCard(noteId);
        }
    },

    handleKeyNavigation(noteId, key) {
        switch (key) {
            case 'ArrowLeft':
                window.CardControls.previousCard(noteId);
                break;
            case 'ArrowRight':
                window.CardControls.nextCard(noteId);
                break;
            case 'Enter':
            case ' ':
                window.NotesRenderer.handleCardClick(noteId);
                break;
        }
    },

    setupSwipeHandlers(element, noteId) {
        let startX = 0;
        let startY = 0;
        
        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        element.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Only trigger if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                this.handleSwipe(noteId, deltaX > 0 ? 'right' : 'left');
            }
        });
    }
};