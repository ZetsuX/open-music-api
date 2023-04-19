const AlbumsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
    name: "albums",
    version: "1.0.0",
    register: async (server, { service, song_service, validator }) => {
        const albumsHandler = new AlbumsHandler(
            service,
            song_service,
            validator
        );
        server.route(routes(albumsHandler));
    },
};
