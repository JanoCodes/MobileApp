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
    attendeeFields = ['RemoteId', 'FirstName', 'LastName', 'Email', 'Uuid', 'CheckedIn', 'CheckedInAt'];
    database = null;

    constructor() {
        this.database = SQLite.openDatabase('local-database');
        return this.database;
    }

    initDatabase = async() => {
        let promises = [];

        const [ attendees, revisions ] = await Promise.all([ this.exists('attendees'), this.exists('revisions') ]);

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
            if (parent.database === null) {
                reject('SQLite database not yet initialised.');
            }

            parent.database.transaction(
                (tx) => {
                    tx.executeSql(query, variables, (tx, resultSet) => { resolve(resultSet) }, (tx, error) => { reject(error) })
                },
                () => {},
                error => {
                    console.error('Unable to create SQL transaction: ' + error.message);
                }
            );
        });
    };

    exists = (table) => {
        return this.query('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=?;', [ table ]);
    };

    createAttendeesTable = () => {
        return this.query('CREATE TABLE attendees (Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, RemoteId INTEGER NOT NULL,' +
            'FirstName VARCHAR, LastName VARCHAR, Email VARCHAR, Uuid VARCHAR UNIQUE, CheckedIn BOOLEAN, CheckedInAt DATETIME, ' +
            'UpdatedAt TIMESTAMP);', null);
    };

    createRevisionsTable = () => {
        return this.query('CREATE TABLE revisions (Rid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, CommittedAt DATETIME ' +
            'NOT NULL, Synced BOOLEAN, Content VARCHAR, UpdatedAt TIMESTAMP);');
    };

    insertAttendee = (attributes) => {
        let parent = this;
        let fields = [];
        let replacement = [];
        let values = [];

        attributes.forEach((value, index) => {
            if (!parent.attendeeFields.contains(index)) {
                return;
            }

            fields.push(index);
            replacement.push('?');
            values.push(value);
        });

        return this.query('INSERT INTO attendees (' + fields.join(', ') + ') VALUES (' + replacement.join(', ') + ')');
    };

    getAttendees = () => {
        return this.query('SELECT * FROM attendees');
    };

    getAttendeeByUuid = (uuid) => {
        return this.query('SELECT * FROM attendees WHERE uuid = ? LIMIT 1', [ uuid ]);
    };

    insertRevision = (attributes) => {
        const date = new Date();

        return this.query(
            'INSERT INTO revisions (CommitedAt, Synced, Content) VALUES (?, ?, ?)',
            [
                date.getTime(),
                attributes['synced'],
                JSON.stringify(attributes['content']),
            ]
        );
    };

    getCurrentRevision = () => {
        const date = new Date();

        this.query('SELECT CommitedAt FROM revisions WHERE CommitedAt < ? AND Synced = TRUE ORDER BY CommitedAt DESC ' +
            'LIMIT 1;', [ date.getTime() ])
            .then(results => {
                if (results.rows.length === 0) {
                    return false;
                }

                let resultsArray = results.rows._array;
                return resultsArray[0]['CommitedAt'];
            })
            .catch(error => {
                throw new Error(error.message);
            });
    };

    getUnsyncedRevisions = () => {
        return this.query('SELECT * FROM revisions WHERE Synced = false ORDER BY CommitedAt ASC');
    }
}
