class MapL{
	constructor(id, width, height, color, divM){
		var that = this;
		var div = document.createElement("div");
		div.style.width = width +'px';
		div.style.height = height + 'px';
		div.id = id;
		this.schemaColor = "schemeRdYlGn";//'schemeReds';
		//this.schemaColor = "schemeReds";
		divM.appendChild(div);
		this.width = width;
		this.heightCanvas = height;
		this.color = color;
		debugger;
		this.map = L.map(id).setView([-22.906323, -43.182386], 12);

		this.svg = d3.select("#map").select("svg");
		this.g = this.svg.attr("id", "circles_layer");     


		var aux = d3.select("#map").selectAll("svg");
		this.newSVG = aux.filter(function (d, i) { return i === 1;})
		this.gLines = this.newSVG.attr("id", "lines_layer").select("g");
		this.canvas = L.canvas().addTo(this.map);
		this.data;
		this.info;
		this.idsObjs;
		this.legend;
		this.legend2;
		this.configData;
		this.circleGroup;
		this.featureL;
		this.toLine;
		this.Selected;
		this.selectedIDS = [];
		this.colorScale;
		this.segments;
		this.domainSelected;
		this.optionsDate = {  Weekday : {weekday: 'long'}, Year : {year: 'numeric'} , Month : {month: 'long'}, Day : {day: 'numeric'}, Hour : {"hour" : "numeric"} };
		this.legend = L.control({position: 'bottomright'});
	}

	setData(data, configData){
		var mapLink =  '<a href="http://openstreetmap.org">OpenStreetMap</a>';
		var link;
		if(configData.mapColor === 'blackAndWhite')
			link = 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png';
		else
			link = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		
		L.tileLayer(
			link, {
				attribution: '&copy; ' + mapLink + ' Contributors',
				maxZoom: 18,
			}).addTo(this.map);

		L.svg().addTo(this.map);	
		this.map.setView([data[0].trajetoria[0].latitude,data[0].trajetoria[0].longitude],5);
		this.idsObjs = d3.map(data, function(d){return d.idObj;}).keys()
		this.data = data;
		this.configData = configData;
		this.selectedIDS = data;

		
		/*
		this.createInfo();
		this.createLegend();
		this.createCircle(data);
		
		
		this.createLines()
		*/
		
		// Create an in memory only element of type 'custom'
		var detachedContainer = document.createElement("custom");
		this.dataContainer = d3.select(detachedContainer);
		this.Selected = this.configData.nomes[0];
		this.context = this.canvas._ctx;
		this.toLine = d3.line()
		.curve(d3.curveLinear)
		.x(function(d){
			return d.LayerPoint.x;
		})
		.y(function(d){
			return d.LayerPoint.y;
		})
		.context(this.context);


		//this.createLinesCanvas(data);
		
		var that = this;


		//this.map.on("viewreset", this.update.bind(that));
		this.map.on("moveend", this.update.bind(that));
		var comboBox = this.createComboBox();
		comboBox._container.firstChild.addEventListener("change", this.changeComboBox.bind(that));

		
	}
	createLinesCanvas(data)
	{
		var that = this;
		
		
		data.forEach(function(d){
			d.trajetoria.forEach(function(e){
				e.LayerPoint = that.map.latLngToLayerPoint(e.LatLng);
			})  
		});
		
		this.domainSelected = [
			d3.min(data, function(c) { return d3.min(c.trajetoria, function(d) { return d[that.Selected]; }); }),
			d3.max(data, function(c) { return d3.max(c.trajetoria, function(d) { return d[that.Selected] }); })
		];
		console.log(this.schemaColor);
		if(this.schemaColor === "schemeReds")
			this.colorScale = d3.scaleSequential(d3.interpolateReds)
				.domain(this.domainSelected);
		else
			this.colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
				.domain(this.domainSelected);
			

		
		this.dataBinding = this.dataContainer.selectAll("custom.linha")
		.data(data);

		this.dataBinding.exit().remove();

		this.dataBinding.enter()
			.append("custom")
			.classed("linha", true)
			.attr("cx", function(d){return d.trajetoria[0].LayerPoint.x})
			.attr("cy", function(d){return d.trajetoria[0].LayerPoint.y});

		this.dataBinding.attr("cx", function(d){return d.trajetoria[0].LayerPoint.x})
			.attr("cy", function(d){return d.trajetoria[0].LayerPoint.y});

		var auxRect =  this.dataContainer.selectAll("custom.linha");

		this.smallLines = auxRect.selectAll("custom.line").data(that.createsegments);

		this.smallLines.each(function(d,i)
		{
			d3.select(this)
			.attr("cor", that.colorScale( (d[0][that.Selected] + d[1][that.Selected])/2 ) );
		});
		this.smallLines.enter().append("custom").classed("line", true).each(function(d,i)
		{
			d3.select(this)
			.attr("cor", that.colorScale( (d[0][that.Selected] + d[1][that.Selected])/2 ) );
		});

		this.smallLines.exit().remove();
		this.clearCanvas();
		//this.context.clearRect(0, 0, that.width, that.heightCanvas);
		this.drawCanvas();	

		if(!this.init){
			this.createLegend2();
			this.init = true;
		}else{
			this.map.legend.setContent();	
		}

	}

