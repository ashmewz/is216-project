import express from 'express'
import Stripe from 'stripe'
import cors from 'cors'
import dotenv from 'dotenv'

// Run 'node server/server.js' on a separate powershell to run on 2 servers

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

// NOTE: This is a public testing key, so it's okay to commit.
const STRIPE_SECRET_KEY = "sk_test_51SGctLA4UE4DKmEOkvM87bweMRiQyJNv5IlSXSVeFFAFmLoQqncz0fi0vNbkyoSh1rXmzQU1T4IWwlsgnulTzySu00wiN3zM5n"
const stripe = new Stripe(STRIPE_SECRET_KEY)

app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body
  console.log("💰 Received donation amount:", amount)

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      description: 'Donation via Stripe Embed',
      automatic_payment_methods: { enabled: true },
    })

    res.send({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error(err)
    res.status(500).send({ error: err.message })
  }
})

app.listen(4242, () => console.log('✅ Stripe server running on http://localhost:4242'))
