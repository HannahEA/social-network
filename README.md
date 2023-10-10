## Helena To Do ##
Send new group notifications to onlilne & offline group members
db query returns all data from 'Groups' table and sends to f.e. 
to populate the 'Groups' section of groupModal.jsx


## Hannah's fav colour palette: 
https://colorhunt.co/palette/ffeeccffddccffccccfebbcc


# Modularization source by Ricky Adriell: 
https://pace.dev/blog/2018/05/09/how-I-write-http-services-after-eight-years.html

# To create a React app from scratch in the current folder
1. First, to check that node is installed, in VSC terminal type: node -v
2. Then, in VSC terminal type: npx create-react-app .
3. Make a jsx file and in the file type rfc to return a react boiler plate

# Database migration
Article explaining the install commands for golang migrate package: 
https://www.geeksforgeeks.org/how-to-install-golang-migrate-on-ubuntu/

1. Setup the repository to install the migrate package:
curl -s https://packagecloud.io/install/repositories/golang-migrate/migrate/script.deb.sh | sudo bash

2. Update the system:
sudo apt-get update

3. Set up golang-migrate:
sudo apt-get install migrate

4. VSC terminal command to create up/down migration files: 
migrate create -ext sql -dir ./pkg/db/migrations/database create_sessions_table
(e.g. from the root folder in VSC terminal type:
migrate -database sqlite3:///backend/pkg/db/database/database.db -path backend/pkg/db/migrations/database up
)

# How To Run social-network

# to run 'social-network' in Docker:
1. In VSC terminal access 'social-network' root folder and type: 
   sudo docker-compose up
2. When images have been built and the containers are running,
   go to browser url address and type: http//localhost:3000

To exit Docker:
In VSC terminal 
1. type: CTRL + C.
2. type: sudo docker-compose down
3. To remove images type: sudo docker image rm -f $(sudo docker image ls)
4. To view all containers: sudo docker ps -a
5. To remove a container type: 
   sudo docker rm container ID e.g. 637a717eb106

# to run 'social-network' locally type below commands in VSC terminal:

1. In the 'frontend' folder make an '.env' file that contains: REACT_APP_API_URL=http://localhost:8000

2. To install node files and create the package-lock.json and package.json files:
   cd frontend
   npm install react scripts

3. To run the GO back-end server:
   cd backend
   go run server.go

4. To run the React front-end server, in a separate VSC terminal window type:
   cd frontend
   npm start

# VSC commands to merge your branch to master:

1. git checkout master
2. git add . (Necessary if you need to commit changes in your branch first)
3. git commit -m "your comment here"
4. git checkout master
5. git pull
6. git checkout "your branch name here" (Accept or reject the incoming code)
7. git merge master
8. git push
9. Make a pull request in your Github branch

# To delete the back-end server, in VSC terminal run:

1. To print you PID of process bound on e.g. port 8000:
   8000/tcp

2. To kill port 8000:
   fuser -k 8000/tcp


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

This will create a brand new react application in the current folder:

### `npm rm -g create-react-app`
### `npm install -g create-react-app`
### `npx create-react-app`



In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

