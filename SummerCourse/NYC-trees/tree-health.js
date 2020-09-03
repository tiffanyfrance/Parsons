// create the svg
let svg = d3.select('svg'),
  margin = { top: 40, right: 20, bottom: 30, left: 40 },
  width = +svg.attr('width') - margin.left - margin.right,
  height = +svg.attr('height') - margin.top - margin.bottom,
  g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

// set x scale
let x = d3.scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.05)
  .align(0.1);

// set y scale
let y = d3.scaleLinear()
  .rangeRound([height, 0]);

// set the colors
let z = d3.scaleOrdinal()
  .range(['#979183', '#806f62', '#acc864', '#8ab446', '#2d6b22']);

let max;

let dur = 500;

let yAxisGroup;

let stackData;
let originalStackData;
let stackGroups;

// load the csv and create the chart
d3.csv('tree-health.csv', (d, i, columns) => {
  for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  return d;
}).then((data) => {
  let keys = ['Dead', 'Stump', 'Poor', 'Fair', 'Good'];

  data.sort((a, b) => a.boro.localeCompare(b.boro));
  x.domain(data.map((d) => d.boro));
  max = d3.max(data, (d) => d.total);
  y.domain([0, max]).nice();
  z.domain(keys);

  stackData = d3.stack().keys(keys)(data).reverse();  //helper function restructures data from csv to be in stacked format
  originalStackData = JSON.parse(JSON.stringify(stackData));

  g.append('g')
    .attr('class', 'axis xaxis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x));

  yAxisGroup = g.append('g')
    .attr('class', 'axis yaxis');

  stackGroups = g.append('g')
    .selectAll('g')
    .data(stackData)
    .enter().append('g')
    .attr('fill', (d) => z(d.key));

  showYAxis();
  showBars();
});

function showYAxis() {
  yAxisGroup.transition().duration(dur)
    .call(d3.axisLeft(y).ticks(null, 's').tickSize(-width));
}

function filter(elem, key) {
  document.querySelector('.selected').classList.remove('selected');

  elem.classList.add('selected');

  y.domain([0, 200000]).nice();

  for (let i in stackData) {
    let healthData1 = originalStackData[i];
    let healthData2 = stackData[i];

    for (let j in healthData1) {
      let boroData1 = healthData1[j];
      let boroData2 = healthData2[j];

      if (healthData2.key === key) {
        boroData2[1] = boroData1[1] - boroData1[0];
        boroData2[0] = 0;
      } else {
        boroData2[1] = 0;
        boroData2[0] = 0;
      }
    }
  }

  showYAxis();
  showBars();
}

function filterAll(elem) {
  document.querySelector('.selected').classList.remove('selected');

  elem.classList.add('selected');

  y.domain([0, max]).nice();

  for (let i in stackData) {
    let healthData1 = originalStackData[i];
    let healthData2 = stackData[i];

    for (let j in healthData1) {
      let boroData1 = healthData1[j];
      let boroData2 = healthData2[j];

      boroData2[1] = boroData1[1];
      boroData2[0] = boroData1[0];
    }
  }

  showYAxis();
  showBars();
}

function showBars() {
  stackGroups.selectAll('rect')
    .data((d) => d, d => d.data.boro)
    .join(
      enter => {
        enter.append('rect')
          .attr('x', (d) => x(d.data.boro))
          .attr('y', height)
          .attr('height', 0)
          .attr('width', x.bandwidth())
          .on('mouseover', () => tooltip.style('display', null))
          .on('mouseout', () => tooltip.style('display', 'none'))
          .on('mousemove', function (d) {
            let xPosition = d3.mouse(this)[0] - 5;
            let yPosition = d3.mouse(this)[1] - 5;
            let amount = d[1] - d[0];
            let status;

            for (let s in d.data) {
              if (d.data[s] === amount) {
                status = s;
                break;
              }
            }
            tooltip.attr('transform', `translate(${xPosition}, ${yPosition})`);
            tooltip.select('text').text('Health: ' + status + ' ' + amount)
          })
          .transition()
          .duration(dur)
          .attr('y', (d) => y(d[1]))
          .attr('height', (d) => y(d[0]) - y(d[1]))
      },
      update => {
        update.transition()
          .duration(dur)
          .attr('y', (d) => y(d[1]))
          .attr('height', (d) => y(d[0]) - y(d[1]))
      },
      exit => { }
    )
}

// Prep the tooltip bits, initial display is hidden
let tooltip = svg.append('g')
  .attr('class', 'tooltip')
  .style('display', 'none');

tooltip.append('rect')
  .attr('width', 150)
  .attr('height', 20)
  .attr('fill', 'white')
  .style('opacity', 0.5);

tooltip.append('text')
  .attr('x', 75)
  .attr('dy', '1.2em')
  .style('text-anchor', 'middle')
  .attr('font-size', '10px');
