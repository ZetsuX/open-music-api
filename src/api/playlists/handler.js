class PlaylistsHandler {
    constructor(playlistsService, songsService, validator) {
        this._playlistsService = playlistsService;
        this._songsService = songsService;
        this._validator = validator;
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistsPayload(request.payload);
        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this._playlistsService.addPlaylist({
            name,
            owner: credentialId,
        });

        const response = h.response({
            status: "success",
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }

    async getPlaylistsHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._playlistsService.getPlaylists(
            credentialId
        );
        return {
            status: "success",
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistByIdHandler(request) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(
            playlistId,
            credentialId
        );
        await this._playlistsService.deletePlaylistById(playlistId);

        return {
            status: "success",
            message: "Playlist berhasil dihapus",
        };
    }

    async postSongToPlaylistByIdHandler(request, h) {
        this._validator.validatePlaylists_SongsPayload(request.payload);
        const { id: credentialId } = request.auth.credentials;
        const { id: playlistId } = request.params;
        const { songId } = request.payload;

        await this._songsService.verifySong(songId);

        await this._playlistsService.verifyPlaylistAccess(
            playlistId,
            credentialId
        );

        const playlist_songId = await this._songsService.addSongToPlaylist(
            songId,
            playlistId
        );

        const response = h.response({
            status: "success",
            message: "Lagu berhasil ditambahkan ke Playlist",
            data: {
                playlist_songId,
            },
        });
        response.code(201);
        return response;
    }

    async getPlaylistDetailHandler(request) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistAccess(
            playlistId,
            credentialId
        );

        let playlist = await this._playlistsService.getPlaylistById(playlistId);
        playlist.songs = await this._songsService.getSongsByPlaylistId(
            playlistId
        );

        return {
            status: "success",
            data: {
                playlist,
            },
        };
    }

    async deleteSongsFromPlaylistByIdHandler(request) {
        this._validator.validatePlaylists_SongsPayload(request.payload);
        const { id: credentialId } = request.auth.credentials;
        const { id: playlistId } = request.params;
        const { songId } = request.payload;

        await this._songsService.verifySong(songId);

        await this._playlistsService.verifyPlaylistAccess(
            playlistId,
            credentialId
        );

        await this._songsService.deleteSongFromPlaylist(songId, playlistId);

        return {
            status: "success",
            message: "Kolaborasi berhasil dihapus",
        };
    }
}

module.exports = PlaylistsHandler;
