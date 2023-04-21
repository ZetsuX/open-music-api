/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable("playlists", {
        id: {
            type: "VARCHAR(50)",
            primaryKey: true,
        },
        name: {
            type: "TEXT",
            notNull: true,
        },
        owner: {
            type: "VARCHAR(50)",
            notNull: true,
        },
        created_at: {
            type: "TEXT",
            notNull: true,
        },
        updated_at: {
            type: "TEXT",
            notNull: true,
        },
    });

    pgm.addConstraint(
        "playlists",
        "fk_playlists.owner_users.id",
        "FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE"
    );

    pgm.createTable("playlists_songs", {
        id: {
            type: "VARCHAR(50)",
            primaryKey: true,
        },
        playlist_id: {
            type: "VARCHAR(50)",
            notNull: true,
        },
        song_id: {
            type: "VARCHAR(50)",
            notNull: true,
        },
    });

    pgm.addConstraint(
        "playlists_songs",
        "unique_playlist_id_and_song_id",
        "UNIQUE(playlist_id, song_id)"
    );

    pgm.addConstraint(
        "playlists_songs",
        "fk_playlists_songs.playlist_id_playlists.id",
        "FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE"
    );
    pgm.addConstraint(
        "playlists_songs",
        "fk_playlists_songs.song_id_songs.id",
        "FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE"
    );
};

exports.down = (pgm) => {
    pgm.dropTable("playlists_songs");

    pgm.dropConstraint("playlists", "fk_playlists.owner_users.id");
    pgm.dropTable("playlists");
};