	clearCanvas(){
		this.context.save();

		// Use the identity matrix while clearing the canvas
		this.context.setTransform(1, 0, 0, 1, 0, 0);
		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

		// Restore the transform
		this.context.restore();
	}

	drawCanvas() {
		var that = this;

		var elements = this.dataContainer.selectAll("custom.line");
		elements.each(function(d) {
			var node = d3.select(this);

			that.context.beginPath();
			that.toLine(d);
			that.context.lineWidth = 1.5;
			that.context.strokeStyle = node.attr("cor");
			that.context.stroke();

			that.context.closePath();

		});

		var circles = this.dataContainer.selectAll("custom.linha");
		circles.each(function(d){
			var node = d3.select(this);
			that.context.beginPath();
			that.context.arc(node.attr("cx"), node.attr("cy"), 4, 0, 2 * Math.PI, false);
			that.context.fillStyle = 'steelblue';
      		that.context.fill();
		});

	}

	changeComboBox(select){
		this.Selected = select.target.value;
		var that = this;
		
		
		this.domainSelected = [
		d3.min(this.selectedIDS, function(c) { return d3.min(c.trajetoria, function(d) { return d[select.target.value]; }); }),
		d3.max(this.selectedIDS, function(c) { return d3.max(c.trajetoria, function(d) { return d[select.target.value] }); })
		];
		
		this.colorScale.domain(this.domainSelected);
		this.createLinesCanvas(this.selectedIDS);
    	this.map.legend.setContent();	
	
	}

	createCircle(data){
		var that = this;

		
		var featureC = this.g.selectAll("g")
		.data(data)
		.enter()
		.append('g')
		.attr("id", "groupOfCircles")
		.attr('idObj', function (d) {
			return d.idObj;
		})
		.style("fill",  function(d) {return that.color(d.idObj); })

		this.circleGroup =	featureC.selectAll("circle")
		.data(function(d) {  return d.trajetoria; })
		.enter()
		.append("circle")
		.style("stroke", "black")  
		.style("opacity", 1) 
		.attr("r", 3)
		.on("mouseover", function(d) {

			var idObj = this.parentNode.getAttribute("idObj");
			that.info.update(d,idObj,that);
		})
		.on("mouseout", function(d){
			that.info.update();
		})
		.on("click", function(d){
						//
					})
		.attr("pointer-events","visible");  

		this.circleGroup.attr("transform", 
			function(d) {
				var pt = that.map.latLngToLayerPoint(d.LatLng);
				return "translate("+ 
				pt.x +","+ 
				pt.y +")";
			}
			)

	}

	reset(){
		var that = this;
		
		this.selectedIDS = this.data;
		
		this.domainSelected = [
		d3.min(this.selectedIDS, function(c) { return d3.min(c.trajetoria, function(d) { return d[that.Selected]; }); }),
		d3.max(this.selectedIDS, function(c) { return d3.max(c.trajetoria, function(d) { return d[that.Selected] }); })
		];

		this.colorScale.domain(this.domainSelected);
		this.featureL = this.newSVG.select("g").selectAll(".lines_group").data(that.selectedIDS);
		this.featureL.exit().remove();
		let enteredFeatureL = this.featureL.enter().append("g").attr("class", "lines_group");

		this.segments = this.featureL.merge(enteredFeatureL).selectAll("path")
		.data(that.createsegments);
		this.segments.exit().remove();
		let enteredSegments = this.segments.enter().append("path");
		this.segments.merge(enteredSegments).attr("d", that.toLine)
		.style("stroke", function(d) {return that.colorScale( (d[0][that.Selected] + d[1][that.Selected])/2 ) });

		this.map.legend.setContent();	
		
	}

