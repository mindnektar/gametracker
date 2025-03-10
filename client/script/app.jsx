import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { ApolloProvider } from '@apollo/client';
import { Router } from 'react-router-dom';
import 'polyfills';
import history from 'browserHistory';
import apolloClient from 'apolloClient';
import App from 'components/App';
import '../style/app.sass';

moment.locale('de');

const render = (AppComponent) => {
    ReactDOM.render(
        <ApolloProvider client={apolloClient}>
            <Router history={history}>
                <AppComponent />
            </Router>
        </ApolloProvider>,
        document.getElementById('app'),
    );
};

render(App);

if (module.hot) {
    module.hot.accept();
}
