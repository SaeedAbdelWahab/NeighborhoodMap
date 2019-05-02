var map;

// These are the real estate listings that will be shown to the user.
// Normally we'd have these in a database instead.
var locations = [{
    title: 'City Stars',
    location: {
        lat: 30.072979,
        lng: 31.34605
    },
    place_id: "4b853e48f964a520845231e3"
}, {
    title: 'Tivoli Plaza',
    location: {
        lat: 30.0783231,
        lng: 31.347713
    },
    place_id: "5ae4db87d48ec1002bb85ee1"
}, {
    title: 'Mentor Graphics',
    location: {
        lat: 30.0894228,
        lng: 31.3411118
    },
    place_id: "4e53fc81aeb74b74581e1ae1"
}, {
    title: 'City Center',
    location: {
        lat: 30.0682644,
        lng: 31.3446851
    },
    place_id: "4bd9d7493904a5936cd4439e"
}, {
    title: 'Genena Mall',
    location: {
        lat: 30.0598106197085,
        lng: 31.3306754197085
    },
    place_id: '4d3c8a60d2c8f04d20926272'
}, {
    title: 'Tiba Mall',
    location: {
        lat: 30.0675274,
        lng: 31.33007409999999
    },
    place_id: '4e31e68cb0fbb985a508ee47'
}];

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
    // Create a styles array to use with the map.
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 30.0682644,
            lng: 31.3306754197085
        },
        zoom: 13,
        mapTypeControl: false
    });
}

function viewModel() {

    var location = function(data) {
        this.title = data.title;
        this.location = data.location;
        this.place_id = data.place_id;
        this.marker = null;
    };

    var self = this;
    // Style the markers a bit. This will be our listing marker icon.
    self.defaultIcon = makeMarkerIcon('FF0000');
    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    self.highLightedIcon = makeMarkerIcon('FFFF24');

    self.Infowindow = new google.maps.InfoWindow();

    self.locationList = ko.observableArray(); // I wont make it an observable because of the instructions

    locations.forEach(function(locationItem) {
        self.locationList.push(new location(locationItem))
    });
    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < self.locationList().length; i++) {
        var marker = new google.maps.Marker({
            position: self.locationList()[i].location,
            title: self.locationList()[i].title,
            animation: google.maps.Animation.DROP,
            icon: self.defaultIcon,
            id: self.locationList()[i].place_id,
        });
        markers.push(marker);
        self.locationList()[i].marker = marker;
        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function() {
            getPlacesDetailFourSquare(this, self.Infowindow);
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

    self.clickMarker = function(location) {
        getPlacesDetailFourSquare(location.marker, self.Infowindow);
        toggleBounce(location.marker);
    }

    self.mouseoverMarker = function(location) {
        location.marker.setIcon(self.highLightedIcon);
    }

    self.mouseoutMarker = function(location) {
        location.marker.setIcon(self.defaultIcon);
    }

    self.openNav = function() {
        document.getElementById("mySidenav").style.width = "350px";
    }
    self.closeNav = function() {
        document.getElementById("mySidenav").style.width = "0px";
    }

    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);

    self.queryText = ko.observable('');
    self.filteredLocations = ko.observableArray(self.locationList().slice(0));
    self.filterLocations = function() {
        self.filteredLocations.removeAll();
        var search = self.queryText().toUpperCase();
        for (var i = 0; i < self.locationList().length; i++) {
            title = self.locationList()[i].title;
            self.locationList()[i].marker.setVisible(false);
            if (title.toUpperCase().indexOf(search) > -1) {
                self.filteredLocations.push(self.locationList()[i])
                self.locationList()[i].marker.setVisible(true);
            }
        }
    }

}

function getPlacesDetailFourSquare(marker, infowindow) {
    $.ajax({
        url: 'https://api.foursquare.com/v2/venues/' + marker.id +
            '?client_id=GPOV5WFOZHMLYRMKWCQO3P1EIWKXDE3ZJLW3MFLDULUJM3JT&client_secret=K2EW5RRMH3INMKGO3DCRY2HQ1DEAB4ZP2LACTGNY2RNFZQZL&v=20190320',
        dataType: "json"
    }).done(function(data) {
        var details = data.response.venue;
        var phone = details.hasOwnProperty("contact") ? details.contact.phone : "No info available";
        var hours = details.hasOwnProperty("hours") ? details.hours.status : "No info available";
        var address = details.location.hasOwnProperty("formattedAddress") ? details.location.formattedAddress : "No info available";
        var rating = details.hasOwnProperty("rating") ? details.rating : "No rating available";
        var likes = details.hasOwnProperty("likes") ? details.likes.count : "No likes available";
        infowindow.marker = marker;
        var innerHTML = '<div>' +
            '<h2>' + marker.title + '</h2>' +
            '<p>Opening hours: ' + hours + '</p>' +
            '<p>phone: ' + phone + '</p>' +
            '<p>likes: ' + likes + '</p>' +
            '<p>Location: ' + address + '</p>' +
            '<p>Rating: ' + rating + '</p>' +
            '</div>';
        infowindow.setContent(innerHTML);
        infowindow.open(map, marker);
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
            marker.setAnimation(null);
        });
    }).fail(function() {
        alert("Error in getting place info!")
    });

}

function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        for (var i = 0; i < markers.length; i++) {
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
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

function failure() {
    alert('An error occured while loading the map.');
}

function initApp() {
    initMap();
    ko.applyBindings(new viewModel());
}