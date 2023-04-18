const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const {
    songMapDBToModel,
    songDetailMapDBToModel,
} = require("../../utils/songsMapper");

class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({ title, year, genre, performer, duration, albumId }) {
        const id = nanoid(16);
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: "INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
            values: [
                id,
                title,
                year,
                genre,
                performer,
                duration,
                albumId,
                createdAt,
                updatedAt,
            ],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError("Lagu gagal ditambahkan");
        }

        return result.rows[0].id;
    }

    async getSongs() {
        const result = await this._pool.query("SELECT * FROM songs");
        return result.rows.map(songMapDBToModel);
    }

    async getSongById(id) {
        const query = {
            text: "SELECT * FROM songs WHERE id = $1",
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Lagu tidak ditemukan");
        }
        return result.rows.map(songDetailMapDBToModel)[0];
    }

    async editSongById(id, { name, year }) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: "UPDATE songs SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id",
            values: [name, year, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError(
                "Gagal memperbarui song. Id tidak ditemukan"
            );
        }
    }

    async deleteSongById(id) {
        const query = {
            text: "DELETE FROM songs WHERE id = $1 RETURNING id",
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan");
        }
    }
}

module.exports = SongsService;
