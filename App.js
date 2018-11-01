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
import { Platform, StatusBar, StyleSheet, View, Text } from 'react-native';
import { SplashScreen, DangerZone } from 'expo';
import { IntlProvider, addLocaleData } from 'react-intl';
import AppNavigator from './navigation/AppNavigator';

export default class App extends React.Component {
    state = {
        lang: 'en',
        messages: null,
    };

    async componentWillMount() {
        let parent = this;
        let languages = DangerZone.Localization.getPreferredLocalesAsync();

        for (let i = 0; i < languages.length; i++) {
            import('./langs/' + languages[i])
                .then(messages => {
                    parent.setState({
                        lang: languages[i],
                        messages: messages,
                    });
                    break;
                }, error => {});
        }
    }

    constructor(props) {
        super(props);
        SplashScreen.preventAutoHide();
    }

    render() {
        return (
            <IntlProvider locale={ this.state.lang } messages={ this.state.messages } textComponent={ Text }>
                <View style={ styles.container }>
                    {Platform.OS === 'ios' && <StatusBar barStyle="default"/>}
                    <AppNavigator/>
                </View>
            </IntlProvider>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
