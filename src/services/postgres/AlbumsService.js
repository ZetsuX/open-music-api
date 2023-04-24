const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const ClientError = require("../../exceptions/ClientError");
const { albumMapDBToModel } = require("../../utils/albumsMapper");

class AlbumsService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: "INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id",
            values: [id, name, year, createdAt, updatedAt],
        };

        const { rows } = await this._pool.query(query);

        if (!rows[0].id) {
            throw new InvariantError("Album gagal ditambahkan");
        }

        return rows[0].id;
    }

    async getAlbumById(id) {
        const query = {
            text: "SELECT * FROM albums WHERE id = $1",
            values: [id],
        };
        const { rows, rowCount } = await this._pool.query(query);

        if (!rowCount) {
            throw new NotFoundError("Album tidak ditemukan");
        }
        return rows.map(albumMapDBToModel)[0];
    }

    async editAlbumById(id, { name, year }) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: "UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id",
            values: [name, year, updatedAt, id],
        };

        const { rowCount } = await this._pool.query(query);

        if (!rowCount) {
            throw new NotFoundError(
                "Gagal memperbarui album. Id tidak ditemukan"
            );
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: "DELETE FROM albums WHERE id = $1 RETURNING id",
            values: [id],
        };

        const { rowCount } = await this._pool.query(query);

        if (!rowCount) {
            throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
        }
    }

    async uploadCover(albumId, coverUrl) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: "UPDATE albums SET cover_url = $1, updated_at = $2 WHERE id = $3",
            values: [coverUrl, updatedAt, albumId],
        };

        await this._pool.query(query);
    }

    async likeAlbum(albumId, userId) {
        let query = {
            text: "SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2",
            values: [albumId, userId],
        };
        const { rowCount } = await this._pool.query(query);

        if (rowCount > 0) {
            throw new ClientError("Album telah disukai");
        }

        const id = `album-${nanoid(16)}`;
        query = {
            text: "INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id",
            values: [id, albumId, userId],
        };

        const { rows } = await this._pool.query(query);
        if (!rows[0].id) {
            throw new InvariantError("Album gagal disukai");
        }

        await this._cacheService.delete(`notelikes:${albumId}`);
    }

    async dislikeAlbum(albumId, userId) {
        const query = {
            text: "DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id",
            values: [albumId, userId],
        };

        const { rowCount } = await this._pool.query(query);

        if (!rowCount) {
            throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
        }

        await this._cacheService.delete(`notelikes:${albumId}`);
    }

    async getAlbumLikes(id) {
        try {
            const result = await this._cacheService.get(`notelikes:${id}`);
            return [JSON.parse(result), true];
        } catch (error) {
            const query = {
                text: "SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1",
                values: [id],
            };
            const likes = (await this._pool.query(query)).rows[0].count;
            await this._cacheService.set(
                `notelikes:${id}`,
                JSON.stringify(likes),
                1800
            );

            return [likes, false];
        }
    }

    async verifyAlbum(id) {
        const query = {
            text: "SELECT id FROM albums WHERE id = $1",
            values: [id],
        };
        const { rowCount } = await this._pool.query(query);

        if (!rowCount) {
            throw new NotFoundError("Album tidak ditemukan");
        }
    }
}

module.exports = AlbumsService;
