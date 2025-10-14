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

All these needs to be run in the Pawsitive directory (so make sure you are in that folder, else cd to `Pawsitive/` directory)
1. Check if Node & npm are installed on your machine. `node -v` and `npm -v` separately
2. Node modules are required locally too. Run `npm install`
3. In Pawsitive directory, run `node server/server.js` which will run in port 4242 
4. Open another powershell/terminal using '+' and run `npm run dev` to run the frontend site in port 5173

In the donations page, select the donation amount, then "Continue".
Your 2nd server would have a log something like: `💰 Received donation amount: 12`

Testing card numbers can be found from this stripe documentation: `https://docs.stripe.com/testing`
Card number: 4242 4242 4242 4242
Card expiry: 12/34
Card CVC: 567

Upon "Donate Now" success, you will currently be directed to a blank page, with the following browser path pattern:
`http://localhost:5173/donate/success?payment_intent=pi_3SI1WnA4UE4DKmEO0KHD04IZ&payment_intent_client_secret=pi_3SI1WnA4UE4DKmEO0KHD04IZ_secret_g26E0UQS8m7bJ1aUh70EQcleP&redirect_status=succeeded`
In future this should redirect back to some other page. But this has yet to be implemented. (CAA 14 Oct 2025)
