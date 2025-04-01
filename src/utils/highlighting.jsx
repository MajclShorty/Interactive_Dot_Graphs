import * as d3 from "d3";

export function highlightNode(nodeLabel, direction, isDirectDeps) {
  const svgElement = d3.select("svg");
  const nodes = svgElement.selectAll(".node");
  const edges = svgElement.selectAll(".edge");

  // Reset highlighting
  nodes.classed("faded", true);
  edges.classed("faded", true);

  // Highlight (unfaid) clicked node
  nodes.each(function() {
    const node = d3.select(this);
    const currentLabel = node.select("text").text().trim();
    if (currentLabel === nodeLabel) {
      node.classed("faded", false);
    }
    
  });

  if (isDirectDeps) {
    // Highlight direct dependencies only if checkbox is checked
    edges.each(function() {
      const edge = d3.select(this);
      const edgeText = edge.select("title").text();

      if (!edgeText) return;

      const [source, target] = edgeText.split("->").map(s => s.trim());

      if ((direction === "bidirectional" || direction === "downstream") && source === nodeLabel) {
        edge.classed("faded", false);
        nodes.each(function() {
          const node = d3.select(this);
          if (node.select("text").text().trim() === target) {
            node.classed("faded", false);
          }
        });
      }

      if ((direction === "bidirectional" || direction === "upstream") && target === nodeLabel) {
        edge.classed("faded", false);
        nodes.each(function() {
          const node = d3.select(this);
          if (node.select("text").text().trim() === source) {
            node.classed("faded", false);
          }
        });
      }
    });
  } else {
    // Highlight all connected nodes if checkbox is not checked
    edges.each(function() {
      const edge = d3.select(this);
      const edgeText = edge.select("title").text();

      if (!edgeText) return;

      const [source, target] = edgeText.split("->").map(s => s.trim());

      if ((direction === "bidirectional" || direction === "downstream") && source === nodeLabel) {
        edge.classed("faded", false);
        nodes.each(function() {
          const node = d3.select(this);
          if (node.select("text").text().trim() === target) {
            node.classed("faded", false);
            highlightConnectedNodes(target, "downstream");
          }
        });
      }

      if ((direction === "bidirectional" || direction === "upstream") && target === nodeLabel) {
        edge.classed("faded", false);
        nodes.each(function() {
          const node = d3.select(this);
          if (node.select("text").text().trim() === source) {
            node.classed("faded", false);
            highlightConnectedNodes(source, "upstream");
          }
        });
      }
    });
  }

  // Recursive function to highlight all connected nodes
  function highlightConnectedNodes(currentNode, dir) {
    edges.each(function() {
      const edge = d3.select(this);
      const edgeText = edge.select("title").text();

      if (!edgeText) return;

      const [source, target] = edgeText.split("->").map(s => s.trim());

      if (dir === "downstream" && source === currentNode) {
        edge.classed("faded", false);
        nodes.each(function() {
          const node = d3.select(this);
          if (node.select("text").text().trim() === target) {
            node.classed("faded", false);
            highlightConnectedNodes(target, "downstream");
          }
        });
      }

      if (dir === "upstream" && target === currentNode) {
        edge.classed("faded", false);
        nodes.each(function() {
          const node = d3.select(this);
          if (node.select("text").text().trim() === source) {
            node.classed("faded", false);
            highlightConnectedNodes(source, "upstream");
          }
        });
      }
    });
  }
}

export function resetHighlighting() {
  const svgElement = d3.select("svg");
  const nodes = svgElement.selectAll(".node");
  const edges = svgElement.selectAll(".edge");
  nodes.classed("faded", false);
  edges.classed("faded", false);
}