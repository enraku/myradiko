const Database = require('./Database');

class RecordingHistory {
    constructor() {
        this.db = new Database();
    }

    async create(recording) {
        await this.db.connect();
        try {
            const result = await this.db.run(
                `INSERT INTO recording_history 
                (reservation_id, title, station_id, station_name, start_time, end_time, file_path, file_size, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    recording.reservation_id || null,
                    recording.title,
                    recording.station_id,
                    recording.station_name,
                    recording.start_time,
                    recording.end_time,
                    recording.file_path,
                    recording.file_size || null,
                    recording.status || 'recording'
                ]
            );
            return result;
        } finally {
            await this.db.close();
        }
    }

    async getById(id) {
        await this.db.connect();
        try {
            const result = await this.db.get('SELECT * FROM recording_history WHERE id = ?', [id]);
            return result;
        } finally {
            await this.db.close();
        }
    }

    async getAll(limit = 100) {
        await this.db.connect();
        try {
            const results = await this.db.all(
                'SELECT * FROM recording_history ORDER BY created_at DESC LIMIT ?',
                [limit]
            );
            return results;
        } finally {
            await this.db.close();
        }
    }

    async getByStatus(status) {
        await this.db.connect();
        try {
            const results = await this.db.all(
                'SELECT * FROM recording_history WHERE status = ? ORDER BY created_at DESC',
                [status]
            );
            return results;
        } finally {
            await this.db.close();
        }
    }

    async updateStatus(id, status, errorMessage = null) {
        await this.db.connect();
        try {
            const result = await this.db.run(
                'UPDATE recording_history SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [status, errorMessage, id]
            );
            return result;
        } finally {
            await this.db.close();
        }
    }

    async updateFileInfo(id, filePath, fileSize) {
        await this.db.connect();
        try {
            const result = await this.db.run(
                'UPDATE recording_history SET file_path = ?, file_size = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [filePath, fileSize, id]
            );
            return result;
        } finally {
            await this.db.close();
        }
    }

    async delete(id) {
        await this.db.connect();
        try {
            const result = await this.db.run('DELETE FROM recording_history WHERE id = ?', [id]);
            return result;
        } finally {
            await this.db.close();
        }
    }

    async getRecent(days = 7) {
        await this.db.connect();
        try {
            const results = await this.db.all(
                `SELECT * FROM recording_history 
                WHERE created_at >= datetime('now', '-${days} days')
                ORDER BY created_at DESC`
            );
            return results;
        } finally {
            await this.db.close();
        }
    }
}

module.exports = RecordingHistory;