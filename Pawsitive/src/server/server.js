import express from 'express'
import Stripe from 'stripe'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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
