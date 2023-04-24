const InvariantError = require("../../exceptions/InvariantError");
const {
    PlaylistsPayloadSchema,
    PlaylistsSongsPayloadSchema,
} = require("./schema");

const PlaylistsValidator = {
    validatePlaylistsPayload: (payload) => {
        const validationResult = PlaylistsPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validatePlaylists_SongsPayload: (payload) => {
        const validationResult = PlaylistsSongsPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = PlaylistsValidator;
