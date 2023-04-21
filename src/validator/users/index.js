const InvariantError = require("../../exceptions/InvariantError");
const { UserPayloadSchema } = require("./schema");

const UsersValidator = {
    validateUserPayload: (payload) => {
        const validationRes = UserPayloadSchema.validate(payload);
        if (validationRes.error) {
            throw new InvariantError(validationRes.error.message);
        }
    },
};

module.exports = UsersValidator;
