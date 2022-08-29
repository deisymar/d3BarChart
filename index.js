const width = 900,
    height = 500,
    paddingX= 60,
    paddingY = 30;
let svgContainer;

let xmlhtpps = new XMLHttpRequest();

const createTitle =() => {
  return d3.selectAll('.container')
           .append('h2')
           .attr('id','title')
           .text("United States GDP");
};

const createCanvas =() => {
  return d3.selectAll('.container')
            .append('svg')
            .attr("width", width + paddingX)
            .attr("height", height + paddingY);
};

const createTooltip = () => {
  return d3.selectAll('.container')
    .append('div')
    .attr('id', 'tooltip');
}; 

const defineScales = (dates, gdps) => {
  
  const maxDate = d3.max(dates, (d) => new Date(d));
  const minDate = d3.min(dates, (d) => new Date(d));
  const maxGdps = d3.max(gdps, (d) => d);
  
  const xScale = d3.scaleTime()
                    .domain([minDate, maxDate])
                    .range([paddingX, width - paddingX / 3]);
  
  const yScale = d3.scaleLinear()
                    .domain([0, maxGdps])
                    .range([height - paddingY, paddingY]);
  
  return { xScale, yScale};
};

const createAxes = (scales) => {
  
  svgContainer.append('g')
              .attr('id','x-axis')
              .call(d3.axisBottom(scales.xScale))
              .attr('transform', `translate(0, ${height -paddingY})`);
  
  svgContainer.append('g')
              .attr('id','y-axis')
              .call(d3.axisLeft(scales.yScale))
              .attr('transform', `translate(${paddingX})`)
              .attr('class','tick');
};

const createBars = (dates, gdps, scales) => {
  
  svgContainer.selectAll("rect")
                .data(gdps)
                .enter()
                .append("rect")
                .attr("x", (d,i) => scales.xScale(new Date( dates[i])))
                .attr("y", (d) => scales.yScale (d))
                .attr("width", (width - paddingX *1.33) / gdps.length)
                .attr("height", (d) => height - scales.yScale(d) - paddingY)
                .attr("class","bar")
                .attr("data-date", (d,i) => dates[i])
                .attr("data-gdp", (d) => d)
                .on("mouseover", (e,d) => {
    let billion = d.toString().replace(/(\d)(?=(\d{3})+\.)/g , '$1,');
        d3.select("#tooltip")
          .style("opacity", 0.85)
          .style("left", e.pageX +6 +'px')
          .style("top", e.pageY +'px')
          .html(`<p>Date: ${dates[gdps.indexOf(d)]}</p><p>$${billion} Billion</p>`)
          .attr("data-date", dates[gdps.indexOf(d)])
  })
          .on("mouseout", () => {
            return d3.select("#tooltip")
                      .style("opacity",0)
                      .style("left", 0)
                      .style("top",0)
          });
};

const createLegend = (dataset) => {
      
   svgContainer.append("text")
                .attr("transform", 'rotate(-90)')
                .attr('x', -200)
                .attr('y', 80)
                .text((dataset.name.split(','))[0]);  
};

const createLinkInfo = (dataset) =>{
   d3.selectAll(".container")
      .append("div")
      .attr("id", "desc");
  
  d3.select("#desc")
      .append("p")
      .text("Data updated on: "+(dataset.updated_at).match(/^.{10}/));
   
  d3.select("#desc")
    .append("p")
    .text("More info at: " + (dataset.description).match(/http.+pdf/));
};

const sendResquestTpi = (xmlhtpps) => {
  const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
  const method = "GET";
  xmlhtpps.open(method, url, true);
  return xmlhtpps;  
};

xmlhtpps.onload = () => {  
  const dataset = JSON.parse(xmlhtpps.responseText);
  
  const gdps = dataset.data.map( function (item) {
    return item[1];
  });
  
  const dates = dataset.data.map( function (item) {
    return item[0];
  });
  
    const scales = defineScales(dates, gdps); //{ xScale, yScale}
    createAxes(scales);
    createBars(dates, gdps, scales);
    createLinkInfo(dataset); 
    createLegend(dataset);
}

const leadingGdpChart = () => {
  createTitle();
  svgContainer = createCanvas();  
  createTooltip();
  xmlhtpps = sendResquestTpi(xmlhtpps);
  /*xmlhtpps.onload() will be call after send() function by the XHR infrastructure*/
  xmlhtpps.send();  
}

leadingGdpChart();