'use strict';
import React, { Component } from 'react';
import { StatusBar,Picker, SafeAreaView, KeyboardAvoidingView ,TextInput, AppRegistry, StyleSheet, Text, TouchableHighlight, View, Image, ImageBackground, ListView, Platform, Dimensions, TouchableOpacity} from 'react-native';
import {firebase, db} from './firebase';

var firstName;
var lastName;
var professors = new Array();

export const professorQuery = () => {
    db.collection("users").where("instructor", "==", true)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            firstName = doc.data().firstName;
            lastName = doc.data().lastName;
            professors = firstName + ' ' + lastName;
            //console.log(doc.id, " => ", doc.data().firstName, doc.data().lastName);
            console.log(professors);
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
}