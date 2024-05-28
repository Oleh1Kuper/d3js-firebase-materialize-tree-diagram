import { query, collection, onSnapshot, db } from './db.js';

const dims = { height: 500, width: 1100 };

const svg = d3.select('.canvas')
  .append('svg')
  .attr('width', dims.width + 100)
  .attr('height', dims.height + 100);

const graph = svg.append('g')
  .attr('transform', 'translate(50, 50)');

const stratify = d3.stratify()
  .id(d => d.name)
  .parentId(d => d.parent);

const tree = d3.tree().size([dims.width, dims.height]);
const color = d3.scaleOrdinal(d3['schemeSet3']);

const update = (data) => {
  color.domain(data.map(d => d.department));
  graph.selectAll('.node').remove();
  graph.selectAll('.link').remove();

  const rootNode = stratify(data);
  const treeData = tree(rootNode);
  const nodes = graph.selectAll('.node').data(treeData.descendants());

  const links = graph.selectAll('.link').data(treeData.links());

  links.enter().append('path')
    .attr('class', 'link')
    .attr('fill', 'none')
    .attr('stroke', '#aaa')
    .attr('stroke-width', 2)
    .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y))

  const enterNodes = nodes.enter().append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x}, ${d.y})`);

  enterNodes.append('rect')
  .attr('fill', d => color(d.data.department))
  .attr('stroke', '#555')
  .attr('stroke-width', 2)
  .attr('height', 50)
  .attr('width', d => d.data.name.length * 20)
  .attr('transform', d => {
    const x = d.data.name.length * 10;
    return `translate(${-x}, -25)`
  });

  enterNodes.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', 5)
    .attr('fill', '#fff')
    .text(d => d.data.name);
};

let data = [];
const q = query(collection(db, 'employees'));

onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    if (change.type === 'added') {
      data.push(doc);
    }

    if (change.type === 'modified') {
      const index = data.findIndex(item => item.id == doc.id);
      data[index] = doc
    }

    if (change.type === 'removed') {
      data = data.filter(item => item.id !== doc.id);
    }
  });
  console.log(data || 'none');
  update(data);
});
