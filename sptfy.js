// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 50, right: 30, bottom: 50, left: 50 },
          width = 600 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales for x and y axes

    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all four platforms or use
    // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform
    
    const platforms = [...new Set(data.map(d => d.Platform))];

    const xScale = d3.scaleBand()
                    .domain(platforms)
                    .range([0, width])
                    .padding(0.4);

    const yScale = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.Likes)])
                    .range([height, 0]);

    // Add scales     
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append("g").call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text("Number of Likes");

    // function to compute quartiles
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
    
        if (values.length === 0) return null; // Handle empty groups to avoid errors
    
        return {
            min: d3.min(values) ?? 0,
            q1: d3.quantile(values, 0.25) ?? 0,
            median: d3.quantile(values, 0.5) ?? 0, // Added median
            q3: d3.quantile(values, 0.75) ?? 0, // Added q3
            max: d3.max(values) ?? 0
        };
    };

    // groups the data by Platform, applying rollupFunction to compute the quartiles 
    // (q1, median, q3, min, max) for each platform
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    // iterates through each platform, assigning its x-coordinate based on xScale
    // the boxWidth determines the width of each box in the plot
    quantilesByGroups.forEach((quartiles, Platform) => {
        if (!quartiles) return;
        const x = xScale(Platform);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quartiles.min))
            .attr("y2", yScale(quartiles.max))
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        // Draw box
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
            .attr("fill", "steelblue")

        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quartiles.median))
            .attr("y2", yScale(quartiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 1);
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
      d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 50, right: 200, bottom: 50, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#barplot")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const x0 = d3.scaleBand()
                  .domain([...new Set(data.map(d => d.Platform))]) // unique platforms
                  .range([0, width])
                  .padding(0.2);
  
    const x1 = d3.scaleBand()
                  .domain([...new Set(data.map(d => d.PostType))]) // unique post types
                  .range([0, x0.bandwidth()])
                  .padding(0.05);
      
    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.AvgLikes)]) // Scale based on likes
                .range([height, 0]);
      
    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.PostType))])
      .range(["lightgreen", "lightblue", "lightcoral"]);    
         
    // Add scales x0 and y     
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Platform");
    
    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Average Likes");

  // Group container for bars
    const barGroups = svg.selectAll("bar")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.Platform)},0)`);

  // Draw bars
    barGroups.append("rect")
              .attr("x", d => x1(d.PostType))
              .attr("y", d => y(d.AvgLikes))
              .attr("width", x1.bandwidth())
              .attr("height", d => height - y(d.AvgLikes))
              .attr("fill", d => color(d.PostType));
      
    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {
      // Alread have the text information for the legend. 
      // Now add a small square/rect bar next to the text with different color.
      legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));

      legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");
  });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
      d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 50, right: 50, bottom: 80, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#lineplot")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Set up scales for x and y axes  
    const xScale = d3.scaleBand()
                      .domain(data.map(d => d.Date)) // Use dates as categorical values
                      .range([0, width])
                      .padding(0.1);

    const yScale = d3.scaleLinear()
                      .domain([0, d3.max(data, d => d.AvgLikes)]) // Scale based on max AvgLikes
                      .range([height, 0]);

    // Draw the axis, you can rotate the text in the x-axis here
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end") // rotate x-axis labels 
        .attr("transform", "rotate(-25)");

    svg.append("g").call(yAxis);

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Date");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .attr("text-anchor", "middle")
        .text("Average Likes");


    // Draw the line and path. Remember to use curveNatural. 
    const line = d3.line()
        .x(d => xScale(d.Date) + xScale.bandwidth() / 2) 
        .y(d => yScale(d.AvgLikes))
        .curve(d3.curveNatural); 
    
        svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("d", line);

});
