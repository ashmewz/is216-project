# is216-project
## How to Run
This project is using vue. So have to run it as an npm.

1. cd to `Pawsitive/` directory
2. run `npm install` (only for first time running!)
3. Then run `npm run dev`

Afterwards, you can continue editting and saved changes will auto hot reload in the browser.
Subsequent launches when working on the project you can omit step 2


## Running Stripe server
This project uses a 2nd server (backend) to run the Stripe embedding. We have to run a server using Node.

1. Check if Node & npm are installed on your machine. `node -v` and `npm -v` separately
2. Node modules are required locally too. Run `npm install`
3. In Pawsitive directory, run `node server/server.js` which will run in port 4242 
4. Open another powershell/terminal using '+' and run `npm run dev` to run the frontend site in port 5173

