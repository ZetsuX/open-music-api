const songDetailMapDBToModel = ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    album_id,
    created_at,
    updated_at,
}) => ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId: album_id,
    createdAt: created_at,
    updatedAt: updated_at,
});

const songMapDBToModel = ({ id, title, performer }) => ({
    id,
    title,
    performer,
});

module.exports = { songMapDBToModel, songDetailMapDBToModel };
