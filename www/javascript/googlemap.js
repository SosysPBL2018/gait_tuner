function GoogleMap() {
    this.init();
    this.setInitialPosition();
}

GoogleMap.prototype = {
    init: function() {
        if (!(this instanceof GoogleMap)) {
            return new GoogleMap();
        }
        this.map = new google.maps.Map(document.getElementById("map"), {
            zoom: 16,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: false,
        });
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: true,
            preserveViewport: false,
            suppressMarkers: true
        });
        this.directionsDisplay.setPanel(document.getElementById("panel"));
        this.directionsDisplay.setMap(this.map);
        google.maps.event.addListener(this.directionsDisplay, 'directions_changed', function(){});

        this.startMarker = new google.maps.Marker({
            map: this.map,
            position: {lat: 0, lng: 0},
            label: "出"
        });
        this.startMarker.setMap(null);
        this.goalMarker = new google.maps.Marker({
            map: this.map,
            position: {lat: 0, lng: 0},
            label: "到"
        });
        this.goalMarker.setMap(null);

        this.latestResponse = null;
        this.currentPos = null;
        this.startPosition = null;
        this.goalPosition = null;
    },

    setInitialPosition: function() {
        var self = this;
        var defaultPos = new google.maps.LatLng(35.66572, 139.73100); // TOKYO
        navigator.geolocation.getCurrentPosition(function(pos) {
            console.log("Success to get current position.");
            self.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            self.addCenterMark();
        }, function(err) {
            console.warn("Failue to get current position.");
            self.map.setCenter(defaultPos);
            self.addCenterMark();
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    },

    addCenterMark: function() {
        var self = this;
        var centerMark = new google.maps.Marker({
            map: self.map,
            position: self.map.getCenter(),
            animation: google.maps.Animation.DROP,
            draggable: true
        });
        centerMark.setMap(this.map);
        google.maps.event.addListener(this.map, 'center_changed', function() {
            var pos = self.map.getCenter();
            centerMark.setPosition(pos);
        });
        google.maps.event.addListener(centerMark, 'dragend', function() {
            self.map.panTo(centerMark.position);
        });
        google.maps.event.addListener(centerMark, 'dblclick', function() {
            alert("Hello!!!!!!");
        });
    },

    getDistance: function() {
        var distance = this.latestResponse.routes[0].legs[0].distance.value;
        console.log("The distance is " + distance + " [m].");
        return distance;
    },

    putStartMarker: function(pos) {
        this.startMarker.setPosition(pos);
        this.startMarker.setMap(this.map);
        this.directionsDisplay.setMap(null);
        alert("出発点を設定しました。");
    },

    putGoalMarker: function(pos) {
        this.goalMarker.setPosition(pos);
        this.goalMarker.setMap(this.map);
        this.directionsDisplay.setMap(null);
        alert("到着点を設定しました。");
    },

    setStartPosition: function() {
        this.startPosition = this.map.getBounds().getCenter();
        this.putStartMarker(this.startPosition);
        if (this.goalPosition != null) {
            this.getRoute();
        }
    },

    setGoalPosition: function() {
        this.goalPosition = this.map.getBounds().getCenter();
        this.putGoalMarker(this.goalPosition);
        if (this.startPosition != null) {
            this.getRoute();
        }
    },

    selectStartPosition: function() {
        var startpointSelector = document.startpointform.startpoint;
        var latlngStrings = startpointSelector.options[startpointSelector.selectedIndex].value.split(",");
        this.startPosition = new google.maps.LatLng(latlngStrings[0], latlngStrings[1]);
        this.putStartMarker(this.startPosition);
        if (this.goalPosition != null) {
            this.getRoute();
        }
    },

    selectGoalPosition: function() {
        var goalpointSelector = document.goalpointform.goalpoint;
        var latlngStrings = goalpointSelector.options[goalpointSelector.selectedIndex].value.split(",");
        this.goalPosition = new google.maps.LatLng(latlngStrings[0], latlngStrings[1]);
        this.putGoalMarker(this.goalPosition);
        if (this.startPosition != null) {
            this.getRoute();
        }
    },

    getRoute: function() {
        if (this.startPosition == null) {
            alert("出発点を設定してください。");
            return;
        }
        if (this.goalPosition == null) {
            alert("到着点を設定してください。");
            return;
        }
        alert("経路を検索します。");

        var request = {
            origin: this.startPosition,
            destination: this.goalPosition,
            travelMode: google.maps.DirectionsTravelMode.WALKING,
            unitSystem: google.maps.DirectionsUnitSystem.METRIC,
            optimizeWaypoints: true,
            avoidHighways: false,
            avoidTolls: false,
        };

        var self = this;
        this.directionsDisplay.setMap(this.map);
        this.directionsService.route(request, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                self.latestResponse = response;
                self.directionsDisplay.setDirections(response);
                alert("距離は" + response.routes[0].legs[0].distance.value + " [m]です。");
            }
        });
    }
};
