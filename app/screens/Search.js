'use strict';
import React, { Component } from 'react';
import {View, StyleSheet, Text, TouchableHighlight, ScrollView, ImageBackground,Dimensions, FlatList, ActivityIndicator} from 'react-native';
import { SocialIcon, Icon, Button, Input, List, ListItem, SearchBar } from 'react-native-elements';
import InCallManager from 'react-native-incall-manager';
import {db} from '../../services/firebase'


const logo = require('../../images/one.jpg')

var profUID;
var professors = new Array();

const background = require('../../images/one.jpg');


export default class Search extends Component {

    constructor(props){
        super(props)
        this.state = {
            professors: [],
            profID: '8FYUwEjDQOUHBG1iJ4tgHmkPsJE3',
            isLoading: true,
        }

        this.setState = this.setState.bind(this);
        
    }

    //Query specific users to render in list
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
            
            this.setState({
                professors,
                isLoading: false
            });
        }.bind(this))

        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
    }

    //Continue to professor detail
    professorDetail = () => {
        this.props.navigation.navigate('ProfessorDetails', {
            profID: profUID});
    }



    //FLATLIST STYLING - ADDING SOME COMPONENTS
    renderSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              width: "86%",
              backgroundColor: "#CED0CE",
              marginLeft: "14%"
            }}
          />
        );
      };
    
      renderHeader = () => {
        return <SearchBar placeholder="Search Professor.." lightTheme round />;
      };
    
      renderFooter = () => {
        if (!this.state.loading) return null;
    
        return (
          <View
            style={{
              paddingVertical: 20,
              borderTopWidth: 1,
              borderColor: "#CED0CE"
            }}
          >
            <ActivityIndicator animating size="large" />
          </View>
        );
      };
    




    componentDidMount() {
        this.professorQuery();
    }
     
      render() {

        if (this.state.isLoading) {
            return <ImageBackground style = {styles.container} source = {background}><ActivityIndicator size="large" color="#FFF" /></ImageBackground>;
          }
        
        return (
           
           <List containerStyle={{ borderTopWidth: 0, borderBottomWidth: 0 }}>
           <FlatList
           data={this.state.professors}
           renderItem={({ item }) => (
            <ListItem
              roundAvatar
              title={`${item.firstName} ${item.lastName}`}
              subtitle={item.email}
              avatar={{ uri: item.proPic }}
              containerStyle={{ borderBottomWidth: 0 }}
              onPress = 
              { 
                  () => {
                  profUID = item.key;
                  this.professorDetail();
                }
                
              }
            />
          )}
          keyExtractor={item => item.key}
          ItemSeparatorComponent={this.renderSeparator}
          ListHeaderComponent={this.renderHeader}
          ListFooterComponent={this.renderFooter}
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

