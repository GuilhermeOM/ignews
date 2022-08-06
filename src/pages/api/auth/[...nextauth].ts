import { query } from 'faunadb';

import NextAuth from 'next-auth/next';
import GithubProvider from 'next-auth/providers/github';

import { fauna } from '../../../services/fauna';

export default NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        }),
    ],
    callbacks: {
        async signIn({user}) {
            const { email } = user;

            try {
                await fauna.query (
                    query.If(
                        query.Not(
                            query.Exists(
                                query.Match(
                                    query.Index('user_by_email'),
                                    query.Casefold(email as string)
                                )
                            )
                        ),
                        query.Create(
                            query.Collection('users'), { data: { email } }
                        ),
                        query.Get(
                            query.Match(
                                query.Index('user_by_email'),
                                query.Casefold(email as string)
                            )
                        )
                    )
                );
            } catch {
                return false;
            }

            return true;
        }

    }
})