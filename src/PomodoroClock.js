class PomodoroClock {
	constructor(
		sessionLengthInMinutes,
		breakLengthInMinutes,
		noOfSessions = 1,
		renderFn = console.log // eslint-disable-line no-console
	) {
		this.sessionLengthInSeconds = sessionLengthInMinutes * 60;
		this.breakLengthInSeconds = breakLengthInMinutes * 60;
		this.noOfSessions = noOfSessions;

		this.initialState = {
			sessionInProgress: false,
			breakInProgress: false,
			elapsedProgressInSeconds: 0,
			elapsedSessions: 0,
			pause: false,
		};
		this.state = this.initialState;

		this.setState = (state) => {
			this.state = Object.assign({}, this.state, state);
			renderFn(this.state);
		};

		this.timer = null;

		this.updateElapsedTime = (
			startTime,
			stateProperty,
			totalLengthInSeconds,
			progressInSeconds
		) => {
			const elapsedProgressInSeconds = (
				progressInSeconds && (progressInSeconds + ((Date.now() - startTime) / 1000))
			) || (Date.now() - startTime) / 1000;
			const inProgress = elapsedProgressInSeconds < totalLengthInSeconds;
			if (!this.state.pause) {
				if (inProgress) {
					this.setState({
						elapsedProgressInSeconds,
						[stateProperty]: true
					});
					this.timer = setTimeout(
						() => this.updateElapsedTime(
							startTime,
							stateProperty,
							totalLengthInSeconds,
							progressInSeconds
						),
						100
					);
				} else {
					this.setState({
						elapsedProgressInSeconds: 0,
						[stateProperty]: false,
						elapsedSessions: stateProperty === 'breakInProgress'
							? this.state.elapsedSessions + 1
							: this.state.elapsedSessions
					});
					stateProperty === 'breakInProgress'
						? (this.canStartAnotherSession() && this.startSession())
						: this.startBreak();
				}
			}
		};

		this.startSession = (progressInSeconds) => {
			const startTime = Date.now();
			this.setState({
				sessionInProgress: true
			});
			setTimeout(
				() => this.updateElapsedTime(
					startTime,
					'sessionInProgress',
					this.sessionLengthInSeconds,
					progressInSeconds
				),
				100
			);
			// this.playSessionEndAudio();
		};

		this.startBreak = (progressInSeconds) => {
			const startTime = Date.now();
			this.setState({
				breakInProgress: true
			});
			setTimeout(
				() => this.updateElapsedTime(
					startTime,
					'breakInProgress',
					this.breakLengthInSeconds,
					progressInSeconds
				),
				100
			);
			// this.playBreakEndAudio();
		};

		this.pause = () => this.setState({ pause: true });
		this.resume = () => {
			this.setState({ pause: false });
			if (this.state.sessionInProgress) {
				this.startSession(this.state.elapsedProgressInSeconds, Date.now());
			} else if (this.state.breakInProgress) {
				this.startBreak(this.state.elapsedProgressInSeconds, Date.now());
			}
		};
		this.reset = () => {
			clearTimeout(this.timer);
			this.setState(this.initialState);
		};
		this.canStartAnotherSession = () => this.state.elapsedSessions < this.noOfSessions;
	}
}

module.exports = PomodoroClock;
