const Database = require('./Database');

class Settings {
    constructor() {
        this.db = new Database();
    }

    async get(key) {
        await this.db.connect();
        try {
            const result = await this.db.get('SELECT value FROM settings WHERE key = ?', [key]);
            return result ? result.value : null;
        } finally {
            await this.db.close();
        }
    }

    async set(key, value) {
        await this.db.connect();
        try {
            const result = await this.db.run(
                'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
                [key, value]
            );
            return result;
        } finally {
            await this.db.close();
        }
    }

    async getAll() {
        await this.db.connect();
        try {
            const results = await this.db.all('SELECT * FROM settings ORDER BY key');
            return results;
        } finally {
            await this.db.close();
        }
    }

    async delete(key) {
        await this.db.connect();
        try {
            const result = await this.db.run('DELETE FROM settings WHERE key = ?', [key]);
            return result;
        } finally {
            await this.db.close();
        }
    }
}

module.exports = Settings;