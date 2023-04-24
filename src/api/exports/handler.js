class ExportsHandler {
    constructor(producerService, playlistsService, validator) {
        this._producerService = producerService;
        this._playlistsService = playlistsService;
        this._validator = validator;
    }

    async postExportPlaylistsHandler(request, h) {
        this._validator.validateExportPlaylistsPayload(request.payload);

        const { id: userId } = request.auth.credentials;
        const { playlistId } = request.params;

        await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

        const message = {
            userId,
            targetEmail: request.payload.targetEmail,
        };

        await this._producerService.sendMessage(
            "export:playlists",
            JSON.stringify(message)
        );

        const response = h.response({
            status: "success",
            message: "Permintaan Anda dalam antrean",
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;
