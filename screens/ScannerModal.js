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
import { Platform, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Permissions, BarCodeScanner, Icon } from 'expo';
import { SafeAreaView, withNavigation } from 'react-navigation';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import LocalDatabase from '../lib/LocalDatabase';

class ScannerModal extends React.Component {
    static navigationOptions = {
        header: null,
    };

    state = {
        hasCameraPermission: null,
    };

    async componentWillMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    render() {
        const { hasCameraPermission } = this.state;

        return (
            <SafeAreaView style={ styles.container }>
                <BarCodeScanner onBarCodeScanned={ this._handleScanned } style={ styles.fullScreen } />
                <View style={ hasCameraPermission ? styles.infoContainer : styles.errorContainer }>
                    { hasCameraPermission ? (
                        <TouchableOpacity style={ styles.closeButton } onPress={ this._closeScanner }>
                            <Icon.Ionicons
                                name={ Platform.OS === 'ios' ? 'ios-close-circle' : 'md-close-circle' }
                                size={ 40 }
                                style={ styles.closeIcon } />
                        </TouchableOpacity>
                    ) : (
                        <Text style={ styles.errorText }>
                            The app does not have the required permission to access the camera.
                        </Text>
                    ) }
                </View>
            </SafeAreaView>
        )
    }

    _handleScanned = (type, data) => {
        let database = new LocalDatabase();
        database.getAttendeeByUuid(data)
            .then(response => {
                if (response.rows.length === 0) {
                    Alert.alert(
                        'Ticket invalid',
                        'The scanned QR code ' + data + ' was not associated with a valid attendee.',
                        [
                            { text: 'OK' }
                        ],
                        { cancelable: false }
                    );
                    return;
                }

                this.props.navigation.navigate('Attendee', { attendee: response.rows._array[0] })
            }, error => {
                Alert.alert(
                    'Something went wrong',
                    'An error occurred while attempting to validate the ticket scanned.',
                    [
                        { text: 'OK', onPress: () => { parent.props.navigation.navigate('Error') } }
                    ],
                    { cancelable: false }
                );
            });
    };

    _closeScanner = () => {
        this.props.navigation.goBack();
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...ifIphoneX({
            paddingTop: 30,
        }, {
            paddingTop: 15,
        }),
    },
    infoContainer: {
        height: 40,
        width: Layout.window.width,
    },
    errorContainer: {
        height: 40,
        width: Layout.window.width,
        backgroundColor: Colors.errorBackground,
    },
    errorText: {
        color: Colors.errorText,
    },
    closeButton: {
        height: 60,
        width: 50,
        padding: 5,
        marginLeft: 'auto',
    },
    closeIcon: {
        color: 'white',
    },
    fullScreen: {
        position: 'absolute',
        top: 0,
        height: Layout.window.height,
        width: Layout.window.width,
    },
});

export default withNavigation(ScannerModal)
