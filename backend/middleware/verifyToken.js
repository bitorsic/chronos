const jwt = require("jsonwebtoken");
const { roles } = require("../utils/constants");

const verifyToken = (allowedRoles = [roles.ADMIN]) => {
	return async (req, res, next) => {
		try {
			if (!req.headers.authorization) {
				throw new Error(`Authorization header not provided`);
			}

			const authHeader = req.headers.authorization.split(" ");
			if (authHeader[0] !== "Bearer") {
				throw new Error(`Invalid Authorization header`);
			}

			const { sub, role, iss } = jwt.verify(authHeader[1], process.env.AUTH_TOKEN_SECRET);

			if (iss !== process.env.JWT_ISSUER) {
				return res.status(401).send({ message: `JWT issuer different than expected` });
			}

			if (![roles.ADMIN, ...allowedRoles].includes(role)) {
				return res.status(403).send({ message: `Insufficient Permissions` });
			}

			req.user = {
				id: sub,
				role,
			};
			next();
		} catch (err) {
			if (err.name === "TokenExpiredError") {
				return res.status(440).send({ message: err.message });
			}

			res.status(401).send({ message: err.message });
		}
	}
};

module.exports = verifyToken;