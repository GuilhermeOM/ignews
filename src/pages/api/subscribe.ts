import { query } from "faunadb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from 'next-auth/react'
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

type User = {
  ref: { id: string };
  data: { stripe_customer_id: string };
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getSession({ req });

    if (session?.user !== undefined) {
      const user = await fauna.query<User>(
        query.Get(
          query.Match(
            query.Index('user_by_email'),
            query.Casefold(session?.user.email as string)
          )
        )
      )

      let customerId = user.data.stripe_customer_id

      if (!customerId) {
        const stripeCustomer = await stripe.customers.create({
          email: session?.user?.email as string,
        })

        await fauna.query(
          query.Update(
            query.Ref(query.Collection('users'), user.ref.id),
            {
              data: {
                stripe_customer_id: stripeCustomer.id
              }
            }
          )
        )

        customerId = stripeCustomer.id;
      }

      const stripeCheckoutSesion = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        line_items: [
          { price: 'price_1LPGejJxU2pWzGgvXJjsCUIf', quantity: 1 }
        ],
        mode: 'subscription',
        allow_promotion_codes: true,
        success_url: process.env.STRIPE_SUCCESS_URL as string,
        cancel_url: process.env.STRIPE_CANCEL_URL as string,
      });

      return res.status(200).json({ sessionId: stripeCheckoutSesion.id });
    }

    return;
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed')
  }
}