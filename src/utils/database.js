export class StoryDatabase {
    constructor() {
        this.dbName = 'DicodingStoryDB';
        this.storeName = 'stories';
        this.version = 2; // Versi dinaikkan untuk migrasi schema
        this.db = null;
    }

    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    // Buat object store dengan index untuk pencarian lebih cepat
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    // Tambahkan index untuk createdAt jika perlu
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;

                // Handle versi database
                this.db.onversionchange = () => {
                    this.db.close();
                    console.log('Database is outdated, please reload the page.');
                };

                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(new Error('Gagal membuka database. Silakan coba lagi.'));
            };
        });
    }

    async saveStory(story) {
        if (!story || !story.id) {
            throw new Error('Data story tidak valid');
        }

        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, 'readwrite');

                transaction.oncomplete = () => resolve();
                transaction.onabort = (event) => {
                    console.error('Transaction aborted:', event.target.error);
                    reject(new Error('Transaksi database dibatalkan'));
                };
                transaction.onerror = (event) => {
                    console.error('Transaction error:', event.target.error);
                    reject(new Error('Gagal menyimpan story.'));
                };

                const store = transaction.objectStore(this.storeName);
                const validatedStory = this._validateStory(story);
                const request = store.put(validatedStory);

                request.onsuccess = () => {
                    console.log('Story berhasil disimpan:', validatedStory.id);
                };
                request.onerror = (event) => {
                    console.error('Error in save operation:', event.target.error);
                    reject(new Error('Gagal menyimpan data story'));
                };
            });
        } catch (error) {
            console.error('Error in saveStory:', error);
            throw new Error('Gagal menyimpan story ke database: ' + error.message);
        }
    }

    async getAllStories(options = {}) {
        const { limit, sortBy } = options;

        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, 'readonly');
                const store = transaction.objectStore(this.storeName);
                let request;

                if (sortBy === 'createdAt') {
                    const index = store.index('createdAt');
                    request = index.getAll();
                } else {
                    request = store.getAll();
                }

                request.onsuccess = () => {
                    let stories = request.result || [];

                    // Urutkan jika perlu
                    if (sortBy === 'createdAt') {
                        stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    }

                    // Limit hasil jika diperlukan
                    if (limit && limit > 0) {
                        stories = stories.slice(0, limit);
                    }

                    resolve(stories);
                };

                request.onerror = (event) => {
                    console.error('Error fetching stories:', event.target.error);
                    reject(new Error('Gagal mengambil data stories.'));
                };
            });
        } catch (error) {
            console.error('Error in getAllStories:', error);
            throw new Error('Gagal mengakses database: ' + error.message);
        }
    }

    async getStoryById(id) {
        if (!id) {
            throw new Error('ID tidak valid');
        }

        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(id);

                request.onsuccess = () => {
                    if (request.result) {
                        resolve(request.result);
                    } else {
                        reject(new Error('Story tidak ditemukan'));
                    }
                };

                request.onerror = (event) => {
                    console.error('Error fetching story:', event.target.error);
                    reject(new Error('Gagal mengambil story.'));
                };
            });
        } catch (error) {
            console.error('Error in getStoryById:', error);
            throw new Error('Gagal mengakses database: ' + error.message);
        }
    }

    async deleteStory(id) {
        if (!id) {
            throw new Error('ID tidak valid');
        }

        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, 'readwrite');
                transaction.oncomplete = () => resolve();
                transaction.onabort = (event) => {
                    console.error('Delete transaction aborted:', event.target.error);
                    reject(new Error('Transaksi penghapusan dibatalkan'));
                };
                transaction.onerror = (event) => {
                    console.error('Delete error:', event.target.error);
                    reject(new Error('Gagal menghapus story.'));
                };

                const store = transaction.objectStore(this.storeName);
                store.delete(id);
            });
        } catch (error) {
            console.error('Error in deleteStory:', error);
            throw new Error('Gagal menghapus story: ' + error.message);
        }
    }

    async clearStories() {
        try {
            const db = await this.openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, 'readwrite');
                transaction.oncomplete = () => resolve();
                transaction.onabort = (event) => {
                    console.error('Clear transaction aborted:', event.target.error);
                    reject(new Error('Transaksi clear dibatalkan'));
                };
                transaction.onerror = (event) => {
                    console.error('Clear error:', event.target.error);
                    reject(new Error('Gagal menghapus semua stories.'));
                };

                const store = transaction.objectStore(this.storeName);
                store.clear();
            });
        } catch (error) {
            console.error('Error in clearStories:', error);
            throw new Error('Gagal membersihkan database: ' + error.message);
        }
    }

    // Helper method untuk validasi data story
    _validateStory(story) {
        const requiredFields = ['id', 'name', 'description', 'photoUrl', 'createdAt'];
        const missingFields = requiredFields.filter(field => !story[field]);

        if (missingFields.length > 0) {
            console.warn('Story missing required fields:', missingFields);
            throw new Error(`Data story tidak lengkap: ${missingFields.join(', ')}`);
        }

        return {
            id: story.id,
            name: story.name.toString(),
            description: story.description.toString(),
            photoUrl: story.photoUrl.toString(),
            createdAt: story.createdAt,
            lat: story.lat ? parseFloat(story.lat) : null,
            lon: story.lon ? parseFloat(story.lon) : null,
            isOffline: Boolean(story.isOffline)
        };
    }
}