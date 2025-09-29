// Donation system for supporting the developer
window.DonationSystem = {
    config: {
        // Donation phases trigger at these note counts
        phases: [10, 30, 100, 111, 222, 333],
        
        // URLs for different donation methods
        buyMeACoffeeUrl: 'https://www.buymeacoffee.com/yourhandle',
        koFiUrl: 'https://ko-fi.com/yourhandle',
        paypalUrl: 'https://paypal.me/yourhandle',
        githubSponsorsUrl: 'https://github.com/sponsors/yourhandle',
        
        // Messages for different phases
        messages: [
            "Great start! 10 notes created! ☕",
            "You're getting organized! 30 notes! 📝",
            "Amazing! 100 notes! OK, I'll stop now... 🚀",
            "🎉 SECRET EASTER EGG UNLOCKED! 🥚",
            "🥠 Fortune Cookie Time! 🥠",
            "🎊 INCREDIBLE! 333 NOTES! SPECIAL GIFT! �"
        ]
    },

    checkPopup(notesCreatedCount, currentPhase) {
        try {
            const nextPhase = this.getNextPhase(notesCreatedCount, currentPhase);
            
            if (nextPhase !== null && nextPhase > currentPhase) {
                // Update phase
                window.BulletNoteApp.donationPhase = nextPhase;
                window.BulletNoteApp.saveData();
                
                // Show popup after a short delay
                setTimeout(() => {
                    this.showDonationPopup(nextPhase, notesCreatedCount);
                }, 1000);
                
                AppUtils.log(`Donation popup triggered for phase ${nextPhase} at ${notesCreatedCount} notes`);
            }
            
        } catch (error) {
            AppUtils.error('Error checking donation popup', error);
        }
    },

    getNextPhase(notesCount, currentPhase) {
        for (let i = currentPhase; i < this.config.phases.length; i++) {
            if (notesCount >= this.config.phases[i]) {
                return i + 1;
            }
        }
        return null;
    },

    showDonationPopup(phase, notesCount) {
        const message = this.config.messages[phase - 1] || this.config.messages[0];
        
        // Special handling for different phases
        if (phase === 3) { // 100 notes - "OK I'll stop now"
            this.showStopNowPopup(message, notesCount);
            return;
        } else if (phase === 4) { // 111 notes - Easter egg
            this.showEasterEggPopup(notesCount);
            return;
        } else if (phase === 5) { // 222 notes - Fortune cookie
            this.showFortuneCookiePopup(notesCount);
            return;
        } else if (phase === 6) { // 333 notes - ChronicleOS gift
            this.showChronicleOSGiftPopup(notesCount);
            return;
        }
        
        // Standard donation popup for phases 1 and 2
        const content = `
            <div class="text-center space-y-6">
                <div class="text-6xl mb-4">
                    ${this.getPhaseEmoji(phase)}
                </div>
                
                <div>
                    <h3 class="text-xl font-bold text-white mb-2">${message}</h3>
                    <p class="text-gray-300">
                        You've created <strong class="text-blue-400">${notesCount}</strong> notes!
                    </p>
                </div>
                
                <div class="bg-gray-700 rounded-lg p-4">
                    <p class="text-gray-300 text-sm mb-4">
                        If this app has helped you stay organized, consider supporting its development:
                    </p>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <a href="${this.config.buyMeACoffeeUrl}" 
                           target="_blank" 
                           onclick="window.DonationSystem.trackDonation('buymeacoffee')"
                           class="flex items-center justify-center gap-2 p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm">
                            <i class="fas fa-coffee"></i>
                            Buy me a coffee
                        </a>
                        
                        <a href="${this.config.koFiUrl}" 
                           target="_blank"
                           onclick="window.DonationSystem.trackDonation('kofi')"
                           class="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                            <i class="fas fa-heart"></i>
                            Ko-fi
                        </a>
                        
                        <a href="${this.config.paypalUrl}" 
                           target="_blank"
                           onclick="window.DonationSystem.trackDonation('paypal')"
                           class="flex items-center justify-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                            <i class="fab fa-paypal"></i>
                            PayPal
                        </a>
                        
                        <a href="${this.config.githubSponsorsUrl}" 
                           target="_blank"
                           onclick="window.DonationSystem.trackDonation('github')"
                           class="flex items-center justify-center gap-2 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm">
                            <i class="fab fa-github"></i>
                            Sponsor
                        </a>
                    </div>
                </div>
                
                <div class="text-xs text-gray-400">
                    <p>This popup appears at major milestones.</p>
                    <p>Your support helps keep this app free and ad-free! 💜</p>
                </div>
                
                <div class="flex justify-center gap-3">
                    <button onclick="window.DonationSystem.remindLater()" 
                            class="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                        Remind me later
                    </button>
                    <button onclick="window.ModalSystem.hide()" 
                            class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                        Continue using
                    </button>
                </div>
            </div>
        `;
        
        window.ModalSystem.show(content, { 
            title: '', 
            size: 'md',
            backdrop: false // Make it less intrusive
        });
    },

    showStopNowPopup(message, notesCount) {
        const content = `
            <div class="text-center space-y-6">
                <div class="text-6xl mb-4">🚀</div>
                <div>
                    <h3 class="text-xl font-bold text-white mb-2">${message}</h3>
                    <p class="text-gray-300">
                        You've created <strong class="text-blue-400">${notesCount}</strong> notes!
                    </p>
                    <p class="text-lg text-yellow-300 mt-4">
                        🤐 OK, I promise I'll stop bothering you with donation popups now!
                    </p>
                </div>
                <div class="bg-gray-700 rounded-lg p-4">
                    <p class="text-gray-300 text-sm">
                        You're clearly a dedicated user. Thanks for using the app! 
                        If you ever want to support development, you know where to find us. 😊
                    </p>
                </div>
                <div class="flex justify-center">
                    <button onclick="window.ModalSystem.hide()" 
                            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Thanks! 👍
                    </button>
                </div>
            </div>
        `;
        
        window.ModalSystem.show(content, { title: '', size: 'md', backdrop: false });
    },

    showEasterEggPopup(notesCount) {
        const secrets = [
            "🔮 The real magic was the notes you made along the way",
            "🌟 Every great journey begins with a single note",
            "🦄 You've unlocked the secret path to productivity",
            "✨ Legend says productive people see this message...",
            "🎭 Behind every organized mind is a mountain of notes",
            "🗝️ You found the hidden door to organization mastery"
        ];
        const randomSecret = secrets[Math.floor(Math.random() * secrets.length)];
        
        const content = `
            <div class="text-center space-y-6">
                <div class="text-6xl mb-4">🥚✨</div>
                <div>
                    <h3 class="text-xl font-bold text-white mb-2">🎉 SECRET EASTER EGG UNLOCKED! 🥚</h3>
                    <p class="text-gray-300">
                        You've created <strong class="text-purple-400">${notesCount}</strong> notes!
                    </p>
                </div>
                
                <div class="bg-gradient-to-r from-purple-800 to-pink-800 rounded-lg p-6">
                    <div class="text-2xl mb-3">🔮</div>
                    <p class="text-white font-medium text-lg mb-2">Ancient Wisdom Revealed:</p>
                    <p class="text-purple-200 italic">${randomSecret}</p>
                </div>
                
                <div class="bg-gray-700 rounded-lg p-4">
                    <p class="text-gray-300 text-sm">
                        🌟 Congratulations on finding this hidden message! 
                        You're part of an exclusive club of super-organized humans.
                    </p>
                </div>
                
                <div class="flex justify-center">
                    <button onclick="window.ModalSystem.hide()" 
                            class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300">
                        Keep the Secret! 🤫
                    </button>
                </div>
            </div>
        `;
        
        window.ModalSystem.show(content, { title: '', size: 'md', backdrop: false });
    },

    showFortuneCookiePopup(notesCount) {
        const fortunes = [
            "A well-organized mind is the key to unlocking infinite possibilities.",
            "Your dedication to note-taking will lead to great achievements.",
            "The path to wisdom is paved with careful observations.",
            "Today's notes become tomorrow's breakthroughs.",
            "Your organized thoughts will inspire others to follow.",
            "Great minds think alike, but organized minds think ahead.",
            "The universe rewards those who document their journey.",
            "Your notes are seeds that will grow into mighty oaks of knowledge.",
            "Fortune favors the prepared mind, and yours is well-prepared.",
            "In chaos, you have found order. In order, you will find success."
        ];
        const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        
        const content = `
            <div class="text-center space-y-6">
                <div class="text-6xl mb-4">🥠</div>
                <div>
                    <h3 class="text-xl font-bold text-white mb-2">🥠 Fortune Cookie Time! 🥠</h3>
                    <p class="text-gray-300">
                        You've created <strong class="text-yellow-400">${notesCount}</strong> notes!
                    </p>
                </div>
                
                <div class="bg-gradient-to-r from-yellow-700 to-orange-700 rounded-lg p-6">
                    <div class="text-3xl mb-3">🔮</div>
                    <p class="text-white font-medium text-lg mb-2">Your Fortune:</p>
                    <p class="text-yellow-100 italic text-lg leading-relaxed">
                        "${randomFortune}"
                    </p>
                </div>
                
                <div class="bg-gray-700 rounded-lg p-4">
                    <p class="text-gray-300 text-sm">
                        🌟 Ancient wisdom for the modern note-taker. 
                        May your notes bring you prosperity and peace of mind!
                    </p>
                </div>
                
                <div class="flex justify-center">
                    <button onclick="window.ModalSystem.hide()" 
                            class="px-6 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg transition-all duration-300">
                        Thank You, Wise Cookie! 🙏
                    </button>
                </div>
            </div>
        `;
        
        window.ModalSystem.show(content, { title: '', size: 'md', backdrop: false });
    },

    showChronicleOSGiftPopup(notesCount) {
        // Generate a random special code
        const generateSpecialCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };
        
        const specialCode = generateSpecialCode();
        
        const content = `
            <div class="text-center space-y-6">
                <div class="text-6xl mb-4">🎊🎁</div>
                <div>
                    <h3 class="text-2xl font-bold text-white mb-2">🎊 INCREDIBLE! 333 NOTES! 🎊</h3>
                    <p class="text-gray-300">
                        You've created <strong class="text-green-400">${notesCount}</strong> notes!
                    </p>
                    <p class="text-xl text-yellow-300 mt-2">
                        🏆 YOU ARE A PRODUCTIVITY LEGEND! 🏆
                    </p>
                </div>
                
                <div class="bg-gradient-to-r from-green-800 to-blue-800 rounded-lg p-6">
                    <div class="text-3xl mb-3">🎁</div>
                    <h4 class="text-white font-bold text-xl mb-3">SPECIAL GIFT UNLOCKED!</h4>
                    <p class="text-green-200 mb-4">
                        As a thank you for your incredible dedication, you've unlocked a special gift from ChronicleOS.com!
                    </p>
                    
                    <div class="bg-white/10 rounded-lg p-4 mb-4">
                        <p class="text-white font-semibold mb-2">🔑 Your Special Code:</p>
                        <p class="text-2xl font-mono text-yellow-300 tracking-wider">${specialCode}</p>
                    </div>
                    
                    <div class="text-left text-green-100 text-sm space-y-2">
                        <p><strong>Instructions:</strong></p>
                        <p>1. Send an email to: <span class="text-yellow-300 font-mono">digiartifact@chroncleos.com</span></p>
                        <p>2. Subject line: <span class="text-yellow-300 font-mono">333</span></p>
                        <p>3. Include your special code: <span class="text-yellow-300 font-mono">${specialCode}</span></p>
                        <p>4. Receive your special gift! 🎁</p>
                    </div>
                </div>
                
                <div class="bg-gray-700 rounded-lg p-4">
                    <p class="text-gray-300 text-sm">
                        🌟 You've achieved something truly special! 
                        Check out www.ChronicleOS.com while you're at it!
                    </p>
                </div>
                
                <div class="flex justify-center gap-3">
                    <button onclick="navigator.clipboard?.writeText?.('${specialCode}')?.then?.(() => window.DonationSystem.showThankYouMessage('Code copied to clipboard! 📋'))" 
                            class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                        📋 Copy Code
                    </button>
                    <button onclick="window.ModalSystem.hide()" 
                            class="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300">
                        Amazing! Thank You! 🙌
                    </button>
                </div>
            </div>
        `;
        
        window.ModalSystem.show(content, { title: '', size: 'lg', backdrop: false });
    },

    getPhaseEmoji(phase) {
        const emojis = ['☕', '📝', '🚀', '🌟', '🏆'];
        return emojis[phase - 1] || '🎉';
    },

    trackDonation(platform) {
        try {
            // Store donation tracking info
            const donationData = this.loadDonationData();
            donationData.clicks = donationData.clicks || {};
            donationData.clicks[platform] = (donationData.clicks[platform] || 0) + 1;
            donationData.lastClickAt = Date.now();
            
            this.saveDonationData(donationData);
            
            AppUtils.log(`Tracked donation click: ${platform}`);
            
            // Close modal after tracking
            setTimeout(() => {
                window.ModalSystem.hide();
            }, 500);
            
        } catch (error) {
            AppUtils.error('Error tracking donation', error);
        }
    },

    remindLater() {
        try {
            const donationData = this.loadDonationData();
            donationData.remindLater = Date.now();
            this.saveDonationData(donationData);
            
            window.ModalSystem.hide();
            
            // Show a small thank you message
            this.showThankYouMessage("Thanks! I'll remind you later 😊");
            
        } catch (error) {
            AppUtils.error('Error setting remind later', error);
        }
    },

    showSupportDeveloper() {
        const stats = this.getDonationStats();
        
        const content = `
            <div class="space-y-6">
                <div class="text-center">
                    <h3 class="text-xl font-bold text-white mb-2">Support Development 💜</h3>
                    <p class="text-gray-300">
                        Help keep this app free, fast, and ad-free!
                    </p>
                </div>
                
                <div class="bg-gray-700 rounded-lg p-4">
                    <h4 class="text-white font-semibold mb-3">Your Usage Stats</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-400">${stats.totalNotes}</div>
                            <div class="text-gray-400">Notes Created</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-400">${stats.totalPods}</div>
                            <div class="text-gray-400">Pods Organized</div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="text-white font-semibold mb-3">Ways to Support</h4>
                    <div class="space-y-3">
                        <a href="${this.config.buyMeACoffeeUrl}" 
                           target="_blank"
                           onclick="window.DonationSystem.trackDonation('buymeacoffee')"
                           class="flex items-center gap-3 p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                            <i class="fas fa-coffee text-xl"></i>
                            <div>
                                <div class="font-medium">Buy me a coffee</div>
                                <div class="text-sm opacity-80">One-time support ($3-5)</div>
                            </div>
                        </a>
                        
                        <a href="${this.config.githubSponsorsUrl}" 
                           target="_blank"
                           onclick="window.DonationSystem.trackDonation('github')"
                           class="flex items-center gap-3 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors">
                            <i class="fab fa-github text-xl"></i>
                            <div>
                                <div class="font-medium">GitHub Sponsors</div>
                                <div class="text-sm opacity-80">Monthly support ($1-10/month)</div>
                            </div>
                        </a>
                        
                        <div class="flex items-center gap-3 p-3 bg-green-600 rounded-lg">
                            <i class="fas fa-share text-xl text-white"></i>
                            <div class="text-white">
                                <div class="font-medium">Share with friends</div>
                                <div class="text-sm opacity-80">Spread the word - it's free!</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-700 rounded-lg p-4 text-sm text-gray-300">
                    <h5 class="text-white font-medium mb-2">Why support?</h5>
                    <ul class="list-disc list-inside space-y-1">
                        <li>Keeps the app completely free</li>
                        <li>No ads, ever</li>
                        <li>Faster development of new features</li>
                        <li>Better support and bug fixes</li>
                        <li>You're awesome! 🎉</li>
                    </ul>
                </div>
                
                <div class="flex justify-center">
                    <button onclick="window.ModalSystem.hide()" 
                            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Continue Using
                    </button>
                </div>
            </div>
        `;
        
        window.ModalSystem.show(content, { 
            title: '', 
            size: 'md'
        });
    },

    getDonationStats() {
        return {
            totalNotes: window.BulletNoteApp?.notesCreatedCount || 0,
            totalPods: window.BulletNoteApp?.pods?.length || 0,
            totalTrashed: window.BulletNoteApp?.trashedNotes?.length || 0
        };
    },

    loadDonationData() {
        try {
            const stored = localStorage.getItem('bulletNoteApp_donationData');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            return {};
        }
    },

    saveDonationData(data) {
        try {
            localStorage.setItem('bulletNoteApp_donationData', JSON.stringify(data));
        } catch (error) {
            AppUtils.error('Failed to save donation data', error);
        }
    },

    showThankYouMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 z-50 p-4 bg-green-600 text-white rounded-lg shadow-lg transition-all duration-300';
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas fa-heart"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
        }, 3000);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3300);
    },

    // Initialize donation tracking
    init() {
        try {
            const donationData = this.loadDonationData();
            
            // Track app usage
            donationData.sessions = (donationData.sessions || 0) + 1;
            donationData.lastUsed = Date.now();
            
            if (!donationData.firstUsed) {
                donationData.firstUsed = Date.now();
            }
            
            this.saveDonationData(donationData);
            
            AppUtils.log('Donation system initialized');
            
        } catch (error) {
            AppUtils.error('Error initializing donation system', error);
        }
    }
};

// Initialize on load
window.DonationSystem.init();