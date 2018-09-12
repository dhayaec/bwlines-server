![Logo of the project](./docs/images/logo.sample.png)

# BWLINES server

> Simple book store graphql api

A Graphql server written in Typescript.

## Installing / Getting started

A quick introduction of the minimal setup you need to get up & running.

## Developing

### Built With

- Typescript
- graphql-yoga
- mariadb
- redis
- jest

### Prerequisites

- node > 9
- docker & docker-compose

### Setting up Dev

Here's a brief intro about what a developer must do in order to start developing
the project further:

clone this repo

```shell
git clone https://github.com/dhayaec/bwlines-server.git
cd bwlines-server/
npm install
```

make sure you have installed docker and then run

```shell
docker-compose up -d
```

Run the following command to start server in development mode

```shell
npm run dev
```

server will be started on http://localhost:4000

open http://localhost:4000/playground to access graphql playground

And state what happens step-by-step. If there is any virtual environment, local server or database feeder needed, explain here.

### Building

If your project needs some additional steps for the developer to build the
project after some code changes, state them here. for example:

```shell
./configure
make
make install
```

Here again you should state what actually happens when the code above gets
executed.

### Deploying / Publishing

give instructions on how to build and release a new version
In case there's some step you have to take that publishes this project to a
server, this is the right time to state it.

```shell
packagemanager deploy your-project -s server.com -u username -p password
```

And again you'd need to tell what the previous code actually does.

## Versioning

We can maybe use [SemVer](http://semver.org/) for versioning. For the versions available, see the [link to tags on this repository](/tags).

## Configuration

Here you should write what are all of the configurations a user can enter when
using the project.

## Tests

Describe and show how to run the tests with code examples.
Explain what these tests test and why.

```shell
Give an example
```

## Style guide

Explain your code style and show how to check it.

## Api Reference

If the api is external, link to api documentation. If not describe your api including authentication methods as well as explaining all the endpoints with their required parameters.

## Database

Explaining what database (and version) has been used. Provide download links.
Documents your database design and schemas, relations etc...

## Licensing

State what the license is and how to find the text version of the license.
