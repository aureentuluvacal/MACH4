//data vis js, reads in data, combines with geojson, colors the map based on selection
$( document ).ready(function() {
	var keyArray = ["pop2000","pop2000_under5","pop2000_male"]; //array of property keys
	var expressed = keyArray[0]; //initial attribute 
	var dataCounty = [];
	var pop2000 = [];
	var pop2000_under5 = [];
	var pop2000_male = [];
	var data;
	var json;
	
	//Width and height of svg
	var w = 600;
	var h = 800;
	
	//Define map projection
	var projection = d3.geo.albers()
							.scale(9000)
							.translate([-650, 550]);

	//Define path generator
	var path = d3.geo.path()
					 .projection(projection);
					 
					 
	//Define quantize scale to sort data values into buckets of color
	var color = d3.scale.quantize()
						 .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);
	var color2 = d3.scale.quantize()
							.range(["rgb(222,235,247)","rgb(189,215,231)","rgb(107,174,214)","rgb(49,130,189)","rgb(8,81,156)"]);			
	var color3 = d3.scale.linear()
							.range(["rgb(254,237,222)","rgb(253,190,133)","rgb(253,141,60)","rgb(230,85,13)","rgb(166,54,3)"]);
							
	//Create SVG element
	var svg = d3.select("body")
				.append("svg")
				.attr("width", w)
				.attr("height", h);
	
	//Begin a queue to asynchronously load data and color map			
		
	d3.csv("populationdata.csv", function(error, dataset) { 
		data = dataset;
		
		color.domain([
			d3.min(data, function(d) { return d.pop2000; }), 
			d3.max(data, function(d) { return d.pop2000; })
		]);
		
		color2.domain([
			d3.min(data, function(d) { return d.pop2000_male; }), 
			d3.max(data, function(d) { return d.pop2000_male; })
		 ]);
		 
		 color3.domain([
			d3.min(data, function(d) { return d.pop2000_under5; }), 
			d3.max(data, function(d) { return d.pop2000_under5; })
		 ]);
		
		for (var i = 0; i < data.length; i++) {
			//Grab county name
			dataCounty.push(data[i].county_name);
		
			//Grab data value, and convert from string to int, push onto arrays
			pop2000.push(parseInt(data[i].pop2000));
			pop2000_under5.push(parseInt(data[i].pop2000_under5));
			pop2000_male.push(parseInt(data[i].pop2000_male));
		}
	});//end of d3.csv
	
	d3.json("indiana.json", function(error, jsonset) {
		json = jsonset;
	});
	
	function colorMapPop(data, json) {	
		//Find the corresponding county inside the GeoJSON
		var jsonCounty;
		
		for (var i = 0; i < json.features.length; i++) {
			for (var j = 0; j < json.features.length; j++) {
				jsonCounty = json.features[j].properties.name;
				
				if (dataCounty[i] == jsonCounty) {
					//Copy the data value into the JSON
						json.features[j].properties.value = pop2000[i];
					//Stop looking through the JSON
					break;	
				}	
			}	
		}
		
		
		var popVar = svg.selectAll("path")
		   .data(json.features)
		popVar.enter()
		   	.append("path")
		   	.attr("d", path)
		   	.style("fill", function(d) {
				//Get data value
				var value = d.properties.value;
			
				if (value) {
					//If value exists…
					return color(value);
				} else {
					//If value is undefined…
					return "#ccc";
				}
		   });
		   		   
	}//end of colorMapPop()
	
	function colorMapMale(data, json) {	
		//Find the corresponding county inside the GeoJSON
		var jsonCounty;
		
		for (var i = 0; i < json.features.length; i++) {
			for (var j = 0; j < json.features.length; j++) {
				jsonCounty = json.features[j].properties.name;
				
				if (dataCounty[i] == jsonCounty) {
					//Copy the data value into the JSON
						json.features[j].properties.value = pop2000_male[i];
						console.log(pop2000_male[i]);
					//Stop looking through the JSON
					break;	
				}	
			}	
		}
		
	var maleVar = svg.selectAll("path")
		   .data(json.features)
		   .style("fill", function(d) {
				//Get data value
				var value = d.properties.value;
			
				if (value) {
					//If value exists…
					return color2(value);
				} else {
					//If value is undefined…
					return "#ccc";
				}
		   });
		   	   
	}//end of colorMapMale()
	
	function colorMapFive(data, json) {	
		//Find the corresponding county inside the GeoJSON
		var jsonCounty;
		for (var i = 0; i < json.features.length; i++) {
			for (var j = 0; j < json.features.length; j++) {
				jsonCounty = json.features[j].properties.name;
				if (dataCounty[i] == jsonCounty) {
					//Copy the data value into the JSON
						json.features[j].properties.value = pop2000_under5[i];
					//Stop looking through the JSON
					break;	
				}	
			}	
		}
		
	var fiveVar = svg.selectAll("path")
		   .data(json.features)
		   .style("fill", function(d) {
				//Get data value
				var value = d.properties.value;
			
				if (value) {
					//If value exists…
					return color3(value);
				} else {
					//If value is undefined…
					return "#ccc";
				}
		   });
	}//end of colorMapFive()
	
	$("#pickData").on("change", function() {
		var choice = document.getElementById("pickData");
	
		if(choice.value == "pop2000")  {
			colorMapPop(data, json);
		}
		if(choice.value == "pop2000_under5") {
			colorMapFive(data, json);
		}
		if(choice.value == "pop2000_male") {
			colorMapMale(data, json);
		}
	});
	
	setInterval(function() {
		colorMapPop(data, json);
	}, 3000);
	
});
