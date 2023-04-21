const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { songMapDBToModel } = require("../../utils/songsMapper");

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

    async getSongs({ title, performer }) {
        let query;
        if (title && performer) {
            query = {
                text: "SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2",
                values: [`%${title}%`, `%${performer}%`],
            };
        } else if (title) {
            query = {
                text: "SELECT id, title, performer FROM songs WHERE title ILIKE $1",
                values: [`%${title}%`],
            };
        } else if (performer) {
            query = {
                text: "SELECT id, title, performer FROM songs WHERE performer ILIKE $1",
                values: [`%${performer}%`],
            };
        } else {
            query = "SELECT id, title, performer FROM songs";
        }

        return (await this._pool.query(query)).rows;
    }

    async getSongById(id) {
        const query = {
            text: "SELECT * FROM songs WHERE id = $1",
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError("Lagu tidak ditemukan");
        }
        return result.rows.map(songMapDBToModel)[0];
    }

    async editSongById(
        id,
        { title, year, genre, performer, duration, albumId }
    ) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: "UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id",
            values: [
                title,
                year,
                genre,
                performer,
                duration,
                albumId,
                updatedAt,
                id,
            ],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
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

        if (!result.rowCount) {
            throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan");
        }
    }

    async getSongsByAlbumId(albumId) {
        const querySong = {
            text: "SELECT id, title, performer FROM songs WHERE album_id = $1",
            values: [albumId],
        };
        return (await this._pool.query(querySong)).rows;
    }

    async addSongToPlaylist(songId, playlistId) {
        const id = `playlists_songs-${nanoid(16)}`;

        const query = {
            text: "INSERT INTO playlists_songs VALUES($1, $2, $3) RETURNING id",
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new InvariantError("Lagu gagal ditambahkan ke playlist");
        }

        return result.rows[0].id;
    }

    async getSongsByPlaylistId(id) {
        const query = {
            text: "SELECT so.id, so.title, so.performer FROM songs so INNER JOIN playlists_songs ps ON so.id = ps.song_id WHERE ps.playlist_id = $1 GROUP BY so.id",
            values: [id],
        };
        return (await this._pool.query(query)).rows;
    }

    async deleteSongFromPlaylist(songId, playlistId) {
        const query = {
            text: "DELETE FROM playlists_songs WHERE song_id = $1 AND playlist_id = $2 RETURNING id",
            values: [songId, playlistId],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new InvariantError("Lagu gagal dihapus dari playlist");
        }
    }

    async verifySong(id) {
        const query = {
            text: "SELECT id FROM songs WHERE id = $1",
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError("Lagu tidak ditemukan");
        }
    }
}

module.exports = SongsService;
