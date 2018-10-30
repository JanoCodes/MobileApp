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
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, withNavigation } from 'react-navigation';

class AttendeeModal extends React.Component {
    static navigationOptions = {
        title: 'Ticket Details',
    };

    render() {
        const { navigation } = this.props;
        const attendee = navigation.getParam('attendee');

        return (
            <SafeAreaView style={ styles.container }>
                <Text style={ styles.attendeeName }>
                    { attendee['Title'] + ' ' + attendee['FirstName'] + ' ' + attendee['LastName'] }
                </Text>
                <Text style={ styles.attendeeTicket }>{ attendee['Ticket'] }</Text>
            </SafeAreaView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    attendeeName: {
        fontSize: 22,
    },
    attendeeTicket: {
        fontSize: 18,
    },
    attendeeStatus: {
        fontSize: 20,
    }
});

export default withNavigation(AttendeeModal)
