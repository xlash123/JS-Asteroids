const HOST_ID = 'c2e22ce1-e106-45a7-8320-15489f1658cd';
const PEER_ID = uuid.v4();

// List of IDs of active connections to host
const connectionIds = [];

// Attempt a connection with the host
console.log('Creating peer connection...');
const peer = new Peer(PEER_ID);

let hostConnection;

peer.on('open', (id) => {
	console.log('Peer connection opened with id', id);

	hostConnection = peer.connect(HOST_ID);

	hostConnection.on('open', () => {
		console.log('Peer connection established with host');
	});

	hostConnection.on('data', (data) => {
		// Array of game objects
		data.forEach(gameObj => {
			const isNew = gameObj.new;
			const isDead = gameObj.kill;
			const id = gameObj.id;
			switch (gameObj.type) {
				case 'meteor':
					if (isDead) {
						this.meteors = this.meteors.splice(id, 1);
					}
					let meteor;
					if (isNew) {
						meteor = new Meteor(gameObj.path, gameObj.radius, gameObj.rotation, gameObj.xVel, gameObj.yVel);
					}
					meteor.setPosition(gameObj.xPos, gameObj.yPos);
					game.meteors[id] = meteor;
					break;
				case 'ship':
					let ship;
					if (isNew) {
						ship = new Ship(true);
					}
					ship.setPosition(gameObj.x, gameObj.y);
					ship.setVelocity(gameObj.xVel, gameObj.yVel);
					game.ships[id] = ship;
					break;
				case 'bullet':
					let bullet;
					if (isNew) {
						bullet = new Bullet(undefined, gameObj.xPos, gameObj.yPos, gameObj.angle);
					}
					game.bullets[id] = bullet;
					break;
			}
		});
	});

	hostConnection.on('close', () => {
		console.log('Connection with host lost');
		if (shouldBeNewHost()) {
			console.log('I will be the new host');
			becomeHost();
		} else {
			console.log('Looking for new host...');
		}
	});

	hostConnection.on('error', (err) => {
		console.error(err);
		if (shouldBeNewHost()) {
			console.log('I will be the new host');
			becomeHost();
		} else {
			console.log('Looking for new host...');
		}
	});

	console.log('Waiting for host connection...');
	setTimeout(() => {
		if (!hostConnection.open) {
			console.log('Connection timed out. Assuming host responsibility.');
			hostConnection.close();
			becomeHost();
		}
	}, 3000);
});

// If host connection fails, assume responsibility of the host
function becomeHost() {
	const hostPeer = new Peer(HOST_ID);
	const activeConnections = [];

	hostPeer.on('open', (id) => {
		console.log('Host peer started with ID', id);
	})

	hostPeer.on('connection', (dc) => {
		console.log('New connection:', dc.peer);
		activeConnections.push(dc);
		const connIds = activeConnections.map(c => c.peer);
		activeConnections.forEach(conn => {
			conn.send(connIds);
		});

		dc.on('open', () => {
			console.log('data connection opened');
		});

		dc.on('data', (data) => {
			const ship = game.ships.find(s => s.id === data.id);
			if (!ship) {
				console.log('creating new ship');
				game.ships.push(new Ship(true, data.id));
			} else {
				ship.setPosition(data.xPos, data.yPos);
				ship.setVelocity(data.xVel, data.yVel);
				ship.setAngle(data.angle);
			}
		});

		dc.on('close', () => {
			const id = activeConnections.findIndex(c => c.peer === dc.peer);
			activeConnections.splice(id, 1);
		});
	});

	hostPeer.on('disconnected', () => {
		hostPeer.reconnect();
	});

	hostPeer.on('error', (err) => {
		console.error(err);
	});
}

// If the host loses connection, a new host will be decided by one who has the lowest lexicographic id
function shouldBeNewHost() {
	for (let i=0; i<connectionIds.length; i++) {
		if (peer.id > connectionIds[i]) {
			return false;
		}
	}
	return true;
}