import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { HttpLink } from '@apollo/client/link/http';

const client = new ApolloClient({
    uri: process.env.API_HTTP_URL,
    link: from([
        setContext((_, context) => ({
            ...context,
            headers: {
                'X-Auth-Key': localStorage.getItem('adminKey'),
            },
        })),
        new HttpLink({
            uri: process.env.API_HTTP_URL,
        }),
    ]),
    cache: new InMemoryCache(),
});

export default client;
