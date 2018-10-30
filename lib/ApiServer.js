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

import URI from 'urijs';
import Config from '../constants/ApiServer';
import { AuthSession, SecureStore } from 'expo';

export default class ApiServer {
    static _getServerBaseUrl() {
        return Config.url + '/v/' + Config.version.major + '/' + Config.version.minor;
    }

    static _getServerUrl(uri) {
        return URI(ApiServer._getServerBaseUrl() + uri);
    }

    static async isAuthenticated() {
        let access_token = await SecureStore.getItemAsync('access_token');

        return access_token !== null;
    }

    static async authenticate() {
        let redirectUrl = AuthSession.getRedirectUrl();

        let result = await AuthSession.startAsync({
                authUrl: ApiServer._getServerUrl('/authorize')
                    .query({ client_id: Config.clientId, redirect_uri: redirectUrl, response_type: 'token', scope: 'attendees-index attendees-update' })
                    .toString()
            }).catch((error) => {
                console.error(error);
                throw new Error(error.message);
            });

        switch (result.type) {
            case 'error':
                throw new Error(result.params.error);
            case 'dismissed':
                return false;
            default:
                console.log('Successfully authenticated with remote server.');

                await SecureStore.setItemAsync('access_token', result.params.access_token);
                return true;
        }
    }

    static async syncAttendees(database, callback) {
        let revision = await database.getCurrentRevision();
        console.log('Latest local revision was ' + revision + '. Querying remote server...');

        let authorised = await ApiServer.isAuthenticated();

        if (!authorised) {
            return false;
        }

        const access_token = await SecureStore.getItemAsync('access_token');

        let response = await fetch(
            ApiServer._getServerUrl('/attendees').query({ updated_at: revision }),
            {
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + access_token,
                },
            }
        ).catch(error => {
            throw new Error(error.message);
        });

        let attendees = await response.json();
        console.log(attendees);
        const count = attendees.length;
        console.log('Received ' + count + ' new attendee entries from remote server.');

        attendees.map(async (attendee, index) => {
            await database.insertAttendee(attendee)
                .catch(error => { throw new Error(error.message) });
            callback((index + 1)/count);
        });

        await database.insertRevision({
            synced: 1,
            content: [],
        });

        return true;
    }
}
