class EngineUI {
    static GetShaderList()
    {
        let shaderList = [
            {id: "1", name: "default", URL: btoa("//default")},
            {id: "2", name: "glass & light", URL: btoa("//glass&light")},
            {id: "3", name: "water", URL: btoa("//water")},
            {id: "4", name: "invisible", URL: btoa("//invisible")},
            {id: "5", name: "skin", URL: btoa("//skin")},
            {id: "6", name: "skin glass", URL: btoa("//forward_skin")},
            {id: "7", name: "hair", URL: btoa("//hair")},
            {id: "8", name: "foliage", URL: btoa("//foliage")},
            {id: "9", name: "flesh", URL: btoa("//flesh")},
            {id: "10", name: "flesh glass", URL: btoa("//forward_flesh")},
        ]
        
        if(typeof(engine) !== "undefined")
        {
            var customList = engine.SingleCommand("shaders.list");
            if(customList.length > 0) shaderList = shaderList.concat(customList);
        }

        return shaderList;
    }

    static ParentPath(_path)
    {
        let t_arr = _path.split(".");
        let t_parent = "";
        for(let i = 0; i < t_arr.length - 2; i++) t_parent += t_arr[i] + ".";
        
        /// if light, animator, etc., ignore the last parent
        let t_parentID; 
        let t_last = t_arr[t_arr.length - 2];
        if(t_last === 'animators' || t_last === "lights" || t_last === "voices" || t_last === "bindings" || t_last === "sensors" || t_last === "processes" || t_last === "physics_animations")
        {
            t_parent = t_parent.slice(0, -1);
            t_parentID = t_arr[t_arr.length - 3];
        }
        else
        {
            t_parent += t_last;
            t_parentID = t_last;
        }

        return {
            parent_path: t_parent,
            parent_id: t_parentID,
            id: t_arr[t_arr.length - 1]
        };
    }

    static CreateSampler(_parameters)
    {
        let t_onsample = _parameters.onsample;

        let t_sampler = Builder.CreateBasicButton({
            image: "/web/images/crosshair_icon.png",
            filter: "brightness(0)",
            size: _parameters.size,
            margin: _parameters.margin,
            onclick: function() {
                engine.SampleScene().then(sample_data => {
                    if(sample_data && t_onsample) t_onsample(sample_data);
                });
            }
        });

        return t_sampler;
    }

    static CreatePositionField(_parameters)
    {
        let t_path = _parameters.path;
        let t_parentPath = _parameters.parent_path;
        if(!t_parentPath) t_parentPath = t_path ? EngineUI.ParentPath(t_path).parent_path : null;

        let t_position = Builder.CreateVec3Input({
            value: _parameters.position || {x: 0.0, y: 0.0, z: 0.0},
            slot_padding: "0.25em",
            type: "position",
            allow_edit: _parameters.allow_edit || false,
            wheel_input: 0.05,
            drag_input: 0.0001,
            onchange: function(_position) {
                if(_parameters.onchange) _parameters.onchange(_position);
            }
        });
        
        function SamplePosition(_sample) {
            if(!_sample.position) return;

            /// get position relative to parent or world
            let t_samplePosition;
            if(t_parentPath === "world") t_samplePosition = _sample.position;
            else t_samplePosition = engine.SingleCommand(t_parentPath + ".relative_position", _sample.position);
            if(!t_samplePosition) return;

            t_position.SetValue(t_samplePosition, true);
        }

        let t_sampler = null;
        if(t_path || t_parentPath) t_sampler = EngineUI.CreateSampler({
            size: "1.5em",
            margin: {left: "0.15em", right: "0.1em"},
            onsample: function(_sample) {
                SamplePosition(_sample);
            }
        })

        let t_field = Builder.CreateHorizontalList({width: _parameters.width}, [t_position, t_sampler]);

        t_field.SetValue = function(_val) {
            t_position.SetValue(_val);
        }

        t_field.EnableEdit = function() {
            t_position.EnableEdit();
            if(t_sampler) t_sampler.classList.remove("nodisplay");
        }

        t_field.DisableEdit = function() {
            t_position.DisableEdit();
            if(t_sampler) t_sampler.classList.add("nodisplay");
        }

        return t_field;
    }

    static CreateRotationField(_parameters)
    {
        let t_path = _parameters.path;
        let t_parentPath = _parameters.parent_path;
        if(!t_parentPath) t_parentPath = t_path ? EngineUI.ParentPath(t_path).parent_path : null;

        let t_rotation;
        if(_parameters.type === "polar")
        {
            t_rotation = Builder.CreateVec2Input({
                value: _parameters.rotation ? ToolBox.RadToDeg(_parameters.rotation) : {x: 0.0, y: 0.0},
                slot_padding: "0.25em",
                type: "rotation",
                wheel_input: 1.0,
                drag_input: 0.01,
                allow_edit: _parameters.allow_edit || false,
                onchange: function(_rotation) {
                    if(_parameters.onchange) _parameters.onchange([ToolBox.DegToRad(_rotation.x), ToolBox.DegToRad(_rotation.y)]);
                }
            });    
        }
        else
        {
            t_rotation = Builder.CreateVec3Input({
                value: _parameters.rotation ? ToolBox.RadToDeg(_parameters.rotation) : {x: 0.0, y: 0.0, z: 0.0},
                slot_padding: "0.25em",
                type: "rotation",
                wheel_input: 1.0,
                drag_input: 0.01,
                allow_edit: _parameters.allow_edit || false,
                onchange: function(_rotation) {
                    if(_parameters.onchange) _parameters.onchange([ToolBox.DegToRad(_rotation.x), ToolBox.DegToRad(_rotation.y), ToolBox.DegToRad(_rotation.z)]);
                }
            });    
        }
        
        function SampleRotation(_sample) {
            if(!_sample.normal) return;
            // console.log(t_parentPath)

            /// get position relative to parent or world
            let t_sampleNormal;
            if(t_parentPath === "world") t_sampleNormal = _sample.normal;
            else t_sampleNormal = engine.SingleCommand(t_parentPath + ".relative_direction", _sample.normal);
            if(!t_sampleNormal) return;

            if(_parameters.type === "polar")
            {
                let t_angles = ToolBox.RadToDeg(ToolBox.DirectionToPolar(t_sampleNormal));
                t_rotation.SetValue(t_angles, true);
            }
            else
            {
                let t_angles = ToolBox.RadToDeg(ToolBox.NormalToEuler(t_sampleNormal));
                t_rotation.SetValue(t_angles, true);
            }
        }

        let t_sampler = null;
        if(t_path || t_parentPath) t_sampler = EngineUI.CreateSampler({
            size: "1.5em",
            margin: {left: "0.15em", right: "0.1em"},
            onsample: function(_sample) {
                SampleRotation(_sample);
            }
        })

        let t_field = Builder.CreateHorizontalList({width: _parameters.width}, [t_rotation, t_sampler]);

        t_field.SetValue = function(_val) {
            t_rotation.SetValue(ToolBox.RadToDeg(_val));   
        }

        t_field.EnableEdit = function() {
            t_rotation.EnableEdit();
            if(t_sampler) t_sampler.classList.remove("nodisplay");
        }

        t_field.DisableEdit = function() {
            t_rotation.DisableEdit();
            if(t_sampler) t_sampler.classList.add("nodisplay");
        }

        return t_field;
    }

    static CreateObjectField(_parameters)
    {
        let t_name = Builder.CreateTextBox({
            text: _parameters.name || _parameters.object || "none",
            max_width: "6em",
            overflow: "hidden",
            nowrap: true
        });

        /// try to get the name of the object corresponding to the path
        if(!_parameters.name && _parameters.object)
        {
            if(!_parameters.object.includes("world")) _parameters.object = "world." + _parameters.object;
            let t_obj = engine.SingleCommand(_parameters.object + ".json");
            if(t_obj?.name) t_name.SetText(t_obj.name);
        }

        /// button to allow manual writing of the object path
        let t_edit = null;
        if(typeof(engine) !== "undefined") t_edit = Builder.CreatePressButton({
            image: "/web/images/edit_icon.png",
            onclick: function() {
                UserMenu.QuickPrompt({placeholder: "write object path here", value: _parameters.object}).then(_val => {
                    if(!_val) return;

                    if(!_val.includes('world')) _val = 'world.' + _val;
                    _parameters.object = _val;
                    let t_obj = engine.SingleCommand(_val + ".json");
                    t_name.SetText(t_obj?.name || _val);

                    if(_parameters.onchange) _parameters.onchange(_val, t_obj?.name);
                });
            }
        })
        
        /// screen sampler to recover the path from clicking on an object
        let t_sampler = null;
        if(typeof(engine) !== "undefined") t_sampler = EngineUI.CreateSampler({
            size: "1.5em",
            margin: {left: "0.15em", right: "0.1em"},
            onsample: function(_sample) {
                if(!_sample.object_path) return;

                _parameters.object = _sample.object_path;
                t_name.SetText(_sample.objectName || _sample.object_path);

                if(_parameters.onchange) _parameters.onchange(_sample.object_path, _sample.objectName);
            }
        })

        let t_field = Builder.CreateHorizontalList({
                width: _parameters.width,
                horizontal_align: "right",
            },
            [t_name, t_edit, t_sampler]
        );

        t_field.EnableEdit = function() {
            if(t_edit) t_edit.EnableEdit();
            if(t_sampler) t_sampler.classList.remove("nodisplay");
        }

        t_field.DisableEdit = function() {
            if(t_edit) t_edit.DisableEdit();
            if(t_sampler) t_sampler.classList.add("nodisplay");
        }

        return t_field;
    }

