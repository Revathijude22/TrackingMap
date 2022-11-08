import React, { Component, useEffect } from "react";
import { Dimensions, StyleSheet, View, Text } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
//import Geolocation from "@react-native-community/geolocation";
import Geocoder from "react-native-geocoding";
import Geolocation from "react-native-geolocation-service";
import { connect } from "react-redux";
import MapViewDirections from "react-native-maps-directions";
import { GetSaveStartTrip, GetTraveledLatLng } from "../redux/BottomNav-Action";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;

const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const GOOGLE_MAPS_APIKEY = "AIzaSyC0g6aHYB1U_n4nN4uWXUoKIkOqCWKlxqM";

import { NativeModules } from "react-native";
import { LOGG, getDateTime } from "../common/util";
import { State } from "react-native-gesture-handler";
Geocoder.init(GOOGLE_MAPS_APIKEY);
const reactNativeVersion = NativeModules.PlatformConstants.reactNativeVersion;
const reactNativeVersionString = reactNativeVersion
  ? `${reactNativeVersion.major}.${reactNativeVersion.minor}.${
      reactNativeVersion.patch
    }${reactNativeVersion.prerelease ? " pre-release" : ""}`
  : "";

const reactNativeMapsVersion =
  require("./node_modules/react-native-maps/package.json").version;
const reactNativeMapsDirectionsVersion =
  require("./node_modules/react-native-maps-directions/package.json").version;

const styles = StyleSheet.create({
  versionBox: {
    position: "absolute",
    bottom: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  versionText: {
    padding: 4,
    backgroundColor: "#FFF",
    color: "#000",
  },
  map: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

class TrackingMap extends Component {
  constructor(props) {
    super(props);
    LOGG("enter map");
    this.state = {
      currentLoc: {
        latitude: 0,
        longitude: 0,

        error: null,
      },
      currentAddress: {
        Address: "",
        error: null,
      }, 
       destinationLoc: {
        latitude: 0,
        longitude: 0,

        error: null,
      },
      destinationAddress: {
        Address: "",
        error: null,
      },
      SetDistance:{
          distance:0,
          duration:0,
      }
     
    };

   
    this.MapView = null;
  }

  onMapPress = (e) => {
    this.setState({
      coordinates: [...this.state.coordinates, e.nativeEvent.coordinate],
    });
  };

  onReady = (result) => {
    console.log(`Distance: ${result.distance} km`);
    console.log(`Duration: ${result.duration} min.`);
    this.setState({
      SetDistance: {
        distance: result.distance,
        duration: result.duration,
      },
    });

    console.log(`Distance: ${this.state.distance} km`);
    this.mapView.fitToCoordinates(result.coordinates, {
      edgePadding: {
        right: width / 10,
        bottom: height / 10,
        left: width / 10,
        top: height / 10,
      },
    });
  };

  onError = (errorMessage) => {
    console.log(errorMessage); 
  };

  

  async componentDidMount() {
    LOGG("didmount" + this.props.selectedDoctor.docLat);
    Geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          currentLoc: {
            latitude:position.coords.latitude,
            longitude: position.coords.longitude,
          },
          
        });
        LOGG("current loca"+ this.state.currentLoc.latitude)
      
        Geocoder.from(
          this.state.currentLoc.latitude,
          this.state.currentLoc.longitude
        )
          .then((json) => {
            console.log(json);

            var addressComponent = json.results[0].formatted_address;

            this.setState({
              currentAddress: {
                Address: addressComponent,
              },
            });
            LOGG("map cureee------------ ");
           
          })

          .catch((error) => console.warn(error));
      },
      (error) => {
        // See error code charts below.
        this.setState({
          currentAddress: {
            error: error.message,
          },
        }),
          console.log(error.code, error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,

        maximumAge: 100000,
      }
    );
    Geocoder.from(
      parseFloat(this.props.selectedDoctor.docLat),
      parseFloat(this.props.selectedDoctor.docLng)
    ).then((json) => {
      console.log(json);

      var addressComponent = json.results[0].formatted_address;

      this.setState({
        destinationAddress: {
          Address: addressComponent,
        },
      });
      //console.log("destination lat"+this.state.destinationLoc.latitude);
     // console.log("desrination Addr"+this.state.destinationAddress.Address);
    });
 
  }

  render() {
    console.log();
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          showsUserLocation={true}
          zoomEnabled={true}
          initialRegion={{
            latitude: this.state.currentLoc.latitude,
            longitude: this.state.currentLoc.longitude,

            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
          ref={(c) => (this.mapView = c)} // eslint-disable-line react/jsx-no-bind
          onPress={this.onMapPress}
        >
          <Marker
            coordinate={{
              latitude: this.state.currentLoc.latitude,
              longitude: this.state.currentLoc.longitude,
            }}
            //pinColor = {"red"} // any color

            //title={"beta"}
            // description={this.state.latitude + ' ' + this.state.longitude}
          >
            <Callout>
              <Text>{this.state.currentAddress.Address}</Text>
            </Callout>
          </Marker>
          <Marker
            coordinate={{
              latitude: parseFloat(this.props.selectedDoctor.docLat),
              longitude: parseFloat(this.props.selectedDoctor.docLng),
            }}
          >
            <Callout>
              <Text>{this.state.destinationAddress.Address}</Text>
            </Callout>
          </Marker>

          <MapViewDirections
            origin={this.state.currentLoc}
            destination={{latitude:parseFloat(this.props.selectedDoctor.docLat),longitude:parseFloat(this.props.selectedDoctor.docLng)}}
            waypoints={[
              {
                latitude: this.state.currentLoc.latitude,
                longitude: this.state.currentLoc.longitude,
              },
              {
                 latitude:parseFloat(this.props.selectedDoctor.docLat),
                longitude: parseFloat(this.props.selectedDoctor.docLng),
              },
            ]}
            apikey={GOOGLE_MAPS_APIKEY}
            language="en"
            strokeWidth={4}
            strokeColor="red"
            mode="DRIVING"
            optimizeWaypoints={true}
            onStart={(params) => {
              console.log(
                `Started routing between "${params.origin}" and "${
                  params.destination
                }"${
                  params.waypoints.length
                    ? " using waypoints: " + params.waypoints.join(", ")
                    : ""
                }`
              );
            }}
            onReady={this.onReady}
            onError={(errorMessage) => {
              console.log(errorMessage);
            }}
            resetOnChange={false}
          />
        </MapView>

        <View style={styles.versionBox}>
          <Text style={styles.versionText}>
            Distance :{this.state.SetDistance.distance} km , Duration :
            {this.state.SetDistance.duration} min
          </Text>
        </View>
      </View>
    );
  }
}


export default TrackingMap;
