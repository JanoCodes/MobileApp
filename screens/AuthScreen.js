/*
 * Jano Ticketing System
 * Copyright (C) 2016-2018 Andrew Ying and other contributors.
 *
 * This file is part of Jano Ticketing System.
 *
 * Jano Ticketing System is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License v3.0 as
 * published by the Free Software Foundation. You must preserve all legal
 * notices and author attributions present.
 *
 * Jano Ticketing System is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import { View } from 'react-native';
import { AuthSession, SecureStore } from 'expo';
import ApiServer from '../lib/ApiServer';
import Config from '../constants/ApiServer';

export default class AuthScreen extends React.Component {
    static navigationOptions = {
        title: 'Login',
    };

    state = {
        authenticated: false,
        error: null,
    };

    constructor(props) {
        super(props);
        this._authenticate();
    }

    render() {
        return null;
    }

    _authenticate = async () => {
        let redirectUrl = AuthSession.getRedirectUrl();
        let result = await AuthSession.startAsync({
            authUrl: ApiServer._getServerUrl('/auth')
                .query({
                    client_id: Config.clientId,
                    redirect_uri: redirectUrl,
                })
        });

        switch (result.type) {
            case 'success':
                this.setState({
                    authenticated: true,
                });

                await SecureStore.setItemAsync('auth_token', result.params.token);
                this.props.navigation.navigate('App');
                break;
            case 'error':
                this.setState({
                    authenticated: false,
                    error: result.params.error,
                });
                this.props.navigation.navigate('Error', { error: this.state.error });
                break;
        }
    };
}
