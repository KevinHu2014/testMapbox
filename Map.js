import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import _ from 'lodash';

MapboxGL.setAccessToken('pk.eyJ1IjoiaHNpYW5neXVodSIsImEiOiJjamhhcXQ4OWQwMWQzMzBuemxqejNhYXV1In0.c1bPkBhWudFrSOS1ZhmFSQ');

const layerStyles = MapboxGL.StyleSheet.create({
  icon: {
    iconImage: '{icon}',
    iconAllowOverlap: true,
    iconSize: 0.4,
  },

  clusteredPoints: {
    circlePitchAlignment: 'map',
    circleColor: MapboxGL.StyleSheet.source(
      [
        [25, 'yellow'],
        [50, 'red'],
        [75, 'blue'],
        [100, 'orange'],
        [300, 'pink'],
        [750, 'white'],
      ],
      'point_count',
      MapboxGL.InterpolationMode.Exponential,
    ),

    circleRadius: MapboxGL.StyleSheet.source(
      [[0, 15], [100, 20], [750, 30]],
      'point_count',
      MapboxGL.InterpolationMode.Exponential,
    ),

    circleOpacity: 0.84,
    circleStrokeWidth: 2,
    circleStrokeColor: 'white',
  },

  clusterCount: {
    textField: '{point_count}',
    textSize: 12,
    textPitchAlignment: 'map',
  },
});

export default class Map extends Component {
  state = {
    featureCollection: {
      type: 'FeatureCollection',
      features: [],
    },
    album: {
      tt0080745: { uri: 'https://ia.media-imdb.com/images/M/MV5BN2Y4ZDBjMjEtZWQ0OS00NzYyLTg0M2ItMmUzYTEwN2RmMGVlXkEyXkFqcGdeQXVyMjgyOTI1ODY@._V1_SX300.jpg' },
      tt3623726: { uri: 'https://ia.media-imdb.com/images/M/MV5BMTY1NzIxNzkzM15BMl5BanBnXkFtZTgwMzAzNjIzNjE@._V1_SX300.jpg' }
    }
  };
  onRegionDidChange = () => {
    this.getImage();
  }

  getImage = () => {
    let temp = {};
    let album = {};
    console.log('hi');
    fetch('http://www.omdbapi.com/?apikey=12f88052&s=flash&type=movie',
      {
        method: 'GET',
      }
    )
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.Search.length > 0) {
        temp = responseData.Search.map(
          marker => ({
            type: 'Feature',
            id: marker.imdbID,
            properties: {
              icon: marker.imdbID,
              poster: marker.Poster
            },
            geometry: {
              type: 'Point',
              coordinates: [121.543794 + Math.random(), 25.023690 + Math.random()],
            },
          })
        );
        album = Object.assign({} , ...temp.map(
          marker => ({
            [marker.id]: { uri: marker.properties.poster }
          })
        ));
        console.log(album);
        // album = _.uniqWith(album, _.isEqual);
        console.log(temp);
        // console.log(Array.isArray(album));
        // console.log(album);
        // console.log(Array.isArray(Object.values(album)));
        // console.log(Object.values(album));
        // console.log(Array.isArray(this.state.album));
        // console.log(this.state.album);
        // console.log(Array.isArray(Object.assign({}, album)));
        // console.log(Object.assign({}, album));
        this.setState({
          featureCollection: {
            type: 'FeatureCollection',
            features: _.uniqBy([...this.state.featureCollection.features, ...temp], 'id')
          },
          album: Object.assign({}, ...this.state.album,album)
        });
      }
    })
    .catch((err) => { console.log(err); });
  }
  render() {
    return (
      <View style={styles.container}>
        <MapboxGL.MapView
          ref={map => { this.map = map; }}
          zoomLevel={6}
          pitch={45}
          centerCoordinate={[121.543794, 25.023690]}
          style={styles.container}
          styleURL={MapboxGL.StyleURL.Dark}
          onRegionDidChange={this.onRegionDidChange}
          onDidFinishRenderingMapFully={this.onDidFinishRenderingMapFully}
        >
          <MapboxGL.ShapeSource
            id="earthquakes"
            clusterRadius={50}
            clusterMaxZoom={14}
            onPress={this.onSourceLayerPress}
            images={this.state.album}
            shape={this.state.featureCollection}
            // url="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
          >
            <MapboxGL.SymbolLayer
              id="pointCount"
              style={layerStyles.clusterCount}
            />

            <MapboxGL.CircleLayer
              id="clusteredPoints"
              belowLayerID="pointCount"
              filter={['has', 'point_count']}
              style={layerStyles.clusteredPoints}
            />
            <MapboxGL.SymbolLayer
              id="singlePoint"
              filter={['!has', 'point_count']}
              minZoomLevel={1}
              style={[layerStyles.icon]}
            />
          </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
