# worker-app

## Description

data mining app

## Installation

```bash
$ npm install
```

## Running the app

```bash
# register worker 
$ npm run start -- --register=YOUR_SECRET

# run worker
$ npm run start

# register and run worker
npm run start -- --register=YOUR_SECRET --start=true
```

## Running with pm (graceful start)

```bash
npm install -g pm2
cd ./project-root
npm run prestart:prod
pm2 start ./dist/main.js --wait-ready

```