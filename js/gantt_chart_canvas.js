class GanttChartCanvas{
	constructor(divId,x,y,width,height){
	    this.period = "yearly";
		this.periods = ["daily", "monthly", "yearly"]; 
	    //this.period = "daily"; 
	    //this.period = "yearly";
		this.id = divId;
		this.margin = {top: 10, right: 10, bottom: 25, left: 3};  
		this.x = x;
		this.y = y;
		this.totalWidth  = width;
		this.totalHeight = height;
		this.width = this.totalWidth - this.margin.left - this.margin.right;
		this.height = this.totalHeight - this.margin.top - this.margin.bottom;
		this.time = [];
		this.brushHeight = 50;
		this.heightCanvas = this.height - this.brushHeight;
		var canvas  = d3.select("#" + divId).append("canvas");
		canvas
		.attr("id", "canvas")
		.attr("width", this.width)
		.attr("height", this.heightCanvas);

		this.contextSVG = d3.select("#" + divId)
		.append("svg")
		.attr("width",this.width)
		.attr("height",this.brushHeight);

		this.xScaleCont = d3.scaleTime().range([50, this.width]);
		this.yScaleCont = d3.scaleLinear().range([this.brushHeight - 17 ,4]);
		this.xAxisCont = d3.axisBottom(this.xScaleCont).ticks(20);
		this.yAxisCont = d3.axisLeft(this.yScaleCont);


    	this.context = canvas.node().getContext("2d");

		// Create an in memory only element of type 'custom'
		var detachedContainer = document.createElement("custom");

		// Create a d3 selection for the detached container. We won't
		// actually be attaching it to the DOM.
		this.dataContainer = d3.select(detachedContainer);
		this.brushes = [];
		this.xScale = d3.scaleTime().range([50, this.width]).clamp(true);
		//this.yScale = d3.scaleTime().range([this.heightCanvas + this.margin.top - this.margin.bottom , this.margin.top ]).clamp(true);
		this.yScale = d3.scaleBand().rangeRound([this.heightCanvas + this.margin.top - this.margin.bottom , this.margin.top ]);
		this.init = true;
		this.data;
		this.selectedData = [];
		this.createMenu();
	}


	setData(data){
		this.data = data;

		if(this.period === "yearly"){
			this.dataYear = d3.nest()
			.key(function(d) { return d.trajetoria[0].datahora.getFullYear() })
			.entries(data);
			var auxDateDomain = d3.extent(this.dataYear.map(function(d){return d.key}));
			var dt1 = new Date(auxDateDomain[0])
			var dt2 = new Date(auxDateDomain[1],11,31);
			this.xScaleCont.domain([dt1,dt2]);
			
			this.yScaleCont.domain([ 0 
				, d3.max(this.dataYear, function(c) { return c.values.length; }) ]);
		}else if(this.period === "daily"){
			var that = this;
			this.dataDay = d3.nest()
			.key(function(d) { return that.getDateDay(d.trajetoria[0].datahora)})
			.entries(data);
			var dt1 = d3.min(data,function(c) { return c.dateDomain[0]; });
			var dt2 = d3.max(data,function(c) { return c.dateDomain[1]; });
			
			this.xScaleCont.domain([dt1,dt2]);
			
			this.yScaleCont.domain([ 0 
				, d3.max(this.dataDay, function(c) { return c.values.length; }) ]);
		}else{
			var that = this;
			this.dataMonth = d3.nest()
			.key(function(d) { return that.getDateMonth(d.trajetoria[0].datahora)})
			.entries(data);


			var dt1 = d3.min(data,function(c) { return c.dateDomain[0]; });
			var dt2 = d3.max(data,function(c) { return c.dateDomain[1]; });
			
			this.xScaleCont.domain([new Date(dt1.getFullYear(),dt1.getMonth(),1),new Date(dt2.getFullYear(),dt2.getMonth(),31)]);
			
			this.yScaleCont.domain([ 0 
				, d3.max(this.dataMonth, function(c) { return c.values.length; }) ]);
		}

		this.drawBrushArea();

		this.gBrush = this.contextSVG.append("g")
		.attr("class", "brush");

		this.newBrush();
		this.drawBrushes();

    	
	}

	update(data){
		this.filteredData = data;
		var that = this;
		if(this.period === "yearly"){
    		this.dataYear = d3.nest()
    		.key(function(d) { return d.trajetoria[0].datahora.getFullYear() })
    		.entries(data);
    		var auxDateDomain = d3.extent(this.dataYear.map(function(d){return d.key}));

    		this.xScale.domain([new Date(2012, 0, 1), new Date(2012, 11, 31)]);
    		this.dateToShow = this.dataYear.map(x => x.key)
    		this.yScale.domain(this.dateToShow);

    		this.color  = d3.scaleOrdinal(d3.schemeCategory20b);
    		if(this.dateToShow.length > 1){
    			that.heightS = that.yScale(this.dateToShow[0]) - that.yScale(this.dateToShow[1]);
    		}else if(this.dateToShow.length==1) {
    			var aux = that.yScale.range();
    			that.heightS = aux[0] - aux[1];
    		}else{
    			return;
    		}
    		this.dataBinding = this.dataContainer.selectAll("custom.rect")
    			.data(this.dataYear, function(d) { return d; });
    	}else if(this.period === "daily"){
    		this.dataDay = d3.nest()
			.key(function(d) { return that.getDateDay(d.trajetoria[0].datahora)})//.sortKeys(function(a,b) { return parseInt(a) - parseInt(b); })
			.entries(data);

    		var auxDateDomain = d3.extent(this.dataDay.map(function(d){return d.key}));

    		this.xScale.domain([new Date(2012, 0, 1), new Date(2012, 0, 2)]);
    		this.dateToShow = this.dataDay.map(x => parseInt(x.key.substring(8,10)));
    		this.dateToShow = [...new Set(this.dateToShow)].sort(function(a,b){return a-b});
    		this.yScale.domain(this.dateToShow);

    		this.color  = d3.scaleOrdinal(d3.schemeCategory20b);
    		if(this.dateToShow.length > 1){
    			that.heightS = that.yScale(this.dateToShow[0]) - that.yScale(this.dateToShow[1]);
    		}else if(this.dateToShow.length==1) {
    			var aux = that.yScale.range();
    			that.heightS = aux[0] - aux[1];
    		}else{
    			return;
    		}
			this.dataNested = d3.nest()
				.key(function(d) { return d.trajetoria[0].datahora.getDate()})//.sortKeys(function(a,b) { return parseInt(a) - parseInt(b); })
				.entries(data);

    		this.dataBinding = this.dataContainer.selectAll("custom.rect")
    			.data(this.dataNested, function(d) { return d; });
    	}else{
    		this.dataMonth = d3.nest()
			.key(function(d) { return that.getDateMonth(d.trajetoria[0].datahora)})//.sortKeys(function(a,b) { return parseInt(a) - parseInt(b); })
			.entries(data);
    		var auxDateDomain = d3.extent(this.dataMonth.map(function(d){return d.key}));

    		this.xScale.domain([new Date(2012, 0, 1), new Date(2012, 0, 31)]);
    		this.dateToShow = this.dataMonth.map(x => parseInt(x.key.substring(5,7)));
    		this.dateToShow = [...new Set(this.dateToShow)].sort(function(a,b){return a-b});
    		this.yScale.domain(this.dateToShow);

    		this.color  = d3.scaleOrdinal(d3.schemeCategory20b);
    		if(this.dateToShow.length > 1){
    			that.heightS = that.yScale(this.dateToShow[0]) - that.yScale(this.dateToShow[1]);
    		}else if(this.dateToShow.length==1) {
    			var aux = that.yScale.range();
    			that.heightS = aux[0] - aux[1];
    		}else{
    			return;
    		}
			this.dataNested = d3.nest()
				.key(function(d) { return d.trajetoria[0].datahora.getMonth()})
				.entries(data);

    		this.dataBinding = this.dataContainer.selectAll("custom.rect")
    			.data(this.dataNested, function(d) { return d; });	    		
    	}

	  this.BindData();
	  this.smallBars.exit().remove();

	  this.clearCanvas();
	  this.drawCanvas();
	  this.drawxAxis();
	  this.drawyAxis();
	}

	changeComboBoxPeriod(thisCont){
		this.period = thisCont.target.value;
		var that = this;
		this.contextSVG.selectAll("*").remove();
		this.brushes = [];
		this.setData(this.data);
	}

	createMenu(){
		this.text = document.createTextNode("Period:"); 
	    var div = document.getElementById(this.id);
	    var divMenu = document.createElement("div");
	    divMenu.classList.toggle('menuclassGantt');
	    var h = document.createElement("H4");
	    var t = document.createTextNode("Menu");
	    h.appendChild(t);
	    divMenu.appendChild(h);	    
	    divMenu.appendChild(this.text);
	    div.appendChild(divMenu);
	    this.selectListPeriod = document.createElement("select");
		divMenu.appendChild(this.selectListPeriod);
	    for (var i = 0; i < this.periods.length; i++) {
	    	var optionPeriod = document.createElement("option");
	        optionPeriod.value = this.periods[i];
	    	optionPeriod.text = this.periods[i];
	    	this.selectListPeriod.appendChild(optionPeriod);	
	    }
	   	this.selectListPeriod.selectedIndex = 2;
	   	this.selectListPeriod.onchange = this.changeComboBoxPeriod.bind(this);
	}
	newBrush() {
		var that = this;
		var brush = d3.brushX()
		.extent([[50, 4], [this.width, this.brushHeight - 17]])
		.on("start", brushstart)
		.on("brush", brushed.bind(this))
		.on("end", brushend.bind(this));

		this.brushes.push({id: this.brushes.length, brush: brush});
		if(this.brushes.length==1){
				var brushSelection = this.gBrush
					.selectAll('.brush')
					.data(this.brushes, function (d){return d.id});

				// Set up new brushes
				brushSelection.enter()
				.insert("g", '.brush')
				.attr('class', 'brush')
				.attr('id', function(brush){ return "brush-" + brush.id; })
				.each(function(brushObject) {
				      //call the brush

				      brushObject.brush(d3.select(this));

				      if (brushObject.id === 0) {
				      brushObject.brush.move(d3.select(this), [that.width - 100, that.width]);};
			})
		}

		function brushstart() {
    		// your stuff here
    	};

    	function brushed() {
    		var that = this;
    		var newInterval = d3.brushSelection(arguments[2][0]).map(this.xScaleCont.invert, this.xScaleCont);;
    		this.brushes[arguments[0].id].range = newInterval;
    		var maxDate = d3.max(this.brushes, function(c) { if(c.range) return c.range[1]; })
    		var minDate = d3.min(this.brushes, function(c) { if(c.range) return c.range[0]; })

    		var auxDatafilt = this.data.filter(function(d){
    			return that.brushes.some(function(c){return c.range && !(c.range[1]  < d.dateDomain[0] || d.dateDomain[1] < c.range[0]) });
    		})

    		this.yScale.domain(minDate,maxDate);
			
			//this.xScale.domain(s.map(this.xScaleCont.invert, this.xScaleCont));

			that.time = this.yScale.domain();
			
			var test = 1;
			this.update(auxDatafilt);
			this.dispatcher.apply("selectionChanged",{callerID:that.id,time:that.time, datafiltered: auxDatafilt})
    	}

	    function brushend() {
		    // Figure out if our latest brush has a selection
		    var lastBrushID = this.brushes[this.brushes.length - 1].id;
		    var lastBrush = document.getElementById('brush-' + lastBrushID);
		    var selection = d3.brushSelection(lastBrush);

		    // If it does, that means we need another one
		    if (selection && selection[0] !== selection[1]) {
		    	this.newBrush();
		    }
		    		
		    // Always draw brushes
		    this.drawBrushes();
		}
	}

	drawBrushes() {
		var brushSelection = this.gBrush
		.selectAll('.brush')
		.data(this.brushes, function (d){return d.id});

		// Set up new brushes
		brushSelection.enter()
		.insert("g", '.brush')
		.attr('class', 'brush')
		.attr('id', function(brush){ return "brush-" + brush.id; })
		.each(function(brushObject) {
	      //call the brush
	      brushObject.brush(d3.select(this));
	  	});

		/* REMOVE POINTER EVENTS ON BRUSH OVERLAYS
		 *
		 * This part is abbit tricky and requires knowledge of how brushes are implemented.
		 * They register pointer events on a .overlay rectangle within them.
		 * For existing brushes, make sure we disable their pointer events on their overlay.
		 * This frees the overlay for the most current (as of yet with an empty selection) brush to listen for click and drag events
		 * The moving and resizing is done with other parts of the brush, so that will still work.
		 */
		 var that = this;
		 brushSelection
		 .each(function (brushObject){
		 	d3.select(this)
		 	.attr('class', 'brush')
		 	.selectAll('.overlay')
		 	.style('pointer-events', function() {
		 		var brush = brushObject.brush;
		 		if (brushObject.id === that.brushes.length-1 && brush !== undefined) {
		 			return 'all';
		 		} else {
		 			return 'none';
		 		}
		 	});
		 })

		 brushSelection.exit()
		 .remove();

	}



	drawBrushArea(){
		var that = this;
		if(this.period === "yearly"){
			var area = d3.area()
			.defined(function(d) { return d; })
			.curve(d3.curveStepBefore)
			.x(function(d) { return that.xScaleCont( new Date (d.key,11,31)); })
			.y1(function(d) { return that.yScaleCont(d.values.length); });

			area.y0(that.yScaleCont(0));

			this.dataYear.unshift({key : (that.xScaleCont.domain()[0].getFullYear()) , values: [0]} );

			this.contextSVG.append("g")
			.append("path")
			.datum(this.dataYear)
			.attr("fill", "steelblue")
			.attr("d", area);

			this.dataYear.shift();

			this.contextSVG.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0," + (this.brushHeight - 17) + ")")
			.call(this.xAxisCont);

			this.yAxisCont.tickValues(this.yScaleCont.domain());

			this.contextSVG.append("g")
			.attr("class", "yAxis")
			.attr("transform", "translate(50,0)")
			.call(this.yAxisCont);
		}else if(this.period === "daily"){

			var area = d3.area()
			.defined(function(d) { return d; })
			.curve(d3.curveStepBefore)
			.x(function(d) {return that.xScaleCont(new Date (d.key.substring(0,4), d.key.substring(5,7),d.key.substring(8,10) )); })
			.y1(function(d) { return that.yScaleCont(d.values.length); });

			area.y0(that.yScaleCont(0));

			this.dataDay.unshift({key : that.getDateDay(that.xScaleCont.domain()[0]) , values: [0]} );
			this.contextSVG.append("g")
			.append("path")
			.datum(this.dataDay)
			.attr("fill", "steelblue")
			.attr("d", area);

			this.dataDay.shift();

			this.contextSVG.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0," + (this.brushHeight - 17) + ")")
			.call(this.xAxisCont);

			this.yAxisCont.tickValues(this.yScaleCont.domain());

			this.contextSVG.append("g")
			.attr("class", "yAxis")
			.attr("transform", "translate(50,0)")
			.call(this.yAxisCont);
		}else{
			var area = d3.area()
			.defined(function(d) { return d; })
			.curve(d3.curveStepBefore)
			.x(function(d) {return that.xScaleCont(new Date (d.key.substring(0,4), d.key.substring(5,7),30)); })
			.y1(function(d) { return that.yScaleCont(d.values.length); });

			area.y0(that.yScaleCont(0));

			this.dataMonth.unshift({key : that.getPrevDateMonth(that.xScaleCont.domain()[0]) , values: [0]} );

			this.contextSVG.append("g")
			.append("path")
			.datum(this.dataMonth)
			.attr("fill", "steelblue")
			.attr("d", area);

			this.dataMonth.shift();

			this.contextSVG.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0," + (this.brushHeight - 17) + ")")
			.call(this.xAxisCont);

			this.yAxisCont.tickValues(this.yScaleCont.domain());

			this.contextSVG.append("g")
			.attr("class", "yAxis")
			.attr("transform", "translate(50,0)")
			.call(this.yAxisCont);
		}


	}

	drawyAxis(){
		var that = this;
		const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
		  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
		];
		var tickCount = 10,
		tickSize = 6,
		x0 = that.xScale.range()[0],
		y0 = that.yScale.range()[0],
		y1 = that.yScale.range()[1],
		tickSize = x0 - tickSize,
		tickPadding = 3;

			var ticks = this.dateToShow;

		//tickFormat = that.yScale.tickFormat(tickCount);
		//var tickFormat = that.yScale.tickFormat(5,d3.timeFormat("%B"));

		that.context.beginPath();
		ticks.forEach(function(d) {
			that.context.moveTo(tickSize, that.yScale(d));
			that.context.lineTo(x0, that.yScale(d));
		});
		that.context.strokeStyle = "black";
		that.context.stroke();

		that.context.beginPath();
		that.context.moveTo(tickSize, y0);
		that.context.lineTo(x0, y0);
		that.context.lineTo(x0, y1);
		that.context.lineTo(tickSize, y1);
		that.context.strokeStyle = "black";
		that.context.stroke();

		that.context.fillStyle = 'black';
		that.context.textAlign = "right";
		that.context.textBaseline = "middle";
		if(that.period === "monthly")
			ticks.forEach(function(d) {
				that.context.fillText(monthNames[d], tickSize - tickPadding, that.yScale(d) + that.heightS/2 );
			});
		else
			ticks.forEach(function(d) {
				that.context.fillText(d, tickSize - tickPadding, that.yScale(d) + that.heightS/2 );
			});
		that.context.save();
		that.context.rotate(-Math.PI / 2);
		that.context.textAlign = "right";
		that.context.textBaseline = "top";
		that.context.font = "bold 10px sans-serif";
		that.context.fillText("Date Time", -30, 0);
		that.context.restore();
	}

	drawxAxis() {
		var that = this;
		var tickCount = 10,
		tickSize = 10,
		x0 = that.xScale.range()[0],
		x1 = that.xScale.range()[1],
		ticks = that.xScale.ticks(tickCount),
		y1 = that.yScale.range()[0],
		y0 = y1 + tickSize;
		if(this.period === "yearly")
			var tickFormat = that.xScale.tickFormat(5,d3.timeFormat("%B"));
		else if(this.period === "daily")
			var tickFormat = that.xScale.tickFormat(5,d3.timeFormat("%H"));
		else
			var tickFormat = that.xScale.tickFormat(5,d3.timeFormat("%d"));
		this.context.beginPath();
		ticks.forEach(function(d) {
			that.context.moveTo(that.xScale(d), y1);
			that.context.lineTo(that.xScale(d), y0);
		});
		that.context.strokeStyle = "black";
		that.context.stroke();

		that.context.beginPath();
		that.context.moveTo(x0, y0);
		that.context.lineTo(x0, y1);
		that.context.lineTo(x1, y1);
		that.context.lineTo(x1, y0);

		that.context.strokeStyle = "black";
		that.context.stroke();

		that.context.fillStyle = 'black';
		that.context.textAlign = "center";
		that.context.textBaseline = "top";
		if(this.period === "yearly")
			ticks.forEach(function(d) {
				that.context.fillText(tickFormat(d), that.xScale(d) + 30, that.heightCanvas - 11);
			});
		else if(this.period === "daily")
			ticks.forEach(function(d) {
				that.context.fillText(tickFormat(d), that.xScale(d) + 7, that.heightCanvas - 11);
			});
		else
			ticks.forEach(function(d) {
				that.context.fillText(tickFormat(d), that.xScale(d) + 7, that.heightCanvas - 11);
			});
	}

	clearCanvas(){
	// clear canvas
		this.context.clearRect(0, 0, this.width, this.heightCanvas);
	}

	drawCanvas() {
		var that = this;

		var elements = this.dataContainer.selectAll("custom.rect");
		elements.each(function(d) {
			var node = d3.select(this);

			that.context.beginPath();
			var t =  d3.color(node.attr("fillStyle"));
			t.opacity = 0.2;
			that.context.fillStyle = t;
			that.context.rect(node.attr("x"), node.attr("y"), node.attr("width"), node.attr("height"));
			that.context.fill();
			that.context.closePath();

		});
		var smallrect = this.dataContainer.selectAll("custom.smallrect");
		smallrect.each(function(d) {
			var node = d3.select(this);
			that.context.beginPath();
			var t =  d3.color(node.attr("fillStyle"));
			that.context.fillStyle = t;
			that.context.rect(node.attr("x"), node.attr("y"), node.attr("width"), node.attr("height"));
			//that.context.rect(node.attr("x1"), node.attr("y1"), node.attr("width1"), node.attr("height1"));
			that.context.fill();
			that.context.closePath();
			if(node.attr("x1") !== null)
			{
				that.context.beginPath();
				that.context.fillStyle = t;
				that.context.rect(node.attr("x1"), node.attr("y"), node.attr("width1"), node.attr("height"));
				that.context.fill();
				that.context.closePath();
			}

		});
	}

	brushed() {
	  	if(this.dispatcher){
			if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom" && d3.event.sourceEvent.type === "start") return; // ignore brush-by-zoo
			var that = this;
			
			var s = d3.event.selection || this.xScaleCont.range();

			this.yScale.domain(s.map(this.xScaleCont.invert, this.xScaleCont));
			
			//this.xScale.domain(s.map(this.xScaleCont.invert, this.xScaleCont));

			that.time = this.yScale.domain();
			

			var auxDatafilt = this.data.filter(function(d){var val = ( that.time[1] < d.dateDomain[0] || d.dateDomain[1] < that.time[0]   ); 
				return !val ;});
/*
			var datafiltered = d3.nest()
			.key(function(d) { return d.trajetoria[0].datahora.getFullYear() })
			.entries(auxDatafilt);
			*/
			var test = 1;
			this.update(auxDatafilt);
			this.dispatcher.apply("selectionChanged",{callerID:that.id,time:that.time, datafiltered: auxDatafilt})

		}

	}

  	setHighlight(dataToHigh){
	  	var that = this;
	  	var toHigh =  this.dataContainer.selectAll("custom.smallrect").select( function(d) {return dataToHigh.some(e => d === e)?this:null;})
			.attr("fillStyle", "black");

		toHigh.each(function(d) {
			var node = d3.select(this);

			that.context.beginPath();
			var t =  d3.color(node.attr("fillStyle"));
			that.context.fillStyle = t;
			that.context.rect(node.attr("x"), node.attr("y"), node.attr("width"), node.attr("height"));
			that.context.fill();
			that.context.closePath();
			if(node.attr("x1") !== null)
			{

				that.context.beginPath();
				that.context.fillStyle = t;
				that.context.rect(node.attr("x1"), node.attr("y"), node.attr("width1"), node.attr("height"));
				that.context.fill();
				that.context.closePath();
			}
		});
  	}

  	clearHighlight(dataToHigh){
	  	var that = this;
	  	var test =  this.dataContainer.selectAll("custom.smallrect").select( function(d) {return dataToHigh.some(e => d === e)?this:null;})
			.attr("fillStyle",function(d){ return that.color(that.GetColorRect(d.dateDomain[0]))} );
		test.each(function(d) {
			var node = d3.select(this);

			that.context.beginPath();
			var t =  d3.color(node.attr("fillStyle"));
			that.context.fillStyle = t;
			that.context.rect(node.attr("x"), node.attr("y"), node.attr("width"), node.attr("height"));
			that.context.fill();
			that.context.closePath();

			if(node.attr("x1") !== null)
			{
				that.context.beginPath();
				that.context.fillStyle = t;
				that.context.rect(node.attr("x1"), node.attr("y"), node.attr("width1"), node.attr("height"));
				that.context.fill();
				that.context.closePath();
			}
		});
	
  	}


  	BindData(){
  		  var that = this;

  		  this.dataBinding
  		  	.attr("x", that.xScale.range()[0])
  		  	.attr("y", function(d, i){
  		  		return that.yScale(d.key) ;	})
  		  	.attr("height", function(d, i, e){
  		  		return that.heightS; })
  		  	.attr("width", that.width)
  		  	.attr("fillStyle", function(d, i){ return that.color(i);});

  		  // for new elements, create a 'custom' dom node, of class rect
		  // with the appropriate rect attributes
		  this.dataBinding.enter()
		  .append("custom")
		  .classed("rect", true)
		  .attr("x", that.xScale.range()[0])
		  .attr("y", function(d, i){
		  	return that.yScale(d.key) ;	})
		  .attr("height", function(d, i, e){
		  	return that.heightS; })
		  .attr("width", that.width)
		  .attr("fillStyle", function(d, i){ return that.color(i);});

		  // for exiting elements, change the size to 5 and make them grey.
		  this.dataBinding.exit().remove();

		  var auxRect =  this.dataContainer.selectAll("custom.rect");
		  this.smallBars = auxRect.selectAll("custom.smallrect").data(function(d){ return d.values });

		  if(this.period === "yearly"){
			  this.smallBars.each(that.bindSmallRectYear.bind(that));

			  this.smallBars.enter().append("custom").classed("smallrect", true)
			  .each(that.bindSmallRectYear.bind(that));
			}else if(this.period === "daily"){

				this.smallBars.each(that.bindSmallRectDay.bind(that));

				this.smallBars.enter().append("custom").classed("smallrect", true)
				.each(that.bindSmallRectDay.bind(that));
			}else{
				this.smallBars.each(that.bindSmallRectMonth.bind(that));

				this.smallBars.enter().append("custom").classed("smallrect", true)
				.each(that.bindSmallRectMonth.bind(that));
			}

  	}

  	getDateDay(date){
  		var dd =  date.getDate();
  		var mm = date.getMonth();
  		if(dd<10){
		    dd='0'+dd;
		} 
		if(mm<10){
		    mm='0'+mm;
		} 
  		return date.getFullYear() +"/" + mm +"/"+ dd;
  	}

  	getDateMonth(date){
  		var mm = date.getMonth();
		if(mm<10){
		    mm='0'+mm;
		} 
  		return date.getFullYear() +"/" + mm;
  	}

	getPrevDateMonth(date){
  		var mm = date.getMonth();
		if(mm<11){
		    mm='0'+(mm-1);
		}else if(mm === 0){
			return date.getFullYear()-1 +"/" + 11;
		}
  		return date.getFullYear() +"/" + mm;
  	}

  	bindSmallRectDay(d,i,j){			
  			var that = this;
			var aux = new Date(d.dateDomain[0].getTime()); 
			var XdateAuxInit= that.xScale(aux.setFullYear(2012,0,1)); 
			var day = d.dateDomain[0].getDate();
			var color  = that.color(day);

			var dtaux = new Date(aux);
			var dtaux1 = new Date(d.dateDomain[1].getTime());
			var oneDay = 86400000;
			if(d.dateDomain[1] - d.dateDomain[0] < oneDay){
				var width = that.xScale(dtaux1.setFullYear(2012,0,1)) - that.xScale(dtaux.setFullYear(2012,0,1))

				var yAuxInit = that.yScale(day) ;
				var yAuxEnd = that.yScale(day) + that.heightS;
				var barHeight = yAuxInit - yAuxEnd;
				barHeight = barHeight/j.length;
				var yprint = yAuxInit - barHeight*(i+1);
				d3.select(j[i])
				.attr("y", yprint)
				.attr("height", barHeight)
				.attr("x", XdateAuxInit)
				.attr("width", width)
				.attr("fillStyle", color)
				.attr("x1", null)
				.attr("width1", null);
			}else if(d.dateDomain[1] - d.dateDomain[0] < oneDay*2){
				var width = that.xScale.range()[1] - that.xScale(dtaux.setFullYear(2012,0,1))
				var width1 = that.xScale(dtaux1.setFullYear(2012,0,1)) - that.xScale.range()[0];
				var yAuxInit = that.yScale(day) ;
				var yAuxEnd = that.yScale(day) + that.heightS;
				var barHeight = yAuxInit - yAuxEnd;
				barHeight = barHeight/j.length;
				var yprint = yAuxInit - barHeight*(i+1);

				d3.select(j[i])
				.attr("y", yprint)
				.attr("height", barHeight)
				.attr("x", XdateAuxInit)
				.attr("width", width)
				.attr("fillStyle", color)
				.attr("x1", that.xScale.range()[0])
				.attr("width1", width1);

			}else{
		  		var width = that.xScale.range()[1] - that.xScale.range()[0];
				var yAuxInit = that.yScale(day) ;
				var yAuxEnd = that.yScale(day) + that.heightS;
				var barHeight = yAuxInit - yAuxEnd;
				barHeight = barHeight/j.length;
				var yprint = yAuxInit - barHeight*(i+1);
				
				d3.select(j[i])
				.attr("y", yprint)
				.attr("height", barHeight)
				.attr("x", that.xScale.range()[0])
				.attr("width", width)
				.attr("fillStyle", color)
				.attr("x1", null)
				.attr("width1", null);
			}			
  	}

  	GetColorRect(data){
  		if(this.period === 'yearly')
  			return data.getFullYear();
  		else if(this.period === 'monthly')
  			return data.getMonth();
  		else
  			return data.getDate();
  	}

  	bindSmallRectYear(d,i,j){
  			var that = this;
		  	var aux = new Date(d.dateDomain[0].getTime()); 
		  	var XdateAuxInit= that.xScale(aux.setFullYear(2012)); 
		  	var year = d.dateDomain[0].getFullYear();
		  	var color  = that.color(year);

		  	var dtaux = new Date(aux);
		  	var dtaux1 = new Date(d.dateDomain[1].getTime());

		  	if(d.dateDomain[1].getFullYear() - d.dateDomain[0].getFullYear() == 0){
		  		var width = that.xScale(dtaux1.setFullYear(2012)) - that.xScale(dtaux.setFullYear(2012))

		  		var yAuxInit = that.yScale(year) ;
		  		var yAuxEnd = that.yScale(year) + that.heightS;
		  		var barHeight = yAuxInit - yAuxEnd;
		  		barHeight = barHeight/j.length;
		  		var yprint = yAuxInit - barHeight*(i+1);
		  		d3.select(j[i])
		  		.attr("y", yprint)
		  		.attr("height", barHeight)
		  		.attr("x", XdateAuxInit)
		  		.attr("width", width)
		  		.attr("fillStyle", color)
		  		.attr("x1", null)
		  		.attr("width1", null);
		  	}else if(d.dateDomain[1].getFullYear() - d.dateDomain[0].getFullYear() == 1){
		  		var width = that.xScale.range()[1] - that.xScale(dtaux.setFullYear(2012));
		  		var yAuxInit = that.yScale(year) ;
		  		var yAuxEnd = that.yScale(year) + that.heightS;
		  		var barHeight = yAuxInit - yAuxEnd;
		  		barHeight = barHeight/j.length;
		  		var yprint = yAuxInit - barHeight*(i+1);

		  		var width1 = that.xScale(dtaux1.setFullYear(2012)) -  that.xScale.range()[0]
		  		d3.select(j[i])
		  		.attr("y", yprint)
		  		.attr("height", barHeight)
		  		.attr("x", XdateAuxInit)
		  		.attr("width", width)
		  		.attr("fillStyle", color)
		  		.attr("x1", that.xScale.range()[0])
		  		.attr("width1", width1);

		  	}else{
		  		var width = that.xScale.range()[1] - that.xScale.range()[0];
		  		var yAuxInit = that.yScale(year) ;
		  		var yAuxEnd = that.yScale(year) + that.heightS;
		  		var barHeight = yAuxInit - yAuxEnd;
		  		barHeight = barHeight/j.length;
		  		var yprint = yAuxInit - barHeight*(i+1);
		  		d3.select(j[i])
		  		.attr("y", yprint)
		  		.attr("height", barHeight)
		  		.attr("x", that.xScale.range()[0])
		  		.attr("width", width)
		  		.attr("fillStyle", color)
		  		.attr("x1", null)
		  		.attr("width1", null);
		  	}
	}

	bindSmallRectMonth(d,i,j){
  			var that = this;
			var aux = new Date(d.dateDomain[0].getTime()); 
			var XdateAuxInit= that.xScale(aux.setFullYear(2012,0)); 
			var month = d.dateDomain[0].getMonth();
			var color  = that.color(month);
			var dtaux = new Date(aux);
			var dtaux1 = new Date(d.dateDomain[1].getTime());

			if(d.dateDomain[1].getMonth() - d.dateDomain[0].getMonth() == 0){
				var width = that.xScale(dtaux1.setFullYear(2012,0)) - that.xScale(dtaux.setFullYear(2012,0));
				var yAuxInit = that.yScale(month) ;
				var yAuxEnd = that.yScale(month) + that.heightS;
				var barHeight = yAuxInit - yAuxEnd;
				barHeight = barHeight/j.length;
				var yprint = yAuxInit - barHeight*(i+1);
				d3.select(j[i])
				.attr("y", yprint)
				.attr("height", barHeight)
				.attr("x", XdateAuxInit)
				.attr("width", width)
				.attr("fillStyle", color)
				.attr("x1", null)
		  		.attr("width1", null);
			}else if(d.dateDomain[1].getMonth() - d.dateDomain[0].getMonth() == 1 || d.dateDomain[1].getMonth() - d.dateDomain[0].getMonth() == -11 ){
				var width = that.xScale.range()[1] - XdateAuxInit;
				var yAuxInit = that.yScale(month) ;
				var yAuxEnd = that.yScale(month) + that.heightS;
				var barHeight = yAuxInit - yAuxEnd;
				barHeight = barHeight/j.length;
				var yprint = yAuxInit - barHeight*(i+1);
				var width1 = that.xScale(dtaux1.setFullYear(2012,0)) -  that.xScale.range()[0];
		  		
				d3.select(j[i])
				.attr("y", yprint)
				.attr("height", barHeight)
				.attr("x", XdateAuxInit)
				.attr("width", width)
				.attr("fillStyle", color)
				.attr("x1", that.xScale.range()[0])
				.attr("width1", width1);
		  		
			}else{
				var width = that.xScale.range()[1] - that.xScale.range()[0];
				var yAuxInit = that.yScale(month) ;
				var yAuxEnd = that.yScale(month) + that.heightS;
				var barHeight = yAuxInit - yAuxEnd;
				barHeight = barHeight/j.length;
				var yprint = yAuxInit - barHeight*(i+1);
				d3.select(j[i])
				.attr("y", yprint)
				.attr("height", barHeight)
				.attr("x", that.xScale.range()[0])
				.attr("width", width)
				.attr("fillStyle", color)
				.attr("x1", null)
		  		.attr("width1", null);;
			}
	}


}