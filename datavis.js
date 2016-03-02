//data vis js, reads in data, combines with geojson, colors the map based on selection
$( document ).ready(function() {
	//////////////////////////////////////////////////////
	//					 Indiana Map					//
	//////////////////////////////////////////////////////
	
	var attributes = []; //array of property keys
	var width, height, svg, path, a;
	var expressed = 0;
	var playing = false;
	
	//initialize map
	function init() {
	   setMap();
	}//end init()
	
	//draw map 
	function setMap() {
		//Width and height of svg
		width = 500;
		height = 700;
	
		//Define map projection
		var projection = d3.geo.albers()
								.scale(8500)
								.translate([-850, 530]);

		//Define path generator
		path = d3.geo.path()
						 .projection(projection);	 
							
		//Create SVG element
		svg = d3.select("#indiana")
					.append("svg")
					.attr("width", width)
					.attr("height", height);
		
		loadData();
	}//end of setMap()
	
	function loadData() {
		//Begin a queue to asynchronously load data and color map			
		queue() 
			.defer(d3.csv, "populationdata.csv")
			.defer(d3.json, "indiana.json")
			.await(processData);
	}//end of loadData()
	
	function processData(error, data, json) {		
		//get the county names out of json for later
		for (var i in json.features) {    // for each geometry object
   			for (var j in data) {	//for each row in data file
				if (data[j].county_name == json.features[i].properties.name) {
					for(var k in data[i]) {   // for each column in the a row within the CSV
         				 if(k != "fips" && k != "region") {  // let"s not add the name or id as props since we already have them
          					  if(attributes.indexOf(k) == -1) { //if k is not in the attributes array already
               					attributes.push(k);  // add new column headings to our array for later
          					  }
           				 json.features[i].properties[k] = Number(data[j][k])  // add each CSV column key/value to geometry object
          			    }
          			}
					break;	
				}	
			}
		}
				
		d3.select(".panel-body").selectAll("input")
			.data(attributes)
			.enter()
			.append("label")
				.attr("for",function(d,i){ return attributes[i]; })
				.text(function(d) { return d; })
			.append("input")
				.attr("type", "radio")
				.attr("name", "data")
				.attr("id", function(d,i) { return attributes[i]; })
				.on("change", function(d){
					if(this.checked){
						expressed = $.inArray(d3.select(this).attr("id"), attributes);
						console.log(expressed);
						sequenceMap(); 
					}
				});
    
		d3.select("#clock").html(attributes[expressed]);
		drawMap(json);
	}//end of processData()
	
	function drawMap(json) {
		svg.selectAll(".county")   // select country objects (which don"t exist yet)
      		.data(json.features)  // bind data to these non-existent objects
      		.enter().append("path") // prepare data to be appended to paths
     		.attr("class", "county") // give them a class for styling and access later
      		.attr("d", path) // create them using the svg path generator defined above
      		.attr("align","left")
			.on("mouseover", function(d){
				d3.select(this).style("opacity", "1");
				
				//Update the tooltip position and value
				d3.select("#tooltip")
				  .transition()
				  .style("left",(d3.event.pageX + 5) + "px")
				  .style("top", (d3.event.pageY + 5) + "px")
				  .select("#countyName")
				  .text(d.properties.name);
				  
				d3.select("#attribute")
				  .text(attributes[expressed] + ": ");
				
				d3.select("#value")
				  .text(d.properties[attributes[expressed]]);

				//Show the tooltip
				d3.select("#tooltip").classed("hidden", false);
			 })
			.on("mouseout", function(){
				d3.select(this).style("fill", function(d) {
					return getColor(d.properties[attributes[expressed]], dataRange)  // give them an opacity value based on their current value
			    })
			    .style("opacity", "0.7");
				
				d3.select("#tooltip").classed("hidden", true);
			 })
			 .on("click", function(d){ 
			 	window.location = "counties/index.php?id=" + parseName(d.properties.name);
			 });
		   			
		var dataRange = getDataRange(); // get the min/max values from the current year"s range of data values
		d3.selectAll(".county")  // select all the counties
		.style("fill", function(d) {
			return getColor(d.properties[attributes[expressed]], dataRange);  // give them an opacity value based on their current value
		})
		.style("opacity", "0.7");
    }//end of drawMap()
	
	function sequenceMap() {
  		var dataRange = getDataRange(); // get the min/max values from the current year"s range of data values
		d3.selectAll(".county").transition()  //select all the counties and prepare for a transition to new values
		  .duration(750)  // give it a smooth time period for the transition
		  .attr("fill", function(d) {
			return getColor(d.properties[attributes[expressed]], dataRange);  // the end color value
		  })
	}//end of sequenceMap()
	
	function getColor(valueIn, valuesIn) {

	  var color = d3.scale.quantize() // create a linear scale
		 .domain([valuesIn[0],valuesIn[1]])  // input uses min and max values
		 .range(["rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)", "rgb(0,68,27)", "rgb(0,34,13)"]);   // output for opacity between .3 and 1 %

	  return color(valueIn);  // return that number to the caller
	}//end of getColor()
	
	function getDataRange() {
  		// function loops through all the data values from the current data attribute
 		// and returns the min and max values

	  var min = Infinity, max = -Infinity;  
	  d3.selectAll(".county")
		.each(function(d,i) {
		  var currentValue = d.properties[attributes[expressed]];
		  if(currentValue <= min && currentValue != -99 && currentValue != "undefined") {
			min = currentValue;
		  }
		  if(currentValue >= max && currentValue != -99 && currentValue != "undefined") {
			max = currentValue;
		  }
	  });
	  return [min,max]; 
	}//end of getDataRange()
	
	//takes in and reformats the county name
	function parseName(name) {
		var length = name.length;
		var county = name.substring(0, length - 10).toLowerCase();
		
		return county.replace(/\s/g, '');
	}
	
	init();
	
	//////////////////////////////////////////////////////
	//					   Graphs					    //
	//////////////////////////////////////////////////////
	
});
