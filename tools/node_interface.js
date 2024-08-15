class NodeVector {
    static Add(A, B)
    {
        if('w' in A && 'w' in B)
        {
            return {
                x: A.x + B.x,
                y: A.y + B.y,
                z: A.z + B.z,
                w: A.w + B.w
            };
        }
        else if('z' in A && 'z' in B)
        {
            return {
                x: A.x + B.x,
                y: A.y + B.y,
                z: A.z + B.z
            };
        }
        else if('y' in A && 'y' in B)
        {
            return {
                x: A.x + B.x,
                y: A.y + B.y
            };
        }
        else return A + B;
    }
}

class NodeInterface {
    
    constructor(canvas, cursor_menu, _minify = false, part_list = [], _parameters = {})
    {
        this.canvas = null;
        this.oldCanvas = null;
        this.minified = _minify;
        this.portRadius = 3;
        this.fontHeight = 20;
        this.fontPadding = 10;
        if(_parameters.title) this.title = _parameters.title;

        this.position = {x: 0, y: 0},

        this.menu = cursor_menu;

        this.nodes = [];
        this.selectedNode = null;
        this.draggedNode = null;
        this.draggedPosition = {x: 0, y: 0};
        this.selectedInput = {nodeIndex: -1, portIndex: -1};
        this.selectedOutput = {nodeIndex: -1, portIndex: -1};

        this.clickedNode = -1;
        this.path = _parameters.path;
        if(this.path)
        {
            let t_index = this.path.indexOf(".processes");
            this.parentPath = this.path.slice(0, t_index);
            this.relativePath = EngineUI.GetRelativePath(this.parentPath);
        }

        this.mousePosition = {x: 0, y: 0};
        this.mouseDownPosition = {x: 0, y: 0};

        this.draggedViewport = false;
        this.preventRightClick = false;
        this.viewport = {
            x: 0,
            y: 0,
            scale: 1.0,
            old_x: 0,   // for dragging
            old_y: 0,   // for dragging
        }


        this.pressedKey = "";
        this.copiedData = "";
        this.touchTimeout = true;

        this.ConnectCanvas(canvas);

        this.attributes = {};

        this.partList = part_list;

        this.mode = "process";

        this.lock = ("lock" in _parameters) ? _parameters.lock : true;
        this.allowEdit = _parameters.allow_edit ? _parameters.allow_edit : false;
        this.onnodeselect = _parameters.onnodeselect;
        this.onvalidate = _parameters.onvalidate;
        this.onsave = _parameters.onsave;

        this.DrawAll();
    }

    ConnectCanvas(canvas)
    {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.width = canvas.clientWidth;
        this.height = canvas.clientHeight;
        canvas.width = this.width;
        canvas.height = this.height;

        var nodeInterface = this;

        this.canvas.onmousedown = function(ev) {
            nodeInterface.MouseDown(ev);
        }
        this.canvas.onmouseup = function(ev) {
            nodeInterface.MouseUp(ev);
        }
        this.canvas.oncontextmenu = function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        this.canvas.onmousemove = function(ev) {
            nodeInterface.MouseMove(ev);
        }
        this.canvas.onmousewheel = function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            nodeInterface.Zoom(ev);
        }
        this.canvas.onkeydown = function(ev) {
            if(ev.key === "Delete")
            {
                if(nodeInterface.clickedNode >= 0) nodeInterface.DeleteNode(nodeInterface.nodes[nodeInterface.clickedNode]);
            }
            else if(ev.key === "Control")
            {
                nodeInterface.pressedKey = ev.key;
            }
            else
            {
                if(nodeInterface.pressedKey === "Control")
                {
                    if(ev.key === "c" && nodeInterface.clickedNode >= 0) nodeInterface.copiedData = JSON.stringify(nodeInterface.nodes[nodeInterface.clickedNode]);
                    else if(ev.key === "v" && nodeInterface.copiedData.length > 0) nodeInterface.DuplicateNode(null, nodeInterface.mousePosition, nodeInterface.copiedData);
                    else if(ev.key === "x" && nodeInterface.clickedNode >= 0)
                    {
                        nodeInterface.copiedData = JSON.stringify(nodeInterface.nodes[nodeInterface.clickedNode]);
                        nodeInterface.DeleteNode(nodeInterface.nodes[nodeInterface.clickedNode]);
                    }
                }
            }
        };

        this.canvas.ontouchstart = function(event) {
            event.stopPropagation();
            event.preventDefault();
    
            nodeInterface.touchTimeout = false;
            var nodeInterfaceBis = nodeInterface;
            setTimeout(function() {
                nodeInterfaceBis.touchTimeout = true;
            }, 200);
            
            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
            nodeInterface.MouseMove(event);
            if(nodeInterface.selectedNode != null) event.button = 0;
            else event.button = 2;
            nodeInterface.MouseDown(event);
        }
        this.canvas.ontouchmove = function(event) {
            event.stopPropagation();
            event.preventDefault();

            event.clientX = event.touches[0].clientX;
            event.clientY = event.touches[0].clientY;
            if(nodeInterface.selectedNode != null) event.button = 0;
            else event.button = 2;
            nodeInterface.MouseMove(event);    
        }
        this.canvas.ontouchend = function(event) {
            event.stopPropagation();
            event.preventDefault();

            if(nodeInterface.touchTimeout == true) event.button = 2;
            else event.button = 0;
            nodeInterface.MouseUp(event);
        }

        var tmp = canvas.parentNode.getElementsByClassName("zoom");
        if(tmp.length > 0)
        {
            var zoom = tmp[0];
            zoom.children[0].onclick = function() {
                var event = {};
                event.clientX = 0.5 * nodeInterface.width + nodeInterface.position.x;
                event.clientY = 0.5 * nodeInterface.height + nodeInterface.position.y;
                event.wheelDelta = 1.0;
                nodeInterface.Zoom(event);
            }
            zoom.children[1].onclick = function() {
                var event = {};
                event.clientX = 0.5 * nodeInterface.width + nodeInterface.position.x;
                event.clientY = 0.5 * nodeInterface.height + nodeInterface.position.y;
                event.wheelDelta = -1.0;
                nodeInterface.Zoom(event);
            }
        }

