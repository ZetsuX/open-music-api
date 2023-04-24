class UploadsHandler {
    constructor(storageService, albumsService, validator) {
        this._storageService = storageService;
        this._albumsService = albumsService;
        this._validator = validator;
    }

    async postUploadAlbumCoverHandler(request, h) {
        const { cover: data } = request.payload;
        const { id: albumId } = request.params;

        this._validator.validateImageHeaders(data.hapi.headers);

        await this._albumsService.verifyAlbum(albumId);

        const filename = await this._storageService.writeFile(data, data.hapi);
        const fileUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

        await this._albumsService.uploadCover(albumId, fileUrl);

        const response = h.response({
            status: "success",
            message: "Sampul berhasil diunggah",
        });
        response.code(201);
        return response;
    }
}

module.exports = UploadsHandler;