	createsegments(values) {
		
		var traj = values.trajetoria
		var i = 0, n = traj.length, segments = new Array(n - 1);
		while (++i < n) segments[i - 1] = [traj[i - 1], traj[i]];

		return segments;
	}

	createLines(){
		var that = this;
		this.Selected = this.configData.nomes[0];
		this.domainSelected = [
		d3.min(this.data, function(c) { return d3.min(c.trajetoria, function(d) { return d[that.Selected]; }); }),
		d3.max(this.data, function(c) { return d3.max(c.trajetoria, function(d) { return d[that.Selected] }); })
		];
/*
		this.colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
		.domain(this.domainSelected);
*/

		this.toLine = d3.line()
		.curve(d3.curveLinear)
		.x(function(d){
			return that.map.latLngToLayerPoint(d.LatLng).x;
		})
		.y(function(d){
			return that.map.latLngToLayerPoint(d.LatLng).y;
		});

		this.featureL = this.gLines.selectAll(".lines_group")
		.data(this.data)
		.enter().append("g").attr("class","lines_group" );

		this.segments = this.featureL.selectAll("path")
		.data(that.createsegments)
		.enter().append("path")
		.attr("d", that.toLine)
		.style("stroke", function(d) {return that.colorScale( (d[0][that.Selected] + d[1][that.Selected])/2 ) });

	}

	update(cnt) {
		
		var that = this;
			/*
			this.circleGroup.attr("transform", 
					     function(d) {
						 var pt = that.map.latLngToLayerPoint(d.LatLng);
					return "translate("+ 
						pt.x +","+ 
						pt.y +")";
					}
				)
				*/	

				this.createLinesCanvas(this.selectedIDS);
				
			//	this.segments.attr("d", that.toLine)

		}

		createLegend(){

			this.legend = L.control({position: 'bottomright'});
			var that = this;
			this.legend.onAdd = function (map) {

				var div = L.DomUtil.create('div', 'info legend'),
				grades = [],
				labels = [];

				div.id = "legend_id"
				div.innerHTML = '<h4>Id Obj:</h4> '

				for (var i = 0; i < that.idsObjs.length; i++) {

					div.innerHTML +=
					'<i style="background:' + that.color(that.idsObjs[i]) + '"></i> ' +
					that.idsObjs[i] + (that.idsObjs[i+1] ? '<br>' : '');
				}


				L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
				return div;
			};


			this.legend.addTo(this.map);
		}
		createComboBox(){
			var that = this;
			var legend = L.control({position: 'bottomleft'});
			legend.onAdd = function (map) {
				var div = L.DomUtil.create('div', 'comboBox');

				var aux;
				for ( var x in that.configData.nomes){
					aux += '<option>' + that.configData.nomes[x] + '</option>';
				} 
				div.innerHTML = '<select id="comboboxMap">' + aux + '</select>';

				div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
				return div;
			};
			legend.addTo(this.map);
			return legend;
		}
		createLegend2(){

			var that = this;
			console.log(that.schemaColor);
			if(that.schemaColor === "schemeReds"){
				var color = d3.scaleQuantize()
				.domain(this.domainSelected)
				.range(d3.schemeReds['8']);
				var grades = d3.schemeReds['8'];
			}else{
				var color = d3.scaleQuantize()
				.domain(this.domainSelected)
				.range(d3.schemeRdYlGn['8']);
				var grades = d3.schemeRdYlGn['8'];
			}


			L.Legend = L.Control.extend({
				'onAdd': function (map) {

		        // add reference to mapinstance
		        map.legend = this;

		        var div = L.DomUtil.create('div', 'info legend2'),
		        labels = [];
		        console.log(that.schemaColor);
			
		        if(that.schemaColor === "schemeReds"){
		    		var color = d3.scaleQuantize()
		    		.domain(that.domainSelected)
		    		.range(d3.schemeReds['8']);
		    		var grades = d3.schemeReds['8'];
		    	}else{
		    		var color = d3.scaleQuantize()
		    		.domain(that.domainSelected)
		    		.range(d3.schemeRdYlGn['8']);
		    		var grades = d3.schemeRdYlGn['8'];
		    	}

		        div.id = "legend_id2"
		        div.innerHTML = '<h4>'+ that.Selected + ':</h4> '

		        for (var i = 0; i < grades.length; i++) {
		        	var aux = color.invertExtent(grades[i]);

		        	div.innerHTML +=
		        	'<i style="background:' + grades[i] + '"></i> ' +
		        	aux[0].toFixed(2) + (aux[1].toFixed(2) ? ' &ndash; ' + aux[1].toFixed(2) + '<br>' : '+');
		        }

				L.DomEvent.on(div, 'click', function (ev) {
					if(that.schemaColor === 'schemeReds')
						that.schemaColor = 'schemeRdYlGn';
					else
						that.schemaColor = 'schemeReds';

					that.createLinesCanvas(that.selectedIDS);
					that.map.legend.setContent();	
		        	L.DomEvent.stopPropagation(ev);
		      	});

		        return div;
		    },
		    'onRemove': function (map) {

		      // remove reference from mapinstance
		      delete map.legend;

		  },

		    // new method for setting innerHTML
		    'setContent': function() {
		    	console.log(that.schemaColor);
			
		    	if(that.schemaColor === "schemeReds"){
		    		var color = d3.scaleQuantize()
		    		.domain(that.domainSelected)
		    		.range(d3.schemeReds['8']);
		    		var grades = d3.schemeReds['8'];
		    	}else{
		    		var color = d3.scaleQuantize()
		    		.domain(that.domainSelected)
		    		.range(d3.schemeRdYlGn['8']);
		    		var grades = d3.schemeRdYlGn['8'];
		    	}

		    	var divinnerHTML = '<h4>'+ that.Selected + ':</h4> ';

		    	for (var i = 0; i < grades.length; i++) {
		    		var aux = color.invertExtent(grades[i]);

		    		divinnerHTML +=
		    		'<i style="background:' + grades[i] + '"></i> ' +
		    		aux[0].toFixed(2) + (aux[1].toFixed(2) ? ' &ndash; ' + aux[1].toFixed(2) + '<br>' : '+');
		    	}

		    	this.getContainer().innerHTML = divinnerHTML;

		    }
		});


			this.legend2 = that.map.addControl(new L.Legend({position: 'bottomleft'}));
		}