        this.DrawAll();
    }

    CreateLargeWindow()
    {
        var t_nodeInterface = this;
        let t_interface = Builder.CreateNodeInterface({no_init: true, no_expand: true, allow_edit: this.allowEdit, width: "75vw", height: "75vh", onvalidate: this.onvalidate});
        if(this.mode === "process") t_interface.classList.add("process");

        let t_canvas = t_interface.getElementsByTagName('canvas')[0];
        this.oldCanvas = this.canvas;

        let t_title = Builder.CreateTextBox({ text: this.title || "Node Interface", align: "left", size: "1.2em", weight: 600, margins: "0.5em" });

        Builder.CreateFloatingBox({
                scrollbar: false, allow_drag: true, style: "frost_glass shadow",
                onclose: function() {
                    t_nodeInterface.ConnectCanvas(t_nodeInterface.oldCanvas);
                }
            },
            [t_title, t_interface]
        );

        this.ConnectCanvas(t_canvas);
        t_interface.SetInterface(this);

        if(this.lock == false) t_interface.Unlock();
    }

    Lock()
    {
        this.lock = true;
    }

    Unlock()
    {
        this.lock = false;
    }

    EnableEdit()
    {
        this.lock = false;
    }

    DisableEdit()
    {
        this.lock = true;
    }

    SetAttribute(att_name, att_data)
    {
        this.attributes[att_name] = att_data;
    }

    Zoom(ev)
    {
        // move viewport in the direction of the mouse
        var pos = this.GetEventScreenPosition(ev);
        var drag_pos = {
            x: 0.5 * this.width - pos.x,
            y: 0.5 * this.height - pos.y
        }
        var scaleInv = 1.0 / this.viewport.scale;
        var dx = 0.25 * scaleInv * drag_pos.x;
        var dy = 0.25 * scaleInv * drag_pos.y;

        // change scale
        var delta = ev.wheelDelta;
        if(delta > 0)
        {
            this.viewport.x -= dx;
            this.viewport.y -= dy;

            this.viewport.scale *= 1.25;
            dx = -0.25 * 0.5 * this.width;
            dy = -0.25 * 0.5 * this.height;
        }
        else
        {
            this.viewport.x += dx;
            this.viewport.y += dy;

            this.viewport.scale /= 1.25;
            dx = 0.25 * 0.5 * this.width;
            dy = 0.25 * 0.5 * this.height;
        }

        // correct viewport so the scaling is relative to the center of the screen
        drag_pos = {
            x: dx,
            y: dy
        }
        scaleInv = 1.0 / this.viewport.scale;
        this.viewport.x -= scaleInv * drag_pos.x;
        this.viewport.y -= scaleInv * drag_pos.y;

        this.DrawAll();
    }

    FindNodeIndex(node)
    {
        for(var i = 0; i < this.nodes.length; i++) if(this.nodes[i] == node) return i;
        return -1;
    }

    FindNodeByID(node_id)
    {
        for(var i = 0; i < this.nodes.length; i++) if(this.nodes[i].id === node_id) return i;
        return -1;
    }

    HideNodeData(save)
    {
        var parent = this.canvas.parentNode;
        var menu = parent.getElementsByClassName("nodeMenu");

        for(var i = 0; i < menu.length; i++)
        {
            var thisMenu = menu[i];
            if(save)
            {
                var nodeIndex = thisMenu.getAttribute("node_index");
                for(var i = 0; i < thisMenu.children.length; i++)
                {
                    var ele = thisMenu.children[i];
                    // if(ele.className.includes('dob'))
                    // {
                    //     this.nodes[nodeIndex].parameters = this.dob.HTMLToDataObject(ele);
                    //     break;
                    // }
                }    
            }

            thisMenu.remove();
        }
    }



    DisplayNodeData(node_index, option = {})
    {
        this.HideNodeData(true);

        var parent = this.canvas.parentNode;
        var node = this.nodes[node_index];
        var html = `
        `;


        if(!this.minified) html += `<div class='resizeMenu' onclick='this.parentNode.classList.toggle("wide")'></div>`;

        var menu = document.createElement("div");
        if(this.minified) menu.className = "nodeMenu thinScrollbar top"; 
        else menu.className = "nodeMenu thinScrollbar";
        menu.innerHTML = html;
        menu.setAttribute("node_index", node_index);

        let t_parentPath = this.parentPath;
        let t_parentRelativePath = this.relativePath;
        if(node.parameters)
        {
            let t_editor = Builder.CreateJSONEditor({
                name: node.name || "Parameters", json: node.parameters, special_types: true, style: "frost_glass", allow_edit: !this.lock, expand: "all", part_list: this.partList,
                validate_func: function(_json) {
                    node.parameters = _json;
                },
                ondrop: function(_data, _file, _ev, _ele) {
                    try {
                        let t_props = JSON.parse(_data);
                        if(t_props._id) _ele.SetValue("///" + t_props._id);
                        else if(t_props._url) _ele.SetValue(t_props._url);
                        else if(t_props.path)
                        {
                            /// try to convert to path relative to the process's parent object
                            if(t_parentPath && t_props.path.includes(t_parentPath))
                            {
                                let t_relativePath = EngineUI.GetRelativePath(t_props.path);
                                t_relativePath = t_relativePath.replace(t_parentRelativePath, "");
                                _ele.SetValue(t_relativePath);
                            }
                            else _ele.SetValue(t_props.path);
                        }
                    }
                    catch(e) {console.log("not droppable")}
                }
            });
            menu.appendChild(t_editor);
        }
        else if(node.data)
        {
            if(node.type === "mesh")
            {
                if('part_index' in option)
                {
                    let t_materialEditor = EngineUI.CreateMaterialMenu({
                        material: node.parts[option.part_index].data, material_index: option.part_index, object_path: node.object_path,
                        collapse: false, allow_edit: !this.lock, style: "white_board"
                    });
                    if(this.onnodeselect) this.onnodeselect(t_materialEditor);
                    else menu.appendChild(t_materialEditor);    
                }
                else if('physics' in option)
                {
                    let t_meshEditor = EngineUI.CreatePhysicsMenu({mesh: node.data, object_path: node.object_path, allow_edit: !this.lock, expand: true, style: "white_board"});
                    if(this.onnodeselect) this.onnodeselect(t_meshEditor);
                    else menu.appendChild(t_meshEditor);        
                }
                else
                {
                    let t_meshEditor = EngineUI.CreateMeshMenu({mesh: node.data, object_path: node.object_path, allow_edit: !this.lock, collapse: false, style: "white_board"});
                    if(this.onnodeselect) this.onnodeselect(t_meshEditor);
                    else menu.appendChild(t_meshEditor);        
                }    
            }
            else if(node.type === "object")
            {
                let t_allowEdit = (node.data.objectRoot && node.data.objectRoot == true) || !this.lock;
                let t_editor = EngineUI.CreatePartMenu({object: node.data, allow_edit: t_allowEdit, collapse: false, object_path: node.object_path, style: "white_board"});
                if(this.onnodeselect) this.onnodeselect(t_editor);
                else menu.appendChild(t_editor);        
            }
            else if(node.type === "animator")
            {
                let t_editor = EngineUI.CreateAnimationPlayerMenu({player: node.data, allow_edit: !this.lock, object_path: node.object_path, interface: this, node: node, style: "white_board"});
                if(this.onnodeselect) this.onnodeselect(t_editor);
                else menu.appendChild(t_editor);        
            }
            else if(node.type === "light")
            {
                let t_editor = EngineUI.CreateLightMenu({light: node.data, allow_edit: !this.lock, object_path: node.object_path, interface: this, node: node, style: "white_board"});
                if(this.onnodeselect) this.onnodeselect(t_editor);
                else menu.appendChild(t_editor);        
            }
            else if(node.type === "particle_emitter")
            {
                let t_editor = EngineUI.CreateParticleEmitterMenu({particle_emitter: node.data, allow_edit: !this.lock, object_path: node.object_path, interface: this, node: node, style: "white_board"});
                if(this.onnodeselect) this.onnodeselect(t_editor);
                else menu.appendChild(t_editor);        
            }
            else if(node.type === "sensor")
            {
                let t_editor = EngineUI.CreateSensorMenu({sensor: node.data, allow_edit: !this.lock, object_path: node.object_path, interface: this, node: node, style: "white_board"});
                if(this.onnodeselect) this.onnodeselect(t_editor);
                else menu.appendChild(t_editor);
            }
            else if(node.type === "process")
            {
                let t_editor = EngineUI.CreateProcessMenu({process: node.data, allow_edit: !this.lock, object_path: node.object_path, interface: this, node: node, style: "white_board"});
                if(this.onnodeselect) this.onnodeselect(t_editor);
                else menu.appendChild(t_editor);        
            }
            else if(node.type === "voice")
            {
                let t_editor = EngineUI.CreateVoiceMenu({voice: node.data, allow_edit: !this.lock, object_path: node.object_path, interface: this, node: node, style: "white_board"});
                if(this.onnodeselect) this.onnodeselect(t_editor);
                else menu.appendChild(t_editor);        
            }
            else if(node.type === "physics_animation")
            {
                let t_editor = EngineUI.CreatePhysicsAnimationMenu({animation: node.data, allow_edit: !this.lock, object_path: node.object_path, interface: this, node: node, style: "white_board"});
                if(this.onnodeselect) this.onnodeselect(t_editor);
                else menu.appendChild(t_editor);        
            }
            else if(node.type === "binding")
            {
                let t_editor = EngineUI.CreateBindingMenu({binding: node.data, allow_edit: !this.lock, object_path: node.object_path, interface: this, node: node, style: "white_board"});
                if(this.onnodeselect) this.onnodeselect(t_editor);
                else menu.appendChild(t_editor);        
            }
        }

        parent.appendChild(menu);

        // this.dob.ReadyButtons(menu);
    }

    GetSubNode(node, pos)
    {
        if(!node.parts) return -1;

        for(var i = 0; i < node.parts.length; i++)
        {
            var dx = Math.abs(pos.x - node.parts[i].position.x);
            var dy = Math.abs(pos.y - node.parts[i].position.y);
            if(dx < 0.5 * node.parts[i].width && dy < 0.5 * node.parts[i].height) return i;
        }

        return -1;
    }

    ClickNode(node_index, pos)
    {
        this.clickedNode = node_index;
        this.DrawAll();

        var type = this.nodes[node_index].type;
        if(type === "node") this.DisplayNodeData(node_index);
        else if(type === "object")
        {
            this.DisplayNodeData(node_index);
        }
        else if(type === "mesh")
        {
            var index = this.GetSubNode(this.nodes[node_index], pos);
            if(index < 0)
            {
                this.DisplayNodeData(node_index);
            }
            else if(index == this.nodes[node_index].parts.length - 1)
            {
                this.DisplayNodeData(node_index, {physics: true});

            }
            else
            {
                this.DisplayNodeData(node_index, {part_index: index});
            }
        }
        else if(type === "light")
        {
            this.DisplayNodeData(node_index);
        }
        else if(type === "particle_emitter")
        {
            this.DisplayNodeData(node_index);
        }
        else if(type === "sensor")
        {
            this.DisplayNodeData(node_index);
        }
        else if(type === "binding")
        {
            this.DisplayNodeData(node_index);            
        }
        else if(type === "process")
        {
            this.DisplayNodeData(node_index);
        }
        else if(type === "voice")
        {
            this.DisplayNodeData(node_index);
        }
        else if(type === "animator")
        {
            this.DisplayNodeData(node_index, {part_index: index});
        }
        else if(type === "physics_animation")
        {
            this.DisplayNodeData(node_index, {part_index: index});
        }
    }

    LeftClick(pos)
    {
        if(this.selectedNode && this.selectedNode.type === "node")   // process
        {
            var selectedIndex = this.FindNodeIndex(this.selectedNode);

            if(!this.lock)
            {
                var index = this.GetInputPort(this.selectedNode, pos);
                if(index >= 0)
                {
                    this.DisconnectInput(selectedIndex, index);
    
                    this.selectedInput = {
                        nodeIndex: selectedIndex,
                        portIndex: index
                    }
    
                    if(this.selectedOutput.nodeIndex >= 0 && this.selectedOutput.nodeIndex != selectedIndex)
                    {
                        this.ConnectNodes(this.selectedOutput.nodeIndex, this.selectedOutput.portIndex, this.selectedInput.nodeIndex, this.selectedInput.portIndex);
                        this.selectedInput = {nodeIndex: -1, portIndex: -1};
                        this.selectedOutput = {nodeIndex: -1, portIndex: -1};
                        this.DrawAll();
                    }
                    else this.selectedOutput = {nodeIndex: -1, portIndex: -1};
    
                    return;
                }
    
                index = this.GetOutputPort(this.selectedNode, pos);
                if(index >= 0)
                {
                    this.selectedOutput = {
                        nodeIndex: selectedIndex,
                        portIndex: index
                    }
    
                    if(this.selectedInput.nodeIndex >= 0 && this.selectedInput.nodeIndex != selectedIndex)
                    {
                        this.ConnectNodes(this.selectedOutput.nodeIndex, this.selectedOutput.portIndex, this.selectedInput.nodeIndex, this.selectedInput.portIndex);
                        this.selectedInput = {nodeIndex: -1, portIndex: -1};
                        this.selectedOutput = {nodeIndex: -1, portIndex: -1};
                        this.DrawAll();
                    }
                    else this.selectedInput = {nodeIndex: -1, portIndex: -1};
    
                    return;
                }    
            }

            if(this.clickedNode != selectedIndex) this.ClickNode(selectedIndex, pos);
        }
        else if(this.selectedNode)  // object
        {
            var selectedIndex = this.FindNodeIndex(this.selectedNode);
            this.ClickNode(selectedIndex, pos);
        }
        else if(this.clickedNode >= 0)
        {
            this.HideNodeData(true);
            this.clickedNode = -1;
            this.DrawAll();
        }

        if(this.selectedInput.nodeIndex >= 0 || this.selectedOutput.nodeIndex >= 0)
        {
            this.selectedInput = {nodeIndex: -1, portIndex: -1};
            this.selectedOutput = {nodeIndex: -1, portIndex: -1};
            this.DrawAll();
        }
    }


    DisconnectInput(node_index, port_index)
    {
        var inputNode = this.nodes[node_index];
        var input = inputNode.inputs[port_index];
        if(input.node < 0) return;

        var outputNode = this.nodes[input.node];
        var output = outputNode.outputs[input.port];

        for(var i = 0; i < output.nodes.length; i++)
        {
            if(output.nodes[i].node == node_index && output.nodes[i].port == port_index)
            {
                output.nodes[i] = output.nodes[output.nodes.length - 1];
                output.nodes.pop();
                break;
            }
        }

        input.node = -1;
        input.port = -1;
    }

    DisconnectOutput(output)
    {
        if(output.nodes.length == 0) return;

        for(var i = 0; i < output.nodes.length; i++)
        {
            var node = this.nodes[output.nodes[i].node];
            var port = output.nodes[i].port;
            node.inputs[port].node = -1;
            node.inputs[port].port = -1;
        }

        output.nodes = [];
    }
    
    AsTitle(item)
    {
        var arr = item.split("_");
        var res = "";
        for(var i = 0; i < arr.length; i++) res += arr[i].charAt(0).toUpperCase() + arr[i].slice(1) + " ";
        res.slice(0, -1);
        return res;
    }

    CreateNode(template, cmd_array)
    {
        var ref = {
            type: template.type,
            name: template.name,
            operator: cmd_array[1],
            suboperator: cmd_array[0],
            inputs: [],
            outputs: [],
            parameters: template.parameters,
            position: this.mouseDownPosition
        }
        ref[cmd_array[1]] = cmd_array[0];
        let node = this.LoadOperator(ref);

        this.AddNode(node);
        this.DrawAll();
    }

    DeleteNode(delete_node, node_id)
    {
        var index = -1;
        if(node_id) index = this.FindNodeByID(node_id);
        else if(delete_node) index = this.FindNodeIndex(delete_node);
        if(index < 0) return;

        var lastIndex = this.nodes.length - 1;
        this.nodes[index] = {};
        this.nodes[index] = this.nodes[lastIndex];
        this.nodes.pop();

        if(this.mode === "process")
        {
            for(var i = 0; i < this.nodes.length; i++)
            {
                var node = this.nodes[i];
                for(var j = 0; j < node.inputs.length; j++)
                {
                    if(node.inputs[j].node == index) node.inputs[j] = {node: -1, port: -1, position: {x: 0, y: 0}};
                    else if(node.inputs[j].node == lastIndex) node.inputs[j].node = index;
                }
    
                for(var j = 0; j < node.outputs.length; j++)
                {
                    var output = node.outputs[j];
                    for(var k = 0; k < output.nodes.length; k++)
                    {
                        if(output.nodes[k].node == index)
                        {
                            output.nodes[k] = output.nodes[output.nodes.length - 1];
                            output.nodes.pop();
                            k--;
                        }
                        else if(output.nodes[k].node == lastIndex) output.nodes[k].node = index;
                    }
                }
            }    
        }
        else if(this.mode === "object")
        {
            for(var i = 0; i < this.nodes.length; i++)
            {
                var node = this.nodes[i];
                if(node.inputs[j] == index) node.inputs.pop();
                else if(node.inputs[j] == lastIndex) node.inputs[j] = index;

                for(var j = 0; j < node.outputs.length; j++)
                {
                    if(node.outputs[j] == index)
                    {
                        node.outputs[j] = node.outputs[node.outputs.length - 1];
                        node.outputs.pop();
                        j--;
                    }
                    else if(node.outputs[j] == lastIndex) node.outputs[j] = index;
                }
            }
        }

        if(this.clickedNode == index)
        {
            this.clickedNode = -1;
            this.HideNodeData(false);
        }

        this.DrawAll();
    }

    DuplicateNode(target_node, position, json)
    {
        var str;
        if(json != null && json.length > 0) str = json;  
        else if(target_node != null) str = JSON.stringify(target_node);
        var node = JSON.parse(str);

        if(position) node.position = position;
        else node.position = this.mouseDownPosition;

        var nodeIndex = this.nodes.length;
        for(var j = 0; j < node.inputs.length; j++)
        {
            if(node.inputs[j].node >= 0)
            {
                var outputNode = this.nodes[node.inputs[j].node];
                var output = outputNode.outputs[node.inputs[j].port];
                output.nodes.push({
                    node: nodeIndex,
                    port: j
                })
            }
        }

        for(var j = 0; j < node.outputs.length; j++) node.outputs[j] = {nodes: [], position: {x: 0, y: 0}};

        this.AddNode(node);
        this.DrawAll();
    }

    HandleCommand(cmd_array, target_node)
    {
        let item = cmd_array[cmd_array.length - 1];
        cmd_array.pop();

        if(item.localeCompare("new_node") == 0)
        {
            var node = this.menu.new_node;
            for(var i = cmd_array.length - 1; i >= 0; i--)
            {
                node = node[cmd_array[i]];
            }
            this.CreateNode(node, cmd_array);
        }
        else if(target_node)
        {
            if(target_node.type === "node")
            {
                if(item.localeCompare("delete") == 0) this.DeleteNode(target_node);
                else if(item.localeCompare("duplicate") == 0) this.DuplicateNode(target_node);
                else if(item.localeCompare("copy") == 0) this.copiedData = JSON.stringify(target_node);
                else if(item.localeCompare("cut") == 0)
                {
                    this.copiedData = JSON.stringify(target_node);
                    this.DeleteNode(target_node);
                }    
            }
            else if(target_node.type === "object")
            {
                if(item.localeCompare("addLight") == 0)
                {
                    var t_light = EngineUI.AddLight(target_node.object_path);
                    var index = this.LoadObjectLight(t_light, target_node.lights.length);
                    target_node.outputs.push(index);
                    target_node.lights.push(index);

                    var newNode = this.nodes[index];
                    var pos = {
                        x: target_node.position.x + 0.5 * target_node.width + 100 + 0.5 * newNode.width,
                        y: target_node.position.y + 0.5 * target_node.height + 0.5 * newNode.height
                    }
                    newNode.position = pos;
                    newNode.object_path = target_node.object_path;

                    let t_editor = EngineUI.CreateLightMenu({light: t_light, allow_edit: true, object_path: target_node.object_path, interface: this, node: newNode});
                    if(this.onnodeselect) this.onnodeselect(t_editor);
                    this.DrawAll();
                }
                if(item.localeCompare("addParticleEmitter") == 0)
                {
                    var t_emitter = EngineUI.AddParticleEmitter(target_node.object_path);
                    var index = this.LoadParticleEmitter(t_emitter, target_node.particle_emitters.length);
                    target_node.outputs.push(index);
                    target_node.particle_emitters.push(index);

                    var newNode = this.nodes[index];
                    var pos = {
                        x: target_node.position.x + 0.5 * target_node.width + 100 + 0.5 * newNode.width,
                        y: target_node.position.y + 0.5 * target_node.height + 0.5 * newNode.height
                    }
                    newNode.position = pos;
                    newNode.object_path = target_node.object_path;

                    let t_editor = EngineUI.CreateParticleEmitterMenu({particle_emitter: t_emitter, allow_edit: true, object_path: target_node.object_path, interface: this, node: newNode});
                    if(this.onnodeselect) this.onnodeselect(t_editor);
                    this.DrawAll();
                }
                if(item.localeCompare("addSensor") == 0)
                {
                    var t_sensor = EngineUI.AddSensor(target_node.object_path);
                    var index = this.LoadObjectSensor(t_sensor, target_node.sensors.length);
                    target_node.outputs.push(index);
                    target_node.sensors.push(index);

                    var newNode = this.nodes[index];
                    var pos = {
                        x: target_node.position.x + 0.5 * target_node.width + 100 + 0.5 * newNode.width,
                        y: target_node.position.y + 0.5 * target_node.height + 0.5 * newNode.height
                    }
                    newNode.position = pos;
                    newNode.object_path = target_node.object_path;

                    let t_editor = EngineUI.CreateSensorMenu({sensor: t_sensor, allow_edit: true, object_path: target_node.object_path, interface: this, node: newNode});
                    if(this.onnodeselect) this.onnodeselect(t_editor);
                    this.DrawAll();
                }
                else if(item.localeCompare("addProcess") == 0)
                {
                    var t_process = EngineUI.AddProcess(target_node.object_path);
                    var index = this.LoadObjectProcess(t_process, target_node.processes.length, target_node.id);
                    target_node.outputs.push(index);
                    target_node.processes.push(index);

                    var newNode = this.nodes[index];
                    var pos = {
                        x: target_node.position.x + 0.5 * target_node.width + 100 + 0.5 * newNode.width,
                        y: target_node.position.y + 0.5 * target_node.height + 0.5 * newNode.height
                    }
                    newNode.position = pos;
                    newNode.object_path = target_node.object_path;

                    let t_editor = EngineUI.CreateProcessMenu({process: t_process, allow_edit: true, object_path: target_node.object_path, interface: this, node: newNode});
                    if(this.onnodeselect) this.onnodeselect(t_editor);
                    this.DrawAll();
                }
                else if(item.localeCompare("addVoice") == 0)
                {
                    var t_voice = EngineUI.AddVoice(target_node.object_path);
                    var index = this.LoadObjectVoice(t_voice, target_node.voices.length, target_node.id);
                    target_node.outputs.push(index);
                    target_node.voices.push(index);

                    var newNode = this.nodes[index];
                    var pos = {
                        x: target_node.position.x + 0.5 * target_node.width + 100 + 0.5 * newNode.width,
                        y: target_node.position.y + 0.5 * target_node.height + 0.5 * newNode.height
                    }
                    newNode.position = pos;
                    newNode.object_path = target_node.object_path;

                    let t_editor = EngineUI.CreateVoiceMenu({voice: t_voice, allow_edit: true, object_path: target_node.object_path, interface: this, node: newNode});
                    if(this.onnodeselect) this.onnodeselect(t_editor);
                    this.DrawAll();
                }
                else if(item.localeCompare("addBinding") == 0)
                {
                    var t_binding = EngineUI.AddBinding(target_node.object_path);
                    var index = this.LoadObjectBinding(t_binding, target_node.bindings.length, target_node.id);
                    target_node.outputs.push(index);
                    target_node.bindings.push(index);

                    var newNode = this.nodes[index];
                    var pos = {
                        x: target_node.position.x + 0.5 * target_node.width + 100 + 0.5 * newNode.width,
                        y: target_node.position.y + 0.5 * target_node.height + 0.5 * newNode.height
                    }
                    newNode.position = pos;
                    newNode.object_path = target_node.object_path;

                    let t_editor = EngineUI.CreateBindingMenu({binding: t_binding, allow_edit: true, object_path: target_node.object_path, interface: this, node: newNode});
                    if(this.onnodeselect) this.onnodeselect(t_editor);
                    this.DrawAll();
                }
                else if(item.localeCompare("addPhysAnimation") == 0)
                {
                    var t_animation = EngineUI.AddPhysicsAnimation(target_node.object_path);
                    var index = this.LoadPhysicsAnimation(t_animation, target_node.physics_animations.length, target_node.id);
                    target_node.outputs.push(index);
                    target_node.physics_animations.push(index);

                    var newNode = this.nodes[index];
                    var pos = {
                        x: target_node.position.x + 0.5 * target_node.width + 100 + 0.5 * newNode.width,
                        y: target_node.position.y + 0.5 * target_node.height + 0.5 * newNode.height
                    }
                    newNode.position = pos;
                    newNode.object_path = target_node.object_path;

                    let t_editor = EngineUI.CreatePhysicsAnimationMenu({animation: t_animation, allow_edit: true, object_path: target_node.object_path, interface: this, node: newNode});
                    if(this.onnodeselect) this.onnodeselect(t_editor);
                    this.DrawAll();
                }
                else if(item.localeCompare("copyFullPath") == 0)
                {
                    Builder.ToClipboard(target_node.object_path);
                }
                else if(item.localeCompare("copyRelativePath") == 0)
                {
                    Builder.ToClipboard(EngineUI.GetRelativePath(target_node.object_path));
                }
            }
            else if(target_node.type === "light")
            {
                if(item.localeCompare("delete") == 0)
                {
                    if(this.onnodeselect) this.onnodeselect(null);
                    EngineUI.DeleteLight(target_node.object_path + ".lights." + target_node.id);
                    this.DeleteNode(target_node);
                }
                else if(item.localeCompare("copyFullPath") == 0)
                {
                    Builder.ToClipboard(target_node.object_path + ".lights." + target_node.id);
                }
                else if(item.localeCompare("copyRelativePath") == 0)
                {
                    Builder.ToClipboard(EngineUI.GetRelativePath(target_node.object_path + ".lights." + target_node.id));
                }
            }
            else if(target_node.type === "particle_emitter")
            {
                if(item.localeCompare("delete") == 0)
                {
                    if(this.onnodeselect) this.onnodeselect(null);
                    EngineUI.DeleteParticleEmitter(target_node.object_path + ".particle_emitters." + target_node.id);
                    this.DeleteNode(target_node);
                }
                else if(item.localeCompare("copyFullPath") == 0)
                {
                    Builder.ToClipboard(target_node.object_path + ".particle_emitters." + target_node.id);
                }
                else if(item.localeCompare("copyRelativePath") == 0)
                {
                    Builder.ToClipboard(EngineUI.GetRelativePath(target_node.object_path + ".particle_emitters." + target_node.id));
                }
            }
            else if(target_node.type === "sensor")
            {
                if(item.localeCompare("delete") == 0)
                {
                    if(this.onnodeselect) this.onnodeselect(null);
                    EngineUI.DeleteSensor(target_node.object_path + ".sensors." + target_node.id);
                    this.DeleteNode(target_node);
                }
                else if(item.localeCompare("copyFullPath") == 0)
                {
                    Builder.ToClipboard(target_node.object_path + ".sensors." + target_node.id);
                }
                else if(item.localeCompare("copyRelativePath") == 0)
                {
                    Builder.ToClipboard(EngineUI.GetRelativePath(target_node.object_path + ".sensors." + target_node.id));
                }
            }
            else if(target_node.type === "binding")
            {
                if(item.localeCompare("delete") == 0)
                {
                    if(this.onnodeselect) this.onnodeselect(null);
                    EngineUI.DeleteBinding(target_node.object_path + ".bindings." + target_node.id);
                    this.DeleteNode(target_node);
                }
                else if(item.localeCompare("copyFullPath") == 0)
                {
                    Builder.ToClipboard(target_node.object_path + ".bindings." + target_node.id);
                }
                else if(item.localeCompare("copyRelativePath") == 0)
                {
                    Builder.ToClipboard(EngineUI.GetRelativePath(target_node.object_path + ".bindings." + target_node.id));
                }
            }
            else if(target_node.type === "process")
            {
                if(item.localeCompare("delete") == 0)
                {
                    if(this.onnodeselect) this.onnodeselect(null);
                    EngineUI.DeleteProcess(target_node.object_path + ".processes." + target_node.id);
                    this.DeleteNode(target_node);
                }
                else if(item.localeCompare("copyFullPath") == 0)
                {
                    Builder.ToClipboard(target_node.object_path + ".processes." + target_node.id);
                }
                else if(item.localeCompare("copyRelativePath") == 0)
                {
                    Builder.ToClipboard(EngineUI.GetRelativePath(target_node.object_path + ".processes." + target_node.id));
                }
            }
            else if(target_node.type === "voice")
            {
                if(item.localeCompare("delete") == 0)
                {
                    if(this.onnodeselect) this.onnodeselect(null);
                    EngineUI.DeleteVoice(target_node.object_path + ".voices." + target_node.id);
                    this.DeleteNode(target_node);
                }
                else if(item.localeCompare("copyFullPath") == 0)
                {
                    Builder.ToClipboard(target_node.object_path + ".voices." + target_node.id);
                }
                else if(item.localeCompare("copyRelativePath") == 0)
                {
                    Builder.ToClipboard(EngineUI.GetRelativePath(target_node.object_path + ".voices." + target_node.id));
                }
            }
            else if(target_node.type === "physics_animation")
            {
                if(item.localeCompare("delete") == 0)
                {
                    if(this.onnodeselect) this.onnodeselect(null);
                    EngineUI.DeletePhysicsAnimation(target_node.object_path + ".physics_animations." + target_node.id);
                    this.DeleteNode(target_node);
                }
                else if(item.localeCompare("copyFullPath") == 0)
                {
                    Builder.ToClipboard(target_node.object_path + ".physics_animations." + target_node.id);
                }
                else if(item.localeCompare("copyRelativePath") == 0)
                {
                    Builder.ToClipboard(EngineUI.GetRelativePath(target_node.object_path + ".physics_animations." + target_node.id));
                }
            }
            else if(target_node.type === "animator")
            {
                if(item.localeCompare("delete") == 0)
                {
                    if(this.onnodeselect) this.onnodeselect(null);
                    EngineUI.DeletePhysicsAnimation(target_node.object_path + ".animators." + target_node.id);
                    this.DeleteNode(target_node);
                }
                else if(item.localeCompare("copyFullPath") == 0)
                {
                    Builder.ToClipboard(target_node.object_path + ".animators." + target_node.id);
                }
                else if(item.localeCompare("copyRelativePath") == 0)
                {
                    Builder.ToClipboard(EngineUI.GetRelativePath(target_node.object_path + ".animators." + target_node.id));
                }
            }
        }
        else
        {
            if(item.localeCompare("save") == 0)
            {
                if(this.onsave) this.onsave();
            }
            else if(item.localeCompare("paste") == 0)
            {
                if(this.copiedData.length > 0) this.DuplicateNode(null, null, this.copiedData);
            }
            else if(item.localeCompare("reset_position") == 0) this.ResetNodePositions();
            else if(item === "arrangeNodes") this.ArrangeNodes();
        }

        this.RemoveCursorMenu();
    }

    ClickMenuButton(ele, target_node)
    {
        var items = [];
        items[0] = ele.getAttribute("item");

        var obj = ele;
        for(var i = 0; i < 10; i++)
        {
            obj = obj.parentNode;
            if(obj.className.includes('cursorMenu')) break;
            items[i + 1] = obj.getAttribute("item");
        }

        this.HandleCommand(items, target_node);
    }

    CreateSubmenu(menu, menu_name, top)
    {
        var html = ``;
        if(top)
        {
            html += `
                <div class='top'><p>` + menu_name + `</p></div>`;

        }
        else
        {
            html += `
                <div class='menu' item='` + menu_name + `'>
                    <div class='label' onclick='event.stopPropagation();this.parentNode.classList.toggle("open")'><p>` + this.AsTitle(menu_name) + `</p></div>`;
        }

        var keys = Object.keys(menu);
        for(var i = 0; i < keys.length; i++)
        {
            if(typeof menu[keys[i]] === 'object')
            {
                if(menu[keys[i]].type)
                {
                    if(menu[keys[i]].type === 'node' || menu[keys[i]].type === 'action') html += `<div class='button' item=` + keys[i] + `><p>` + menu[keys[i]].name + `</p></div>`;
                }
                else html += this.CreateSubmenu(menu[keys[i]], keys[i], false);
            }
            else if(typeof menu[keys[i]] === 'string') html += `<div class='button' item=` + menu[keys[i]] + `><p>` + menu[keys[i]] + `</p></div>`;
        }

        if(!top) html += `</div>`;
        return html;
    }


    ShowNodeMenu(pos, node)
    {
        var options;
        if(node.type === "node")
        {
            options = {
                delete: {type: "action", name: "Delete"},
                duplicate: {type: "action", name: "Duplicate"},
                cut: {type: "action", name: "Cut"},
                copy: {type: "action", name: "Copy"},
            }    
        }
        else if(node.type === "object")
        {
            options = {
                copyFullPath: {type: "action", name: "Copy Full Path"},
                copyRelativePath: {type: "action", name: "Copy Relative Path"},
                addLight: {type: "action", name: "Add Light"},
                addParticleEmitter: {type: "action", name: "Add Particle Emitter"},
                addSensor: {type: "action", name: "Add Sensor"},
                addProcess: {type: "action", name: "Add Process"},
                addVoice: {type: "action", name: "Add Voice"},
                addBinding: {type: "action", name: "Add Binding"},
                addPhysAnimation: {type: "action", name: "Add Physics Animation"},
            }
        }
        else if(node.type === "light")
        {
            options = {
                delete: {type: "action", name: "Delete"},
                copyFullPath: {type: "action", name: "Copy Full Path"},
                copyRelativePath: {type: "action", name: "Copy Relative Path"}
            }
        }
        else if(node.type === "particle_emitter")
        {
            options = {
                delete: {type: "action", name: "Delete"},
                copyFullPath: {type: "action", name: "Copy Full Path"},
                copyRelativePath: {type: "action", name: "Copy Relative Path"}
            }
        }
        else if(node.type === "sensor")
        {
            options = {
                delete: {type: "action", name: "Delete"},
                copyFullPath: {type: "action", name: "Copy Full Path"},
                copyRelativePath: {type: "action", name: "Copy Relative Path"}
            }
        }
        else if(node.type === "binding")
        {
            options = {
                delete: {type: "action", name: "Delete"},
                copyFullPath: {type: "action", name: "Copy Full Path"},
                copyRelativePath: {type: "action", name: "Copy Relative Path"}
            }
        }
        else if(node.type === "physics_animation")
        {
            options = {
                delete: {type: "action", name: "Delete"},
                copyFullPath: {type: "action", name: "Copy Full Path"},
                copyRelativePath: {type: "action", name: "Copy Relative Path"}
            }
        }
        else if(node.type === "process")
        {
            options = {
                delete: {type: "action", name: "Delete"},
                copyFullPath: {type: "action", name: "Copy Full Path"},
                copyRelativePath: {type: "action", name: "Copy Relative Path"}
            }
        }
        else if(node.type === "voice")
        {
            options = {
                delete: {type: "action", name: "Delete"},
                copyFullPath: {type: "action", name: "Copy Full Path"},
                copyRelativePath: {type: "action", name: "Copy Relative Path"}
            }
        }
        else if(node.type === "animator")
        {
            options = {
                delete: {type: "action", name: "Delete"},
                copyFullPath: {type: "action", name: "Copy Full Path"},
                copyRelativePath: {type: "action", name: "Copy Relative Path"}
            }
        }
        else return;

        var menu = this.CreateCursorMenu(pos);

        var html = this.CreateSubmenu(options, "Node Menu", true);
        menu.innerHTML = html;

        var nodeInterface = this;
        var buttons = this.canvas.parentNode.getElementsByClassName("button");
        for(var i = 0; i < buttons.length; i++)
        {
            buttons[i].onclick = function() {
                nodeInterface.ClickMenuButton(this, node);
            }
        }
    }

    ShowGlobalMenu(pos)
    {
        var menu = this.CreateCursorMenu(pos);

        var html = this.CreateSubmenu(this.menu, "Global Menu", true);
        menu.innerHTML = html;

        Builder.AddScrollbar({width: "0.25em"}, menu);


        var nodeInterface = this;
        var buttons = this.canvas.parentNode.getElementsByClassName("button");
        for(var i = 0; i < buttons.length; i++)
        {
            buttons[i].onclick = function() {
                nodeInterface.ClickMenuButton(this);
            }
        }
    }


    
    RemoveCursorMenu()
    {
        var parent = this.canvas.parentNode;
        var menu = parent.getElementsByClassName("cursorMenu");
        if(menu.length > 0) for(var i = 0; i < menu.length; i++) menu[i].remove();
    }

    CreateCursorMenu(pos)
    {
        var menu = document.createElement("div");
        menu.className = "cursorMenu";

        if(pos.x < 0.5 * this.width)
        {
            menu.style.right = "auto";
            menu.style.left = pos.x + 5 + "px";
        }
        else
        {
            menu.style.left = "auto";
            menu.style.right = this.width - pos.x + 5 + "px";
        }

        if(pos.y < 0.5 * this.height)
        {
            menu.style.bottom = "auto";
            menu.style.top = pos.y + 5 + "px";
            menu.style.maxHeight = (this.height - pos.y - 10) + "px";    
        }
        else
        {
            menu.style.top = "auto";
            menu.style.bottom = this.height - pos.y + 5 + "px";
            menu.style.maxHeight = (pos.y - 10) + "px";    
        }

        if(this.minified) menu.style.fontSize = "0.9em";

        this.canvas.parentNode.appendChild(menu);
        return menu;
    }

    RightClick(pos)
    {
        if(this.lock == true)
        {
            return;
        }

        if(this.preventRightClick)
        {
            this.preventRightClick = false;
            return;
        }

        pos = this.ViewportPosition(pos);
        if(this.selectedNode) this.ShowNodeMenu(pos, this.selectedNode);
        else this.ShowGlobalMenu(pos)
    }

    MouseUp(ev, ev_button)
    {
        var dP = {
            x: this.mousePosition.x - this.mouseDownPosition.x,
            y: this.mousePosition.y - this.mouseDownPosition.y
        };
        var dist = Math.sqrt(dP.x * dP.x + dP.y * dP.y);
        if(dist < 2)
        {
            var button = ev_button ? ev_button : ev.button;
            if(button == 0) this.LeftClick(this.mousePosition);
            else if(button == 2) this.RightClick(this.mousePosition);
        }

        this.draggedNode = null;
        this.draggedViewport = false;

        document.documentElement.style.cursor = 'unset';
    }

    MouseDown(ev, ev_button)
    {
        this.RemoveCursorMenu();

        this.mouseDownPosition = this.mousePosition;
        var button = ev_button ? ev_button : ev.button;

        if(button == 0)
        {
            if(this.selectedNode)
            {
                this.draggedNode = this.selectedNode;
                this.draggedPosition = {
                    x: this.draggedNode.position.x - this.mousePosition.x,
                    y: this.draggedNode.position.y - this.mousePosition.y
                }
            }
        }
        else if(button == 2)
        {
            this.draggedViewport = true;
            this.draggedPosition = this.GetEventScreenPosition(ev);
            this.viewport.old_x = this.viewport.x;
            this.viewport.old_y = this.viewport.y;
        }

        document.documentElement.style.cursor = 'grab';
    }

    Distance(pos_A, pos_B)
    {
        var dx = pos_A.x - pos_B.x;
        var dy = pos_A.y - pos_B.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    GetInputPort(node, pos)
    {
        for(var i = 0; i < node.inputs.length; i++)
        {
            if(this.Distance(NodeVector.Add(node.position, node.inputs[i].position), pos) < this.portRadius * 6)
            {
                return i;
            }
        }
    }

    GetOutputPort(node, pos)
    {
        for(var i = 0; i < node.outputs.length; i++)
        {
            if(this.Distance(NodeVector.Add(node.position, node.outputs[i].position), pos) < this.portRadius * 6)
            {
                return i;
            }
        }
    }

    MouseMove(ev)
    {
        var pos = this.GetEventPosition(ev);
        this.mousePosition = pos;

        if(this.draggedViewport == true)
        {
            var screenPos = this.GetEventScreenPosition(ev);
            var dP = {
                x: screenPos.x - this.draggedPosition.x,
                y: screenPos.y - this.draggedPosition.y
            };
            var dist = Math.sqrt(dP.x * dP.x + dP.y * dP.y);
            if(dist > 2)
            {
                document.documentElement.style.cursor = 'grabbing';
                this.DragViewport(dP);
                return;
            }
        }

        if(this.draggedNode != null)
        {
            var dP = {
                x: this.mousePosition.x - this.mouseDownPosition.x,
                y: this.mousePosition.y - this.mouseDownPosition.y
            };
            var dist = Math.sqrt(dP.x * dP.x + dP.y * dP.y);
            if(dist > 2)
            {
                document.documentElement.style.cursor = 'grabbing';
                this.DragNode();
                return;
            }
        }

        if(this.selectedNode != null)
        {
            if(Math.abs(pos.x - this.selectedNode.position.x) > 0.5 * this.selectedNode.width + 2.0 * this.fontPadding
            || Math.abs(pos.y - this.selectedNode.position.y) > 0.5 * this.selectedNode.height + 2.0 * this.fontPadding)
            {
                document.documentElement.style.cursor = 'unset';
                this.selectedNode = null;
            }
        }
        else
        {
            this.selectedNode = this.GetNodeByPosition(pos);
            if(this.selectedNode)
            {
                document.documentElement.style.cursor = 'pointer';
            }
        }

        if(this.selectedInput.nodeIndex >= 0 || this.selectedOutput.nodeIndex >= 0) this.DrawAll();
    }

    DragViewport(drag_pos)
    {
        var scaleInv = 1.0 / this.viewport.scale;
        this.viewport.x = this.viewport.old_x - scaleInv * drag_pos.x;
        this.viewport.y = this.viewport.old_y - scaleInv * drag_pos.y;
        this.DrawAll();

        this.preventRightClick = true;
    }

    DragNode()
    {
        this.draggedNode.position = {
            x: this.draggedPosition.x + this.mousePosition.x,
            y: this.draggedPosition.y + this.mousePosition.y
        };
        this.DrawAll();
    }

    DrawAll()
    {
//        this.ctx.fillStyle = "#191e23";
//        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.clearRect(0, 0, this.width, this.height);

        for(var i = 0; i < this.nodes.length; i++)
        {
            var nodeColor;
            if(this.clickedNode == i) nodeColor = "#30ffa9";
            else nodeColor = "#FFFFFF";

            if(this.nodes[i].type === "node") this.DrawNode(this.nodes[i], "#FFFFFF", nodeColor);
            else if(this.nodes[i].type === "object") this.DrawObject(this.nodes[i], nodeColor);
            else if(this.nodes[i].type === "mesh") this.DrawMesh(this.nodes[i], nodeColor);
            else if(this.nodes[i].type === "light") this.DrawLight(this.nodes[i], nodeColor);
            else if(this.nodes[i].type === "particle_emitter") this.DrawParticleEmitter(this.nodes[i], nodeColor);
            else if(this.nodes[i].type === "sensor") this.DrawSensor(this.nodes[i], nodeColor);
            else if(this.nodes[i].type === "binding") this.DrawBinding(this.nodes[i], nodeColor);
            else if(this.nodes[i].type === "process") this.DrawProcess(this.nodes[i], nodeColor);
            else if(this.nodes[i].type === "voice") this.DrawVoice(this.nodes[i], nodeColor);
            else if(this.nodes[i].type === "animator") this.DrawAnimator(this.nodes[i], nodeColor);
            else if(this.nodes[i].type === "physics_animation") this.DrawPhysicsAnimation(this.nodes[i], nodeColor);
        }

        if(this.mode === "process")
        {
            for(var i = 0; i < this.nodes.length; i++)
            {
                var node = this.nodes[i];
                for(var j = 0; j < node.outputs.length; j++)
                {
                    var output = node.outputs[j];
                    for(var k = 0; k < output.nodes.length; k++)
                    {
                        this.DrawHorizontalConnection(node, j, this.nodes[output.nodes[k].node], output.nodes[k].port);
                    }
                }    
            }
        }
        else
        {
            for(var i = 0; i < this.nodes.length; i++)
            {
                var node = this.nodes[i];
                for(var j = 0; j < node.outputs.length; j++)
                {
                    this.DrawSimpleConnection(node, this.nodes[node.outputs[j]], j);
                }
            }
        }

        if(this.selectedInput.nodeIndex >= 0)
        {
            var outputNode = {
                width: 10,
                position: this.mousePosition,
                outputs: [{position: {x: 0, y: 0}}]
            }
            this.DrawHorizontalConnection(outputNode, 0, this.nodes[this.selectedInput.nodeIndex], this.selectedInput.portIndex);
        }
        else if(this.selectedOutput.nodeIndex >= 0)
        {
            var inputNode = {
                width: 10,
                position: this.mousePosition,
                inputs: [{position: {x: 0, y: 0}}]
            }
            this.DrawHorizontalConnection(this.nodes[this.selectedOutput.nodeIndex], this.selectedOutput.portIndex, inputNode, 0);
        }
    }

    ResetNodePositions()
    {
        var top = 100;
        for(var i = 0; i < this.nodes.length; i++)
        {
            this.nodes[i].position = {
                x: 200,
                y: top
            };
            top += 100;
        }
        this.DrawAll();
    }

    AddNode(node)
    {
        this.nodes.push(node);
//        this.DrawAll();
        return this.nodes.length - 1;
    }

    ConnectNodes(node_A_index, output_A, node_B_index, input_B)
    {
        var nodeA = this.nodes[node_A_index];
        var output = nodeA.outputs[output_A];
        for(var i = 0; i < output.nodes.length; i++) if(output.nodes[i].node == node_B_index && output.nodes[i].port == input_B) return;
        var newOut = {
            node: node_B_index,
            port: input_B
        }
        output.nodes.push(newOut);

        var nodeB = this.nodes[node_B_index];
        nodeB.inputs[input_B].node = node_A_index;
        nodeB.inputs[input_B].port = output_A;
    }


    GetNodeByPosition(pos)
    {
        for(var i = this.nodes.length - 1; i >= 0; i--)
        {
            var dX = pos.x - this.nodes[i].position.x;
            if(Math.abs(dX) < 0.5 * this.nodes[i].width + 2.0 * this.fontPadding)
            {
                var dY = pos.y - this.nodes[i].position.y;
                if(Math.abs(dY) < 0.5 * this.nodes[i].height + 2.0 * this.fontPadding)
                {
                    return this.nodes[i];
                }
            }
        }

        return null;
    }

    GetEventPosition(ev)
    {
        var screenPos = this.GetEventScreenPosition(ev);
        return this.AbsolutePosition(screenPos);
    }

    GetEventScreenPosition(ev)
    {
        var rect = this.canvas.getBoundingClientRect();
        this.position = {
            x: rect.left,
            y: rect.top,
        }
        return {
            x: ev.clientX - rect.left,
            y: ev.clientY - rect.top
        };
    }

    RoundRect(x, y, width, height, radius = 5, fill = false, stroke = true)
    {
        var ctx = this.ctx;
        ctx.lineWidth = 1 * this.viewport.scale;

        x = this.viewport.scale * (x - this.viewport.x);
        y = this.viewport.scale * (y - this.viewport.y);
        width = this.viewport.scale * width;
        height = this.viewport.scale * height;
        radius = this.viewport.scale * radius;

        if(typeof radius === 'number')
        {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        }
        else
        {
            radius = {...{tl: 0, tr: 0, br: 0, bl: 0}, ...radius};
        }

        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();

        if(fill) ctx.fill();
        if(stroke) ctx.stroke();
    }



    DrawPort(pos, color, radius = 3)
    {
        var ctx = this.ctx;

        var position = this.ViewportPosition(pos);

        ctx.beginPath();
        ctx.arc(position.x, position.y, this.viewport.scale * radius, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = radius * this.viewport.scale;
        ctx.stroke();            
    }

    ViewportPosition(pos)
    {
        return {
            x: this.viewport.scale * (pos.x - this.viewport.x),
            y: this.viewport.scale * (pos.y - this.viewport.y)
        }
    }

    AbsolutePosition(pos)
    {
        var scaleInv = 1.0 / this.viewport.scale
        return {
            x: scaleInv * pos.x + this.viewport.x,
            y: scaleInv * pos.y + this.viewport.y
        }
    }

    DrawText(txt, top_left, font_height, color, align, bold = false)
    {
        var topLeft = this.ViewportPosition(top_left);
        var fontHeight = this.viewport.scale * font_height;

        var ctx = this.ctx;

        var offset = {x: topLeft.x, y: topLeft.y + fontHeight};
        if(align)
        {
            if(align.x === "center")
            {
                var textSize = ctx.measureText(txt);
                offset.x = topLeft.x - 0.5 * textSize.width;
            }
            else if(align.x === "right")
            {
                var textSize = ctx.measureText(txt);
                offset.x = topLeft.x - textSize.width;
            }    
        }

        ctx.fillStyle = color;
        ctx.textBaseline = "bottom";
        if(bold) ctx.font = "bold " + fontHeight + "px Arial";
        else ctx.font = fontHeight + "px Arial";
        ctx.fillText(txt, offset.x, offset.y);
    }

    DrawTextBox(text, style)
    {
        
        var ctx = this.ctx;
        ctx.textBaseline = "bottom";
        ctx.font = this.viewport.scale * style.fontHeight + "px Arial";

        var padding = style.padding;
        var box = style.box;
        if(!box.width)
        {
            var textSize = ctx.measureText(text);
            box.width = textSize.width + 2 * padding;
        }
        if(!box.height) box.height = style.fontHeight + 2 * padding;
        
        var textTopLeft = {};
        if(style.align.x === "left")
        {
            textTopLeft.x = box.x + padding;
            textTopLeft.y = box.y + padding;
        }
        else if(style.align.x === "center")
        {
            textTopLeft.x = box.x + 0.5 * box.width;
            textTopLeft.y = box.y + padding;
        }
        else if(style.align.x === "right")
        {
            textTopLeft.x = box.x + box.width - padding;
            textTopLeft.y = box.y + padding;
        }

        if(style.boxColor.length > 0)
        {
            ctx.strokeStyle = style.boxColor;
            ctx.fillStyle = style.boxColor;
            this.RoundRect(box.x, box.y, box.width, box.height, style.radius, true, true);    
        }

        this.DrawText(text, textTopLeft, style.fontHeight, style.textColor, style.align, style.bold);
    }

    DrawMesh(node, color)
    {
        var ctx = this.ctx;
        ctx.font = this.fontHeight + "px Arial";

        var padding = this.fontPadding;
        var width = node.width - 2.0 * padding;

        var topLeft = {
            x: node.position.x - 0.5 * node.width,
            y: node.position.y - 0.5 * node.height
        }

        var TL = this.ViewportPosition(topLeft);
        if(TL.x > this.width || TL.y > this.height) return;
        
        var BR = this.ViewportPosition({x: node.position.x + 0.5 * node.width, y: node.position.y + 0.5 * node.height});
        if(BR.x < 0.0 || BR.y < 0.0) return;

        var style = {
            bold: true,
            box: {x: topLeft.x, y: topLeft.y, width: node.width, height: node.height},
            align: {x: "center"},
            fontHeight: this.fontHeight,
            padding: padding,
            textColor: "#FFFFFF",
            boxColor: "#c53f5c70",
            radius: 20
        }
        this.DrawTextBox("Mesh", style);

        topLeft.y += (this.fontHeight + 2.0 * padding);
        style.box = {x: topLeft.x, y: topLeft.y, width: node.width};
        style.textColor = "#FFFFFF";
        style.boxColor = "";
        style.bold = false;
        this.DrawTextBox(node.name, style);

        topLeft.y -= padding;
        topLeft.x += padding;

        style.boxColor = "#00000070";
        style.radius = 10;
        for(var i = 0; i < node.parts.length - 1; i++)
        {
            topLeft.y += (this.fontHeight + 3.0 * padding);
            style.box = {x: topLeft.x, y: topLeft.y, width: width};
            this.DrawTextBox(node.parts[i].name, style);
            
            node.parts[i].width = width;
            node.parts[i].height = this.fontHeight + 2.0 * padding;
            node.parts[i].position = {
                x: topLeft.x + 0.5 * node.parts[i].width,
                y: topLeft.y + 0.5 * node.parts[i].height
            }
        }

        // the physics node
        topLeft.y += (this.fontHeight + 4.0 * padding);
        style.box = {x: topLeft.x, y: topLeft.y, width: width};
        style.boxColor = "#FFFFFF30";
        this.DrawTextBox("Physics", style);

        var lastIndex = node.parts.length - 1;
        node.parts[lastIndex].width = width;
        node.parts[lastIndex].height = this.fontHeight + 2.0 * padding;
        node.parts[lastIndex].position = {
            x: topLeft.x + 0.5 * node.parts[lastIndex].width,
            y: topLeft.y + 0.5 * node.parts[lastIndex].height
        }
    }

    DrawLight(node, color)
    {
        var ctx = this.ctx;
        ctx.font = this.fontHeight + "px Arial";

        var topLeft = {
            x: node.position.x - 0.5 * node.width,
            y: node.position.y - 0.5 * node.height
        }

        var TL = this.ViewportPosition(topLeft);
        if(TL.x > this.width || TL.y > this.height) return;
        
        var BR = this.ViewportPosition({x: node.position.x + 0.5 * node.width, y: node.position.y + 0.5 * node.height});
        if(BR.x < 0.0 || BR.y < 0.0) return;

        var style = {
            bold: false,
            box: {x: topLeft.x, y: topLeft.y, width: node.width, height: node.height},
            align: {x: "center"},
            fontHeight: this.fontHeight,
            padding: this.fontPadding,
            textColor: "#FFFFFF",
            boxColor: "#ffc50080",
            radius: 20
        }
        this.DrawTextBox(node.name, style);
    }

    DrawParticleEmitter(node, color)
    {
        var ctx = this.ctx;
        ctx.font = this.fontHeight + "px Arial";

        var topLeft = {
            x: node.position.x - 0.5 * node.width,
            y: node.position.y - 0.5 * node.height
        }

        var TL = this.ViewportPosition(topLeft);
        if(TL.x > this.width || TL.y > this.height) return;
        
        var BR = this.ViewportPosition({x: node.position.x + 0.5 * node.width, y: node.position.y + 0.5 * node.height});
        if(BR.x < 0.0 || BR.y < 0.0) return;

        var style = {
            bold: false,
            box: {x: topLeft.x, y: topLeft.y, width: node.width, height: node.height},
            align: {x: "center"},
            fontHeight: this.fontHeight,
            padding: this.fontPadding,
            textColor: "#FFFFFF",
            boxColor: "#ffc34580",
            radius: 20
        }
        this.DrawTextBox(node.name, style);
    }

    DrawSensor(node, color)
    {
        var ctx = this.ctx;
        ctx.font = this.fontHeight + "px Arial";

        var topLeft = {
            x: node.position.x - 0.5 * node.width,
            y: node.position.y - 0.5 * node.height
        }

        var TL = this.ViewportPosition(topLeft);
        if(TL.x > this.width || TL.y > this.height) return;
        
        var BR = this.ViewportPosition({x: node.position.x + 0.5 * node.width, y: node.position.y + 0.5 * node.height});
        if(BR.x < 0.0 || BR.y < 0.0) return;

        var style = {
            bold: false,
            box: {x: topLeft.x, y: topLeft.y, width: node.width, height: node.height},
            align: {x: "center"},
            fontHeight: this.fontHeight,
            padding: this.fontPadding,
            textColor: "#FFFFFF",
            boxColor: "#a0054d80",
            radius: 20
        }
        this.DrawTextBox(node.name, style);
    }

    DrawBinding(node, color)
    {
        var ctx = this.ctx;
        ctx.font = this.fontHeight + "px Arial";

        var topLeft = {
            x: node.position.x - 0.5 * node.width,
            y: node.position.y - 0.5 * node.height
        }

        var TL = this.ViewportPosition(topLeft);
        if(TL.x > this.width || TL.y > this.height) return;
        
        var BR = this.ViewportPosition({x: node.position.x + 0.5 * node.width, y: node.position.y + 0.5 * node.height});
        if(BR.x < 0.0 || BR.y < 0.0) return;

        var style = {
            bold: false,
            box: {x: topLeft.x, y: topLeft.y, width: node.width, height: node.height},
            align: {x: "center"},
            fontHeight: this.fontHeight,
            padding: this.fontPadding,
            textColor: "#FFFFFF",
            boxColor: "#cb4922cf",
            radius: 20
        }
        this.DrawTextBox(node.name, style);
    }

    DrawProcess(node, color)
    {
        var ctx = this.ctx;
        ctx.font = this.fontHeight + "px Arial";

        var topLeft = {
            x: node.position.x - 0.5 * node.width,
            y: node.position.y - 0.5 * node.height
        }

        var TL = this.ViewportPosition(topLeft);
        if(TL.x > this.width || TL.y > this.height) return;
        
        var BR = this.ViewportPosition({x: node.position.x + 0.5 * node.width, y: node.position.y + 0.5 * node.height});
        if(BR.x < 0.0 || BR.y < 0.0) return;

        var style = {
            bold: false,
            box: {x: topLeft.x, y: topLeft.y, width: node.width, height: node.height},
            align: {x: "center"},
            fontHeight: this.fontHeight,
            padding: this.fontPadding,
            textColor: "#FFFFFF",
            boxColor: "#181d1aff",
            radius: 20
        }
        this.DrawTextBox(node.name, style);
    }

    DrawVoice(node, color)
    {
        var ctx = this.ctx;
        ctx.font = this.fontHeight + "px Arial";

        var topLeft = {
            x: node.position.x - 0.5 * node.width,
            y: node.position.y - 0.5 * node.height
        }

        var TL = this.ViewportPosition(topLeft);
        if(TL.x > this.width || TL.y > this.height) return;
        
        var BR = this.ViewportPosition({x: node.position.x + 0.5 * node.width, y: node.position.y + 0.5 * node.height});
        if(BR.x < 0.0 || BR.y < 0.0) return;

        var style = {
            bold: false,
            box: {x: topLeft.x, y: topLeft.y, width: node.width, height: node.height},
            align: {x: "center"},
            fontHeight: this.fontHeight,
            padding: this.fontPadding,
            textColor: "#FFFFFF",
            boxColor: "#21814669",
            radius: 20
        }
        this.DrawTextBox(node.name, style);
    }

    DrawAnimator(node, color)
    {
        var ctx = this.ctx;
        ctx.font = this.fontHeight + "px Arial";

        var topLeft = {
            x: node.position.x - 0.5 * node.width,
            y: node.position.y - 0.5 * node.height
        }

        var TL = this.ViewportPosition(topLeft);
        if(TL.x > this.width || TL.y > this.height) return;
        
        var BR = this.ViewportPosition({x: node.position.x + 0.5 * node.width, y: node.position.y + 0.5 * node.height});
        if(BR.x < 0.0 || BR.y < 0.0) return;

        var style = {
            bold: false,
            box: {x: topLeft.x, y: topLeft.y, width: node.width, height: node.height},
            align: {x: "center"},
            fontHeight: this.fontHeight,
            padding: this.fontPadding,
            textColor: "#FFFFFF",
            boxColor: "#5a40a38a",
            radius: 20
        }
        this.DrawTextBox(node.name, style);
    }

    DrawPhysicsAnimation(node, color)
    {
        var ctx = this.ctx;
        ctx.font = this.fontHeight + "px Arial";

        var topLeft = {
            x: node.position.x - 0.5 * node.width,
            y: node.position.y - 0.5 * node.height
        }

        var TL = this.ViewportPosition(topLeft);
        if(TL.x > this.width || TL.y > this.height) return;
        
        var BR = this.ViewportPosition({x: node.position.x + 0.5 * node.width, y: node.position.y + 0.5 * node.height});
        if(BR.x < 0.0 || BR.y < 0.0) return;

        var style = {
            bold: false,
            box: {x: topLeft.x, y: topLeft.y, width: node.width, height: node.height},
            align: {x: "center"},
            fontHeight: this.fontHeight,
            padding: this.fontPadding,
            textColor: "#FFFFFF",
            boxColor: "#40a39e8a",
            radius: 20
        }
        this.DrawTextBox(node.name, style);
    }

    DrawObject(node, color)
    {
        var ctx = this.ctx;
        ctx.font = this.fontHeight + "px Arial";

        var padding = this.fontPadding;

        var topLeft = {
            x: node.position.x - 0.5 * node.width,
            y: node.position.y - 0.5 * node.height
        }

        var TL = this.ViewportPosition(topLeft);
        if(TL.x > this.width || TL.y > this.height) return;
        
        var BR = this.ViewportPosition({x: node.position.x + 0.5 * node.width, y: node.position.y + 0.5 * node.height});
        if(BR.x < 0.0 || BR.y < 0.0) return;

        var style = {
            bold: true,
            box: {x: topLeft.x, y: topLeft.y, width: node.width, height: node.height},
            align: {x: "center"},
            fontHeight: this.fontHeight,
            padding: padding,
            textColor: "#FFFFFF",
            boxColor: "#0098FF70",
            radius: 20
        }
        this.DrawTextBox("Object", style);

        topLeft.y += (this.fontHeight + padding);
        style.box = {x: topLeft.x, y: topLeft.y, width: node.width};
        style.textColor = "#FFFFFF";
        style.boxColor = "";
        style.bold = false;
        this.DrawTextBox(node.name, style);
    }

    DrawNode(node, color, select_color)
    {
        var pos = node.position;
        var ctx = this.ctx;
        var fontHeight = this.fontHeight;
        var padding = this.fontPadding;

        ctx.font = fontHeight + "px Arial";
        
        var topLeft = {
            x: pos.x - 0.5 * node.width,
            y: pos.y - 0.5 * node.height
        }

        ctx.strokeStyle = color;
        ctx.fillStyle = color + "70";
        ctx.lineWidth = 1 * this.viewport.scale;
        this.RoundRect(topLeft.x, topLeft.y, node.width, node.height, 5, true, true);

        ctx.strokeStyle = "#ffffff00";
        ctx.fillStyle = select_color;   //"#ffffff";
        this.RoundRect(topLeft.x, topLeft.y, node.width, fontHeight + 2.0 * padding, 5, true, true);
        ctx.fillStyle = color + "70";

        this.DrawText(node.name, {x: topLeft.x + padding, y: topLeft.y + padding}, fontHeight, "#000000");

        if(!("inputs" in node)) node.inputs = []
        var inputCount = node.inputs.length;
        for(var i = 0; i < inputCount; i++)
        {
            let t_portPosition = {
                x: pos.x + node.inputs[i].position.x,
                y: pos.y + node.inputs[i].position.y
            }
            if(node.inputs[i].name !== "trigger") this.DrawPort(t_portPosition, color, this.portRadius);
            else this.DrawPort(t_portPosition, "#0ffff4", this.portRadius);
            this.DrawText(node.inputs[i].name, {x: t_portPosition.x + 2.0 * padding, y: t_portPosition.y - 0.5 * this.fontHeight}, fontHeight, color);
        }

        if(!("outputs" in node)) node.outputs = []
        var outputCount = node.outputs.length;
        for(var i = 0; i < outputCount; i++)
        {
            let t_portPosition = {
                x: pos.x + node.outputs[i].position.x,
                y: pos.y + node.outputs[i].position.y
            }
            this.DrawPort(t_portPosition, color, this.portRadius);

            let t_textSize = this.ctx.measureText(node.outputs[i].name);
            let t_textWidth = t_textSize.width / this.viewport.scale;
            this.DrawText(node.outputs[i].name, {x: t_portPosition.x - 2.0 * padding - t_textWidth, y: t_portPosition.y - 0.5 * this.fontHeight}, fontHeight, color);
        }
    }

    DrawNodeOutput(node_index, output_index)
    {
        var nodeA = this.nodes[node_index];
        var nodeBindex = nodeA.outputs[output_index].node;
        if(nodeBindex < 0) return;

        var nodeB = this.nodes[nodeBindex];
        var index = nodeA.outputs[output_index].port;
        if(index < 0) return;

        this.DrawVerticalConnection(nodeA, output_index, nodeB, index);
    }

    DrawVerticalConnection(node_A, output_index, node_B, input_index)
    {
        if(output_index >= node_A.outputs.length) return;
        if(input_index >= node_B.inputs.length) return;
        var posA = NodeVector.Add(node_A.position, node_A.outputs[output_index].position);
        var posB = NodeVector.Add(node_B.position, node_B.inputs[input_index].position);

        this.ctx.lineCap = "round";
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 3 * this.viewport.scale;

        var radiusA;
        var radiusB;
        if(posA.x < posB.x)
        {
            radiusA = node_A.position.x + 0.5 * node_A.width - posA.x;
            radiusB = posB.x - node_B.position.x + 0.5 * node_B.width;
        }
        else
        {
            radiusA = posA.x - node_A.position.x + 0.5 * node_A.width;
            radiusB = node_B.position.x + 0.5 * node_B.width - posB.x;
        }

        var ctx = this.ctx;

        var minRad = this.viewport.scale * 25;
        posA = this.ViewportPosition(posA);
        posB = this.ViewportPosition(posB);
        var min = {x: Math.min(posA.x, posB.x), y: Math.min(posA.y, posB.y)};
        var max = {x: Math.max(posA.x, posB.x), y: Math.max(posA.y, posB.y)};
        if(min.x > this.width || min.y > this.height) return;
        if(max.x < 0.0 || max.y < 0.0) return;

        radiusA = this.viewport.scale * radiusA;
        radiusB = this.viewport.scale * radiusB;
        if(posA.y + minRad < posB.y - minRad)
        {
            var midy = 0.5 * (posA.y + posB.y);

            ctx.beginPath();
            ctx.moveTo(posA.x, posA.y);
            ctx.bezierCurveTo(posA.x, midy, posB.x, midy, posB.x, posB.y);
            ctx.stroke();
        }
        else if(posA.x < posB.x)
        {
            var dx = (posB.x - posA.x) / 6.0;
            var midx = 0.5 * (posA.x + posB.x);

            ctx.beginPath();
            ctx.moveTo(posA.x, posA.y);
            ctx.quadraticCurveTo(posA.x, posA.y + radiusA, posA.x + dx, posA.y + radiusA);
            ctx.bezierCurveTo(midx, posA.y + radiusA, midx, posB.y - radiusB, posB.x - dx, posB.y - radiusB);
            ctx.quadraticCurveTo(posB.x, posB.y - radiusB, posB.x, posB.y);
            ctx.stroke();
        }
        else
        {
            var dx = (posA.x - posB.x) / 6.0;
            var midx = 0.5 * (posA.x + posB.x);

            ctx.beginPath();
            ctx.moveTo(posA.x, posA.y);
            ctx.quadraticCurveTo(posA.x, posA.y + radiusA, posA.x - dx, posA.y + radiusA);
            ctx.bezierCurveTo(midx, posA.y + radiusA, midx, posB.y - radiusB, posB.x + dx, posB.y - radiusB);
            ctx.quadraticCurveTo(posB.x, posB.y - radiusB, posB.x, posB.y);
            ctx.stroke();
        }
    }

    
    DrawHorizontalConnection(node_A, output_index, node_B, input_index)
    {
        if(output_index >= node_A.outputs.length) return;
        if(input_index >= node_B.inputs.length) return;
        var posA = NodeVector.Add(node_A.position, node_A.outputs[output_index].position);
        var posB = NodeVector.Add(node_B.position, node_B.inputs[input_index].position);

        var radiusA;
        var radiusB;
        if(posA.y < posB.y)
        {
            radiusA = node_A.position.y + 0.5 * node_A.height - posA.y;
            radiusB = posB.y - node_B.position.y + 0.5 * node_B.height;
        }
        else
        {
            radiusA = posA.y - node_A.position.y + 0.5 * node_A.height;
            radiusB = node_B.position.y + 0.5 * node_B.height - posB.y;
        }

        posA = this.ViewportPosition(posA);
        posB = this.ViewportPosition(posB);

        var ctx = this.ctx;
        this.ctx.lineCap = "round";
        this.ctx.lineWidth = 3 * this.viewport.scale;
        if(node_B.inputs[input_index].name === "trigger")
        {
            let grd = this.ctx.createLinearGradient(posA.x, 0, posB.x, 0);
            grd.addColorStop(0, "white");
            grd.addColorStop(1, "#0ffff4");
            this.ctx.strokeStyle = grd;    
        }
        else this.ctx.strokeStyle = "#FFFFFF";


        var min = {x: Math.min(posA.x, posB.x), y: Math.min(posA.y, posB.y)};
        var max = {x: Math.max(posA.x, posB.x), y: Math.max(posA.y, posB.y)};
        if(min.x > this.width || min.y > this.height) return;
        if(max.x < 0.0 || max.y < 0.0) return;

        radiusA = this.viewport.scale * radiusA;
        radiusB = this.viewport.scale * radiusB;
        if(posA.x < posB.x)
        {
            var midx = 0.5 * (posA.x + posB.x);

            ctx.beginPath();
            ctx.moveTo(posA.x, posA.y);
            ctx.bezierCurveTo(midx, posA.y, midx, posB.y, posB.x, posB.y);
            ctx.stroke();
        }
        else if(posA.y < posB.y)
        {
            var dy = (posB.y - posA.y) / 6.0;
            var midy = 0.5 * (posA.y + posB.y);

            ctx.beginPath();
            ctx.moveTo(posA.x, posA.y);
            ctx.quadraticCurveTo(posA.x + radiusA, posA.y, posA.x + radiusA, posA.y + dy);
            ctx.bezierCurveTo(posA.x + radiusA, midy, posB.x - radiusB, midy, posB.x - radiusB, posB.y - dy);
            ctx.quadraticCurveTo(posB.x - radiusB, posB.y, posB.x, posB.y);
            ctx.stroke();
        }
        else
        {
            var dy = (posA.y - posB.y) / 6.0;
            var midy = 0.5 * (posA.y + posB.y);

            ctx.beginPath();
            ctx.moveTo(posA.x, posA.y);
            ctx.quadraticCurveTo(posA.x + radiusA, posA.y, posA.x + radiusA, posA.y - dy);
            ctx.bezierCurveTo(posA.x + radiusA, midy, posB.x - radiusB, midy, posB.x - radiusB, posB.y + dy);
            ctx.quadraticCurveTo(posB.x - radiusB, posB.y, posB.x, posB.y);
            ctx.stroke();
        }
    }

    DrawSimpleConnection(node_A, node_B, index)
    {
        var offset = 0;
        if(node_A.outputs.length > 1) offset = (-0.2 + index * 0.4 / (node_A.outputs.length - 1)) * node_A.width;

        var posA = {
            x: node_A.position.x + offset,
            y: node_A.position.y + 0.5 * node_A.height
        }
        var posB = {
            x: node_B.position.x,
            y: node_B.position.y - 0.5 * node_B.height
        }

        this.ctx.lineCap = "round";
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 3 * this.viewport.scale;

        var radiusA = 0.5 * node_A.width;
        var radiusB = 0.5 * node_B.width;

        var ctx = this.ctx;

        var minRad = this.viewport.scale * 25;
        posA = this.ViewportPosition(posA);
        posB = this.ViewportPosition(posB);
        var min = {x: Math.min(posA.x, posB.x), y: Math.min(posA.y, posB.y)};
        var max = {x: Math.max(posA.x, posB.x), y: Math.max(posA.y, posB.y)};
        if(min.x > this.width || min.y > this.height) return;
        if(max.x < 0.0 || max.y < 0.0) return;

        radiusA = this.viewport.scale * radiusA;
        radiusB = this.viewport.scale * radiusB;
        if(posA.y + minRad < posB.y - minRad)
        {
            var midy = 0.5 * (posA.y + posB.y);

            ctx.beginPath();
            ctx.moveTo(posA.x, posA.y);
            ctx.bezierCurveTo(posA.x, midy, posB.x, midy, posB.x, posB.y);
            ctx.stroke();
        }
        else if(posA.x < posB.x)
        {
            var dx = (posB.x - posA.x) / 6.0;
            var midx = 0.5 * (posA.x + posB.x);

            ctx.beginPath();
            ctx.moveTo(posA.x, posA.y);
            ctx.quadraticCurveTo(posA.x, posA.y + radiusA, posA.x + dx, posA.y + radiusA);
            ctx.bezierCurveTo(midx, posA.y + radiusA, midx, posB.y - radiusB, posB.x - dx, posB.y - radiusB);
            ctx.quadraticCurveTo(posB.x, posB.y - radiusB, posB.x, posB.y);
            ctx.stroke();
        }
        else
        {
            var dx = (posA.x - posB.x) / 6.0;
            var midx = 0.5 * (posA.x + posB.x);

            ctx.beginPath();
            ctx.moveTo(posA.x, posA.y);
            ctx.quadraticCurveTo(posA.x, posA.y + radiusA, posA.x - dx, posA.y + radiusA);
            ctx.bezierCurveTo(midx, posA.y + radiusA, midx, posB.y - radiusB, posB.x + dx, posB.y - radiusB);
            ctx.quadraticCurveTo(posB.x, posB.y - radiusB, posB.x, posB.y);
            ctx.stroke();
        }
    }


    LoadOperator(_operator)
    {
        var node = {};
        node.type = "node";
        node.inputs = [];
        node.outputs = [];
        node.name = _operator.name;
        if(_operator.listener)
        {
            if(allProcessNodes.listener[_operator.listener]) node = structuredClone(allProcessNodes.listener[_operator.listener]);
            node.type = "node";
            node.name = _operator.name;
            node.operator = "listener";
            node.suboperator = _operator.listener;
        }
        else if(_operator.constant)
        {
            if(allProcessNodes.constant[_operator.constant]) node = structuredClone(allProcessNodes.constant[_operator.constant]);
            node.type = "node";
            node.name = _operator.name;
            node.operator = "constant";
            node.suboperator = _operator.constant;
        }
        else if(_operator.math)
        {
            if(allProcessNodes.math[_operator.math]) node = structuredClone(allProcessNodes.math[_operator.math]);
            node.type = "node";
            node.name = _operator.name;
            node.operator = "math";
            node.suboperator = _operator.math;
        }
        else if(_operator.switch)
        {
            if(allProcessNodes.switch[_operator.switch]) node = structuredClone(allProcessNodes.switch[_operator.switch]);
            node.type = "node";
            node.name = _operator.name;
            node.operator = "switch";
            node.suboperator = _operator.switch;
        }
        else if(_operator.action)
        {
            if(allProcessNodes.action[_operator.action]) node = structuredClone(allProcessNodes.action[_operator.action]);
            node.type = "node";
            node.name = _operator.name;
            node.operator = "action";
            node.suboperator = _operator.action;
        }
        else if(_operator.route)
        {
            if(allProcessNodes.route[_operator.route]) node = structuredClone(allProcessNodes.route[_operator.route]);
            node.type = "node";
            node.name = _operator.name;
            node.operator = "route";
            node.suboperator = _operator.route;
        }
        else if(_operator.set)
        {
            if(allProcessNodes.set[_operator.set]) node = structuredClone(allProcessNodes.set[_operator.set]);
            node.type = "node";
            node.name = _operator.name;
            node.operator = "set";
            node.suboperator = _operator.set;
        }
        else if(_operator.get)
        {
            if(allProcessNodes.get[_operator.get]) node = structuredClone(allProcessNodes.get[_operator.get]);
            node.type = "node";
            node.name = _operator.name;
            node.operator = "get";
            node.suboperator = _operator.get;
        }
        else if(_operator.script)
        {
            if(allProcessNodes.script[_operator.script]) node = structuredClone(allProcessNodes.script[_operator.script]);
            node.type = "node";
            node.name = _operator.name;
            node.operator = "script";
            node.suboperator = _operator.script;
        }
        else if(_operator.data_op)
        {
            if(allProcessNodes.data_op[_operator.data_op]) node = structuredClone(allProcessNodes.data_op[_operator.data_op]);
            node.type = "node";
            node.name = _operator.name;
            node.operator = "data_op";
            node.suboperator = _operator.data_op;
        }

        /// compute node dimension
        this.ctx.font = this.fontHeight + "px Arial";
        let t_texts = [node.name];
        if(node.inputs) for(var j = 0; j < node.inputs.length; j++) t_texts.push(node.inputs[j].name);
        if(node.outputs) for(var j = 0; j < node.outputs.length; j++) t_texts.push(node.outputs[j].name);
        let t_maxWidth = 0, t_height = this.fontPadding;
        for(let j = 0; j < t_texts.length; j++)
        {
            let textSize = this.ctx.measureText(t_texts[j]);
            t_maxWidth = Math.max(t_maxWidth, textSize.width);
            t_height += this.fontHeight + this.fontPadding;
        }
        node.width = t_maxWidth + 2.0 * this.fontPadding;
        node.height = t_height + this.fontPadding;

        let t_dy = this.fontHeight + this.fontPadding;
        let t_posY = -0.5 * (node.height) + 2.0 * this.fontPadding + t_dy;

        if(node.inputs)
        {
            let t_posX = -0.5 * node.width - this.fontPadding;
            for(var j = 0; j < node.inputs.length; j++)
            {
                node.inputs[j] = {name: node.inputs[j].name, node: -1, port: -1, position: {x: t_posX, y: t_posY + 0.5 * this.fontHeight}};
                t_posY += t_dy;
            }
        }

        if(node.outputs)
        {
            let t_posX = 0.5 * node.width + this.fontPadding;
            for(var j = 0; j < node.outputs.length; j++)
            {
                node.outputs[j] = {name: node.outputs[j].name, nodes: [], position: {x: t_posX, y: t_posY + 0.5 * this.fontHeight}};
                t_posY += t_dy;
            }
        }

        if(_operator.parameters) node.parameters = _operator.parameters;

        if(Array.isArray(_operator.position))
        {
            node.position = {
                x: _operator.position[0],
                y: _operator.position[1]
            }
        }
        else
        {
            node.position = {
                x: _operator.position.x || 0.0,
                y: _operator.position.y || 0.0
            }
        }

        return node;
    }

    LoadOperators(operators)
    {
        for(var i = 0; i < operators.length; i++)
        {
            var node = this.LoadOperator(operators[i]);
            this.AddNode(node);
        }

        for(var i = 0; i < operators.length; i++)
        {
            var operator = operators[i];
            for(var j = 0; j < operator.outputs.length; j++)
            {
                var output = operator.outputs[j];
                for(var k = 0; k < output.ports.length; k++)
                {
                    var inNode = output.ports[k][0];
                    var inPort = output.ports[k][1];
                    var outNode = i;
                    var outPort = j;
                    this.ConnectNodes(outNode, outPort, inNode, inPort);
                }
            }
        }
    }

    LoadProcess(process)
    {
        // console.log(process);
        this.mode = "process";
        if(process.operators) this.LoadOperators(process.operators);
        this.DrawAll();
    }

    SaveNode(node)
    {
        var json = {
            position: [parseFloat(node.position.x.toFixed(3)), parseFloat(node.position.y.toFixed(3))],
            outputs: [],
            inputs: [],
            name: node.name
        };

        for(var i = 0; i < node.inputs.length; i++)
        {
            json.inputs[i] = {
                port: [node.inputs[i].node, node.inputs[i].port]
            }
        }

        for(var i = 0; i < node.outputs.length; i++)
        {
            json.outputs[i] = {
                ports: []
            };
            for(var j = 0; j < node.outputs[i].nodes.length; j++) json.outputs[i].ports[j] = [node.outputs[i].nodes[j].node, node.outputs[i].nodes[j].port];
        }

        json[node.operator] = node.suboperator;
        if(node.parameters) json.parameters = node.parameters;

        return json;
    }

    Save()
    {
        this.HideNodeData(true);

        var json = {
            operators: []
        };
        for(var i = 0; i < this.nodes.length; i++)
        {
            json.operators[i] = this.SaveNode(this.nodes[i]);
        }

        return json;
    }





    LoadObjectMesh(mesh, obj_id)
    {
        var node = {};
        node.type = "mesh";
        node.inputs = [];
        node.name = mesh.name;
        node.inputs = [];
        node.outputs = [];
        node.id = obj_id;
        node.position = {x: 0, y: 0};

        node.data = mesh;

        node.parts = [];
        for(var i = 0; i < mesh.materials.length; i++) node.parts[i] = {name: mesh.materials[i].name, position: {x: 0, y: 0}, width: 0, height: 0, data: mesh.materials[i]};
        node.parts[mesh.materials.length] = {
            name: "Physics",
            position: {x: 0, y: 0},
            width: 0,
            height: 0
        }

        var height = (2 + node.parts.length) * (this.fontHeight + 3.0 * this.fontPadding) - 3.0 * this.fontPadding;
        var width = 150;
        node.width = width + 2.0 * this.fontPadding;
        node.height = height + 2.0 * this.fontPadding;

        return this.AddNode(node);        
    }

    LoadObjectLight(light, index, obj_id)
    {
        var node = {};
        node.type = "light";
        node.inputs = [];
        node.outputs = [];
        node.name = "Light " + index;
        node.id = light.id;
        node.objectId = obj_id;
        node.index = index;
        node.inputs = [];
        node.outputs = [];
        node.position = {x: 0, y: 0};
        node.data = light;

        var width = 150;
        var height = this.fontHeight;
        node.width = width + 2.0 * this.fontPadding;
        node.height = height + 2.0 * this.fontPadding;

        return this.AddNode(node);        
    }

    LoadParticleEmitter(emitter, index, obj_id)
    {
        var node = {};
        node.type = "particle_emitter";
        node.inputs = [];
        node.outputs = [];
        node.name = "Particle Emitter " + index;
        node.id = emitter.id;
        node.objectId = obj_id;
        node.index = index;
        node.inputs = [];
        node.outputs = [];
        node.position = {x: 0, y: 0};
        node.data = emitter;

        var width = 150;
        var height = this.fontHeight;
        node.width = width + 2.0 * this.fontPadding;
        node.height = height + 2.0 * this.fontPadding;

        return this.AddNode(node);        
    }

    LoadObjectSensor(sensor, index, obj_id)
    {
        var node = {};
        node.type = "sensor";
        node.inputs = [];
        node.outputs = [];
        node.name = "Sensor " + index;
        node.id = sensor.id;
        node.objectId = obj_id;
        node.index = index;
        node.inputs = [];
        node.outputs = [];
        node.position = {x: 0, y: 0};
        node.data = sensor;

        var width = 150;
        var height = this.fontHeight;
        node.width = width + 2.0 * this.fontPadding;
        node.height = height + 2.0 * this.fontPadding;

        return this.AddNode(node);        
    }

    LoadObjectProcess(process, index, obj_id)
    {
        var node = {};
        node.type = "process";
        node.inputs = [];
        node.outputs = [];
        node.name = "Process " + index;
        node.id = process.id;
        node.objectId = obj_id;
        node.index = index;
        node.inputs = [];
        node.outputs = [];
        node.position = {x: 0, y: 0};
        node.data = process;

        var width = 150;
        var height = this.fontHeight;
        node.width = width + 2.0 * this.fontPadding;
        node.height = height + 2.0 * this.fontPadding;

        return this.AddNode(node);        
    }

    LoadObjectVoice(voice, index, obj_id)
    {
        var node = {};
        node.type = "voice";
        node.inputs = [];
        node.outputs = [];
        node.name = "Voice " + index;
        node.id = voice.id;
        node.objectId = obj_id;
        node.index = index;
        node.inputs = [];
        node.outputs = [];
        node.position = {x: 0, y: 0};
        node.data = voice;

        var width = 150;
        var height = this.fontHeight;
        node.width = width + 2.0 * this.fontPadding;
        node.height = height + 2.0 * this.fontPadding;

        return this.AddNode(node);        
    }

    LoadPhysicsAnimation(animation, index, obj_id)
    {
        var node = {};
        node.type = "physics_animation";
        node.inputs = [];
        node.outputs = [];
        node.name = "Animation " + index;
        node.id = animation.id;
        node.objectId = obj_id;
        node.index = index;
        node.inputs = [];
        node.outputs = [];
        node.position = {x: 0, y: 0};
        node.data = animation;

        var width = 150;
        var height = this.fontHeight;
        node.width = width + 2.0 * this.fontPadding;
        node.height = height + 2.0 * this.fontPadding;

        return this.AddNode(node);        
    }

    LoadObjectAnimator(animator, index, obj_id)
    {
        var node = {};
        node.type = "animator";
        node.inputs = [];
        node.outputs = [];
        node.name = "Animator " + index;
        node.id = animator.id;
        node.objectId = obj_id;
        node.index = index;
        node.inputs = [];
        node.outputs = [];
        node.position = {x: 0, y: 0};
        node.data = animator;

        var width = 150;
        var height = this.fontHeight;
        node.width = width + 2.0 * this.fontPadding;
        node.height = height + 2.0 * this.fontPadding;

        return this.AddNode(node);        
    }

    LoadObjectBinding(binding, index, obj_id)
    {
        var node = {};
        node.type = "binding";
        node.inputs = [];
        node.outputs = [];
        node.name = "Binding " + index;
        node.id = binding.id;
        node.objectId = obj_id;
        node.index = index;
        node.inputs = [];
        node.outputs = [];
        node.position = {x: 0, y: 0};
        node.data = binding;

        var width = 150;
        var height = this.fontHeight;
        node.width = width + 2.0 * this.fontPadding;
        node.height = height + 2.0 * this.fontPadding;

        return this.AddNode(node);        
    }

    LoadPart(part)
    {
        var node = {};
        node.type = "object";
        node.inputs = [];
        node.outputs = [];
        node.name = part.name;
        node.id = part.id;
        node.inputs = [];
        node.outputs = [];
        node.position = {x: 0, y: 0};
        node.lights = [];
        node.particle_emitters = [];
        node.sensors = [];
        node.processes = [];
        node.voices = [];
        node.animators = [];
        node.bindings = [];
        node.physics_animations = [];
        node.object_path = part.object_path;
        node.data = part;

        var height = 2.0 * this.fontHeight + this.fontPadding;
        var width = 150;
        node.width = width + 2.0 * this.fontPadding;
        node.height = height + 2.0 * this.fontPadding;

        var outputCount = 0;

        if(part.meshObject)
        {
            var meshIndex = this.LoadObjectMesh(part.meshObject, part.id);
            this.nodes[meshIndex].object_path = part.object_path;
            node.outputs[outputCount++] = meshIndex;
        }

        if(part.mesh)
        {
            var meshIndex = this.LoadObjectMesh(part.mesh, part.id);
            this.nodes[meshIndex].object_path = part.object_path;
            node.outputs[outputCount++] = meshIndex;
        }

        if(part.lights)
        {
            for(var i = 0; i < part.lights.length; i++)
            {
                var lightIndex = this.LoadObjectLight(part.lights[i], i, part.id);
                this.nodes[lightIndex].object_path = part.object_path;
                node.outputs[outputCount++] = lightIndex;
                node.lights.push(lightIndex);
            }
        }

        if(part.particle_emitters)
        {
            for(var i = 0; i < part.particle_emitters.length; i++)
            {
                var t_index = this.LoadParticleEmitter(part.particle_emitters[i], i, part.id);
                this.nodes[t_index].object_path = part.object_path;
                node.outputs[outputCount++] = t_index;
                node.particle_emitters.push(t_index);
            }
        }

        if(part.sensors)
        {
            for(var i = 0; i < part.sensors.length; i++)
            {
                var sensorIndex = this.LoadObjectSensor(part.sensors[i], i, part.id);
                this.nodes[sensorIndex].object_path = part.object_path;
                node.outputs[outputCount++] = sensorIndex;
                node.sensors.push(sensorIndex);
            }
        }

        if(part.processes)
        {
            for(var i = 0; i < part.processes.length; i++)
            {
                var processIndex = this.LoadObjectProcess(part.processes[i], i, part.id);
                this.nodes[processIndex].object_path = part.object_path;
                node.outputs[outputCount++] = processIndex;
                node.processes.push(processIndex);
            }
        }

        if(part.voices)
        {
            for(var i = 0; i < part.voices.length; i++)
            {
                var voiceIndex = this.LoadObjectVoice(part.voices[i], i, part.id);
                this.nodes[voiceIndex].object_path = part.object_path;
                node.outputs[outputCount++] = voiceIndex;
                node.voices.push(voiceIndex);
            }
        }

        if(part.animationPlayers)
        {
            for(var i = 0; i < part.animationPlayers.length; i++)
            {
                var animatorIndex = this.LoadObjectAnimator(part.animationPlayers[i], i, part.id);
                this.nodes[animatorIndex].object_path = part.object_path;
                node.outputs[outputCount++] = animatorIndex;
                node.animators.push(animatorIndex);
            }
        }

        if(part.bindings)
        {
            for(var i = 0; i < part.bindings.length; i++)
            {
                var bindingIndex = this.LoadObjectBinding(part.bindings[i], i, part.id);
                this.nodes[bindingIndex].object_path = part.object_path;
                node.outputs[outputCount++] = bindingIndex;
                node.bindings.push(bindingIndex);
            }
        }

        if(part.physics_animations)
        {
            for(var i = 0; i < part.physics_animations.length; i++)
            {
                var animationIndex = this.LoadPhysicsAnimation(part.physics_animations[i], i, part.id);
                this.nodes[animationIndex].object_path = part.object_path;
                node.outputs[outputCount++] = animationIndex;
                node.physics_animations.push(animationIndex);
            }
        }


        if(part.childs)
        {
            for(var i = 0; i < part.childs.length; i++) node.outputs[outputCount++] = this.LoadPart(part.childs[i]);
        }

        var topIndex = this.AddNode(node);

        for(var i = 0; i < node.outputs.length; i++) this.nodes[node.outputs[i]].inputs[0] = topIndex;

        return topIndex;
    }

    ComputeNodeSize(node)
    {
        var padding = 50;

        var width = 0;
        var height = 0;
        if(!node.outputs || node.outputs.length == 0)
        {
            width = node.width + padding;
            height = node.height;
        }
        else
        {
            for(var i = 0; i < node.outputs.length; i++)
            {
                width += this.ComputeNodeSize(this.nodes[node.outputs[i]]);
                height = Math.max(height, this.nodes[node.outputs[i]].height);
            }
        }

        node.childWidth = width;
        node.childHeight = height;

        return width;
    }

    ComputeChildPosition(node)
    {
        var totalWidth = node.childWidth;

        if(node.outputs.length == 0) return;
        else if(node.outputs.length == 1)
        {
            var child = this.nodes[node.outputs[0]];
            child.position = {
                x: node.position.x,
                y: node.position.y + node.height + 75 + 0.5 * child.height
            }
            this.ComputeChildPosition(child);
        }
        else
        {
            var countObject = 0;
            for(var i = 0; i < node.outputs.length; i++) if(this.nodes[node.outputs[i]].type === "object") countObject++;

            if(countObject == 1)
            {
                totalWidth = 0;
                for(var i = 0; i < node.outputs.length; i++)
                {
                    if(this.nodes[node.outputs[i]].type === "object") totalWidth += 200;
                    else totalWidth += (this.nodes[node.outputs[i]].width + 50);
                }

                var startPos = {
                    x: node.position.x - 0.5 * totalWidth + 50,
                    y: node.position.y + node.height + 75
                }

                var child;
                for(var i = 0; i < node.outputs.length; i++)
                {
                    child = this.nodes[node.outputs[i]];
        
                    child.position = {
                        x: startPos.x + 0.5 * child.width - 25,
                        y: startPos.y + 0.5 * child.height
                    }
                    this.ComputeChildPosition(child);
        
                    startPos.x += (child.width + 50);
                }        
            }
            else
            {
                var startPos = {
                    x: node.position.x - 0.5 * totalWidth + 25,
                    y: node.position.y + node.height + 75
                }
    
                var child;
                for(var i = 0; i < node.outputs.length; i++)
                {
                    child = this.nodes[node.outputs[i]];
        
                    child.position = {
                        x: startPos.x + 0.5 * child.width,
                        y: startPos.y + 0.5 * child.height
                    }
                    this.ComputeChildPosition(child);
        
                    startPos.x += child.childWidth;
                }        
            }
        }
    }

    ArrangeNodesOld()
    {
        var topNode = this.nodes[0];
        while(topNode.inputs.length > 0) topNode = this.nodes[topNode.inputs[0]];

        this.ComputeNodeSize(topNode);

        topNode.position = {x: 250, y: 100};
        this.ComputeChildPosition(topNode);
        this.DrawAll();        
    }




    ArrangeChildren(node_index, grid, pos)
    {
        var node = this.nodes[node_index];
        if(node.outputs.length == 0) return;

        pos.y++;
        if(pos.y == grid.size.y)
        {
            grid.data[grid.size.y] = new Array(grid.size.x);
            for(var i = 0; i < grid.size.x; i++) grid.data[grid.size.y][i] = -1;
            grid.size.y++;
        }
        else
        {
            var k;
            for(k = pos.x; k < grid.size.x; k++) if(grid.data[pos.y][k] < 0) break;
            pos.x = k;
        }

        for(var i = 0; i < node.outputs.length; i++)
        {
            var child = this.nodes[node.outputs[i]];
            child.position = {x: pos.x, y: pos.y};
            
            if(child.type === "mesh")
            {
                var posy = pos.y;
                var l = child.parts.length;
                for(var j = 0; j < l / 2; j++)
                {
                    if(posy == grid.size.y)
                    {
                        grid.data[grid.size.y] = new Array(grid.size.x);
                        for(var k = 0; k < grid.size.x; k++) grid.data[grid.size.y][k] = -1;
                        grid.size.y++;
                    }
                    grid.data[posy++][pos.x] = node.outputs[i];
                }
            }
            else grid.data[pos.y][pos.x] = node.outputs[i];


            this.ArrangeChildren(node.outputs[i], grid, {x: pos.x, y: pos.y});

            pos.x++;
        }
    }

    AveragePosition(node)
    {
        if(node.outputs.length == 0) return;

        var posX = 0;
        var count = node.outputs.length;
        for(var i = 0; i < count; i++)
        {
            var child = this.nodes[node.outputs[i]];
            posX += child.position.x;

            this.AveragePosition(child);
        }

        posX /= count;
        node.position.x = posX;
    }

    ArrangeNodes()  //// TODO: improve node organization
    {
        var topIndex = 0;
        while(this.nodes[topIndex].inputs.length > 0) topIndex = this.nodes[topIndex].inputs[0];

        var grid = {
            size: {x: this.nodes.length, y: 1},
            data: [],
        }
        grid.data[0] = new Array(this.nodes.length);
        for(var i = 0; i < grid.size.x; i++) grid.data[0][i] = -1;

        var pos = {x: 0, y: 0};
        grid.data[0][0] = topIndex;
        this.nodes[topIndex].position = {x: pos.x, y: pos.y};

        this.ArrangeChildren(topIndex, grid, pos);

        for(var i = 0; i < this.nodes.length; i++)
        {
            var child = this.nodes[i];
        
            child.position.x = 250 + 200 * child.position.x + 0.5 * child.width;
            child.position.y = 100 + 150 * child.position.y + 0.5 * child.height;
        }

        for(var i = 0; i < 20; i++)
        {
            this.AveragePosition(this.nodes[topIndex]);
        }

        this.DrawAll();
    }

    LoadObject(obj)
    {
        this.mode = "object";
        this.viewport.scale = 0.5;
//        console.log(obj);
        var topIndex = this.LoadPart(obj);
        this.ArrangeNodes();
    }

    DeleteNodeByID(node_id)
    {
        var i;
        for(i = 0; i < this.nodes.length; i++) if(this.nodes[i].id && this.nodes[i].id === node_id) break;
        if(i < this.nodes.length) this.DeleteNode(this.nodes[i]);
    }
}


var allProcessNodes = {
    get: {
        position: {
            type: "node",
            name: "Get Position",
            parameters: {
                object$li: -1
            },
            inputs: [{name: "trigger"}],
            outputs: [{name: "position"}],
        },
        rotation: {
            type: "node",
            name: "Get Rotation",
            parameters: {
                object$li: -1
            },
            inputs: [{name: "trigger"}],
            outputs: [{name: "rotation"}],
        },
        velocity: {
            type: "node",
            name: "Get Velocity",
            parameters: {
                object$li: -1
            },
            inputs: [{name: "trigger"}],
            outputs: [{name: "velocity"}],
        },
        center: {
            type: "node",
            name: "Get Center",
            parameters: {
                object$li: -1
            },
            inputs: [{name: "trigger"}],
            outputs: [{name: "center"}],
        },
        avatar: {
            type: "node",
            name: "Get Avatar Attributes",
            parameters: {
                attribute: ""
            },
            inputs: [{name: "trigger"}],
            outputs: [{name: "attribute"}],
        },
        space: {
            type: "node",
            name: "Get Space Attributes",
            parameters: {
                attribute: ""
            },
            inputs: [{name: "trigger"}],
            outputs: [{name: "attribute"}],
        },
        object_attribute: {
            type: "node",
            name: "Get Object Attributes",
            parameters: {
                path: "",
                object$li: -1,
                attribute: ""
            },
            inputs: [{name: "trigger"}],
            outputs: [{name: "attribute"}],
        },
    },
    set: {
        position: {
            type: "node",
            name: "Set Position",
            parameters: {
                object$li: -1
            },
            inputs: [{name: "position"}, {name: "trigger"}],
        },
        rotation: {
            type: "node",
            name: "Set Rotation",
            parameters: {
                object$li: -1
            },
            inputs: [{name: "rotation"}, {name: "trigger"}],
        },
        velocity: {
            type: "node",
            name: "Set Velocity",
            parameters: {
                object$li: -1
            },
            inputs: [{name: "velocity"}, {name: "trigger"}],
        },
        avatar: {
            type: "node",
            name: "Set Avatar Attribute",
            parameters: {
                attribute: ""
            },
            inputs: [{name: "value"}, {name: "trigger"}],
            outputs: []
        },
        space: {
            type: "node",
            name: "Set Space Attribute",
            parameters: {
                attribute: ""
            },
            inputs: [{name: "value"}, {name: "trigger"}],
            outputs: []
        },
        object_attribute: {
            type: "node",
            name: "Set Object Attribute",
            parameters: {
                path: "",
                object$li: -1,
                attribute: ""
            },
            inputs: [{name: "value"}, {name: "trigger"}],
            outputs: []
        },
        avatar_position: {
            type: "node",
            name: "Set Avatar Position",
            parameters: {
                position$v3: [0.0, 0.0, 0.0]
            },
            inputs: [{name: "position"}, {name: "trigger"}],
        },
    },
    math: {
        and: {
            type: "node",
            name: "And",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        or: {
            type: "node",
            name: "Or",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        addition: {
            type: "node",
            name: "Add",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        substract: {
            type: "node",
            name: "Substract",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        dot: {
            type: "node",
            name: "Dot",
            inputs: [{name: "vector A"}, {name: "vector B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        distance: {
            type: "node",
            name: "Distance",
            inputs: [{name: "vector A"}, {name: "vector B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        less_than: {
            type: "node",
            name: "Less Than",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        more_than: {
            type: "node",
            name: "More Than",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        equal: {
            type: "node",
            name: "Equal",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        divide: {
            type: "node",
            name: "Divide",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        multiply: {
            type: "node",
            name: "Multiply",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        max: {
            type: "node",
            name: "Max",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        min: {
            type: "node",
            name: "Min",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        mean: {
            type: "node",
            name: "Mean",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
        normalize: {
            type: "node",
            name: "Normalize",
            inputs: [{name: "value A"}, {name: "value B"}, {name: "trigger"}],
            outputs: [{name: "result"}]
        },
    },
    constant: {
        boolean: {
            type: "node",
            name: "Boolean",
            parameters: {
                value: false
            },
            outputs: [{name: "boolean"}]
        },
        text: {
            type: "node",
            name: "Text",
            parameters: {
                value: ""
            },
            outputs: [{name: "text"}]
        },
        number: {
            type: "node",
            name: "Number",
            parameters: {
                value: 0.0
            },
            inputs: [],
            outputs: [{name: "number"}],
        },
        vec2: {
            type: "node",
            name: "2D Vector",
            parameters: {
                value$v2: [0.0, 0.0]
            },
            outputs: [{name: "vector"}],
        },
        vec3: {
            type: "node",
            name: "3D Vector",
            parameters: {
                value$v3: [0.0, 0.0, 0.0]
            },
            outputs: [{name: "vector"}],
        },
        vec4: {
            type: "node",
            name: "4D Vector",
            parameters: {
                value$v4: [0.0, 0.0, 0.0, 0.0]
            },
            outputs: [{name: "vector"}],
        },
        mat2: {
            type: "node",
            name: "2D Matrix",
            parameters: {
                value$m2: [1.0, 0.0, 0.0, 1.0]
            },
            outputs: [{name: "matrix"}],
        },
        mat3: {
            type: "node",
            name: "3D Matrix",
            parameters: {
                value$m3: [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]
            },
            outputs: [{name: "matrix"}],
        },
        mat4: {
            type: "node",
            name: "4D Matrix",
            parameters: {
                value$m4: [1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0]
            },
            outputs: [{name: "matrix"}],
        },
        dob: {
            type: "node",
            name: "Constant",
            parameters: {
                value: {}
            },
            outputs: [{name: "data"}],
        }
    },
    script: {
        javascript: {
            type: "node",
            name: "Javascript",
            parameters: {
                script: ""
            },
            inputs: [{name: "input"}, {name: "trigger"}],
            outputs: [{name: "output"}]
        },
        javascript_async: {
            type: "node",
            name: "Async Javascript",
            parameters: {
                script: ""
            },
            inputs: [{name: "input"}, {name: "trigger"}],
            outputs: [{name: "output"}]
        },
        command: {
            type: "node",
            name: "Command",
            parameters: {
                script: ""
            },
            inputs: [{name: "input"}, {name: "trigger"}],
            outputs: []
        },
    },
    listener: {
        none: {
            type: "node",
            name: "None",
            parameters: {
            },
        },
        ready: {
            type: "node",
            name: "Listen Ready",
            parameters: {
                object$li: -1
            },
            outputs: [{name: "signal"}]
        },
        click: {
            type: "node",
            name: "Listen Click",
            parameters: {
                object$li: -1
            },
            inputs: [],
            outputs: [{name: "signal"}]
        },
        collision: {
            type: "node",
            name: "Listen Collision",
            parameters: {
                object$li: -1
            },
            outputs: [{name: "signal"}]
        },
        grab: {
            type: "node",
            name: "Listen Grab",
            parameters: {
                object$li: -1
            },
            outputs: [{name: "signal"}]
        },
        motion: {
            type: "node",
            name: "Listen Motion",
            parameters: {
                object$li: -1
            },
            outputs: [{name: "signal"}]
        },
        user_distance: {
            type: "node",
            name: "Listen User Distance",
            parameters: {
                object$li: -1
            },
            outputs: [{name: "distance"}]
        },
        avatar_attribute: {
            type: "node",
            name: "Listen Avatar Attribute",
            parameters: {
                attribute: ""
            },
            outputs: [{name: "attribute"}]
        },
        space_attribute: {
            type: "node",
            name: "Listen Space Attribute",
            parameters: {
                attribute: ""
            },
            outputs: [{name: "attribute"}]
        },
        object_attribute: {
            type: "node",
            name: "Listen Object Attribute",
            parameters: {
                path: "",
                object$li: -1,
                attribute: ""
            },
            outputs: [{name: "attribute"}]
        },
        key_click: {
            type: "node",
            name: "Listen Key Clicks",
            parameters: {
                path: "",
                object$li: -1,
                attribute: ""
            },
            outputs: [{name: "key"}]
        },
        key_hold: {
            type: "node",
            name: "Listen Key Holds",
            parameters: {
                path: "",
                object$li: -1,
                attribute: ""
            },
            outputs: [{name: "{key,step}"}]
        },
        sensor: {
            type: "node",
            name: "Listen Sensor",
            parameters: {
                path: "",
            },
            outputs: [{name: "data"}]
        }
    },
    abort: {
        none: {
            type: "node",
            name: "Abort",
            parameters: {
            },
        },
    },
    route: {
        counter: {
            type: "node",
            name: "Counter",
            parameters: {
                count: 0,
                limit: 1
            },
            inputs: [{name: "reset"}, {name: "trigger"}],
            outputs: [{name: "signal"}],
        },
    },
    time: {
        delay: {
            type: "node",
            name: "Delay",
            parameters: {
                time: 3.0,
                mode: "repeat"
            },
            inputs: [{name: "reset"}, {name: "trigger"}],
            outputs: [{name: "signal"}],
        },
    },
    switch: {
        channel_2: {
            type: "node",
            name: "Switch 2",
            parameters: {
            },
            inputs: [{name: "output index"}, {name: "trigger"}],
            outputs: [{name: "signal 0"}, {name: "signal 1"}],
        },
        channel_3: {
            type: "node",
            name: "Switch 3",
            parameters: {
            },
            inputs: [{name: "output index"}, {name: "trigger"}],
            outputs: [{name: "signal 0"}, {name: "signal 1"}, {name: "signal 2"}],
        },
        channel_4: {
            type: "node",
            name: "Switch 4",
            parameters: {
            },
            inputs: [{name: "output index"}, {name: "trigger"}],
            outputs: [{name: "signal 0"}, {name: "signal 1"}, {name: "signal 2"}, {name: "signal 3"}],
        },
        channel_5: {
            type: "node",
            name: "Switch 5",
            parameters: {
            },
            inputs: [{name: "output index"}, {name: "trigger"}],
            outputs: [{name: "signal 0"}, {name: "signal 1"}, {name: "signal 2"}, {name: "signal 3"}, {name: "signal 4"}],
        },
        channel_6: {
            type: "node",
            name: "Switch 6",
            parameters: {
            },
            inputs: [{name: "output index"}, {name: "trigger"}],
            outputs: [{name: "signal 0"}, {name: "signal 1"}, {name: "signal 2"}, {name: "signal 3"}, {name: "signal 4"}, {name: "signal 5"}],
        },
    },
    action: {
        play_animation: {
            type: "node",
            name: "Play Animation",
            parameters: {
                path: "",
                url: "",
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        stop_animation: {
            type: "node",
            name: "Stop Animation",
            parameters: {
                path: "",
                url: "",
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        pause_animation: {
            type: "node",
            name: "Pause Animation",
            parameters: {
                path: "",
                url: "",
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        play_voice: {
            type: "node",
            name: "Play Voice",
            parameters: {
                object$li: -1,
                url: "",
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        stop_voice: {
            type: "node",
            name: "Stop Voice",
            parameters: {
                object$li: -1,
                url: "",
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        pause_voice: {
            type: "node",
            name: "Pause Voice",
            parameters: {
                object$li: -1,
                url: "",
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        delete: {
            type: "node",
            name: "Delete",
            parameters: {
                object$li: -1
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        send_message: {
            type: "node",
            name: "Send Message",
            parameters: {
                message: ""
            },
            inputs: [{name: "data"}, {name: "trigger"}],
            outputs: []
        },
        send_json: {
            type: "node",
            name: "Send JSON",
            parameters: {
                json: ""
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        open_webpage: {
            type: "node",
            name: "Open Webpage",
            parameters: {
                link: ""
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        play_all_animation: {
            type: "node",
            name: "Play All Animations",
            parameters: {
                object$li: -1,
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        html_menu: {
            type: "node",
            name: "HTML Menu",
            parameters: {
                url: "",
                title: "",
            },
            inputs: [{name: "content"}, {name: "trigger"}],
            outputs: []
        },
        play_video: {
            type: "node",
            name: "Play Video",
            parameters: {
                object$li: -1,
                url: "",
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        pause_video: {
            type: "node",
            name: "Pause Video",
            parameters: {
                object$li: -1,
                url: "",
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        stop_video: {
            type: "node",
            name: "Stop Video",
            parameters: {
                object$li: -1,
                url: "",
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        play_physics: {
            type: "node",
            name: "Play Physics Animation",
            parameters: {
                path: "",
                speed: 1.0
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        pause_physics: {
            type: "node",
            name: "Pause Physics Animation",
            parameters: {
                path: "",
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
        stop_physics: {
            type: "node",
            name: "Stop Physics Animation",
            parameters: {
                path: "",
            },
            inputs: [{name: "trigger"}],
            outputs: []
        },
    },
    data_op: {
        merge: {
            type: "node",
            name: "Merge Data",
            parameters: {
                keys: ["name_A", "name_B", "name_C", "name_D"]
            },
            inputs: [{name: "data_0"}, {name: "data_1"}, {name: "data_2"}, {name: "data_3"}, {name: "trigger"}],
            outputs: [{name: "output"}]
        },        
        extract: {
            type: "node",
            name: "Extract Data",
            parameters: {
                key: "key_name"
            },
            inputs: [{name: "data"}, {name: "trigger"}],
            outputs: [{name: "output"}]
        },        
    }
}

var processCursorMenu = {
    new_node: allProcessNodes,
    save: {
        type: "action",
        name: "Save"
    },
    paste: {
        type: "action",
        name: "Paste"
    },
    reset_position: {
        type: "action",
        name: "Reset Positions"
    }
}

var objectCursorMenu = {
    arrangeNodes: {
        type: "action",
        name: "Arrange Nodes"
    }
};