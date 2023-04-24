/* eslint-disable camelcase */
const albumMapDBToModel = ({
    id,
    name,
    year,
    cover_url,
    created_at,
    updated_at,
}) => ({
    id,
    name,
    year,
    coverUrl: cover_url,
    createdAt: created_at,
    updatedAt: updated_at,
});

module.exports = { albumMapDBToModel };
