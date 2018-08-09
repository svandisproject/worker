var respawn = require('respawn');

var monitor = respawn([__dirname + '/dist/main.js'], {
    name: 'worker',
    env: {ENV_VAR: 'test'},
    cwd: '.',
    maxRestarts: -1,
    sleep: 1000,
    kill: 5000,
    fork: true
});

monitor.start();