import Stripe from 'stripe'

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const params = {
        // project specific data add start: //
        submit_type: 'pay',
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        shipping_options: [
          // create on https://dashboard.stripe.com/test/shipping-rates
          { shipping_rate: 'shr_1MDr2aKsYOlWEWgwwjWZad5u' },
          { shipping_rate: 'shr_1MDqW7KsYOlWEWgwL7ywNrUN' },
        ],
        line_items: req.body.map(item => {
          const img = item.image[0].asset._ref
          const newImage = img
            .replace(
              'image-',
              `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_ID}/production/`
            )
            .replace('-webp', '.webp')

          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name,
                images: [newImage],
              },
              unit_amount: item.price * 100,
            },
            adjustable_quantity: {
              enabled: true,
              minimum: 1,
            },
            quantity: item.quantity,
          }
        }),
        // project specific data add finish //
        mode: 'payment',
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}`,
      }

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create(params)

      res.status(200).json(session)
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message)
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

// copied from
// https://stripe.com/docs/checkout/quickstart?client=next
