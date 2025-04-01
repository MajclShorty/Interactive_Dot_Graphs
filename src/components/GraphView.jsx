import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { graphviz } from "d3-graphviz";
import { highlightNode, resetHighlighting } from "../utils/highlighting";


const GraphViewer = ({ dotFileContent, direction, isDirectDeps }) => {
    const graphRef = useRef(null);                  // Reference to the graph container
    const directionRef = useRef(direction);         // State for direction dropdown
    const isDirectDepsRef = useRef(isDirectDeps);   // State for direct dependencies checkbox

    // Update the directionRef when the direction changes
    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);
    
    // Update the isDirectDepsRef when the isDirectDeps changes
    useEffect(() => {
        isDirectDepsRef.current = isDirectDeps;
    }, [isDirectDeps]);


    // Render the graph when the dot file content changes
    useEffect(() => {
        if (dotFileContent && graphRef.current) {
            // Render the graph
            graphviz(graphRef.current).renderDot(dotFileContent).on("end", () => {
                const svgElement = d3.select(graphRef.current).select("svg");   // Select the SVG element that contains the graph
                const gElement = svgElement.select("g");                        // Select the <g> element inside the SVG, that contains the graph


                // Get graph dimensions & Calculate graph center
                const box = gElement.node().getBBox(); // Return object with properties: x, y, width, height
                const width = box.width;
                const height = box.height;
                // box.x and box.y = coordinates of the upper left edge of the graph & Calculate center
                const centerX = box.x + width / 2;     
                const centerY = box.y + height / 2;    
                    
                svgElement.attr("width", width).attr("height", height).style("display", "block");


                // Zoom & Zoom range 20% - 1000%
                const zoom = d3.zoom().scaleExtent([0.2, 10]).on("zoom", (event) => {
                    gElement.attr("transform", event.transform);
                });
           
                svgElement.call(zoom);

                
                // Reset zoom & Center graph
                const initialScale = 0.8;
                // .translate(X,Y) = Move the graph to the center of the SVG & "centerX/Y * initialScale" = Offset correction for correct graph centering when initialScale is not 1
                const transform = d3.zoomIdentity.translate(width / 2 - centerX * initialScale, height / 2 - centerY * initialScale).scale(initialScale);
                svgElement.call(zoom.transform, transform);


                // Highlight nodes on click using the selected direction
                svgElement.selectAll(".node").on("click", function () {
                    const nodeLabel = d3.select(this).select("text").text().trim();
                    if (nodeLabel) {
                        resetHighlighting(); 
                        highlightNode(nodeLabel, directionRef.current, isDirectDepsRef.current);
                    }
                });


                // Reset highlighting by clicking ESC
                const handleKeyDown = (event) => {
                    if (event.key === "Escape") {
                        resetHighlighting();
                    }
                };
                
                d3.select(window).on("keydown", handleKeyDown);

                // Cleanup function
                return () => {
                    d3.select(window).on("keydown", null);
                };
            });
        }
    }, [dotFileContent]);

    return <div className="graph-inner" ref={graphRef}></div>;
};

export default GraphViewer;