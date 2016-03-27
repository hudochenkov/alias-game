var React = require('react');
var ReactDOM = require('react-dom');
var words = require('./../dictionary/top1000.json');

var App = React.createClass({
	getInitialState: function() {
		return {
			teams: {
				team1: {
					name: 'Alpha',
					gameWords: []
				},
				team2: {
					name: 'Omega',
					gameWords: []
				}
			},
			wordsPerRound: 20,
			showEnglish: true,
			showRussian: true,
			route: 'start',
			currentTeam: 'team1',
			words: words.slice(0),
			currentWord: ''
		};
	},
	endGame: function() {
		Object.keys(this.state.teams).forEach(function(team) {
			this.state.teams[team].gameWords = [];
		}.bind(this));

		this.setState({
			teams: this.state.teams,
			route: 'start',
			currentTeam: 'team1',
			currentWord: ''
		});
	},
	setAnswer: function(answer) {
		// record answer to state
		var word = this.state.currentWord;
		var gameWords = this.state.teams[this.state.currentTeam].gameWords;

		word.guessed = answer;
		gameWords.push(word);

		// if there are words left
		if (gameWords.length < this.state.wordsPerRound) {
			this.generateNewWord();
		} else {
			this.changeRoute('roundresults');
		}

		this.setState({
			teams: this.state.teams
		});
	},
	generateNewWord: function() {
		// load words again if there are not enough
		if (this.state.words.length < this.state.wordsPerRound) {
			this.state.words = words.slice(0);
		}

		var index = Math.floor(Math.random() * this.state.words.length);
		var newWord = this.state.words.splice(index, 1);

		newWord = newWord[0];

		this.setState({
			words: this.state.words,
			currentWord: newWord
		});
	},
	nextTeam: function() {
		this.setState({
			currentTeam: 'team2'
		});

		this.changeRoute('game');
	},
	changeRoute: function(route) {
		this.state.route = route || 'start';

		this.setState({
			route: this.state.route
		});
	},
	countScore: function(team) {
		var count = 0;

		this.state.teams[team].gameWords.forEach(function(el) {
			if (el.guessed) {
				count++;
			}
		});

		return count;
	},
	toggleOption: function(optionName, optionValue) {
		var option = {};

		option[optionName] = optionValue.target.checked;

		this.setState(option);
	},
	render: function() {
		if (this.state.route === 'game') {
			return (
				<Game
					changeRoute={this.changeRoute}
					setAnswer={this.setAnswer}
					generateNewWord={this.generateNewWord}
					gameWords={this.state.teams[this.state.currentTeam].gameWords}
					teamName={this.state.teams[this.state.currentTeam].name}
					showEnglish={this.state.showEnglish}
					showRussian={this.state.showRussian}
					wordsPerRound={this.state.wordsPerRound}
					currentWord={this.state.currentWord}
				/>
			);
		} else if (this.state.route === 'settings') {
			return (
				<Settings changeRoute={this.changeRoute} toggleOption={this.toggleOption} showEnglish={this.state.showEnglish} showRussian={this.state.showRussian} />
			);
		} else if (this.state.route === 'roundresults') {
			return (
				<RoundResults
					nextTeam={this.nextTeam}
					changeRoute={this.changeRoute}
					countScore={this.countScore}
					team={this.state.teams[this.state.currentTeam]}
					currentTeam={this.state.currentTeam}
				/>
			);
		} else if (this.state.route === 'gameresults') {
			return (
				<GameResults
					teams={this.state.teams}
					countScore={this.countScore}
					endGame={this.endGame}
				/>
			);
		} else {
			return (
				<StartScreen teams={this.state.teams} changeRoute={this.changeRoute} />
			);
		}
	}
});

var StartScreen = React.createClass({
	renderTeam: function(key){
		return (
			<li className="teams__team" key={key}>
				{this.props.teams[key].name}
			</li>
		);
	},
	render: function() {
		return (
			<div className="landing">
				<div className="landing__title">
					<h1 className="title">Alias</h1>
				</div>

				<div className="landing__teams">
					<ul className="teams">
						{Object.keys(this.props.teams).map(this.renderTeam)}
					</ul>
				</div>

				<div className="landing__start">
					<button className="start" type="button" onClick={this.props.changeRoute.bind(null, 'game')}>Start game</button>
				</div>

				<div className="landing__settings">
					<button className="like-link" type="button" onClick={this.props.changeRoute.bind(null, 'settings')}>Settings</button>
				</div>
			</div>
		);
	}
});

