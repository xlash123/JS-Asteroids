const HOST_ID = 'c2e22ce1-e106-45a7-8320-15489f1658cd';
const PEER_ID = uuid.v4();

let isHost = false;

// List of IDs of active connections to host
const connectionIds = [];

// Attempt a connection with the host
console.log('Creating peer connection...');
const peer = new Peer(PEER_ID);

let hostConnection;

peer.on('open', (id) => {
	console.log('Peer connection opened with id', id);

	hostConnection = peer.connect(HOST_ID, { reliable: true });

	hostConnection.on('open', () => {
		console.log('Peer connection established with host');
	});

	hostConnection.on('data', (data) => {
		// Array of game objects
		// This stuff will be stored on the client machine and is sent from the host
		if (data.meteors) {
			data.meteors.forEach(mtr => {
				const id = mtr.id;
				if (mtr.kill) {
					delete game.meteors[id];
				} else {
					let meteor = game.meteors[id];
					if (!meteor) {
						meteor = (game.meteors[id] = new Meteor(paper.Path.importJSON(mtr.path), mtr.radius, mtr.rotation, mtr.xVel, mtr.yVel));
					}
					meteor.setPosition(mtr.xPos, mtr.yPos);
				}
			});
		}
		if (data.bullets) {
			data.bullets.forEach(blt => {
				const id = blt.id;
				if (blt.kill) {
					delete game.bullets[id];
				} else {
					let bullet = game.bullets[id];
					if (!bullet) {
						bullet = (game.bullets[id] = new Bullet(undefined, blt.xPos, blt.yPos, blt.angle));
					}
				}
			});
		}
		if (data.ships) {
			data.ships.forEach(sp => {
				const id = sp.id;
				if (sp.kill) {
					delete game.ships[id];
				} else {
					let ship = game.ships[id];
					if (!ship) {
						ship = (game.ships[id] = new Ship(true));
					}
					ship.setPosition(sp.xPos, sp.yPos);
					ship.setVelocity(sp.xVel, sp.yVel);
					ship.setAngle(sp.angle);
				}
			});
		}
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

let hostPeer;
const activeConnections = [];

// If host connection fails, assume responsibility of the host
function becomeHost() {
	hostPeer = new Peer(HOST_ID);

	hostPeer.on('open', (id) => {
		console.log('Host peer started with ID', id);
		isHost = true;
	})

	hostPeer.on('connection', (dc) => {
		console.log('New connection:', dc.peer);
		activeConnections.push(dc);
		console.log('Total connections:', activeConnections.length);
		const connIds = activeConnections.map(c => c.peer);
		activeConnections.forEach(conn => {
			conn.send(connIds);
		});

		dc.on('open', () => {
			console.log('data connection opened');
		});

		dc.on('data', (data) => {
			const id = data.id;
			const ship = game.ships[id];
			if (!ship) {
				console.log('creating new ship');
				game.ships[id] = new Ship(true);
			} else {
				ship.setPosition(data.xPos, data.yPos);
				ship.setVelocity(data.xVel, data.yVel);
				ship.setAngle(data.angle);
				if (data.shoot) ship.shootBullet();
			}
		});

		dc.on('close', () => {
			console.log('Connection lost with', dc.peer);
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