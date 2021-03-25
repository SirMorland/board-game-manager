const getDB = require('../db');
const { RequirementNotMetError, UniqueFieldViolationError } = require('../Errors');

class Entity {
	static _requiredFields = [];
	static _uniqueFields = [];

	constructor(data) {
		this._id = data._id;
	}

	/**
	 * @returns JSON presentation of this Entity
	 */
	json = async () => {
		return {
			_id: this._id 
		};
	}

	/**
	 * Validate this entity's required and unique fields
	 */
	validate = async () => {
		this.constructor._requiredFields.forEach(field => {
			if(this[field] === null || this[field] === undefined || this[field] === "") {
				throw new RequirementNotMetError(field);
			}
		});

		let collection = await this.constructor.collection();
		for(let i = 0; i < this.constructor._uniqueFields.length; i++) {
			let field = this.constructor._uniqueFields[i];

			const entity = await collection.findOne({[field]: this[field]});

			if(entity && entity._id !== this._id) {
				throw new UniqueFieldViolationError(field);
			}
		}
	}


	/**
	 * @param {*} collection Collection name 
	 * @returns MongoDB collection instance
	 */
	static collection = async collection => {
		let db = await getDB();
		return db.collection(collection);
	}
	
	/**
	 * @param {*} C A class that extends Entity
	 * @param {*} field Database field to look for
	 * @param {*} term Search term
	 * @returns An entity matching the search term or null
	 */
	static findBy = async (C, field, term) => {
		let collection = await C.collection();

		let entity = await collection.findOne({[field]: term});
		return entity ? new C(entity) : null;
	}
}

module.exports = Entity;