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
    fields = ['FirstName', 'LastName', 'Email', 'Uuid', 'CheckedIn', 'CheckedInAt'];
    database = null;

    constructor() {
        this.database = SQLite.openDatabase('local-database');
        return this.database;
    }

    query = (query, variables) => {
        let parent = this;

        return new Promise((resolve, reject) => {
            if (parent.database === null) {
                reject('SQLite database not yet initialised.');
            }

            parent.database.transaction((tx) => {
                tx.executeSql(query, variables, (tx, resultSet) => { resolve(resultSet) }, (tx, error) => { reject(error) })
            }, () => {}, () => {});
        });
    };

    exists = (table) => {
        return this.query('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'?\';', [ table ]);
    };

    createAttendeeTable = () => {
        return this.query('CREATE TABLE attendees (Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, FirstName VARCHAR,' +
            'LastName VARCHAR, Email VARCHAR, Uuid VARCHAR, CheckedIn BOOLEAN, CheckedInAt DATETIME, UpdatedAt TIMESTAMP);', null);
    };

    insertAttendee = (attributes) => {
        let parent = this;
        let fields = [];
        let replacement = [];
        let values = [];

        attributes.forEach((value, index) => {
            if (!this.fields.contains(index)) {
                return;
            }

            fields.push(index);
            replacement.push('?');
            values.push(value);
        });

        return this.query('INSERT INTO attendees (' + fields.join(', ') + ') VALUES (' + replacement.join(', ') + ')');
    };
}
