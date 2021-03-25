const User = require('../Models/User');

/**
 * Test creating one user
 */
(async () => {
	let user = new User({
		username: 'Testuser',
		password: 'test123',
		email: 'testuser@morland.red'
	});
	console.log(await user.json());

	await user.save();
	console.log(await user.json());

	let savedUser = await User.findBy('username', 'Testuser');
	console.log(await savedUser.json());

	await savedUser.delete();

	process.exit();
})();