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
import { withNavigation } from 'react-navigation';
import { Asset, Font, Icon, SplashScreen } from 'expo';
import ApiServer from '../lib/ApiServer';

class LoadingScreen extends React.Component {
    state = {
        isLoadingComplete: false,
    };

    render() {
        return null;
    }

    _loadAppAsync = async () => {
        return Promise.all([
            Asset.loadAsync([
                require('../assets/images/robot-dev.png'),
                require('../assets/images/robot-prod.png'),
            ]),
            Font.loadAsync({
                ...Icon.Ionicons.font,
            }),
            this._loadAuthAsync,
        ]);
    };

    _loadAuthAsync = new Promise((resolve, reject) => {
        SplashScreen.hide();

        ApiServer.isAuthenticated()
            .then(authenticated => {
                SplashScreen.hide();

                if (authenticated) {
                    this.props.navigation.navigate('Main');
                } else {
                    this.props.navigation.navigate('Auth');
                }
            });
    });

    _handleLoadingError = error => {
        console.warn(error);
    };
}

export default withNavigation(LoadingScreen);
