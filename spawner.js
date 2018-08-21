let respawn = require('respawn');

let monitor = respawn([__dirname + '/dist/main.js'], {
    name: 'worker',
    env: {ENV_VAR: 'test'},
    cwd: '.',
    maxRestarts: -1,
    sleep: 1000,
    kill: 5000,
    fork: false
});

monitor.start();