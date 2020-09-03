(() => {
  let margin = { top: 30, right: 30, bottom: 150, left: 30 },
    width = 960 - margin.right - margin.left,
    height = 500 - margin.top - margin.bottom;

  let svg = d3.select('#viz')
    .append('svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  let x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);

  let y = d3.scaleLinear()
    .range([height, 0]);

  d3.csv('tree-types.csv', (d) => {

    d.num = +d.num;
    return d;

  }).then((results) => {

    let maxVal = d3.max(results, d => d.num);

    x.domain(results.map(d => d.type));

    y.domain([0, maxVal])
      .nice();

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('x', x.bandwidth() / 2)
      .attr('y', 0)
      .attr('dy', '.35em')
      .attr('transform', 'rotate(90)')
      .attr('text-anchor', 'start');

    createBars(results);

    // let rangeSlider = document.getElementById('num-range');

    // rangeSlider.min = 0;
    // rangeSlider.max = maxVal;

    // rangeSlider.onchange = () => {
    //   let filteredData = results.filter(d => d.num >= rangeSlider.value);
    //   createBars(filteredData);
    // }

  }).catch((error) => {

    throw error;

  });

  function createBars(results) {
    svg.selectAll('.bar-group')
      .data(results, d => d.type)
      .join(
        enter => {
          let bar = enter.append('g')
            .attr('class', 'bar-group')
            .style('opacity', 1);

          bar.append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.type))
            .attr('y', d => y(0))
            .attr('width', x.bandwidth())
            .attr('height', 0)
            .style('fill', '#2d6b22')
            .transition()
            .duration(750)
            .attr('y', d => y(d.num))
            .attr('height', d => height - y(d.num));

          // bar.append('text')
          //   .text(d => d.num)
          //   .attr('x', d => x(d.type) + (x.bandwidth() / 2))
          //   .attr('y', d => y(d.num) - 5)
          //   .attr('text-anchor', 'middle')
          //   .style('font-family', 'sans-serif')
          //   .style('font-size', 10)
          //   .style('opacity', 0)
          //   .transition()
          //   .duration(500)
          //   .style('opacity', 1);
        },
        update => {
          update.transition()
            .duration(750)
            .style('opacity', 1);
        },
        exit => {
          exit.transition()
            .duration(750)
            .style('opacity', 0.15);
        }
      )
  }
})();