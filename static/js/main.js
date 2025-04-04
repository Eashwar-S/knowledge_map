$(document).ready(function(){
    // Initialize Cytoscape with a breadthfirst layout and improved node style (text inside)
    var cy = cytoscape({
        container: document.getElementById('diagram'),
        elements: [],
        style: [
            {
                selector: 'node',
                style: {
                    'label': 'data(display)',
                    'font-size': '12px',
                    'text-halign': 'center',
                    'text-valign': 'center',
                    'color': '#000',
                    'background-color': '#ddd',
                    'width': '60px',
                    'height': '60px',
                    'text-wrap': 'wrap',
                    'text-max-width': '80px',
                    'border-width': 2,
                    'border-color': '#555'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#888',
                    'target-arrow-color': '#888',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'text-margin-y': -10,
                    'font-size': 10
                }
            }
        ],
        layout: {
            name: 'breadthfirst',
            directed: true,
            padding: 10,
            spacingFactor: 1.5
        }
    });

    // Function to load nodes and edges into the diagram with updated display label
    function loadElements(data) {
        var elements = [];
        data.nodes.forEach(function(node){
            elements.push({
                data: { 
                    id: node.id, 
                    label: node.label, 
                    content: node.content, 
                    type: node.type,
                    display: node.id + " - " + node.label
                }
            });
        });
        data.edges.forEach(function(edge){
            elements.push({
                data: { 
                    id: edge.from + '_' + edge.to, 
                    source: edge.from, 
                    target: edge.to, 
                    label: edge.label 
                }
            });
        });
        cy.add(elements);
        cy.layout({
            name: 'breadthfirst',
            directed: true,
            padding: 10,
            spacingFactor: 1.5
        }).run();
    }
    loadElements(initialData);

    // Function to highlight neighbors (connected nodes) in red
    function highlightNeighbors(nodeId) {
        var node = cy.getElementById(nodeId);
        if(node){
            var neighbors = node.neighborhood('node');
            neighbors.forEach(function(neighbor) {
                neighbor.style('background-color', 'red');
            });
        }
    }

    // Initialize Quill rich text editor in the modal
    var modal = document.getElementById("editor-modal");
    var span = document.getElementsByClassName("close")[0];
    var currentNodeId = null;
    var quill = new Quill('#editor-container', {
        theme: 'snow'
    });

    // When a node is clicked, open the editor modal with the node's content
    cy.on('tap', 'node', function(evt){
        var node = evt.target;
        currentNodeId = node.data('id');
        quill.root.innerHTML = node.data('content') || '';
        modal.style.display = "block";
    });

    // Close modal when clicking on the (x)
    span.onclick = function() {
        modal.style.display = "none";
    };

    // Close modal if clicked outside of the modal content
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    // Save note button handler (updated)
    $("#save-note").click(function(){
        var content = quill.root.innerHTML;
        $.post("/save_note", { node_id: currentNodeId, content: content, graph: currentGraph }, function(response){
            if(response.status === "success"){
                var node = cy.getElementById(currentNodeId);
                // Remove HTML tags and truncate content to 20 characters for display snippet
                var truncated = content.replace(/<[^>]*>?/gm, '').substring(0, 20);
                node.data('content', content);
                node.data('display', node.data('id') + " - " + node.data('label') + "\n" + truncated);
                // Re-run layout to update view
                cy.layout({
                    name: 'breadthfirst',
                    directed: true,
                    padding: 10,
                    spacingFactor: 1.5
                }).run();
                modal.style.display = "none";
            } else {
                alert("Error saving note");
            }
        });
    });

    // Handle Add Node form submission
    $("#add-node-form").submit(function(event){
        event.preventDefault();
        var formData = $(this).serialize();
        $.post("/add_node", formData, function(response){
            if(response.status === "success"){
                var node = response.node;
                var displayText = node.id + " - " + node.label;
                cy.add({
                    data: { 
                        id: node.id, 
                        label: node.label, 
                        content: node.content, 
                        type: node.type, 
                        display: displayText
                    }
                });
                cy.layout({
                    name: 'breadthfirst',
                    directed: true,
                    padding: 10,
                    spacingFactor: 1.5
                }).run();
                highlightNeighbors(node.id);
            } else {
                alert("Error adding node");
            }
        });
    });

    // Handle Add Edge form submission
    $("#add-edge-form").submit(function(event){
        event.preventDefault();
        var formData = $(this).serialize();
        $.post("/add_edge", formData, function(response){
            if(response.status === "success"){
                var edge = response.edge;
                cy.add({
                    data: { 
                        id: edge.from + '_' + edge.to, 
                        source: edge.from, 
                        target: edge.to, 
                        label: edge.label 
                    }
                });
                cy.layout({
                    name: 'breadthfirst',
                    directed: true,
                    padding: 10,
                    spacingFactor: 1.5
                }).run();
                highlightNeighbors(edge.from);
                highlightNeighbors(edge.to);
            } else {
                alert("Error adding edge");
            }
        });
    });

    // Handle Delete Node form submission (updated)
    $("#delete-node-form").submit(function(event) {
        event.preventDefault();
        var formData = $(this).serialize();
        $.post("/delete_node", formData, function(response) {
            if(response.status === "success"){
                var nodeId = $("input[name='node_id']").val();
                var node = cy.getElementById(nodeId);
                if(node) {
                    var connectedEdges = node.connectedEdges();
                    connectedEdges.remove();
                    node.remove();
                }
                // Re-run the layout to reflect changes immediately
                cy.layout({
                    name: 'breadthfirst',
                    directed: true,
                    padding: 10,
                    spacingFactor: 1.5
                }).run();
                alert("Node deleted successfully");
            } else {
                alert("Error deleting node");
            }
        });
    });

    // Handle Delete Edge form submission (updated)
    $("#delete-edge-form").submit(function(event) {
        event.preventDefault();
        var formData = $(this).serialize();
        $.post("/delete_edge", formData, function(response) {
            if(response.status === "success"){
                var fromId = $("input[name='from']").val();
                var toId = $("input[name='to']").val();
                var edge = cy.getElementById(fromId + '_' + toId);
                if(edge) {
                    edge.remove();
                }
                // Re-run the layout to update the diagram
                cy.layout({
                    name: 'breadthfirst',
                    directed: true,
                    padding: 10,
                    spacingFactor: 1.5
                }).run();
                alert("Edge deleted successfully");
            } else {
                alert("Error deleting edge");
            }
        });
    });

    // Handle Create Graph form submission
    $("#create-graph-form").submit(function(event) {
        event.preventDefault();
        var formData = $(this).serialize();
        $.post("/create_graph", formData, function(response) {
            if(response.status === "success"){
                window.location.href = "/?graph=" + response.graph;
            } else {
                alert("Error creating graph");
            }
        });
    });

    // Handle Select Graph form submission
    $("#select-graph-form").submit(function(event) {
        event.preventDefault();
        var graphName = $("input[name='graph']").val();
        window.location.href = "/?graph=" + graphName;
    });
});
