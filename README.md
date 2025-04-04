# Knowledge Map

A dynamic web application for creating, editing, and visualizing knowledge graphs. Built with Flask, Cytoscape.js, and Quill, this tool lets you work with multiple graphs, add and delete nodes/edges, and update node details—all with immediate updates to the display.

## Features

- **Multiple Knowledge Graphs:**  
  Create, access, and manage multiple graphs. Each graph is saved as its own JSON file in the `data` directory.  
  - Access the default graph via [http://127.0.0.1:5000](http://127.0.0.1:5000)
  - Load a specific graph by appending a query parameter, e.g., [http://127.0.0.1:5000/?graph=MyGraph](http://127.0.0.1:5000/?graph=MyGraph)
  - Create a new graph using the "Create New Knowledge Graph" form.

- **Add and Edit Nodes:**  
  Nodes contain an ID, a label, and an editable note. When you update a node’s note using the rich text editor (powered by Quill), a truncated version of the note is shown alongside the node's ID and label.

- **Add and Delete Edges:**  
  Connect nodes with edges that include text labels. You can also delete edges, and the graph updates immediately.

- **Instantaneous Updates:**  
  Changes (saving notes, adding/deleting nodes or edges) re-run the layout immediately, so you see real-time updates without reloading the page.

- **Intuitive Tree Layout:**  
  The knowledge graph uses Cytoscape.js's breadthfirst layout for an intuitive, tree-like structure complete with directional arrows on edges.

- **Version Control Integration:**  
  With GitPython, every change (addition, deletion, or update) is automatically committed to a local Git repository for easy version tracking.

## Directory Structure


## Requirements

- Python 3.x
- Flask
- GitPython

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd knowledge_map

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt

## Running the Application
Start the Flask server by running:

    ```bash
    python app.py

## Usage
### Accessing Graphs
1. Default Graph: Simply visit http://127.0.0.1:5000 to work on the default graph.

2. Specific Graph: Access or load a specific graph by adding the graph name as a query parameter, e.g., http://127.0.0.1:5000/?graph=MyGraph.


## Creating a New Graph
Use the "Create New Knowledge Graph" form on the page:

1. Enter your desired graph name and click "Create Graph."

2. The new graph will be saved as data/<graph_name>.json and loaded automatically.