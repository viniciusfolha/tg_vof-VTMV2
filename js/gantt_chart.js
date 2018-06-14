class GanttChart{
	constructor(id,container,x,y,width,height){
		this.id = id;
		this.margin = {top: 3, right: 2, bottom: 30, left: 60};  
		this.x = x;
		this.y = y;
		this.totalWidth  = width;
		this.totalHeight = height;
		this.width = this.totalWidth - this.margin.left - this.margin.right;
		this.height = this.totalHeight - this.margin.top - this.margin.bottom;
		this.time = [];

		this.canvas = container.append("g")
		.attr("class", "gannt")
		.attr("transform","translate(" + (this.x + this.margin.left) + "," + (this.y + this.margin.top) + ")");

		this.xScale = d3.scaleTime().range([0, this.width]).clamp(true);
		this.yScale = d3.scaleTime().range([this.height,0 ]).clamp(true);

    	this.data = [];

    	this.xAxisGroup = this.canvas.append("g")
    	.attr("class","xAxis")
    	.attr("transform","translate(0,"+this.height+")");

    	this.xAxis = d3.axisBottom(this.xScale)
    	.tickSize(16, 0)
    	.tickFormat(d3.timeFormat("%B"));

    	this.xAxisGroup.call(this.xAxis);

    	this.yAxisGroup = this.canvas.append("g")
    	.attr("class","yAxis")
    	.attr("transform","translate(0,0)");

    	this.yAxis = d3.axisLeft(this.yScale);

    	this.yAxisGroup.call(this.yAxis);

    	this.bigRects;
    	this.ganntyear;

    	this.selectList = document.createElement("select");
    	this.selectList.id = "comboboxLine";
    	this.bargantt = this.canvas.append("g")
    	.attr("class", "bargantt");


    	this.heightCont = 30;
    	this.xScaleCont = d3.scaleTime().range([0, this.width]);
    	this.yScaleCont = d3.scaleLinear().range([this.heightCont,0]);
    	this.xAxisCont = d3.axisBottom(this.xScaleCont).ticks(20);
    	this.yAxisCont = d3.axisLeft(this.yScaleCont);

    	this.brush = d3.brushX()
    	.extent([[0, 0], [this.width, this.heightCont]])
    	.on("brush", this.brushed.bind(this));

    	this.zoom = d3.zoom()
    	.scaleExtent([1, Infinity])
    	.translateExtent([[0, 0], [this.width, this.height]])
    	.extent([[0, 0], [this.width, this.height]])
    	.on("zoom", this.zoomed.bind(this));

    	this.context = this.canvas.append("g")
    	.attr("class", "context")
    	.attr("transform", "translate(" + 0 + "," + (this.height + 20) +")");

    	this.color  = d3.scaleOrdinal(d3.schemeCategory20b);
    	this.dataYear;
    	this.color;
    }

    setData(data,opcoes){
    	this.data = data;
    	var that = this;

    	this.dataYear = d3.nest()
    	.key(function(d) { return d.trajetoria[0].datahora.getFullYear() })
    	.entries(this.data);
    	var auxDateDomain = d3.extent(this.dataYear.map(function(d){return d.key}));

    	var dt1 = new Date(auxDateDomain[0])
    	var dt2 = new Date(auxDateDomain[1],11,31);
    	var diffYear = Math.floor ( (dt2 - dt1) / 31536000000);

    	this.xScaleCont.domain([dt1,dt2]);
    	this.yScaleCont.domain([ 0 
    		, d3.max(this.dataYear, function(c) { return c.values.length; }) ]);


    	this.xScale.domain([new Date(2012, 0, 1), new Date(2012, 11, 31)]);

    	this.yScale.domain(this.xScaleCont.domain());


    	this.xAxis.scale(this.xScale);
    	this.yAxis.scale(this.yScale);

    	this.xAxisGroup.call(this.xAxis);
    	this.xAxisGroup.selectAll(".tick text")
    	.style("text-anchor", "start")
    	.attr("x", 6)
    	.attr("y", 6);

    	this.yAxisGroup.call(this.yAxis);
    	var t = this.height/diffYear  ;  

    	this.color  = d3.scaleOrdinal(d3.schemeCategory20b);
    	this.bigRects = this.canvas.append("g").attr("class", "bigrect")
    	.selectAll("rect")
    	.data(this.dataYear)
    	.enter()
    	.append("rect")
    	.attr("x", 0)
    	.attr("y", function(d, i){
    		return i*t ;
    	})
    	.attr("width",that.width)
    	.attr("height",t )
    	.attr("fill", function(d,i){
    		return that.color(i);
    	});

    	this.ganntyear = this.bargantt.selectAll(".ganntyear")
    	.data(this.dataYear).enter().append("g").attr("class", "ganntyear");

    	this.ganntyear.selectAll("rect")
    	.data(function(d){return d.values })
    	.enter().append("rect")
    	.attr("class", "rect_gannt")
    	.attr("y", function(d,i,j) { return that.yScale(new Date(d.trajetoria[0].datahora.getFullYear(),0)) - (i+1)*(t/j.length) })
    	.attr("height", function(d,i,j){ return t/j.length})
    	.attr("x", function(d) {var dtaux = new Date(d.dateDomain[0].getTime()); return that.xScale(dtaux.setFullYear(2012)); })
    	.attr("width", function(d) {var dtaux = new Date(d.dateDomain[0].getTime());
    		var dtaux1 = new Date(d.dateDomain[1].getTime());
    		return that.xScale(dtaux1.setFullYear(2012)) - that.xScale(dtaux.setFullYear(2012))})
    	.attr("fill", function(d) { return that.color(d.dateDomain[0].getFullYear()); })

    	var area = d3.area()
    	.defined(function(d) { return d; })
    	.curve(d3.curveStepBefore)
    	.x(function(d) { return that.xScaleCont( new Date (d.key,11,31)); })
    	.y1(function(d) { return that.yScaleCont(d.values.length); });
    	area.y0(that.yScaleCont(0));

    	this.dataYear.unshift({key : (dt1.getFullYear()) , values: [0]} );
    	this.context.append("g")
    	.append("path")
    	.datum(this.dataYear)
    	.attr("fill", "steelblue")
    	.attr("d", area);
    	this.dataYear.shift();

    	this.context.append("g")
    	.attr("class", "xAxis")
    	.attr("transform", "translate(0," + this.heightCont + ")")
    	.call(this.xAxisCont);

    	this.yAxisCont.tickValues(this.yScaleCont.domain());

    	this.context.append("g")
    	.attr("class", "yAxis")
    	.attr("transform", "translate(0,0)")
    	.call(this.yAxisCont);


    	this.context.append("g")
    	.attr("class", "brush")
    	.call(this.brush)
    	.call(this.brush.move, this.xScaleCont.range());

    	this.canvas.append("rect")
    	.attr("class", "zoom")
    	.attr("width", this.width)
    	.attr("height", this.height)
    	.attr("fill","none")
    	.attr("pointer-events","all")
    	.call(this.zoom);
	}

	zoomed() {
	  	if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush" && d3.event.sourceEvent.type === "start") return; // ignore zoom-by-brush

	  	var that = this;
	  	var t = d3.event.transform;
	  	this.yScale.domain(t.rescaleX(this.xScaleCont).domain());
	  	that.time = this.yScale.domain();
	  	this.context.select(".brush").call(this.brush.move, this.xScale.range().map(t.invertX, t));

	  	var auxDatafilt = this.data.filter(function(d){var val = ( 
	  		that.time[1] < d.dateDomain[0] || d.dateDomain[1] < that.time[0]   ); 
	  	return !val ;});

	  	var datafiltered = d3.nest()
	  	.key(function(d) { return d.trajetoria[0].datahora.getFullYear() })
	  	.entries(auxDatafilt);

	  	this.yAxis.scale(this.yScale);
	  	this.yAxisGroup.call(this.yAxis);	  

	  	var dt1 = this.yScale.domain()[0];
	  	var dt2 = this.yScale.domain()[1];

			dt1.setUTCMonth(0,1);
			dt2.setUTCMonth(11,31);

			var diffYear = datafiltered.length;
			var t = this.height/diffYear; 
			this.yScale.clamp(true);
			this.bigRects = this.canvas.select(".bigrect").selectAll("rect").data(datafiltered);
			this.bigRects.exit().remove();
			let enteredGannt = this.bigRects.enter().append("rect").attr("x", 0).attr("width",  that.width);

			this.bigRects.merge(enteredGannt)
			.attr("y", function(d, i){
				return that.yScale(new Date(d.key,11,31)) ;
			})
			.attr("height", function(d, i, e){
					return (that.yScale(new Date(d.key,0)) - that.yScale(new Date(d.key,11,31))); }
			 )
			.attr("fill", function(d,i){
				return that.color(i);
			});

			this.ganntyear  = this.canvas.select(".bargantt").selectAll(".ganntyear").data(datafiltered);
			this.ganntyear.exit().remove();
			let enteterdGanntYear = this.ganntyear.enter().append("g").attr("class", "ganntyear");
			this.smallBars = this.ganntyear.merge(enteterdGanntYear).selectAll("rect").data(function(d){ return d.values });
			let enteredSmallBars = this.smallBars.enter().append("rect")
			this.smallBars.exit().remove();


			var XdateAuxInit;
			var barHeight;
			var yAuxInit;
			var yAuxEnd;
			this.smallBars.merge(enteredSmallBars)
			.attr("y", function(d,i,j) {
					yAuxInit = that.yScale(new Date(d.dateDomain[0].getFullYear(),0)) ;
					yAuxEnd = that.yScale(new Date(d.dateDomain[0].getFullYear(),11,31));
					barHeight = yAuxInit - yAuxEnd;
					barHeight = barHeight/j.length;
					//return that.yScale(new Date(d.dateDomain[0].getFullYear(),0)) - (i+1)*(t/j.length);
				
					return yAuxEnd + barHeight*i;
				 
			})
			.attr("height", barHeight)
			.attr("x", function(d) { var aux = new Date(d.dateDomain[0].getTime()); 
									 XdateAuxInit= that.xScale(aux.setFullYear(2012)); 
									return XdateAuxInit;})
			.attr("width", function(d) {var dtaux = new Date(d.dateDomain[0].getTime());
				var dtaux1 = new Date(d.dateDomain[1].getTime());
				return that.xScale(dtaux1.setFullYear(2012)) - that.xScale(dtaux.setFullYear(2012))})
			.attr("fill", function(d) { return that.color(d.dateDomain[0].getFullYear()); })


			this.dispatcher.apply("selectionChanged",{callerID:that.id,time:that.time, datafiltered: auxDatafilt})

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

			var datafiltered = d3.nest()
			.key(function(d) { return d.trajetoria[0].datahora.getFullYear() })
			.entries(auxDatafilt);

			this.yAxis.scale(this.yScale);

			this.yAxisGroup.call(this.yAxis);


			var dt1 = this.yScale.domain()[0];

			var dt2 = this.yScale.domain()[1];

			dt1.setUTCMonth(0,1);
			dt2.setUTCMonth(11,31);

			var diffYear = datafiltered.length;
			var t = this.height/diffYear; 
			this.yScale.clamp(true);
			this.bigRects = this.canvas.select(".bigrect").selectAll("rect").data(datafiltered);
			this.bigRects.exit().remove();
			let enteredGannt = this.bigRects.enter().append("rect").attr("x", 0).attr("width",  that.width);

			this.bigRects.merge(enteredGannt)
			.attr("y", function(d, i){
				return that.yScale(new Date(d.key,11,31)) ;
			})
			.attr("height", function(d, i, e){
					return (that.yScale(new Date(d.key,0)) - that.yScale(new Date(d.key,11,31))); }
			 )
			.attr("fill", function(d,i){
				return that.color(i);
			});

			this.ganntyear  = this.canvas.select(".bargantt").selectAll(".ganntyear").data(datafiltered);
			this.ganntyear.exit().remove();
			let enteterdGanntYear = this.ganntyear.enter().append("g").attr("class", "ganntyear");
			this.smallBars = this.ganntyear.merge(enteterdGanntYear).selectAll("rect").data(function(d){ return d.values });
			let enteredSmallBars = this.smallBars.enter().append("rect")
			this.smallBars.exit().remove();


			var XdateAuxInit;
			var barHeight;
			var yAuxInit;
			var yAuxEnd;
			this.smallBars.merge(enteredSmallBars)
			.attr("y", function(d,i,j) {
					yAuxInit = that.yScale(new Date(d.dateDomain[0].getFullYear(),0)) ;
					yAuxEnd = that.yScale(new Date(d.dateDomain[0].getFullYear(),11,31));
					barHeight = yAuxInit - yAuxEnd;
					barHeight = barHeight/j.length;
					//return that.yScale(new Date(d.dateDomain[0].getFullYear(),0)) - (i+1)*(t/j.length);
				
					return yAuxEnd + barHeight*i;
				 
			})
			.attr("height", barHeight)
			.attr("x", function(d) { var aux = new Date(d.dateDomain[0].getTime()); 
									 XdateAuxInit= that.xScale(aux.setFullYear(2012)); 
									return XdateAuxInit;})
			.attr("width", function(d) {var dtaux = new Date(d.dateDomain[0].getTime());
				var dtaux1 = new Date(d.dateDomain[1].getTime());
				return that.xScale(dtaux1.setFullYear(2012)) - that.xScale(dtaux.setFullYear(2012))})
			.attr("fill", function(d) { return that.color(d.dateDomain[0].getFullYear()); })


			this.dispatcher.apply("selectionChanged",{callerID:that.id,time:that.time, datafiltered: auxDatafilt})

		}

	}

}