    static CreatePartMenu(_parameters)
    {
        let t_object = _parameters.object;
        let t_objectPath = _parameters.object_path;
        // console.log(t_object);

        let t_menu;
        if('collapse' in _parameters && _parameters.collapse == true)
        {
            t_menu = Builder.CreateCollapseMenu({ style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: false });
        }
        else
        {
            t_menu = Builder.CreateBox({width: "100%", style: _parameters.style});
            t_menu.AppendTop = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
            t_menu.AppendBottom = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
        }


        t_menu.AppendTop(Builder.CreateTextBox({text: "Object", align: "center", size: "1.2em", weight: 600}));


        let t_table = t_menu.AppendBottom(Builder.CreatePairTable({
            // title: "Parameters",
            title_size: "1.2em",
            width: "100%",
            left_width: "30%", right_width: "70%",
            left_align: "left", right_align: "right",
            style: "shadow rounded",
            margin: "0.5em"
        }));
        t_table.AppendRow(
            Builder.CreateTextBox({ text: "ID", margins: "0.25em", weight: 500 }),
            Builder.CreateTextBox({
                text: ToolBox.ShrinkString(t_object.id || 'not assigned yet', 16), margins: "0.25em",
                onclick: function(_ev) {
                    Builder.ToClipboard(t_object.id, _ev);
                }
            })
        );
        let t_nameField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "Name", margins: "0.25em", weight: 500 }),
            Builder.CreateTextInput({
                value: t_object.name,
                placeholder: "write name here",
                text_align: 'center',
                no_button: true,
                width: "100%",
                allow_edit: _parameters.allow_edit || false,
                onchange: function(_val) {
                    t_object.name = _val;
                    if(t_objectPath) engine.SingleCommand(t_objectPath + ".name", btoa(_val));
                }
            })
        );

        let t_positionField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "Position", margins: "0.25em", weight: 500 }),
            EngineUI.CreatePositionField({
                position: t_object.position,
                path: t_objectPath,
                width: "100%",
                allow_edit: _parameters.allow_edit || false,
                onchange: function(_position) {
                    t_object.position = [_position.x, _position.y, _position.z];
                    if(t_objectPath) engine.SingleCommand(t_objectPath + ".position", t_object.position);        
                }
            })
        );

        let t_rotationField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "Rotation", margins: "0.25em", weight: 500 }),
            EngineUI.CreateRotationField({
                rotation: t_object.rotation,
                path: t_objectPath,
                width: "100%",
                allow_edit: _parameters.allow_edit || false,
                onchange: function(_rotation) {
                    t_object.rotation = _rotation;
                    if(t_objectPath) engine.SingleCommand(t_objectPath + ".rotation",  t_object.rotation);    
                }
            })
        );

        let t_scaleField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "Scale", margins: "0.25em", weight: 500 }),
            Builder.CreateVec3Input({
                    value: t_object.scale || {x: 1.0, y: 1.0, z: 1.0},
                    slot_padding: "0.25em",
                    type: "scale",
                    wheel_input: 0.05,
                    drag_input: 0.001,
                    allow_edit: _parameters.allow_edit || false,
                    onchange: function(_scale) {
                        t_object.scale = [_scale.x, _scale.y, _scale.z];
                        if(t_objectPath) engine.SingleCommand(t_objectPath + ".scale", t_object.scale);
                    }
                }
            )
        );

        t_table.AppendRow(
            Builder.CreateTextBox({ text: "Mass", margins: "0.25em", weight: 500 }),
            Builder.CreateTextBox({text: t_object.mass || 1.0, margins: "0.25em"})
        );

        let t_monolithField = null;
        if(t_object.childs && t_object.childs.length > 0)
        {
            t_monolithField = t_table.AppendRow(
                Builder.CreateTextBox({ text: "Monolith", margins: "0.25em", weight: 500 }),
                Builder.CreateToggleButton({
                    value: 'monolith' in t_object ? t_object.monolith : true,
                    align: "center",
                    allow_edit: _parameters.allow_edit || false,
                    onchange: function(_val) {
                        t_object.monolith = _val;
                        if(t_objectPath) engine.SingleCommand(t_objectPath + ".monolith", t_object.monolith);
                    }
                })
            );
        }

        if(t_object.animationPlayers && t_object.animationPlayers.length > 0)
        {
            t_menu.AppendBottom(EngineUI.CreateAnimationPlayerMenu({
                player: t_object.animationPlayers[0],
                object_path: t_objectPath,
                // collapse: true,
                no_delete: true
            }));    
        }
        else if(t_object.animators && t_object.animators.length > 0)
        {
            t_menu.AppendBottom(EngineUI.CreateAnimationPlayerMenu({
                player: t_object.animators[0],
                object_path: t_objectPath,
                // collapse: true,
                no_delete: true
            }));    
        }

        let t_description = "";
        if(t_object.description && t_object.description.length > 0) try { t_description = atob(t_object.description); } catch(e) {console.log(e)};
        let t_title = Builder.CreateTextBox({ text: "Description", margins: "0.25em", size: "1.2em", weight: 500, align: 'center' });
        let t_descriptionField = Builder.CreateTextEditor({
            text: t_description || "",
            size: "1.0em",
            weight: 400,
            width: "100%",
            margin: "0.25em",
            max_height: "18em",
            disable: !(_parameters.allow_edit || false),
            validate_function: !(_parameters.allow_edit && _parameters.allow_edit == true) ? null : function(_text) {
                t_object.description = btoa(_text);
                if(typeof(engine) !== "undefined") engine.SingleCommand(t_objectPath + ".description", t_object.description);
            }
        });

        t_menu.AppendBottom(Builder.CreateCollapseMenu({ style: "shadow", width: "100%", margin: "0.5em", expand: false, show_button: true, button_size: "1em" }, [t_title], [t_descriptionField]))

        let t_attributeEditor = t_menu.appendChild(Builder.CreateJSONEditor({
            name: "Attributes", json: t_object.attributes || {}, special_types: true, allow_edit: _parameters.allow_edit ? "all" : null, expand: "not_first", width: "100%", margins: "0.5em",
            onvalidation: function(_json) {
                t_object.attributes = _json;
                if(t_objectPath)
                {
                    engine.SingleCommand(t_objectPath + ".attributes.clear");
                    engine.SingleCommand(t_objectPath + ".attributes", _json);
                }
            }
        }));

        t_menu.EnableEdit = function() {
            t_nameField.EnableEdit();
            t_positionField.EnableEdit();
            t_rotationField.EnableEdit();
            t_scaleField.EnableEdit();
            if(t_monolithField) t_monolithField.EnableEdit();
            t_descriptionField.EnableEdit();
        }

        t_menu.DisableEdit = function() {
            t_nameField.DisableEdit();
            t_positionField.DisableEdit();
            t_rotationField.DisableEdit();
            t_scaleField.DisableEdit();
            if(t_monolithField) t_monolithField.DisableEdit();
            t_descriptionField.DisableEdit();
            t_attributeEditor.DisableEdit();
        }

        return t_menu;
    }

    static CreateMeshMenu(_parameters)
    {   
        let _mesh = _parameters.mesh;
        let t_meshPath = _parameters.object_path ? (_parameters.object_path + ".mesh") : null;

        let t_menu;
        if('collapse' in _parameters && _parameters.collapse == true)
        {
            t_menu = Builder.CreateCollapseMenu({ style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: false }, [], []);
        }
        else
        {
            t_menu = Builder.CreateBox({width: "100%", style: _parameters.style});
            t_menu.AppendTop = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
            t_menu.AppendBottom = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
        }

        t_menu.AppendTop(Builder.CreateTextBox({text: "Mesh", align: "center", size: "1.2em", weight: 600}));

        let meshURL = atob(_mesh.URL);
        let firstThree = meshURL.substring(0, 3);
        let t_meshEditor = null;
        if(firstThree === "///")
        {
            t_menu.AppendBottom(Builder.CreateTextBox({text: _mesh.resource}));
            t_menu.AppendBottom(Builder.CreateTextBox({text: meshURL}));
        }
        else if(firstThree === "//{")
        {
            try {
                var t_meshParam = JSON.parse(meshURL.slice(2));
                t_meshEditor = t_menu.AppendBottom(Builder.CreateJSONEditor({
                    name: "Mesh Parameters", json: t_meshParam, special_types: true, allow_edit: _parameters.allow_edit || false,
                    onvalidation: function(_json) {
                        /// send the new url to the engine
                        let t_newURL = "//" + JSON.stringify(_json);
                        _mesh.URL = btoa(t_newURL);
                        if(typeof(engine) !== "undefined") engine.SingleCommand(t_meshPath + ".url", _mesh.URL);
                    },
                    onchange: function(_json) {
                        /// send the new url to the engine
                        let t_newURL = "//" + JSON.stringify(_json);
                        _mesh.URL = btoa(t_newURL);
                        if(typeof(engine) !== "undefined") engine.SingleCommand(t_meshPath + ".url", _mesh.URL);
                    }
                }));
            }
            catch(err) {console.log(err)}
        }
        else
        {
            t_menu.AppendBottom(Builder.CreateTextBox({text: meshURL}));
        }

        let t_color = t_menu.AppendBottom(Builder.CreateRGBInput({
            label: 'mesh color', value: _mesh.color, label_weight: 500, width: "100%", margin: "0.25em", disable: !(_parameters.allow_edit || false),
            onchange: function(_rgb) {
                _mesh.color = _rgb;
                if(t_meshPath) EngineUI.ChangeColor(t_meshPath, _rgb);
            }
        }));
    
        let t_childs = [];
        for(var i = 0; i < _mesh.materials.length; i++)
        {
            t_childs[i] = t_menu.AppendBottom(EngineUI.CreateMaterialMenu({ material: _mesh.materials[i], material_index: i, object_path: _parameters.object_path, collapse: true, allow_edit: _parameters.allow_edit || false }));
        }
    
        t_childs.push(t_menu.AppendBottom(EngineUI.CreatePhysicsMenu({ mesh: _mesh, object_path: _parameters.object_path, expand: false, allow_edit: _parameters.allow_edit || false })));
    
        t_menu.EnableEdit = function() {
            if(t_meshEditor) t_meshEditor.EnableEdit();
            t_color.EnableEdit();
            for(let i = 0; i < t_childs.length; i++) t_childs[i].EnableEdit();
        }

        t_menu.DisableEdit = function() {
            if(t_meshEditor) t_meshEditor.DisableEdit();
            t_color.DisableEdit();
            for(let i = 0; i < t_childs.length; i++) t_childs[i].DisableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();

        return t_menu;
    }

    static CreatePlayPanel(_parameters)
    {
        let t_menu = Builder.CreateBox({
            width: _parameters.width || "100%",
            margin: "0.5em"
        });

        /// title
        if(_parameters.title)
        {
            t_menu.appendChild(Builder.CreateTextBox({
                text: _parameters.title,
                size: "1.2em",
                weight: 500,
                width: "100%",
                margin: {botttom: "0.5em"},
                text_align: "center"
            }))
        }

        let t_player = _parameters.player;
        // console.log(t_player)

        /// Cursor
        let t_range = t_menu.appendChild(Builder.CreateRangeInput({
            width: "100%",
            value: t_player.cursor || t_player.currentTime || 0.0,
            min: t_player.time_min || 0.0,
            max: t_player.time_max || t_player.duration || 1.0,
            step: 0.01,
            wheel_input: 0.01,
            hide_digits: false,
            digit_width: "2.5em",
            trail_color: ToolBox.HexToRGBA("#000000ff"),
            cursor_color: "black",
            onchange_func: function(_val, _range) {
                t_player.cursor = _val;
                if(t_path) EngineUI.SetPlayerCursor(t_path, _val);
            }
        }));

        /// Buttons
        let t_path = _parameters.path;

        let t_play = Builder.CreatePushButton({
            value: t_player.state > 0,
            image: "/web/images/play_icon.png",
            size: "1.2em",
            onclick: function(_pressed) {
                t_player.state = _pressed == true ? 1 : 0;
                if(_pressed == true) Play();
                else Pause();
            }
        });
        let t_loop = Builder.CreatePushButton({
            value: t_player.mode === "repeat",
            image: "/web/images/loop_icon.png",
            size: "1.2em",
            onclick: function(_pressed) {
                t_player.mode = _pressed == true ? "repeat" : "once";
                if(t_path) EngineUI.SetPlayerLoop(t_path, _pressed);
            }
        });

        let t_reverseMute;
        if(_parameters.type && _parameters.type === "video")
        {
            t_reverseMute = Builder.CreatePushButton({
                value: t_player.backward,
                image: "/web/images/muted_icon.png",
                size: "1.2em",
                onclick: function(_pressed) {
                    t_player.muted = _pressed;
                    if(t_path) EngineUI.MutePlayer(t_path, _pressed);
                }
            });
        }
        else
        {
            t_reverseMute = Builder.CreatePushButton({
                value: t_player.backward,
                image: "/web/images/reverse_play_icon.png",
                size: "1.2em",
                onclick: function(_pressed) {
                    t_player.backward = _pressed;
                    if(t_path) EngineUI.SetPlayerBackward(t_path, _pressed);
                }
            });
        }
        
        let t_backforth = null;
        if(!_parameters || _parameters.type !== "video") t_backforth = Builder.CreatePushButton({
            value: t_player.mode === "backthenforth",
            image: "/web/images/backforth_icon.png",
            size: "1.2em",
            onclick: function(_pressed) {
                t_player.mode = _pressed == true ? "backthenforth" : 'once';
                if(!t_path) return;
                if(_pressed == true) EngineUI.SetPlayerMode(t_path, "backthenforth");
                else EngineUI.SetPlayerMode(t_path, 0);
            }
        });

        t_menu.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.5em"}
            }, [t_play, t_loop, t_reverseMute, t_backforth]
        ));

        /// move the cursor if the player is running
        function Update()
        {
            /// automatically stop once the menu has been removed
            if(!document.body.contains(t_menu)) return;

            t_player = engine.SingleCommand(t_path + ".json");

            let t_cursor = typeof t_player.cursor !== "undefined" ? t_player.cursor : t_player.currentTime;
            t_range.SetValue(t_cursor, false);

            if(t_player.state == 0)
            {
                t_play.SetValue(false, true);
                return;
            }
        
            setTimeout(function() {
                Update();
            }, 100);
        }

        function Play()
        {
            t_player = engine.SingleCommand(t_path + ".json");

            var curVal = t_player.cursor || t_player.currentTime;
            if(t_player.backward == true)
            {
                if(curVal <= (t_player.time_min || 0.0)) EngineUI.ResetPlayer(t_path);
                EngineUI.ResumePlayer(t_path);
            }
            else
            {
                if(curVal >= (t_player.time_max || t_player.duration)) EngineUI.ResetPlayer(t_path);
                EngineUI.ResumePlayer(t_path);
            }
            
            Update();
        }

        function Pause()
        {
            EngineUI.PausePlayer(t_path);
        }

        if(t_player.state > 0)
        {
            t_play.SetValue(true, true);
            setTimeout(Update, 100);
        }

        t_menu.EnableEdit = function() {
            t_range.EnableEdit();
            t_play.EnableEdit();
            t_reverseMute.EnableEdit();
            t_loop.EnableEdit();
            if(t_backforth) t_backforth.EnableEdit();
        }
        
        t_menu.DisableEdit = function() {
            t_range.DisableEdit();
            t_play.DisableEdit();
            t_reverseMute.DisableEdit();
            t_loop.DisableEdit();
            if(t_backforth) t_backforth.DisableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();

        return t_menu;
    }

    static CreateAdvancedPlayPanel(_parameters)
    {
        let t_menu = Builder.CreateBox({
            width: _parameters.width || "100%",
            margin: "0.5em",
            padding: "0.25em",
            style: _parameters.style
        });

        /// title
        if(_parameters.title)
        {
            t_menu.appendChild(Builder.CreateTextBox({
                text: _parameters.title,
                size: "1.2em",
                weight: 500,
                width: "100%",
                margin: {botttom: "0.5em"},
                text_align: "center"
            }))
        }

        let t_player = _parameters.player;
        if(t_player.loop_max && t_player.loop_max < 0) t_player.loop = true;

        /// Cursor
        let t_range = t_menu.appendChild(Builder.CreateRangeInput({
            width: "100%",
            value: t_player.cursor || 0.0,
            min: t_player.time_min || 0.0,
            max: t_player.duration || t_player.time_max || 1.0,
            step: 0.01,
            wheel_input: 0.01,
            hide_digits: false,
            digit_width: "2.5em",
            trail_color: ToolBox.HexToRGBA("#000000ff"),
            cursor_color: "black",
            onchange_func: function(_val, _range) {
                t_player.cursor = _val;
                if(t_path) EngineUI.SetPlayerCursor(t_path, _val);
            }
        }));

        /// Buttons
        let t_path = _parameters.path;

        let t_mainControls = t_menu.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.5em"}
            }, [
                Builder.CreatePushButton({
                    pressed: t_player.state === "play",
                    image: "/web/images/play_icon.png",
                    size: "1.2em",
                    tip: "play",
                    onclick: function(_pressed) {
                        t_player.state = _pressed == true ? "play" : "pause";
                        if(_pressed == true) Play();
                        else Pause();
                    }
                }),
                Builder.CreatePushButton({
                    pressed: t_player.speed < 0,
                    image: "/web/images/reverse_play_icon.png",
                    size: "1.2em",
                    tip: "backward",
                    onclick: function(_pressed) {
                        t_player.reverse_play = _pressed;
                        if(t_path) EngineUI.SetPlayerReversed(t_path, _pressed);
                    }
                }),
                Builder.CreatePressButton({
                    pressed: t_player.state === "stop",
                    image: "/web/images/stop_icon.png",
                    size: "1.2em",
                    tip: "stop",
                    onclick: function(_pressed) {
                        Stop();
                    }
                }),
                Builder.CreatePushButton({
                    pressed: t_player.loop,
                    image: "/web/images/loop_icon.png",
                    size: "1.2em",
                    tip: "loop",
                    onclick: function(_pressed) {
                        t_player.loop = _pressed;
                        if(t_path) EngineUI.SetAnimationLoop(t_path, _pressed);
                    }
                })
            ]
        ));

        let t_advancedControls = t_menu.appendChild(Builder.CreateTabSelector({
            tabs: [
                {image: "/web/images/forward_icon.png", value: "once", tip: "once"},
                {image: "/web/images/repeat_icon.png", value: "repeat", tip: "repeat"},
                {image: "/web/images/backforth_icon.png", value: "backandforth", tip: "both directions"},
                {image: "/web/images/backthenforth_icon.png", value: "backthenforth", tip: "alternate directions"},
            ],
            value: t_player.mode,
            width: "100%", height: "2.25em", button_width: "3em", size: "1.2em", weight: 500, margin: "0.25em", align: "center",
            onselect: function(tab_index, _value) {
                t_player.mode = _value;
                if(t_path) EngineUI.SetPlayerMode(t_path, _value);
            }
        }));

        let t_speed = t_menu.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Speed", margins: "0.25em", weight: 500 }),
                Builder.CreateRangeInput({
                    width: "100%", value: t_player.speed, min: 0.01, max: 10.0, step: 0.01,
                    wheel_input: 0.1,
                    drag_input: 0.01,
                    hide_digits: false, digit_width: "2.5em", margin: "0.25em", trail_color: "#4bb25e",
                    onchange_func: function(_val, _range) {
                        t_player.speed = _val;
                        if(t_path) EngineUI.SetAnimationSpeed(t_path, _val);
                    }
                })
            ]
        ));


        t_menu.SetTimeMax = function(_duration) {
            t_range.SetMax(_duration);
        }

        /// move the cursor if the player is running
        t_menu.Update = function(repeat = true) {
            /// automatically stop once the menu has been removed
            if(!document.body.contains(t_menu)) return;

            t_player = engine.SingleCommand(t_path + ".json");
            t_range.SetValue(t_player.cursor, false);
            if(t_player.time_max) t_range.SetMax(t_player.time_max);

            if(t_player.state !== "play")
            {
                t_mainControls.children[0].SetValue(false);
                return;
            }
        
            if(repeat == true)
            {
                setTimeout(function() {
                    t_menu.Update();
                }, 50);
            }
        }

        function Play()
        {
            EngineUI.PlayAnimation(t_path);            
            t_menu.Update();
        }

        function Pause()
        {
            EngineUI.PausePlayer(t_path);
        }

        function Stop()
        {
            EngineUI.StopAnimation(t_path);
        }

        if(t_player.state === "play") setTimeout(function() {t_menu.Update()}, 100);

        t_menu.EnableEdit = function() {
            t_mainControls.EnableEdit();
            t_advancedControls.EnableEdit();
            t_speed.EnableEdit();
        }
        
        t_menu.DisableEdit = function() {
            t_mainControls.DisableEdit();
            t_advancedControls.DisableEdit();
            t_speed.DisableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();

        return t_menu;
    }

    static CreateAnimationPlayerMenu(_parameters)
    {
        let t_player = _parameters.player;
        let t_path = _parameters.object_path ? _parameters.object_path + ".animators." + t_player.id : null;
        // console.log(t_player)

        let t_menu;
        if('collapse' in _parameters)
        {
            t_menu = Builder.CreateCollapseMenu({ style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: !_parameters.collapse, show_button: true, button_size: "1em" }, [], []);
        }
        else
        {
            t_menu = Builder.CreateBox({width: "100%", style: _parameters.style});
            t_menu.AppendTop = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
            t_menu.AppendBottom = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
        }

        t_menu.AppendTop(Builder.CreateTextBox({text: "Animation Player", align: "center", size: "1.2em", weight: 500}));

        t_menu.AppendBottom(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            }, [
                Builder.CreateTextBox({text: "ID", weight: 500}),
                Builder.CreateTextBox({
                    text: ToolBox.ShrinkString(t_player.id || 'not assigned yet', 16), margins: "0.25em",
                    onclick: function(_ev) {
                        Builder.ToClipboard(t_player.id, _ev);
                    }
                })
            ]
        ));

        let t_nameInput = Builder.CreateTextInput({
            value: t_player.name || "",
            placeholder: "write name here",
            text_align: 'center',
            no_button: true,
            width: "100%",
            allow_edit: _parameters.allow_edit || false,
            onchange: function(_val) {
                t_player.name = _val;
                if(t_path) engine.SingleCommand(t_path + ".name", _val);
            }
        });
        t_menu.AppendBottom(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            },[
                Builder.CreateTextBox({ text: "Name", weight: 500, margin: {right: "1em"}}),
                t_nameInput
            ]
        ));

        let t_controls = t_menu.AppendBottom(EngineUI.CreateAdvancedPlayPanel({
            title: "Controls",
            player: t_player,
            path: t_path
        }));

        let t_speed = Builder.CreateRangeInput({
            width: "100%", value: t_player.speed, min: 0.01, max: 10.0, step: 0.01,
            wheel_input: 0.1,
            drag_input: 0.01,
            hide_digits: false, digit_width: "2.5em", margin: "0.25em", trail_color: "#4bb25e",
            onchange_func: function(_val, _range) {
                t_player.speed = _val;
                if(t_path) EngineUI.SetAnimationSpeed(t_path, _val);
            }
        })    
        t_menu.AppendBottom(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Speed", margins: "0.25em", weight: 500 }),
                t_speed
            ]
        ));

        function CreateAnimationBox(_animation)
        {
            let t_table = Builder.CreatePairTable({
                // title: "Parameters",
                title_size: "1.2em",
                width: "100%",
                left_width: "40%", right_width: "60%",
                left_align: "left", right_align: "right",
                margin: "0.25em",
                padding: "0.25em",
                style: _animation.playing == true ? "shadow rounded" : "flat_shadow rounded",
                onclick: function() {
                    LoadAnimation(_animation.url);
                }
            });
            t_table.AppendRow(
                Builder.CreateTextBox({ text: "URL", margins: "0.25em", weight: 500 }),
                Builder.CreateTextBox({ text: _animation.url, overflow: "hidden" })
            );
            t_table.AppendRow(
                Builder.CreateTextBox({ text: "Name", margins: "0.25em", weight: 500 }),
                Builder.CreateTextBox({ text: _animation.name })
            );
            t_table.AppendRow(
                Builder.CreateTextBox({ text: "Duration", margins: "0.25em", weight: 500 }),
                Builder.CreateTextBox({ text: _animation.duration })
            );

            return t_table;
        }


        /// animation slot
        let t_slot = t_menu.AppendBottom(Builder.CreateBox({
            width: "100%",
            min_height: "5em",
        }));

        let t_animationList = [];
        if(!t_player.animation_list || t_player.animation_list.length == 0)
        {
            t_slot.appendChild(Builder.CreateTextBox({
                text: "drop animation here",
                width: "100%",
                height: "5em",
                margin: "1em",
                style: "black_border"
            }));
        }
        else
        {
            for(let i = 0; i < t_player.animation_list.length; i++)
            {
                t_animationList.push(t_slot.appendChild(CreateAnimationBox({
                    url: atob(t_player.animation_list[i].url),
                    name: atob(t_player.animation_list[i].name),
                    duration: t_player.animation_list[i].duration,
                    playing: (t_player.animation && t_player.animation === t_player.animation_list[i].url)
                })));
            }
        }

        function LoadAnimation(_url)
        {
            for(let i = 0; i < t_animationList.length; i++)
            {
                let t_animation = t_animationList[i];
                if(atob(t_player.animation_list[i].url) === _url)
                {
                    t_animation.classList.remove('flat_shadow');
                    t_animation.classList.add('shadow');
                }
                else
                {
                    t_animation.classList.remove('shadow');
                    t_animation.classList.add('flat_shadow');
                }
            }

            /// once the animation is loaded, update the UI
            EngineUI.LoadAnimation(t_path, _url).then(_player => {
                t_controls.Update(false);
            });
        }

        let t_disabled = true;
        Builder.SetupDrop(t_slot, function(_text, _files, event) {
            if(t_disabled == true) return;

            /// the default behavior of the slot: if file, upload and get the id, otherwise, get the url
            if(_files && _files.length === 1) 
            {
                // if(typeof(engine) === 'undefined')
                // {
                //     console.log("ERROR: engine not loaded");
                //     return;
                // }
                
                // UserMenu.UploadTexture(_files[0], "/textures").then(data => {
                //     engine.RemoveTempInput();
                //     if(data.failed) return;
                //     t_slot.SetTexture("///" + data.id);
                // })
            }        
            else if(_text)
            {
                try {
                    let properties = JSON.parse(_text);
                    if('type' in properties && properties.type === "animation")
                    {
                        if(typeof engine !== "undefined") engine.SingleCommandSync(t_path + ".animation", btoa("///" + (properties.id || properties._id))).then(_player => {
                            t_slot.innerHTML = "";
                            t_slot.appendChild(CreateAnimationBox({
                                url: _player.animation,
                                name: _player.animationName,
                                duration: _player.time_max - _player.time_min
                            }));
                        });
                    }
                }
                catch(e) {console.log(e)}
            }
        });

        let t_delete = null;
        if(!_parameters.no_delete) t_delete = t_menu.AppendBottom(Builder.CreatePressButton({
            image: "/web/images/delete_icon.png",
            size: '1.2em',
            position: {top: 0, left: "0.25em"},
            onclick: function() {
                if(t_path) engine.SingleCommand(t_path + ".delete");
                if(_parameters.interface_element) _parameters.interface = _parameters.interface_element.node_interface;
                if(_parameters.interface) _parameters.interface.DeleteNode(_parameters.node, _parameters.id);
                t_menu.remove();        
            }
        }));

        t_menu.EnableEdit = function() {
            t_disabled = false;
            t_controls.EnableEdit();
            t_nameInput.EnableEdit();
            t_speed.EnableEdit();
            if(t_delete) t_delete.EnableEdit();
        }
        
        t_menu.DisableEdit = function() {
            t_disabled = true;
            t_controls.DisableEdit();
            t_nameInput.DisableEdit();
            t_speed.DisableEdit();
            if(t_delete) t_delete.DisableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();

        return t_menu;
    }

    static CreateLightMenu(_parameters)
    {
        let t_light = _parameters.light;
        let t_path = _parameters.object_path ? _parameters.object_path + ".lights." + t_light.id : null;
        // console.log(t_light);

        let t_menu;
        if('collapse' in _parameters && _parameters.collapse == true)
        {
            t_menu = Builder.CreateCollapseMenu({ style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: false }, [], []);
        }
        else
        {
            t_menu = Builder.CreateBox({width: "100%", style: _parameters.style});
            t_menu.AppendTop = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
            t_menu.AppendBottom = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
        }

        t_menu.AppendTop(Builder.CreateTextBox({text: "Light", align: "center", size: "1.2em", weight: 600}));

        let t_box = t_menu.AppendBottom(Builder.CreateBox({
            width: "100%",
            margin: "0.25em",
            style: "shadow rounded"
        }))

        let t_switch = t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Switch", margins: "0.25em", weight: 500 }),
                Builder.CreateToggleButton({
                    value: t_light.on || false,
                    align: "center",
                    allow_edit: true,
                    onchange: function(_val) {
                        t_light.on = _val;
                        if(t_path) EngineUI.SwitchLight(t_path, _val);
                    }    
                })
            ]
        ));

        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            }, [
                Builder.CreateTextBox({text: "ID", weight: 500}),
                Builder.CreateTextBox({
                    text: ToolBox.ShrinkString(t_light.id || 'not assigned yet', 16), margins: "0.25em",
                    onclick: function(_ev) {
                        Builder.ToClipboard(t_light.id, _ev);
                    }
                })
            ]
        ));

        let t_nameInput = Builder.CreateTextInput({
            value: t_light.name || "",
            placeholder: "write name here",
            text_align: 'center',
            no_button: true,
            width: "100%",
            allow_edit: _parameters.allow_edit || false,
            onchange: function(_val) {
                t_light.name = _val;
                if(t_path) engine.SingleCommand(t_path + ".name", _val);
            }
        });
        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            },[
                Builder.CreateTextBox({ text: "Name", weight: 500, margin: {right: "1em"}}),
                t_nameInput
            ]
        ));

        let t_position = t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            }, [
                Builder.CreateTextBox({text: "Position", weight: 500}),
                EngineUI.CreatePositionField({
                    position: t_light.position,
                    path: t_path,
                    width: "100%",
                    onchange: function(_position) {
                        t_light.position = [_position.x, _position.y, _position.z];
                        if(t_path) engine.SingleCommand(t_path + ".position", t_light.position);        
                    }
                })    
            ]
        ));

        let t_rotation = t_box.appendChild(Builder.CreateHorizontalList({
            width: "100%",
            margin: {top: "0.25em", bottom: "0.25em"}
        }, [
            Builder.CreateTextBox({ text: "Rotation", margins: "0.25em", weight: 500 }),
            EngineUI.CreateRotationField({
                rotation: t_light.rotation,
                path: _parameters.object_path,
                width: "100%",
                allow_edit: _parameters.allow_edit || false,
                onchange: function(_rotation) {
                    t_light.rotation = _rotation;
                    if(t_path) engine.SingleCommand(t_path + ".rotation",  _rotation);
                }
            })
        ]));

        let t_color = t_box.appendChild(Builder.CreateRGBInput({
            label: 'Color', value: t_light.color, label_weight: 500, width: "100%", disable: false,
            margin: {top: "0.25em", bottom: "0.25em"},
            onchange: function(_rgb) {
                t_light.color = _rgb;
                if(t_path) EngineUI.SetLightColor(t_path, _rgb);
            }
        }));

        let t_radius = Builder.CreateRangeInput({
            width: "100%", value: t_light.radius, min: 0.01, max: 500.0, step: 0.01, exponent: 3.0,
            wheel_input: 0.1,
            drag_input: 0.01,
            hide_digits: false, digit_width: "2.5em", trail_color: "#ffed7f",
            onchange_func: function(_val, _range) {
                t_light.radius = _val;
                if(t_path) EngineUI.SetLightRadius(t_path, _val);
            }
        })    
        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Radius", margins: "0.25em", weight: 500 }),
                t_radius
            ]
        ));

        let t_bulb = Builder.CreateRangeInput({
            width: "100%", value: t_light.bulbRadius, min: 0.005, max: 1.0, step: 0.005, exponent: 2.0,
            wheel_input: 0.01,
            drag_input: 0.005,
            hide_digits: false, digit_width: "2.5em", trail_color: "#ff9f7f",
            onchange_func: function(_val, _range) {
                t_light.bulbRadius = _val;
                if(t_path) EngineUI.SetLightBulbRadius(t_path, _val);
            }
        })    
        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Bulb Radius", margins: "0.25em", weight: 500 }),
                t_bulb
            ]
        ));

        let t_duration = t_box.appendChild(Builder.CreateHorizontalList({
            width: "100%",
            margin: {top: "0.25em", bottom: "0.25em"}
        }, [
            Builder.CreateTextBox({ text: "Duration", margins: "0.25em", weight: 500 }),
            Builder.CreateRangeInput({
                width: "100%", value: t_light.duration, min: 0.0, max: 1000.0, step: 0.05, exponent: 3.0,
                wheel_input: 0.5,
                drag_input: 0.05,
                hide_digits: false, digit_width: "2.5em", trail_color: "#ff9f7f",
                onchange_func: function(_val, _range) {
                    t_light.duration = _val;
                    if(t_path) engine.SingleCommand(t_path + ".duration", _val);
                }
            })    
        ]));

        let t_shadow = Builder.CreateToggleButton({
            value: t_light.shadows,
            align: "center",
            allow_edit: true,
            onchange: function(_val) {
                t_light.shadows = _val;
                if(t_path) EngineUI.SetLightShadows(t_path, _val);
            }    
        });    
        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Cast Shadows", margins: "0.25em", weight: 500 }),
                t_shadow
            ]
        ));

        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Type", margins: "0.25em", weight: 500 }),
                Builder.CreateSelector({
                    options: [
                        {text: "standard", value: "bulb"},
                        {text: "spotlight", value: "spot"}
                    ],
                    value: t_light.type,
                    align: "spread",
                    onselect: function(_value) {
                        t_light.type = _value;
                        if(t_path)
                        {
                            EngineUI.SetLightType(t_path, _value);
                            t_light = engine.SingleCommand(t_path + ".json");
                        }
                        UpdateParameters();
                    }
                })
        ]));

        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Mode", margins: "0.25em", weight: 500 }),
                Builder.CreateSelector({
                    options: [
                        {text: "standard", value: "standard"},
                        {text: "curve", value: "curve"}
                    ],
                    value: t_light.mode,
                    align: "spread",
                    onselect: function(_value) {
                        t_light.mode = _value;
                        if(t_path) engine.SingleCommand(t_path + ".mode",  _value);
                    }
                })
        ]));

        let t_parameters = [];

        {
            let t_animation = t_box.appendChild(Builder.CreateCollapseMenu({style: "shadow", width: "100%", margin: "0.5em", expand: false, show_button: true, button_size: "1.2em"}));
            t_animation.AppendTop(Builder.CreateTextBox({
                text: "Intensity Curve", align: "center", size: "1.2em", weight: 600, margin: "0.5em",
                onclick: function() {t_animation.Toggle()}
            }));


            t_parameters.push(t_animation.AppendBottom(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: {top: "0.25em", bottom: "0.25em"}
                },[
                    Builder.CreateTextBox({ text: "Loop", margins: "0.25em", weight: 500 }),
                    Builder.CreateToggleButton({
                        value: t_light.loop || false,
                        align: "center",
                        allow_edit: true,
                        onchange: function(_val) {
                            t_light.loop = _val;
                            if(t_path) engine.SingleCommand(t_path + ".loop",  _val);
                        }    
                    })
                ]
            )));

            t_parameters.push(t_animation.AppendBottom(Builder.CreateParametricCurve({
                value: t_light.intensity_curve || [0.0, 1.0, 1.0, 1.0],
                width: "100%", height: "4em", color: "#cd5c41",
                onchange: function(_values)
                {
                    t_light.intensity_curve = _values;
                    if(t_path) engine.SingleCommand(t_path + ".intensity_curve",  _values);
                }
            })));
        }




        let t_paramBox = t_box.appendChild(Builder.CreateBox({
            width: "100%",
            margin: "0.25em",
            style: "shadow rounded blueish"
        }));
        
        let t_fields = [];
        function UpdateParameters()
        {
            t_paramBox.innerHTML = ``;
            t_fields = [];

            if('cutoff' in t_light)
            {
                t_fields.push(t_paramBox.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: {top: "0.25em", bottom: "0.25em"}
                }, [
                    Builder.CreateTextBox({ text: "Cutoff", margins: "0.25em", weight: 500 }),
                    Builder.CreateRangeInput({
                        width: "100%", value: t_light.cutoff, min: 0.01, max: Math.PI / 2.0, step: 0.01,
                        wheel_input: 0.01,
                        drag_input: 0.005,
                        hide_digits: false, digit_width: "2.5em", trail_color: "#ff9f7f",
                        onchange_func: function(_val, _range) {
                            t_light.cutoff = _val;
                            if(t_path) engine.SingleCommand(t_path + ".cutoff", _val);
                        }
                    })    
                ])));
            }

            if('penumbra' in t_light)
            {
                t_fields.push(t_paramBox.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: {top: "0.25em", bottom: "0.25em"}
                }, [
                    Builder.CreateTextBox({ text: "Penumbra", margins: "0.25em", weight: 500 }),
                    Builder.CreateRangeInput({
                        width: "100%", value: t_light.penumbra, min: 0.01, max: Math.PI / 2.0, step: 0.01,
                        wheel_input: 0.01,
                        drag_input: 0.005,
                        hide_digits: false, digit_width: "2.5em", trail_color: "#ff9f7f",
                        onchange_func: function(_val, _range) {
                            t_light.penumbra = _val;
                            if(t_path) engine.SingleCommand(t_path + ".penumbra", _val);
                        }
                    })    
                ])));
            }

            if('diffuse_scale' in t_light)
            {
                t_paramBox.appendChild(Builder.CreateTextBox({ text: "Projected Image", margins: "0.25em", weight: 500 }));

                t_fields.push(t_paramBox.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: {top: "0.25em", bottom: "0.25em"}
                }, [
                    Builder.CreateTextBox({ text: "Image Scale", margins: "0.25em", weight: 500 }),
                    Builder.CreateVec2Input({
                        value: {x: t_light.diffuse_scale[0], y: t_light.diffuse_scale[1]},
                        slot_padding: "0.25em",
                        wheel_input: 0.01,
                        drag_input: 0.001,
                        onchange: function(_values) {
                            t_light.diffuse_scale = [_values.x, _values.y];
                            if(t_path) engine.SingleCommand(t_path + ".diffuse_scale", t_light.diffuse_scale);
                        }
                    })
                ]
                )));

                t_fields.push(t_paramBox.appendChild(Builder.CreateHorizontalList({
                        width: "100%",
                        margin: {top: "0.25em", bottom: "0.25em"}
                    },[
                        Builder.CreateTextBox({ text: "Tile Image", margins: "0.25em", weight: 500 }),
                        Builder.CreateToggleButton({
                            value: t_light.tiling,
                            align: "center",
                            allow_edit: true,
                            onchange: function(_val) {
                                t_light.tiling = _val;
                                if(t_path) engine.SingleCommand(t_path + ".tiling", t_light.tiling);
                            }    
                        })
                    ]
                )));

                t_fields.push(t_paramBox.appendChild(EngineUI.CreateTextureSlot({
                    label: "color",
                    url: t_light.diffuse ? atob(t_light.diffuse) : "",
                    texture_path: t_path ? t_path + ".diffuse" : null,
                    texture_type: "color",
                    allow_propagate: false,
                    onchange: function(new_url) {
                        t_light.diffuse = btoa(new_url);
                        if(t_path) engine.SingleCommand(t_path + ".diffuse", btoa(new_url));
                    }
                })));
            }
        }

        UpdateParameters();

        let t_delete = t_menu.AppendBottom(Builder.CreatePressButton({
            image: "/web/images/delete_icon.png",
            size: '1.2em',
            position: {top: 0, left: "0.25em"},
            onclick: function() {
                if(t_path) engine.SingleCommand(t_path + ".delete");
                if(_parameters.interface_element) _parameters.interface = _parameters.interface_element.node_interface;
                if(_parameters.interface) _parameters.interface.DeleteNode(_parameters.node, _parameters.id);
                t_menu.remove();        
            }
        }));


        t_menu.EnableEdit = function() {
            t_switch.EnableEdit();
            t_position.EnableEdit();
            t_color.EnableEdit();
            t_radius.EnableEdit();
            t_bulb.EnableEdit();
            t_shadow.EnableEdit();
            t_delete.EnableEdit();
            t_nameInput.EnableEdit();
            t_rotation.EnableEdit();
            t_duration.EnableEdit();
            for(let _field of t_fields) _field.EnableEdit();
            for(let _field of t_parameters) _field.EnableEdit();
        }
        t_menu.DisableEdit = function() {
            t_switch.DisableEdit();
            t_position.DisableEdit();
            t_color.DisableEdit();
            t_radius.DisableEdit();
            t_bulb.DisableEdit();
            t_shadow.DisableEdit();
            t_delete.DisableEdit();
            t_nameInput.DisableEdit();
            t_rotation.DisableEdit();
            t_duration.DisableEdit();
            for(let _field of t_fields) _field.DisableEdit();
            for(let _field of t_parameters) _field.DisableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();

        return t_menu;
    }

    static CreateParticleEmitterMenu(_parameters)
    {
        let t_emitter = _parameters.particle_emitter;
        let t_path = _parameters.object_path ? _parameters.object_path + ".particle_emitters." + t_emitter.id : null;
        console.log(t_emitter);

        let t_menu;
        if('collapse' in _parameters && _parameters.collapse == true)
        {
            t_menu = Builder.CreateCollapseMenu({ style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: false }, [], []);
        }
        else
        {
            t_menu = Builder.CreateBox({width: "100%", style: _parameters.style});
            t_menu.AppendTop = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
            t_menu.AppendBottom = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
        }

        t_menu.AppendTop(Builder.CreateTextBox({text: "Particle Emitter", align: "center", size: "1.2em", weight: 600}));

        let t_box = t_menu.AppendBottom(Builder.CreateBox({
            width: "100%",
            margin: "0.25em",
            style: "shadow rounded"
        }))

        let t_parameters = [];

        t_parameters.push(t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Switch", margins: "0.25em", weight: 500 }),
                Builder.CreateToggleButton({
                    value: t_emitter?.on == true || false,
                    align: "center",
                    allow_edit: true,
                    onchange: function(_val) {
                        t_emitter.on = _val;
                        if(t_path) EngineUI.SwitchParticleEmitter(t_path, _val);
                    }    
                })
            ]
        )));

        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            }, [
                Builder.CreateTextBox({text: "ID", weight: 500}),
                Builder.CreateTextBox({
                    text: ToolBox.ShrinkString(t_emitter.id || 'not assigned yet', 16), margins: "0.25em",
                    onclick: function(_ev) {
                        Builder.ToClipboard(t_emitter.id, _ev);
                    }
                })
            ]
        ));

        t_parameters.push(t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            },[
                Builder.CreateTextBox({ text: "Name", weight: 500, margin: {right: "1em"}}),
                Builder.CreateTextInput({
                    value: t_emitter.name || "",
                    placeholder: "write name here",
                    text_align: 'center',
                    no_button: true,
                    width: "100%",
                    allow_edit: _parameters.allow_edit || false,
                    onchange: function(_val) {
                        t_emitter.name = _val;
                        if(t_path) engine.SingleCommand(t_path + ".name", _val);
                    }
                })
            ]
        )));

        t_parameters.push(t_box.appendChild(Builder.CreateHorizontalList({
            width: "100%",
            margin: "0.25em"
        }, [
            Builder.CreateTextBox({text: "Position", weight: 500}),
            EngineUI.CreatePositionField({
                position: t_emitter.position,
                path: t_path,
                width: "100%",
                onchange: function(_position) {
                    t_emitter.position = [_position.x, _position.y, _position.z];
                    if(t_path) engine.SingleCommand(t_path + ".position", t_emitter.position);        
                }
            })
        ])));

        t_parameters.push(t_box.appendChild(Builder.CreateHorizontalList({
            width: "100%",
            margin: {top: "0.25em", bottom: "0.25em"}
        }, [
            Builder.CreateTextBox({ text: "Rotation", margins: "0.25em", weight: 500 }),
            EngineUI.CreateRotationField({
                rotation: t_emitter.rotation,
                path: _parameters.object_path,
                parent_path: _parameters.object_path,
                width: "100%",
                allow_edit: _parameters.allow_edit || false,
                onchange: function(_rotation) {
                    t_emitter.rotation = _rotation;
                    if(t_path) engine.SingleCommand(t_path + ".rotation",  _rotation);
                }
            })
        ])));


        t_box.appendChild(Builder.CreateTextBox({ text: "Emission Parameters", margins: "1em", weight: 500, size: "1.2em" }));

        t_parameters.push(t_box.appendChild(Builder.CreateHorizontalList({
            width: "100%",
            margin: "0.25em"
        }, [
            Builder.CreateTextBox({text: "Pos. Variance", weight: 500}),
            EngineUI.CreatePositionField({
                position: t_emitter.particle_delta.position,
                width: "100%",
                onchange: function(_position) {
                    t_emitter.particle_delta.position = [_position.x, _position.y, _position.z];
                    if(t_path) engine.SingleCommand(t_path + ".particle_delta.position", t_emitter.particle_delta.position);        
                }
            })
        ])));

        t_parameters.push(t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Rot. Variance", margins: "0.25em", weight: 500 }),
                Builder.CreateRangeInput({
                    width: "100%", value:t_emitter.angle_variance[0], min: 0.0, max: 10.0, step: 0.002, exponent: 3.0,
                    wheel_input: 0.002,
                    drag_input: 0.002,
                    hide_digits: false, digit_width: "2.5em", trail_color: "#19f098",
                    onchange_func: function(_val, _range) {
                        t_emitter.angle_variance = [_val, _val, _val];
                        if(t_path) engine.SingleCommand(t_path + ".angle_variance",  t_emitter.angle_variance);
                    }
                })  
            ]
        )));
           

        t_parameters.push(t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Duration", margins: "0.25em", weight: 500 }),
                Builder.CreateRangeInput({
                    width: "100%", value: t_emitter.duration, min: 0.0, max: 100.0, step: 0.01, exponent: 3.0,
                    wheel_input: 0.002,
                    drag_input: 0.002,
                    hide_digits: false, digit_width: "2.5em", trail_color: "#1482c6",
                    onchange_func: function(_val, _range) {
                        t_emitter.duration = _val;
                        if(t_path) engine.SingleCommand(t_path + ".duration",  t_emitter.duration);
                    }
                })  
            ]
        )));

        t_parameters.push(t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Loop Emission", margins: "0.25em", weight: 500 }),
                Builder.CreateToggleButton({
                    value: t_emitter?.loop == true || false,
                    align: "center",
                    allow_edit: true,
                    onchange: function(_val) {
                        t_emitter.loop = _val;
                        if(t_path) engine.SingleCommand(t_path + ".loop",  t_emitter.loop);
                    }    
                })
            ]
        )));

        /// frequency
        {
            t_box.appendChild(Builder.CreateTextBox({ text: "Particle per Seconds", margins: {top: "0.5em", left: "0.25em", right: "0.25em"}, weight: 500 }));

            t_parameters.push(t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Scale", margins: "0.25em", weight: 500 }),
                Builder.CreateRangeInput({
                    width: "100%", value: t_emitter.frequency, min: 0.0, max: 100.0, step: 0.01, exponent: 3.0,
                    wheel_input: 0.002,
                    drag_input: 0.002,
                    hide_digits: false, digit_width: "2.5em", trail_color: "#6262a7", margins: "0.25em",
                    onchange_func: function(_val, _range) {
                        t_emitter.frequency = _val;
                        if(t_path) engine.SingleCommand(t_path + ".frequency",  t_emitter.frequency);
                    }
                })
            ])));

            t_parameters.push(t_box.appendChild(Builder.CreateParametricCurve({
                value: t_emitter.frequency_curve,
                width: "100%", height: "4em", color: "#6262a7",
                onchange: function(_values)
                {
                    t_emitter.frequency_curve = _values;
                    if(t_path) engine.SingleCommand(t_path + ".frequency_curve",  _values);
                }
            })));
        }


        t_box.appendChild(Builder.CreateTextBox({ text: "Particle Parameters", margins: "1em", weight: 500, size: "1.2em" }));


        t_parameters.push(t_box.appendChild(Builder.CreateHorizontalList({
            width: "100%",
            margin: {top: "0.25em", bottom: "0.25em"}
        },[
            Builder.CreateTextBox({ text: "Lifetime", margins: "0.25em", weight: 500 }),
            Builder.CreateDoubleRangeInput({
                width: "100%", value: [t_emitter.particle.duration, t_emitter.particle_delta.duration], min: 0.1, max: 10.0, step: 0.01, exponent: 3.0,
                wheel_input: 0.1,
                drag_input: 0.01,
                hide_digits: false, digit_width: "2.5em", trail_color: "#b5a073",
                onchange_func: function(_val, _range) {
                    t_emitter.particle.duration = _val[0];
                    t_emitter.particle_delta.duration = _val[1];
                    if(t_path)
                    {
                        engine.SingleCommand(t_path + ".particle.duration",  _val[0]);
                        engine.SingleCommand(t_path + ".particle_delta.duration",  _val[1]);
                    }
                }
            })
        ])));


        let t_physics = t_box.appendChild(Builder.CreateCollapseMenu({style: "shadow", width: "100%", margin: "0.5em", expand: false, show_button: true, button_size: "1.2em"}));
        t_physics.AppendTop(Builder.CreateTextBox({
            text: "Particle Physics", align: "center", size: "1.2em", weight: 600, margin: "0.5em",
            onclick: function() {t_physics.Toggle()}
        }));

        {
            t_parameters.push(t_physics.AppendBottom(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: {top: "0.25em", bottom: "0.25em"}
                },[
                    Builder.CreateTextBox({ text: "Weight", margins: "0.25em", weight: 500 }),
                    Builder.CreateDoubleRangeInput({
                        width: "100%", value: [t_emitter.particle.weight, t_emitter.particle_delta.weight], min: -2.0, max: 2.0, step: 0.01,
                        wheel_input: 0.1,
                        drag_input: 0.01,
                        hide_digits: false, digit_width: "2.5em", trail_color: "#daa347",
                        onchange_func: function(_val, _range) {
                            t_emitter.particle.weight = _val[0];
                            t_emitter.particle_delta.weight = _val[1];
                            if(t_path)
                            {
                                engine.SingleCommand(t_path + ".particle.weight",  t_emitter.particle.weight);
                                engine.SingleCommand(t_path + ".particle_delta.weight",  t_emitter.particle_delta.weight);
                            }
                        }
                    })  
                ]
            )));

            t_parameters.push(t_physics.AppendBottom(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: {top: "0.25em", bottom: "0.25em"}
                },[
                    Builder.CreateTextBox({ text: "Velocity", margins: "0.25em", weight: 500 }),
                    Builder.CreateDoubleRangeInput({
                        width: "100%", value: [ToolBox.Length(t_emitter.particle.velocity), ToolBox.Length(t_emitter.particle_delta.velocity)],
                        min: 0.0, max: 10.0, step: 0.002, exponent: 3.0,
                        wheel_input: 0.002,
                        drag_input: 0.002,
                        hide_digits: false, digit_width: "2.5em", trail_color: "#08d9cd",
                        onchange_func: function(_val, _range) {
                            t_emitter.particle.velocity = [0.0, _val[0], 0.0];
                            t_emitter.particle_delta.velocity = [0.0, _val[1], 0.0];
                            if(t_path)
                            {
                                engine.SingleCommand(t_path + ".particle.velocity",  t_emitter.particle.velocity);
                                engine.SingleCommand(t_path + ".particle_delta.velocity",  t_emitter.particle_delta.velocity);
                            }
                        }
                    })  
                ]
            )));

            t_parameters.push(t_physics.AppendBottom(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: {top: "0.25em", bottom: "0.25em"}
                },[
                    Builder.CreateTextBox({ text: "Angular Vel.", margins: "0.25em", weight: 500 }),
                    Builder.CreateDoubleRangeInput({
                        width: "100%", value: [t_emitter.particle.angular_velocity, t_emitter.particle_delta.angular_velocity],
                        min: -10.0, max: 10.0, step: 0.002, exponent: 3.0,
                        wheel_input: 0.002,
                        drag_input: 0.002,
                        hide_digits: false, digit_width: "2.5em", trail_color: "#08d9cd",
                        onchange_func: function(_val, _range) {
                            t_emitter.particle.angular_velocity = _val[0];
                            t_emitter.particle_delta.angular_velocity = _val[1];
                            if(t_path)
                            {
                                engine.SingleCommand(t_path + ".particle.angular_velocity",  t_emitter.particle.angular_velocity);
                                engine.SingleCommand(t_path + ".particle_delta.angular_velocity",  t_emitter.particle_delta.angular_velocity);
                            }
                        }
                    })  
                ]
            )));

            t_parameters.push(t_physics.AppendBottom(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: {top: "0.25em", bottom: "0.25em"}
                },[
                    Builder.CreateTextBox({ text: "Friction", margins: "0.25em", weight: 500 }),
                    Builder.CreateDoubleRangeInput({
                        width: "100%", value: [t_emitter.particle.friction, t_emitter.particle_delta.friction],
                        min: 0.0, max: 10.0, step: 0.002, exponent: 3.0,
                        wheel_input: 0.002,
                        drag_input: 0.002,
                        hide_digits: false, digit_width: "2.5em", trail_color: "#08d9cd",
                        onchange_func: function(_val, _range) {
                            t_emitter.particle.friction = _val[0];
                            t_emitter.particle_delta.friction = _val[1];
                            if(t_path)
                            {
                                engine.SingleCommand(t_path + ".particle.friction",  t_emitter.particle.friction);
                                engine.SingleCommand(t_path + ".particle_delta.friction",  t_emitter.particle_delta.friction);
                            }
                        }
                    })  
                ]
            )));

            t_parameters.push(t_physics.AppendBottom(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: {top: "0.25em", bottom: "0.25em"}
                },[
                    Builder.CreateTextBox({ text: "Noise", margins: "0.25em", weight: 500 }),
                    Builder.CreateDoubleRangeInput({
                        width: "100%", value: [t_emitter.particle.noise, t_emitter.particle_delta.noise],
                        min: 0.0, max: 1000.0, step: 0.002, exponent: 3.0,
                        wheel_input: 0.002,
                        drag_input: 0.002,
                        hide_digits: false, digit_width: "2.5em", trail_color: "#08d9cd",
                        onchange_func: function(_val, _range) {
                            t_emitter.particle.noise = _val[0];
                            t_emitter.particle_delta.noise = _val[1];
                            if(t_path)
                            {
                                engine.SingleCommand(t_path + ".particle.noise",  t_emitter.particle.noise);
                                engine.SingleCommand(t_path + ".particle_delta.noise",  t_emitter.particle_delta.noise);
                            }
                        }
                    })  
                ]
            )));

            t_parameters.push(t_physics.AppendBottom(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: {top: "0.25em", bottom: "0.25em"}
                },[
                    Builder.CreateTextBox({ text: "Noise Scale", margins: "0.25em", weight: 500 }),
                    Builder.CreateDoubleRangeInput({
                        width: "100%", value: [t_emitter.particle.noise_scale, t_emitter.particle_delta.noise],
                        min: 0.0, max: 1000.0, step: 0.002, exponent: 3.0,
                        wheel_input: 0.002,
                        drag_input: 0.002,
                        hide_digits: false, digit_width: "2.5em", trail_color: "#08d9cd",
                        onchange_func: function(_val, _range) {
                            t_emitter.particle.noise_scale = _val[0];
                            t_emitter.particle_delta.noise_scale = _val[1];
                            if(t_path)
                            {
                                engine.SingleCommand(t_path + ".particle.noise_scale",  t_emitter.particle.noise_scale);
                                engine.SingleCommand(t_path + ".particle_delta.noise_scale",  t_emitter.particle_delta.noise_scale);
                            }
                        }
                    })  
                ]
            )));
        }



        let t_visuals = t_box.appendChild(Builder.CreateCollapseMenu({style: "shadow", width: "100%", margin: "0.5em", expand: false, show_button: true, button_size: "1.2em"}));
        t_visuals.AppendTop(Builder.CreateTextBox({
            text: "Particle Visuals", align: "center", size: "1.2em", weight: 600, margin: "0.5em",
            onclick: function() {t_visuals.Toggle()}
        }));

        {

            /// radius
            {
                t_visuals.AppendBottom(Builder.CreateTextBox({ text: "Radius", margins: {top: "0.5em", left: "0.25em", right: "0.25em"}, weight: 500 }));

                t_parameters.push(t_visuals.AppendBottom(Builder.CreateHorizontalList({
                        width: "100%",
                        margin: {top: "0.25em", bottom: "0.25em"}
                    },[
                        Builder.CreateTextBox({ text: "Scale", margins: "0.25em", weight: 500 }),
                        Builder.CreateDoubleRangeInput({
                            width: "100%", value: [t_emitter.particle.radius, t_emitter.particle_delta.radius],
                            min: 0.002, max: 1.0, step: 0.002, exponent: 3.0,
                            wheel_input: 0.002,
                            drag_input: 0.002,
                            hide_digits: false, digit_width: "2.5em", trail_color: "#85553c",
                            onchange_func: function(_val, _range) {
                                t_emitter.particle.radius = _val[0];
                                t_emitter.particle_delta.radius = _val[1];
                                if(t_path)
                                {
                                    engine.SingleCommand(t_path + ".particle.radius",  _val[0]);
                                    engine.SingleCommand(t_path + ".particle_delta.radius",  _val[1]);
                                }
                            }
                        })  
                    ]
                )));

                t_parameters.push(t_visuals.AppendBottom(Builder.CreateParametricCurve({
                    value: t_emitter.particle.radius_curve,
                    width: "100%", height: "4em", color: "#85553c",
                    onchange: function(_values)
                    {
                        t_emitter.particle.radius_curve = _values;
                        if(t_path) engine.SingleCommand(t_path + ".particle.radius_curve",  _values);
                    }
                })));
            }

            /// Intensity
            {
                t_visuals.AppendBottom(Builder.CreateTextBox({ text: "Intensity", margins: {top: "0.5em", left: "0.25em", right: "0.25em"}, weight: 500 }));

                t_parameters.push(t_visuals.AppendBottom(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: {top: "0.25em", bottom: "0.25em"}
                },[
                    Builder.CreateTextBox({ text: "Scale", margins: "0.25em", weight: 500 }),
                    Builder.CreateDoubleRangeInput({
                        width: "100%", value: [t_emitter.particle.intensity, t_emitter.particle_delta.intensity], min: 0.01, max: 100.0, step: 0.01, exponent: 3.0,
                        wheel_input: 0.1,
                        drag_input: 0.01,
                        hide_digits: false, digit_width: "2.5em", trail_color: "#cd5c41",
                        onchange_func: function(_val, _range) {
                            t_emitter.particle.intensity = _val[0];
                            t_emitter.particle_delta.intensity = _val[1];
                            if(t_path)
                            {
                                engine.SingleCommand(t_path + ".particle.intensity",  _val[0]);
                                engine.SingleCommand(t_path + ".particle_delta.intensity",  _val[1]);
                            }
                        }
                    })
                ])));

                t_parameters.push(t_visuals.AppendBottom(Builder.CreateParametricCurve({
                    value: t_emitter.particle.intensity_curve,
                    width: "100%", height: "4em", color: "#cd5c41",
                    onchange: function(_values)
                    {
                        t_emitter.particle.intensity_curve = _values;
                        if(t_path) engine.SingleCommand(t_path + ".particle.intensity_curve",  _values);
                    }
                })));
            }

            /// Emissivity
            {
                t_visuals.AppendBottom(Builder.CreateTextBox({ text: "Emissivity", margins: {top: "0.5em", left: "0.25em", right: "0.25em"}, weight: 500 }));

                t_parameters.push(t_visuals.AppendBottom(Builder.CreateParametricCurve({
                    value: t_emitter.particle.emissivity_curve,
                    width: "100%", height: "4em", color: "#c25762",
                    onchange: function(_values)
                    {
                        t_emitter.particle.emissivity_curve = _values;
                        if(t_path) engine.SingleCommand(t_path + ".particle.emissivity_curve",  _values);
                    }
                })));
            }

            t_parameters.push(t_visuals.AppendBottom(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Stretch", margins: "0.25em", weight: 500 }),
                Builder.CreateRangeInput({
                    width: "100%", value: t_emitter.particle.stretch, min: 0.0, max: 2.0, step: 0.01,
                    wheel_input: 0.1,
                    drag_input: 0.01,
                    hide_digits: false, digit_width: "2.5em", trail_color: "#a27d42", margins: "0.25em",
                    onchange_func: function(_val, _range) {
                        t_emitter.particle.stretch = _val;
                        if(t_path) engine.SingleCommand(t_path + ".particle.stretch",  t_emitter.particle.stretch);
                    }
                })
            ])));

            /// Colors
            {
                t_visuals.AppendBottom(Builder.CreateTextBox({ text: "Colors", margins: {top: "0.5em", left: "0.25em", right: "0.25em"}, weight: 500 }));

                let t_colorA = t_visuals.AppendBottom(Builder.CreateColorRamp({
                    value: t_emitter.particle.colors,
                    width: "100%", height: "2em",
                    onchange: function(_values)
                    {
                        t_emitter.particle.colors = _values;

                        let t_positions = t_colorA.GetPositions();
                        t_colorB.UpdatePositions([...t_positions]);

                        if(t_path)
                        {
                            engine.SingleCommand(t_path + ".particle.colors",  _values);
                            engine.SingleCommand(t_path + ".particle_delta.colors",  t_colorB.GetValue());
                        }
                    }
                }));

                let t_colorB = t_visuals.AppendBottom(Builder.CreateColorRamp({
                    value: t_emitter.particle_delta.colors,
                    width: "100%", height: "2em",
                    onchange: function(_values)
                    {
                        t_emitter.particle_delta.colors = _values;

                        let t_positions = t_colorB.GetPositions();
                        t_colorA.UpdatePositions([...t_positions]);

                        if(t_path)
                        {
                            engine.SingleCommand(t_path + ".particle_delta.colors",  _values);
                            engine.SingleCommand(t_path + ".particle.colors",  t_colorA.GetValue());
                        }
                    }
                }));

                t_parameters.push(t_colorA);
                t_parameters.push(t_colorB);
            }

            /// Texture
            t_visuals.AppendBottom(Builder.CreateTextBox({ text: "Texture", margins: {top: "0.5em", left: "0.25em", right: "0.25em"}, weight: 500 }));
            t_parameters.push(t_visuals.AppendBottom(EngineUI.CreateTextureSlot({
                label: "color",
                url: t_emitter.particle.texture ? atob(t_emitter.particle.texture) : "",
                texture_path: t_path ? t_path + ".texture" : null,
                texture_type: "color",
                allow_propagate: false,
                onchange: function(new_url) {
                    t_emitter.particle.texture = btoa(new_url);
                    if(t_path) engine.SingleCommand(t_path + ".particle.texture", btoa(new_url));
                }
            })));
        }



        t_parameters.push(t_menu.AppendBottom(Builder.CreatePressButton({
            image: "/web/images/delete_icon.png",
            size: '1.2em',
            position: {top: 0, left: "0.25em"},
            onclick: function() {
                if(t_path) engine.SingleCommand(t_path + ".delete");
                if(_parameters.interface_element) _parameters.interface = _parameters.interface_element.node_interface;
                if(_parameters.interface) _parameters.interface.DeleteNode(_parameters.node, _parameters.id);
                t_menu.remove();        
            }
        })));

        t_menu.EnableEdit = function() {
            for(let _param of t_parameters) _param.EnableEdit();
        }
        t_menu.DisableEdit = function() {
            for(let _param of t_parameters) _param.DisableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();

        return t_menu;
    }

    static CreateShapeMenu(_parameters)
    {
        let t_shape = _parameters.shape;
        let t_path = _parameters.path;
        // console.log(t_shape);
        // console.log(t_path);

        /// we remove the type, so it does not appear in the json parameters
        let t_shapeType = t_shape.type;
        t_shape.type = null;

        let t_menu = Builder.CreateBox({
            width: _parameters.width || "100%",
            margin: _parameters.margins || "0.5em"
        });

        /// title
        if(_parameters.title)
        {
            t_menu.appendChild(Builder.CreateTextBox({
                text: _parameters.title,
                size: "1.2em",
                weight: 500,
                width: "100%",
                margin: {botttom: "0.25em"},
                text_align: "center"
            }))
        }

        let t_typeField = t_menu.appendChild(Builder.CreateHorizontalList({width: "100%", margins: 0}, [
            Builder.CreateTextBox({ text: "Shape", margins: "0.25em", weight: 500 }),
            Builder.CreateSelector({
                options: [
                    {text: "sphere", value: "sphere"},
                    {text: "box", value: "box"}
                ],
                value: t_shapeType,
                align: "spread",
                onselect: function(_value) {
                    t_shapeType = _value;
                    if(typeof(engine) !== 'undefined') UpdateType(_value);
                }
            })
        ]));

        let t_paramBox = t_menu.appendChild(Builder.CreateBox({
            width: "100%",
            margins: 0,
            // style: "shadow rounded blueish"
        }));

        function UpdateType(new_type)
        {
            t_shape = engine.SingleCommand(t_path + ".type", new_type);
            // console.log(t_shape);

            t_shapeType = t_shape.type;
            t_shape.type = null;

            UpdateParameters();
            
            if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
            else t_menu.EnableEdit();
        }


        let t_params = null;
        function UpdateParameters()
        {
            t_paramBox.innerHTML = ``;
            t_params = t_paramBox.appendChild(Builder.CreateJSONEditor({
                json: t_shape,
                name: "Parameters",
                size: "1.1em",
                expand: "all",
                special_types: true,
                allow_edit: "none", /// no edit button, but can still enable editing of the values
                margins: {top: "0.25em", bottom: "0.25em"},
                onchange: function(_json) {
                    _parameters.shape = _json;
                    if(t_path) engine.SingleCommand(t_path, _json);
                },
            }));
        }

        t_menu.EnableEdit = function() {
            t_typeField.EnableEdit();
            t_params.EnableEdit();
        }
        t_menu.DisableEdit = function() {
            t_typeField.DisableEdit();
            t_params.DisableEdit();
        }

        UpdateParameters();

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();

        return t_menu;
    }

    static CreateSensorMenu(_parameters)
    {
        let t_sensor = _parameters.sensor;
        let t_path = _parameters.object_path ? _parameters.object_path + ".sensors." + t_sensor.id : null;
        // console.log(t_sensor);

        let t_menu;
        if('collapse' in _parameters && _parameters.collapse == true)
        {
            t_menu = Builder.CreateCollapseMenu({ style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: false }, [], []);
        }
        else
        {
            t_menu = Builder.CreateBox({width: "100%", style: _parameters.style});
            t_menu.AppendTop = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
            t_menu.AppendBottom = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
        }

        t_menu.AppendTop(Builder.CreateTextBox({text: "Sensor", align: "center", size: "1.2em", weight: 600}));

        let t_box = t_menu.AppendBottom(Builder.CreateBox({
            width: "100%",
            margin: "0.25em",
            style: "shadow rounded"
        }))

        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            }, [
                Builder.CreateTextBox({text: "ID", weight: 500}),
                Builder.CreateTextBox({
                    text: ToolBox.ShrinkString(t_sensor.id || 'not assigned yet', 16), margins: "0.25em",
                    onclick: function(_ev) {
                        Builder.ToClipboard(t_sensor.id, _ev);
                    }
                })
            ]
        ));

        let t_nameInput = Builder.CreateTextInput({
            value: t_sensor.name || "",
            placeholder: "write name here",
            text_align: 'center',
            no_button: true,
            width: "100%",
            allow_edit: _parameters.allow_edit || false,
            onchange: function(_val) {
                t_sensor.name = _val;
                if(t_path) engine.SingleCommand(t_path + ".name", _val);
            }
        });
        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            },[
                Builder.CreateTextBox({ text: "Name", weight: 500, margin: {right: "1em"}}),
                t_nameInput
            ]
        ));

        let t_display = t_box.appendChild(Builder.CreateHorizontalList({width: "100%", margin: "0.25em"}, [
            Builder.CreateTextBox({ text: "Display Sensor", margins: "0.25em", weight: 500 }),
            Builder.CreatePushButton({
                pressed: t_sensor.display,
                image: "/web/images/view_icon.png",
                size: "1.2em",
                onclick: function(_val) {
                    t_sensor.display = _val;
                    engine.SingleCommand(t_path + ".display", _val);
                }
            })
        ]));

        let t_position = t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            }, [
                Builder.CreateTextBox({text: "Position", weight: 500}),
                EngineUI.CreatePositionField({
                    position: t_sensor.position,
                    path: t_path,
                    width: "100%",
                    onchange: function(_position) {
                        t_sensor.position = [_position.x, _position.y, _position.z];
                        if(t_path) engine.SingleCommand(t_path + ".position", t_sensor.position);        
                    }
                })    
            ]
        ));

        let t_typeField = t_box.appendChild(Builder.CreateHorizontalList({width: "100%", margin: "0.25em"}, [
            Builder.CreateTextBox({ text: "Type", margins: "0.25em", weight: 500 }),
            Builder.CreateSelector({
                options: [
                    {text: "proximity", value: "proximity"}
                ],
                value: t_sensor.type,
                align: "spread",
                onselect: function(_value) {
                    t_sensor.type = _value;
                    if(typeof(engine) !== 'undefined') UpdateType(_value);
                }
            })
        ]));

        let t_triggerField = t_box.appendChild(Builder.CreateHorizontalList({width: "100%", margin: "0.25em"}, [
            Builder.CreateTextBox({ text: "Trigger", margins: "0.25em", weight: 500 }),
            Builder.CreateSelector({
                options: [
                    {text: "once", value: "once"},
                    {text: "repeat", value: "repeat"}
                ],
                value: t_sensor.trigger,
                align: "spread",
                onselect: function(_value) {
                    t_sensor.trigger = _value;
                    if(t_path) engine.SingleCommand(t_path + ".trigger", _value);
                }
            })
        ]));


        let t_paramBox = t_menu.appendChild(Builder.CreateBox({
            width: "100%",
            margin: "0.25em",
            style: "shadow rounded blueish"
        }));

        let t_menuList = [];
        function UpdateType(new_type)
        {
            t_sensor = engine.SingleCommand(t_path + ".type", new_type);

            UpdateParameters();

            if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
            else t_menu.EnableEdit();            

        }

        function UpdateParameters()
        {
            t_paramBox.innerHTML = ``;
            t_menuList = [];

            if(t_sensor.filter)
            {
                t_menuList.push(t_paramBox.appendChild(Builder.CreateHorizontalList({width: "100%", margin: "0.5em"}, [
                    Builder.CreateTextBox({ text: "Targets", margins: "0.25em", weight: 500 }),
                    Builder.CreateSelector({
                        options: [
                            {text: "all", value: "all"},
                            {text: "avatars", value: "avatars"}
                        ],
                        value: t_sensor.filter,
                        align: "spread",
                        onselect: function(_value) {
                            t_sensor.filter = _value;
                            if(typeof(engine) !== 'undefined') engine.SingleCommand(t_path + ".filter", _value);
                        }
                    })
                ])));
            }

            if(t_sensor.shape)
            {
                t_menuList.push(t_paramBox.appendChild(EngineUI.CreateShapeMenu({
                    shape: t_sensor.shape,
                    path: t_path + ".shape",
                    margin: "0.25em"
                })));
            }
        }


        let t_delete = t_menu.AppendBottom(Builder.CreatePressButton({
            image: "/web/images/delete_icon.png",
            size: '1.2em',
            position: {top: 0, left: "0.25em"},
            onclick: function() {
                if(t_path) engine.SingleCommand(t_path + ".delete");
                if(_parameters.interface_element) _parameters.interface = _parameters.interface_element.node_interface;
                if(_parameters.interface) _parameters.interface.DeleteNode(_parameters.node, _parameters.id);
                t_menu.remove();        
            }
        }));

        UpdateParameters();

        t_menu.EnableEdit = function() {
            t_position.EnableEdit();
            t_typeField.EnableEdit();
            t_delete.EnableEdit();
            t_display.EnableEdit();
            t_nameInput.EnableEdit();
            t_triggerField.EnableEdit();
            for(let _menu of t_menuList) _menu.EnableEdit();
        }
        t_menu.DisableEdit = function() {
            t_position.DisableEdit();
            t_typeField.DisableEdit();
            t_delete.DisableEdit();
            t_display.DisableEdit();
            t_nameInput.DisableEdit();
            t_triggerField.DisableEdit();
            for(let _menu of t_menuList) _menu.DisableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();

        return t_menu;
    }

    static CreateVideoMenu(_parameters)
    {
        let t_url = _parameters.url;
        let t_path = "videos." + btoa(t_url);
        let t_video = engine.SingleCommand(t_path + ".json");

        let t_menu = Builder.CreateBox({width: _parameters.width, margins: _parameters.margins});


        t_menu.appendChild(Builder.CreateTextBox({text: "Video", align: "center", size: "1.2em", weight: 600}));

        let t_table = Builder.CreatePairTable({
            // title: "Parameters",
            title_size: "1.2em",
            width: "100%",
            left_width: "40%", right_width: "60%",
            left_align: "left", right_align: "right",
            style: "shadow rounded",
            margin: "0.25em",
            padding: "0.25em"
        });
        t_table.AppendRow(
            Builder.CreateTextBox({ text: "URL", margins: "0.25em", weight: 500 }),
            Builder.CreateTextBox({ text: t_url, overflow: "hidden" })
        );
        t_table.AppendRow(
            Builder.CreateTextBox({ text: "Name", margins: "0.25em", weight: 500 }),
            Builder.CreateTextBox({ text: t_video.name })
        );
        t_table.AppendRow(
            Builder.CreateTextBox({ text: "Duration", margins: "0.25em", weight: 500 }),
            Builder.CreateTextBox({ text: t_video.duration })
        );
        t_menu.appendChild(t_table);

        t_menu.appendChild(EngineUI.CreatePlayPanel({
            title: "Controls",
            player: t_video,
            path: t_path,
            type: "video"
        }));

        return t_menu;
    }

    static CreateVoiceMenu(_parameters)
    {
        // console.log(_parameters);
        let t_voice = _parameters.voice;
        let t_path = _parameters.object_path ? _parameters.object_path + ".voices." + t_voice.id : null;

        let t_menu;
        if('collapse' in _parameters && _parameters.collapse == true)
        {
            t_menu = Builder.CreateCollapseMenu({ style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: false });
        }
        else
        {
            t_menu = Builder.CreateBox({width: "100%", style: _parameters.style});
            t_menu.AppendTop = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
            t_menu.AppendBottom = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
        }

        t_menu.AppendTop(Builder.CreateTextBox({text: "Voice", align: "center", size: "1.2em", weight: 600}));

        let t_box = t_menu.AppendBottom(Builder.CreateBox({
            width: "100%",
            margin: "0.25em",
            style: "shadow rounded"
        }))

        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            }, [
                Builder.CreateTextBox({text: "ID", weight: 500}),
                Builder.CreateTextBox({
                    text: ToolBox.ShrinkString(t_voice.id || 'not assigned yet', 16), margins: "0.25em",
                    onclick: function(_ev) { Builder.ToClipboard(t_voice.id, _ev); }
                })
            ]
        ));

        let t_position = t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            }, [
                Builder.CreateTextBox({text: "Position", weight: 500}),
                EngineUI.CreatePositionField({
                    position: t_voice.position,
                    path: t_path,
                    width: "100%",
                    onchange: function(_position) {
                        t_voice.position = [_position.x, _position.y, _position.z];
                        if(t_path) engine.SingleCommand(t_path + ".position", t_voice.position);        
                    }
                })    
            ]
        ));

        let t_volume = Builder.CreateRangeInput({
            width: "100%", value: t_voice.gain, min: 0.01, max: 10.0, step: 0.01,
            wheel_input: 0.1,
            drag_input: 0.01,
            hide_digits: false, digit_width: "2.5em", trail_color: "#4bb25e",
            onchange_func: function(_val, _range) {
                t_voice.gain = _val;
                if(t_path) EngineUI.SetVoiceVolume(t_path, _val);
            }
        })    
        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            },[
                Builder.CreateTextBox({ text: "Volume", margins: "0.25em", weight: 500 }),
                t_volume
            ]
        ));

        function CreateClipBox(_clip)
        {
            let t_table = Builder.CreatePairTable({
                // title: "Parameters",
                title_size: "1.2em",
                width: "100%",
                left_width: "40%", right_width: "60%",
                left_align: "left", right_align: "right",
                style: "shadow rounded",
                margin: "0.25em",
                padding: "0.25em"
            });
            t_table.AppendRow(
                Builder.CreateTextBox({ text: "URL", margins: "0.25em", weight: 500 }),
                Builder.CreateTextBox({ text: _clip.url, overflow: "hidden" })
            );
            t_table.AppendRow(
                Builder.CreateTextBox({ text: "Name", margins: "0.25em", weight: 500 }),
                Builder.CreateTextBox({ text: _clip.name })
            );
            t_table.AppendRow(
                Builder.CreateTextBox({ text: "Duration", margins: "0.25em", weight: 500 }),
                Builder.CreateTextBox({ text: _clip.duration })
            );

            return t_table;
        }
        
        let t_slot = t_menu.AppendBottom(Builder.CreateBox({
            width: "100%",
            min_height: "5em",
        }));

        if(t_voice.clip)
        {
            t_slot.appendChild(CreateClipBox({
                url: atob(t_voice.clip.URL),
                name: t_voice.clip.name,
                duration: t_voice.time_max - t_voice.time_min
            }));
        }
        else
        {
            t_slot.appendChild(Builder.CreateTextBox({
                text: "drop audio clip here",
                width: "100%",
                height: "5em",
                margin: "1em",
                padding: "0.5em",
                text_align: "center",
                style: "black_border rounded"
            }));
        }

        t_menu.AppendBottom(EngineUI.CreatePlayPanel({
            title: "Controls",
            player: t_voice,
            path: t_path
        }));

        let t_delete = t_menu.AppendBottom(Builder.CreatePressButton({
            image: "/web/images/delete_icon.png",
            size: '1.2em',
            position: {top: 0, left: "0.25em"},
            onclick: function() {
                if(t_path) engine.SingleCommand(t_path + ".delete");
                if(_parameters.interface_element) _parameters.interface = _parameters.interface_element.node_interface;
                if(_parameters.interface) _parameters.interface.DeleteNode(_parameters.node, _parameters.id);
                t_menu.remove();        
            }
        }));

        t_menu.EnableEdit = function() {
            t_position.EnableEdit();
            t_volume.EnableEdit();
            t_delete.EnableEdit();
        }
        t_menu.DisableEdit = function() {
            t_position.DisableEdit();
            t_volume.DisableEdit();
            t_delete.DisableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();


        return t_menu;
    }

    static CreatePathEditor(_parameters)
    {
        let t_path = _parameters.path;
        let t_animation = _parameters.animation;

        /// compute the total time of the animation
        let t_duration = 0.0;
        for(let i = 0; i < t_animation.path.length; i++) t_duration = Math.max(t_duration, t_animation.path[i].time);
        if(t_duration == 0.0) t_duration = 1.0;
      
        function CreatePointMenu(_box, _point, _index, _expand = false)
        {
            // console.log(_point);
            let t_pointIndex = _index;
            let t_pointPath = t_path ? (t_path + ".path." + t_pointIndex) : null;

            let t_pointType = _box.appendChild(Builder.CreateCheckList({
                value: _point.flags.split('|'),
                weight: "bold",
                list: [
                    {text: "position", value: "translation"},
                    {text: "rotation", value: "rotation"},
                ],
                width: "100%",
                margin: "0.25em",
                child_align: "center",
                onchange: function(_checks) {
                    let t_flags = "";
                    for(let i = 0; i < _checks.length - 1; i++) t_flags += _checks[i] + "|";
                    t_flags += _checks[_checks.length - 1];
                    
                    _point.flags = t_flags;
                    if(t_pointPath) engine.SingleCommand(t_pointPath + ".flags", t_flags);
                }
            }));

            let t_pointPosition = _box.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: "0.25em"
                }, [
                    Builder.CreateTextBox({text: "Position", weight: 500}),
                    EngineUI.CreatePositionField({
                        position: _point.translation,
                        path: t_pointPath,
                        parent_path: _parameters.parent_path || "world",
                        width: "100%",
                        onchange: function(_position) {
                            _point.translation = [_position.x, _position.y, _position.z];
                            if(t_pointPath) engine.SingleCommand(t_pointPath + ".translation", _point.translation);
                        }
                    })    
                ]
            ));

            let t_pointRotation = _box.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: "0.25em"
                }, [
                    Builder.CreateTextBox({text: "Rotation", weight: 500}),
                    EngineUI.CreateRotationField({
                        rotation: _point.rotation,
                        path: t_pointPath,
                        parent_path: _parameters.parent_path || "world",
                        width: "100%",
                        onchange: function(_rotation) {
                            _point.rotation = _rotation;
                            if(t_pointPath) engine.SingleCommand(t_pointPath + ".rotation",  _point.rotation);    
                        }
                    })
                ]
            ));
    
           
            _box.SetIndex = function(new_index) {
                t_pointIndex = new_index;
                t_pointName.SetText("Point " + t_pointIndex);
                t_pointPath = t_path ? (t_path + ".path." + t_pointIndex) : null;
            }

            _box.EnableEdit = function() {
                t_pointType.EnableEdit();
                t_pointPosition.EnableEdit();
                t_pointRotation.EnableEdit();
            }
            _box.DisableEdit = function() {
                t_pointType.DisableEdit();
                t_pointPosition.DisableEdit();
                t_pointRotation.DisableEdit();
            }
        }

        let t_menu = Builder.CreateCollapseMenu({style: _parameters.style, width: "100%", margin: "0.5em", expand: false, show_button: true}, [
                Builder.CreateTextBox({
                    text: "Path", size: "1.2em", weight: 500, align: "center", margin: "0.25em",
                    onclick: function() {t_menu.Toggle()}
                }),
                Builder.CreatePushButton({
                    pressed: t_animation.display,
                    image: "/web/images/view_icon.png",
                    margin: "0.25em",
                    size: "1.2em",
                    onclick: function(_pressed) {
                        t_animation.display = _pressed;
                        if(t_path) EngineUI.SetAnimationDisplay(t_path, _pressed);
                    }
                })
            ]
        );

        let t_pathType = t_menu.AppendBottom(Builder.CreateHorizontalList({width: "100%"}, [
            Builder.CreateTextBox({ text: "Type", margins: "0.25em", weight: 500 }),
            Builder.CreateSelector({
                size: "1.0em",
                options: [
                    {text: "linear", value: "linear"},
                    {text: "Hermite curve", value: "hermite"},
                ],
                value: t_animation.interpolation,
                align: "spread",
                onselect: function(_value) {
                    t_animation.interpolation = _value;
                    if(t_path) engine.SingleCommand(t_path + ".interpolation", _value);
                }
            })
        ]));


        let t_animationTime = t_menu.AppendBottom(Builder.CreateHorizontalList({width: "100%"}, [
            Builder.CreateTextBox({ text: "Duration", margins: "0.25em", weight: 500 }),
            Builder.CreateRangeInput({
                value: t_duration, min: 0.0, max: 100.0, step: 0.1, exponent: 5.0,
                wheel_input: 0.5,
                drag_input: 0.1,    
                width: "100%", hide_digits: false, digit_width: "2.5em", trail_color: "#535674",
                onchange_func: function(_value, _range) {
                    t_duration = _value;
                    if(t_path) engine.SingleCommand(t_path + ".duration", _value);

                    if(_parameters.onchange) _parameters.onchange({time_max: _value});
                }
            }) 
        ]));

        let t_times = [];
        for(let i = 0; i < t_animation.path.length; i++) t_times.push(t_animation.path[i].time / t_duration);
        if(t_times.length < 2) t_times = [0.0, 1.0];

        let t_selectedPoint = null;
        let t_timeline = t_menu.AppendBottom(Builder.CreateTimeline({
            value: t_times,
            width: "100%",
            height: "3em",
            onadd: function(_index, _value) {
                t_times.splice(_index, 0, _value);
                if(t_path)
                {
                    let t_newTime = t_duration * _value;
                    let t_newPoint = engine.SingleCommand(t_path + ".new_point", t_newTime);
                    t_newPoint.time = t_newTime;
                    t_animation.path.splice(_index, 0, t_newPoint);
                    engine.SingleCommand(t_path + ".path." + _index + ".time", t_newPoint.time);
                }
            },
            onmove: function(_index, _val) {
                t_times[_index] = _val;
                t_selectedPoint.time = t_duration * _val;
                if(t_path) engine.SingleCommand(t_path + ".path." + _index + ".time", t_selectedPoint.time);
            },
            onremove: function(_index) {
                t_selectedPoint = null;
                t_times.splice(_index, 1);
                t_animation.path.splice(_index, 1);
                t_pointParameters.innerHTML = "";
                if(t_path) engine.SingleCommand(t_path + ".path." + _index + ".delete");
            },
            onselect: function(_index) {
                t_selectedPoint = t_animation.path[_index];
                t_pointParameters.innerHTML = "";
                CreatePointMenu(t_pointParameters, t_selectedPoint, _index, false);
                t_pointParameters.EnableEdit();
            }
        }));

        let t_pointParameters = t_menu.AppendBottom(Builder.CreateBox({
            min_height: "8em"
        }));

        t_menu.EnableEdit = function() {
            t_pathType.EnableEdit();
            t_animationTime.EnableEdit();
            t_timeline.EnableEdit();
            t_pointParameters.EnableEdit();
        }
        t_menu.DisableEdit = function() {
            t_pathType.DisableEdit();
            t_animationTime.DisableEdit();
            t_timeline.DisableEdit();
            t_pointParameters.DisableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();

        return t_menu;
    }

    static CreatePhysicsAnimationMenu(_parameters)
    {
        console.log(_parameters);
        let t_animation = _parameters.animation;
        let t_path = _parameters.object_path ? _parameters.object_path + ".physics_animations." + t_animation.id : null;

        let t_menu;
        if('collapse' in _parameters && _parameters.collapse == true)
        {
            t_menu = Builder.CreateCollapseMenu({ style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: false });
        }
        else
        {
            t_menu = Builder.CreateBox({width: "100%", style: _parameters.style});
            t_menu.AppendTop = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
            t_menu.AppendBottom = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
        }

        t_menu.AppendTop(Builder.CreateTextBox({text: "Physics Animation", align: "right", size: "1.2em", weight: 600, margin: {right: "1em"}}));

        let t_main = t_menu.AppendBottom(Builder.CreateBox({
            width: "100%",
            margin: "0.25em",
            style: "shadow rounded"
        }))
        {
            t_main.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: "0.25em"
                }, [
                    Builder.CreateTextBox({text: "ID", weight: 500}),
                    Builder.CreateTextBox({
                        text: ToolBox.ShrinkString(t_animation.id || 'not assigned yet', 16), margins: "0.25em",
                        onclick: function(_ev) { Builder.ToClipboard(t_animation.id, _ev); }
                    })
                ]
            ));

            let t_nameInput = Builder.CreateTextInput({
                value: atob(t_animation.name),
                placeholder: "write name here",
                text_align: 'center',
                no_button: true,
                width: "100%",
                allow_edit: _parameters.allow_edit || false,
                onchange: function(_val) {
                    t_animation.name = btoa(_val);
                    if(t_path) engine.SingleCommand(t_path + ".name", btoa(_val));
                }
            });
            t_main.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: "0.25em"
                },[
                    Builder.CreateTextBox({ text: "Name", weight: 500, margin: {right: "1em"}}),
                    t_nameInput
                ]
            ));

            t_main.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: "0.25em"
                }, [
                    Builder.CreateTextBox({text: "Base", weight: 500}),
                    EngineUI.CreateObjectField({
                        object: t_animation.parent_path,
                        width: "100%",
                        onchange: function(object_path) {
                            t_animation.parent = object_path;
                            if(t_path) engine.SingleCommand(t_path + ".parent", object_path);        
                        }
                    })    
                ]
            ));
            t_main.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: "0.25em"
                }, [
                    Builder.CreateTextBox({text: "Target", weight: 500}),
                    EngineUI.CreateObjectField({
                        object: t_animation.target_path,
                        width: "100%",
                        onchange: function(object_path) {
                            t_animation.target = object_path;
                            if(t_path) engine.SingleCommand(t_path + ".target", object_path);        
                        }
                    })    
                ]
            ));

            t_main.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: "0.25em"
                }, [
                    Builder.CreateTextBox({text: "Anchor Pos.", weight: 500}),
                    EngineUI.CreatePositionField({
                        position: t_animation.anchor_position,
                        // path: object_path,
                        parent_path: t_animation.target_path || "world",
                        width: "100%",
                        onchange: function(_position) {
                            t_animation.anchor_position = [_position.x, _position.y, _position.z];
                            if(t_path) engine.SingleCommand(t_path + ".anchor_position", t_animation.anchor_position);
                        }
                    })    
                ]
            ));

            t_main.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: "0.25em"
                }, [
                    Builder.CreateTextBox({text: "Anchor Rot.", weight: 500}),
                    EngineUI.CreateRotationField({
                        rotation: t_animation.anchor_rotation,
                        parent_path: t_animation.target_path || "world",
                        width: "100%",
                        onchange: function(_rotation) {
                            t_animation.anchor_rotation = _rotation;
                            if(t_path) engine.SingleCommand(t_path + ".anchor_rotation",  t_animation.anchor_rotation);    
                        }
                    })
                ]
            ));
        }


        let t_panel = t_menu.AppendBottom(EngineUI.CreateAdvancedPlayPanel({
            title: "Controls",
            player: t_animation,
            path: t_path,
            style: "shadow blueish"
        }));


        let t_contactMenu = t_menu.AppendBottom(Builder.CreateCollapseMenu({style: "shadow blueish", width: "100%", margin: "0.5em", expand: false, show_button: true}, [
                Builder.CreateTextBox({
                    text: "Contact", size: "1.2em", weight: 500, align: "center", margin: "0.25em",
                    onclick: function() {t_contactMenu.Toggle()}
                })
            ]
        ));
        t_contactMenu.AppendBottom(Builder.CreateHorizontalList({width: "100%"}, [
            Builder.CreateTextBox({ text: "Type", margins: "0.25em", weight: 500 }),
            Builder.CreateSelector({
                size: "1.0em",
                options: [
                    {text: "spring", value: "spring"},
                    {text: "ball joint", value: "ball"},
                    {text: "hinge joint", value: "hinge"},
                    {text: "glue", value: "glue"}
                ],
                value: t_animation.contact.type,
                align: "spread",
                onselect: function(_value) {
                    t_animation.contact.type = _value;
                    if(t_path)
                    {
                        t_animation.contact = engine.SingleCommand(t_path + ".contact.type", _value);
                        UpdateContactParameters(t_animation.contact);
                    }
                }
            })
        ]));
        let t_contactParams = t_contactMenu.AppendBottom(Builder.CreateBox({
            width: "100%"
        }));
        let UpdateContactParameters = function(_contact) {
            t_contactParams.innerHTML = ``;

            if(_contact.strength)
            {
                t_contactParams.appendChild(Builder.CreateHorizontalList({width: "100%"}, [
                    Builder.CreateTextBox({ text: "Strength", margins: "0.25em", weight: 500 }),
                    Builder.CreateRangeInput({
                        value: _contact.strength, min: 0.0, max: 100000.0, step: 0.5,
                        wheel_input: 5.0,
                        drag_input: 0.5,
                        width: "100%", hide_digits: false, digit_width: "2.5em", trail_color: "#4bb25e",
                        onchange_func: function(_value, _range) {
                            _contact.strength = _value;
                            if(t_path) engine.SingleCommand(t_path + ".contact.strength", _value);
                        }
                    }) 
                ]));
            }

            if(_contact.damping)
            {
                t_contactParams.appendChild(Builder.CreateHorizontalList({width: "100%"}, [
                    Builder.CreateTextBox({ text: "Damping", margins: "0.25em", weight: 500 }),
                    Builder.CreateRangeInput({
                        value: _contact.damping, min: 0.0, max: 20000.0, step: 5.0,
                        wheel_input: 50.0,
                        drag_input: 5.0,
                        width: "100%", hide_digits: false, digit_width: "2.5em", trail_color: "#4bb25e",
                        onchange_func: function(_value, _range) {
                            _contact.damping = _value;
                            if(t_path) engine.SingleCommand(t_path + ".contact.damping", _value);
                        }
                    }) 
                ]));
            }

            if(_contact.static_friction)
            {
                t_contactParams.appendChild(Builder.CreateHorizontalList({width: "100%"}, [
                    Builder.CreateTextBox({ text: "Friction", margins: "0.25em", weight: 500 }),
                    Builder.CreateRangeInput({
                        value: _contact.static_friction, min: 0.0, max: 10.0, step: 0.01,
                        wheel_input: 0.1,
                        drag_input: 0.01,
                        width: "100%", hide_digits: false, digit_width: "2.5em", trail_color: "#4bb25e",
                        onchange_func: function(_value, _range) {
                            _contact.static_friction = _value;
                            if(t_path) engine.SingleCommand(t_path + ".contact.static_friction", _value);
                        }
                    }) 
                ]));
            }
        }
        UpdateContactParameters(t_animation.contact);



        let t_pathMenu = t_menu.AppendBottom(EngineUI.CreatePathEditor({
            path: t_path,
            parent_path: t_animation.parent_path || "world",
            animation: t_animation,
            style: "shadow blueish",
            onchange: function(_changes) {
                /// update the duration in the player control panel
                if(_changes.time_max) t_panel.SetTimeMax(_changes.time_max);
            }
        }));


        let t_delete = t_menu.AppendBottom(Builder.CreatePressButton({
            image: "/web/images/delete_icon.png",
            size: '1.2em',
            position: {top: 0, left: "0.25em"},
            onclick: function() {
                if(t_path) engine.SingleCommand(t_path + ".delete");
                if(_parameters.interface_element) _parameters.interface = _parameters.interface_element.node_interface;
                if(_parameters.interface) _parameters.interface.DeleteNode(_parameters.node, _parameters.id);
                t_menu.remove();        
            }
        }));

        t_menu.EnableEdit = function() {
            t_delete.EnableEdit();
            t_panel.EnableEdit();
            t_main.EnableEdit();
            t_contactMenu.EnableEdit();
            t_pathMenu.EnableEdit();
        }
        t_menu.DisableEdit = function() {
            t_delete.DisableEdit();
            t_panel.DisableEdit();
            t_main.DisableEdit();
            t_contactMenu.DisableEdit();
            t_pathMenu.DisableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();


        return t_menu;
    }

    static CreateProcessMenu(_parameters)
    {
        let t_process = _parameters.process;
        let t_path = _parameters.object_path ? _parameters.object_path + ".processes." + t_process.id : null;
        if(_parameters.process_path) t_path = _parameters.process_path;

        /// get the list of child objects
        let t_objList = [];
        if(_parameters.object_path && typeof(engine) !== "undefined") t_objList = engine.SingleCommand(_parameters.object_path + ".list_parts");

        let t_menu;
        if('collapse' in _parameters && _parameters.collapse == true)
        {
            t_menu = Builder.CreateCollapseMenu({ style: _parameters.style || "white_board shadow", width: "100%", margin: "0.25em", expand: false, show_button: true }, [], []);
        }
        else
        {
            t_menu = Builder.CreateBox({width: "100%", style: _parameters.style});
            t_menu.AppendTop = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
            t_menu.AppendBottom = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
        }

        let t_title = Builder.CreateTextBox({text: _parameters.title || "Process", align: "center", size: "1.1em", weight: 600});
        t_menu.AppendTop(Builder.CreateHorizontalList({
                width: "100%",
                spread: true
            }, [
                t_title,
                Builder.CreateToggleButton({
                    value: !t_process.disabled,
                    onchange: function(_state) {
                        t_process.disabled = _state;
                        engine.SingleCommand(t_path + ".disable", !_state);
                    }
                })
            ]
        ));

        let t_box = t_menu.AppendBottom(Builder.CreateBox({
            width: "100%",
            margin: "0.25em",
            style: "shadow rounded"
        }))

        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            }, [
                Builder.CreateTextBox({text: "ID", weight: 500}),
                Builder.CreateTextBox({
                    text: ToolBox.ShrinkString(t_process.id || 'not assigned yet', 16), margins: "0.25em",
                    onclick: function(_ev) {Builder.ToClipboard(t_process.id, _ev);}
                })
            ]
        ));

        let t_nameInput = Builder.CreateTextInput({
            value: atob(t_process.name),
            placeholder: "write name here",
            text_align: 'center',
            no_button: true,
            width: "100%",
            allow_edit: _parameters.allow_edit || false,
            onchange: function(_val) {
                t_process.name = btoa(_val);
                if(t_path) engine.SingleCommand(t_path + ".name", btoa(_val));
                if(_parameters.update_title) t_title.SetText(_val);
            }
        });
        t_box.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.25em"
            },[
                Builder.CreateTextBox({ text: "Name", weight: 500, margin: {right: "1em"}}),
                t_nameInput
            ]
        ))

        function ApplyProcess()
        {
            let t_res = t_interface.Compile();

            let t_newProcess = {
                version: btoa("0.1"),
                name: btoa(t_nameInput.GetValue()),
                operators: t_res.operators
            };

            engine.SingleCommand(t_path, t_newProcess);
        }

        /// node interface at the top
        let t_interface = t_menu.AppendBottom(Builder.CreateNodeInterface({
            type: "process", data: t_process, cursor_menu: processCursorMenu, lock: false, allow_edit: true, title: null, height: "15em", allow_edit: false, part_list: t_objList, path: t_path, onsave: ApplyProcess
        }));
        
        /// wait a bit for all the elements to be organized
        setTimeout(function() {
            t_interface.Ready();
        }, 10);


        let t_cancel = Builder.CreatePressButton({
            image: "/web/images/close_icon.png",
            size: "1.2em",
            margin: "0.25em",
            tip: "cancel changes",
            onclick: function(_pressed) {
                if(!t_path) return;
                t_process = engine.SingleCommand(t_path + ".json");
                t_interface.Clear();
                t_interface.LoadProcess(t_process);
            }
        });
        let t_validate = Builder.CreatePressButton({
            image: "/web/images/check_icon.png",
            size: "1.2em",
            margin: "0.25em",
            tip: "apply changes",
            onclick: function(_pressed) {
                if(t_path) ApplyProcess();
            }
        });
        let t_save = Builder.CreatePressButton({
            image: "/web/images/save_icon.png",
            size: "1.2em",
            margin: "0.25em",
            tip: "save as resource",
            onclick: function(_pressed) {
                SaveProcess();
            }
        });
        let t_buttons = t_menu.AppendBottom(Builder.CreateHorizontalList({
                width: "100%",
                margin: {top: "0.25em", bottom: "0.25em"}
            }, [
                Builder.CreateHorizontalList({}, [t_cancel, t_validate, t_save]),
                Builder.CreatePressButton({
                    image: "/web/images/delete_icon.png",
                    size: "1.2em",
                    margin: "0.25em",
                    tip: "delete",
                    onclick: function(_pressed) {
                        DeleteProcess();
                    }
                })
            ]
        ));



        function SaveProcess()
        {
            let t_res = t_interface.Compile();
            let t_processName = t_nameInput.GetValue();

            let t_newProcess = {
                version: btoa("0.1"),
                name: btoa(t_processName),
                operators: t_res.operators
            };

            UserMenu.UploadProcess(t_newProcess, t_processName);
        }

        function DeleteProcess()
        {
            engine.SingleCommand(t_path + ".delete");
            if(_parameters.interface_element) _parameters.interface = _parameters.interface_element.node_interface;
            if(_parameters.interface) _parameters.interface.DeleteNode(_parameters.node, _parameters.id);
            t_menu.remove();
        }

        t_menu.EnableEdit = function() {
            t_interface.EnableEdit();
            t_nameInput.EnableEdit();
            t_buttons.classList.remove("nodisplay");
        }
        t_menu.DisableEdit = function() {
            t_interface.DisableEdit();
            t_nameInput.DisableEdit();
            t_buttons.classList.add("nodisplay");
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();

        return t_menu;
    }

    static CreateTextureSlot(_parameters)
    {
        let t_slot = document.createElement('div');
        t_slot.className = 'texture_slot';
        t_slot.innerHTML = `
            <div class='wrapper'>
            </div>
            <p></p>
            <div class='tools'>
                <img src='/web/images/info_icon.png'>
                <img src='/web/images/delete_icon.png'>
            </div>
        `;

        let t_wrapper = t_slot.children[0];
        let t_label = t_slot.children[1];
        let t_tools = t_slot.children[2];
        let t_info = t_tools.children[0];
        let t_delete = t_tools.children[1];


        let t_url = "";
        t_label.textContent = _parameters.label || "default";

        t_delete.onclick = function() {
            let t_url = "";
            if(_parameters.texture_type === "color") t_url = "//default_col";
            else if(_parameters.texture_type === "normal") t_url = "//default_norm";
            else if(_parameters.texture_type === "material") t_url = "//default_mat";
            t_slot.SetTexture(t_url);
        }

        t_info.onclick = function() {
            userMenu.ShowResourceDetails(t_url.slice(3));
        }

        t_slot.SetTexture = function(texture_url, ignore_engine = false, trigger_onchange = true) {
            t_url = texture_url;
            t_wrapper.innerHTML = '';

            if(t_url.search('//default') == 0 || t_url.length == 0)
            {
                let t_image = t_wrapper.appendChild(document.createElement('img'));
                t_image.src = "/web/images/white_block.jpg";
            }
            else
            {
                let t_firstThree = t_url.substring(0, 3);

                if(t_firstThree === "///")
                {
                    let t_image = t_wrapper.appendChild(document.createElement('img'));
                    UserMenu.LoadResourcePicture(t_url, t_image);
                }
                else if(t_firstThree === '//{')
                {
                    try {
                        let t_json = JSON.parse(t_url.slice(2));
                        if(t_json.video)
                        {
                            /// if the texture is a video
                            t_slot.style.width = "calc(100% - 0.2em)";
                            t_wrapper.appendChild(EngineUI.CreateVideoMenu({video: t_json, url: atob(t_json.video.url), width: '100%', margins: {top: "1.5em", bottom: "1.5em"}}));
                            // t_info.style.display = "none";
                        }
                        else
                        {
                            /// if the texture is generated (text, etc.)
                            t_slot.style.width = "calc(100% - 0.2em)";
                            t_wrapper.appendChild(Builder.CreateJSONEditor({
                                name: "Custom Texture", json: t_json, special_types: true, allow_edit: _parameters.allow_edit, expand: "all", margins: {top: "1.5em"},
                                onvalidation: function(_json) {
                                    try {
                                        let t_newURL = "//" + JSON.stringify(_json);
                                        if(typeof(engine) !== "undefined") engine.SingleCommand(_parameters.texture_path, btoa(t_newURL));
                                    } catch(err) {console.log(err)}
                                }
                            }));
                            t_info.style.opacity = "0";
                        }
                    } catch(err) {console.log(err)}
                }
                else
                {
                    let t_image = t_wrapper.appendChild(document.createElement('img'));
                    UserMenu.LoadWebPicture(t_url).then(img_url => {
                        t_image.src = img_url;
                    })
                }
            }

            if(trigger_onchange == true && _parameters.onchange) _parameters.onchange(texture_url);

            if(ignore_engine == true) return;
            if(_parameters.texture_path && _parameters.texture_path.length > 0) EngineUI.ChangeTexture(_parameters.texture_path, texture_url);
        }

        let t_disabled = !(_parameters.allow_edit || false);
        if('ondrop' in _parameters) Builder.SetupDrop(t_slot, _parameters.ondrop);
        else
        {
            Builder.SetupDrop(t_slot, function(_text, _files, event) {
                if(t_disabled == true) return;

                /// the default behavior of the slot: if file, upload and get the id, otherwise, get the url
                if(_files && _files.length === 1) 
                {
                    if(typeof(engine) === 'undefined')
                    {
                        console.log("ERROR: engine not loaded");
                        return;
                    }
                    
                    UserMenu.UploadTexture(_files[0], "/textures").then(data => {
                        engine.RemoveTempInput();
                        if(data.failed) return;
                        t_slot.SetTexture("///" + data.id);
                    })
                }        
                else if(_text)
                {
                    try {
                        let properties = JSON.parse(_text);
                        if(properties.type && (properties.type === "image" || properties.type === "texture")) t_slot.SetTexture("///" + (properties.id || properties._id));
                    }
                    catch(e) {console.log(e)}
                }

            }, _parameters.allow_propagate);
        }

        t_slot.SetTexture(_parameters.url || "", true, false);

        t_slot.EnableEdit = function() {
            t_disabled = false;
            t_slot.classList.remove("disabled");
        }

        t_slot.DisableEdit = function() {
            t_disabled = true;
            t_slot.classList.add("disabled");
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_slot.DisableEdit();

        return t_slot
    }

    static CreatePBRMenu(_parameters)
    {
        let t_menu = document.createElement('div');
        t_menu.className = 'pbr_menu';
        t_menu.innerHTML = `
            <p></p>
        `;

        let t_label = t_menu.children[0];
        if('label' in _parameters)
        {
            t_label.textContent = _parameters.label;
            if('label_size' in _parameters) t_label.style.fontSize = _parameters.label_size;
            if('label_weight' in _parameters) t_label.style.fontWeight = _parameters.label_weight;
        }
        else
        {
            t_label.remove();
            t_label = null;
        }

        let t_color = t_menu.appendChild(EngineUI.CreateTextureSlot({
            label: "color",
            url: _parameters.textures.diffuse ? atob(_parameters.textures.diffuse) : "",
            texture_path: _parameters.path ? _parameters.path + ".diffuse" : null,
            texture_type: "color",
            allow_edit: _parameters.allow_edit || false,
            allow_propagate: true,
            onchange: function(new_url) {
                _parameters.textures.diffuse = btoa(new_url);
                if(_parameters.onchange) _parameters.onchange({diffuse: btoa(new_url)});
            }
        }));

        let t_normal = t_menu.appendChild(EngineUI.CreateTextureSlot({
            label: "normal",
            url: _parameters.textures.normal ? atob(_parameters.textures.normal) : "",
            texture_path: _parameters.path ? _parameters.path + ".normal" : null,
            texture_type: "normal",
            allow_edit: _parameters.allow_edit || false,
            allow_propagate: true,
            onchange: function(new_url) {
                _parameters.textures.normal = btoa(new_url);
                if(_parameters.onchange) _parameters.onchange({normal: btoa(new_url)});
            }
        }));

        let t_material = t_menu.appendChild(EngineUI.CreateTextureSlot({
            label: "material",
            url: _parameters.textures.material ? atob(_parameters.textures.material) : "",
            texture_path: _parameters.path ? _parameters.path + ".material" : null,
            texture_type: "material",
            allow_edit: _parameters.allow_edit || false,
            allow_propagate: true,
            onchange: function(new_url) {
                _parameters.textures.material = btoa(new_url);
                if(_parameters.onchange) _parameters.onchange({material: btoa(new_url)});
            }
        }));

        let t_disabled = !(_parameters.allow_edit || false);
        Builder.SetupDrop(t_menu, function(_text, _files, event) {
            /// Default drop behavior: fetch material id and info, then apply color, normal and material textures
            if(t_disabled == true) return;
        
            let t_properties = null;
            try { t_properties = JSON.parse(_text); }
            catch(err) {
                console.log(err);
                return;
            }

            if(t_properties.type === "material")
            {
                /// get info about the material; namely the url of the textures then assign
                KipAPI.RequestResourceInfo(t_properties.id || t_properties._id).then(_data => {
                    try { t_properties = JSON.parse(atob(_data.properties)); }
                    catch(e) {
                        console.log(_data);
                        return;
                    }
            
                    if(t_properties.texture.PBR)
                    {
                        let PBR = t_properties.texture.PBR;
                        let t_changes = {};
                        if('color' in PBR && PBR.color.length > 0)
                        {
                            t_color.SetTexture(PBR.color.replace(".dat", ""), false, false);
                            _parameters.textures.diffuse = btoa(PBR.color.replace(".dat", ""));
                            t_changes.diffuse = btoa(PBR.color.replace(".dat", ""));
                        }
                        if('normal' in PBR && PBR.normal.length > 0)
                        {
                            t_normal.SetTexture(PBR.normal.replace(".dat", ""), false, false);
                            _parameters.textures.normal = btoa(PBR.normal.replace(".dat", ""));
                            t_changes.normal = btoa(PBR.normal.replace(".dat", ""));
                        }
                        if('material' in PBR && PBR.material.length > 0)
                        {
                            t_material.SetTexture(PBR.material.replace(".dat", ""), false, false);
                            _parameters.textures.material = btoa(PBR.material.replace(".dat", ""));
                            t_changes.material = btoa(PBR.material.replace(".dat", ""));
                        }
                        if(_parameters.onchange) _parameters.onchange(t_changes);
                    }
                })
            }
        });

        t_menu.DisableEdit = function() {
            t_disabled = true;
            t_color.DisableEdit();
            t_normal.DisableEdit();
            t_material.DisableEdit();
        }

        t_menu.EnableEdit = function() {
            t_disabled = false;
            t_color.EnableEdit();
            t_normal.EnableEdit();
            t_material.EnableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();

        return t_menu;
    }

    static CreateMaterialMenu(_parameters)
    {
        let t_material = _parameters.material;
        let material_path = _parameters.object_path ? _parameters.object_path + ".mesh.materials." + (_parameters.material_index || 0) : null;
        // console.log(t_material)

        let t_textureLoaded = false;
        function LoadTextures()
        {
            if(!t_material.textures || t_textureLoaded == true) return;
            t_textureLoaded = true;

            t_menu.AppendBottom(EngineUI.CreatePBRMenu({
                label: "Material Textures:",
                label_size: "1.2em",
                label_weight: 500,
                textures: t_material.textures,
                path: material_path,
                allow_edit: _parameters.allow_edit || false
            }));
        }


        let t_menu;
        if('collapse' in _parameters && _parameters.collapse == true)
        {
            t_menu = Builder.CreateCollapseMenu({
                style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: false, show_button: true,
                onexpand: function(_menu) {
                    /// load the texture thumbnails in the menu
                    LoadTextures();
                }
            });
        }
        else
        {
            t_menu = Builder.CreateBox({width: "100%", style: _parameters.style});
            t_menu.AppendTop = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
            t_menu.AppendBottom = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
        }


        t_menu.AppendTop(Builder.CreateTextBox({text: "Material " + _parameters.material_index || "", align: "center", size: "1.2em", weight: 600}));

        let t_colorField = t_menu.AppendBottom(Builder.CreateRGBInput({
            label: 'material color', value: t_material.color, label_weight: 500, width: "100%", margin: "0.25em", disable: !(_parameters.allow_edit || false),
            onchange: function(_rgb) {
                t_material.color = _rgb;
                if(material_path) EngineUI.ChangeColor(material_path, _rgb);
            }
        }))

        let t_table = t_menu.AppendBottom(Builder.CreatePairTable({
            // title: "Parameters",
            title_size: "1.2em",
            width: "100%",
            left_width: "45%", right_width: "55%",
            left_align: "left", right_align: "right",
            style: "shadow rounded",
            margin: "0.5em"
        }));
        let t_transparencyField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "transparency", margins: "0.125em", weight: 500 }),
            Builder.CreateRangeInput({
                width: "100%", value: t_material.transparency, min: 0.0, max: 1.0, step: 0.01,
                wheel_input: 0.1,
                drag_input: 0.01,
                hide_digits: false, digit_width: "1.5em", margins: "0.125em",
                onchange_func: function(_val, _range) {
                    t_material.transparency = _val;
                    if(material_path) engine.SingleCommand(material_path + ".transparency", _val);
                }
            })
        );
        let t_roughnessField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "roughness", margins: "0.125em", weight: 500 }),
            Builder.CreateRangeInput({
                width: "100%", value: t_material.roughness, min: 0.0, max: 1.0, step: 0.01,
                wheel_input: 0.1,
                drag_input: 0.01,    
                hide_digits: false, digit_width: "1.5em", margins: "0.125em", trail_color: ToolBox.HexToRGBA("#c1867eff"),
                onchange_func: function(_val, _range) {
                    t_material.roughness = _val;
                    if(material_path) engine.SingleCommand(material_path + ".roughness", _val);
                }
            })
        );
        let t_metallicnessField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "metallicness", margins: "0.125em", weight: 500 }),
            Builder.CreateRangeInput({
                width: "100%", value: t_material.metallicness, min: 0.0, max: 1.0, step: 0.01,
                wheel_input: 0.1,
                drag_input: 0.01,    
                hide_digits: false, digit_width: "1.5em", margins: "0.125em", trail_color: ToolBox.HexToRGBA("#b2b8d4ff"),
                onchange_func: function(_val, _range) {
                    t_material.metallicness = _val;
                    if(material_path) engine.SingleCommand(material_path + ".metallicness", _val);
                }
            })
        );
        let t_brightnessField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "brightness", margins: "0.125em", weight: 500 }),
            Builder.CreateRangeInput({
                width: "100%", value: t_material.brightness, min: 0.0, max: 25.0,
                wheel_input: 0.1,
                drag_input: 0.01,    
                hide_digits: false, exponent: 3.0, digit_width: "1.5em", margins: "0.125em", trail_color: ToolBox.HexToRGBA("#ffe9a0ff"),
                onchange_func: function(_val, _range) {
                    t_material.brightness = _val;
                    if(material_path) engine.SingleCommand(material_path + ".brightness", _val);
                }
            })
        );
        let t_scaleField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "texture scale", margins: "0.125em", weight: 500 }),
            Builder.CreateRangeInput({
                width: "100%", value: t_material.textureScale, min: 0.01, max: 10.0, step: 0.01,
                wheel_input: 0.1,
                drag_input: 0.01,    
                hide_digits: false, digit_width: "1.5em", margins: "0.125em", trail_color: ToolBox.HexToRGBA("#a8c4a7ff"),
                onchange_func: function(_val, _range) {
                    t_material.textureScale = _val;
                    if(material_path) engine.SingleCommand(material_path + ".texture_scale", _val);
                }
            })
        );

        let t_shaderList = EngineUI.GetShaderList();
        let t_options = [];
        for(let i = 0; i < t_shaderList.length; i++) t_options.push({text: t_shaderList[i].name, value: t_shaderList[i].URL});

        let t_shaderField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "Type", margins: "0.25em", weight: 500 }),
            Builder.CreateSelector({
                size: "1.0em",
                options: t_options,
                value: t_material.shader,
                align: "spread",
                onselect: function(_value) {
                    t_material.shader = _value;
                    if(material_path) engine.SingleCommand(material_path + ".shader", _value);
                }
            })
        );

        let t_doubleSideField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "Double-Sided", margins: "0.25em", weight: 500, nowrap: true }),
            Builder.CreateToggleButton({
                value: t_material.doubleSided,
                align: "center",
                onchange: function(_val) {
                    t_material.doubleSided = _val;
                    if(material_path) engine.SingleCommand(material_path + ".double_sided", _val);
                }
            })
        );

        let t_detilingField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "Detiling", margins: "0.25em", weight: 500, nowrap: true }),
            Builder.CreateToggleButton({
                value: t_material.detiling,
                align: "center",
                onchange: function(_val) {
                    t_material.detiling = _val;
                    if(material_path) engine.SingleCommand(material_path + ".detiling", _val);
                }
            })
        );

        if(!('collapse' in _parameters && _parameters.collapse == true)) LoadTextures();


        t_menu.DisableEdit = function() {
            t_colorField.DisableEdit();
            t_transparencyField.DisableEdit();
            t_roughnessField.DisableEdit();
            t_metallicnessField.DisableEdit();
            t_brightnessField.DisableEdit();
            t_scaleField.DisableEdit();
            t_shaderField.DisableEdit();
            t_doubleSideField.DisableEdit();
            t_detilingField.DisableEdit();
        }

        t_menu.EnableEdit = function() {
            t_colorField.EnableEdit();
            t_transparencyField.EnableEdit();
            t_roughnessField.EnableEdit();
            t_metallicnessField.EnableEdit();
            t_brightnessField.EnableEdit();
            t_scaleField.EnableEdit();
            t_shaderField.EnableEdit();
            t_doubleSideField.EnableEdit();
            t_detilingField.EnableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();

        return t_menu;
    }

    static CreatePhysicsMenu(_parameters)
    {
        let t_mesh = _parameters.mesh;
        let t_meshPath = _parameters.object_path ? _parameters.object_path + ".mesh" : null;

        let t_menu;
        if('collapse' in _parameters && _parameters.collapse == true)
        {
            t_menu = Builder.CreateCollapseMenu({style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: false, show_button: true});
        }
        else
        {
            t_menu = Builder.CreateBox({width: "100%", style: _parameters.style});
            t_menu.AppendTop = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
            t_menu.AppendBottom = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
        }

        t_menu.AppendTop(Builder.CreateTextBox({text: "Physics", align: "center", size: "1.2em", weight: 600}));

        let t_table = t_menu.AppendBottom(Builder.CreatePairTable({
            width: "100%",
            left_width: "40%", right_width: "60%",
            left_align: "left", right_align: "right",
            style: "shadow rounded",
            margin: "0.5em"
        }));
        let t_massField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "Mass", margins: "0.25em", weight: 500 }),
            Builder.CreateTextBox({ text: t_mesh.mass, margins: "0.25em" })
        );
        let t_typeField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "Type", margins: "0.25em", weight: 500 }),
            Builder.CreateSelector({
                options: [
                    {text: "solid", value: "solid"},
                    {text: "none", value: "none"},
                    {text: "liquid", value: "liquid"},
                ],
                value: t_mesh.physics,
                align: "spread",
                onselect: function(_value) {
                    t_mesh.physics = _value;
                    if(t_meshPath) EngineUI.ChangeMeshPhysics(t_meshPath, _value);
                }
            })
        );
        let t_densityField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "Density", margins: "0.25em", weight: 500 }),
            Builder.CreateRangeInput({
                width: "100%", value: t_mesh.density, min: 10.0, max: 10000.0, step: 10.0, exponent: 5,
                wheel_input: 100.0,
                drag_input: 10.0,    
                hide_digits: false, digit_width: "2.5em", trail_color: ToolBox.HexToRGBA("#5d4848ff"),
                onchange_func: function(_val, _range) {
                    if(t_meshPath)
                    {
                        let t_mass = EngineUI.ChangeMeshDensity(t_meshPath, _val);
                        t_massField.SetText(t_mass);
                        t_mesh.density = _val;
                        t_mesh.mass = t_mass;
                    }
                    else
                    {
                        let t_ratio = _val / t_mesh.density;
                        let t_mass = t_mesh.mass * t_ratio * t_ratio * t_ratio;
                        t_massField.SetText(t_mass);
                        t_mesh.mass = t_mass;
                        t_mesh.density = _val;
                    }
                }
            })
        );
        let t_corField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "Bounciness", margins: "0.25em", weight: 500 }),
            Builder.CreateRangeInput({
                width: "100%", value: t_mesh.COR, min: 0.01, max: 1.0, step: 0.01,
                wheel_input: 0.1,
                drag_input: 0.01,    
                hide_digits: false, digit_width: "2.5em", trail_color: ToolBox.HexToRGBA("#ffb560ff"),
                onchange_func: function(_val, _range) {
                    t_mesh.COR = _val;
                    if(t_meshPath) EngineUI.ChangeMeshBounciness(t_meshPath, _val);
                }
            })
        );
        let t_frictionField = t_table.AppendRow(
            Builder.CreateTextBox({ text: "Friction", margins: "0.25em", weight: 500 }),
            Builder.CreateRangeInput({
                width: "100%", value: t_mesh.friction, min: 0.01, max: 1.0, step: 0.01,
                wheel_input: 0.1,
                drag_input: 0.01,    
                hide_digits: false, digit_width: "2.5em", trail_color: ToolBox.HexToRGBA("#da2347ff"),
                onchange_func: function(_val, _range) {
                    t_mesh.friction = _val;
                    if(t_meshPath) EngineUI.ChangeMeshFriction(t_meshPath, _val);
                }
            })
        );

        t_menu.DisableEdit = function() {
            t_typeField.DisableEdit();
            t_densityField.DisableEdit();
            t_corField.DisableEdit();
            t_frictionField.DisableEdit();
        }

        t_menu.EnableEdit = function() {
            t_typeField.EnableEdit();
            t_densityField.EnableEdit();
            t_corField.EnableEdit();
            t_frictionField.EnableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();

        return t_menu;
    }

    static CreateUserThumbnail(_parameters)
    {
        let t_thumbnail = document.createElement('div');
        t_thumbnail.className = 'user_thumbnail';
        t_thumbnail.innerHTML = `
        <p></p>
        <div class='wrapper'>
                <img src='/web/images/default_profile.png'>
                <p></p>
            </div>
        `;

        let t_wrapper = t_thumbnail.children[1];
        if(_parameters.user_id)
        {
            UserMenu.LoadUserPicture(_parameters.user_id, "profilepicture").then(img_url => {
                if(img_url) t_wrapper.children[0].src = img_url;
            })
        }
        if(_parameters.user_name)
        {
            t_wrapper.children[1].textContent = _parameters.user_name;
            t_thumbnail.children[0].textContent = _parameters.user_name;
        }
        else
        {
            t_wrapper.children[1].remove();
            t_thumbnail.children[0].remove();
        }

        if("position" in _parameters) Builder.SetPosition(t_thumbnail, _parameters.position);
        if("onclick" in _parameters)
        {
            t_wrapper.onclick = function(ev) {
                Builder.StopPropagation(ev);
                _parameters.onclick(ev);
            }
            t_wrapper.style.cursor = "pointer";
        }
        if("max_width" in _parameters)
        {
            t_thumbnail.style.maxWidth = _parameters.max_width;
        }
        if(_parameters.size) t_thumbnail.style.fontSize = _parameters.size;
        if(_parameters.width) t_thumbnail.style.width = _parameters.width;
        if(_parameters.height) t_thumbnail.style.height = _parameters.height;
        if(_parameters.style) Builder.ApplyStyles(t_thumbnail, _parameters.style);

        return t_thumbnail;
    }

    static CreateUserCard(_parameters, backside_element)
    {
        let t_card = document.createElement('div');
        t_card.className = 'user_card';
        t_card.innerHTML = `
            <div class='landscape'>
                <img crossorigin='anonymous' loading='lazy' src='/web/images/default_landscape_2.webp'>
            </div>
            <div class='user'>
                <img crossorigin='anonymous' loading='lazy' src='/web/images/default_profile.png'>
                <div class='name'>
                    <p></p>
                </div>
            </div>
            <div class='corner'></div>
        `;

        let t_landscape = t_card.children[0];
        let t_user = t_card.children[1];
        let t_corner = t_card.children[2];

        if(_parameters.user_id)
        {
            UserMenu.LoadUserPicture(_parameters.user_id, "profilelandscape").then((img_url) => {
                if(img_url) t_landscape.children[0].src = img_url;
            });
            UserMenu.LoadUserPicture(_parameters.user_id, "profilepicture").then(img_url => {
                if(img_url) t_user.children[0].src = img_url;
            })
        }

        if(_parameters.user_name) t_user.children[1].children[0].textContent = _parameters.user_name;

        if(_parameters.corner_info)
        {
            let t_html = ``;
            for(let i = 0; i < _parameters.corner_info.length; i++)
            {
                let temp = _parameters.corner_info[i];
                if('text' in temp) t_html += `<p>` + temp.text + `</p>`;
                if(temp.image) t_html += `<img src='` + temp.image + `'>`;
            }
            t_corner.innerHTML = t_html;
        }
        else t_corner.remove();

        if(_parameters.width) t_card.style.width = _parameters.width;
        if(_parameters.height) t_card.style.height = _parameters.height;
        if(_parameters.size) t_card.style.fontSize = _parameters.size;
        if(_parameters.margin) t_card.style.margin = _parameters.margin;
        if(_parameters.shadow) t_card.style.boxShadow = "0 0.5em 1em -0.5em black";

        if(backside_element)
        {
            t_card.classList.add("allow_flip");
            t_card.children[1].onclick = function(event) {
                event.preventDefault();
                event.stopPropagation();
                t_card.classList.toggle("flip");
            }

            let t_backside = document.createElement('div');
            t_backside.className = 'backside';
            t_backside.appendChild(backside_element);
            t_backside.onclick = function() {
                event.preventDefault();
                event.stopPropagation();
                t_card.classList.toggle("flip");
            }
            t_card.appendChild(t_backside);
        }

        if(_parameters.onleftclick)
        {
            t_card.style.cursor = "pointer";
            t_card.onclick = function() {
                _parameters.onleftclick(_parameters.resource);
            }
        }

        if(_parameters.onrightclick)
        {
            t_card.oncontextmenu = function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                _parameters.onrightclick(_parameters.resource, {x: ev.pageX, y: ev.pageY});
            }
        }

        return t_card;
    }

    static ChangeColor(_path, _rgb)
    {
        engine.SingleCommand(_path + ".color", _rgb);
    }

    static ChangeTexture(texture_path, _url = "")
    {
        engine.SingleCommand(texture_path, _url.length > 0 ? btoa(_url) : "");
    }

    static ChangeMeshPhysics(mesh_path, _type)
    {
        engine.SingleCommand(mesh_path + ".physics.type", _type);
    }

    static ChangeMeshDensity(mesh_path, _density)
    {
        let res = engine.SingleCommand(mesh_path + ".physics.density", _density);
        return res.mass;
    }

    static ChangeMeshBounciness(mesh_path, _bounciness)
    {
        engine.SingleCommand(mesh_path + ".physics.COR", _bounciness);
    }

    static ChangeMeshFriction(mesh_path, _friction)
    {
        engine.SingleCommand(mesh_path + ".physics.friction", _friction);
    }

    static async DeleteObject(obj_path)
    {
        let t_confirm = await Builder.CreateConfirmationBox({
            text: 'This object will be deleted. Are you sure?'
        })
        if(!t_confirm || t_confirm == false) return;

        engine.SingleCommand(obj_path + ".delete");
        engine.ClearRightMenu();
    }


    static ShowMetaAssetMenu(obj_path, folder_path = "/models")
    {
        let t_obj = engine.SingleCommand(obj_path + ".json", "no_id");

        let t_menu = Builder.CreateFloatingBox({
            style: "white_board shadow",
            min_width: "20em"
        });
    
        t_menu.AppendElement(Builder.CreateTextBox({
            text: "Save Model",
            size: "1.5em",
            weight: 500,
            margin: "1em",
            align: "center"
        }));
    
        t_menu.AppendElement(Builder.CreateTextBox({
            text: "title:",
            size: "1.3em",
            weight: 500,
            margin: "0.25em",
            align: "center"
        }));
    
        let t_input = t_menu.AppendElement(Builder.CreateTextInput({
            value: t_obj.name || "",
            placeholder: "write model name here",
            text_align: "center",
            size: "1.1em",
            width: "15em",
            margin: "0.25em",
            align: "center",
            no_button: true,
            onenter: function(_text) {
                SaveMetaAsset(_text);
            }
        }));
    
        t_menu.AppendElement(Builder.CreateHorizontalList({
                margin: "0.5em",
                align: "center"
            },[
                Builder.CreatePressButton({
                    text: "OK",
                    size: "1.2em",
                    weight: 500,
                    margin: "0.5em",
                    onclick: function() {
                        SaveMetaAsset(t_input.GetValue());
                    }
                }),
                Builder.CreatePressButton({
                    text: "Cancel",
                    size: "1.2em",
                    weight: 500,
                    margin: "0.5em",
                    onclick: function() {
                        t_menu.remove();
                    }
                })
            ]
        ))
    
        t_input.Focus();

        async function SaveMetaAsset(obj_name)
        {
            if(obj_name.length == 0) return;
            let t_uploadName = ToolBox.FormatFilename(obj_name)

            let t_filenameOK = await UserMenu.CheckFilename(folder_path, t_uploadName, "mesh");
            if(t_filenameOK == false) return;
        
            /// remove unimportant data
            if(t_obj.id) t_obj.id = null;
            if(t_obj.position) t_obj.position = null;
            if(t_obj.rotation) t_obj.rotation = null;
            if(t_obj.scale) t_obj.scale = null;
    
            let properties = {
                model: ToolBox.RemoveNULLs(t_obj)
            }
            let res = await KipAPI.SubmitResource(folder_path, t_uploadName, obj_name, "model", properties, true);
    
            let url = "///" + res.id;
            engine.SingleCommand(obj_path + ".force_url", btoa(url));

            t_menu.remove();
        }
    }

    static GrabObject(obj_path)
    {
        engine.SingleCommand(obj_path + ".grab", true);
        engine.HideRightMenu();
    }

    static DuplicateObject(obj_path)
    {
        var obj = engine.SingleCommand(obj_path + ".duplicate");
        obj.position[2] += 0.1;
        engine.SingleCommand(obj_path + ".position", obj.position);
        engine.SelectObject(obj_path);
    }

    static Freeze(obj_path)
    {
        engine.SingleCommand(obj_path + ".passive", true);
        engine.SingleCommand(obj_path + ".grab", false);
    }

    static UnFreeze(obj_path)
    {
        engine.SingleCommand(obj_path + ".passive", false);
    }

    static UnlockObject(obj_path)
    {
        engine.SingleCommand(obj_path + ".unlock");
        engine.UnlockRightMenu();
    }

    static UngroupObject(obj_path)
    {
        let res = engine.SingleCommand(obj_path + ".ungroup", "select");
        return res;
        // DisplayGroupMenu(res, true);
    }

    static ApplyRotation(obj_path)
    {
        engine.SingleCommand(obj_path + ".apply", "rotation");
        engine.SingleCommand("controls.selection.absolute");
    }

    static CreateQuickActionMenu(_object)
    {
        let t_frozen = _object.passive || false;

        let t_buttons = [
            Builder.CreatePressButton({
                before_image: "/web/images/grab_icon.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "grab",
                onclick: function() {
                    EngineUI.GrabObject(_object.object_path);
                }
            }),
            Builder.CreatePressButton({
                before_image: "/web/images/duplicate_icon.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "duplicate",
                onclick: function() {
                    EngineUI.DuplicateObject(_object.object_path);
                }
            }),
            Builder.CreatePressButton({
                before_image: "/web/images/delete_icon.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "delete object",
                onclick: function() {
                    EngineUI.DeleteObject(_object.object_path);
                }
            }),
            Builder.CreatePressButton({
                before_image: "/web/images/ground_icon.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "freeze",
                toggle: t_frozen,
                onclick: function(ev, _button) {
                    _button.Toggle();
                    if(t_frozen == true)
                    {
                        EngineUI.UnFreeze(_object.object_path);
                        t_frozen = false;
                    }
                    else
                    {
                        EngineUI.Freeze(_object.object_path);
                        t_frozen = true;
                    }
                }
            })
        ];

        if(_object.childs && _object.childs.length > 0)
        {
            t_buttons.push(Builder.CreatePressButton({
                before_image: "/web/images/ungroup_icon.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "ungroup",
                onclick: function() {
                    let group_info = EngineUI.UngroupObject(_object.object_path);
                    engine.ClearRightMenu();
                    engine.OpenRightMenu(EngineUI.CreateGroupMenu(group_info));
                }
            }));

            if(!_object.meshObject && !_object.mesh)
            {
                t_buttons.push(Builder.CreatePressButton({
                    before_image: "/web/images/gizmo_icon.png",
                    size: "1.25em",
                    height: "5em",
                    width: "5em",
                    margin: "0.25em",
                    tip: "apply rotation",
                    onclick: function() {
                        EngineUI.ApplyRotation(_object.object_path);
                    }
                }));
            }    
        }
        
        if(_object.url && _object.url.length > 0)
        {
            let t_unlockButton = Builder.CreatePressButton({
                before_image: "/web/images/unlock_icon_2.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "edit object",
                onclick: function() {
                    EngineUI.UnlockObject(_object.object_path);

                    /// change the unlock button into a model save button
                    t_unlockButton.SetImage("/web/images/save_icon.png");
                    t_unlockButton.SetTip("save model");
                    t_unlockButton.SetClickFunction(function() {
                        EngineUI.ShowMetaAssetMenu(_object.object_path);
                    })
                }
            });
            t_buttons.push(t_unlockButton);
        }
        else
        {
            t_buttons.push(Builder.CreatePressButton({
                before_image: "/web/images/save_icon.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "save model",
                onclick: function() {
                    EngineUI.ShowMetaAssetMenu(_object.object_path);
                }
            }));
        }
    
        
        return Builder.CreateHorizontalList({
                width: "100%",
                height: "2.5em",
                allow_drag: true,
                margins: {top: "0.25em", bottom: "0.25em"}
            },
            t_buttons
        )
    }

    static CreateSelectionQuickActionMenu(selection_list)
    {
        let passiveCount = 0;
        let activeCount = 0;
        for(var i = 0; i < selection_list.length; i++)
        {
            if(selection_list[i].passive) passiveCount++;
            else activeCount++;
        }
    
        let groupIsPassive = null;
        if(passiveCount == 0) groupIsPassive = false;
        else if(activeCount == 0) groupIsPassive = true;

        let t_buttons = [
            Builder.CreatePressButton({
                before_image: "/web/images/duplicate_icon.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "duplicate selection",
                onclick: function() {
                    let list = engine.SingleCommand("controls.selection.duplicate");
                }
            }),
            Builder.CreatePressButton({
                before_image: "/web/images/delete_icon.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "delete selection",
                onclick: function() {
                    engine.SingleCommand("controls.selection.delete");
                }
            }),
            Builder.CreatePushButton({
                pressed: groupIsPassive,
                before_image: "/web/images/ground_icon.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "freeze",
                onclick: function(_value, ev, _button) {
                    engine.SingleCommand("controls.selection.passive", _value);
                }
            }),
            Builder.CreatePressButton({
                before_image: "/web/images/group_icon.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "group selection",
                onclick: function(ev, _button) {
                    let t_newobj = engine.SingleCommand("controls.selection.group");

                    /// add the sub-menus to the right menu and open it
                    engine.ClearRightMenu();
                    engine.OpenRightMenu(EngineUI.CreateObjectMenu(t_newobj));
                }
            }),
            Builder.CreatePressButton({
                before_image: "/web/images/gizmo_icon.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "apply rotation",
                onclick: function(ev, _button) {
                    engine.SingleCommand("controls.selection.absolute");
                }
            })
        ];

        if(selection_list.length == 2)
        {
            t_buttons.push(Builder.CreatePressButton({
                before_image: "/web/images/link_icon.png",
                size: "1.25em",
                height: "5em",
                width: "5em",
                margin: "0.25em",
                tip: "bind selection",
                onclick: function(ev, _button) {
                    let t_binding = engine.SingleCommand("controls.selection.bind", {type: "hinge_joint"});
                    DisplayObjectBinding(t_binding.path_a, t_binding.id);
                }
            }));
        }
        
        return Builder.CreateHorizontalList({
                width: "100%",
                height: "2.5em",
                multiple_lines: true,
                horizontal_align: "center",
                margins: {top: "0.25em", bottom: "0.25em"}
            },
            t_buttons
        )
    }

    static CreateObjectDescription(_object)
    {
        let t_column = Builder.CreateColumn({
            width: "100%",
            height: "100%",
            scrollbar: true,
            overflow_x: "hidden"
        });

        t_column.appendChild(Builder.CreateTextBox({ text: "Description", margins: "0.25em", size: "1.2em", weight: 500, align: 'center' }));

        let t_description = "";
        if(_object.description && _object.description.length > 0) try { t_description = atob(_object.description); } catch(e) {console.log(e)};
        t_column.appendChild(Builder.CreateTextBox({ text: t_description, margins: "0.25em", size: "1em", weight: 400, align: 'left' }));

        return t_column;
    }

    static CreateObjectMenu(_object)
    {
        let t_menu = Builder.CreateColumn({
            width: "100%",
            height: "100%",
            scrollbar: true,
            overflow_x: "hidden"
        });

        t_menu.appendChild(Builder.CreateTextBox({
            text: "Object Properties",
            size:"1.3em",
            weight: 600,
            align: "left",
            margin: "0.75em"
        }))

        /// node interface at the top
        let t_interface = t_menu.appendChild(Builder.CreateNodeInterface({
            type: "object", data: _object, cursor_menu: objectCursorMenu, lock: false, allow_edit: true, title: null, height: "15em", allow_edit: false,
            onnodeselect: function(_menu) {
                t_menu.UpdateDetails(_menu);
            }
        }));
        /// wait a bit for all the elements to be organized
        setTimeout(function() {
            t_interface.Ready();
        }, 10);

        /// quick action menu in the middle
        t_menu.appendChild(EngineUI.CreateQuickActionMenu(_object));

        /// properties menu at the bottom
        let t_details = t_menu.appendChild(Builder.CreateColumn({
            width: "100%",
            height: "max-content"
        }));
        t_details.appendChild(EngineUI.CreatePartMenu({object: _object, allow_edit: true, object_path: _object.object_path}));

        /// instead of showing the menu inside of the canvas, the menu is added to t_details
        t_menu.UpdateDetails = function(new_menu) {
            t_details.Clear();
            if(new_menu) t_details.appendChild(new_menu);
        }

        /// define EnableEdit at the container level (triggers EnableEdits on all sub-menus)
        t_menu.EnableEdit = function() {
            t_interface.EnableEdit();
            /// we blindly execute with all children, as the content of t_details may change when clicking on the nodes
            for(let i = 0; i < t_details.children.length; i++) if(t_details.children[i].EnableEdit) t_details.children[i].EnableEdit();
        }

        /// if the object is not associated with a url, allow editing
        if(!_object.url || _object.url.length == 0) t_menu.EnableEdit();

        t_menu.interface = t_interface;

        return t_menu;
    }

    static CreateGroupMenu(_list)
    {
        let t_menu = Builder.CreateColumn({
            width: "100%",
            height: "100%",
            scrollbar: true,
            overflow_x: "hidden"
        });

        t_menu.appendChild(Builder.CreateTextBox({
            text: "Group Properties",
            size:"1.3em",
            weight: 600,
            align: "left",
            margin: "0.75em"
        }))

        /// quick action menu in the middle
        t_menu.appendChild(EngineUI.CreateSelectionQuickActionMenu(_list));

        /// instead of showing the menu inside of the canvas, the menu is added to t_details
        t_menu.UpdateDetails = function(new_menu) {
            t_details.Clear();
            if(new_menu) t_details.appendChild(new_menu);
        }

        /// define EnableEdit at the container level (triggers EnableEdits on all sub-menus)
        t_menu.EnableEdit = function() {
            /// we blindly execute with all children, as the content of t_details may change when clicking on the nodes
            for(let i = 0; i < t_details.children.length; i++) if(t_details.children[i].EnableEdit) t_details.children[i].EnableEdit();
        }

        return t_menu;
    }

    static CreateCubemapMenu(_parameters)
    {
        let t_menu = Builder.CreateList({
            width: "100%"
        });

        if('label' in _parameters)
        {
            t_menu.appendChild(Builder.CreateTextBox({
                text: _parameters.label,
                size: _parameters.label_size,
                weight: _parameters.label_weight,
                width: "100%",
                text_align: "center",
                margin: "0.5em"
            }))
        }

        let t_px = t_menu.appendChild(EngineUI.CreateTextureSlot({
            label: "PX",
            url: _parameters.nx_url || "",
            texture_path: _parameters.path ? _parameters.path + ".px" : null,
            texture_type: "px",
            allow_edit: _parameters.allow_edit || false,
            allow_propagate: true
        }));
        let t_py = t_menu.appendChild(EngineUI.CreateTextureSlot({
            label: "PY",
            url: _parameters.py_url || "",
            texture_path: _parameters.path ? _parameters.path + ".py" : null,
            texture_type: "py",
            allow_edit: _parameters.allow_edit || false,
            allow_propagate: true
        }));
        let t_pz = t_menu.appendChild(EngineUI.CreateTextureSlot({
            label: "PZ",
            url: _parameters.pz_url || "",
            texture_path: _parameters.path ? _parameters.path + ".pz" : null,
            texture_type: "pz",
            allow_edit: _parameters.allow_edit || false,
            allow_propagate: true
        }));

        let t_nx = t_menu.appendChild(EngineUI.CreateTextureSlot({
            label: "NX",
            url: _parameters.nx_url || "",
            texture_path: _parameters.path ? _parameters.path + ".nx" : null,
            texture_type: "nx",
            allow_edit: _parameters.allow_edit || false,
            allow_propagate: true
        }));
        let t_ny = t_menu.appendChild(EngineUI.CreateTextureSlot({
            label: "NY",
            url: _parameters.ny_url || "",
            texture_path: _parameters.path ? _parameters.path + ".ny" : null,
            texture_type: "ny",
            allow_edit: _parameters.allow_edit || false,
            allow_propagate: true
        }));
        let t_nz = t_menu.appendChild(EngineUI.CreateTextureSlot({
            label: "NZ",
            url: _parameters.nz_url || "",
            texture_path: _parameters.path ? _parameters.path + ".nz" : null,
            texture_type: "nz",
            allow_edit: _parameters.allow_edit || false,
            allow_propagate: true
        }));


        let t_disabled = !(_parameters.allow_edit || false);
        Builder.SetupDrop(t_menu, function(_text, _files, event) {
            /// Default drop behavior: fetch material id and info, then apply color, normal and material textures
            if(t_disabled == true) return;
        
            let t_properties = null;
            try { t_properties = JSON.parse(_text); }
            catch(err) {
                console.log(err);
                return;
            }

            if(t_properties.type === "sky")
            {
                /// get info about the material; namely the url of the textures then assign
                KipAPI.RequestResourceInfo(t_properties.id || t_properties._id).then(_data => {
                    try { t_properties = JSON.parse(atob(_data.properties)); }
                    catch(e) {
                        console.log(_data);
                        return;
                    }
            
                    if(t_properties.skymap.px) t_px.SetTexture(t_properties.skymap.px);
                    if(t_properties.skymap.nx) t_nx.SetTexture(t_properties.skymap.nx);
                    if(t_properties.skymap.py) t_py.SetTexture(t_properties.skymap.py);
                    if(t_properties.skymap.ny) t_ny.SetTexture(t_properties.skymap.ny);
                    if(t_properties.skymap.pz) t_pz.SetTexture(t_properties.skymap.pz);
                    if(t_properties.skymap.nz) t_nz.SetTexture(t_properties.skymap.nz);
                })
            }
        });

        t_menu.DisableEdit = function() {
            t_disabled = true;
            t_px.DisableEdit();
            t_py.DisableEdit();
            t_pz.DisableEdit();
            t_nx.DisableEdit();
            t_ny.DisableEdit();
            t_nz.DisableEdit();
        }

        t_menu.EnableEdit = function() {
            t_disabled = false;
            t_px.EnableEdit();
            t_py.EnableEdit();
            t_pz.EnableEdit();
            t_nx.EnableEdit();
            t_ny.EnableEdit();
            t_nz.EnableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();

        return t_menu;
    }

    static SetPlayerLoop(player_path, _loop)
    {
        if(_loop == true)
        {
            engine.SingleCommand(player_path + ".loop_max", 2147483647);
            engine.SingleCommand(player_path + ".mode", "repeat");
        }
        else engine.SingleCommand(player_path + ".loop_max", 1);
    }

    static SetPlayerReversed(player_path, _backward)
    {
        engine.SingleCommand(player_path + ".reverse_play", _backward);
    }

    static PlayAnimation(player_path, _url)
    {
        engine.SingleCommand(player_path + ".play", _url ? btoa(_url) : null);
    }
    
    static async LoadAnimation(player_path, animation_url)
    {
        return await engine.SingleCommandSync(player_path + ".animation", btoa(animation_url));
    }

    static StopAnimation(player_path)
    {
        engine.SingleCommand(player_path + ".stop");
    }

    static SetAnimationLoop(player_path, _state)
    {
        engine.SingleCommand(player_path + ".loop", _state);
    }

    static SetAnimationDisplay(player_path, _state)
    {
        engine.SingleCommand(player_path + ".display", _state);
    }

    static SetAnimationSpeed(player_path, _speed)
    {
        engine.SingleCommand(player_path + ".speed", _speed);
    }


    static SetPlayerBackward(player_path, _backward)
    {
        engine.SingleCommand(player_path + ".backward", _backward);
    }

    static SetPlayerMode(player_path, _mode)
    {
        engine.SingleCommand(player_path + ".mode", _mode);
    }

    static ResumePlayer(player_path)
    {
        engine.SingleCommand(player_path + ".state", "resume");
    }

    static PausePlayer(player_path)
    {
        engine.SingleCommand(player_path + ".state", "pause");
    }

    static ResetPlayer(player_path)
    {
        engine.SingleCommand(player_path + ".reset");
    }

    static SetPlayerCursor(player_path, _cursor)
    {
        engine.SingleCommand(player_path + ".cursor", _cursor);
    }

    static MutePlayer(player_path, _mute)
    {
        engine.SingleCommand(player_path + ".mute", _mute);
    }

    static ChangeSkyColor(_rgb)
    {
        engine.SingleCommand("sky.map.color", _rgb);
    }

    static ChangeAmbientColor(_rgb)
    {
        engine.SingleCommand("sky.ambient.color", _rgb);
    }

    static ChangeAmbientStrength(_rgb)
    {
        engine.SingleCommand("sky.ambient.strength", _rgb);
    }

    static RefreshAmbientLight()
    {
        engine.SingleCommand("sky.ambient.refresh");
    }

    static SetSunlight(_val)
    {
        engine.SingleCommand("sky.sun.disable", !_val);
    }
    
    static ChangeSunlightColor(_rgb)
    {
        engine.SingleCommand("sky.sun.color", _rgb);
    }

    static ChangeSunStrength(_val)
    {
        engine.SingleCommand("sky.sun.strength", _val);
    }

    static ChangeSunAngleGround(_deg)
    {
        engine.SingleCommand("sky.sun.angle_ground", ToolBox.DegToRad(_deg));
    }

    static ChangeSunAngleX(_deg)
    {
        engine.SingleCommand("sky.sun.angle_x", ToolBox.DegToRad(_deg));
    }

    static AddLight(obj_path)
    {
        let t_light = engine.SingleCommand(obj_path + ".lights.new");
        return t_light;
    }

    static DeleteLight(light_path)
    {
        engine.SingleCommand(light_path + ".delete");
    }

    static SwitchLight(light_path, on_off)
    {
        engine.SingleCommand(light_path + ".on", on_off);
    }

    static SetLightColor(light_path, _color)
    {
        engine.SingleCommand(light_path + ".color", _color);
    }

    static SetLightRadius(light_path, _radius)
    {
        engine.SingleCommand(light_path + ".radius", _radius);
    }

    static SetLightBulbRadius(light_path, _radius)
    {
        engine.SingleCommand(light_path + ".bulb_radius", _radius);
    }

    static SetLightShadows(light_path, show_shadows)
    {
        engine.SingleCommand(light_path + ".shadows", show_shadows);
    }

    static SetLightType(light_path, _type)
    {
        engine.SingleCommand(light_path + ".type", _type);
    }

    static AddParticleEmitter(obj_path)
    {
        let t_light = engine.SingleCommand(obj_path + ".particle_emitters.new");
        return t_light;
    }

    static DeleteParticleEmitter(emitter_path)
    {
        engine.SingleCommand(emitter_path + ".delete");
    }

    static SwitchParticleEmitter(emitter_path, on_off)
    {
        engine.SingleCommand(emitter_path + ".on", on_off);
    }

    static SetParticleEmitterColor(emitter_path, _color)
    {
        engine.SingleCommand(emitter_path + ".particle.color", _color);
    }

    static AddSensor(obj_path)
    {
        let t_sensor = engine.SingleCommand(obj_path + ".sensors.new");
        return t_sensor;
    }

    static DeleteSensor(sensor_path)
    {
        engine.SingleCommand(sensor_path + ".delete");
    }

    static AddProcess(obj_path)
    {
        return engine.SingleCommand(obj_path + ".processes.new");
    }

    static DeleteProcess(process_path)
    {
        engine.SingleCommand(process_path + ".delete");
    }

    static AddVoice(obj_path)
    {
        return engine.SingleCommand(obj_path + ".voices.new");
    }

    static DeleteVoice(voice_path)
    {
        engine.SingleCommand(voice_path + ".delete");
    }

    static AddPhysicsAnimation(obj_path)
    {
        return engine.SingleCommand(obj_path + ".physics_animations.new");
    }

    static DeletePhysicsAnimation(animation_path)
    {
        engine.SingleCommand(animation_path + ".delete");
    }

    static SetVoiceVolume(voice_path, _volume)
    {
        engine.SingleCommand(voice_path + ".gain", _volume);
    }

    static SetBindingType(binding_path, _type)
    {
        engine.SingleCommand(binding_path + ".type", _type);
    }

    static GetRelativePath(_path)
    {
        return engine.SingleCommand(_path + ".relative_path");
    }

    static DisplayObjectProcess(_path)
    {
        let t_pathInfo = EngineUI.ParentPath(_path);

        let t_objMenu = DisplayObjectMenu(null, t_pathInfo.parent_path);
        let t_process = engine.SingleCommand(_path + ".json");
        let t_editor = EngineUI.CreateProcessMenu({
            process: t_process,
            allow_edit: true,
            object_path: t_pathInfo.parent_path,
            interface_element: t_objMenu.interface,
            id: t_pathInfo.id,
            style: "white_board"
        });
        t_objMenu.UpdateDetails(t_editor);
    }

    static DisplayAnimator(_path)
    {
        let t_pathInfo = EngineUI.ParentPath(_path);

        let t_objMenu = DisplayObjectMenu(null, t_pathInfo.parent_path);
        let t_animator = engine.SingleCommand(_path + ".json");
        let t_editor = EngineUI.CreateAnimationPlayerMenu({
            player: t_animator,
            object_path: t_pathInfo.parent_path,
            collapse: false,
            no_delete: true
        });
        t_objMenu.UpdateDetails(t_editor);
    }

    static DisplaySensor(_path)
    {
        let t_pathInfo = EngineUI.ParentPath(_path);

        let t_objMenu = DisplayObjectMenu(null, t_pathInfo.parent_path);
        let t_sensor = engine.SingleCommand(_path + ".json");
        let t_editor = EngineUI.CreateSensorMenu({
            sensor: t_sensor,
            allow_edit: true,
            object_path: t_pathInfo.parent_path,
            interface_element: t_objMenu.interface,
            id: t_pathInfo.id
        });
        t_objMenu.UpdateDetails(t_editor);
    }

    static DisplayVoice(_path)
    {
        let t_pathInfo = EngineUI.ParentPath(_path);

        let t_objMenu = DisplayObjectMenu(null, t_pathInfo.parent_path);
        let t_voice = engine.SingleCommand(_path + ".json");
        let t_editor = EngineUI.CreateVoiceMenu({
            voice: t_voice,
            allow_edit: true,
            object_path: t_pathInfo.parent_path,
            interface_element: t_objMenu.interface,
            id: t_pathInfo.id
        });
        t_objMenu.UpdateDetails(t_editor);
    }

    static DisplayLight(_path)
    {
        let t_pathInfo = EngineUI.ParentPath(_path);

        let t_objMenu = DisplayObjectMenu(null, t_pathInfo.parent_path);
        let t_light = engine.SingleCommand(_path + ".json");
        let t_editor = EngineUI.CreateLightMenu({
            light: t_light,
            allow_edit: true,
            object_path: t_pathInfo.parent_path,
            interface_element: t_objMenu.interface,
            id: t_pathInfo.id
        });
        t_objMenu.UpdateDetails(t_editor);
    }

    static DisplayParticleEmitter(_path)
    {
        let t_pathInfo = EngineUI.ParentPath(_path);

        let t_objMenu = DisplayObjectMenu(null, t_pathInfo.parent_path);
        let t_emitter = engine.SingleCommand(_path + ".json");
        let t_editor = EngineUI.CreateParticleEmitterMenu({
            particle_emitter: t_emitter,
            allow_edit: true,
            object_path: t_pathInfo.parent_path,
            interface_element: t_objMenu.interface,
            id: t_pathInfo.id
        });
        t_objMenu.UpdateDetails(t_editor);
    }

    static DisplayPhysicsAnimation(_path)
    {
        let t_pathInfo = EngineUI.ParentPath(_path);

        let t_objMenu = DisplayObjectMenu(null, t_pathInfo.parent_path);
        let t_animation = engine.SingleCommand(_path + ".json");
        let t_editor = EngineUI.CreatePhysicsAnimationMenu({
            animation: t_animation,
            allow_edit: true,
            object_path: t_pathInfo.parent_path,
            interface_element: t_objMenu.interface,
            id: t_pathInfo.id
        });
        t_objMenu.UpdateDetails(t_editor);
    }

    static CreateSkyMenu(_parameters)
    {
        let t_sky = _parameters.sky;
        // console.log(t_sky);

        let t_menu = Builder.CreateColumn({
            width: "100%",
            height: "100%",
            scrollbar: true,
            overflow_x: "hidden"
        });

        t_menu.appendChild(Builder.CreateTextBox({
            text: "Sky",
            size:"1.3em",
            weight: 600,
            align: "left",
            margin: "0.75em"
        }));


        /// sky properties
        let t_skyMenu = t_menu.appendChild(Builder.CreateCollapseMenu({ style: "shadow", width: "100%", margin: "0.5em", expand: true }, [], []));
        t_skyMenu.AppendTop(Builder.CreateTextBox({text: "Sky Properties", align: "center", size: "1.2em", weight: 600, margin: "0.5em"}));
        t_skyMenu.AppendBottom(Builder.CreateRGBInput({
            label: 'Sky color', value: t_sky.sky.color, label_weight: 500, width: "100%", margin: "0.25em", disable: !(_parameters.allow_edit || false),
            onchange: function(_rgb) {
                EngineUI.ChangeSkyColor(_rgb);
            }
        }));

        t_skyMenu.AppendBottom(EngineUI.CreateCubemapMenu({
            label: "Sky Maps:",
            label_size: "1.2em",
            label_weight: 500,
            px_url: t_sky.sky.skymap[0] ? atob(t_sky.sky.skymap[0]) : "",
            nx_url: t_sky.sky.skymap[1] ? atob(t_sky.sky.skymap[1]) : "",
            py_url: t_sky.sky.skymap[2] ? atob(t_sky.sky.skymap[2]) : "",
            ny_url: t_sky.sky.skymap[3] ? atob(t_sky.sky.skymap[3]) : "",
            pz_url: t_sky.sky.skymap[4] ? atob(t_sky.sky.skymap[4]) : "",
            nz_url: t_sky.sky.skymap[5] ? atob(t_sky.sky.skymap[5]) : "",
            path: 'sky.map',
            allow_edit: _parameters.allow_edit || false
        }));

        /// ambience properties
        let t_ambientMenu = t_menu.appendChild(Builder.CreateCollapseMenu({ style: "shadow", width: "100%", margin: "0.5em", expand: true }, [], []));
        t_ambientMenu.AppendTop(Builder.CreateTextBox({text: "Ambience Properties", align: "center", size: "1.2em", weight: 600, margin: "0.5em"}));
        t_ambientMenu.AppendBottom(Builder.CreateRGBInput({
            label: 'ambience color', value: t_sky.ambient.color, label_weight: 500, width: "100%", margin: "0.25em", disable: !(_parameters.allow_edit || false),
            onchange: function(_rgb) {
                EngineUI.ChangeAmbientColor(_rgb);
            }
        }));

        t_ambientMenu.AppendBottom(Builder.CreateHorizontalList({
                width: "100%"
            },
            [
                Builder.CreateTextBox({ text: "strength", margins: "0.5em", weight: 500, width: "35%" }),
                Builder.CreateRangeInput({
                    width: "65%", value: t_sky.ambient.strength, min: 0.0, max: 4.0, step: 0.02,
                    wheel_input: 0.1,
                    drag_input: 0.02,        
                    hide_digits: false, digit_width: "2.5em", trail_color: ToolBox.HexToRGBA("#ffff7aff"),
                    onchange_func: function(_val, _range) {
                        EngineUI.ChangeAmbientStrength(_val);
                    }
                })
            ]
        ))

        t_ambientMenu.AppendBottom(Builder.CreatePressButton({
            text: "Refresh Ambient Light",
            before_image: "/web/images/refresh_icon.png",
            size: "1.1em",
            margin: "0.25em",
            onclick: function() {
                EngineUI.RefreshAmbientLight();
            }
        }))


        /// sunlight properties
        let t_sunMenu = t_menu.appendChild(Builder.CreateCollapseMenu({
            style: "shadow", width: "100%", margin: "0.5em",
            expand: !t_sky.sun.night, lock: true
        }));
        t_sunMenu.AppendTop(Builder.CreateTextBox({text: "Sunlight Properties", align: "center", size: "1.2em", weight: 600, margin: "0.5em"}));
        t_sunMenu.AppendTop(Builder.CreateToggleButton({
            value: !t_sky.sun.night,
            allow_edit: _parameters.allow_edit || false,
            onchange: function(_val) {
                if(_val == true) t_sunMenu.Expand();
                else t_sunMenu.Collapse();
                EngineUI.SetSunlight(_val);
            }
        }));
        t_sunMenu.AppendBottom(Builder.CreateRGBInput({
            label: 'sunlight color', value: t_sky.sun.color, label_weight: 500, width: "100%", margin: "0.25em", disable: !(_parameters.allow_edit || false),
            onchange: function(_rgb) {
                EngineUI.ChangeSunlightColor(_rgb);
            }
        }));
        t_sunMenu.AppendBottom(Builder.CreateHorizontalList({
                width: "100%"
            },
            [
                Builder.CreateTextBox({ text: "strength", margins: "0.5em", weight: 500, width: "35%" }),
                Builder.CreateRangeInput({
                    width: "65%", value: t_sky.sun.strength, min: 0.0, max: 4.0, step: 0.02, hide_digits: false, digit_width: "2.5em", trail_color: ToolBox.HexToRGBA("#ffff7aff"),
                    onchange_func: function(_val, _range) {
                        EngineUI.ChangeSunStrength(_val);
                    }
                })
            ]
        ));
        t_sunMenu.AppendBottom(Builder.CreateTextBox({
            text: "Sun Direction",
            size: "1.1em",
            weight: 500,
            margin: "0.5em"
        }));
        t_sunMenu.AppendBottom(Builder.CreateHorizontalList({
                width: "100%"
            },
            [
                Builder.CreateTextBox({ text: "polar", margins: "0.5em", weight: 500, width: "35%" }),
                Builder.CreateRangeInput({
                    width: "65%", value: ToolBox.RadToDeg(t_sky.sun.angleToGround), min: 0.0, max: 90.0, step: 0.5,
                    wheel_input: 1.0,
                    drag_input: 0.1,        
                    hide_digits: false, digit_width: "2.5em", trail_color: ToolBox.HexToRGBA("#f34f57ff"),
                    onchange_func: function(_val, _range) {
                        EngineUI.ChangeSunAngleGround(_val);
                    }
                })
            ]
        ));
        t_sunMenu.AppendBottom(Builder.CreateHorizontalList({
                width: "100%"
            },
            [
                Builder.CreateTextBox({ text: "azimuthal", margins: "0.5em", weight: 500, width: "35%" }),
                Builder.CreateRangeInput({
                    width: "65%", value: ToolBox.RadToDeg(t_sky.sun.angleToX), min: 0.0, max: 360.0, step: 1.0,
                    wheel_input: 1.0,
                    drag_input: 0.1,
                    hide_digits: false, digit_width: "2.5em", trail_color: ToolBox.HexToRGBA("#73b774ff"),
                    onchange_func: function(_val, _range) {
                        EngineUI.ChangeSunAngleX(_val);
                    }
                })
            ]
        ));

        return t_menu;
    }

    static SpaceContentList(_parameters)
    {
        var content = engine.SingleCommand("tools.list_objects");
        content.path = "world";
        for(let _obj of content.objects) _obj.path = "world." + _obj.id;

        function ContentToHTML(_obj, _distance)
        {
            // console.log(_obj);
            if(!_obj.childs && !_obj.physics_animations && !_obj.sensors && !_obj.animators && !_obj.bindings && !_obj.voices && !_obj.processes && !_obj.lights)
            {
                let t_text = Builder.CreateTextBox({
                    text: " ◆ " + (_obj.name.length > 0 ? _obj.name : "object") + (_distance ? (" - " + _distance.toPrecision(3) + "m") : ""),
                    align: "left",
                    margin: "0.5em",
                    onclick: function() {
                        DisplayObjectMenu(null, _obj.path);
                    }
                });
                t_text.draggable = true;
                t_text.ondragstart = function(ev) { ev.dataTransfer.setData("text/plain", JSON.stringify(_obj)); }
                return t_text;
            }

            if(_obj.childs) for(let child of _obj.childs) child.path = _obj.path + "." + child.id;

            let t_loaded = false;
            let t_menu = Builder.CreateCollapseMenu({
                width: "100%",
                margin: "0.25em",
                show_button: true,
                button_size: "1.2em",
                style: "shadow",
                onexpand: function() {
                    if(t_loaded == true) return;
                    t_loaded = true;
                    /// on expand, create all children
                    try {
                        if(_obj.childs) for(let i = 0; i < _obj.childs.length; i++) t_menu.AppendBottom(ContentToHTML(_obj.childs[i]));
                    }
                    catch(e) {console.log(e)}
                },
            });


            let t_list = [];
            t_list.push(Builder.CreateTextBox({
                text: (_obj.name.length > 0 ? _obj.name : "object") + (_distance ? (" - " + _distance.toPrecision(3) + "m") : ""),
                align: "left",
                margin: "0.25em",
                onclick: !_obj.id ? null : function() {
                    DisplayObjectMenu(null, _obj.path);
                }
            }));
            t_list[0].draggable = true;
            t_list[0].ondragstart = function(ev) { ev.dataTransfer.setData("text/plain", JSON.stringify(_obj)); }

            // if(_obj.lights && _obj.lights.length > 0)
            // {
            //     t_list.push(Builder.CreatePictureFrame({
            //         image: "/web/images/light_icon.png",
            //         width: "1.5em"
            //     }))
            // }
            
            t_menu.AppendTop(Builder.CreateHorizontalList({width: "100%"}, t_list));


            if(_obj.physics_animations)
            {
                for(let _physAnim of _obj.physics_animations)
                {
                    _physAnim.path = _obj.path + ".physics_animations." + _physAnim.id;
                    let t_text = t_menu.AppendBottom(Builder.CreateTextBox({
                        text: "Phys animation - " + _physAnim.name,
                        image: "/web/images/properties_icon.png",
                        filter: "brightness(0)",
                        image_position: "before",
                        align: "left",
                        margin: "0.5em",
                        onclick: function() {
                            EngineUI.DisplayPhysicsAnimation(_physAnim.path);
                        }
                    }));

                    t_text.draggable = true;
                    t_text.ondragstart = function(ev) { ev.dataTransfer.setData("text/plain", JSON.stringify(_physAnim)); }
                }
            }

            if(_obj.animators)
            {
                for(let _anim of _obj.animators)
                {
                    /// if the object has only one animator, we handle as if the animator is unique
                    if(_obj.animators.length == 1) _anim.path = _obj.path + ".animator";
                    else _anim.path = _obj.path + ".animators." + _anim.id;

                    let t_text = t_menu.AppendBottom(Builder.CreateTextBox({
                        text: "Animation",
                        image: "/web/images/animation_icon.png",
                        filter: "brightness(0)",
                        image_position: "before",
                        align: "left",
                        margin: "0.5em",
                        onclick: function() {
                            EngineUI.DisplayAnimator(_anim.path);
                        }
                    }));

                    t_text.draggable = true;
                    t_text.ondragstart = function(ev) { ev.dataTransfer.setData("text/plain", JSON.stringify(_anim)); }
                }
            }

            if(_obj.lights)
            {
                for(let _light of _obj.lights)
                {
                    _light.path = _obj.path + ".lights." + _light.id;
                    let t_text = t_menu.AppendBottom(Builder.CreateTextBox({
                        text: "Light",
                        image: "/web/images/light_icon.png",
                        filter: "brightness(0)",
                        image_position: "before",
                        align: "left",
                        margin: "0.5em",
                        onclick: function() {
                            EngineUI.DisplayLight(_light.path);
                        }
                    }));

                    t_text.draggable = true;
                    t_text.ondragstart = function(ev) { ev.dataTransfer.setData("text/plain", JSON.stringify(_light)); }
                }
            }

            if(_obj.particle_emitters)
            {
                for(let _emitter of _obj.particle_emitters)
                {
                    _emitter.path = _obj.path + ".particle_emitters." + _emitter.id;
                    let t_text = t_menu.AppendBottom(Builder.CreateTextBox({
                        text: "Light",
                        image: "/web/images/particle_emitter_icon.png",
                        filter: "brightness(0)",
                        image_position: "before",
                        align: "left",
                        margin: "0.5em",
                        onclick: function() {
                            EngineUI.DisplayParticleEmitter(_emitter.path);
                        }
                    }));

                    t_text.draggable = true;
                    t_text.ondragstart = function(ev) { ev.dataTransfer.setData("text/plain", JSON.stringify(_emitter)); }
                }
            }

            if(_obj.processes)
            {
                for(let _process of _obj.processes)
                {
                    _process.path = _obj.path + ".processes." + _process.id;
                    let t_text = t_menu.AppendBottom(Builder.CreateTextBox({
                        text: "Process - " + _process.name,
                        image: "/web/images/process_icon.png",
                        filter: "brightness(0)",
                        image_position: "before",
                        align: "left",
                        margin: "0.5em",
                        onclick: function() {
                            EngineUI.DisplayObjectProcess(_process.path);
                        }
                    }));

                    t_text.draggable = true;
                    t_text.ondragstart = function(ev) { ev.dataTransfer.setData("text/plain", JSON.stringify(_process)); }
                }
            }

            if(_obj.voices)
            {
                for(let _voice of _obj.voices)
                {
                    _voice.path = _obj.path + ".voices." + _voice.id;
                    let t_text = t_menu.AppendBottom(Builder.CreateTextBox({
                        text: "Speaker - " + _voice.name,
                        image: "/web/images/audio_icon.png",
                        filter: "brightness(0)",
                        image_position: "before",
                        align: "left",
                        margin: "0.5em",
                        onclick: function() {
                            EngineUI.DisplayVoice(_voice.path);
                        }
                    }));

                    t_text.draggable = true;
                    t_text.ondragstart = function(ev) { ev.dataTransfer.setData("text/plain", JSON.stringify(_voice)); }
                }
            }

            if(_obj.sensors)
            {
                for(let _sensor of _obj.sensors)
                {
                    _sensor.path = _obj.path + ".sensors." + _sensor.id;
                    let t_text = t_menu.AppendBottom(Builder.CreateTextBox({
                        text: "Sensor - " + _sensor.name,
                        image: "/web/images/sensor_icon.png",
                        filter: "brightness(0)",
                        image_position: "before",
                        align: "left",
                        margin: "0.5em",
                        onclick: function() {
                            EngineUI.DisplaySensor(_sensor.path);
                        }
                    }));

                    t_text.draggable = true;
                    t_text.ondragstart = function(ev) { ev.dataTransfer.setData("text/plain", JSON.stringify(_sensor)); }
                }
            }

            if(_obj.bindings)
            {
                for(let _binding of _obj.bindings)
                {
                    _binding.path = _obj.path + ".bindings." + _binding.id;
                    let t_text = t_menu.AppendBottom(Builder.CreateTextBox({
                        text: "Binding",
                        image: "/web/images/audio_icon.png",
                        filter: "brightness(0)",
                        image_position: "before",
                        align: "left",
                        margin: "0.5em",
                        onclick: function() {
                            EngineUI.DisplayBinding(_binding.path);
                        }
                    }));

                    t_text.draggable = true;
                    t_text.ondragstart = function(ev) { ev.dataTransfer.setData("text/plain", JSON.stringify(_binding)); }
                }
            }

            return t_menu;
        }

        let t_menu = Builder.CreateColumn({
            width: "100%",
            height: _parameters.height || "100%",
            scrollbar: true
        })

        try {
            if(content.objects) for(let i = 0; i < content.objects.length; i++) t_menu.appendChild(ContentToHTML(content.objects[i], content.distances[i]));
        }
        catch(e) {console.log(e)}

        return t_menu;
    }

    static CreateGeneratorMenu(_parameters)
    {
        let t_menu = Builder.CreateList({
            width: "100%",
            height: _parameters.height || "100%",
            scroll: true
        })

        function CreateGenerator(_parameters)
        {
            let t_genMenu = Builder.CreateJSONEditor({
                json: _parameters.parameters,
                name: _parameters.title,
                size: "1.1em",
                expand: "not_first",
                special_types: true,
                allow_edit: "none", /// no edit button, but can still enable editing of the values
                margins: {top: "0.25em", bottom: "0.25em"},
                ondrag: function(_obj) {
                    let t_props = {generator: {}};
                    t_props.generator[_parameters.name] = _obj;
                    return t_props;
                },
            });

            t_genMenu.children[0].appendChild(Builder.CreatePictureFrame({
                image: _parameters.image,
                width: "2em",
                fit_picture: true,
                filter: "brightness(0)",
                position: {top: 0, right: "0.25em"}
            }));

            t_genMenu.EnableEdit();

            return t_genMenu;
        }

        /// Tile
        t_menu.appendChild(CreateGenerator({
            title: "Tile",
            image: "/web/images/geo_tile_icon.png",
            name: "tile",
            parameters: {
                size: [1, 1],
                backside: true
            }
        }));

        /// Box
        t_menu.appendChild(CreateGenerator({
            title: "Box",
            image: "/web/images/geobox_icon.png",
            name: "box",
            parameters: {
                size: [1, 1, 1],
                uvs$v3: [1, 1, 1],
                centered: false
            }
        }));

        /// Cylinder
        t_menu.appendChild(CreateGenerator({
            title: "Cylinder",
            image: "/web/images/geocylinder_icon.png",
            name: "cylinder",
            parameters: {
                height: 1.0,
                radius: 0.5,
                side_count$i1: 12,
                caps: true
            }
        }));

        /// Pyramid
        t_menu.appendChild(CreateGenerator({
            title: "Cone",
            image: "/web/images/geocone_icon.png",
            name: "cone",
            parameters: {
                height: 1.0,
                radius: 0.5,
                side_count$i1: 12,
                caps: true,
                sharp: false
            }
        }));

        /// Truncated Cone
        t_menu.appendChild(CreateGenerator({
            title: "Truncated Cone",
            image: "/web/images/geotruncone_icon.png",
            name: "cylinder",
            parameters: {
                height: 1.0,
                top_radius: 0.5,
                bottom_radius: 1.0,
                side_count$i1: 12,
                caps: true,
                uv_deform: true
            }
        }));

        /// Sphere
        t_menu.appendChild(CreateGenerator({
            title: "Sphere",
            image: "/web/images/sphere_icon.png",
            name: "sphere",
            parameters: {
                radius: 1.0,
                subdivision$i1: 6
            }
        }));

        /// Text
        t_menu.appendChild(CreateGenerator({
            title: "Text",
            image: "/web/images/textbox_icon.png",
            name: "text_box",
            parameters: {
                frame_size: [1.0, 1.0],
                backside: true,
                text: {
                    resolution: 1024,
                    box_size: [1024, 1024],
                    box_offset$v2: [0, 0],
                    font_size: 40,
                    font_url: "Ly8vNjNlYTQ0NWU0MmMyY2I2NTU2MWJhN2Fi",
                    text_align$a2: ['center', 'center'],
                    text_content: "V3JpdGUgaGVyZQ==",
                    text_color: [0, 0, 0, 1],
                    box_color: [1, 1, 1, 1],
                    back_color: [1, 1, 1, 1]
                } 
            }
        }));

        return t_menu;
    }

    static CreateBindingMenu(_parameters)
    {
        let t_binding = _parameters.binding;
        let t_path = null;
        if(t_binding.path_a && t_binding.path_a.length > 0) t_path = t_binding.path_a + ".bindings." + t_binding.id;
        if(!t_path && t_binding.path_b && t_binding.path_b.length > 0) t_path = t_binding.path_b + ".bindings." + t_binding.id;

        // console.log(t_binding)

        let t_menu;
        if('collapse' in _parameters && _parameters.collapse == true)
        {
            t_menu = Builder.CreateCollapseMenu({ style: _parameters.style || "white_board shadow", width: "100%", margin: "0.25em", expand: false, show_button: true }, [], []);
        }
        else
        {
            t_menu = Builder.CreateColumn({
                width: "100%",
                height: "100%",
                scrollbar: true,
                overflow_x: "hidden", style: _parameters.style
            });
            t_menu.AppendTop = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
            t_menu.AppendBottom = function(_ele) {
                t_menu.appendChild(_ele);
                return _ele;
            }
        }

        t_menu.appendChild(Builder.CreateTextBox({
            text: "Binding",
            size:"1.3em",
            weight: 600,
            align: "center",
            margin: "0.25em"
        }));

        t_menu.appendChild(Builder.CreateHorizontalList({
                width: "100%",
                margin: "0.5em"
            }, [
                Builder.CreateTextBox({text: "ID", weight: 500}),
                Builder.CreateTextBox({
                    text: ToolBox.ShrinkString(t_binding.id || 'not assigned yet', 16), margins: "0.25em",
                    onclick: function(_ev) {
                        Builder.ToClipboard(t_binding.id, _ev);
                    }
                })
            ]
        ));

        let t_typeField = t_menu.appendChild(Builder.CreateHorizontalList({width: "100%", margin: "0.25em"}, [
            Builder.CreateTextBox({ text: "Type", margins: "0.25em", weight: 500 }),
            Builder.CreateSelector({
                options: [
                    {text: "spring", value: "spring"},
                    {text: "ball joint", value: "ball_joint"},
                    {text: "hinge joint", value: "hinge_joint"},
                    {text: "cylinder", value: "cylinder"}
                ],
                value: t_binding.type,
                align: "spread",
                onselect: function(_value) {
                    t_binding.type = _value;
                    if(typeof(engine) !== 'undefined') UpdateType(_value);
                }
            })
        ]));

        let t_display = t_menu.appendChild(Builder.CreateHorizontalList({width: "100%", margin: "0.25em"}, [
            Builder.CreateTextBox({ text: "Display Binding", margins: "0.25em", weight: 500 }),
            Builder.CreatePushButton({
                pressed: t_binding.display,
                image: "/web/images/view_icon.png",
                size: "1.2em",
                onclick: function(_val) {
                    t_binding.display = _val;
                    engine.SingleCommand(t_path + ".display", _val);
                }
            })
        ]));

        let t_parameters = t_menu.appendChild(Builder.CreateBox({
            width: "100%",
            margin: "0.25em",
        }));

        let t_fullPosition = t_menu.appendChild(Builder.CreatePressButton({
            image: "/web/images/crosshair_icon.png",
            text: "Full Positioning",
            size: "1.3em",
            weight: 500,
            margin: "0.5em",
            align: "center",
            onclick: function() {FullPositioning();}
        }));

        let t_objectA = null;
        let t_positionA = null;
        let t_rotationA = null;
        let t_boxA = t_menu.appendChild(Builder.CreateBox({
            width: "100%",
            margin: "0.25em",
            style: "shadow rounded blueish"
        }));

        let t_objectB = null;
        let t_positionB = null;
        let t_rotationB = null;
        let t_boxB = t_menu.appendChild(Builder.CreateBox({
            width: "100%",
            margin: "0.25em",
            style: "shadow rounded blueish"
        }));

        
        function FullPositioning()
        {
            engine.SampleScene().then(sample_data => {

                /// get position local or global
                if(!sample_data.position) return;
                
                if(t_positionA)
                {
                    let value = engine.SingleCommand(t_binding.path_a + ".relative_position", sample_data.position);
                    t_positionA.SetValue(value);
                    engine.SingleCommand(t_path + ".position_a", value);
                }
        
                if(t_positionB)
                {
                    let value = engine.SingleCommand(t_binding.path_b + ".relative_position", sample_data.position);
                    t_positionB.SetValue(value);
                    engine.SingleCommand(t_path + ".position_b", value);
                }
        
                if(!sample_data.normal) return;
               
                if(t_rotationA)
                {
                    let value = engine.SingleCommand(t_binding.path_a + ".relative_direction", sample_data.normal);
                    t_rotationA.SetValue(ToolBox.DirectionToPolar(value));        
                    engine.SingleCommand(t_path + ".axis_a", value);
                }
        
                if(t_rotationB)
                {
                    let value = engine.SingleCommand(t_binding.path_b + ".relative_direction", sample_data.normal);
                    t_rotationB.SetValue(ToolBox.DirectionToPolar(value));
                    engine.SingleCommand(t_path + ".axis_b", value);
                }
            })
        }

        function UpdateType(new_type)
        {
            t_binding = engine.SingleCommand(t_path + ".type", new_type);
            UpdateParameters();

            if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
            else t_menu.EnableEdit();
        }

        let t_fields = [];
        function UpdateParameters()
        {
            t_boxA.innerHTML = ``;
            t_boxB.innerHTML = ``;
            t_parameters.innerHTML = ``;
            t_fields = [];
            
            t_boxA.appendChild(Builder.CreateTextBox({
                text: "Object A",
                size: "1.2em",
                weight: 500,
                align: "center",
                margin: "0.25em"
            }));

            t_boxB.appendChild(Builder.CreateTextBox({
                text: "Object B",
                size: "1.2em",
                weight: 500,
                align: "center",
                margin: "0.25em"
            }));

            t_objectA = t_boxA.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: "0.25em"
                }, [
                    Builder.CreateTextBox({text: "Object", weight: 500}),
                    EngineUI.CreateObjectField({
                        object: t_binding.path_a,
                        width: "100%",
                        onchange: function(object_path, object_name) {
                            t_binding.path_a = object_path;
                            t_binding.name_a = object_name;
                            if(typeof(engine) !== 'undefined') engine.SingleCommand(t_path + ".path_a", object_path);        
                        }
                    })    
                ]
            ));

            t_positionA = EngineUI.CreatePositionField({
                position: t_binding.position_a,
                parent_path: t_binding.path_a,
                width: "100%",
                onchange: function(_position) {
                    t_binding.position_a = [_position.x, _position.y, _position.z];
                    if(typeof(engine) !== 'undefined') engine.SingleCommand(t_path + ".position_a", t_binding.position_a);
                }
            });
            t_boxA.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: "0.25em"
                }, [
                    Builder.CreateTextBox({text: "Position", weight: 500}),
                    t_positionA
                ]
            ));

            if(t_binding.axis_a)
            {
                let t_anglesA = [0,0,0];
                try { t_anglesA = ToolBox.DirectionToPolar(t_binding.axis_a); } catch(e) {}
                t_rotationA = EngineUI.CreateRotationField({
                    rotation: t_anglesA,
                    parent_path: t_binding.path_a,
                    type: "polar",
                    width: "100%",
                    onchange: function(_rotation) {
                        t_binding.axis_a = ToolBox.PolarToDirection(_rotation);
                        if(typeof(engine) !== 'undefined') engine.SingleCommand(t_path + ".axis_a",  t_binding.axis_a);
                    }
                });
                t_boxA.appendChild(Builder.CreateHorizontalList({
                        width: "100%",
                        margin: "0.25em"
                    }, [
                        Builder.CreateTextBox({ text: "Rotation", weight: 500 }),
                        t_rotationA
                    ]
                ));    
            }

            t_objectB = t_boxB.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: "0.25em"
                }, [
                    Builder.CreateTextBox({text: "Object", weight: 500}),
                    EngineUI.CreateObjectField({
                        object: t_binding.path_b,
                        width: "100%",
                        onchange: function(object_path, object_name) {
                            t_binding.path_b = object_path;
                            t_binding.name_b = object_name;
                            if(typeof(engine) !== 'undefined') engine.SingleCommand(t_path + ".path_b", object_path);        
                        }
                    })    
                ]
            ));

            t_positionB = EngineUI.CreatePositionField({
                position: t_binding.position_b,
                parent_path: t_binding.path_b,
                width: "100%",
                onchange: function(_position) {
                    t_binding.position_b = [_position.x, _position.y, _position.z];
                    if(typeof(engine) !== 'undefined') engine.SingleCommand(t_path + ".position_b", t_binding.position_b);
                }
            });
            t_boxB.appendChild(Builder.CreateHorizontalList({
                    width: "100%",
                    margin: "0.25em"
                }, [
                    Builder.CreateTextBox({text: "Position", weight: 500}),
                    t_positionB
                ]
            ));
    
            if(t_binding.axis_b)
            {
                let t_anglesB = [0,0,0];
                try { t_anglesB = ToolBox.DirectionToPolar(t_binding.axis_b); } catch(e) {}
                t_rotationB = EngineUI.CreateRotationField({
                    rotation: t_anglesB,
                    parent_path: t_binding.path_b,
                    type: "polar",
                    width: "100%",
                    onchange: function(_rotation) {
                        t_binding.axis_b = ToolBox.PolarToDirection(_rotation);
                        if(typeof(engine) !== 'undefined') engine.SingleCommand(t_path + ".axis_b",  t_binding.axis_b);
                    }
                });
                t_boxB.appendChild(Builder.CreateHorizontalList({
                        width: "100%",
                        margin: "0.25em"
                    }, [
                        Builder.CreateTextBox({ text: "Rotation", weight: 500 }),
                        t_rotationB
                    ]
                ));    
            }

            if(t_binding.length)
            {
                t_fields.push(t_parameters.appendChild(Builder.CreateHorizontalList({ width: "100%", margin: "0.25em" }, [
                    Builder.CreateTextBox({ text: "length", margins: 0, weight: 500, width: "30%" }),
                    Builder.CreateRangeInput({
                        value: t_binding.length, min: 0.001, max: 50.0, step: 0.001, exponent: 3,
                        wheel_input: 0.05,
                        drag_input: 0.001,
                        trail_color: "#9b7bd3", digit_width: "2em", channel_width: "calc(100% - 2.5em)", width: "70%",
                        onchange: function(_val) {
                            t_binding.length = _val;
                            if(typeof(engine) !== "undefined") engine.SingleCommand(t_path + ".length", t_binding.length);
                        }
                    })
                ])));
            }

            if("strength" in t_binding)
            {
                t_fields.push(t_parameters.appendChild(Builder.CreateHorizontalList({ width: "100%", margin: "0.25em" }, [
                    Builder.CreateTextBox({ text: "strength", margins: 0, weight: 500, width: "30%" }),
                    Builder.CreateRangeInput({
                        value: t_binding.strength, min: 1.0, max: 10000.0, step: 1.0, exponent: 3,
                        wheel_input: 10.0,
                        drag_input: 1.0,            
                        trail_color: "#7b93d3", digit_width: "2em", channel_width: "calc(100% - 2.5em)", width: "70%",
                        onchange: function(_val) {
                            t_binding.strength = _val;
                            if(typeof(engine) !== "undefined") engine.SingleCommand(t_path + ".strength", t_binding.strength);
                        }
                    })
                ])));
            }

            if("damping" in t_binding)
            {
                t_fields.push(t_parameters.appendChild(Builder.CreateHorizontalList({ width: "100%", margin: "0.25em" }, [
                    Builder.CreateTextBox({ text: "damping", margins: 0, weight: 500, width: "30%" }),
                    Builder.CreateRangeInput({
                        value: t_binding.damping, min: 0.005, max: 1.0, step: 0.005,
                        wheel_input: 0.05,
                        drag_input: 0.005,            
                        trail_color: "#7bd3bf", digit_width: "2em", channel_width: "calc(100% - 2.5em)", width: "70%",
                        onchange: function(_val) {
                            t_binding.damping = _val;
                            if(typeof(engine) !== "undefined") engine.SingleCommand(t_path + ".damping", t_binding.damping);
                        }
                    })
                ])));
            }

            if("distance" in t_binding)
            {
                t_fields.push(t_parameters.appendChild(Builder.CreateHorizontalList({ width: "100%", margin: "0.25em" }, [
                    Builder.CreateTextBox({ text: "distance", margins: 0, weight: 500, width: "30%" }),
                    Builder.CreateRangeInput({
                        value: t_binding.distance, min: 0.005, max: 1.0, step: 0.005,
                        wheel_input: 0.05,
                        drag_input: 0.005,            
                        trail_color: "#96d37b", digit_width: "2em", channel_width: "calc(100% - 2.5em)", width: "70%",
                        onchange: function(_val) {
                            t_binding.distance = _val;
                            if(typeof(engine) !== "undefined") engine.SingleCommand(t_path + ".distance", t_binding.distance);
                        }
                    })
                ])));
            }

            if("friction" in t_binding)
            {
                t_fields.push(t_parameters.appendChild(Builder.CreateHorizontalList({ width: "100%", margin: "0.25em" }, [
                    Builder.CreateTextBox({ text: "friction", margins: 0, weight: 500, width: "30%" }),
                    Builder.CreateRangeInput({
                        value: t_binding.friction, min: 0.005, max: 1.0, step: 0.005,
                        wheel_input: 0.05,
                        drag_input: 0.005,            
                        trail_color: "#d3887b", digit_width: "2em", channel_width: "calc(100% - 2.5em)", width: "70%",
                        onchange: function(_val) {
                            t_binding.friction = _val;
                            if(typeof(engine) !== "undefined") engine.SingleCommand(t_path + ".friction", t_binding.friction);
                        }
                    })
                ])));
            }

        }

        UpdateParameters();

        let t_delete = t_menu.AppendBottom(Builder.CreatePressButton({
            image: "/web/images/delete_icon.png",
            size: '1.2em',
            position: {top: "0.25em", left: "0.25em"},
            onclick: function() {
                if(t_path) engine.SingleCommand(t_path + ".delete");
                if(_parameters.interface_element) _parameters.interface = _parameters.interface_element.node_interface;
                if(_parameters.interface) _parameters.interface.DeleteNode(_parameters.node, _parameters.id);
                t_menu.remove();
            }
        }));


        t_menu.EnableEdit = function() {
            t_typeField.EnableEdit();
            t_display.EnableEdit();
            t_fullPosition.EnableEdit();
            t_objectA.EnableEdit();
            t_positionA.EnableEdit();
            if(t_rotationA) t_rotationA.EnableEdit();
            t_objectB.EnableEdit();
            t_positionB.EnableEdit();
            if(t_rotationB) t_rotationB.EnableEdit();
            for(let i = 0; i < t_fields.length; i++) t_fields[i].EnableEdit();
            t_delete.EnableEdit();
        }
        t_menu.DisableEdit = function() {
            t_typeField.DisableEdit();
            t_display.DisableEdit();
            t_fullPosition.DisableEdit();
            t_objectA.DisableEdit();
            t_positionA.DisableEdit();
            if(t_rotationA) t_rotationA.DisableEdit();
            t_objectB.DisableEdit();
            t_positionB.DisableEdit();
            if(t_rotationB) t_rotationB.DisableEdit();
            for(let i = 0; i < t_fields.length; i++) t_fields[i].DisableEdit();
            t_delete.DisableEdit();
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_menu.DisableEdit();
        else t_menu.EnableEdit();

        return t_menu;
    }

    static CreateLandscapeMenu(_parameters)
    {
        let t_menu = Builder.CreateColumn({
            width: "100%",
            height: "100%",
            scrollbar: true,
            overflow_x: "hidden"
        });

        t_menu.appendChild(Builder.CreateTextBox({
            text: "Landscape",
            size:"1.3em",
            weight: 600,
            align: "left",
            margin: "0.75em"
        }));


        /// terrain properties
        {
            let t_terrainMenu = t_menu.appendChild(Builder.CreateCollapseMenu({ style: "shadow", width: "100%", margin: "0.5em", expand: false, show_button: true }, [], []));
            t_terrainMenu.AppendTop(Builder.CreateTextBox({text: "Terrain", align: "center", size: "1.2em", weight: 600, margin: "0.25em", onclick: function() {t_terrainMenu.Toggle()}}));
            t_terrainMenu.AppendTop(Builder.CreatePictureFrame({image: "/web/images/mountain_icon.png", height: "2.0em", margin: "0.25em", filter: "brightness(0)"}));
            let t_parameters = t_terrainMenu.AppendBottom(Builder.CreateJSONEditor({
                json: {
                    // parcels: [6, 6],
                    // division_size: 2.0,
                    max_height: 1500.0,
                    water_bottom: -20.0,
                    water_level: 0.0,
                    coast_level: 10.0,
                    rock_level: 1000.0,
                    snow_level: 1400.0,
                    island_radius: 200.0,
                    seed: Math.floor(10000 * Math.random()),
                    advanced: {
                        scale: 1000.0,
                        octave_count: 7,
                        lacunarity: 3.0,
                        persistence: 0.35,    
                    }
                },
                name: "Parameters",
                expand: "first",
                special_types: true,
                allow_edit: "none"
            }));
            t_parameters.EnableEdit();
            
            t_terrainMenu.AppendBottom(Builder.CreateHorizontalList({
                },[
                    Builder.CreatePressButton({
                        text: "Create",
                        size: "1.2em",
                        weight: 500,
                        margin: "0.25em",
                        style: "green",
                        onclick: function() {
                            let t_props = t_parameters.GetValue();
                            ToolBox.TransferProperties(t_props, t_props.advanced);
                            t_props.advanced = null;
                            engine.GenerateTerrain(t_props);
                        }
                    }),
                    Builder.CreatePressButton({
                        text: "Delete",
                        size: "1.2em",
                        weight: 500,
                        margin: "0.25em",
                        style: "red",
                        onclick: function() {
        
                        }
                    })
                ]
            ));
        }

        /// Sea properties
        {
            let t_seaMenu = t_menu.appendChild(Builder.CreateCollapseMenu({ style: "shadow", width: "100%", margin: "0.5em", expand: false, show_button: true}, [], []));
            t_seaMenu.AppendTop(Builder.CreateTextBox({text: "Sea", align: "center", size: "1.2em", weight: 600, margin: "0.25em", onclick: function() {t_seaMenu.Toggle()}}));
            t_seaMenu.AppendTop(Builder.CreatePictureFrame({image: "/web/images/sea_icon.png", height: "2.0em", margin: "0.25em", filter: "brightness(0)"}));
            let t_parameters = t_seaMenu.AppendBottom(Builder.CreateJSONEditor({
                json: {
                    level: 0.0
                },
                name: "Parameters",
                expand: "first",
                special_types: true,
                allow_edit: "none"
            }));
            t_parameters.EnableEdit();
            
            t_seaMenu.AppendBottom(Builder.CreateHorizontalList({
                },[
                    Builder.CreatePressButton({
                        text: "Create",
                        size: "1.2em",
                        weight: 500,
                        margin: "0.25em",
                        style: "green",
                        onclick: function() {
                            let t_props = t_parameters.GetValue();
                            engine.SingleCommand("sea.display", true);
                            engine.SingleCommand("sea.level", t_props.level);
                        }
                    }),
                    Builder.CreatePressButton({
                        text: "Delete",
                        size: "1.2em",
                        weight: 500,
                        margin: "0.25em",
                        style: "red",
                        onclick: function() {
                            engine.SingleCommand("sea.display", false);
                        }
                    })
                ]
            ));
        }

        return t_menu;
    }

    static CreateBrushButton(_parameters)
    {
        let t_brushButton = document.createElement('div');
        t_brushButton.className = "brush_button";
        t_brushButton.innerHTML = `
            <div class='wrapper'></div>
        `;

        let t_brushTip = t_brushButton.children[0];

        let t_pressed = false;
        let t_color = "rgba(0,0,0,1)";
        let t_radius = 1.0;
        let t_blur = 0.0;
        let t_opacity = 1.0;

        t_brushButton.Update = function(_parameters = {}) {
            if('radius' in _parameters) t_radius = _parameters.radius;
            if('blur' in _parameters) t_blur = _parameters.blur;
            if('opacity' in _parameters) t_opacity = _parameters.opacity;

            let radiusMax = Math.pow(t_radius, 0.5) * 70;
            let radiusMin = (radiusMax - 2) * (1.0 - t_blur);
            t_brushTip.style.background = `
                radial-gradient(circle, ` + t_color + ` ` + radiusMin + `%, rgba(0,0,0,0) ` + radiusMax + `%)
            `;
            t_brushTip.style.opacity = t_opacity;
        }

        t_brushButton.Press = function() {
            t_color = "rgba(27,128,116,1)";
            t_pressed = true;
            t_brushButton.Update();
            t_brushButton.classList.add('pressed');
        }

        t_brushButton.Unpress = function() {
            t_color = "rgba(0,0,0,1)";
            t_pressed = false;
            t_brushButton.Update();
            t_brushButton.classList.remove('pressed');
        }

        t_brushButton.onclick = function() {
            if(t_pressed == false) t_brushButton.Press();
            else t_brushButton.Unpress();

            if(_parameters.onclick) _parameters.onclick(t_pressed);
        }

        return t_brushButton;
    }

    static CreateBrush(_parameters)
    {
        let t_brush = Builder.CreateBox({width: "100%", margin: "0.25em", style: "shadow"});
        t_brush.classList.add("brush");

        let t_title;
        if("edit_name" in _parameters && _parameters.edit_name == true)
        {
            t_title = Builder.CreateTextInput({
                value: _parameters.name,
                size: "1.1em", weight: 500, margin: "0.25em",
                button_position: "right",
                button_image: "/web/images/edit_icon.png",
                allow_edit: false,
                width: "calc(100% - 2.5em)",
                onvalidate: function(_name) {
                    if(_parameters.onchange) _parameters.onchange({name: _name});
                }
            });
        }
        else t_title = Builder.CreateTextBox({text: _parameters.name, size: "1.2em", weight: 500, margin: "0.25em"});

        t_brush.appendChild(Builder.CreateHorizontalList({ width: "100%", horizontal_align: "left" }, [
            Builder.CreatePictureFrame({image: _parameters.image, height: _parameters.material ? "2.5em" : "2em", filter: "brightness(0)", margin: _parameters.material ? "0.5em" : "0.25em"}),
            t_title
        ]));

        let t_brushParameters = _parameters.brush_parameters;

        let t_brushButton = EngineUI.CreateBrushButton({
            onclick: function(_pressed) {
                if(_parameters.onclick) _parameters.onclick(_pressed, t_brushParameters);
            }
        });
        t_brush.Unpress = function() {
            t_brushButton.Unpress();
        }
        
        let t_parameterBox = Builder.CreateBox({
            width: "calc(100% - 3em)"
        });

        t_brush.appendChild(Builder.CreateHorizontalList({
                width: "100%"
            }, [t_brushButton, t_parameterBox]
        ));

        if("radius" in t_brushParameters)
        {
            t_parameterBox.appendChild(Builder.CreateHorizontalList({ width: "100%", margin: "0.1em" }, [
                Builder.CreateTextBox({ text: "radius", margins: 0, weight: 500, width: "30%", size: "0.9em" }),
                Builder.CreateRangeInput({
                    value: t_brushParameters.radius, min: 0.01, max: 10.0, trail_color: "#8bc1cc", exponent: 3.0,
                    wheel_input: 0.1,
                    drag_input: 0.01,        
                    digit_width: "2em", channel_width: "calc(100% - 2.5em)", width: "70%", size: "0.9em",
                    onchange: function(_val) {
                        t_brushParameters.radius = _val;
                        t_brushButton.Update({radius: _val / 10.0});
                        if(_parameters.onchange) _parameters.onchange({radius: _val});
                    }
                })
            ]));
            t_brushButton.Update({radius: t_brushParameters.radius / 10.0});
        }

        if("blur" in t_brushParameters)
        {
            t_parameterBox.appendChild(Builder.CreateHorizontalList({ width: "100%", margin: "0.1em" }, [
                Builder.CreateTextBox({ text: "blur", margins: 0, weight: 500, width: "30%", size: "0.9em" }),
                Builder.CreateRangeInput({
                    value: t_brushParameters.blur, min: 0.0, max: 1.0, trail_color: "#8bcc8f",
                    wheel_input: 0.05,
                    drag_input: 0.001,        
                    digit_width: "2em", channel_width: "calc(100% - 2.5em)", width: "70%", size: "0.9em",
                    onchange: function(_val) {
                        t_brushParameters.blur = _val;
                        t_brushButton.Update({blur: _val});
                        if(_parameters.onchange) _parameters.onchange({blur: _val});
                    }
                })
            ]));
            t_brushButton.Update({blur: t_brushParameters.blur});
        }

        if("opacity" in t_brushParameters)
        {
            t_parameterBox.appendChild(Builder.CreateHorizontalList({ width: "100%", margin: "0.1em" }, [
                Builder.CreateTextBox({ text: "opacity", margins: 0, weight: 500, width: "30%", size: "0.9em" }),
                Builder.CreateRangeInput({
                    value: t_brushParameters.opacity, min: 0.0, max: 1.0, trail_color: "#c9cc8b",
                    wheel_input: 0.05,
                    drag_input: 0.001,
                    digit_width: "2em", channel_width: "calc(100% - 2.5em)", width: "70%", size: "0.9em",
                    onchange: function(_val) {
                        t_brushParameters.opacity = _val;
                        t_brushButton.Update({opacity: _val});
                        if(_parameters.onchange) _parameters.onchange({opacity: _val});
                    }
                })
            ]));
            t_brushButton.Update({opacity: t_brushParameters.opacity});
        }

        if("strength" in t_brushParameters)
        {
            t_parameterBox.appendChild(Builder.CreateHorizontalList({ width: "100%", margin: "0.1em" }, [
                Builder.CreateTextBox({ text: "amount", margins: 0, weight: 500, width: "30%", size: "0.9em" }),
                Builder.CreateRangeInput({
                    value: t_brushParameters.strength, min: 0.0, max: 1.0, trail_color: "#cca18b",
                    wheel_input: 0.05,
                    drag_input: 0.001,        
                    digit_width: "2em", channel_width: "calc(100% - 2.5em)", width: "70%", size: "0.9em",
                    onchange: function(_val) {
                        t_brushParameters.strength = _val;
                        t_brushButton.Update({opacity: _val});
                        if(_parameters.onchange) _parameters.onchange({strength: _val});
                    }
                })
            ]));
            t_brushButton.Update({opacity: t_brushParameters.strength});
        }

        if("distance" in t_brushParameters)
        {
            t_parameterBox.appendChild(Builder.CreateHorizontalList({ width: "100%", margin: "0.1em" }, [
                Builder.CreateTextBox({ text: "distance", margins: 0, weight: 500, width: "30%", size: "0.9em" }),
                Builder.CreateRangeInput({
                    value: t_brushParameters.distance, min: -10.0, max: 10.0, trail_color: "#cca18b",
                    wheel_input: 0.05,
                    drag_input: 0.005,
                    digit_width: "2em", channel_width: "calc(100% - 2.5em)", width: "70%", size: "0.9em",
                    onchange: function(_val) {
                        t_brushParameters.distance = _val;
                        t_brushButton.Update({opacity: Math.abs(_val / 10.0)});
                        if(_parameters.onchange) _parameters.onchange({distance: _val});
                    }
                })
            ]));
            t_brushButton.Update({opacity: Math.abs(t_brushParameters.distance / 10.0)});
        }


        if("update_color" in t_brushParameters)
        {
            t_parameterBox.appendChild(Builder.CreateHorizontalList({ width: "100%", margin: "0.1em", spread: true }, [
                Builder.CreateTextBox({ text: "update materials", margins: 0, weight: 500, width: "70%", size: "0.9em" }),
                Builder.CreateToggleButton({
                    value: t_brushParameters.update_color,
                    width: "30%", size: "0.9em",
                    onchange: function(_val) {
                        t_brushParameters.update_color = _val;
                        if(_parameters.onchange) _parameters.onchange({update_color: _val});
                    }
                })
            ]));
        }

        if(_parameters.material)
        {
            t_brush.appendChild(EngineUI.CreatePBRMenu({
                label: "Textures:",
                label_size: "1.2em",
                label_weight: 500,
                textures: {
                    diffuse: _parameters.material.diffuse,
                    normal: _parameters.material.normal,
                    material: _parameters.material.material,
                },
                allow_edit: true,
                path: "terrain.materials." + _parameters.material.id
            }));
        }

        return t_brush;
    }

    static CreateTerrainMenu(_parameters)
    {
        let t_menu = Builder.CreateColumn({
            width: "100%",
            height: "100%",
            scrollbar: true,
            overflow_x: "hidden"
        });

        t_menu.appendChild(Builder.CreateTextBox({
            text: "Terrain Tools",
            size:"1.3em",
            weight: 600,
            align: "left",
            margin: "0.75em"
        }));


        let t_selectedBrush = null;
        function UpdateBrush(brush_parameters, brush_element = null)
        {
            if("mode" in brush_parameters)
            {
                if(t_selectedBrush) t_selectedBrush.Unpress();
                if(t_selectedBrush == brush_element)
                {
                    engine.EndPaintMode();
                    t_selectedBrush = null;
                    return;
                }
                else
                {
                    t_selectedBrush = brush_element;
                    engine.SetPaintMode(brush_parameters.mode);
                    engine.PinRightMenu();
                }
            }

            if('value' in brush_parameters) engine.SingleCommand('controls.brush.value', brush_parameters.value);
            if('color' in brush_parameters) engine.SingleCommand('controls.brush.color', brush_parameters.color);
            if('radius' in brush_parameters) engine.SingleCommand('controls.brush.radius', brush_parameters.radius);
            if('opacity' in brush_parameters) engine.SingleCommand('controls.brush.opacity', brush_parameters.opacity);
            if('blur' in brush_parameters) engine.SingleCommand('controls.brush.blur', brush_parameters.blur);
            if('distance' in brush_parameters) engine.SingleCommand('controls.brush.strength', brush_parameters.distance);
            if('strength' in brush_parameters) engine.SingleCommand('controls.brush.strength', brush_parameters.strength);
            if('update_color' in brush_parameters) engine.SingleCommand('controls.brush.update_color', brush_parameters.update_color);
        }
        
        /// sculpting
        {
            let t_modifyMenu = t_menu.appendChild(Builder.CreateCollapseMenu({
                    style: "shadow", width: "100%", margin: "0.5em", expand: true, show_button: true
                }, [
                    Builder.CreateTextBox({text: "Sculpting Tools", align: "center", size: "1.2em", weight: 600, margin: "0.25em", onclick: function() {t_modifyMenu.Toggle()}})
                ], []
            ));

            {
                let t_brush = t_modifyMenu.AppendBottom(EngineUI.CreateBrush({
                    name: "Raise",
                    image: "/web/images/terrain_raise_icon.png",
                    brush_parameters: { mode: "terrain_height", radius: 1.0, distance: 1.0, blur: 0.0, update_color: true },
                    onclick: function(_pressed, brush_params) { UpdateBrush(brush_params, t_brush); },
                    onchange: function(brush_params) { if(t_selectedBrush == t_brush) UpdateBrush(brush_params); }
                }));    
            }

            {
                let t_brush = t_modifyMenu.AppendBottom(EngineUI.CreateBrush({
                    name: "Flatten",
                    image: "/web/images/terrain_flatten_icon.png",
                    brush_parameters: { mode: "terrain_flatten", radius: 1.0, strength: 0.5, blur: 0.0, update_color: true },
                    onclick: function(_pressed, brush_params) { UpdateBrush(brush_params, t_brush); },
                    onchange: function(brush_params) { if(t_selectedBrush == t_brush) UpdateBrush(brush_params); }
                }));
            }

            {
                let t_brush = t_modifyMenu.AppendBottom(EngineUI.CreateBrush({
                    name: "Protrude",
                    image: "/web/images/terrain_protrude_icon.png",
                    brush_parameters: { mode: "terrain_protrude", radius: 1.0, distance: 1.0, blur: 0.0, update_color: true },
                    onclick: function(_pressed, brush_params) { UpdateBrush(brush_params, t_brush); },
                    onchange: function(brush_params) { if(t_selectedBrush == t_brush) UpdateBrush(brush_params); }
                }));
            }

            {
                let t_brush = t_modifyMenu.AppendBottom(EngineUI.CreateBrush({
                    name: "Expand",
                    image: "/web/images/terrain_expand_icon.png",
                    brush_parameters: { mode: "terrain_expand", radius: 1.0, distance: 1.0, blur: 0.0, update_color: true },
                    onclick: function(_pressed, brush_params) { UpdateBrush(brush_params, t_brush); },
                    onchange: function(brush_params) { if(t_selectedBrush == t_brush) UpdateBrush(brush_params); }
                }));    
            }

            {
                let t_brush = t_modifyMenu.AppendBottom(EngineUI.CreateBrush({
                    name: "Smooth",
                    image: "/web/images/terrain_smooth_icon.png",
                    brush_parameters: { mode: "terrain_smooth", radius: 1.0, strength: 0.5, blur: 0.0, update_color: true },
                    onclick: function(_pressed, brush_params) { UpdateBrush(brush_params, t_brush); },
                    onchange: function(brush_params) { if(t_selectedBrush == t_brush) UpdateBrush(brush_params); }
                }));    
            }

            {
                let t_brush = t_modifyMenu.AppendBottom(EngineUI.CreateBrush({
                    name: "Smooth",
                    image: "/web/images/terrain_reset_icon.png",
                    brush_parameters: { mode: "terrain_reset", radius: 1.0, strength: 0.5, blur: 0.0, update_color: true },
                    onclick: function(_pressed, brush_params) { UpdateBrush(brush_params, t_brush); },
                    onchange: function(brush_params) { if(t_selectedBrush == t_brush) UpdateBrush(brush_params); }
                }));    
            }
        }

        /// material painting
        {
            let t_materialMenu = t_menu.appendChild(Builder.CreateCollapseMenu({
                    style: "shadow", width: "100%", margin: "0.5em", expand: true, show_button: true
                }, [
                    Builder.CreateTextBox({text: "Materials Brushes", align: "center", size: "1.2em", weight: 600, margin: "0.25em", onclick: function() {t_materialMenu.Toggle()}})
                ], []
            ));


            function CreateMaterial(_material)
            {
                let t_brush = EngineUI.CreateBrush({
                    name: _material.name ? atob(_material.name) : "Material",
                    image: "/web/images/brush_icon.png",
                    edit_name: true,
                    material: {
                        id: _material.id,
                        diffuse: _material.diffuse,
                        normal: _material.normal,
                        material: _material.material    
                    },
                    brush_parameters: { mode: "terrain_color", value: _material.index, radius: 1.0, blur: 0.2, opacity: 1.0 },
                    onclick: function(_pressed, brush_params) { UpdateBrush(brush_params, t_brush); },
                    onchange: function(brush_params) { if(t_selectedBrush == t_brush) UpdateBrush(brush_params); },
                });
                return t_brush;
            }

            /// create a menu for each material currently being used
            for(let i = 0; i < _parameters.materials.length; i++)
            {
                t_materialMenu.AppendBottom(CreateMaterial(_parameters.materials[i]));
            }

            let t_addButton = t_materialMenu.AppendBottom(Builder.CreatePressButton({
                text: "Add Material",
                image_before: "/web/images/plus_icon.png",
                size: "1.1em",
                weight: 500,
                margin: "0.5em",
                onclick: function() {
                    let t_material = engine.SingleCommand('terrain.materials.new');
                    t_addButton.parentNode.insertBefore(CreateMaterial(t_material), t_addButton);
                }
            }))

        }

        return t_menu;
    }

    static CreateAvatarProcessesMenu(_parameters)
    {
        let t_attributes = engine.SingleCommand("users.base_attributes.json");
        let t_processes = engine.SingleCommand("users.processes.list");

        // console.log(t_attributes);
        // console.log(t_processes);

        let t_menu = Builder.CreateColumn({
            width: "100%",
            height: "100%",
            scrollbar: true,
            overflow_x: "hidden"
        });

        t_menu.appendChild(Builder.CreateTextBox({
            text: "Avatar Attributes & Processes",
            size:"1.3em",
            weight: 600,
            align: "left",
            margin: "0.75em"
        }));

        /// Base Attributes
        t_menu.appendChild(Builder.CreateJSONEditor({
            name: "Default Attributes", json: t_attributes, special_types: true, allow_edit: _parameters.allow_edit ? "all" : null, expand: "first",
            onvalidation: function(_json) {
                engine.SingleCommand("users.base_attributes.clear");
                engine.SingleCommand("users.base_attributes", _json);
            }
        }));

        /// avatar processes
        let t_processMenu = t_menu.appendChild(Builder.CreateCollapseMenu({ style: "shadow", width: "100%", margin: "0.25em", expand: true, show_button: true }, [], []));
        t_processMenu.AppendTop(Builder.CreateTextBox({text: "Avatar Processes", align: "center", size: "1.2em", weight: 600, margin: "0.25em"}));
        for(let i = 0; i < t_processes.length; i++)
        {
            t_processMenu.AppendBottom(EngineUI.CreateProcessMenu({
                process: t_processes[i],
                process_path: "users.processes." + t_processes[i].id,
                collapse: true,
                title: atob(t_processes[i].name),
                update_title: true,
                style: "rounded shadow blueish"
            }));
        }

        let t_button = t_processMenu.AppendBottom(Builder.CreatePressButton({
            text: "Add Process",
            image: "/web/images/plus_icon.png",
            size: "1.1em",
            margin: "0.5em",
            onclick: function() {
                let t_process = engine.SingleCommand("users.processes.new");
                let t_newMenu = EngineUI.CreateProcessMenu({
                    process: t_process,
                    process_path: "users.processes." + t_process.id,
                    collapse: true,
                    title: atob(t_process.name),
                    update_title: true,
                    style: "rounded shadow blueish"
                });
                t_button.parentNode.insertBefore(t_newMenu, t_button);
                t_newMenu.Expand();
            }
        }));

        return t_menu;
    }

    static CreateSpaceProcessesMenu(_parameters)
    {
        let t_attributes = engine.SingleCommand("space.base_attributes.json");
        let t_processes = engine.SingleCommand("space.processes.list");

        // console.log(t_attributes);
        // console.log(t_processes);

        let t_menu = Builder.CreateColumn({
            width: "100%",
            height: "100%",
            scrollbar: true,
            overflow_x: "hidden"
        });

        t_menu.appendChild(Builder.CreateTextBox({
            text: "Space Attributes & Processes",
            size:"1.3em",
            weight: 600,
            align: "left",
            margin: "0.75em"
        }));

        /// Base Attributes
        t_menu.appendChild(Builder.CreateJSONEditor({
            name: "Default Attributes", json: t_attributes, special_types: true, allow_edit: _parameters.allow_edit ? "all" : null, expand: "first",
            onvalidation: function(_json) {
                engine.SingleCommand("space.base_attributes.clear");
                engine.SingleCommand("space.base_attributes", _json);
            }
        }));

        /// processes
        let t_processMenu = t_menu.appendChild(Builder.CreateCollapseMenu({ style: "shadow", width: "100%", margin: "0.25em", expand: true, show_button: true }, [], []));
        t_processMenu.AppendTop(Builder.CreateTextBox({text: "Space Processes", align: "center", size: "1.2em", weight: 600, margin: "0.25em"}));
        for(let i = 0; i < t_processes.length; i++)
        {
            t_processMenu.AppendBottom(EngineUI.CreateProcessMenu({
                process: t_processes[i],
                process_path: "space.processes." + t_processes[i].id,
                collapse: true,
                title: atob(t_processes[i].name),
                update_title: true,
                style: "rounded shadow blueish"
            }));
        }

        let t_button = t_processMenu.AppendBottom(Builder.CreatePressButton({
            text: "Add Process",
            image: "/web/images/plus_icon.png",
            size: "1.1em",
            margin: "0.5em",
            onclick: function() {
                let t_process = engine.SingleCommand("space.processes.new");
                let t_newMenu = EngineUI.CreateProcessMenu({
                    process: t_process,
                    process_path: "space.processes." + t_process.id,
                    collapse: true,
                    title: atob(t_process.name),
                    update_title: true,
                    style: "rounded shadow blueish"
                });
                t_button.parentNode.insertBefore(t_newMenu, t_button);
                t_newMenu.Expand();
            }
        }));

        return t_menu;
    }

    static CreateShaderList(_parameters)
    {
        let t_menu = Builder.CreateColumn({
            width: "100%",
            height: "100%",
            scrollbar: true,
            overflow_x: "hidden"
        });

        t_menu.appendChild(Builder.CreateTextBox({
            text: "Current Shaders",
            size: "1.3em",
            weight: 600,
            margin: "1em"
        }));

        let t_create = t_menu.appendChild(Builder.CreatePressButton({
            text: "Create Shader",
            image: "/web/images/plus_icon.png",
            size: "1.2em",
            weight: 500,
            onclick: function() {
                CreateShader();
            }
        }))

        function CreateShader()
        {
            let t_newShader = engine.SingleCommand("shaders.new");
            userMenu.DisplayShaderEditor({shader: t_newShader, oncreate: function(_shader) {
                t_menu.appendChild(CreateShaderCard(_shader));
            }});
        }

        var t_shaderList = engine.SingleCommand("shaders.list");
        // console.log(t_shaderList);

        function CreateShaderCard(_shader)
        {
            let t_id = null;
            if(_shader.URL) try {t_id = atob(_shader.URL).slice(3)} catch(e) {}

            let t_shaderCard = Builder.CreateBox({
                width: "100%",
                height: "8em",
                margin: "0.5em",
                style: "shadow rounded no_overflow",
                ondragstart: function(ev) {
                    let t_json = JSON.stringify({
                        type: "shader",
                        id: t_id
                    });
                    ev.dataTransfer.setData("text/plain", t_json);
                }
            });

            let t_image = t_shaderCard.appendChild(Builder.CreatePictureFrame({
                image: "/web/images/shader_icon.png",
                width: "100%",
                height: "100%"
            }));
            if(t_id)
            {
                try {
                    UserMenu.LoadResourcePicture("///" + t_id, t_image);
                }
                catch(e) {console.log(e)}
            }

            let t_name = _shader.name;
            try {t_name = atob(_shader.name)} catch(e) {}
            t_shaderCard.appendChild(Builder.CreateTextBox({
                text: t_name,
                size: "1.1em",
                color: "white",
                padding: {left: "0.5em", right: "0.5em"},
                position: {top: "0.5em", center_x: true},
                style: "rounded white_icon",
            }));

            t_shaderCard.appendChild(Builder.CreatePressButton({
                image: "/web/images/properties_icon.png",
                size: "1.2em",
                position: {bottom: "0.5em", right: "0.5em"},
                style: "white_icon",
                onclick: function() {
                    userMenu.DisplayShaderEditor({shader: _shader});
                }
            }));

            t_shaderCard.appendChild(Builder.CreatePressButton({
                image: "/web/images/info_icon.png",
                size: "1.2em",
                position: {bottom: "0.5em", left: "0.5em"},
                style: "white_icon",
                onclick: function() {
                    userMenu.ShowResourceDetails(atob(_shader.URL).slice(3));
                }
            }));

            return t_shaderCard;
        }

        for(let i = 0; i < t_shaderList.length; i++) t_menu.appendChild(CreateShaderCard(t_shaderList[i]));

        return t_menu;
    }

    static async CreateEquipmentCard(_parameters)
    {
        let t_resourceID = _parameters.resource_id;
        let t_referenceID = _parameters.reference_id || t_resourceID;   /// id of the original item that got adapted to the avatar
        let t_objectPath = _parameters.object_path;
        let t_avatarPath = _parameters.avatar_path;
        let t_avatarID = _parameters.avatar_id;
        let t_avatarURL = _parameters.avatar_url;
        let t_resourceName = _parameters.resource_name;
        let t_resourceCategory = _parameters.category;
        let t_engine = _parameters.engine;  /// specify engine if remote
        let t_ready = _parameters.ready;    /// ready = already morphed to the avatar shape
        if(t_objectPath) t_ready = true;
        let t_onbusy = _parameters.onbusy;
        let t_onidle = _parameters.onidle;
        let t_onequip = _parameters.onequip;

        if(!t_resourceName)
        {
            let t_resource = await KipAPI.RequestResourceInfo(t_resourceID);
            t_resourceName = t_resource.title;
        }

        let t_card = Builder.CreatePictureCard({
            picture_url: "/web/images/resource_icon.png",
            picture_title: t_resourceName,
            width: "8em",
            height: "8em",
            radius: "1em",
            size: mobileWebsite == true ? "0.7em" : "0.7em",
            margin: mobileWebsite == true ? "0.1em" : "0.25em",
            style: "small_shadow",
            onleftclick: function(_resource) {
                if(_parameters.onclick) _parameters.onclick(t_card);
                if(t_ready == true) ToggleEquipment();
                else PrepareEquipment();
            },
        });
        t_card.id = t_resourceID;

        if(t_ready == false)
        {
            /// set as not ready
            t_card.checkmark = t_card.appendChild(Builder.CreatePictureFrame({
                image: "/web/images/download_icon.png",
                height: "1.5em", width: "1.5em", style: "right_corner", padding: {left: "0.25em", bottom: "0.25em", top: "0.35em", right: "0.35em"}, position: {top: 0, right: 0}
            }));
        }

        /// remark: we use the picture of the reference item
        UserMenu.LoadResourcePicture("///" + t_referenceID).then(img_url => {
            if(img_url)
            {
                t_card.children[0].src = img_url;
                t_card.SetFilter('none');
                t_card.SetImageScale(1.0);        
            }
            else t_card.SetFilter('brightness(0)');
        });

        if(t_objectPath)
        {
            /// set as equipped
            t_card.equipped = true;
            t_card.object_path = t_objectPath;
            t_card.checkmark = t_card.appendChild(Builder.CreatePictureFrame({
                image: "/web/images/check_icon.png",
                height: "1.5em", width: "1.5em", style: "right_corner", padding: {left: "0.25em", bottom: "0.25em", top: "0.35em", right: "0.35em"}, position: {top: 0, right: 0}
            }));
        }

        function ToggleEquipment()
        {
            if(!t_card.equipped || t_card.equipped == false)
            {
                t_card.equipped = true;
                if(t_engine)
                {
                    t_engine.SingleCommand_Sync(t_avatarPath + ".wear", "///" + t_resourceID).then(_cloth => {
                        t_card.object_path = _cloth.object_path;
                        if(t_onequip) t_onequip(_cloth.object_path);
                    });
                }
                else
                {
                    engine.SingleCommandSync(t_avatarPath + ".wear", "///" + t_resourceID).then(_cloth => {
                        t_card.object_path = _cloth.object_path;
                        if(t_onequip) t_onequip(_cloth.object_path);    
                    })
                }
                t_card.checkmark = t_card.appendChild(Builder.CreatePictureFrame({
                    image: "/web/images/check_icon.png",
                    height: "1.5em", width: "1.5em", style: "right_corner", padding: {left: "0.25em", bottom: "0.25em", top: "0.35em", right: "0.35em"}, position: {top: 0, right: 0}
                }));    
            }
            else
            {
                t_card.equipped = false;
                if(t_engine) t_engine.SingleCommand(t_card.object_path + ".delete");
                else engine.SingleCommand(t_card.object_path + ".delete");
                t_card.object_path = null;
                t_card.checkmark.remove();
                t_card.checkmark = null;
            }
        }
        t_card.ToggleEquipment = ToggleEquipment;

        async function PrepareEquipment()
        {
            /// make sure can't click while processing
            t_card.classList.add("no_events");
            t_card.checkmark.SetPicture("/web/images/refresh_icon.png");

            if(t_onbusy) t_onbusy();

            if(t_engine)
            {
                let t_data = await t_engine.SingleCommand("wear", {
                    avatar_id: t_avatarID,
                    avatar_path: t_avatarPath,
                    avatar_url: t_avatarURL,
                    cloth: {id: t_resourceID, name: t_resourceName, category: t_resourceCategory}
                });
                t_resourceID = t_data.cloth_id;
                t_objectPath = t_data.cloth_path;
                t_ready = true;
            }
            else
            {
                let t_data = await engine.CreateAvatarClothing(t_avatarID, t_avatarURL, t_avatarPath, {id: t_resourceID, name: t_resourceName, category: t_resourceCategory});
                t_resourceID = t_data.cloth_id;
                t_objectPath = t_data.cloth_path;
                t_ready = true;
            }

            if(t_onidle) t_onidle();

            t_card.classList.remove("no_events");

            /// set as equipped
            t_card.equipped = true;
            t_card.object_path = t_objectPath;
            t_card.checkmark.SetPicture("/web/images/check_icon.png");

            if(t_onequip) t_onequip(t_objectPath);
        }
        t_card.PrepareEquipment = PrepareEquipment;

        return t_card;
    }

    static async CreateAvatarPartEditor(_parameters)
    {
        let t_avatar = _parameters.avatar_object;
        let t_avatarInfo = _parameters.avatar_info;
        let t_category = _parameters.category;
        let t_folder = _parameters.folder;
        let t_title = _parameters.title;
        let t_engine = _parameters.remote_engine;
        let t_onlyOne = _parameters.only_one || false;
        let t_onbusy = _parameters.onbusy;
        let t_onidle = _parameters.onidle;
        let t_color = _parameters.color || false;

        let t_avatarID = atob(t_avatar.url).slice(3);
        if(!t_avatarInfo) t_avatarInfo = await KipAPI.GetAvatar(t_avatarID);
        if(!_parameters.item_list) _parameters.item_list = t_avatarInfo[t_category] || [];

        function ListByReference(_array)
        {
            let t_list = {};
            for(let item of _array) t_list[item.reference] = {id: item.id, name: item.name, reference: item.reference};    
            return t_list;
        }
        let t_itemList = ListByReference(_parameters.item_list);

        /// list the parts equipped
        let t_equipped = [];
        for(let i = 1; i < t_avatar.childs.length; i++) if(t_avatar.childs[i].description) t_equipped.push({id: atob(t_avatar.childs[i].description).slice(3), path: t_avatar.childs[i].object_path, color: t_avatar.childs[i].meshObject.color});
        function FindAvatarObject(res_id)
        {
            for(let item of t_equipped) if(item.id === res_id) return item;
            return null;
        }

        /// keep track of all the resources so that the drop function is only triggered for new resources
        let t_referenceList = [];

        /// keep track of equipment under processing
        let t_processCount = 0;
        function AddProcess()
        {
            if(t_processCount == 0 && t_onbusy) t_onbusy();
            t_processCount++; 
        }
        function RemoveProcess()
        {
            t_processCount--; 
            if(t_processCount == 0 && t_onidle) t_onidle();
        }

        let OnEquip = null;
        if(t_color == true) OnEquip = UpdateColor;

        
        let t_loaded = false;
        let t_list = null;
        let t_selected = null;
        let t_menu = Builder.CreateCollapseMenu({
                style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: false, show_button: true, button_size: "1.2em",
                onexpand: function() {
                    if(t_loaded == true) return;
                    t_loaded = true;

                    t_list = t_menu.AppendBottom(Builder.CreateList({
                        height: _parameters.height || "12em",
                        scroll: true
                    }));

                    if(t_color == true) CreateColorPalette(t_list);

                    KipAPI.RequestItemList(t_folder, false, "", "", 0, 100).then(t_resources => {
                        for(let i = 0; i < t_resources.length; i++)
                        {
                            let t_item = t_itemList[t_resources[i]._id];
                            if(t_item) t_item.listed = true;
                            
                            let t_obj = t_item ? FindAvatarObject(t_item.id) : null;
                            if(t_obj && t_color == true) SetColor(t_obj.color);

                            EngineUI.CreateEquipmentCard({
                                resource_id: t_item ? t_item.id : t_resources[i]._id,
                                resource_name: t_item ? t_item.name : t_resources[i].title,
                                reference_id: t_resources[i]._id,
                                category: t_category,
                                avatar_path: t_avatar.object_path,
                                avatar_id: t_avatarID,
                                avatar_url: t_avatarInfo.model_url,
                                object_path: t_obj ? t_obj.path : null,
                                engine: t_engine,
                                ready: t_item ? true : false,
                                onclick: t_onlyOne == false ? null : function(_card) {
                                    /// if only one at a time, unequip the previously selected one
                                    if(t_selected != null)
                                    {
                                        if(t_selected != _card) t_selected.ToggleEquipment();
                                        else _card = null;
                                    }
                                    t_selected = _card;
                                },
                                onbusy: AddProcess,
                                onidle: RemoveProcess,
                                onequip: OnEquip
                            }).then(_card => {
                                t_list.appendChild(_card);
                                if(t_obj) t_selected = _card;
                            });

                            t_referenceList.push(t_resources[i]._id);
                        }

                        /// also list the items in the avatar inventory that have not already been listed above
                        for(let id in t_itemList)
                        {
                            let t_item = t_itemList[id];
                            if(t_item.listed) continue;

                            let t_obj = t_item ? FindAvatarObject(t_item.id) : null;
                            if(t_obj && t_color == true) SetColor(t_obj.color);

                            EngineUI.CreateEquipmentCard({
                                resource_id: t_item.id,
                                resource_name: t_item.name,
                                reference_id: t_item.reference,
                                category: t_category,
                                avatar_path: t_avatar.object_path,
                                avatar_id: t_avatarID,
                                avatar_url: t_avatarInfo.model_url,
                                object_path: t_obj ? t_obj.path : null,
                                engine: t_engine,
                                ready: true,
                                onclick: t_onlyOne == false ? null : function(_card) {
                                    /// if only one at a time, unequip the previously selected one
                                    if(t_selected)
                                    {
                                        if(t_selected != _card) t_selected.ToggleEquipment();
                                        else _card = null;
                                    }
                                    t_selected = _card;
                                },
                                onequip: OnEquip
                            }).then(_card => {
                                t_list.appendChild(_card);
                                if(t_obj) t_selected = _card;
                            });

                            t_referenceList.push(t_item.reference);
                        }
                    });
                }
            }, [
                Builder.CreateTextBox({ text: t_title, margins: "0.25em", size: "1.2em", weight: 600, align: 'center', width: "100%", text_align: "center", onclick: function() {t_menu.Toggle()}  })
        ]);



        Builder.SetupDrop(t_menu, function(_data, _file, _event) {
            if(_data) try { _data = JSON.parse(_data); } catch(e) {}

            /// check that the category is amongst the tags of the resource
            if(!_data.tags || !_data.tags.includes(t_category))
            {
                console.log("wrong category");
                return;
            }

            /// if the resource is already loaded, ignore
            if(t_referenceList.includes(_data._id)) return;

            /// if a resource is dropped, a new card is created and the equipment process is triggered
            EngineUI.CreateEquipmentCard({
                resource_id: _data._id,
                resource_name: _data.name,
                reference_id: _data._id,
                category: t_category,
                avatar_path: t_avatar.object_path,
                avatar_id: t_avatarID,
                avatar_url: t_avatarInfo.model_url,
                engine: t_engine,
                ready: false,
                onbusy: AddProcess,
                onidle: RemoveProcess,
                onequip: OnEquip
            }).then(_card => {
                t_list.appendChild(_card);
                _card.PrepareEquipment();
            });

        }, false);


        let t_customColor = [1.0, 1.0, 1.0];
        let t_customMetallicness = 0.0;
        let t_rgbMenu = null;
        let t_metalMenu = null;
        function CreateColorPalette(_list)
        {
            let t_customMenu = _list.appendChild(Builder.CreateBox({
                width: "11em", margin: "0.25em",
                style: "rounded shadow no_overflow", margin: "0.25em"
            }));

            t_rgbMenu = Builder.CreateRGBInput({
                value: t_customColor,
                width: "6em",
                height: "2.5em",
                margin: "0.25em",
                onchange: function(_rgb) {
                    t_customColor = _rgb;
                    t_engine.SingleCommand(t_selected.object_path + ".mesh.color", _rgb);
                }
            });

            t_metalMenu = Builder.CreateRangeInput({
                value: t_customMetallicness, min: 0.0, max: 1.0, step: 0.005,
                wheel_input: 0.05,
                drag_input: 0.005,
                trail_color: "#666d76", channel_width: "100%", width: "8em", hide_digits: true,
                onchange: function(_val) {
                    t_customMetallicness = _val;
                    t_engine.SingleCommand(t_selected.object_path + ".mesh.materials.0.metallicness", _val);
                    t_engine.SingleCommand(t_selected.object_path + ".mesh.materials.1.metallicness", _val);
                }
            });

            t_customMenu.appendChild(Builder.CreateHorizontalList({width: "100%", spread: true, margin: "0.25em"}, [
                Builder.CreateTextBox({
                    text: "Color",
                    weight: "500",
                    margin: " 0.25em",
                    weight: 500
                }),
                t_rgbMenu
            ]));
            // t_customMenu.appendChild(Builder.CreateHorizontalList({width: "100%", spread: true, margin: "0.25em"}, [
            //     Builder.CreateTextBox({
            //         text: "Shine",
            //         weight: "400",
            //         margin: " 0.25em",
            //     }),
            //     Builder.CreateRangeInput({
            //         value: t_customShininess, min: 0.0, max: 1.0, step: 0.005,
            //         wheel_input: 0.05,
            //         drag_input: 0.005,
            //         trail_color: "#c7effa", channel_width: "100%", width: "8em", hide_digits: true,
            //         onchange: function(_val) {
            //             t_customShininess = _val;
            //             remote_engine.SingleCommand(avatar_object.object_path + ".mesh.materials.6.roughness", 1.0 - _val);
            //         }
            //     })
            // ]));
            t_customMenu.appendChild(Builder.CreateHorizontalList({width: "100%", spread: true, margin: "0.25em"}, [
                Builder.CreateTextBox({
                    text: "Metal",
                    weight: "400",
                    margin: " 0.25em",
                }),
                t_metalMenu
            ]));
        }

        function SetColor(_rgb)
        {
            t_customColor = _rgb;
            t_rgbMenu.SetValue(_rgb);
        }

        function UpdateColor(object_path)
        {
            t_engine.SingleCommand(object_path + ".mesh.color", t_customColor);
            t_engine.SingleCommand(object_path + ".mesh.materials.0.metallicness", t_customMetallicness);
            t_engine.SingleCommand(object_path + ".mesh.materials.1.metallicness", t_customMetallicness);    
        }
        
        return t_menu;
    }

    static async CreateAvatarMaterialEditor(_parameters)
    {
        let t_resourceFolder = _parameters.folder;
        let t_engine = _parameters.engine;
        let t_avatarObject = _parameters.avatar_object;
        let t_materialPaths = _parameters.material_paths;
        let t_category = _parameters.category;
        let t_customize = _parameters.customize || "";
        let t_onchange = _parameters.onchange;
        let t_currentID = _parameters.current_material;


        function ToggleCheckmark(_ele, last_element = null)
        {
            if(last_element && last_element.checkmark)
            {
                last_element.checkmark.remove();
                last_element.checkmark = null;
            }

            _ele.checkmark = _ele.appendChild(Builder.CreatePictureFrame({
                image: "/web/images/check_icon.png",
                height: "1.5em", width: "1.5em", style: "right_corner", padding: {left: "0.25em", bottom: "0.25em", top: "0.35em", right: "0.35em"}, position: {top: 0, right: 0}
            }));

            return _ele;
        }


        let t_loaded = false;
        let t_selected = null;
        let t_menu = Builder.CreateCollapseMenu({
            style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: false, show_button: true, button_size: "1.2em",
            onexpand: function() {
                if(t_loaded == true) return;
                t_loaded = true;

                /// get the list of available resources
                let t_materialList = t_menu.AppendBottom(Builder.CreateList({
                    height: "14em",
                    scroll: true,
                    width: "100%"
                }));

                CreateCustomizationPalette(t_materialList);

                KipAPI.RequestItemList(t_resourceFolder, false, "", "", 0, 100).then(t_resources => {
                    for(let i = 0; i < t_resources.length; i++)
                    {
                        let t_resourceID = t_resources[i]._id;
            
                        let t_card = Builder.CreatePictureCard({
                            picture_url: "/web/images/resource_icon.png",
                            picture_title: t_resources[i].name,
                            width: "8em",
                            height: "8em",
                            radius: "1em",
                            size: mobileWebsite == true ? "0.7em" : "0.7em",
                            margin: mobileWebsite == true ? "0.1em" : "0.25em",
                            style: "small_shadow",
                            onleftclick: function(_resource) {
                                if(t_resources[i].type === "texture" || t_resources[i].type === "image")
                                {
                                    for(let t_path of t_materialPaths) t_engine.SingleCommand(t_path + ".diffuse", btoa("///" + t_resourceID));
                                }
                                else if(t_resources[i].type === "material")
                                {
                                    /// replace material
                                    KipAPI.RequestResourceInfo(t_resourceID).then(_data => {
                                        try {
                                            let t_props = JSON.parse(atob(_data.properties));
                                            let PBR = t_props.texture.PBR;
                                            for(let t_path of t_materialPaths)
                                            {
                                                t_engine.SingleCommand(t_path + ".diffuse", btoa(PBR.color || "//default_col"));
                                                t_engine.SingleCommand(t_path + ".normal", btoa(PBR.normal || "//default_norm"));
                                                t_engine.SingleCommand(t_path + ".material", btoa(PBR.material || "//default_mat"));    
                                            }

                                            // if(t_category === "eyelashes")
                                            // {
                                            //     t_engine.SingleCommand(t_materialPaths[0] + ".shader", btoa("//forward_skin"));
                                            //     t_engine.SingleCommand(t_materialPaths[0] + ".transparency", 0.0);
                                            //     t_engine.SingleCommand(t_materialPaths[0] + ".roughness", 1.0);
                                            // }
                                        }
                                        catch(err) {console.log(err)}    
                                    });
                                }

                                if(t_onchange)
                                {
                                    let t_res = {id: t_resourceID};
                                    if(t_customColor) t_res.color = t_customColor;
                                    if(t_customShininess) t_res.roughness = 1.0 - t_customShininess;
                                    if(t_customMetallicness) t_res.metallicness = t_customMetallicness;
                                    t_onchange(t_res);
                                }

                                t_selected = ToggleCheckmark(t_card, t_selected);
                            },
                        });
                        t_card.id = t_resourceID;
            
                        UserMenu.LoadResourcePicture("///" + t_resourceID).then(img_url => {
                            if(img_url)
                            {
                                t_card.children[0].src = img_url;
                                t_card.SetFilter('none');
                                t_card.SetImageScale(1.0);        
                            }
                            else t_card.SetFilter('brightness(0)');
                        });
            
                        t_materialList.appendChild(t_card);
            
                        if(t_resourceID === t_currentID) t_selected = ToggleCheckmark(t_card);
                    }
                })
            },
        }, [Builder.CreateTextBox({ text: _parameters.title, margins: "0.25em", size: "1.2em", weight: 600, align: 'center', width: "100%", text_align: "center", onclick: function() {t_menu.Toggle()}  })]
        );


        let t_customColor = null;
        let t_customShininess = null;
        let t_customMetallicness = null;
        let t_rgbMenu = null;
        let t_shineMenu = null;
        let t_metalMenu = null;
        function CreateCustomizationPalette(_list)
        {
            let t_customMenu;
            function CreateCustomMenu()
            {
                t_customMenu = _list.appendChild(Builder.CreateBox({
                    width: "11em", margin: "0.25em",
                    style: "rounded shadow no_overflow", margin: "0.25em",
                }));    
            }

            if(t_customize.includes("color"))
            {
                if(!t_customMenu) CreateCustomMenu();

                t_engine.SingleCommand(t_materialPaths[0] + ".color").then(_rgb => SetColor(_rgb));

                t_rgbMenu = Builder.CreateRGBInput({
                    value: [1.0, 1.0, 1.0],
                    width: "6em",
                    height: "2.5em",
                    margin: "0.25em",
                    onchange: function(_rgb) {
                        t_customColor = _rgb;
                        for(let t_path of t_materialPaths) t_engine.SingleCommand(t_path + ".color", _rgb);
                    }
                });

                t_customMenu.appendChild(Builder.CreateHorizontalList({width: "100%", spread: true, margin: "0.25em"}, [
                    Builder.CreateTextBox({
                        text: "Color",
                        weight: "500",
                        margin: " 0.25em",
                        weight: 500
                    }),
                    t_rgbMenu
                ]));
            }

            if(t_customize.includes("roughness"))
            {
                if(!t_customMenu) CreateCustomMenu();

                t_engine.SingleCommand(t_materialPaths[0] + ".roughness").then(_roughness => SetRoughness(_roughness));

                t_shineMenu = Builder.CreateRangeInput({
                    value: 0.0, min: 0.0, max: 1.0, step: 0.005,
                    wheel_input: 0.05,
                    drag_input: 0.005,
                    trail_color: "#c7effa", channel_width: "100%", width: "8em", hide_digits: true,
                    onchange: function(_val) {
                        t_customShininess = _val;
                        for(let t_path of t_materialPaths) t_engine.SingleCommand(t_path + ".roughness", 1.0 - _val);
                    }
                })
                t_customMenu.appendChild(Builder.CreateHorizontalList({width: "100%", spread: true, margin: "0.25em"}, [
                    Builder.CreateTextBox({
                        text: "Shine",
                        weight: "400",
                        margin: " 0.25em",
                    }),
                    t_shineMenu
                ]));
            }

            if(t_customize.includes("metallicness"))
            {
                if(!t_customMenu) CreateCustomMenu();
            
                t_engine.SingleCommand(t_materialPaths[0] + ".metallicness").then(_metal => SetMetallicness(_metal));

                t_metalMenu = Builder.CreateRangeInput({
                    value: 1.0, min: 0.0, max: 1.0, step: 0.005,
                    wheel_input: 0.05,
                    drag_input: 0.005,
                    trail_color: "#666d76", channel_width: "100%", width: "8em", hide_digits: true,
                    onchange: function(_val) {
                        t_customMetallicness = _val;
                        for(let t_path of t_materialPaths) t_engine.SingleCommand(t_path + ".metallicness", _val);
                    }
                });
                t_customMenu.appendChild(Builder.CreateHorizontalList({width: "100%", spread: true, margin: "0.25em"}, [
                    Builder.CreateTextBox({
                        text: "Metal",
                        weight: "400",
                        margin: " 0.25em",
                    }),
                    t_metalMenu
                ]));
            }
        }

        function SetColor(_rgb)
        {
            t_customColor = _rgb;
            t_rgbMenu.SetValue(t_customColor);
        }

        function SetRoughness(_roughness)
        {
            t_customShininess = 1.0 - _roughness;
            t_shineMenu.SetValue(t_customShininess, false)
        }

        function SetMetallicness(_metallicness)
        {
            t_customMetallicness = _metallicness;
            t_metalMenu.SetValue(t_customMetallicness, false);
        }

        return t_menu;
    }

    static async SaveAvatar(avatar_path, model_id, remote_engine = null)
    {
        // console.log("save avatar....");
        let t_obj = null;
        if(remote_engine) t_obj = await remote_engine.SingleCommand(avatar_path + ".json", "no_id");
        else t_obj = engine.SingleCommand(avatar_path + ".json", "no_id");

        /// remove unimportant data
        if(t_obj.id) t_obj.id = null;
        if(t_obj.position) t_obj.position = null;
        if(t_obj.rotation) t_obj.rotation = null;
        if(t_obj.scale) t_obj.scale = null;
        if(t_obj.animators) t_obj.animators = null;
        if(t_obj.passive) t_obj.passive = null;

        /// remove the physical ball at the base of the avatar
        for(let i = 0; i < t_obj.childs.length; i++)
        {
            if(t_obj.childs[i].name === "physics_ball")
            {
                t_obj.childs[i] = t_obj.childs[t_obj.childs.length - 1];
                t_obj.childs.pop();
                break;
            }
        }

        /// update avatar model
        let properties = {
            model: ToolBox.RemoveNULLs(t_obj)
        }
        // console.log(properties);
        let success = await KipAPI.RequestResourceUpdate(model_id, {properties: btoa(JSON.stringify(properties))});
    }

    static async CreateAvatarEditor(avatar_object, avatar_data = null, remote_engine = null, on_busy = null, on_idle = null)
    {
        // console.log("create avatar menu")
        /// get avatar model id
        let avatar_id = atob(avatar_object.url).slice(3);
        let t_avatarData = avatar_data;
        if(!t_avatarData) t_avatarData = await KipAPI.GetAvatar(avatar_id);
        if(!t_avatarData.clothing) t_avatarData.clothing = [];
        if(!t_avatarData.eyebrows) t_avatarData.eyebrows = [];
        if(!t_avatarData.hairstyles) t_avatarData.hairstyles = [];
        if(!t_avatarData.beards) t_avatarData.beards = [];
        if(!t_avatarData.name) t_avatarData.name = "My Avatar";
        if(!t_avatarData.body) t_avatarData.body = {};

        let t_menu = Builder.CreateColumn({
            width: "100%",
            min_height: "17em", max_height: (mobileWebsite == true ? "20vh" : "100%"),
            scrollbar: true,
            overflow_x: "hidden"
        });

        t_menu.appendChild(Builder.CreateTextBox({
            text: "Avatar Properties",
            size:"1.3em",
            weight: 600,
            align: "center",
            margin: "0.75em"
        }));

        /// resource title
        t_menu.appendChild(Builder.CreateTextEditor({
			text: t_avatarData.name,
			size: "1.2em",
			weight: 600,
            text_align: "center",
            width: "100%",
			margins: {left: "0.5em", right: "0.5em", top: "1em", bottom: "0.5em"},
			max_height: "1.5em",
            resize: "none",
			disable: true,
			validate_function: function(_text) {
                t_avatarData.name = _text;
                KipAPI.UpdateAvatar(avatar_id, "name", null, _text);
			}
		}));


        function ToggleCheckmark(_ele, last_element = null)
        {
            if(last_element && last_element.checkmark)
            {
                last_element.checkmark.remove();
                last_element.checkmark = null;
            }

            _ele.checkmark = _ele.appendChild(Builder.CreatePictureFrame({
                image: "/web/images/check_icon.png",
                height: "1.5em", width: "1.5em", style: "right_corner", padding: {left: "0.25em", bottom: "0.25em", top: "0.35em", right: "0.35em"}, position: {top: 0, right: 0}
            }));

            return _ele;
        }

        let t_bodyUpdates = {};
        t_menu.GetBodyUpdates = function()
        {
            return t_bodyUpdates;
        }

        /// skin color
        {
            let t_skinMenu = t_menu.appendChild(Builder.CreateCollapseMenu({ style: "frost_glass shadow", width: "100%", margin: "0.5em", expand: false, show_button: true, button_size: "1.2em" },
                [Builder.CreateTextBox({ text: "Skin Color", margins: "0.25em", size: "1.2em", weight: 600, align: 'center', width: "100%", text_align: "center", onclick: function() {t_skinMenu.Toggle()} })]
            ));

            let t_skinList = t_skinMenu.AppendBottom(Builder.CreateList({
                height: "10em",
                scroll: true
            }))

            let t_currentColor = t_avatarData.body.skin ? ToolBox.RGBToHex(t_avatarData.body.skin.color) : "ecb8a2";

            let t_skinColors = [
                {name: "white", color: "#ecb8a2"},
                {name: "beige", color: "#f8caa5"},
                {name: "brown", color: "#d79f79"},
                {name: "black", color: "#5a4435"},
                {name: "yellow", color: "#aa725a"},
                {name: "red", color: "#c77e57"}
            ];

            let t_currentSkin = null;
            for(let i = 0; i < t_skinColors.length; i++)
            {
                let t_skin = t_skinList.appendChild(Builder.CreateBox({
                    width: "6em", height: "3em", style: "rounded shadow no_overflow", margin: "0.5em",
                    color: t_skinColors[i].color,
                    onclick: function(ev) {
                        let t_color = ToolBox.HexToRGB(t_skinColors[i].color);
                        remote_engine.SingleCommand(avatar_object.object_path + ".mesh.materials.0.color", t_color);

                        t_bodyUpdates.skin = {color: t_color};
                        t_currentSkin = ToggleCheckmark(t_skin, t_currentSkin);
                    }
                }));
                t_skinColors[i].element = t_skin;

                if(t_skinColors[i].color === t_currentColor) t_currentSkin = ToggleCheckmark(t_skinColors[i].element);
            }

            let t_customSkinColor = [198 / 255.0, 221 / 255.0, 214 / 255.0];
            let t_customSkin = t_skinList.appendChild(Builder.CreateHorizontalList({style: "rounded shadow no_overflow", margin: "0.25em"}, [
                Builder.CreateTextBox({
                    text: "Custom",
                    weight: "500",
                    margin: " 0.25em",
                    onclick: function() {
                        remote_engine.SingleCommand(avatar_object.object_path + ".mesh.materials.0.color", t_customSkinColor);
                        t_currentSkin = ToggleCheckmark(t_customSkin, t_currentSkin);
                    }
                }),
                Builder.CreateRGBInput({
                    value: t_customSkinColor,
                    width: "6em",
                    height: "2.5em",
                    margin: "0.25em",
                    onchange: function(_rgb) {
                        t_customSkinColor = _rgb;
                        remote_engine.SingleCommand(avatar_object.object_path + ".mesh.materials.0.color", _rgb);
                    }
                })
            ]));
        }

        /// eyes - TODO: separate eyes
        EngineUI.CreateAvatarMaterialEditor({
            title: "Eyes",
            folder: "/5a3c0a34b95dffffffffffff/textures/avatars/eyes",
            engine: remote_engine,
            avatar_object: avatar_object,
            material_paths: [avatar_object.object_path + ".mesh.materials.2", avatar_object.object_path + ".mesh.materials.4"],
            category: "eyes",
            customize: "",
            current_material: t_avatarData.body.left_eye ? t_avatarData.body.left_eye.id : null,
            onchange: function(_res) {
                t_bodyUpdates.left_eye = _res;
                t_bodyUpdates.right_eye = _res;
            }
        }).then(_menu => {
            t_menu.appendChild(_menu);
        });

        /// eyelashes
        EngineUI.CreateAvatarMaterialEditor({
            title: "Eyelashes",
            folder: "/5a3c0a34b95dffffffffffff/textures/avatars/eyelashes",
            engine: remote_engine,
            avatar_object: avatar_object,
            material_paths: [avatar_object.object_path + ".mesh.materials.7"],
            category: "eyelashes",
            customize: "color",
            current_material: t_avatarData.body.eyelashes ? t_avatarData.body.eyelashes.id : null,
            onchange: function(_res) {
                t_bodyUpdates.eyelashes = _res;
            }
        }).then(_menu => {
            t_menu.appendChild(_menu);
        });
        
        /// nails
        EngineUI.CreateAvatarMaterialEditor({
            title: "Nails",
            folder: "/5a3c0a34b95dffffffffffff/textures/avatars/nails",
            engine: remote_engine,
            avatar_object: avatar_object,
            material_paths: [avatar_object.object_path + ".mesh.materials.6"],
            category: "nails",
            customize: "color roughness metallicness",
            current_material: t_avatarData.body.nails ? t_avatarData.body.nails.id : null,
            onchange: function(_res) {
                t_bodyUpdates.nails = _res;
            }
        }).then(_menu => {
            t_menu.appendChild(_menu);
        });

        /// keep track of menus under processing
        let t_processCount = 0;
        function AddProcess()
        {
            if(t_processCount == 0 && on_busy) on_busy();
            t_processCount++; 
        }
        function RemoveProcess()
        {
            t_processCount--; 
            if(t_processCount == 0 && on_idle) on_idle();
        }

        /// eyebrows
        EngineUI.CreateAvatarPartEditor({
            title: "Eyebrows",
            avatar_object: avatar_object,
            avatar_info: t_avatarData,
            remote_engine: remote_engine,
            item_list: t_avatarData.eyebrows,
            category: "eyebrows",
            folder: "/5a3c0a34b95dffffffffffff/models/avatars/accessories/eyebrows",
            only_one: true,
            color: true,
            onbusy: AddProcess,
            onidle: RemoveProcess
        }).then(_editor => {t_menu.appendChild(_editor)});

        /// hairs
        EngineUI.CreateAvatarPartEditor({
            title: "Hair Style",
            avatar_object: avatar_object,
            avatar_info: t_avatarData,
            remote_engine: remote_engine,
            item_list: t_avatarData.hairstyles,
            category: "hairstyles",
            folder: "/5a3c0a34b95dffffffffffff/models/avatars/accessories/hairstyles",
            only_one: true,
            color: true,
            onbusy: AddProcess,
            onidle: RemoveProcess
        }).then(_editor => {t_menu.appendChild(_editor)});

        /// beards
        EngineUI.CreateAvatarPartEditor({
            title: "Beards",
            avatar_object: avatar_object,
            avatar_info: t_avatarData,
            remote_engine: remote_engine,
            item_list: t_avatarData.beards,
            category: "beards",
            folder: "/5a3c0a34b95dffffffffffff/models/avatars/accessories/beards",
            only_one: true,
            color: true,
            onbusy: AddProcess,
            onidle: RemoveProcess
        }).then(_editor => {t_menu.appendChild(_editor)});
        
        /// clothing
        EngineUI.CreateAvatarPartEditor({
            title: "Clothing",
            avatar_object: avatar_object,
            avatar_info: t_avatarData,
            remote_engine: remote_engine,
            item_list: t_avatarData.clothing,
            category: "clothing",
            folder: "/5a3c0a34b95dffffffffffff/models/avatars/clothing",
            only_one: false,
            onbusy: AddProcess,
            onidle: RemoveProcess
        }).then(_editor => {t_menu.appendChild(_editor)});
        

        return t_menu;
    }


    static async CreateAvatarMenu(avatar_object, remote_engine = null)
    {
        let t_menu = Builder.CreateColumn({
            width: "100%",
            height: "100%",
            scrollbar: true,
            overflow_x: "hidden"
        });

        t_menu.appendChild(Builder.CreateTextBox({
            text: "Avatar Properties",
            size:"1.3em",
            weight: 600,
            align: "left",
            margin: "0.75em"
        }));

        if(typeof engine !== "undefined")
        {
            t_menu.appendChild(Builder.CreateJSONEditor({
                name: "User",
                size: "1.2em",
                json: engine.SingleCommand("users.attributes.json")
            }));    
        }

        let t_modelID = atob(avatar_object.url).slice(3);
        EngineUI.CreateAvatarPartEditor({
            title: "Clothing",
            avatar_object: avatar_object,
            remote_engine: remote_engine,
            category: "clothing",
            folder: "/5a3c0a34b95dffffffffffff/models/avatars/clothing",
            only_one: false,
            height: "20em"
        }).then(_menu => {
            t_menu.appendChild(_menu);
            _menu.AppendTop(Builder.CreatePressButton({
                text: "Save",
                image: "/web/images/save_icon.png",
                margins: "0.25em",
                onclick: function() {
                    EngineUI.SaveAvatar(avatar_object.object_path, t_modelID, remote_engine);
                }
            }))
        });


        return t_menu;
    }


    static CreateChatBox(user_id, user_name, send_func = null)
    {
        let menu = Builder.CreateFloatingBox({
            width: "20em",
            height: "20em",
            align: "right",
            // allow_drag: true,
            style: "white_border rounded dark",
            onhide: function() {
                t_minimize.style.display = "block";
            }
        });
        menu.id = 'chat_box';
        menu.style.left = "calc(100% - 10.5em)";
        menu.style.display = "none";

        let t_minimize = document.body.appendChild(Builder.CreatePictureFrame({
            image: "/web/images/bubble_icon.png",
            width: "2em",
            height: "2em",
            position: {
                center_y: true,
                right: "0.5em"
            },
            onclick: function() {
                menu.style.display = "block";
                t_minimize.style.display = "none";
            }
        }));

        let t_chat = menu.AppendElement(Builder.CreateColumn({
            width: "100%",
            height: "70%",
            scrollbar: true
        }));

        let t_input = menu.AppendElement(Builder.CreateTextEditor({
            placeholder: "write message",
            allow_shortcuts: true,
            no_disable: true,
            width: "100%",
            margin: "0.25em",
            height: "30%",
            resize: "none",
            position: {bottom: 0},
            validate_function: function(_text) {
                menu.UpdateChatBox(user_id, user_name, _text);
                t_input.Clear();

                /// trigger send function with the message
                if(send_func) send_func(_text);
            }
        }));
        t_input.children[0].style.boxShadow = "none";

        menu.UpdateChatBox = function(message_user_id, message_user_name, _text)
        {
            if(_text.length == 0) return;

            let t_message = t_chat.appendChild(Builder.CreateBox({
                width: "80%",
                align: (message_user_id === user_id ? "right" : "left"),
                margins: {left: "0.5em", right: "0.5em", top: "0.5em"},
                padding: "0.5em",
                style: "rounded dark"
            }));
            t_message.appendChild(Builder.CreateTextBox({
                text: (message_user_id === user_id ? "Me" : message_user_name),
                color: "white",
                weight: message_user_id === user_id ? "bold" : "normal",
                width: "100%",
                size: "1.1em",
                text_align: "left",
                // margins: {left: "0.5em", right: "0.5em"}
            }));
            t_message.appendChild(Builder.CreateTextBox({
                text: _text,
                color: "white",
                weight: message_user_id === user_id ? "bold" : "normal",
                size: "0.9em",
                width: "100%"
            }));
            t_chat.scrollTop = 100000;
        }

        menu.LoadHistory = function(_data)
        {
            for(let m of _data)
            {
                menu.UpdateChatBox(m.id, m.u, m.m);
            }
        }

        return menu;
    }


    static CreateJoystick(_parameters)
    {
        let t_joystick = document.createElement('div');
        t_joystick.className = 'joystick';
        if(_parameters.id) t_joystick.id = _parameters.id;
        t_joystick.innerHTML = `<div class='stick'></div>`;

        let t_defaultPosition = {x: 0, y: 0};
        if(_parameters.position)
        {
            t_defaultPosition = _parameters.position;
            if(_parameters.position.x) t_joystick.style.left = _parameters.position.x;
            if(_parameters.position.y) t_joystick.style.top = _parameters.position.y;
        }

        let t_stick = t_joystick.children[0];
        let t_startPosition = {x: 0, y: 0};

        t_joystick.SetStartPosition = function(start_pos) {
            t_joystick.style.left = start_pos.x + "px";
            t_joystick.style.top = start_pos.y + "px";
            t_startPosition = start_pos;

            t_stick.style.left = "50%";
            t_stick.style.top = "50%";
        }

        t_joystick.SetPosition = function(move_pos) {
            t_stick.style.left = "calc(50% + " + (move_pos.x - t_startPosition.x) + "px)";
            t_stick.style.top = "calc(50% + " + (move_pos.y - t_startPosition.y) + "px)";
        }

        t_joystick.ResetPosition = function() {
            t_joystick.style.left = t_defaultPosition.x;
            t_joystick.style.top = t_defaultPosition.y;
            t_stick.style.left = "50%";
            t_stick.style.top = "50%";
        }

        return t_joystick;
    }

    static CreateScreenButton(_parameters)
    {
        let t_button = document.createElement('div');
        t_button.className = "screen_button";

        if(_parameters.position)
        {
            if(_parameters.position.x) t_button.style.left = _parameters.position.x;
            if(_parameters.position.y) t_button.style.top = _parameters.position.y;
        }

        let t_image = null;
        if(_parameters.image)
        {
            t_image = t_button.appendChild(document.createElement('img'));
            t_image.src = _parameters.image;
        }

        if(_parameters.ontouchstart)
        {
            t_button.ontouchstart = function(event) {
                event.returnValue = false;  /// prevent long press menu for ios safari
                Builder.StopPropagation(event);
                _parameters.ontouchstart(event);
                return false;
            }
        }
        if(_parameters.ontouchmove)
        {
            t_button.ontouchmove = function(event) {
                event.returnValue = false;  /// prevent long press menu for ios safari
                Builder.StopPropagation(event);
                _parameters.ontouchmove(event);
                return false;
            }
        }
        if(_parameters.ontouchend)
        {
            t_button.ontouchend = function(event) {
                event.returnValue = false;  /// prevent long press menu for ios safari
                Builder.StopPropagation(event);
                _parameters.ontouchend(event);
                return false;
            }
        }

        return t_button;
    }
}