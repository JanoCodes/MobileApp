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

import { SQLite } from 'expo';

export default class LocalDatabase {
    attendeeFields = {
        id:' RemoteId',
        title: 'Title',
        first_name: 'FirstName',
        last_name: 'LastName',
        email: 'Email',
        uuid: 'Uuid',
        checked_in: 'CheckedIn',
        checked_in_at: 'CheckedInAt'
    };
    database = null;

    constructor() {
        this.database = SQLite.openDatabase('local-database');

        return this;
    }

    initDatabase = async () => {
        let promises = [];

        let [ attendees, revisions ] = await Promise.all([ this.exists('attendees'), this.exists('revisions') ])
            .catch(error => {
                throw new Error(error.message);
            });

        if (!attendees) {
            promises.push(this.createAttendeesTable());
        }
        if (!revisions) {
            promises.push(this.createRevisionsTable());
        }

        return Promise.all(promises);
    };

    query = (query, variables) => {
        let parent = this;

        return new Promise((resolve, reject) => {
            let results = null;

            if (parent.database === null) {
                reject('SQLite database not yet initialised.');
            }

            parent.database.transaction(
                tx => {
                    tx.executeSql(
                        query,
                        variables,
                        (tx, resultSet) => { results = resultSet },
                        (tx, error) => {}
                    )
                },
                error => {
                    console.error('Unable to execute SQL transaction. ' + error.message);
                    reject(error);
                },
                () => {
                    resolve(results);
                }
            );
        });
    };

    exists = async (table) => {
        let response = await this.query('SELECT name FROM sqlite_master WHERE type = \'table\' AND name = ?;', [ table ])
            .catch(error => {
                throw new Error(error.message);
            });

        return response.rows.length > 0;
    };

    createAttendeesTable = async () => {
        return this.query('CREATE TABLE attendees (Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, RemoteId INTEGER UNIQUE NOT NULL,' +
            'Title VARCHAR, FirstName VARCHAR, LastName VARCHAR, Email VARCHAR, Uuid VARCHAR UNIQUE NOT NULL, Ticket VARCHAR, ' +
            'CheckedIn BOOLEAN, CheckedInAt DATETIME, UpdatedAt TIMESTAMP);');
    };

    createRevisionsTable = async () => {
        return this.query('CREATE TABLE revisions (Rid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, CommittedAt INTEGER ' +
            'NOT NULL, Synced BOOLEAN, Content VARCHAR, UpdatedAt TIMESTAMP);');
    };

    insertAttendee = async (attendee) => {
        console.debug('Inserting new attendee entry into database: ' + JSON.stringify(attendee));

        let parent = this;
        let fields = [];
        let replacement = [];
        let values = [];

        Object.keys(attendee).map(key => {
            if (key === 'ticket') {
                fields.push('Ticket');
                replacement.push('?');
                values.push(attendee.ticket.name);
            }

            if (!parent.attendeeFields.hasOwnProperty(key)) {
                return;
            }

            fields.push(parent.attendeeFields[key]);
            replacement.push('?');
            values.push(attendee[key]);
        });

        return this.query(
            'INSERT INTO attendees (' + fields.join(', ') + ') VALUES (' + replacement.join(', ') + ');',
            values
        );
    };

    getAttendees = async () => {
        return this.query('SELECT * FROM attendees;');
    };

    getAttendeeByUuid = async (uuid) => {
        return this.query('SELECT * FROM attendees WHERE Uuid = ? LIMIT 1;', [ uuid ]);
    };

    searchAttendees = async (search) => {
        return this.query(
            'SELECT * FROM attendees WHERE (FirstName LIKE \'%\' || ? || \'%\') OR (LastName LIKE \'%\' || ? || \'%\') OR '
                + '(Email LIKE \'%\' || ? || \'%\');',
            [ search, search, search ]
        );
    };

    updateAttendee = async (id, attributes) => {
        let parent = this;
        let fields = [];
        let values = [];

        Object.keys(attributes).map(key => {
            if (!parent.attendeeFields.hasOwnProperty(key)) {
                return;
            }

            fields.push(parent.attendeeFields[key]);
            values.push(attributes[key]);
        });

        let update = '';
        for (let i = 0; i < fields.length; i++) {
            update += fields[i] + ' = ?';

            if (i !== (fields.length - 1)) {
                update += ', ';
            }
        }

        values.push(id);

        return this.query(
            'UPDATE attendees SET ' + update + ' WHERE RemoteId = ?;',
            values
        );
    };

    insertRevision = (attributes) => {
        const date = new Date();

        return this.query(
            'INSERT INTO revisions (CommittedAt, Synced, Content) VALUES (?, ?, ?);',
            [
                date.getTime(),
                attributes['synced'],
                JSON.stringify(attributes['content']),
            ]
        );
    };

    getCurrentRevision = async () => {
        let results = await this.query('SELECT CommittedAt FROM revisions WHERE Synced = 1 ORDER BY CommittedAt DESC LIMIT 1;')
            .catch(error => {
                throw new Error(error.message);
            });

        if (!results || results.rows.length === 0) {
            return false;
        }

        let resultsArray = results.rows._array;
        return new Date(resultsArray[0]['CommittedAt']).toUTCString();
    };

    getUnsyncedRevisions = async () => {
        return this.query('SELECT * FROM revisions WHERE Synced = false ORDER BY CommittedAt ASC;');
    }
}
