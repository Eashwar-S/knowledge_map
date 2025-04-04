import os
import json
from flask import Flask, render_template, request, jsonify
from git import Repo
from datetime import datetime

app = Flask(__name__, template_folder='templates')

# Helper: get file path for a given graph name
def get_data_file(graph_name):
    data_dir = 'data'
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    file_path = os.path.join(data_dir, f"{graph_name}.json")
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump({"nodes": [], "edges": []}, f, indent=4)
    return file_path

def load_data(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def save_data(data, file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)

def git_commit(message):
    try:
        repo = Repo('.')
    except Exception:
        repo = Repo.init('.')
    repo.index.add([message])  # We add the commit message file for simplicity.
    repo.index.commit(message)

@app.route('/')
def index():
    # Get the current graph from query parameters; default to 'default'
    graph = request.args.get('graph', 'default')
    file_path = get_data_file(graph)
    data = load_data(file_path)
    return render_template('index.html', data=json.dumps(data), graph=graph)

@app.route('/save_note', methods=['POST'])
def save_note():
    graph = request.form.get('graph', 'default')
    node_id = request.form.get('node_id')
    note_content = request.form.get('content')
    file_path = get_data_file(graph)
    data = load_data(file_path)
    updated = False
    for node in data['nodes']:
        if node['id'] == node_id:
            node['content'] = note_content
            updated = True
            break
    if updated:
        save_data(data, file_path)
        git_commit(f"Updated note for node {node_id} in graph {graph} at {datetime.now()}")
        return jsonify({"status": "success"})
    return jsonify({"status": "error", "message": "Node not found"}), 404

@app.route('/add_node', methods=['POST'])
def add_node():
    graph = request.form.get('graph', 'default')
    node_id = request.form.get('id')
    label = request.form.get('label')
    node_type = request.form.get('type')  # topic, block, item
    file_path = get_data_file(graph)
    data = load_data(file_path)
    new_node = {"id": node_id, "label": label, "type": node_type, "content": ""}
    data['nodes'].append(new_node)
    save_data(data, file_path)
    git_commit(f"Added node {node_id} ({label}) in graph {graph} at {datetime.now()}")
    return jsonify({"status": "success", "node": new_node})

@app.route('/add_edge', methods=['POST'])
def add_edge():
    graph = request.form.get('graph', 'default')
    from_id = request.form.get('from')
    to_id = request.form.get('to')
    label = request.form.get('label', '')
    file_path = get_data_file(graph)
    data = load_data(file_path)
    new_edge = {"from": from_id, "to": to_id, "label": label}
    data['edges'].append(new_edge)
    save_data(data, file_path)
    git_commit(f"Added edge from {from_id} to {to_id} in graph {graph} at {datetime.now()}")
    return jsonify({"status": "success", "edge": new_edge})

@app.route('/delete_node', methods=['POST'])
def delete_node():
    graph = request.form.get('graph', 'default')
    node_id = request.form.get('node_id')
    file_path = get_data_file(graph)
    data = load_data(file_path)
    # Remove the node and any edges connected to it.
    data['nodes'] = [node for node in data['nodes'] if node['id'] != node_id]
    data['edges'] = [edge for edge in data['edges'] if edge['from'] != node_id and edge['to'] != node_id]
    save_data(data, file_path)
    git_commit(f"Deleted node {node_id} from graph {graph} at {datetime.now()}")
    return jsonify({"status": "success"})

@app.route('/delete_edge', methods=['POST'])
def delete_edge():
    graph = request.form.get('graph', 'default')
    from_id = request.form.get('from')
    to_id = request.form.get('to')
    file_path = get_data_file(graph)
    data = load_data(file_path)
    data['edges'] = [edge for edge in data['edges'] if not (edge['from'] == from_id and edge['to'] == to_id)]
    save_data(data, file_path)
    git_commit(f"Deleted edge from {from_id} to {to_id} from graph {graph} at {datetime.now()}")
    return jsonify({"status": "success"})

@app.route('/create_graph', methods=['POST'])
def create_graph():
    graph = request.form.get('graph', 'default')
    file_path = get_data_file(graph)  # This will create the file if it doesn't exist.
    git_commit(f"Created new graph {graph} at {datetime.now()}")
    return jsonify({"status": "success", "graph": graph})

if __name__ == '__main__':
    # Ensure default graph exists
    get_data_file('default')
    app.run(debug=True)
