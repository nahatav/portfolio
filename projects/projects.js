import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

let query = '';
let selectedIndex = -1;
let selectedYear = null;

function updateTitle(count) {
  if (projectsTitle) {
    projectsTitle.textContent = `${count} Projects`;
  }
}

function getQueryFilteredProjects() {
  return projects.filter((project) => {
    const values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

function applyVisibleProjects(queryFiltered) {
  const visibleProjects =
    selectedYear === null
      ? queryFiltered
      : queryFiltered.filter((project) => project.year === selectedYear);

  renderProjects(visibleProjects, projectsContainer, 'h2');
  updateTitle(visibleProjects.length);
}

function renderPieChart(projectsGiven) {
  const newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  const newData = newRolledData.map(([year, count]) => ({
    value: count,
    label: year,
  }));

  if (
    selectedYear !== null &&
    !newData.some((d) => d.label === selectedYear)
  ) {
    newData.push({ value: 0, label: selectedYear });
  }

  selectedIndex =
    selectedYear === null
      ? -1
      : newData.findIndex((d) => d.label === selectedYear);

  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(newData);
  const arcs = arcData.map((d) => arcGenerator(d));
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  const svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  const legend = d3.select('.legend');
  legend.selectAll('li').remove();

  function handleSelect(index) {
    if (selectedIndex === index) {
      selectedIndex = -1;
      selectedYear = null;
    } else {
      selectedIndex = index;
      selectedYear = newData[index].label;
    }

    svg
      .selectAll('path')
      .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

    legend
      .selectAll('li')
      .attr('class', (_, idx) =>
        idx === selectedIndex ? 'legend-item selected' : 'legend-item',
      );

    applyVisibleProjects(getQueryFilteredProjects());
  }

  arcs.forEach((arc, i) => {
    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .attr('class', i === selectedIndex ? 'selected' : '')
      .on('click', () => handleSelect(i));
  });

  newData.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr(
        'class',
        idx === selectedIndex ? 'legend-item selected' : 'legend-item',
      )
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => handleSelect(idx));
  });
}

renderProjects(projects, projectsContainer, 'h2');
updateTitle(projects.length);
renderPieChart(projects);

searchInput?.addEventListener('input', (event) => {
  query = event.target.value;
  const filteredProjects = getQueryFilteredProjects();
  applyVisibleProjects(filteredProjects);
  renderPieChart(filteredProjects);
});
