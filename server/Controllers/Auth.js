let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');

let User = require('../Models/User');
let { RequirementNotMetError, UniqueFieldViolationError } = require('../Errors');

let JWT_SECRET = "";
let SALT_ROUNDS = -1;
let ACCESS_TOKEN_EXPIRATION_TIME = 60 * 15; // 15min
let REFRESH_TOKEN_EXPIRATION_TIME = 60 * 60 * 24 * 30; // 30d

let signup = async (request, response) => {
	let {username, email, password} = request.body;
	
	let hash = await bcrypt.hash(password, SALT_ROUNDS);
	
	let user = new User({
		username, email, password: hash
	});

	try {
		await user.save();
	} catch (e) {
		if(e instanceof RequirementNotMetError) {
			response.sendStatus(400);
		} else if(e instanceof UniqueFieldViolationError) {
			response.sendStatus(409);
		} else {
			response.sendStatus(500);
		}

		return;
	}

	setJWTCookies(response, user);

	response.send(await user.json());
}

let login = async (request, response) => {
	let {username, password} = request.body;
	let user = await User.findBy('username', username);

	if(user && await bcrypt.compare(password, user.password)) {
		setJWTCookies(response, user);

		response.send(await user.json());
	} else {
		response.sendStatus(401);
	}
};

let logout = async (_, response) => {
	response.cookie("access-token", "", {maxAge: 0});
	response.cookie("refresh-token", "", {maxAge: 0});
	response.send();
}

let verify = async (request, response) => {
	let token = request.cookies["refresh-token"];

	if(!token) {
		response.sendStatus(401);
		return;
	}

	let payload = jwt.decode(token);
	
	if(!payload) {
		response.cookie("access-token", "", {maxAge: 0});
		response.cookie("refresh-token", "", {maxAge: 0});
		response.sendStatus(401);
		return;
	}

	let user = await User.findBy('_id', payload.id);
	
	if(!user) {
		response.cookie("access-token", "", {maxAge: 0});
		response.cookie("refresh-token", "", {maxAge: 0});
		response.sendStatus(401);
		return;
	}

	jwt.verify(token, user.secret, async error => {
		if(error) {
			response.sendStatus(401);
			return;
		}

		response.send(await user.json());
	});
};

let checkAccessToken = async (request, response) => {
	let token = request.cookies["access-token"];

	if(!token) {
		return await checkRefreshToken(request, response);
	}

	try {
		let payload = await jwt.verify(token, JWT_SECRET);
		return payload.id;
	} catch(e) {
		return await checkRefreshToken(request, response);
	}
};

let checkRefreshToken = async (request, response) => {
	let token = request.cookies["refresh-token"];

	if(!token) {
		response.cookie("access-token", "", {maxAge: 0});
		response.cookie("refresh-token", "", {maxAge: 0});
		response.sendStatus(401);
		return false;
	}

	let payload = jwt.decode(token);
	
	if(!payload) {
		response.cookie("access-token", "", {maxAge: 0});
		response.cookie("refresh-token", "", {maxAge: 0});
		response.sendStatus(401);
		return false;
	}

	let user = await User.findBy('_id', payload.id);
	
	if(!user) {
		response.cookie("access-token", "", {maxAge: 0});
		response.cookie("refresh-token", "", {maxAge: 0});
		response.sendStatus(401);
		return false;
	}

	try {
		await jwt.verify(token, user.secret);
		
		let payload = {id: user._id, username: user.username};
		let accessToken = jwt.sign(payload, JWT_SECRET, {
			algorithm: "HS256", 
			expiresIn: ACCESS_TOKEN_EXPIRATION_TIME
		});
		response.cookie("access-token", accessToken, {
			maxAge: ACCESS_TOKEN_EXPIRATION_TIME * 1000,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production" ? true : false
		});
		
		return user._id;
	} catch (e) {
		response.cookie("access-token", "", {maxAge: 0});
		response.cookie("refresh-token", "", {maxAge: 0});
		response.sendStatus(401);
		return false;
	}
};

let setJWTCookies = (response, user) => {
	let payload = {id: user._id, username: user.username};

	let accessToken = jwt.sign(payload, JWT_SECRET, {
		algorithm: "HS256",
		expiresIn: ACCESS_TOKEN_EXPIRATION_TIME
	});
	let refreshToken = jwt.sign(payload, user.secret, {
		algorithm: "HS256",
		expiresIn: REFRESH_TOKEN_EXPIRATION_TIME
	});

	response.cookie("access-token", accessToken, {
		maxAge: ACCESS_TOKEN_EXPIRATION_TIME * 1000,
		httpOnly: true,
		secure: process.env.NODE_ENV === "production" ? true : false
	});
	response.cookie("refresh-token", refreshToken, {
		maxAge: REFRESH_TOKEN_EXPIRATION_TIME * 1000,
		httpOnly: true,
		secure: process.env.NODE_ENV === "production" ? true : false
	});
}

module.exports = {
	signup, login, logout, verify, checkAccessToken
};