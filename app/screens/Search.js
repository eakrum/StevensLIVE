'use strict';
import React, { Component } from 'react';
import {StyleSheet, Text, TouchableHighlight, ScrollView, ImageBackground,Dimensions, FlatList, ActivityIndicator} from 'react-native';
import { SocialIcon, Icon, Button, Input, List, ListItem } from 'react-native-elements';
import InCallManager from 'react-native-incall-manager';
import {db} from '../../services/firebase'


const logo = require('../../images/one.jpg')

var professor;

var professors = new Array();

const background = require('../../images/one.jpg');


export default class Search extends Component {

    constructor(props){
        super(props)
        this.state = {
            professors: [],
            isLoading: true,
        }
    }

    professorQuery = () => {
        db.collection("users").where("instructor", "==", true)
        .get()
        .then(function(querySnapshot) {
            
            querySnapshot.forEach(function(doc) {
                const {firstName, lastName, email, proPic} = doc.data();
                professors.push({
                    key: doc.id,
                    doc, // DocumentSnapshot
                    firstName,
                    lastName,
                    proPic,
                    email,
                  });
            });
            
            console.log('user data', this.state.professors);
            this.setState({
                professors,
                isLoading: false
            });
            console.log('user data2,', this.state.professors)
        }.bind(this))
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
    }




    componentDidMount() {
        this.professorQuery();
    }
     
      render() {
        if (this.state.isLoading) {
            return <ImageBackground style = {styles.container} source = {background}><ActivityIndicator size="large" color="#FFF" /></ImageBackground>;
          }
        
        return (
           
           
           <List >
           <FlatList
           data={this.state.professors}
           renderItem={({ item }) => (
            <ListItem
              roundAvatar
              title={`${item.firstName} ${item.lastName}`}
              subtitle={item.email}
              avatar={{ uri: item.proPic }}
              containerStyle={{ borderBottomWidth: 0 }}
            />
          )}
        />

         </List>
            
           
        );
    
      }
    
    
    
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },

  container: {
      flex: 1,

  },
  button: {
    //backgroundColor:'#1496BB',
    //borderRadius:15,
    overflow: 'hidden',
    paddingHorizontal: 30,
    

  },

  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    

  },
  backgroundImage1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
 

  titleText: {
    fontSize: 30,
    fontWeight: "bold",
    backgroundColor: 'transparent',
    color: '#F0FFFF',
  }
});

