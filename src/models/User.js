const Sequelize = require('sequelize');
const APIError = require('../APIError');
let db = require('../services/mysql').getConnection();
const Promise = require('bluebird');

const User = module.exports = db.define('user', {
	id: {
		type: Sequelize.DataTypes.INTEGER,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true
	},
	fname: {
		type: Sequelize.DataTypes.STRING,
		defaultValue: null
	},
	lname: {
		type: Sequelize.DataTypes.STRING,
		defaultValue: null
	},
	username: {
		type: Sequelize.DataTypes.STRING,
		unique: true
	},
	password: {
		type: Sequelize.DataTypes.STRING,
		defaultValue: null
	},
	token: {
		type: Sequelize.DataTypes.STRING,
		defaultValue: null
	},
	smsNumber: {
		type: Sequelize.DataTypes.STRING,
		defaultValue: null
	},
	email: {
		type: Sequelize.DataTypes.STRING,
		defaultValue: null
	},
	pushNotifId: {
		type: Sequelize.DataTypes.STRING,
		defaultValue: null
	},
	role: {
		type: Sequelize.DataTypes.STRING,
		defaultValue: null
	},
	createdAt: {
		type: Sequelize.DataTypes.DATE,
		defaultValue: null
	},
	updatedAt: {
		type: Sequelize.DataTypes.DATE,
		defaultValue: null
	},
	deletedAt: {
		type: Sequelize.DataTypes.DATE,
		defaultValue: null
	}
}, {
	paranoid: true
});

User.extractReturnableFields = function(data, internalOnly = false) {
	let output;
	if (Array.isArray(data)) {
		output = [];
		for (let i = 0; i < data.length; i++) {
			output.push(_extractReturnableFields(data[i], internalOnly));
		}
	} else {
		output = _extractReturnableFields(data, internalOnly);
	}
	return output;
}

function _extractReturnableFields(user, internalOnly) {
	const output = {
		id: user.id,
		fname: user.fname,
		lname: user.lname,
		smsNumber: user.smsNumber,
		email: user.email,
		pushNotifId: user.pushNotifId,
		role: user.role
	};
	if (user.deletedAt) {
		output.deletedAt = user.deletedAt;
	}

	if (internalOnly) {
		output.username = user.username;
		output.token = user.token;
	}

	// if (user.company) {
	// 	output.company = Company.extractReturnableFields(user.company, internalOnly);
	// }

	return output;
}

User.findByUsername = function(username) {
    return User.findOne({ where: { username }})
        .then(user => {
            if (!user) {
                throw APIError(404, 'User Not Found');
            }
            return user;
        })
        .catch(err => {
            throw APIError(404, 'User Not Found');
        });
}

User.findByToken = function(token, includeEntity) {
    var query;
    if (includeEntity) {
        query = User.findOne({ where: { token }, include: [{ model: Company, as: 'company' }]});
    } else {
        query = User.findOne({ where: { token }});
    }

    return query
        .then(user => {
            if (!user) {
                throw APIError(404, 'User Not Found');
            }
            return user;
        })
        .catch(err => {
            throw APIError(404, 'User Not Found');
        });
}

User.exists = function(userId) {
	return User.findById(userId)
		.then(user => {
			if (!user) {
				throw APIError(404, "User Not Found");
			}
			return !!user;
		})
		.catch(err => {
			throw APIError(err.status || 500, err.message || "Operation Failed", err);
		});
}