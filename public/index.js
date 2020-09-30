import 'ol/ol.css';
import { Map, View } from 'ol';
import Overlay from 'ol/Overlay';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, toLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';

import { Fill, Stroke, Icon, Style, Circle, RegularShape, Circle as CircleStyle, Text } from 'ol/style';
import { Vector as VectorSource, Cluster } from 'ol/source.js';
import { Vector as VectorLayer, Heatmap as HeatmapLayer } from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import * as d3 from "d3";
import * as d3Collection from 'd3-collection';

d3.select('#btnChartMunicipi').node().click();

var mapDate2num;
var mapNumOfIncidenti2Houre;

var mapGender2num;

var mapTrafic2num;

var numOfIncidenti;

var styles = {

  'Point': [new Style({
    image: new Circle({
      radius: 8,
      fill: new Fill({
        color: '#2f6aa9ba',
      }),
      stroke: new Stroke({ color: '#ffffff', width: 2 })
    })
  })],
  'MultiPolygon': new Style({
    stroke: new Stroke({
      color: 'grey',
      width: 2
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 0, 0.1)'
    })
  })
};



var styleFunction = function (feature) {
  return styles[feature.getGeometry().getType()];
}

var classifiedStyleFunction = function (feature) {
  var myColor = d3.scaleSequential().domain([200, 800])
    .interpolator(d3.interpolateReds);
  return new Style({
    stroke: new Stroke({
      color: 'grey',
      width: 1
    }),
    fill: new Fill({
      color: myColor(feature.get('NUMPOINTS'))

    })

  })
}


var vectorSource = new VectorSource({
  url: 'dataset/municipi_roma_con_inc.geojson',
  format: new GeoJSON()
});


var vectorLayer = new VectorLayer({
  source: vectorSource,
  style: styleFunction,
  visible: false
});

var municipiClassifiedSource = new VectorSource({
  url: 'dataset/municipi_roma_con_inc.geojson',
  format: new GeoJSON()
});

var municipiClassifiedLayer = new VectorLayer({
  source: municipiClassifiedSource,
  style: classifiedStyleFunction,
  visible: false
});

var incidentiSource = new VectorSource({
  url: 'dataset/incidenti_gennaio_2020.geojson',
  format: new GeoJSON()
});


var incidentiLayer = new VectorLayer({
  minZoom: 14.5,
  source: incidentiSource,
  style: styleFunction
});

var vectorHeatMap = new HeatmapLayer({
  source: new VectorSource({
    url: 'dataset/incidenti_gennaio_2020_v4.geojson',
    format: new GeoJSON(),
  }),
  name: 'heatmapLayer',
  visible: false,
  blur: 10,
  radius: 4,
  weight: function (feature) {
    var magnitude = 10
    return magnitude;
  },
});


var vectorCluster = new VectorLayer({
  maxZoom: 14.5,
  visible: false,
  source: new Cluster({
    distance: 40,
    source: new VectorSource({
      url: 'dataset/incidenti_gennaio_2020_v4.geojson',
      format: new GeoJSON()
    }),
  }),
  style: function (feature) {
    var size = feature.get('features').length;
    var style = new Style({
      image: new CircleStyle({
        radius: calcolateR(size), //10*(size.toString().length),
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
        fill: new Fill({
          color: '#2f6aa9ba',
        }),
      }),
      text: new Text({
        text: size.toString(),
        fill: new Fill({
          color: '#fff',
        }),
      }),
    });

    return style;
  },
});

function calcolateR(v) {
  var numeratore = Math.pow(v, 0.5);
  var denominatore = Math.pow((getCFactorByzoomLevel() * Math.PI), 0.57);
  var r = numeratore / denominatore;
  return r;
}

function getCFactorByzoomLevel() {

  if (map.getView().getZoom() <= 11) {
    return 0.1;
  }
  else if (map.getView().getZoom() < 12) {
    return 0.05;
  }
  else if (map.getView().getZoom() < 13) {
    return 0.03;
  }
  else {
    return 0.02;
  }
}

var map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
      opacity: 0.7
    }),
    vectorLayer,
    incidentiLayer,
    municipiClassifiedLayer,
    vectorCluster,
    vectorHeatMap
  ],
  view: new View({
    center: fromLonLat([12.496297, 41.891113]),
    zoom: 10,
    minZoom: 10,
    maxZoom: 19
  })

});

