// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define the dimensions and margins for the SVG
    let 
        width = 600, 
        height = 400;
    
    let margin = {
        top: 30, 
        bottom: 50, 
        left: 50, 
        right: 30
    };
    

    // Create the SVG container
    let svg = d3.select('#scatterplot')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'lightyellow')
    

    // Set up scales for x and y axes
    // d3.min(data, d => d.bill_length_mm)-5

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    let xScale = d3.scaleLinear()
                .domain([d3.min(data, d => d.PetalLength)-0.5, d3.max(data, d => d.PetalLength)+0.5])
                .range([margin.left, width - margin.right]) 

    let yScale = d3.scaleLinear() 
                .domain([d3.min(data, d => d.PetalWidth)-0.5, d3.max(data, d => d.PetalWidth)+0.5])
                .range([height - margin.bottom, margin.top])


    // Add scales 
    let xAxis = svg.append('g')
                    .call(d3.axisBottom().scale(xScale))
                    .attr('transform', `translate(0, ${height - margin.bottom})`) 
                    
    let yAxis = svg.append('g')
                    .call(d3.axisLeft().scale(yScale))
                    .attr('transform', `translate(${margin.left} ,0)`)
    

    // Add circles for each data point
    let circle = svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', d=> xScale(d.PetalLength))
            .attr('cy', d=> yScale(d.PetalWidth))
            .attr('r', 5)
            .style('fill', d => colorScale(d.Species))
            .style('opacity', 0.7);
    

    // Add x-axis label
    svg.append('text')
        .attr('x', width/2)
        .attr('y', height - 15)
        .text('Petal Length')
        .style('text-anchor', 'middle')


    // Add y-axis label
    svg.append('text')
        .attr('x', 0 - height/2)
        .attr('y', 15)
        .text('Petal Width')
        .attr('transform', 'rotate(-90)')
    

    // Add legend
    const legend = svg.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(75," + (i * 20 + 35) + ")");

    legend.append("circle")
        .attr("cx", 0)  
        .attr("cy", 0) 
        .attr("r", 5)  
        .style("fill", d => colorScale(d))

    legend.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .text(d => d);
        
        

});



iris.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
    });
    

    // Define the dimensions and margins for the SVG
    let 
        width = 600, 
        height = 400;
    
    let margin = {
        top: 30, 
        bottom: 50, 
        left: 50, 
        right: 30
    };

    // Create the SVG container
    let svg = d3.select('#boxplot')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'lightyellow')
    

    // Set up scales for x and y axes
    let xScale = d3.scaleBand()
                .domain(data.map(d => d.Species))
                .range([margin.left, width - margin.right]) 
                .padding(0.5)

    let yScale = d3.scaleLinear() 
                .domain([d3.min(data, d => d.PetalLength)-0.5, d3.max(data, d => d.PetalLength)+0.5])
                .range([height - margin.bottom, margin.top])

    

    // Add scales     
    let xAxis = svg.append('g')
                    .call(d3.axisBottom().scale(xScale))
                    .attr('transform', `translate(0, ${height - margin.bottom})`)
    
    let yAxis = svg.append('g')
                    .call(d3.axisLeft().scale(yScale))
                    .attr('transform', `translate(${margin.left} ,0)`)


    // Add x-axis label
    svg.append('text')
        .attr('x', width/2)
        .attr('y', height - 15)
        .text('Species')
        .style('text-anchor', 'middle')
    

    // Add y-axis label
    svg.append('text')
        .attr('x', 0 - height/2)
        .attr('y', 15)
        .text('Petal Length')
        .attr('transform', 'rotate(-90)')
    

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const med = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const min = q1 - 1.5 * iqr;
        const max = q3 + 1.5 * iqr;

        return {q1, med, q3, iqr, min, max};
    };


    // Grouping by species and calculating the quartiles (q1, median, q3, min, and max) for each
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    // For each species, set the horizontal position and width of its boxplot
    quartilesBySpecies.forEach((quartiles, Species) => {
        const x = xScale(Species);
        const boxWidth = xScale.bandwidth();


        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.min))
            .attr("x2", x + boxWidth / 2)
            .attr("y2", yScale(quartiles.max))
            .attr("stroke", "black");
        
        // Draw box
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))  
            .attr("stroke", "black")
            .attr("fill", "lightblue");

        
        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("y1", yScale(quartiles.med))
            .attr("x2", x + boxWidth)
            .attr("y2", yScale(quartiles.med))
            .attr("stroke", "black");
        
    });
});