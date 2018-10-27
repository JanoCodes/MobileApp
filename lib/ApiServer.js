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

import URL from 'urijs';
import Config from '../constants/ApiServer';
import { AuthSession, SecureStore } from 'expo';

export default class ApiServer {
    static _getServerBaseUrl() {
        return Config.url + '/v/' + Config.version.major + '/' + Config.version.minor;
    }

    static _getServerUrl(uri) {
        return URL(ApiServer._getServerBaseUrl + uri);
    }

    static async isAuthenticated() {
        let [ access_token, refresh_token, expires ] = Promise.all([
            SecureStore.getItemAsync('access_token'),
            SecureStore.getItemAsync('refresh_token'),
            SecureStore.getItemAsync('expires')
        ]);

        if (access_token === null) {
            return false;
        }

        if (refresh_token === null && expires === null) {
            console.error('Access token is present but validity cannot be determined. Removing token.');
            await SecureStore.deleteItemAsync('access_token');

            return false;
        } else if (expires < Math.round((new Date()).getTime() / 1000)) {
            if (refresh_token === null) {
                console.log('Access token has expired.');

                await Promise.all([
                    SecureStore.deleteItemAsync('access_token'),
                    SecureStore.deleteItemAsync('expires'),
                ]);

                return false;
            }

            let formData = new FormData();
            formData.append('grant_type', 'refresh_token');
            formData.append('client_id', Config.clientId);
            formData.append('refresh_token', refresh_token);

            fetch(ApiServer._getServerUrl('/token'), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            })
                .then(response => response.json())
                .then(response => {
                    const ts = Math.round((new Date()).getTime() / 1000);

                    Promise.all([
                        SecureStore.setItemAsync('access_token', response.access_token),
                        SecureStore.setItemAsync('expires', ts + parseInt(response.expires_in, 10))
                    ])
                        .then(() => {
                            return true;
                        })
                        .catch(error => {
                            throw new Error(error.message);
                        })
                })
                .catch(error => {
                    if (error.status === 401) {
                        Promise.all([
                            SecureStore.deleteItemAsync('access_token'),
                            SecureStore.deleteItemAsync('refresh_token'),
                            SecureStore.deleteItemAsync('expires'),
                        ]).then(() => {
                            return false;
                        });
                    } else {
                        throw new Error(error.body);
                    }
                });
        }
    }

    static async authenticate() {
        let redirectUrl = AuthSession.getRedirectUrl();

        let result = await AuthSession.startAsync({
                authUrl: ApiServer._getServerUrl('/authorize')
                    .query({ client_id: Config.clientId, redirect_uri: redirectUrl, response_type: 'code' })
            }).catch((error) => {
                throw new Error(error.message);
            });

        switch (result.type) {
            case 'error':
                throw new Error(result.params.error);
            case 'dismissed':
                return false;
            default:
                break;
        }

        let formData = new FormData();
        formData.append('grant_type', 'authorization_code');
        formData.append('client_id', Config.clientId);
        formData.append('redirect_uri', redirectUrl);
        formData.append('code', result.params.code);

        fetch(ApiServer._getServerUrl('/token'), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        })
            .then(response => response.json())
            .then(response => {
                const ts = Math.round((new Date()).getTime() / 1000);

                Promise.all([
                    SecureStore.setItemAsync('access_token', response.access_token),
                    SecureStore.setItemAsync('refresh_token', response.refresh_token),
                    SecureStore.setItemAsync('expires', ts + parseInt(response.expires_in, 10))
                ])
                    .then(() => {
                        return true;
                    })
                    .catch(error => {
                        throw new Error(error.message);
                    })
            })
            .catch(error => {
                if (error.status === 401) {
                    return false;
                } else {
                    throw new Error(error.body);
                }
            });
    }

    static async syncAttendees(database) {
        let revision = database.getCurrentRevision();
        let authorised = await ApiServer.isAuthenticated();

        if (!authorised) {
            return false;
        }

        let access_token = await SecureStore.getItemAsync('access_token');

        fetch(
            ApiServer._getServerUrl('/attendees')
                .query({ revision: revision }),
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + access_token,
                },
            }
        )
            .then(response => response.json)
            .then(response => {
                response.attendees.forEach(attendee => {
                    database.insertAttendee(attendee);
                });

                database.insertRevision({
                    sync: true,
                    content: '',
                });

                return true;
            })
            .catch(error => {
                throw new Error(error.message);
            });
    }
}