/**
 * Popup
 **/

var container = document.getElementById('popup');
var content_element = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};
var overlay = new Overlay({
  element: container,
  autoPan: true,
  offset: [0, -10]
});

map.addOverlay(overlay);

// click on feature
map.on('click', function (evt) {

  var feature = map.forEachFeatureAtPixel(evt.pixel,
    function (feature, layer) {
      return feature;
    });
  if (feature) {

    var geometry = feature.getGeometry();
    var coord = null;
    var content = null;
    if (feature.get('NaturaIncidente')) {
      content = '<h3>' + feature.get('NaturaIncidente') + '</h3>';
      content += '<p>' + feature.get('STRADA1') + '</p>';
      content += '<p>' + feature.get('DataOraIncidente') + '</p>';
      content += '<table style="width:100%"><tr><th>NUM_FERITI</th><th>NUM_ILLESI</th><th>NUM_MORTI</th><th>NUM_MORTI</th><tr>' + '<td>' + feature.get('NUM_FERITI') + '</td>' + '<td>' + feature.get('NUM_ILLESI') + '</td>' + '<td>' + feature.get('NUM_MORTI') + '</td>' + '<td>' + feature.get('NUM_RISERVATA') + '</td>' + '</tr></table>';
      coord = geometry.getCoordinates();
    }
    else if (feature.get('municipio')) {
      content = '<h3>Municipio ' + feature.get('etichetta') + '</h3>';
      if (feature.get('NUMPOINTS')) {
        content += '<p>Numero Incidenti: ' + feature.get('NUMPOINTS') + '</p>';
      }

      coord = map.getCoordinateFromPixel(evt.pixel);
    }
    else { return; }

    content_element.innerHTML = content;
    overlay.setPosition(coord);

  }
});

//bottoni
function toggleHeatMap() {
  vectorHeatMap.setVisible(!vectorHeatMap.getVisible());
}

function toggleClassifiedMap() {
  municipiClassifiedLayer.setVisible(!municipiClassifiedLayer.getVisible());
}

function toggleIncidenti() {
  if (incidentiLayer.getMinZoom() == 14.5) {
    incidentiLayer.setMinZoom(9);
  }
  else {
    incidentiLayer.setMinZoom(14.5);
  }

}

function toggleMunicipi() {
  vectorLayer.setVisible(!vectorLayer.getVisible());
}

function toggleCluster() {
  vectorCluster.setVisible(!vectorCluster.getVisible());
}
function toggleBarchartMunicipi() {

  const show = d3.select('#barchartMunicipi').style('display') === 'none';
  if (show)
    d3.select('#barchartMunicipi').style('display', 'block');
  else
    d3.select('#barchartMunicipi').style('display', 'none');
}
function toggleBarchartDay() {
  const show = d3.select('#barchartDay').style('display') === 'none';
  if (show)
    d3.select('#barchartDay').style('display', 'block');
  else
    d3.select('#barchartDay').style('display', 'none');
}
function toggleBarchartHour() {
  const show = d3.select('#barchartHoure').style('display') === 'none';
  if (show)
    d3.select('#barchartHoure').style('display', 'block');
  else
    d3.select('#barchartHoure').style('display', 'none');
}

function attachEvent() {
  d3.select('#layerHit').on('click', toggleHeatMap);
  d3.select('#layerClassified').on('click', toggleClassifiedMap);
  d3.select('#layerBuble').on('click', toggleCluster);
  d3.select('#layerMunicipi').on('click', toggleMunicipi);
  d3.select('#layerIncidenti').on('click', toggleIncidenti);
  d3.select('#btnChartMunicipi').on('click', toggleBarchartMunicipi);
  d3.select('#btnChartGiornaliero').on('click', toggleBarchartDay);
  d3.select('#btnChartOrario').on('click', toggleBarchartHour);

}

