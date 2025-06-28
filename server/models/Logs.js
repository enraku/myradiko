const Database = require('./Database');

class Logs {
    constructor() {
        this.db = new Database();
    }

    async create(level, category, message, details = null) {
        await this.db.connect();
        try {
            const result = await this.db.run(
                'INSERT INTO logs (level, category, message, details) VALUES (?, ?, ?, ?)',
                [level, category, message, details]
            );
            return result;
        } finally {
            await this.db.close();
        }
    }

    async info(category, message, details = null) {
        return this.create('info', category, message, details);
    }

    async warning(category, message, details = null) {
        return this.create('warning', category, message, details);
    }

    async error(category, message, details = null) {
        return this.create('error', category, message, details);
    }

    async getAll(limit = 1000) {
        await this.db.connect();
        try {
            const results = await this.db.all(
                'SELECT * FROM logs ORDER BY created_at DESC LIMIT ?',
                [limit]
            );
            return results;
        } finally {
            await this.db.close();
        }
    }

    async getByLevel(level, limit = 1000) {
        await this.db.connect();
        try {
            const results = await this.db.all(
                'SELECT * FROM logs WHERE level = ? ORDER BY created_at DESC LIMIT ?',
                [level, limit]
            );
            return results;
        } finally {
            await this.db.close();
        }
    }

    async getByCategory(category, limit = 1000) {
        await this.db.connect();
        try {
            const results = await this.db.all(
                'SELECT * FROM logs WHERE category = ? ORDER BY created_at DESC LIMIT ?',
                [category, limit]
            );
            return results;
        } finally {
            await this.db.close();
        }
    }

    async getRecent(days = 7) {
        await this.db.connect();
        try {
            const results = await this.db.all(
                `SELECT * FROM logs 
                WHERE created_at >= datetime('now', '-${days} days')
                ORDER BY created_at DESC`
            );
            return results;
        } finally {
            await this.db.close();
        }
    }

    async cleanup(retentionDays = 30) {
        await this.db.connect();
        try {
            const result = await this.db.run(
                `DELETE FROM logs WHERE created_at < datetime('now', '-${retentionDays} days')`
            );
            return result;
        } finally {
            await this.db.close();
        }
    }
}

module.exports = Logs;