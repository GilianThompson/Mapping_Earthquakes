// Add console.log to check to see if code is working.
console.log("working");

//first tile layer that will be the background of the map
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

//second tile layer that will be the background of the map
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

//third tile layer that will be the background of the map
let dark = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

//create the map object with center, zoom level and default layer
let map = L.map('mapid', {
	center: [40.7, -94.5],
	zoom: 3,
	layers: [streets]
});

//reate a base layer that holds all three maps
let baseMaps = {
  "Streets": streets,
  "Satellite": satelliteStreets,
  "Dark": dark
};

//layers
let allEarthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();
let majorEarthquakes = new L.LayerGroup();


//add a reference to the tectonic plates group to the overlays object
let overlays = {
  "Earthquakes": allEarthquakes,
  "Tectonic Plates": tectonicPlates,
  "Major Earthquakes": majorEarthquakes
};

//add control to the map that will allow the user to change which
//layers are visible
L.control.layers(baseMaps, overlays).addTo(map);

//use d3.json to make a call to get Tectonic Plate geoJSON data
//creating a GeoJSON layer with the retrieved data
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(data =>{
    L.geoJson(data, {
        color: "red",
        weight: 1
    }).addTo(tectonicPlates);
   
    //add the earthquake layer to map
    tectonicPlates.addTo(map);
});

//retrieve the earthquake GeoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
    //this function returns the style data for each of the earthquakes plotted on the map 
    //pass the magnitude of the earthquake into two separate functions
    //to calculate the color and radius
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }
    //this function determines the color of the marker based on the magnitude of the earthquake
    function getColor(magnitude) {
        if (magnitude > 5) {
            return "#ea2c2c";
        }
        if (magnitude > 4) {
            return "#ea822c";
        }
        if (magnitude > 3) {
            return "#ee9c00";
        }
        if (magnitude > 2) {
            return "#eecc00";
        }
        if (magnitude > 1) {
            return "#d4ee00";
        }
            return "#98ee00";
    }
    //this function determines the radius of the earthquake marker based on its magnitude
    //(earthquakes with a magnitude of 0 were being plotted with the wrong radius)
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    }

    //create a GeoJSON layer with the retrieved data
    L.geoJson(data, {
            //turn each feature into a circleMarker on the map
            pointToLayer: function(feature, latlng) {
                console.log(data);
                return L.circleMarker(latlng);
            },
        //set the style for each circleMarker using styleInfo function
        style: styleInfo,
        //create a popup for each circleMarker to display the magnitude and location of the earthquake
        //after the marker has been created and styled
        onEachFeature: function(feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
    }).addTo(allEarthquakes);

    //add the earthquake layer to map
    allEarthquakes.addTo(map);

    //create a legend control object
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend');
        const magnitudes = [0, 1, 2, 3, 4, 5];
        const colors = [
          "#98ee00",
          "#d4ee00",
          "#eecc00",
          "#ee9c00",
          "#ea822c",
          "#ea2c2c"
        ];
        //looping through intervals to generate a label with a colored square for each interval
        for (var i = 0; i < magnitudes.length; i++) {
            console.log(colors[i]);
            div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
        }
        return div;
    };
    legend.addTo(map);

});

//retrieve the major earthquake GeoJSON data >4.5 mag for the week
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson').then(function(data) {
    //use the same style as the earthquake data
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }
    //change the color function to use three colors for the major earthquakes based on the magnitude of the earthquake
    function getColor(magnitude) {
        if (magnitude < 5) {
            return "#CD5C5C";
        }
        if (5 < magnitude < 6) {
            return "#DC143C";
        }
        if (magnitude > 6) {
            return "#FF0000";
        }
    }
    //use the function that determines the radius of the earthquake marker based on its magnitude
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    }
    //creating a GeoJSON layer with the retrieved data that adds a circle to the map 
    //sets the style of the circle, and displays the magnitude and location of the earthquake
    //after the marker has been created and styled
    L.geoJson(data, {
        style: styleInfo,
        pointToLayer: function(feature, latlng) {
            console.log(data);
            return L.circleMarker(latlng);
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup("Major Earthquake Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }     
    }).addTo(majorEarthquakes);
    //add the major earthquakes layer to the map.
    majorEarthquakes.addTo(map)
});

