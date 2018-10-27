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
import { View, StyleSheet, Button, Alert } from 'react-native';
import { withNavigation } from 'react-navigation';
import LocalDatabase from '../lib/LocalDatabase';

class CheckinScreen extends React.Component {
    database = null;

    static navigationOptions = {
        title: 'Guest Check-in',
    };

    componentWillMount() {
        const parent = this;

        this.database = new LocalDatabase();
        this.database.initDatabase()
            .error(() => {
                Alert.alert('Application Error', 'Failed to set up local database.', [
                    { text: 'OK', onPress: () => { parent.props.navigation.navigate('Error') } }
                ], { cancelable: false });
            });
    }

    render() {
        return (
            <View style={ styles.container }>
                <Button onPress={ this._openScanner } title="Scan Ticket" />
            </View>
        );
    }

    _openScanner = () => {
        this.props.navigation.navigate('Scanner');
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#fff',
    },
});

export default withNavigation(CheckinScreen)
