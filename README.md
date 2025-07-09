This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## First Steps

Make sure you have [yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/) installed.

In root folder run

### `yarn` or `npm i`

to get the dependencies.

### `yarn start` or `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Address Autocomplete

Autocomplete feature is setup with Google Places API on dev environment.
API key is intentionally removed from env variables. Contact Mark for the API key or ping `@ashikvarma11`
You'll see error on console as Invalid key while typing on Search component without proper API key.
Styles are added on main.scss under `.search-area`.

## Deployment to AWS

This project is deployed to AWS as a CloudFront distribution.
The cloudformation template can be found in [freshtrak-infrastructure](https://github.com/midohiofoodbank/freshtrak-infrastructure)

```
AWS_PROFILE=<profile> AWS_REGION=us-east-2 ./deploy.sh <env>

```
