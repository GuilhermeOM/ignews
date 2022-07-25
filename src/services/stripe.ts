import Stripe from "stripe";
import { version } from "../../package.json";

export const stripe = new Stripe(
    process.env.STRIPE_API_KEY,
    {
        appInfo: {
            name: 'Ignews',
            version
        }
    }
)