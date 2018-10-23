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
import { Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Permissions, BarCodeScanner, Icon } from 'expo';
import { withNavigation } from 'react-navigation';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import ApiServer from '../lib/ApiServer';

class ScannerModal extends React.Component {
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
            <View style={ styles.container }>
                <View style={ hasCameraPermission ? styles.infoContainer : styles.errorContainer }>
                    { hasCameraPermission ? (
                        <TouchableOpacity style={ styles.closeButton } onPress={ this._closeScanner }>
                            <Icon.Ionicons
                                name={ Platform.OS === 'ios' ? 'ios-close-circle' : 'md-close-circle' }
                                size={ 30 } />
                        </TouchableOpacity>
                    ) : (
                        <Text style={ styles.errorText }>
                            The app does not have the required permission to access the camera.
                        </Text>
                    ) }
                </View>
                <BarCodeScanner onBarCodeScanned={ this._handleScanned } style={ styles.fullScreen } />
            </View>
        )
    }

    _handleScanned = (type, data) => {
        fetch(ApiServer._getServerUrl('attendee/' . data), {
            headers: {
                Accept: 'application/json',
            },
        });
    };

    _closeScanner = () => {
        this.props.navigation.navigate('Main');
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#fff',
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
        height: 40,
        width: 40,
        paddingTop: 5,
        paddingBottom: 5,
        marginLeft: 'auto',
    },
    fullScreen: {
        height: Layout.window.height - 40,
        width: Layout.window.width,
    },
});

export default withNavigation(ScannerModal)
