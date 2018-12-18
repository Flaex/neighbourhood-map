import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import MainPanel from './MainPanel'
import * as PlacesAPI from './PlacesAPI'
import './styles.css';

class Map extends Component {

  constructor(props) {
    super(props)
    this.getImage = this.getImage.bind(this)
    this.renderImages = this.renderImages.bind(this)
  }

  static defaultProps = {
    center: {
      lat: 10.4998329,
      lng: -66.8451149
    },
    zoom: 17
  }

  state = {
    places : [],
    markersArr : [],
    mapObj : {},
    mapsObj : {},
    infowindowsArr: []
  }

  componentDidMount() {
    PlacesAPI.getAll().then((places) => {
      this.setState({ places })
    })
  }

  //Initialization method
  init(map, maps, id) {
    const { places } = this.state
    let markers = []
    let infowindows = []
    for (let i = 0; i < places.length; i++) {
      let position = places[i].location
      let title = places[i].title
      //Custom icon based on https://material.io/tools/icons/?icon=restaurant&style=baseline
      var iconImage = {
        url: 'icons/restaurant.svg',
        size: new maps.Size(25,25),
        origin: new maps.Point(0, 0),
        anchor: new maps.Point(0, 0),
        scaledSize: new maps.Size(25, 25)
      }
      //Assigning values to markers
      let marker = new maps.Marker({
        map: map,
        position: position,
        title: title,
        icon: iconImage,
        animation: maps.Animation.DROP
      })
      let infowindow = new maps.InfoWindow()
      infowindows.push(infowindow)
      markers.push(marker)

      //Assigning states to passing data to child components as props
      this.setState({markersArr: markers})
      this.setState({infowindowsArr: infowindows})
      this.setState({mapObj: map})
      this.setState({mapsObj: maps})

      marker.addListener('click', () => {
      //
        if (infowindow.marker !== marker) {
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.open(map, marker);
        }
      })
    }
  }

  //Method for getting Foursquare venue ID
  getID = (e) => {
    const { places } = this.state
    const lat = places[e].location.lat
    const lng = places[e].location.lng
    PlacesAPI.searchVenue(lat, lng).then((location) => {
      //Copying the state
      let placesTemp = places
      let fourSquareIDs = []
      //Assigning ID to a specific index
      placesTemp[e].id = location.response.venues[0].id
      // fourSquareIDs = placesTemp
      this.getImage(e, places)
      // this.renderImages(e, fourSquareIDs)
    })

  }
  // Method for getting images from Foursquare API
  getImage = (e, places) => {
    const id = places[e].id
    PlacesAPI.getImage(id).then((arr) => {
      // Copying the state
      let placesTemp = places
      let fourSquareImages = []
      placesTemp[e].imageURL = arr.response.photos.items[0].prefix + 100 + arr.response.photos.items[0].suffix
      fourSquareImages = placesTemp
      this.renderImages(e, fourSquareImages)
    })
  }

  renderImages = (e, fourSquareImages) => {
    console.log(fourSquareImages[e])
    const { markersArr, mapObj, infowindowsArr } = this.state
    const selectedMarker = markersArr[e]
    const markerMatch =  markersArr.filter((marker) => marker === selectedMarker )
    const markerNomatch =  markersArr.filter((marker) => marker !== selectedMarker )
    if (e === 'choose') {
      //Avoid errors if "Choose a restaurant" option is selected on dropdown
    } else {
      markerNomatch.map(marker => marker.setMap(null))
      markerMatch.map(marker => marker.setMap(mapObj))
      infowindowsArr[e].marker = selectedMarker
      infowindowsArr[e].setContent(`<div class="infowindow"><img src="${fourSquareImages[e].imageURL}"></div>`)
      infowindowsArr[e].open(mapObj, selectedMarker)
    }
  }

  render() {
    return (
      <div>
        <header>
          <h1 className="main-title">My favorite places to eat in my Neighborhood</h1>
        </header>
        {/* Component defined on https://www.npmjs.com/package/google-map-react */}
        <div className="map" style={{ height: '90vh', width: '100%' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: 'AIzaSyBB4845mdrbpL1Ub833ZI1JzneXenLBU_Q' }}
            defaultCenter={this.props.center}
            defaultZoom={this.props.zoom}
            onGoogleApiLoaded={({map, maps}) => this.init(map, maps)}
            yesIWantToUseGoogleMapApiInternals
          >
          </GoogleMapReact>
          <MainPanel
            onGetID={(e) => {
              this.getID(e)
            }}
            renderImages={this.renderImages}
            infowindows={this.state.infowindowsArr}
            map={this.state.mapObj}
            maps={this.state.mapsObj}
            fourSquareIDs={this.state.fourSquareIDs}
            places={this.state.places}
            markers={this.state.markersArr}
            init={this.init} />
        </div>
      </div>
    );
  }
}

export default Map;
