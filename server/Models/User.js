let { v4: uuid } = require('uuid');

let Entity = require('./Entity');

class User extends Entity {
	static _requiredFields = ['username', 'password'];
	static _uniqueFields = ['username', 'email'];

	constructor(data) {
		super(data);

		this.username = data.username;
		this.password = data.password;
		this.secret = data.secret;
		this.email = data.email;
	}

	json = async () => {
		return {
			id: this._id,
			username: this.username,
			email: this.email
		};
	}

	save = async () => {
		await this.validate();

		let collection = await User.collection();

		if(this._id) {
			await collection.updateOne(
				{_id: this._id},
				{
					$set: {
						username: this.username,
						password: this.password,
						secret: this.secret,
						email: this.email
					}
				}
			);
		} else {
			this._id = uuid();
			this.secret = uuid();

			await collection.insertOne({
				_id: this._id,
				username: this.username,
				password: this.password,
				secret: this.secret,
				email: this.email
			});
		}
	}

	delete = async () => {
		let collection = await User.collection();

		await collection.deleteOne({_id: this._id});
	}

	static collection = async () => {
		return await Entity.collection('users');
	}
	
	static findBy = async (field, term) => {
		return await Entity.findBy(User, field, term);
	}
}

module.exports = User