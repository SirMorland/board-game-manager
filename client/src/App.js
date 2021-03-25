import React from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import Gravatar from 'react-gravatar';

import { signup, login, verify, logout, Unauthorized, Conflict } from './api';


export default class App extends React.Component {
	constructor() {
		super();

		this.state = {
			user: undefined
		};
	}

	async componentDidMount() {
		try {
			let user = await verify();
			this.login(user);
		} catch (e) {
			if(e instanceof Unauthorized) {
				this.login(null);
			}
		}
	}

	login = user => {
		this.setState({
			user
		});
	}

	logout = () => {
		logout();
		this.login(null);
	}

	render() {
		let { user } = this.state;

		return (
			<React.Fragment>
				<header>
					<Link to="/">Board Game Manager</Link>
					{user &&
						<Gravatar email={user.email} onClick={this.logout} />
					}
				</header>
				<Switch>
					<Route exact path="/">
						{user === null &&
							<div>
								<LoginForm login={this.login} />
								<SignupForm login={this.login} />
							</div>
						}
					</Route>
				</Switch>
			</React.Fragment>
		);
	}
}

class LoginForm extends React.Component {
	constructor() {
		super();

		this.state = {
			username: "",
			password: ""
		}
	}

	input = event => {
		this.setState({
			[event.target.name]: event.target.value
		});
	}

	login = async event => {
		event.preventDefault();

		try {
			let user = await login(this.state.username, this.state.password);
			this.props.login(user);
		} catch(e) {
			if(e instanceof Unauthorized) {
				console.log("Frong username or password");
			}
		}
	}

	render() {
		let { username, password } = this.state;

		return (
			<form onSubmit={this.login}>
				<label htmlFor="username">Username</label>
				<input id="username" name="username" value={username} onChange={this.input} />
				<label htmlFor="password">Password</label>
				<input type="password" id="password" name="password" value={password} onChange={this.input} />
				<button type="submit">Log in</button>
			</form>
		);
	}
}

class SignupForm extends React.Component {
	constructor() {
		super();

		this.state = {
			username: "",
			email: "",
			password: "",
			"confirm-password": ""
		}
	}

	input = event => {
		this.setState({
			[event.target.name]: event.target.value
		});
	}

	signup = async event => {
		event.preventDefault();

		try {
			let user = await signup(this.state.username, this.state.email, this.state.password);
			this.props.login(user);
		} catch(e) {
			if(e instanceof Conflict) {
				console.log("Username or email taken");
			}
		}
	}

	render() {
		let { username, email, password, "confirm-password": confirm } = this.state;

		return (
			<form onSubmit={this.signup}>
				<label htmlFor="new-username">Username</label>
				<input id="new-username" name="username" value={username} onChange={this.input} />
				<label htmlFor="email">Email</label>
				<input type="email" id="email" name="email" value={email} onChange={this.input} />
				<label htmlFor="new-password">Password</label>
				<input type="password" id="new-password" name="password" value={password} onChange={this.input} />
				<label htmlFor="confirm-password">Confirm password</label>
				<input type="password" id="confirm-password" name="confirm-password" value={confirm} onChange={this.input} />
				<button type="submit">Sign up</button>
			</form>
		);
	}
}