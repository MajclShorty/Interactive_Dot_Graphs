import * as d3 from "d3";


// Search for nodes in the rendered graph
export function findGraphNodes(text) {
    // Select all elements with class "node" & Filter nodes that contain the search text
    return d3.selectAll(".node").filter(function () {
      // Select the text element inside the node & Check if it contains the search text (not case sensitive)
      return d3.select(this).select("text").text().toLowerCase().includes(text.toLowerCase());
  });
}


// Search for edges in the rendered graph
export function findGraphEdges(text) {
  return d3.selectAll(".edge").filter(function () { 
    return d3.select(this).select("title").text().toLowerCase().includes(text.toLowerCase());  // Select the title element inside the edge & Check if it contains the search text (not case sensitive)
  });
}

// Reset the search results & Find all nodes and edges in the graph
export function unFadeSearchResults(text, isDirectDeps, direction) {
  const svgElement = d3.select("svg");
  const nodes = svgElement.selectAll(".node");
  const edges = svgElement.selectAll(".edge");

  // Reset highlighting
  nodes.classed("faded", true);
  edges.classed("faded", true);

  // Find and highlight searched nodes
  const foundNodes = findGraphNodes(text);
  foundNodes.classed("faded", false);

  // Highlight direct dependencies if checkbox is checked
  if (isDirectDeps) {
    edges.each(function() {
      const edge = d3.select(this);
      const edgeText = edge.select("title").text();
      if (!edgeText) return;
      const [source, target] = edgeText.split("->").map(s => s.trim());

      foundNodes.each(function() {
        const nodeLabel = d3.select(this).select("text").text().trim();

        if ((direction === "bidirectional" || direction === "downstream") && source === nodeLabel) {
          edge.classed("faded", false);
          nodes.each(function() {
            const targetNode = d3.select(this);
            if (targetNode.select("text").text().trim() === target) {
              targetNode.classed("faded", false);
            }
          });
        }
        
        if ((direction === "bidirectional" || direction === "upstream") && target === nodeLabel) {
          edge.classed("faded", false);
          nodes.each(function() {
            const sourceNode = d3.select(this);
            if (sourceNode.select("text").text().trim() === source) {
              sourceNode.classed("faded", false);
            }
          });
        }
      });
    });
  } else {
    // Highlight all connected dependencies recursively
    function highlightConnectedNodes(currentNode, dir) {
      edges.each(function() {
        const edge = d3.select(this);
        const edgeText = edge.select("title").text();

        if (!edgeText) return;

        const [source, target] = edgeText.split("->").map(s => s.trim());

        if ((dir === "bidirectional" || dir === "downstream") && source === currentNode) {
          edge.classed("faded", false);
          nodes.each(function() {
            const node = d3.select(this);
            const nodeLabel = node.select("text").text().trim();
            if (nodeLabel === target) {
              node.classed("faded", false);
              highlightConnectedNodes(target, dir);
            }
          });
        }

        if ((dir === "bidirectional" || dir === "upstream") && target === currentNode) {
          edge.classed("faded", false);
          nodes.each(function() {
            const node = d3.select(this);
            const nodeLabel = node.select("text").text().trim();
            if (nodeLabel === source) {
              node.classed("faded", false);
              highlightConnectedNodes(source, dir);
            }
          });
        }
      });
    }

    // Start highlighting from found nodes
    foundNodes.each(function() {
      const nodeLabel = d3.select(this).select("text").text().trim();
      if (direction === "bidirectional") {
        highlightConnectedNodes(nodeLabel, "downstream");
        highlightConnectedNodes(nodeLabel, "upstream");
      } else {
        highlightConnectedNodes(nodeLabel, direction);
      }
    });
  }

  return foundNodes;
}


// Reset the fading of all nodes and edges
export function resetSearchFading() {
  d3.selectAll(".node, .edge").classed("faded", false);
}
