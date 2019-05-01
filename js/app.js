
var map;


// These are the real estate listings that will be shown to the user.
// Normally we'd have these in a database instead.
var locations = [
  {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
  {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
  {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
  {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
  {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
  {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
];



// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
  // Create a styles array to use with the map.
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13,
    mapTypeControl: false
  });
}

function viewModel(){

  var location = function(data){
  this.title = data.title;
  this.location = data.location;
  };

  var self = this;
  // Style the markers a bit. This will be our listing marker icon.
  self.defaultIcon = makeMarkerIcon('FF0000');
  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  self.highLightedIcon = makeMarkerIcon('FFFF24');

  self.Infowindow = new google.maps.InfoWindow();

  self.locationList = []; // I wont make it an observable because of the instructions

  locations.forEach(function(locationItem){
    self.locationList.push(locationItem)
  });
  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < self.locationList.length; i++) {
    var marker = new google.maps.Marker({
      position: self.locationList[i].location,
      title: self.locationList[i].title,
      animation: google.maps.Animation.DROP,
      icon: self.defaultIcon,
      id: i
    });
    markers.push(marker);
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, self.Infowindow);
      toggleBounce(this);
    });

    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(self.highLightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(self.defaultIcon);
    });
  }

  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    console.log(markers.length)
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// // This function populates the infowindow when the marker is clicked. We'll only allow
// // one infowindow which will open at the marker that is clicked, and populate based
// // on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
      marker.setAnimation(null);
    });
  }
}

function toggleBounce(marker){
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } 
  else {
    for (var i =0; i < markers.length; i++){
    markers[i].setAnimation(null);
    }
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

// // This function takes in a COLOR, and then creates a new marker
// // icon of that color. The icon will be 21 px wide by 34 high, have an origin
// // of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
} 


function initApp() {
  initMap();
  ko.applyBindings(new viewModel());
}