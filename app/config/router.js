'use strict';
import React, { Component } from 'react';
import { Icon, } from 'react-native-elements';
import { StackNavigator, TabNavigator, NavigationActions } from 'react-navigation';
import Login from '../screens/Welcome/Login'
import ClassStream from '../screens/ClassStream';
import ClassList from '../screens/ClassList';
import Register from '../screens/Welcome/Register';
import Me from '../screens/Me';
import Name from '../screens/Welcome/Name';
import Settings from '../screens/Settings';
import Search from '../screens/Search';
import ProfessorDetails from '../screens/ProfessorDetails';

export const WelcomeStack = StackNavigator({
    Login: {
        screen: Login,
        navigationOptions: {
            //gesturesEnabled: false,
            header: null
            
        }
    },
  
    Register: {
      screen: Register,
      navigationOptions: {
          //gesturesEnabled: false,
          header: null
          
      }
  },
  Name: {
    screen: Name,
    navigationOptions: {
        //gesturesEnabled: false,
        header: null
        
    }
},

})
export const ClassSelection = StackNavigator({
  ClassList: {
    screen: ClassList,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name="user" size={25} type = 'feather' color={tintColor} />, 
      header: null
      }
     
  },
  ClassStream: {
    screen: ClassStream,
    navigationOptions: {
      header: null,
      tabBarVisible: false 
    },
  },

},
{
  mode: 'modal'

});


export const SearchStack = StackNavigator({
  Search: {
      screen: Search,
      navigationOptions: {
          //gesturesEnabled: false,
          header: null
          
      }
  },

  ProfessorDetails: {
    screen: ProfessorDetails,
    navigationOptions: {
        //gesturesEnabled: false,
        header: null
        
    }
},

})

export const Profile = StackNavigator({
  Me: {
    screen: Me,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name="user" size={25} type = 'feather' color={tintColor} />, 
      header: null
      }
     
  },
  Settings: {
    screen: Settings,
    navigationOptions: {
      title: 'Settings',
      headerStyle: {
        backgroundColor: '#3BA9FF',
        height: 35,

      },
      headerTitleStyle: {
        fontWeight: 'bold',                                                                                   
        color: '#FFF'

      }
      
    },
  },

},
{
  mode: 'modal'

});

export const Tabs = TabNavigator({
 

  ClassSelection: {
      screen: ClassSelection,
      navigationOptions: {
          title: 'Class Selection',
          //gesturesEnabled: false,
          header: null,
          //gesturesEnabled: false
          tabBarIcon: ({ tintColor }) => <Icon name="home" type = 'feather' size={25} color={tintColor} />,
      }
  },

  SearchStack: {
    screen: SearchStack,
    navigationOptions: {
        title: 'Search Professors',
        //gesturesEnabled: false,
        header: null,
        //gesturesEnabled: false
        tabBarIcon: ({ tintColor }) => <Icon name="search" type = 'feather' size={25} color={tintColor} />,
    }
},

  Profile: {
    screen: Profile,
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => <Icon name="user" size={25} type = 'feather' color={tintColor} />, 
      header: null
      }
     
  }
 
},
{
  tabBarOptions:{
    activeTintColor: "#3BA9FF",
    inactiveTintColor: '#FFF',
    style: {
      backgroundColor: '#43474f'
    },
    showLabel: false
  }
});



export const Root = StackNavigator({
    Welcome: {
      screen: WelcomeStack
    },
    Tabs: {
      screen: Tabs,
      
    },
  },
{
  headerMode: 'none',
});