const Joi = require("joi");

const PlaylistsPayloadSchema = Joi.object({
    name: Joi.string().required(),
});

const Playlists_SongsPayloadSchema = Joi.object({
    songId: Joi.string().required(),
});

module.exports = { PlaylistsPayloadSchema, Playlists_SongsPayloadSchema };
