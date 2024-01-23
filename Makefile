install:
		npx ci

lint:
		npx eslint .

webpack:
		npx webpack server

build:
		rm -rf dist
		NODE_ENV=production npx webpack 