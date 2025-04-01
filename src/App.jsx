import React, { useState } from "react";
import FileList from "./components/Filelist";
import GraphViewer from "./components/GraphView";
import "./styles.css";
import buttonImage from "./img/button.png"; 

const App = () => {
  const [dotFileContent, setdotFileContent] = useState("");             // State to keep track of the DOT file content
  const [selectedFile, setSelectedFile] = useState(null);               // State to keep track of the selected file
  const [direction, setDirection] = useState("bidirectional");          // State to keep track of the selected direction for highlighting
  const [isDirectDeps, setIsDirectDeps] = useState(false);              // State to keep track of the selected direct dependencies
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);  // State to keep track of the sidebar collapse state
  const url = "server_url";

  // Set selected DOT file & Create GET request to the server
  const handleFileSelect = (file) => {
    fetch(url+`dotfile?file=${file}`).then((response) => response.text()).then((data) => {
        setdotFileContent(data);
        setSelectedFile(file);
      })
      .catch((error) => console.error("Error loading DOT file:", error));
  };


  // Direction change
  const handleDirectionChange = (selectedDirection) => {
    setDirection(selectedDirection);
  };


  // Direct dependencies toggle
  const handleToggleDirectDeps = (isChecked) => {
    setIsDirectDeps(isChecked)
  };
  

  // Sidebar collapse toggle
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="app">
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <button className="toggle-button" onClick={handleToggleSidebar}>
            <img className={`toggle-icon ${isSidebarCollapsed ? 'collapsed' : ''}`} src={buttonImage} />
        </button>
        <FileList 
          onFileSelect={handleFileSelect} 
          selectedFile={selectedFile} 
          onDirectionChange={handleDirectionChange} 
          onToggleDirectDeps={handleToggleDirectDeps}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      </div>
      <div className="graph-container">
      {dotFileContent && <GraphViewer dotFileContent={dotFileContent} direction={direction} isDirectDeps={isDirectDeps} />}
      </div>
    </div>
  );
};
export default App;
