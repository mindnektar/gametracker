import React from 'react';
import { createRoot } from 'react-dom/client';
import moment from 'moment';
import { ApolloProvider } from '@apollo/client';
import { Router } from 'react-router-dom';
import 'polyfills';
import history from 'browserHistory';
import apolloClient from 'apolloClient';
import LocalStorageProvider from 'components/LocalStorageProvider';
import App from 'components/App';
import '../style/app.sass';

moment.locale('de');

const container = document.getElementById('app');
const root = createRoot(container);

const render = (AppComponent) => {
    root.render(
        <ApolloProvider client={apolloClient}>
            <Router history={history}>
                <LocalStorageProvider>
                    <AppComponent />
                </LocalStorageProvider>
            </Router>
        </ApolloProvider>
    );
};

render(App);

if (module.hot) {
    module.hot.accept();
}