		createInfo(){
			var that = this;

			this.info = L.control({position: 'bottomright'});
			this.info.onAdd = function (map) {
		    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		    this.update();
		    return this._div;
		};
		this.info.update = function (trajetoria, idObj,that) {

			if(idObj){
				
				this._div.innerHTML = '<h4>' + idObj + '</h4>';
				for ( var x in that.configData.nomes){
					this._div.innerHTML += '<b>'+ that.configData.nomes[x] +' : </b> ' + trajetoria[that.configData.nomes[x]] + '<br />'
				}
				this._div.innerHTML += '<b> Time :</b>' + trajetoria.datahora
			}else{
				this._div.innerHTML = '<h4>ID</h4>' + 'Hover over a circle';
			}
			

		};
		this.info.addTo(this.map);
	}

	setDomainRange(datafiltered){
		
		this.selectedIDS = datafiltered;
		this.createLinesCanvas(datafiltered);
		
		/*var that = this;
		this.selectedIDS = datafiltered;
		//this.featureL.remove();
		
		this.domainSelected = [
		    d3.min(this.selectedIDS, function(c) { return d3.min(c.trajetoria, function(d) { return d[that.Selected]; }); }),
		    d3.max(this.selectedIDS, function(c) { return d3.max(c.trajetoria, function(d) { return d[that.Selected] }); })
		];

		this.colorScale.domain(this.domainSelected);
		this.featureL = this.newSVG.select("g").selectAll(".lines_group").data(datafiltered);
		this.featureL.exit().remove();
		let enteredFeatureL = this.featureL.enter().append("g").attr("class", "lines_group");

		this.segments = this.featureL.merge(enteredFeatureL).selectAll("path")
      				.data(that.createsegments);
      	this.segments.exit().remove();
      	let enteredSegments = this.segments.enter().append("path");
      	this.segments.merge(enteredSegments).attr("d", that.toLine)
      				.style("stroke", function(d) {return that.colorScale( (d[0][that.Selected] + d[1][that.Selected])/2 ) });
      				*/
    	this.map.legend.setContent();	
    }

    setHighlight(dataToHigh){
    	var that = this;
    	dataToHigh.forEach(function(d){
			d.trajetoria.forEach(function(e){
				e.LayerPoint = that.map.latLngToLayerPoint(e.LatLng);
			})  
		});
		
    	dataToHigh.forEach(function(d){
    		that.context.beginPath();
		  that.toLine(d.trajetoria);
		  that.context.strokeStyle = "black";
		  that.context.stroke();
	
    	});
    	  
    }

    clearHighlight(dataToHigh){
    	this.clearCanvas();
		this.drawCanvas();
    }

    createCircle(data){
    	this.selectedIDS = data;
    	this.createLinesCanvas(data);
    }

}