import Stripe from "stripe";
import { version } from "../../package.json";

const key =
  process.env.STRIPE_API_KEY !== undefined ? process.env.STRIPE_API_KEY : "";

export const stripe = new Stripe(key, {
  apiVersion: "2020-08-27",
  appInfo: {
    name: "Ignews",
    version,
  },
});
