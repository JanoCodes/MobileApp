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
import { Alert } from 'react-native';
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

    _authenticate = () => {
        ApiServer.authenticate()
            .then(response => {
                if (response) {
                    this.props.navigation.navigate('Main');
                } else {
                    this.setState({
                        authenticated: false,
                    });
                    Alert.alert('Authentication Error', 'You must authenticate before you can use the functionalities of this app.', [
                        { text: 'OK', onPress: () => { this._authenticate() } }
                    ], { cancelable: false });
                }
            })
            .catch(error => {
                this.setState({
                    authenticated: false,
                    error: error,
                });
                Alert.alert('Authentication Error', 'Unable to authenticate with remote server: ' + this.state.error.message, [
                    { text: 'OK', onPress: () => { this._authenticate() } }
                ], { cancelable: false });
            });
    };
}
