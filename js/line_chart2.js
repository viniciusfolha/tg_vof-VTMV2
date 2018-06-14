class LineChart{
	constructor(id,container,x,y,width,height){
		this.id = id;
	    this.margin = {top: 3, right: 2, bottom: 30, left: 40};  
	    this.x = x;
	    this.y = y;
	    this.totalWidth  = width;
	    this.totalHeight = height;
	    this.width = this.totalWidth - this.margin.left - this.margin.right;
	    this.height = this.totalHeight - this.margin.top - this.margin.bottom;
	    this.selectedIDS = [];
	    this.period = "yearly"; 
	    //this.period = "daily"; 
	    //this.period = "yearly"; 
	    this.periods = ["daily", "monthly", "yearly"];
	    this.canvas = container.append("g")
	    	.attr("transform","translate(" + (this.x + this.margin.left) + "," + (this.y + this.margin.top) + ")");


	   // this.xScale = d3.scaleLinear().range([0, this.width]),
    	this.xScale = d3.scaleTime().rangeRound([0, width]).clamp(true);
    	this.yScale = d3.scaleLinear().range([this.height, 0]).clamp(true);
    	
    	this.zScale = d3.scaleOrdinal(d3.schemeCategory20b);

	    this.data = [];

	    this.xAxisGroup = this.canvas.append("g")
	      .attr("class","xAxis")
	      .attr("transform","translate(0,"+this.height+")");
	    this.xAxis = d3.axisBottom(this.xScale);

	    this.xAxisGroup.call(this.xAxis);

	    

	  
	    this.yAxisGroup = this.canvas.append("g")
	      .attr("class","yAxis")
	      .attr("transform","translate(0,0)");

	    this.yAxis = d3.axisLeft(this.yScale);

	    this.yAxisGroup.call(this.yAxis);
	    this.opcoes;

	   	this.toline ;

	   	this.selected;
		this.opcoes;


		//
		this.zoom = d3.zoom()
    			.on("zoom", this.zoomFunction.bind(this));

    	/*
    	this.canvas = this.canvas.append("g")
		    .attr("class", "inner_space")
		    .attr("transform", "translate( 0, 0)")
		    .call(this.zoom);
		*/


    	this.rect = this.canvas
		    
		    .append("rect")
		      .attr("class", "zoom")
		      .attr("width", this.totalWidth)
		      .attr("height", this.height)
		      .attr("fill", "#FFFFFF")
		      .attr("transform", "translate(" + 0 + "," + 0 + ")")
		      .call(this.zoom);


		this.lines = this.canvas.append("g")
  			.attr("class", "line_chart");

		this.newLines;


		this.tip = d3.tip()
	      .attr("class", "d3-tip")
	      .offset([-8, 0])
	      .html(function(d) {
	      	return "ID: " + d.idObj 
	      	+ "<br/> Start Date: " + d.dateDomain[0].toLocaleString() 
	      	+ " <br/> End Date: " + d.dateDomain[1].toLocaleString() 
	      	; });
	    this.canvas.call(this.tip);

	    this.selectListPeriod = document.createElement("select");
    	//
    	this.selectedX;
  		this.selectListY = document.createElement("select");
  		//this.selectListY.style.position = "absolute";
	
  		//this.selectListY.style = "position: absolute; top: 10px;right: 0px;";
  		this.selectListY.id = "comboboxLine";

  		this.selectListX = document.createElement("select");
  		//this.selectListX.style.position = "absolute";
	
  		//this.selectListX.style = "position: absolute; top: 40px;right: 0px;";
  		this.selectListX.id = "comboboxLine";

  		 this.text = document.createTextNode("X-Axis:"); 

  		 //this.text.classList
	}

	zoomFunction(){
		
		var new_xScale = d3.event.transform.rescaleX(this.xScale)
		var new_yScale = d3.event.transform.rescaleY(this.yScale)
		//console.log(d3.event.transform)

		  // update axes
		this.xAxisGroup.call(this.xAxis.scale(new_xScale));
		this.yAxisGroup.call(this.yAxis.scale(new_yScale));

		  // update circle
		//this.newLines.attr("transform", d3.event.transform)
		var that = this;

		if(this.selectedX === "novadata"){
			this.toline = d3.line()
			   		.x(function(d) {  return new_xScale(d.novadata); })
				    .y(function(d) {  return new_yScale(d[that.selected]); })
		    	    .defined(function(d,i,j){
		  
		    	    	if(i === 0) return true; 
		    	    	else if(j[i].novadata >= j[i - 1].novadata) return true; 
		    	    	else return false;
		    	    });
	   	}else{
			this.toline = d3.line()
		   		.x(function(d) {  return new_xScale(d[that.selectedX]); })
			    .y(function(d) {  return new_yScale(d[that.selected]); });
		}
		this.newLines.attr("d", function(d) { return that.toline(d.trajetoria)})
	}


	do_grid(){
		var that = this;
		function make_x_gridlines() {		
		    return d3.axisBottom(that.xScale)
		        .ticks(5)
		}

		// gridlines in y axis function
		function make_y_gridlines() {		
		    return d3.axisLeft(that.yScale)
		        .ticks(5)
		}


		  // add the X gridlines
  	this.canvas.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + this.height + ")")
      .call(make_x_gridlines()
          .tickSize(-this.height)
          .tickFormat("")
      )

  // add the Y gridlines

  	this.canvas.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-this.totalWidth)
          .tickFormat("")
      )
          
	}


	setData(data,opcoes){
	    this.data = data;
	    this.opcoes = opcoes;
	    this.selected = this.opcoes[0];
        var that = this;
        var div = document.getElementById(this.id);
        var divMenu = document.createElement("div");
        divMenu.classList.toggle('menuclass');
        var h = document.createElement("H4");
	    var t = document.createTextNode("Menu");
	    h.appendChild(t);
	    divMenu.appendChild(h);	    
        divMenu.appendChild(this.text);
        div.appendChild(divMenu);

        divMenu.appendChild(this.selectListX);
	    t = document.createTextNode("Axis-Y:");
	    divMenu.appendChild(t);
        divMenu.appendChild(this.selectListY);

	    t = document.createTextNode("Period:");
	    divMenu.appendChild(t);
	    divMenu.appendChild(this.selectListPeriod);
	    

	    for (var i = 0; i < this.periods.length; i++) {
	    	var optionPeriod = document.createElement("option");
	        optionPeriod.value = this.periods[i];
	    	optionPeriod.text = this.periods[i];
	    	this.selectListPeriod.appendChild(optionPeriod);	
	    }
	    this.selectListPeriod.selectedIndex = 2;
	    this.selectListPeriod.onchange = this.changeComboBoxPeriod.bind(that);
	   
	    for (var i = 0; i < this.opcoes.length; i++) {
	        var optionY = document.createElement("option");
	        optionY.value = this.opcoes[i];
	        optionY.text = this.opcoes[i];
	        var optionX = document.createElement("option");
	        optionX.value = this.opcoes[i];
	        optionX.text = this.opcoes[i];
	        this.selectListY.appendChild(optionY);
	        this.selectListX.appendChild(optionX);
	    }
	    var optionX = document.createElement("option");
	        optionX.value = "novadata";
	        optionX.text = "Time";
	    this.selectedX = "novadata";
	    this.selectListX.appendChild(optionX);
	    this.selectListX.selectedIndex = opcoes.length;
	    this.selectListX.onchange = this.changeComboBoxX.bind(that);
	    
	    this.selectedIDS = data;
	    this.selectListY.onchange = this.changeComboBox.bind(that);

	    this.data.forEach(function(d){d.trajetoria.forEach(function(e){
	    	e.novadata = new Date(e.datahora);
	    	if(that.period === "yearly")
	    		e.novadata.setFullYear(2012);
	    	else if(that.period === "daily")
	    		e.novadata.setFullYear(2012,0,1);
	    	else
	    		e.novadata.setFullYear(2012,0);
	    })})

	    if(that.period === "yearly")
	    	this.xScale.domain([new Date(2012,0,1),new Date(2012,11,31)]);
	    else if(that.period === "daily")
	    	this.xScale.domain([new Date(2012,0,1),new Date(2012,0,1,23,59)]);
	    else
	    	this.xScale.domain([new Date(2012,0,1),new Date(2012,0,31,23,59)]);

/*
	    this.xScale.domain([
		    d3.min(this.data, function(c) { return d3.min(c.trajetoria, function(d) { return d.novadata }); }),
		    d3.max(this.data, function(c) { return d3.max(c.trajetoria, function(d) { return d.novadata }); })
		]);

*/	  

	    this.yScale.domain([
		    d3.min(this.data, function(c) { return d3.min(c.trajetoria, function(d) { return d[that.selected]; }); }),
		    d3.max(this.data, function(c) { return d3.max(c.trajetoria, function(d) { return d[that.selected] }); })
		]);

	    this.zScale.domain(this.data.map(function(c) { return c.idObj; }));

	    if(this.period === 'yearly')
	    	this.xAxis = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%b"));
	    else if(this.period === 'daily')
	    	this.xAxis = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%H"));
	    else
	    	this.xAxis = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%d"));

	 	var xScale = this.xScale;
	 	var yScale = this.yScale;
	 	this.toline = d3.line()
	   		.x(function(d) {  return xScale(d.novadata); })
		    .y(function(d) {  return yScale(d[that.selected]); })
		    .defined(function(d,i,j){
		    	if(i === 0) return true; 
		    	else if(j[i].novadata >= j[i - 1].novadata) return true; 
		    	else return false;
		    });

		this.do_grid();
	    this.update();

  	}

  	changeComboBox(thisCont){

  		this.selected = thisCont.target.value;

  		this.yScale.domain([
		    d3.min(this.selectedIDS, function(c) { return d3.min(c.trajetoria, function(d) { return d[thisCont.target.value]; }); }),
		    d3.max(this.selectedIDS, function(c) { return d3.max(c.trajetoria, function(d) { return d[thisCont.target.value]; }); })
		]);
  		var that = this;
		var xScale = this.xScale;
	 	var yScale = this.yScale;
	 	if(that.selectedX === "novadata"){
	 		console.log("dsada");
		 	this.toline = d3.line()
		   		.x(function(d) {  return xScale(d.novadata ); })
			    .y(function(d) {  return yScale(d[that.selected]); })
			    .defined(function(d,i,j){
			    	if(i === 0) return true; 
			    	else if(j[i].novadata >= j[i - 1].novadata) return true; 
			    	else return false;
			    });
	 	}else{
		 	this.toline = d3.line()
		   		.x(function(d) {  return xScale(d[that.selectedX] ); })
			    .y(function(d) {  return yScale(d[that.selected]); })
	 	}


		this.xAxis.scale(this.xScale);
	    this.xAxisGroup.call(this.xAxis);

	    this.yAxis.scale(this.yScale);
	    this.yAxisGroup.call(this.yAxis);
	    

	this.myLines = this.canvas.select(".line_chart").selectAll("path").data(this.selectedIDS);
	this.myLines.exit().remove();
	this.myLines.enter().append("path");
	this.myLines.transition()
                        .duration(50)
          				.attr("d", function(d) { return that.toline(d.trajetoria)})
	      				.style("stroke", function(d) { return that.zScale (d.idObj); }); 

	this.printCircle();
  	}

  	changeComboBoxPeriod(thisCont){
  		this.period = thisCont.target.value;
  		var that = this;

  	    this.selectedIDS.forEach(function(d){d.trajetoria.forEach(function(e){
  	    	e.novadata = new Date(e.datahora);
  	    	if(that.period === "yearly")
  	    		e.novadata.setFullYear(2012);
  	    	else if(that.period === "daily")
  	    		e.novadata.setFullYear(2012,0,1);
  	    	else
  	    		e.novadata.setFullYear(2012,0);
  	    })});


  	    if(this.selectedX === "novadata"){
  	    	if(that.period === "yearly")
  	    		this.xScale.domain([new Date(2012,0,1),new Date(2012,11,31)]);
  	    	else if(that.period === "daily")
    			this.xScale.domain([new Date(2012,0,1),new Date(2012,0,1,23,59)]);
    		else
    			this.xScale.domain([new Date(2012,0,1),new Date(2012,0,31,23,59)]);

	  	 	var xScale = this.xScale;
	  	 	var yScale = this.yScale;

 		 	this.toline = d3.line()
 		   		.x(function(d) {  return xScale(d.novadata ); })
 			    .y(function(d) {  return yScale(d[that.selected]); })
 			    .defined(function(d,i,j){
 			    	if(i === 0) return true; 
 			    	else if(j[i].novadata >= j[i - 1].novadata) return true; 
 			    	else return false;
 			    });

	  		if(this.period === 'yearly')
		    	this.xAxis = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%b"));
		    else if(this.period === 'daily')
		    	this.xAxis = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%H"));
		    else
		    	this.xAxis = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%d"));


			//this.do_grid();
			//d3.selectAll("path").remove();
			this.myLines = this.canvas.select(".line_chart").selectAll("path").remove();//	data(this.selectedIDS);

			this.myLines = this.canvas.select(".line_chart").selectAll("path").data(this.selectedIDS);

			this.myLines.enter().append("path").attr("d", function(d) { return that.toline(d.trajetoria)})
			      				.style("stroke", function(d) { return that.zScale (d.idObj); });  
	  		this.xAxis.scale(this.xScale);
		    this.xAxisGroup.call(this.xAxis);

		    this.yAxis.scale(this.yScale);
		    this.yAxisGroup.call(this.yAxis);
		    this.printCircle();
		    
		}
	    
  	}

  	changeComboBoxX(thisCont){
  		this.selectedX = thisCont.target.value;
  		var that = this;

  		this.data.forEach(function(d){d.trajetoria.forEach(function(e){
  			e.novadata = new Date(e.datahora);
  			if(that.period === "yearly")
  				e.novadata.setFullYear(2012);
  			else if(that.period === "daily")
  				e.novadata.setFullYear(2012,0,1);
  			else
  				e.novadata.setFullYear(2012,0);
  		})});

  		if(this.selectedX == "novadata"){
  			this.xScale = d3.scaleTime().rangeRound([0, this.totalWidth]).clamp(true);

			this.xAxis = d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%b"));
  		}else{
  			this.xScale = d3.scaleLinear().range([0, this.totalWidth]).clamp(true);

			this.xAxis = d3.axisBottom(this.xScale);

  		}

	  	this.xScale.domain([
		    d3.min(this.selectedIDS, function(c) { return d3.min(c.trajetoria, function(d) { return d[thisCont.target.value]; }); }),
		    d3.max(this.selectedIDS, function(c) { return d3.max(c.trajetoria, function(d) { return d[thisCont.target.value]; }); })
		]);
		
		var xScale = this.xScale;
		var yScale = this.yScale;
	 	if(that.selectedX === "novadata"){
		 	this.toline = d3.line()
		   		.x(function(d) {  return xScale(d.novadata ); })
			    .y(function(d) {  return yScale(d[that.selected]); })
			    .defined(function(d,i,j){
			    	if(i === 0) return true; 
			    	else if(j[i].novadata >= j[i - 1].novadata) return true; 
			    	else return false;
			    });
	 	}else{
		 	this.toline = d3.line()
		   		.x(function(d) {  return xScale(d[that.selectedX] ); })
			    .y(function(d) {  return yScale(d[that.selected]); })
	 	}
  		this.xAxis.scale(this.xScale);
	    this.xAxisGroup.call(this.xAxis);

	    this.yAxis.scale(this.yScale);
	    this.yAxisGroup.call(this.yAxis);
	    

		this.myLines = this.canvas.select(".line_chart").selectAll("path").data(this.selectedIDS);
		this.myLines.exit().remove();
		this.myLines.enter().append("path");
		this.myLines.transition()
	                        .duration(50)
	          				.attr("d", function(d) { return that.toline(d.trajetoria)})
		      				.style("stroke", function(d) { return that.zScale (d.idObj); }); 

		this.printCircle();
  	}

  	update(){
	    var myLines =
	      this.lines
	        .selectAll(".line_chart")
	        .data(this.data);
	    
	    myLines
	      .exit()
	      .remove();


	    var xScale = this.xScale;
	    var yScale = this.yScale;  

	    this.xAxis.scale(this.xScale);
	    this.xAxisGroup.call(this.xAxis);

	    this.yAxis.scale(this.yScale);
	    this.yAxisGroup.call(this.yAxis);

	   
	    var that = this;

	    this.newLines = myLines
	      .enter()
	      .append("path")
	      .merge(myLines)
	      .attr("d", function(d) { return that.toline(d.trajetoria)})
	      .style("stroke", function(d) { return that.zScale (d.idObj); });

	    this.xAxisGroup
		   	.append("text")             
	      	.attr("transform", "translate("+ this.width/2 +","+ this.margin.bottom +")")
	      	.attr("dy", "1em")
	      	.style("text-anchor", "middle")
	      	.attr("fill", "#000")
	      	.attr("opacity", 1)
	      	.text("Time");


	    this.yAxisGroup
		  .append("text")
	      .attr("transform", "rotate(-90)")
		  .attr("y", 0 - this.margin.left)
		  .attr("x",0 - (this.height / 2))
		  .attr("dy", "1em")
		  .style("text-transform", "capitalize")
		  .style("text-anchor", "middle")
		  .text(this.selected)
	      .attr("fill", "#000")
	    this.canvas
      		.append("text")
		        .attr("x", (this.width / 2))             
		        .attr("y", 0 - (this.margin.top / 2))
		        .attr("text-anchor", "middle")  
		        .style("font-size", "16px") 
		        .text("Time series");
			          
   

  }

  reset(){
  	var that = this;
	this.myLines = this.canvas.select(".line_chart").selectAll("path").data(this.data);
	this.myLines.exit().remove();
	let enteredLines = this.myLines.enter().append("path");
	this.myLines.merge(enteredLines)
          				.attr("d", function(d) { return that.toline(d.trajetoria)})
	      				.style("stroke", function(d) { return that.zScale (d.idObj); });              
  }

  setDomainRange( datafiltered){
  	var that = this;
	this.selectedIDS = datafiltered;
	
  	this.yScale.domain([
		    d3.min(this.selectedIDS, function(c) { return d3.min(c.trajetoria, function(d) { return d[that.selected]; }); }),
		    d3.max(this.selectedIDS, function(c) { return d3.max(c.trajetoria, function(d) { return d[that.selected]; }); })
	]);


  	if(this.selectedX === "novadata"){
  		this.selectedIDS.forEach(function(d){d.trajetoria.forEach(function(e){
  			e.novadata = new Date(e.datahora);
  			if(that.period === "yearly")
  				e.novadata.setFullYear(2012);
  			else if(that.period === "daily")
  				e.novadata.setFullYear(2012,0,1);
  			else
  				e.novadata.setFullYear(2012,0);
  		})});

  		if(that.period === "yearly")
  			this.xScale.domain([new Date(2012,0,1),new Date(2012,11,31)]);
  		else if(that.period === "daily")
  			this.xScale.domain([new Date(2012,0,1),new Date(2012,0,2)]);
  		else
  			this.xScale.domain([new Date(2012,0,1),new Date(2012,1,1)]);

		this.toline = d3.line()
		   		.x(function(d) {  return that.xScale(d[that.selectedX]); })
			    .y(function(d) {  return that.yScale(d[that.selected]); })
	    	    .defined(function(d,i,j){
	  
	    	    	if(i === 0) return true; 
	    	    	else if(j[i].novadata >= j[i - 1].novadata) return true; 
	    	    	else return false;
	    	    });
  	}else{
	  	this.xScale.domain([
			    d3.min(this.selectedIDS, function(c) { return d3.min(c.trajetoria, function(d) { return d[that.selectedX]; }); }),
			    d3.max(this.selectedIDS, function(c) { return d3.max(c.trajetoria, function(d) { return d[that.selectedX]; }); })
		]);

		this.toline = d3.line()
		   		.x(function(d) {  return that.xScale(d[that.selectedX]); })
			    .y(function(d) {  return that.yScale(d[that.selected]); });
  	}

    this.yAxis.scale(this.yScale);
	this.yAxisGroup.call(this.yAxis);



	this.myLines = this.canvas.select(".line_chart").selectAll("path").data(this.selectedIDS);
	this.myLines.exit().remove();
	let enteredLines = this.myLines.enter().append("path");
	this.myLines.merge(enteredLines).attr("d", function(d) { return that.toline(d.trajetoria)})
	      				.style("stroke", function(d) { return that.zScale (d.idObj); });              

  	
  }

  setHighlight(dataToHigh){
  	var that = this;
	this.highL = this.canvas.append("g")
  			.attr("class", "line_chartHigh");
  	var high = this.canvas.select(".line_chartHigh").selectAll("path").data(dataToHigh);
  	let enteredLines = high.enter().append("path");
  	high.merge(enteredLines)
  		.attr("d", function(d) { return that.toline(d.trajetoria)})
	    .attr("fill", "none")
	    .attr("stroke-dasharray", "2")
	    .attr("stroke-width","3")
    	.style("stroke","black");   
  		
  }

  clearHighlight(dataToHigh){
  	var that = this;
  	this.highL.remove();
  }

    createCircle(data){
    	var that = this;
    	this.selectedIDS = data;
    	data.forEach(function(d){d.trajetoria = d.trajetoria.sort(function(a,b){return a.datahora - b.datahora})});

    	var circle = this.canvas.append("g")
  			.attr("class", "circle_click");

		this.printCircle();

		this.myLines = this.canvas.select(".line_chart").selectAll("path").data(data);
		this.myLines.exit().remove();
		let enteredLines = this.myLines.enter().append("path");
		this.myLines.merge(enteredLines).attr("d", function(d) { return that.toline(d.trajetoria)})
		      				.style("stroke", function(d) { return that.zScale (d.idObj); });           

    }

    removeCircle(){
    	this.canvas.select(".circle_click").remove();
    }

    printCircle()
    {
    	var that = this;
    	this.highCircle = this.canvas.select(".circle_click").selectAll("circle").data(this.selectedIDS);
  		let enteredCircle = this.highCircle.enter().append("circle");
  		this.highCircle.exit().remove();
  		this.highCircle.merge(enteredCircle)
  			.attr("cx", function (d) { return that.xScale(d.trajetoria[0][that.selectedX]); })
			.attr("cy", function (d) { return that.yScale(d.trajetoria[0][that.selected]); })
			.attr("r", function (d) { return 5; })
			.style("fill", function(d) { return "steelblue" })
			.on('mouseover', function(d){ that.tip.show(d);  that.dispatcher.apply("selectionChanged",{callerID:that.id, typeOf : "Highlight" ,datafiltered: d});    })
			.on('mouseout', function(d){that.tip.hide(d);   that.dispatcher.apply("selectionChanged",{callerID:that.id, typeOf : "Nadir" ,datafiltered: d});   });

    }

}