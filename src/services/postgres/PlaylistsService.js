const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistsService {
    constructor() {
        this._pool = new Pool();
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: "INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id",
            values: [id, name, owner, createdAt, updatedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError("Playlist gagal ditambahkan");
        }

        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `SELECT pl.id, pl.name, us.username FROM playlists pl LEFT JOIN users us ON us.id = pl.owner WHERE pl.owner = $1 GROUP BY pl.id, us.id`,
            values: [owner],
        };
        const result = await this._pool.query(query);

        return result.rows;
    }

    async getPlaylistById(id) {
        const query = {
            text: `SELECT pl.id, pl.name, us.username FROM playlists pl LEFT JOIN users us ON us.id = pl.owner WHERE pl.id = $1 FETCH FIRST ROW ONLY;`,
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new InvariantError("Playlist gagal ditambahkan");
        }

        return result.rows[0];
    }

    async deletePlaylistById(id) {
        const query = {
            text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new InvariantError("Playlist gagal dihapus");
        }
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: "SELECT * FROM playlists WHERE id = $1",
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError("Playlist tidak ditemukan");
        }

        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError(
                "Anda tidak berhak mengakses resource ini"
            );
        }
    }
}

module.exports = PlaylistsService;
