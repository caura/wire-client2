# Caura & Co

This is a heavily modified version of [Wireapp](https://github.com/wireapp/wire) that powers up [wire.caura.co](https://wire.caura.co).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

# How to build the open source client

## Build

### Installation

1. Install [Node.js](https://nodejs.org/)
2. Install [Yarn](https://yarnpkg.com): `npm install -g yarn`
3. Run `yarn`

### Execution

#####On Dev Machine:
Run `yarn start` or `yarn start_dev` and Wire's web app will be available at:
 [localhost:8888/auth/#login](http://localhost:8888/auth/#login)
 
 
######On Prod. Machine:
Run `yarn start_prod` and Wire's web app will be available via dist directory. The server setup (nginx/apache) is not in the build.