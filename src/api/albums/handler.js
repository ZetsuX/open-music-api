class AlbumsHandler {
    constructor(albumsService, songsService, validator) {
        this._albumsService = albumsService;
        this._songsService = songsService;
        this._validator = validator;
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);

        const albumId = await this._albumsService.addAlbum(request.payload);

        const response = h.response({
            status: "success",
            data: {
                albumId,
            },
        });
        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request) {
        const { id } = request.params;
        const album = await this._albumsService.getAlbumById(id);
        album.songs = await this._songsService.getSongsByAlbumId(id);

        return {
            status: "success",
            data: {
                album,
            },
        };
    }

    async putAlbumByIdHandler(request) {
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;

        await this._albumsService.editAlbumById(id, request.payload);

        return {
            status: "success",
            message: "Album berhasil diperbarui",
        };
    }

    async deleteAlbumByIdHandler(request) {
        const { id } = request.params;
        await this._albumsService.deleteAlbumById(id);

        return {
            status: "success",
            message: "Album berhasil dihapus",
        };
    }

    async postAlbumLikeHandler(request, h) {
        const { id: albumId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._albumsService.verifyAlbum(albumId);
        await this._albumsService.likeAlbum(albumId, credentialId);

        const response = h.response({
            status: "success",
            message: "Album berhasil disukai",
        });
        response.code(201);
        return response;
    }

    async deleteAlbumLikeHandler(request) {
        const { id: albumId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._albumsService.dislikeAlbum(albumId, credentialId);

        return {
            status: "success",
            message: "Suka terhadap album berhasil dihapus",
        };
    }

    async getAlbumLikesHandler(request, h) {
        const { id: albumId } = request.params;

        const res = await this._albumsService.getAlbumLikes(albumId);
        const likes = Number(res[0]);

        const response = h.response({
            status: "success",
            data: {
                likes,
            },
        });
        if (res[1]) response.header("X-Data-Source", "cache");

        return response;
    }
}

module.exports = AlbumsHandler;
