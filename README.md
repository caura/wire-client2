# Wire Chat with Guest Access


This is a  modified version of [Wireapp](https://github.com/wireapp/wire) that powers up [wire.caura.co](https://wire.caura.co).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

# Motivation

**Need the power of Wire with the convinience of support tools such as Zopim/Zendesk/Olark**


Wire App for Business is a powerful chat application, with an [end-to-end encrypted](https://medium.com/@wireapp/wire-open-for-business-2c535033cf9a) chat application. The team open sources all client code (server-side code is still not fully open sourced), so we found this to be a good fit for our frontend deployment as a lobby in which we meet our clients.

Unfortunately Wire's activation flow requires people to go through registration. So, in short we identified the following:

<span style="color:green">**\+**</span> great UI experience<br>
<span style="color:green">**\+**</span> extendability for our specific use case with document and code sharing<br>
<span style="color:green">**\+**</span> security - clients know their information is secure<br>
<span style="color:green">**\+**</span> control due to open-source<br>
<span style="color:red">**\-** </span>no sign-in flow for guests<br/>
<span style="color:red">**\-** </span>userbase that poorly overlaps with business users (our customers are not on it)<br>
<span style="color:red">**\-** </span>UI with lots of unnecessary extra features



## Lobby Preview
<img src="https://user-images.githubusercontent.com/1756903/35429575-79c1a7bc-0229-11e8-8797-6a165f592467.png" width="550" />

## Solution

##### Rely on Guest Users and a backend server to issue those logins.
Let users login through company-issued credentials. When users become familiar with the interface--only then suggest them to create a new user.

<img src="https://user-images.githubusercontent.com/1756903/33859081-345b1c5a-de87-11e7-829f-721d563d2cd6.jpg" width="250" />
<img src="https://user-images.githubusercontent.com/1756903/33859082-3471ea3e-de87-11e7-9468-ff62dd007b1a.jpg" width="250" />


## External Dependencies

* Caura's Lease Manager for managing guest credentials *(you would need to build your own)*
* Wire's hosted server (they've not open sourced it entirely)
* Full experience on wire.caura.co also includes a [Caura Bot](https://github.com/caura/wire-bot)

## Known Issues

* It's a fork. It has all the problems of a fork...
* Loading times are slow. This appears to be mostly due to loopbacks with Wire's authentication
* No personalized experience (i.e. alias names for guest users)


### Installation

1. Install [Node.js](https://nodejs.org/)
2. Install [Yarn](https://yarnpkg.com): `npm install -g yarn`
3. Run `yarn`

### Execution

##### On Dev Machine:
Run `yarn start` or `yarn start_dev` and Wire's web app will be available at:
 [localhost:8888/auth/#login](http://localhost:8888/auth/#login)


###### On Prod. Machine:
Run `yarn start_prod` and Wire's web app will be available via dist directory. The server setup (nginx/apache) is not in the build.
