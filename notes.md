# Running Servers

## Dev Server:
Command: npm run dev
This will set NODE_ENV=development and start the server in watch mode.

## Production Server:
Command: npm run start:prod
This will build the app (via npm run build) and then run it from the dist folder.

## Test Server:
Command: npm run test
This will set NODE_ENV=test and run your tests with Jest.