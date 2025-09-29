// Database management with error handling and lazy loading
class Database {
    static DB_KEY = 'bulletNotes';
    static TRASH_DB_KEY = 'bulletNotesTrash';
    static PODS_DB_KEY = 'bulletNotesPods';
    static DONATION_DB_KEY = 'bulletNotesDonation';

    static async initialize() {
        try {
            AppUtils.updateLoadingProgress('Loading database...');
            
            // Test localStorage availability
            if (!this.isStorageAvailable()) {
                throw new Error('LocalStorage is not available');
            }

            await AppUtils.wait(100); // Simulate loading for UX
            AppUtils.log('Database initialized successfully');
            return true;
        } catch (error) {
            AppUtils.error('Failed to initialize database', error);
            throw error;
        }
    }

    static isStorageAvailable() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    static async save(data) {
        try {
            const { notes, trashedNotes, pods, donationData } = data;
            
            if (notes) {
                localStorage.setItem(this.DB_KEY, JSON.stringify(notes));
                AppUtils.log(`Saved ${notes.length} notes`);
            }
            
            if (trashedNotes) {
                localStorage.setItem(this.TRASH_DB_KEY, JSON.stringify(trashedNotes));
                AppUtils.log(`Saved ${trashedNotes.length} trashed notes`);
            }
            
            if (pods) {
                localStorage.setItem(this.PODS_DB_KEY, JSON.stringify(pods));
                AppUtils.log(`Saved ${pods.length} pods`);
            }
            
            if (donationData) {
                localStorage.setItem(this.DONATION_DB_KEY, JSON.stringify(donationData));
                AppUtils.log('Saved donation data');
            }

            return true;
        } catch (error) {
            AppUtils.error('Failed to save to database', error);
            throw error;
        }
    }

    static async load() {
        try {
            AppUtils.updateLoadingProgress('Loading your data...');
            
            const data = {
                notes: [],
                trashedNotes: [],
                pods: [],
                donationData: { notesCreatedCount: 0, donationPhase: 0 }
            };

            // Load notes
            const savedNotes = localStorage.getItem(this.DB_KEY);
            if (savedNotes) {
                data.notes = JSON.parse(savedNotes);
                // Ensure proper structure
                data.notes.forEach(note => {
                    if (!note.contents) note.contents = [];
                    if (!note.rotation) note.rotation = 0;
                    if (!note.currentCard) note.currentCard = 0;
                    if (!note.createdAt) note.createdAt = note.id || Date.now();
                    
                    // Ensure we have at least 5 content slots
                    while (note.contents.length < 5) {
                        note.contents.push('');
                    }
                });
                AppUtils.log(`Loaded ${data.notes.length} notes`);
            }

            // Load trashed notes
            const savedTrash = localStorage.getItem(this.TRASH_DB_KEY);
            if (savedTrash) {
                data.trashedNotes = JSON.parse(savedTrash);
                // Clean up expired notes (older than 30 days)
                const now = Date.now();
                const beforeCleanup = data.trashedNotes.length;
                data.trashedNotes = data.trashedNotes.filter(note => {
                    const daysSinceDeleted = (now - note.deletedAt) / (1000 * 60 * 60 * 24);
                    return daysSinceDeleted < 30;
                });
                const afterCleanup = data.trashedNotes.length;
                if (beforeCleanup > afterCleanup) {
                    AppUtils.log(`Cleaned up ${beforeCleanup - afterCleanup} expired trashed notes`);
                }
                AppUtils.log(`Loaded ${data.trashedNotes.length} trashed notes`);
            }

            // Load pods
            const savedPods = localStorage.getItem(this.PODS_DB_KEY);
            if (savedPods) {
                data.pods = JSON.parse(savedPods);
                AppUtils.log(`Loaded ${data.pods.length} pods`);
            }

            // Load donation tracking
            const savedDonation = localStorage.getItem(this.DONATION_DB_KEY);
            if (savedDonation) {
                data.donationData = JSON.parse(savedDonation);
                AppUtils.log(`Loaded donation data: ${data.donationData.notesCreatedCount} notes created`);
            }

            await AppUtils.wait(200); // Simulate loading for better UX
            return data;
        } catch (error) {
            AppUtils.error('Failed to load from database', error);
            // Return empty data structure instead of failing completely
            return {
                notes: [],
                trashedNotes: [],
                pods: [],
                donationData: { notesCreatedCount: 0, donationPhase: 0 }
            };
        }
    }

    static async backup() {
        try {
            const data = await this.load();
            const backup = {
                timestamp: Date.now(),
                version: '1.0.0',
                data: data
            };
            
            const backupString = JSON.stringify(backup, null, 2);
            const filename = `bullet-note-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            AppUtils.downloadFile(backupString, filename, 'application/json');
            AppUtils.log('Backup created successfully');
            return true;
        } catch (error) {
            AppUtils.error('Failed to create backup', error);
            throw error;
        }
    }

    static async restore(backupData) {
        try {
            if (!backupData.data) {
                throw new Error('Invalid backup format');
            }

            const { notes, trashedNotes, pods, donationData } = backupData.data;
            await this.save({ notes, trashedNotes, pods, donationData });
            
            AppUtils.log('Backup restored successfully');
            return true;
        } catch (error) {
            AppUtils.error('Failed to restore backup', error);
            throw error;
        }
    }

    static async clear() {
        try {
            localStorage.removeItem(this.DB_KEY);
            localStorage.removeItem(this.TRASH_DB_KEY);
            localStorage.removeItem(this.PODS_DB_KEY);
            localStorage.removeItem(this.DONATION_DB_KEY);
            
            AppUtils.log('Database cleared');
            return true;
        } catch (error) {
            AppUtils.error('Failed to clear database', error);
            throw error;
        }
    }

    static getStorageInfo() {
        try {
            const used = JSON.stringify(localStorage).length;
            const quota = 5 * 1024 * 1024; // 5MB typical localStorage limit
            const percentage = ((used / quota) * 100).toFixed(2);
            
            return {
                used: used,
                quota: quota,
                percentage: percentage,
                remaining: quota - used
            };
        } catch (error) {
            AppUtils.error('Failed to get storage info', error);
            return null;
        }
    }
}

// Export for global use
window.Database = Database;