function calculateCard(data) {
  mapDate2num = d3Collection.nest().key(function (d) {
    return d.DataOraIncidente.split(' ')[0];
  }).rollup(function (v) { return v.length }).entries(data);

  mapNumOfIncidenti2Houre = d3Collection.nest().key(function (d) {

    return d.DataOraIncidente.split(' ')[1].split(':')[0];
  }).rollup(function (v) { return v.length }).entries(data);


  var mapGender2num = d3Collection.nest().key(function (d) {
    return d.Sesso;
  }).rollup(function (v) { return v.length }).entries(data);


  d3.select('#mapGender2numM').text("Uomo " + (mapGender2num.filter(obj => { return obj.key === "M" }))[0].value);
  d3.select('#mapGender2numF').text("Donna " + (mapGender2num.filter(obj => { return obj.key === "F" }))[0].value);

  mapTrafic2num = d3Collection.nest().key(function (d) {
    return d.Traffico;
  }).rollup(function (v) { return v.length }).entries(data);

  d3.select('#mapTrafic2numIntenso').text("Intenso " + (mapTrafic2num.filter(obj => { return obj.key === "Intenso" }))[0].value);
  d3.select('#mapTrafic2numNormale').text("Normale " + (mapTrafic2num.filter(obj => { return obj.key === "Normale" }))[0].value);
  d3.select('#mapTrafic2numScarso').text("Scarso " + (mapTrafic2num.filter(obj => { return obj.key === "Scarso" }))[0].value);


  numOfIncidenti = data.length;
  d3.select('#numOfIncidenti').text(numOfIncidenti);

}

function barchartDay() {
  var margin = { top: 10, right: 30, bottom: 30, left: 40 };
  var width = 1200;
  var height = 400 - margin.top - margin.bottom;
  var parseDate = d3.timeParse("%d/%m/%Y");

  var x = d3.scaleTime().domain([new Date(2019, 11, 31), new Date(2020, 1, 1)]).rangeRound([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);


  var svg = d3.select("#barchartDay").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  y.domain([0, d3.max(mapDate2num, function (d) { return d.value; })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);


  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Value ($)");

  svg.selectAll("bar")
    .data(mapDate2num)
    .enter().append("rect")
    .style("fill", "#28a745")
    .attr("x", function (d) { return x(parseDate(d.key)); })
    .attr("width", 20)
    .attr("y", function (d) { return y(d.value); })
    .attr("height", function (d) { return height - y(d.value); });
}

function barchartHoure() {
  var margin = { top: 10, right: 30, bottom: 30, left: 40 };
  var width = 1200;
  var height = 400 - margin.top - margin.bottom;

  var x = d3.scaleLinear().domain([0, 23]).rangeRound([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);

  var svg = d3.select("#barchartHoure").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  y.domain([0, d3.max(mapNumOfIncidenti2Houre, function (d) { return d.value; })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Value ($)");

  svg.selectAll("bar")
    .data(mapNumOfIncidenti2Houre)
    .enter().append("rect")
    .style("fill", "#dc3545")
    .attr("x", function (d) { return x((d.key)); })
    .attr("width", 20)
    .attr("y", function (d) { return y(d.value); })
    .attr("height", function (d) { return height - y(d.value); });

}

function barchartMunicipio(data) {
  var margin = { top: 10, right: 30, bottom: 30, left: 40 };
  var width = 1200;
  var height = 400 - margin.top - margin.bottom;


  var x = d3.scaleLinear().domain([0, 16]).rangeRound([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);

  var svg = d3.select("#barchartMunicipi").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  y.domain([0, d3.max(data, function (d) { return d.value; })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Value ($)");

  svg.selectAll("bar")
    .data(data)
    .enter().append("rect")
    .style("fill", "#007bff")
    .attr("x", function (d) { return x((d.key)); })
    .attr("width", 20)
    .attr("y", function (d) { return y(d.value); })
    .attr("height", function (d) { return height - y(d.value); });

}


function createBarChart() {
  d3.dsv(';', "dataset/csv_incidenti2020810102440.csv").then(function (data) {
    calculateCard(data);
    barchartDay();
    barchartHoure();
  }
  );

  d3.dsv(',', "dataset/municipi_roma_con_inc.csv").then(function (data) {
    var mapMunicipio2num = d3Collection.nest().key(function (d) {
      return d.municipio;
    }).rollup(function (v) {
      return v[0].NUMPOINTS
    }).entries(data);
    barchartMunicipio(mapMunicipio2num);
  }
  );
}

attachEvent();
createBarChart();
toggleBarchartDay();
toggleBarchartHour();

