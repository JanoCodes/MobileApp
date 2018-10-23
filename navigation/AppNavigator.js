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

import { createStackNavigator, createSwitchNavigator } from 'react-navigation';
import LoadingScreen from '../screens/LoadingScreen';
import MainTabNavigator from './MainTabNavigator';
import ErrorScreen from '../screens/ErrorScreen';
import AuthScreen from '../screens/AuthScreen';
import ScannerModal from '../screens/ScannerModal';

const AuthStack = createStackNavigator({ Signin: AuthScreen });

export default createSwitchNavigator({
    Loading: LoadingScreen,
    Auth: AuthStack,
    Main: MainTabNavigator,
    Scanner: ScannerModal,
    Error: ErrorScreen,
}, {
    initialRouteName: 'Loading'
});
