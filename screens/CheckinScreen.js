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
import { View, StyleSheet, NetInfo, Button, Text, Alert, Platform } from 'react-native';
import { SafeAreaView, withNavigation } from 'react-navigation';
import Colors from '../constants/Colors';
import LocalDatabase from '../lib/LocalDatabase';
import AttendeesList from '../components/AttendeesList';
import { Icon } from 'expo';

class CheckinScreen extends React.Component {
    static navigationOptions = {
        title: 'Guest Check-in',
    };

    database = null;

    state = {
        network: null,
    };

    componentWillMount() {
        const parent = this;

        let database = new LocalDatabase();
        database.initDatabase()
            .then(() => {
                console.log('Successfully connected to local database.');
            }, error => {
                console.error('Unable to set up local database: ' + error.message);

                Alert.alert('Application Error', 'Failed to set up local database.', [
                    { text: 'OK', onPress: () => { parent.props.navigation.navigate('Error') } }
                ], { cancelable: false });
            });
        NetInfo.addEventListener('connectionChange', connection => {
            console.log('Detected network change. New connection type: ' + connection.type);
            this.setState({
                network: connection.type,
            });
        });
    }

    render() {
        return (
            <SafeAreaView style={ styles.container }>
                { this.state.network === 'none' && (
                    <View style={ styles.offlineContainer }>
                        <Icon.Ionicons
                            name="error"
                            size={ 40 }
                            style={ styles.offlineIcon }
                        />
                        <Text style={ styles.offlineText }>
                            The device is currently offline. Any new attendees will not show up until the device can
                            connect to the internet.
                        </Text>
                    </View>
                ) }
                <Button style={ styles.scanButton } onPress={ this._openScanner } title="Scan Ticket" />
                <AttendeesList />
            </SafeAreaView>
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
    offlineContainer: {
        padding: 15,
        backgroundColor: Colors.errorBackground
    },
    offlineIcon: {
        color: Colors.errorText,
    },
    offlineText: {
        fontSize: 14,
        color: Colors.errorText,
    },
    scanButton: {
        height: 60,
    }
});

export default withNavigation(CheckinScreen)
