const songDetailMapDBToModel = ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
    created_at,
    updated_at,
}) => ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
    createdAt: created_at,
    updatedAt: updated_at,
});

const songMapDBToModel = ({ id, title, performer }) => ({
    id,
    title,
    performer,
});

module.exports = { songMapDBToModel, songDetailMapDBToModel };
