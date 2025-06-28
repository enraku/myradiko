const Database = require('./Database');

class Reservations {
    constructor() {
        this.db = new Database();
    }

    async create(reservation) {
        await this.db.connect();
        try {
            const result = await this.db.run(
                `INSERT INTO reservations 
                (title, station_id, station_name, start_time, end_time, repeat_type, repeat_days, is_active) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    reservation.title,
                    reservation.station_id,
                    reservation.station_name,
                    reservation.start_time,
                    reservation.end_time,
                    reservation.repeat_type || 'none',
                    reservation.repeat_days || null,
                    reservation.is_active !== false
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
            const result = await this.db.get('SELECT * FROM reservations WHERE id = ?', [id]);
            return result;
        } finally {
            await this.db.close();
        }
    }

    async getAll() {
        await this.db.connect();
        try {
            const results = await this.db.all('SELECT * FROM reservations ORDER BY start_time ASC');
            return results;
        } finally {
            await this.db.close();
        }
    }

    async getActive() {
        await this.db.connect();
        try {
            const results = await this.db.all(
                'SELECT * FROM reservations WHERE is_active = true ORDER BY start_time ASC'
            );
            return results;
        } finally {
            await this.db.close();
        }
    }

    async update(id, reservation) {
        await this.db.connect();
        try {
            const result = await this.db.run(
                `UPDATE reservations SET 
                title = ?, station_id = ?, station_name = ?, start_time = ?, end_time = ?, 
                repeat_type = ?, repeat_days = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?`,
                [
                    reservation.title,
                    reservation.station_id,
                    reservation.station_name,
                    reservation.start_time,
                    reservation.end_time,
                    reservation.repeat_type,
                    reservation.repeat_days,
                    reservation.is_active,
                    id
                ]
            );
            return result;
        } finally {
            await this.db.close();
        }
    }

    async delete(id) {
        await this.db.connect();
        try {
            const result = await this.db.run('DELETE FROM reservations WHERE id = ?', [id]);
            return result;
        } finally {
            await this.db.close();
        }
    }

    async getUpcoming(limitHours = 24) {
        await this.db.connect();
        try {
            const results = await this.db.all(
                `SELECT * FROM reservations 
                WHERE is_active = true 
                AND start_time BETWEEN datetime('now') AND datetime('now', '+${limitHours} hours')
                ORDER BY start_time ASC`
            );
            return results;
        } finally {
            await this.db.close();
        }
    }
}

module.exports = Reservations;