var Game = React.createClass({
	componentWillMount: function() {
		this.props.generateNewWord();
	},
	getWordsLeft: function() {
		return this.props.wordsPerRound - this.props.gameWords.length;
	},
	indicatorWidth: function() {
		return {
			width: (this.getWordsLeft() / this.props.wordsPerRound * 100) + '%'
		};
	},
	render: function() {
		return (
			<div className="game">
				<p className="game__team">{this.props.teamName}</p>

				<p className="game__indicator">
					<span className="game__indicator-bar">
						<span className="game__indicator-bar-line" style={this.indicatorWidth()}></span>
					</span>
					<span className="game__indicator-count">{this.getWordsLeft()}</span>
				</p>

				<Word showEnglish={this.props.showEnglish} showRussian={this.props.showRussian} currentWord={this.props.currentWord} />

				<p className="game__actions">
					<button className="game__action game__action--no" onClick={this.props.setAnswer.bind(null, false)} type="button">No</button>
					<button className="game__action game__action--yes" onClick={this.props.setAnswer.bind(null, true)} type="button">Yes</button>
				</p>
			</div>
		);
	}
});

var Word = React.createClass({
	render: function() {
		if (this.props.showRussian) {
			if (this.props.showEnglish) {
				return (
					<div className="game__words">
						<p className="game__word">{this.props.currentWord.english}</p>
						<p className="game__word-translation">{this.props.currentWord.russian}</p>
					</div>
				);
			} else {
				return (
					<div className="game__words">
						<p className="game__word">{this.props.currentWord.russian}</p>
					</div>
				);
			}
		} else {
			return (
				<div className="game__words">
					<p className="game__word">{this.props.currentWord.english}</p>
				</div>
			);
		}
	}
});

var RoundResults = React.createClass({
	renderWord: function(key) {
		var word = this.props.team.gameWords[key];

		return (
			<li className={'round-results__item--' + word.guessed} key={key}>
				<span className="round-results__word">{word.english}</span>{' '}
				<span className="round-results__word-translation">{word.russian}</span>
			</li>
		);
	},
	render: function() {
		if (this.props.currentTeam === 'team1') {
			var action = (<button className="round-results__action like-link" onClick={this.props.nextTeam} type="button">Next team</button>);
		} else {
			var action = (<button className="round-results__action like-link" onClick={this.props.changeRoute.bind(null, 'gameresults')} type="button">Show game results</button>);
		}

		return (
			<div className="round-results">
				<h2 className="round-results__title">Round Results</h2>

				<p className="round-results__team">{this.props.team.name} — {this.props.countScore(this.props.currentTeam)}</p>

				<ul className="round-results__list">
					{Object.keys(this.props.team.gameWords).map(this.renderWord)}
				</ul>

				<p className="round-results__actions">
					{action}
				</p>
			</div>
		);
	}
});

var GameResults = React.createClass({
	renderTeam: function(key) {
		var team = this.props.teams[key];

		return (
			<li className="game-results__team" key={key}>
				{team.name} — {this.props.countScore(key)}
			</li>
		);
	},
	render: function() {
		return (
			<div className="game-results">
				<h2 className="game-results__title">Game Results</h2>

				<ul className="game-results__list">
					{Object.keys(this.props.teams).map(this.renderTeam)}
				</ul>

				<p className="game-results__actions">
					<button className="game-results__action like-link" onClick={this.props.endGame} type="button">Finish game</button>
				</p>
			</div>
		);
	}
});

var Settings = React.createClass({
	render: function() {
		return (
			<div>
				<h2>Settings</h2>

				<p>
					<button type="button" onClick={this.props.changeRoute.bind(null, 'start')}>Back</button>
				</p>

				<p>
					<label>
						<input className="toggle" onChange={this.props.toggleOption.bind(null, 'showEnglish')} type="checkbox" checked={this.props.showEnglish} />

						Show in English
					</label>
				</p>

				<p>
					<label>
						<input className="toggle" onChange={this.props.toggleOption.bind(null, 'showRussian')} type="checkbox" checked={this.props.showRussian} />

						Show in Russian
					</label>
				</p>

			</div>
		);
	}
});

ReactDOM.render(<App />, document.querySelector('#app'));
