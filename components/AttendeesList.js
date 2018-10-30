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
import {
    Platform,
    View,
    FlatList,
    StyleSheet,
    Text,
    TouchableHighlight,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { Icon } from 'expo';
import Layout from '../constants/Layout';
import ApiServer from '../lib/ApiServer';
import LocalDatabase from '../lib/LocalDatabase';
import ProgressBar from './ProgressBar';

class AttendeesList extends React.Component {
    state = {
        isLoading: true,
        attendees: [],
        progress: 0,
    };

    componentWillMount() {
        this._syncAttendees()
            .then(() => {
                console.log('Attendees list is ready.');
            })
    }

    async _syncAttendees() {
        let parent = this;
        let database = new LocalDatabase();

        let status = await ApiServer.syncAttendees(database, progress => this.setState({ progress: progress }))
            .catch(error => {
                console.error('Unable to retrieve new attendees from remote server: ' + error.message);
            });
        if (status) {
            console.log('Successfully synchronised list of attendees with remote server.')
        }

        let results = await database.getAttendees()
            .catch(error => {
                parent.props.navigation.navigate('Error', { error: 'Unable to fetch attendees from local database.' });
            });
        if (results) {
            this.setState({
                isLoading: false,
                attendees: results.rows._array,
            });
        }
    }

    _onPressAttendee(attendee) {
        this.props.navigation.navigate('Attendee', { attendee: attendee });
    }

    render() {
        return (
            <View style={ styles.container }>
                { this.state.isLoading ? (
                    <View style={ styles.loadingContainer }>
                        <Icon.Ionicons
                            name={Platform.OS === 'ios' ? 'ios-cloud-download' : 'md-cloud-download'}
                            size={ 40 }
                            style={ styles.loadingIcon }
                        />
                        <Text style={ styles.loadingText }>Loading...</Text>
                        <View style={ styles.loadingBar }>
                            <ProgressBar progress={ this.state.progress }/>
                        </View>
                    </View>
                ) : (
                    <View>
                        <View style={ styles.searchContainer }>
                            <Icon.Ionicons
                                name={Platform.OS === 'ios' ? 'ios-search' : 'md-search'}
                                size={ 20 }
                            />
                        </View>
                        <FlatList
                            ItemSeparatorComponent={ Platform.OS !== 'android' && (({ highlighted }) => (
                                <View style={[ styles.attendeeSeparator, highlighted && { marginLeft: 0 } ]} />
                            ))}
                            data={ this.state.attendees }
                            keyExtractor={ (item, index) => { return item['Uuid'] } }
                            renderItem={ ({item}) => (
                                <TouchableHighlight
                                    style={ styles.attendeeContainer }
                                    onPress={ this._onPressAttendee.bind(this, item) }
                                >
                                    <View>
                                        <Text style={ styles.attendeeName }>
                                            { item['Title'] + ' ' + item['FirstName'] + ' ' + item['LastName'] }
                                        </Text>
                                        <Text style={ styles.attendeeTicket }>{ item['Ticket'] }</Text>
                                    </View>
                                </TouchableHighlight>
                            ) }
                        />
                    </View>
                )}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 5,
        borderTopWidth: .7,
        borderColor: 'rgba(96,100,109, .7)',
        backgroundColor: '#fff',
    },
    contentContainer: {
        paddingTop: 30,
    },
    loadingContainer: {
        paddingTop: 30,
        alignItems: 'center',
    },
    loadingIcon: {
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingBottom: 5,
    },
    loadingText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        textAlign: 'center',
    },
    loadingBar: {
        width: Layout.window.width / 2,
        marginTop: 30,
        marginHorizontal: 'auto',
    },
    searchContainer: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: .7,
        borderBottomColor: 'rgba(96,100,109, .3)',
    },
    attendeeContainer: {
        position: 'relative',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    attendeeName: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    attendeeTicket: {
        fontSize: 13,
    },
    attendeeSeparator: {
        borderTopWidth: .7,
        borderTopColor: 'rgba(96,100,109, .3)',
    }
});

export default withNavigation(AttendeesList);
