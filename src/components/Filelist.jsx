import React, { useState, useEffect, useCallback } from "react";
import { unFadeSearchResults, resetSearchFading } from "../utils/search";
import logo from "...logo_path";

const FileList = ({ onFileSelect, selectedFile, onDirectionChange, onToggleDirectDeps }) => {
  const [files, setFiles] = useState([]);                       // State to keep track of the list of DOT files
  const [searchTerm, setSearchTerm] = useState("");             // State to keep track of the search term
  const [foundNodesCount, setFoundNodesCount] = useState(0);    // State to keep track of the number of found nodes
  const [direction, setDirection] = useState("bidirectional");  // State to keep track of the selected direction for highlighting
  const [isDirectDeps, setIsDirectDeps] = useState(false);      // State to keep track of the selected direct dependencies
  const [err, setErr] = useState(null);                         // State to keep track of the error message
  const [fileSearchTerm, setFileSearchTerm] = useState("");
  const url = "server_url";

  // Recieve value from search input & Update search term
  const handleFileSearch = (event) => {
    setFileSearchTerm(event.target.value);
  };

  // Filter files based on search term
  const filteredFiles = files.filter(file => 
    file.toLowerCase().includes(fileSearchTerm.toLowerCase())
  );


  // Fetch list of DOT files one time
  useEffect(() => {
    fetch(url+"dotfiles")  // Recieve list of dot files 
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load file list");
        return response.json();
      })
      .then((data) => setFiles(data || []))  // Update state with list of files & Fallback to empty array if no data
      .catch((error) => setErr(error.message));
  }, []);


  // Receive search text & Update search term and count
  const handleSearchChange = useCallback((event) => {
    const text = event.target.value;
    setSearchTerm(text);

    if (text.length > 0) {
        const nodes = unFadeSearchResults(text, isDirectDeps, direction);
        setFoundNodesCount(nodes.nodes().length);
    } else {
        resetSearchFading();
        setFoundNodesCount(0);
    }
  }, [isDirectDeps, direction]);


  // Handle dropdown direction selection
  const handleDirectionChange = useCallback((event) => {
    const selectedDirection = event.target.value;
    setDirection(selectedDirection);
    onDirectionChange(selectedDirection);
  }, [onDirectionChange]);


  // Handle checkbox toggle
  const handleToggleChange = useCallback((event) => {
    const isChecked = event.target.checked;
    setIsDirectDeps(isChecked);
    onToggleDirectDeps(isChecked);
  }, [onToggleDirectDeps]);


  return (
    <div className="filelist-container">
      <img src={logo} alt="Navertica Logo" className="logo" />

      <div className="divider"></div>

      <h3 className="header">Graphs</h3>

      {searchTerm && foundNodesCount > 0 ? <p className="search-count">Nodes Found: {foundNodesCount}</p> : null}

      <input
        id="search"
        type="text"
        placeholder="Search for nodes..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />
      
      <select id="dropdown" value={direction} onChange={handleDirectionChange} className="direction-dropdown">
        <option value="" disabled>Select highlight direction</option>
        <option value="bidirectional">Bidirectional</option>
        <option value="upstream">Upstream</option>
        <option value="downstream">Downstream</option>
      </select>

      <div className="switch-div">
        <span className="switch-span">Direct Dependencies</span>
        <label className="switch-container">
          <input 
            type="checkbox" 
            checked={isDirectDeps}
            onChange={handleToggleChange}
          />
          <span className="slider round"></span>
        </label>
      </div>

      <input
        id="file-search"
        type="text"
        placeholder="Search for files..."
        value={fileSearchTerm}
        onChange={handleFileSearch}
        className="search-input"
      />
      
      <div className="files-container">
        <ul>
          {filteredFiles.map((file, index) => (
            <li key={index} onClick={() => onFileSelect(file)} className={file === selectedFile ? "selected" : ""}>
              {file.replace(/\.dot$/, '')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};


export default FileList;
