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

	    this.canvas = container.append("g")
	    	.attr("transform","translate(" + (this.x + this.margin.left) + "," + (this.y + this.margin.top) + ")");


	   // this.xScale = d3.scaleLinear().range([0, this.width]),
    	this.xScale = d3.scaleTime().range([0, width]);
    	this.yScale = d3.scaleLinear().range([this.height, 0]),
    	
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


    	//
  		this.selectList = document.createElement("select");
  		this.selectList.id = "comboboxLine";


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
		this.toline = d3.line()
	   		.x(function(d) {  return new_xScale(d.datahora); })
		    .y(function(d) {  return new_yScale(d[that.selected]); });
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
        
        div.appendChild(this.selectList);
        
	    for (var i = 0; i < this.opcoes.length; i++) {
	        var option = document.createElement("option");
	        option.value = this.opcoes[i];
	        option.text = this.opcoes[i];
	        this.selectList.appendChild(option);
	    }
	    this.selectList.onchange = this.changeComboBox.bind(that);




	    this.xScale.domain([
		    d3.min(this.data, function(c) { return d3.min(c.trajetoria, function(d) { return d.datahora; }); }),
		    d3.max(this.data, function(c) { return d3.max(c.trajetoria, function(d) { return d.datahora; }); })
		]);

	  

	    this.yScale.domain([
		    d3.min(this.data, function(c) { return d3.min(c.trajetoria, function(d) { return d[that.selected]; }); }),
		    d3.max(this.data, function(c) { return d3.max(c.trajetoria, function(d) { return d[that.selected] }); })
		]);

	    this.zScale.domain(this.data.map(function(c) { return c.idObj; }));


	    this.xAxis = d3.axisBottom(this.xScale);

	 	var xScale = this.xScale;
	 	var yScale = this.yScale;
	 	this.toline = d3.line()
	   		.x(function(d) {  return xScale(d.datahora); })
		    .y(function(d) {  return yScale(d[that.selected]); });





		



		this.do_grid();
	    this.update();

  	}

  	changeComboBox(thisCont){

  		this.selected   = thisCont.target.value;

  		this.yScale.domain([
		    d3.min(this.data, function(c) { return d3.min(c.trajetoria, function(d) { return d[thisCont.target.value]; }); }),
		    d3.max(this.data, function(c) { return d3.max(c.trajetoria, function(d) { return d[thisCont.target.value]; }); })
		]);

		var xScale = this.xScale;
	 	var yScale = this.yScale;
	 	this.toline = d3.line()
	   		.x(function(d) {  return xScale(d.datahora); })
		    .y(function(d) {  return yScale(d[thisCont.target.value]); });
		this.xAxis.scale(this.xScale);
	    this.xAxisGroup.call(this.xAxis);

	    this.yAxis.scale(this.yScale);
	    this.yAxisGroup.call(this.yAxis);
	    
	    var trans = d3.select("body").transition();
    
    // Make the changes
	    var transition = this.canvas.transition().duration(750),
        delay = function(d, i) { return i * 50; };
        var that = this;
        

	    this.yAxisGroup
		  .select("text")
		  .text(this.selected)


	    this.canvas
	        .selectAll(".line_chart")
	        .data(this.data)
	        .transition().duration(750)
  			.attr("class", "line_chart")
	      	.attr("d", function(d) { return that.toline(d.trajetoria)})
	      	.style("stroke", function(d) { return that.zScale (d.idObj); });
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
  setDomain(time){
  	this.xScale.domain(time);
  	this.xAxis.scale(this.xScale);
  	this.xAxisGroup.call(this.xAxis);
  	var that = this;

		this.toline = d3.line()
	   		.x(function(d) {  return that.xScale(d.datahora); })
		    .y(function(d) {  return that.yScale(d[that.selected]); });
  	this.newLines.attr("d", function(d) { return that.toline(d.trajetoria)})

  }
}