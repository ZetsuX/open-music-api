const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistsService {
    constructor(collaborationsService) {
        this._pool = new Pool();
        this._collaborationsService = collaborationsService;
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: "INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id",
            values: [id, name, owner, createdAt, updatedAt],
        };

        const { rows, rowCount } = await this._pool.query(query);

        if (!rowCount) {
            throw new InvariantError("Playlist gagal ditambahkan");
        }

        return rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `SELECT pl.id, pl.name, us.username FROM playlists pl
            LEFT JOIN collaborations co ON co.playlist_id = pl.id
            LEFT JOIN users us ON us.id = pl.owner OR us.id = co.user_id
            WHERE (pl.owner = $1 OR co.user_id = $1) AND us.id = pl.owner
            GROUP BY pl.id, us.username`,
            values: [owner],
        };
        const { rows } = await this._pool.query(query);

        return rows;
    }

    async getPlaylistById(id) {
        const query = {
            text: `SELECT pl.id, pl.name, us.username FROM playlists pl LEFT JOIN users us ON us.id = pl.owner WHERE pl.id = $1 FETCH FIRST ROW ONLY;`,
            values: [id],
        };

        const { rows, rowCount } = await this._pool.query(query);
        if (!rowCount) {
            throw new InvariantError("Playlist gagal didapatkan");
        }

        return rows[0];
    }

    async deletePlaylistById(id) {
        const query = {
            text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
            values: [id],
        };

        const { rowCount } = await this._pool.query(query);
        if (!rowCount) {
            throw new InvariantError("Playlist gagal dihapus");
        }
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: "SELECT * FROM playlists WHERE id = $1",
            values: [id],
        };

        const { rows, rowCount } = await this._pool.query(query);
        if (!rowCount) {
            throw new NotFoundError("Playlist tidak ditemukan");
        }

        const playlist = rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError(
                "Anda tidak berhak mengakses resource ini"
            );
        }
    }

    async addPlaylistSongActivity(playlistId, songId, userId, action) {
        const id = `activity-${nanoid(16)}`;
        const curTime = new Date().toISOString();

        const query = {
            text: "INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)",
            values: [id, action, curTime, playlistId, songId, userId],
        };

        const { rowCount } = await this._pool.query(query);

        if (!rowCount) {
            throw new InvariantError("Activity gagal dicatat");
        }
    }

    async getPlaylistSongActivities(playlistId) {
        const query = {
            text: `SELECT us.username, so.title, ac.action, ac.time FROM playlist_song_activities ac 
            LEFT JOIN users us ON us.id = ac.user_id 
            LEFT JOIN songs so ON so.id = ac.song_id
            WHERE ac.playlist_id = $1`,
            values: [playlistId],
        };
        const { rows } = await this._pool.query(query);

        return rows;
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this._collaborationsService.verifyCollaborator(
                    playlistId,
                    userId
                );
            } catch {
                throw error;
            }
        }
    }
}

module.exports = PlaylistsService;
