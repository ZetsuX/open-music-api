class AlbumsHandler {
    constructor(service, song_service, validator) {
        this._service = service;
        this._songService = song_service;
        this._validator = validator;
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);

        const albumId = await this._service.addAlbum(request.payload);

        const response = h.response({
            status: "success",
            data: {
                albumId,
            },
        });
        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request, h) {
        const { id } = request.params;
        let album = await this._service.getAlbumById(id);
        album.songs = await this._songService.getSongsByAlbumId(id);

        return {
            status: "success",
            data: {
                album,
            },
        };
    }

    async putAlbumByIdHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;

        await this._service.editAlbumById(id, request.payload);

        return {
            status: "success",
            message: "Album berhasil diperbarui",
        };
    }

    async deleteAlbumByIdHandler(request, h) {
        const { id } = request.params;
        await this._service.deleteAlbumById(id);

        return {
            status: "success",
            message: "Album berhasil dihapus",
        };
    }
}

module.exports = AlbumsHandler;
