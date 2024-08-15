window.maxZIndex = 1000;
if(navigator.userAgent.match(/Mobi/i) || navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i))
{
    window.isMobile = true;
}
else
{
    window.isMobile = false;
}

class ToolBox {
    static Encode(_obj)
    {
        if(!_obj) return;

        if(Array.isArray(_obj))
        {
            for(let i = 0; i < _obj.length; i++)
            {
                let t_type = typeof(_obj[i]);
                if(Array.isArray(_obj[i]) || t_type === "object") ToolBox.Encode(_obj[i]);
                else if(t_type === "string") _obj[i] = btoa(_obj[i]);
            }
        }
        else if(typeof(_obj) === "object")
        {
            let t_keys = Object.keys(_obj);
            for(let i = 0; i < t_keys.length; i++)
            {
                let t_type = typeof(_obj[t_keys[i]]);
                if(Array.isArray(_obj[t_keys[i]]) || t_type === "object") ToolBox.Encode(_obj[t_keys[i]]);
                else if(t_type === "string") _obj[t_keys[i]] = btoa(_obj[t_keys[i]]);
            }
        }
    }

    static Decode(_obj, excluded_keys = [])
    {
        if(!_obj) return;

        if(Array.isArray(_obj))
        {
            for(let i = 0; i < _obj.length; i++)
            {
                let t_type = typeof(_obj[i]);
                if(Array.isArray(_obj[i]) || t_type === "object") ToolBox.Decode(_obj[i], excluded_keys);
                else if(t_type === "string")
                {
                    try {
                        _obj[i] = atob(_obj[i]);
                    } catch(err) {}
                }
            }
        }
        else if(typeof(_obj) === "object")
        {
            let t_keys = Object.keys(_obj);
            for(let i = 0; i < t_keys.length; i++)
            {
                let t_type = typeof(_obj[t_keys[i]]);
                if(Array.isArray(_obj[t_keys[i]]) || t_type === "object") ToolBox.Decode(_obj[t_keys[i]], excluded_keys);
                else if(t_type === "string" && !excluded_keys.includes(t_keys[i]))
                {
                    try {
                        _obj[t_keys[i]] = atob(_obj[t_keys[i]]);
                    } catch(err) {}
                }
            }
        }
    }

    static HexToRGB(h) 
    {
        let r = 0, g = 0, b = 0;

        if (h.length == 4) 
        {
            r = "0x" + h[1] + h[1];
            g = "0x" + h[2] + h[2];
            b = "0x" + h[3] + h[3];
        } 
        else if (h.length == 7) 
        {
            r = "0x" + h[1] + h[2];
            g = "0x" + h[3] + h[4];
            b = "0x" + h[5] + h[6];
        }

        var RGB = [];
        RGB[0] = r / 255;
        RGB[1] = g / 255;
        RGB[2] = b / 255;
        return RGB;
    }

    static HexToRGBA(h) 
    {
        let r = 0, g = 0, b = 0, a = 0;

        if(h.length == 5) 
        {
            r = "0x" + h[1] + h[1];
            g = "0x" + h[2] + h[2];
            b = "0x" + h[3] + h[3];
            a = "0x" + h[4] + h[4];
        } 
        else if(h.length == 9) 
        {
            r = "0x" + h[1] + h[2];
            g = "0x" + h[3] + h[4];
            b = "0x" + h[5] + h[6];
            a = "0x" + h[7] + h[8];
        }

        var RGBA = [];
        RGBA[0] = r / 255;
        RGBA[1] = g / 255;
        RGBA[2] = b / 255;
        RGBA[3] = a / 255;
        return RGBA;
    }

    static RGBToHex(RGB)
    {
        try {
            var r, g, b;
            if('r' in RGB) r = Math.round(255 * RGB.r).toString(16).padStart(2, '0');
            else r = Math.round(255 * RGB[0]).toString(16).padStart(2, '0');
            if('g' in RGB) g = Math.round(255 * RGB.g).toString(16).padStart(2, '0');
            else g = Math.round(255 * RGB[1]).toString(16).padStart(2, '0');
            if('b' in RGB) b = Math.round(255 * RGB.b).toString(16).padStart(2, '0');
            else b = Math.round(255 * RGB[2]).toString(16).padStart(2, '0');
            return '#' + r + g + b;
        }
        catch(err) {
            console.log(err);
            return "#FFFFFF";
        }
    }

    static RGBAToHex(RGBA)
    {
        var r, g, b, a;
        if('r' in RGBA) r = Math.round(255 * RGBA.r).toString(16).padStart(2, '0');
        else r = Math.round(255 * RGBA[0]).toString(16).padStart(2, '0');
        if('g' in RGBA) g = Math.round(255 * RGBA.g).toString(16).padStart(2, '0');
        else g = Math.round(255 * RGBA[1]).toString(16).padStart(2, '0');
        if('b' in RGBA) b = Math.round(255 * RGBA.b).toString(16).padStart(2, '0');
        else b = Math.round(255 * RGBA[2]).toString(16).padStart(2, '0');
        if('a' in RGBA) a = Math.round(255 * RGBA.a).toString(16).padStart(2, '0');
        else a = Math.round(255 * RGBA[3]).toString(16).padStart(2, '0');
        return '#' + r + g + b + a;
    }


    static Clamp(_val, min, max)
    {
        if(_val > max) return max;
        else if(_val < min) return min;
        else return _val;
    }

    static RadToDeg(_val)
    {
        if(Array.isArray(_val))
        {
            let res = [];
            for(let i = 0; i < _val.length; i++) res[i] = _val[i] * (180.0 / Math.PI);
            return res;
        }
        else
        {
            return _val * (180.0 / Math.PI);
        }
    }

    static DegToRad(_val)
    {
        if(Array.isArray(_val))
        {
            let res = [];
            for(let i = 0; i < _val.length; i++) res[i] = _val[i] * (Math.PI / 180.0);
            return res;
        }
        else
        {
            return _val * (Math.PI / 180.0);
        }
    }

    static DirectionToPolar(_dir)
    {
        let phi = Math.asin(_dir[1]);
        let t_len = Math.sqrt(_dir[0] * _dir[0] + _dir[2] * _dir[2]);
        let teta = t_len == 0.0 ? 0.0 : Math.acos(_dir[0] / t_len);
        if(_dir[2] > 0.0) teta = -teta;
        return [phi, teta];
    }

    static DirectionToEuler(direction)
    {
        /// euler angles order: angle to ground (pitch), angle to x (yaw), rotation around direction (roll)
        var dist = Math.sqrt(direction[0] * direction[0] + direction[2] * direction[2]);
        let pitch = Math.acos(dist);
        let yaw = dist != 0.0 ? Math.acos(direction[0] / dist) : 0.0;
        if(direction[2] > 0.0) yaw = 2.0 * Math.PI - yaw;
        let roll = 0.0;
        return [pitch, yaw, roll];
    }

    static NormalToEuler(normal)
    {
        /// euler angles order: angle to ground (pitch), angle to x (yaw), rotation around direction (roll)
        var dist = Math.sqrt(normal[0] * normal[0] + normal[2] * normal[2]);
        let roll = -Math.acos(normal[1]);
        let yaw = Math.acos(normal[0] / dist);
        if(normal[2] > 0.0) yaw = 2.0 * Math.PI - yaw;
        return [0.0, yaw, roll];
    }

    static PolarToDirection_Deg(_angles)
    {
        let t_y = Math.sin(_angles[0] * Math.PI / 180.0);
        let t_len = Math.cos(_angles[0] * Math.PI / 180.0);
        let t_x = t_len * Math.cos(_angles[1] * Math.PI / 180.0);
        let t_z = -t_len * Math.sin(_angles[1] * Math.PI / 180.0);
        return [t_x, t_y, t_z];
    }

    static PolarToDirection(_angles)
    {
        let t_y = Math.sin(_angles[0]);
        let t_len = Math.cos(_angles[0]);
        let t_x = t_len * Math.cos(_angles[1]);
        let t_z = -t_len * Math.sin(_angles[1]);
        return [t_x, t_y, t_z];
    }

    static RandomID(length)
    {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for(var i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * charactersLength));
        return result;
    }

    static BasicEase(_alpha)
    {
        if(_alpha <= 0.0) return 0.0;
        else if(_alpha >= 1.0) return 1.0;
        else return _alpha * _alpha * (3.0 - 2.0 * _alpha);
    }

    static TimeAgo(str, rough = false)
    {
        var time = (Date.now() - new Date(str)) * (0.001 / 60);
    
        var years = Math.floor(time / 525600);
        time -= 525600 * years;
        var days = Math.floor(time / 1440);
        time -= 1440 * days;
        var hours = Math.floor(time / 60);
        time -= 60 * hours;
        var minutes = Math.floor(time);
    
        var html = "";
        if(years > 0) html += years + "y ";
        if(days > 0) html += days + "d ";
        if(rough == true)
        {
            if(html.length == 0) html = "today";    
        }
        else
        {
            if(hours > 0) html += hours + "h ";
            if(minutes > 0) html += minutes + "min ago";
            if(html.length == 0) html = "just now";    
        }
    
        return html;
    }

    static FormatDate(_string)
    {
        let t_data = new Date(_string);
        return t_data.toLocaleString('en-us', { year:"numeric", month:"long", day:"numeric", hour: "numeric", minute: "numeric"});
    }

    static ShrinkString(str, max_length)
    {
        if(str.length <= max_length) return str;

        var l = (max_length - 3) / 2;
        var begin = str.slice(0, l);
        var end = str.slice(-l);
        return begin + "..." + end;
    }

    static RemoveOneFromArray(_arr, _value)
    {
        for(let i = 0; i < _arr.length; i++)
        {
            if(_arr[i] === _value)
            {
                _arr[i] = _arr[_arr.length - 1];
                _arr.pop();
                return;
            }
        }
    }

    static RemoveAllFromArray(_arr, _value)
    {
        for(let i = 0; i < _arr.length; i++)
        {
            if(_arr[i] === _value)
            {
                _arr[i] = _arr[_arr.length - 1];
                _arr.pop();
                i--;
            }
        }
    }

    static RemoveFromArray(_arr, _index)
    {
        if(_index < 0 || _index >= _arr.length) return;
        for(let i = _index; i < _arr.length - 1; i++) _arr[i] = _arr[i + 1];
        _arr.pop();
    }

    static TransferProperties(_dst, _src)
    {
        /// WARNING: does not copy the data
        let t_keys = Object.keys(_src);
        for(let i = 0; i < t_keys.length; i++)
        {
            _dst[t_keys[i]] = _src[t_keys[i]];
            _src[t_keys[i]] = null;
            // delete _src[t_keys[i]];
        }
    }

    static FormatFilename(_name)
    {
        let t_filename = _name.replaceAll(' ', '_').replaceAll('.', '_').replaceAll('/', '_').replaceAll('\\', '_');
        return t_filename.toLowerCase();
    }

    static SeparateFileExtension(file_name)
    {
        /// return the name and the suffix, separately
        let t_title, t_extension;
    
        let t_arr = file_name.split('.');
        if(t_arr.length == 1)
        {
            t_title = file_name;
            t_extension = "";
        }
        else
        {
            t_extension = t_arr[t_arr.length - 1];
            t_arr.pop();
            t_title = t_arr.join("_");    
        }

        return {name: t_title, extension: t_extension};
    }

    static ReadFile(file)
    {
        return new Promise(function(resolve, reject) {
    
            const fileReader = new FileReader();
            fileReader.onload = (event) => {
                resolve(new Uint8Array(event.target.result));
            };
    
            fileReader.onerror = () => {
                console.error('Unable to read file ' + file.name + '.');
                engine.RemoveTempInput();
                reject(null);
            };
    
            fileReader.readAsArrayBuffer(file);
        });
    }

    static DownloadFile(file_blob, file_name = "downloaded_file")
    {
        let link = document.createElement("a");
        link.href = window.URL.createObjectURL(file_blob);
        link.download = file_name;
        link.click();
        link.remove();
    }

    static async VideoSnapshot(file, width, seekTo = 0.0)
    {
        return new Promise((resolve, reject) => {
            const videoPlayer = document.createElement('video');
            videoPlayer.setAttribute('src', URL.createObjectURL(file));
            videoPlayer.load();
            videoPlayer.addEventListener('error', (ex) => {
                reject("error when loading video file", ex);
            });

            // load metadata of the video to get video duration and dimensions
            videoPlayer.addEventListener('loadedmetadata', () => {
                if(0.5 * videoPlayer.duration < seekTo) seekTo = 0.5 * videoPlayer.duration;

                // delay seeking or else 'seeked' event won't fire on Safari
                setTimeout(() => {
                    videoPlayer.currentTime = seekTo;
                }, 200);

                // extract video thumbnail once seeking is complete
                videoPlayer.addEventListener('seeked', () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = Math.floor(width * videoPlayer.videoHeight / videoPlayer.videoWidth);
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(
                        blob => {
                            canvas.remove();
                            videoPlayer.remove();
                            resolve(blob);
                        },
                        "image/webp",
                        0.8
                    );
                });
            });
        });
    }

    static IsImage(_file)
    {
        let t_filename = _file.name;
        if(t_filename.match('.jpg') || t_filename.match('.jpeg') || t_filename.match('.png') || t_filename.match('webp') || t_filename.match('gif') || t_filename.match('pic') || t_filename.match('pnm') || t_filename.match('tga') || t_filename.match('psd') || t_filename.match('hdr')) return true;
        else return false;
    }

    /// this function tries to recursively remove all references - it may or may not be useful; ask Apple, not me
    static CleanupObject(target_obj)
    {
        function DeepCleanup_Array(_obj)
        {
            if(!_obj) return;

            for(let i = 0; i < _obj.length; i++)
            {
                if(!_obj[i]) continue;

                try {
                    if(Array.isArray(_obj[i])) DeepCleanup_Array(_obj[i]);
                    else if(typeof(_obj[i]) === "object") DeepCleanup(_obj[i]);
                }
                catch(e) {}
            }
            _obj = [];
        }

        function DeepCleanup(_obj)
        {
            if(!_obj) return;

            let t_keys = Object.keys(_obj);
            for(let i = 0; i < t_keys.length; i++)
            {
                try {
                    let t_key = t_keys[i];
                    if(!(t_key in _obj)) continue;
                    if(Array.isArray(_obj[t_key])) DeepCleanup_Array(_obj[t_key]);
                    else if(typeof(_obj[t_key]) === "object") DeepCleanup(_obj[t_key]);
                    _obj[t_key] = null;
                    // delete _obj[t_key];    
                }
                catch(e) {}
            }
        }

        DeepCleanup(target_obj);
    }

    static RemoveNULLs(_obj)
    {
        if(Array.isArray(_obj))
        {
            let t_out = [];

            for(let i = 0; i < _obj.length; i++)
            {
                if(_obj[i] === null) continue;
    
                if(typeof(_obj[i]) === "object") t_out.push(ToolBox.RemoveNULLs(_obj[i]));
                else t_out.push(_obj[i]);
            }

            return t_out;
        }
        else
        {
            let t_out = {};

            let t_keys = Object.keys(_obj);
            for(let i = 0; i < t_keys.length; i++)
            {
                let t_key = t_keys[i];
                if(_obj[t_key] === null) continue;
    
                if(typeof(_obj[t_key]) === "object") t_out[t_key] = ToolBox.RemoveNULLs(_obj[t_key]);
                else t_out[t_key] = _obj[t_key];
            }

            return t_out;
        }
    }

    static RemoveSuffix(_obj)
    {
        if(Array.isArray(_obj))
        {
            let t_out = [];

            for(let i = 0; i < _obj.length; i++)
            {
                if(_obj[i] === null) t_out.push(null);
    
                if(typeof(_obj[i]) === "object") t_out.push(ToolBox.RemoveSuffix(_obj[i]));
                else t_out.push(_obj[i]);
            }

            return t_out;
        }
        else
        {
            let t_out = {};

            let t_keys = Object.keys(_obj);
            for(let i = 0; i < t_keys.length; i++)
            {
                let t_key = t_keys[i];
                let t_arr = t_key.split("$");
                let t_key2 = t_arr[0];
    
                if(typeof(_obj[t_key]) === "object") t_out[t_key2] = ToolBox.RemoveSuffix(_obj[t_key]);
                else t_out[t_key2] = _obj[t_key];
            }

            return t_out;
        }        
    }

    static Length(_vector)
    {
        return Math.sqrt(_vector[0] * _vector[0] + _vector[1] * _vector[1] + _vector[2] * _vector[2]);
    }

    static Distance(v_A, v_B)
    {
        let _vector = [0.0, 0.0, 0.0];
        if("x" in v_A)
        {
            _vector[0] = v_A.x - v_B.x;
            if("y" in v_A) _vector[1] = v_A.y - v_B.y;
            if("z" in v_A) _vector[2] = v_A.z - v_B.z;
        }
        else
        {
            _vector = [v_A[0] - v_B[0], v_A[2] - v_B[1], v_A[2] - v_B[2]];
        }

        return Math.sqrt(_vector[0] * _vector[0] + _vector[1] * _vector[1] + _vector[2] * _vector[2]);
    }

    static HermiteInterpolation(t, tk)
    {
        let t_alpha = ToolBox.BasicEase((t - tk[1]) / (tk[2] - tk[1]));
        let t_v1 = (t - tk[1]) / (tk[2] - tk[0]);
        let t_v2 = (t - tk[2]) / (tk[3] - tk[1]);

        return [(t_alpha - 1.0) * t_v1,
                                        (1.0 - t_alpha) - t_alpha * t_v2,
                                                                        (1.0 - t_alpha) * t_v1 + t_alpha,
                                                                                                        t_alpha * t_v2];
    }

    static ComputeHermiteValue(t, tk, vk)
    {
        let t_index;
        for(t_index = 0; t_index < tk.length; t_index++) if(tk[t_index] > t) break;
        if(t_index == tk.length) t_index = tk.length - 2;
        else if(t_index > 0) t_index--;

        let steps = [];
        let values = [];
        for(let i = 0; i < 4; i++)
        {
            let t_ind = ToolBox.Clamp(t_index + i - 1, 0, tk.length - 1);
            steps[i] = tk[t_ind];
            values[i] = vk[t_ind];
        }

        let weights = ToolBox.HermiteInterpolation(t, steps);
        return weights[0] * values[0] + weights[1] * values[1] + weights[2] * values[2] + weights[3] * values[3];
    }

    static ComputeHermiteColor(t, tk, ck)
    {
        let t_index;
        for(t_index = 0; t_index < tk.length; t_index++) if(tk[t_index] > t) break;
        if(t_index == tk.length) t_index = tk.length - 2;
        else if(t_index > 0) t_index--;

        let steps = [];
        let colors = [];
        for(let i = 0; i < 4; i++)
        {
            let t_ind = ToolBox.Clamp(t_index + i - 1, 0, tk.length - 1);
            steps[i] = tk[t_ind];
            colors[i] = ck[t_ind];
        }

        let weights = ToolBox.HermiteInterpolation(t, steps);
        return {
            r: ToolBox.Clamp(weights[0] * colors[0].r + weights[1] * colors[1].r + weights[2] * colors[2].r + weights[3] * colors[3].r, 0.0, 1.0),
            g: ToolBox.Clamp(weights[0] * colors[0].g + weights[1] * colors[1].g + weights[2] * colors[2].g + weights[3] * colors[3].g, 0.0, 1.0),
            b: ToolBox.Clamp(weights[0] * colors[0].b + weights[1] * colors[1].b + weights[2] * colors[2].b + weights[3] * colors[3].b, 0.0, 1.0),
        }
    }

}


















class Builder {
    static ToClipboard(txt, _event = null)
    {
        navigator.clipboard.writeText(txt);
        if(_event)
        {
            let t_temp = document.createElement('p');
            t_temp.className = "quick_message";
            t_temp.textContent = "Copied!";
            t_temp.style.left = _event.clientX + "px";
            t_temp.style.top = _event.clientY + "px";
            document.body.appendChild(t_temp);
            setTimeout(function() {
                t_temp.remove();
            }, 500);
        }
    }

    static StopPropagation(ev)
    {
        ev.stopPropagation();
    }

    static Focus(ev)
    {
        /// force focus on the target (prevent conflict with menu drag)
        ev.stopPropagation();
        ev.target.focus();
    }

    static SetupDrop(_ele, drop_func, allow_propagate = false)
    {
        _ele.addEventListener('dragover', function(event) {
            event.stopPropagation();
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';    
        });
        _ele.addEventListener('drop', function(event) {
            event.preventDefault();
            if(allow_propagate == false)
            {
                event.stopImmediatePropagation();
                event.stopPropagation();    
            }
            drop_func(event.dataTransfer.getData("text"), event.dataTransfer.files, event, _ele);
        });
    }

    static SetupWheelInput(_ele, _parameters)
    {
        let t_increment = _parameters.increment || 1;
        let t_getValue = _parameters.get_value;
        let t_setValue = _parameters.set_value;

        let t_integer = (t_increment % 1 == 0);
        function WheelInput(event)
        {
            event.preventDefault();

            /// get the current value of the element using the specified function or default to _ele.value
            let t_currentValue = t_getValue ? t_getValue() : parseFloat(_ele.value);

            /// if integer input, no decimals
            let t_newValue;
            if(t_integer == true) t_newValue = (t_currentValue - t_increment * Math.sign(event.deltaY)).toFixed(0);
            else t_newValue = (t_currentValue - t_increment * Math.sign(event.deltaY)).toFixed(3);

            /// set the new value using the specified function or default to _ele.value
            if(t_setValue) t_setValue(t_newValue);
            else _ele.value = t_newValue;

            _ele.dispatchEvent(new Event('input'));
        }

        _ele.onblur = function() {
            this.onwheel = null;
        }
        _ele.onfocus = function() {
            this.onwheel = WheelInput;
        }
    }

    /// trigger callback on element removal
    static OnRemoval(_ele, _callback)
    {
        new MutationObserver(function(mutations) {
            if(!document.body.contains(_ele))
            {
                _callback();
                this.disconnect();
            }
        }).observe(document.body, {childList: true, subtree: true});
    }

    static SetupDragInput(_ele, _parameters)
    {
        let t_step = _parameters.step || 0.0001;
        let t_getValue = _parameters.get_value;
        let t_setValue = _parameters.set_value;

        let t_startValue = null;
        let t_deltaY = 0;
        function Ondrag(delta)
        {
            t_deltaY = delta.y;
            if(Math.abs(delta.y == 0))
            {
                t_startValue = t_getValue ? t_getValue() : parseFloat(_ele.value);
                return;
            }

            let t_change = -Math.sign(delta.y) * t_step * (Math.pow(1.5, 0.1 * Math.abs(delta.y)) - 1.0);
            let t_newValue = t_startValue + t_change;

            /// set the new value using the specified function or default to _ele.value
            if(t_setValue) t_setValue(t_newValue);
            else _ele.value = t_newValue;

            _ele.dispatchEvent(new Event('input'));
        }

        function OndragEnd()
        {
            /// this allows for clicking on the input (to write down the value)
            if(t_deltaY == 0.0) _ele.focus();
        }

        Builder.MakeDraggable(_ele, null, Ondrag, OndragEnd, 'ns-resize');
    }

    static TextareaAutoresize(ele, _padding)
    {
        ele.style.height = "calc(" + ele.scrollHeight + "px - " + _padding + " - " + _padding + ")";
    }

    static AddToolTip(_ele, _tip)
    {
        /// create an info bubble above the mouse when the target element is hovered
        let t_bubble = null;
        let t_moved = false;
        let t_timeout = null;

        let DeleteTip = function() {
            if(t_timeout) clearTimeout(t_timeout);
            if(t_bubble)
            {
                t_bubble.remove();
                t_bubble = null;
            }
            _ele.onmouseout = null;
            _ele.onmousemove = null;
        }

        /// frequently check that the cursor is still moving on top of the target element; if not, the bubble gets deleted
        let AutoDelete = function() {
            t_moved = false;
            t_timeout = setTimeout(function() {
                if(t_moved == false) DeleteTip();
                else AutoDelete();
            }, 300);
        }

        let MouseOut = function() {
            DeleteTip();
        }

        let MouseMove = function(ev) {
            t_moved = true;

            if(t_bubble)
            {
                t_bubble.style.left = (ev.clientX - 0.5 * t_bubble.clientWidth) + "px";
                t_bubble.style.top = (ev.clientY - t_bubble.clientHeight - 30) + "px";
            }
        }

        _ele.onmouseover = function(ev) {

            if(!t_bubble)
            {
                t_bubble = document.createElement('p');
                t_bubble.className = 'tool_tip';
                t_bubble.textContent = _tip;
                document.body.appendChild(t_bubble);
                
                _ele.onmouseout = MouseOut;
                _ele.onmousemove = MouseMove;

                AutoDelete();
            }

            t_bubble.style.left = (ev.clientX - 0.5 * t_bubble.clientWidth) + "px";
            t_bubble.style.top = (ev.clientY - 30) + "px";
        }
    }

    static QuickDesktopFetch() {

        return new Promise(function (resolve, reject) {
    
            var promise = { resolve: resolve, reject: reject };
    
            var background = document.createElement("input");
            background.className = "input_back";
            document.body.appendChild(background);
    
            var input = document.createElement("input");
            input.type = "file";
            document.body.appendChild(input);
    
            /// an invisible screen is set over the window with a slight delay --> to prevent triggering in the instant before the file explorer start
            setTimeout(function () {
                background.onmousemove = function () {
                    promise.reject(null);
                    input.remove();
                    this.remove();
                }
                background.ontouchmove = function () {
                    promise.reject(null);
                    input.remove();
                    this.remove();
                }
            }, 500);
    
            input.onchange = function () {
                promise.resolve(this.files[0]);
                background.remove();
                this.remove();
            }
            input.click();
        });
    }

    static OnReady(_element, _func)
    {
        let observer = new MutationObserver(function(mutationList, observer) {
            _func();
            observer.disconnect();
            // _element.onload = null;
        });                
        observer.observe(_element, { attributes: true, childList: true, subtree: true });

        // _element.onload = function() {
        //     observer.disconnect();
        //     _func();
        // }
    }

    static GetEMSize(_element, _func)
    {
        let observer = new MutationObserver(function(mutationList, observer) {
            let emSize = parseFloat(getComputedStyle(_element).fontSize);
            _func(emSize);
            observer.disconnect();
        });                
        observer.observe(_element, { attributes: true });
    }

    static CreateWebpage(_parameters)
    {
        let t_page = document.createElement('div');
        t_page.className = 'webpage';
        if(_parameters.max_width) t_page.style.maxWidth = _parameters.max_width;
        if(_parameters.height) t_page.style.height = _parameters.height;
        document.body.appendChild(t_page);
        return t_page;
    }

    static CreateHeader(_parameters)
    {
        let t_header = document.createElement('div');
        t_header.className = 'header';
        if(_parameters.spread) t_header.style.width = "100%";
        if(_parameters.align)
        {
            if(_parameters.align === 'left') t_header.classList.add('align_left');
            else if(_parameters.align === 'right') t_header.classList.add('align_right');
        }
        if(_parameters.material) t_header.classList.add(_parameters.material);

        return t_header;
    }

    static CreateBackground(_parameters)
    {
        let t_background = document.createElement('div');
        t_background.className = 'page_background';
        if(_parameters.color) t_background.style.backgroundColor = _parameters.color;
        document.body.appendChild(t_background);
        return t_background;
    }

    static AddScrollbar(_parameters, _element)
    {
        let t_scrollbar = document.createElement('div');
        t_scrollbar.className = 'scrollbar';
        _element.appendChild(t_scrollbar);
        _element.style.overflowY = "scroll";

        let scroll_func = _parameters.onscroll;
        
        let t_hide = false;
        let t_marginTop = 0;
        if(_parameters.width) t_scrollbar.style.width = _parameters.width;
        if(_parameters.height) t_scrollbar.style.width = _parameters.height;
        if(_parameters.margin)
        {
            /// Need to know the size of em
            if(_parameters.margin.top.includes('em')) this.GetEMSize(t_scrollbar, function(emSize) { t_marginTop = emSize * parseFloat(_parameters.margin.top); })
            else t_marginTop = parseFloat(_parameters.margin.top);
            t_scrollbar.style.top = _parameters.margin.top;
            t_scrollbar.style.right = _parameters.margin.right;
        }
        if(_parameters.style)
        {
            if(_parameters.style === "mini") t_scrollbar.classList.add("mini");
        }

        _element.onscroll = function(event) {
            if(t_hide == true)
            {
                t_scrollbar.style.display = "block";
                t_hide = false;
            }

            let t_cursor = Math.min(1.0, _element.scrollTop / (_element.scrollHeight - _element.clientHeight));
            t_scrollbar.style.top = (t_marginTop + t_cursor * (_element.scrollHeight - t_scrollbar.clientHeight - 2 * t_marginTop)) + "px";

            if(scroll_func) scroll_func();
        }

        let t_downScroll = 0;
        Builder.MakeDraggable(t_scrollbar, null, delta => {
            if(delta.y == 0) t_downScroll = _element.scrollTop;

            let deltaScroll = delta.y * (_element.scrollHeight - _element.clientHeight) / (_element.clientHeight - 80);
            _element.scrollTo({top: t_downScroll + deltaScroll, behavior: "instant"})
        });

        setTimeout(() => {
            if(_element.scrollHeight == _element.clientHeight)
            {
                t_scrollbar.style.display = "none";
                t_hide = true;
            }
        }, 100);

        return t_scrollbar;
    }

    static CreateLogo(_parameters)
    {
        let t_logo = document.createElement('div');
        t_logo.className = 'logo';

        let t_html = ``;
        if(_parameters.image) t_html += `<img src=` + _parameters.image + `>`;
        if(_parameters.text) t_html += `<p>` + _parameters.text + `</p>`;
        t_logo.innerHTML = t_html;

        if(_parameters.horizontal)
        {
            t_logo.classList.add('horizontal');
            if(_parameters.text)
            {
                t_logo.children[1].style.marginTop = 0;
                t_logo.children[1].style.marginBottom = 0;
            }
        }
        else if(_parameters.text)
        {
            t_logo.children[1].style.marginLeft = 0;
            t_logo.children[1].style.marginRight = 0;
        }

        if(_parameters.size)
        {
            if(_parameters.horizontal)
            {
                t_logo.children[0].style.height = _parameters.size;
                if(_parameters.text) t_logo.children[1].style.fontSize = _parameters.size;
            }
            else
            {
                t_logo.children[0].style.width = _parameters.size;
                if(_parameters.text) t_logo.children[1].style.fontSize = _parameters.size;
            }
        }
        if(_parameters.margin) t_logo.style.margin = _parameters.margin;
        if(_parameters.align)
        {
            if(_parameters.align == "center")
            {
                t_logo.style.marginLeft = "auto";
                t_logo.style.marginRight = "auto";
            }
            else if(_parameters.align == "left") t_logo.style.marginRight = "auto";
            else if(_parameters.align == "right") t_logo.style.marginLeft = "auto";
        }
        if(_parameters.onclick)
        {
            t_logo.onclick = function(ev) {
                _parameters.onclick(ev);
            }
            t_logo.style.cursor = "pointer";
        }

        return t_logo;
    }

    static CreateEditButton(_parameters)
    {
        _parameters.image = "/web/images/edit_icon.png";
        _parameters.onclick = function() {
            ToggleEdit();
        }
        let t_edit = Builder.CreatePressButton(_parameters);

        let t_editing = false;
        function ToggleEdit()
        {
            if(t_editing == false)
            {
                t_editing = true;
                t_edit.SetImage("/web/images/check_icon.png");
                if(_parameters.onedit) _parameters.onedit();
            }
            else
            {
                t_editing = false;
                t_edit.SetImage("/web/images/edit_icon.png");
                if(_parameters.onvalidate) _parameters.onvalidate();
            }
        }

        return t_edit;
    }

    static CreateBasicButton(_parameters)
    {
        let t_button = document.createElement('div');
        t_button.className = 'basic_button';
        t_button.innerHTML = `
            <img>
            <p></p>
            <img>
        `;

        let t_beforeImage = t_button.children[0];
        let t_text = t_button.children[1];
        let t_afterImage = t_button.children[2];

        let press_function = _parameters.onclick;

        if(_parameters.material) t_button.classList.add(_parameters.material);
        if(_parameters.size) t_button.style.fontSize = _parameters.size;
        if(_parameters.align)
        {
            if(_parameters.align === "left")
            {
                t_button.style.marginLeft = 0;
                t_button.style.marginRight = "auto";
            }
            else if(_parameters.align === "right")
            {
                t_button.style.marginLeft = "auto";
                t_button.style.marginRight = 0;
            }
        }
        if(_parameters.weight) t_button.style.fontWeight = _parameters.weight;
        if(_parameters.width) t_button.style.width = _parameters.width;
        
        if(_parameters.before_image)
        {
            t_beforeImage.src = _parameters.before_image;
            t_beforeImage.style.marginRight = "0.25em";
            if(_parameters.filter) t_beforeImage.style.filter = _parameters.filter;
        }
        else if(_parameters.image)
        {
            t_beforeImage.src = _parameters.image;
            t_beforeImage.style.marginRight = "0.25em";
            if(_parameters.filter) t_beforeImage.style.filter = _parameters.filter;
        }
        else t_beforeImage.remove();

        if(_parameters.after_image)
        {
            t_afterImage.src = _parameters.after_image;
            t_afterImage.style.marginLeft = "0.25em";
            if(_parameters.filter) t_afterImage.style.filter = _parameters.filter;
        }
        else t_afterImage.remove();
        
        if(_parameters.text)
        {
            t_text.textContent = _parameters.text;
            if(_parameters.color) t_text.style.color = _parameters.color;
        }
        else
        {
            t_text.remove();
            if(!_parameters.padding) _parameters.padding = 0;
            if(t_beforeImage) t_beforeImage.style.margin = 0;
            if(t_afterImage) t_beforeImage.style.margin = 0;
        }

        if(_parameters.position) Builder.SetPosition(t_button, _parameters.position);
        if(_parameters.style) Builder.ApplyStyles(t_button, _parameters.style);
        if(_parameters.tip) Builder.AddToolTip(t_button, _parameters.tip);
        if("shrink" in _parameters && _parameters.shrink == true) t_button.classList.add("shrink");
        if("no_wrap" in _parameters && _parameters.no_wrap == true) t_text.style.whiteSpace = "nowrap";
        if("spread" in _parameters && _parameters.spread == true) t_button.style.justifyContent = "space-between";

        if('margin' in _parameters || "margins" in _parameters || "padding" in _parameters) Builder.SetMargins(t_button, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        if(press_function)
        {
            t_button.onclick = function(event) {
                event.stopPropagation();
                event.preventDefault();
                press_function(event, this);
            }
        }

        t_button.SetImage = function(img_src) {
            let t_images = t_button.getElementsByTagName('img');
            for(let _img of t_images) _img.src = img_src;
        }

        return t_button;
    }

    static CreatePressButton(_parameters)
    {
        let t_button = document.createElement('div');
        t_button.className = 'press_button';
        if(_parameters.material) t_button.classList.add(_parameters.material);
        if(_parameters.size) t_button.style.fontSize = _parameters.size;
        if(_parameters.weight) t_button.style.fontWeight = _parameters.weight;
        if(_parameters.text_color) t_button.style.color = _parameters.text_color;

        let t_html = ``;
        if(_parameters.before_image && _parameters.before_image.length > 0) t_html += `<img src='` + _parameters.before_image + `'>`;
        if(_parameters.image && _parameters.image.length > 0) t_html += `<img src='` + _parameters.image + `'>`;
        if(_parameters.text) t_html += `<p>` + _parameters.text + `</p>`;
        if(_parameters.after_image) t_html += `<img src='` + _parameters.after_image + `'>`;
        t_button.innerHTML = t_html;

        if(!_parameters.padding) _parameters.padding = { left: "0.5em", right: "0.5em", top: "0.25em", bottom: "0.25em" };
        if(_parameters.tip) Builder.AddToolTip(t_button, _parameters.tip);
        if(_parameters.filter)
        {
            let t_imgs = t_button.getElementsByTagName('img');
            for(let i = 0; i < t_imgs.length; i++) t_imgs[i].style.filter = _parameters.filter;
        }

        if(_parameters.position) Builder.SetPosition(t_button, _parameters.position);
        if(_parameters.style) Builder.ApplyStyles(t_button, _parameters.style);
        Builder.SetMargins(t_button, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        let press_function = _parameters.onclick;
        if(press_function)
        {
            t_button.onclick = function(event) {
                event.stopPropagation();
                event.preventDefault();
                press_function(event, t_button);
            }
        }

        t_button.SetImage = function(img_src) {
            let t_images = t_button.getElementsByTagName('img');
            for(let _img of t_images) _img.src = img_src;;
        }

        t_button.SetText = function(_text) {
            t_button.children[0].textContent = _text;
        }

        t_button.SetTip = function(_tip) {
            Builder.AddToolTip(t_button, _tip);
        }

        t_button.FailAnimation = function() {
            t_button.classList.add('fail_animation');
            setTimeout(function() {
                t_button.classList.remove('fail_animation');
            }, 500);
        }

        t_button.SetClickFunction = function(click_func) {
            t_button.onclick = function(event) {
                event.stopPropagation();
                event.preventDefault();
                click_func(event, t_button);
            }
        }

        t_button.Disable = function() {
            t_button.classList.add("disabled");
        }

        t_button.Enable = function() {
            t_button.classList.remove("disabled");
        }

        t_button.DisableEdit = function() {
            t_button.classList.add("disabled");
        }

        t_button.EnableEdit = function() {
            t_button.classList.remove("disabled");
        }

        t_button.Toggle = function() {
            t_button.classList.toggle("pressed");
        }
        if("toggle" in _parameters && _parameters.toggle == true) t_button.Toggle();

        if('disable' in _parameters && _parameters.disable == true) t_button.Disable();

        return t_button;
    }

    static CreatePushButton(_parameters)
    {
        let t_button = document.createElement('div');
        t_button.className = 'push_button';
        if(_parameters.material) t_button.classList.add(_parameters.material);
        if(_parameters.size) t_button.style.fontSize = _parameters.size;
        if(_parameters.weight) t_button.style.fontWeight = _parameters.weight;

        let t_html = ``;
        if(_parameters.before_image && _parameters.before_image.length > 0) t_html += `<img src='` + _parameters.before_image + `'>`;
        if(_parameters.image && _parameters.image.length > 0) t_html += `<img src='` + _parameters.image + `'>`;
        if(_parameters.text) t_html += `<p>` + _parameters.text + `</p>`;
        if(_parameters.after_image) t_html += `<img src='` + _parameters.after_image + `'>`;
        t_button.innerHTML = t_html;

        if(_parameters.tip) Builder.AddToolTip(t_button, _parameters.tip);
        if(_parameters.position) Builder.SetPosition(t_button, _parameters.position);
        if(_parameters.style) Builder.ApplyStyles(t_button, _parameters.style);

        if(!_parameters.padding) _parameters.padding = { left: "0.5em", right: "0.5em", top: "0.25em", bottom: "0.25em" };
        Builder.SetMargins(t_button, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        let t_pressed = false;
        let t_clickFunction = _parameters.onclick;

        let t_allowUnpress = true;
        if('unpress' in _parameters && _parameters.unpress == false) t_allowUnpress = false;
        
        t_button.onclick = function(event) {
            event.stopPropagation();
            event.preventDefault();
            if(t_pressed == false) t_button.Press();
            else if(t_allowUnpress == true) t_button.Unpress();
        }

        t_button.Press = function(ignore_function = false) {
            t_pressed = true;
            t_button.classList.add("pressed");
            if(ignore_function == false && t_clickFunction) t_clickFunction(t_pressed, event, t_button);
        }

        t_button.Unpress = function(ignore_function = false) {
            t_pressed = false;
            t_button.classList.remove("pressed");
            if(ignore_function == false && t_clickFunction) t_clickFunction(t_pressed, event, t_button);
        }

        t_button.Toggle = function() {
            if(t_pressed == false) t_button.Press();
            else t_button.Unpress();
        }

        t_button.SetValue = function(_pressed, ignore_function = false) {
            if(_pressed == true) t_button.Press(ignore_function);
            else t_button.Unpress(ignore_function);
        }

        if('pressed' in _parameters && _parameters.pressed == true) t_button.Press(true);


        t_button.SetImage = function(img_src) {
            let t_images = t_button.getElementsByTagName('img');
            for(let _img of t_images) _img.src = img_src;;
        }

        t_button.SetText = function(_text) {
            t_button.children[0].textContent = _text;
        }

        t_button.SetClickFunction = function(click_func) {
            t_clickFunction = click_func;
        }

        t_button.SetTip = function(_tip) {
            Builder.AddToolTip(t_button, _tip);
        }

        t_button.DisableEdit = function() {
            t_button.classList.add("disabled");
        }

        t_button.EnableEdit = function() {
            t_button.classList.remove("disabled");
        }

        if('disable' in _parameters && _parameters.disable == true) t_button.Disable();

        return t_button;
    }

    static CreateHoverButton(_parameters)
    {
        let t_button = document.createElement('div');
        t_button.className = 'hover_button';
        t_button.innerHTML = `
            <img>
            <p></p>
            <img>
        `;

        let t_beforeImage = t_button.children[0];
        let t_text = t_button.children[1];
        let t_afterImage = t_button.children[2];

        if(_parameters.material) t_button.classList.add(_parameters.material);
        if(_parameters.size) t_button.style.fontSize = _parameters.size;
        if(_parameters.weight) t_button.style.fontWeight = _parameters.weight;
        
        if(_parameters.before_image)
        {
            t_beforeImage.src = _parameters.before_image;
            t_beforeImage.style.marginRight = "0.25em";
            if(_parameters.filter) t_beforeImage.style.filter = _parameters.filter;
        }
        else t_beforeImage.remove();

        if(_parameters.after_image)
        {
            t_afterImage.src = _parameters.after_image;
            t_afterImage.style.marginLeft = "0.25em";
            if(_parameters.filter) t_afterImage.style.filter = _parameters.filter;
        }
        else t_afterImage.remove();
        
        if(_parameters.text)
        {
            t_text.textContent = _parameters.text;
            if(_parameters.color) t_text.style.color = _parameters.color;
        }
        else
        {
            t_text.remove();
            if(!_parameters.padding) _parameters.padding = 0;
            if(t_beforeImage) t_beforeImage.style.margin = 0;
            if(t_afterImage) t_beforeImage.style.margin = 0;
        }
        if(_parameters.style) Builder.ApplyStyles(t_button, _parameters.style);
        if(_parameters.tip) Builder.AddToolTip(t_button, _parameters.tip);

        let press_function = _parameters.onclick;
        if(press_function)
        {
            t_button.onclick = function(event) {
                event.stopPropagation();
                event.preventDefault();
                press_function(event, this);
            }
        }

        return t_button;
    }

    static CreateCheckBox(_parameters)
    {
        let t_box = document.createElement('div');
        t_box.className = "check_box";
        t_box.innerHTML = `
            <div class='bar'></div>
            <div class='bar'></div>
        `;

        if(_parameters.size) t_box.style.fontSize = _parameters.size;
        if(_parameters.style) Builder.ApplyStyles(t_box, _parameters.style);

        Builder.SetMargins(t_box, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        let t_checked = false;
        t_box.Check = function() {
            t_checked = true;
            t_box.classList.add("checked");
        }

        t_box.Uncheck = function() {
            t_checked = false;
            t_box.classList.remove("checked");
        }

        t_box.onclick = function() {
            if(t_checked == false) t_box.Check();
            else t_box.Uncheck();
            if(_parameters.onclick) _parameters.onclick(t_checked);
        }

        t_box.DisableEdit = function() {
            t_box.classList.add("disabled");
        }

        t_box.EnableEdit = function() {
            t_box.classList.remove("disabled");
        }

        if('disable' in _parameters && _parameters.disable == true) t_box.DisableEdit();

        return t_box;
    }

    static CreateToggleButton(_parameters)
    {
        let t_toggle = document.createElement('div');
        t_toggle.className = 'toggle_button';
        t_toggle.innerHTML = `
            <div class='label'><p></p></div>
            <div class='button'><div class='lever'></div></div>
        `;

        let toggle_function = _parameters.onclick;

        let t_label = t_toggle.children[0];
        let t_button = t_toggle.children[1];
        let t_state = _parameters.value || false;

        if(t_state == true) t_button.classList.add('on');
        if(_parameters.label_weight) t_label.children[0].style.fontWeight = _parameters.label_weight;
        if(_parameters.label) t_label.children[0].textContent = _parameters.label;
        else
        {
            t_label.remove();
            t_label = null;
        }

        let t_lock = false;
        t_button.onclick = function(ev) {
            ev.stopPropagation();
            ev.preventDefault();

            if(t_lock == true) return;

            if(t_state == false)
            {
                t_state = true;
                t_button.classList.add('on');
            }
            else
            {
                t_state = false;
                t_button.classList.remove('on');
            }

            if(toggle_function) toggle_function(t_state);
            if(_parameters.onchange) _parameters.onchange(t_state);
        }


        if(_parameters.align)
        {
            if(_parameters.align === "center") t_toggle.style.justifyContent = "center";
            else if(_parameters.align === "left") t_toggle.style.justifyContent = "flex-start";
            else if(_parameters.align === "right") t_toggle.style.justifyContent = "flex-end";
            else if(_parameters.align === "spread") t_toggle.style.justifyContent = "space-between";
        }

        t_toggle.GetValue = function() {
            return t_state;
        }

        t_toggle.Lock = function() {
            t_lock = true;
            t_toggle.classList.add('locked');
        }

        t_toggle.Unlock = function() {
            t_lock = false;
            t_toggle.classList.remove('locked');
        }

        t_toggle.DisableEdit = function() {
            t_lock = true;
            t_toggle.classList.add('locked');
        }
        
        t_toggle.EnableEdit = function() {
            t_lock = false;
            t_toggle.classList.remove('locked');
        }

        if("allow_edit" in _parameters && _parameters.allow_edit == false) t_toggle.DisableEdit();

        return t_toggle;
    }

    static ApplyStyles(_ele, _styles)
    {
        let t_classes = _styles.split(" ");
        t_classes.forEach(_class => {
            _ele.classList.add(_class);
        });
    }

    static RemoveStyles(_ele, _styles)
    {
        let t_classes = _styles.split(" ");
        t_classes.forEach(_class => {
            _ele.classList.remove(_class);
        });
    }

    static CreateAudioFrame(_parameters)
    {
        let t_frame = document.createElement('div');
        t_frame.className = 'audio_frame';
        t_frame.innerHTML = `
            <audio crossorigin='anonymous | use-credentials'></audio>
            <div class='label'><p></p></div>
        `;

        let t_audio = t_frame.children[0];
        let t_label = t_frame.children[1];

        if(_parameters.label) t_label.children[0].textContent = _parameters.label;
        else t_label.remove();
        if(_parameters.audio) t_audio.src = _parameters.audio;
        if("controls" in _parameters && _parameters.controls == true) t_audio.controls = true;

        if(_parameters.width) t_frame.style.width = _parameters.width;
        if(_parameters.height) t_audio.style.height = _parameters.height;

        t_audio.oncanplay = function(ev) {
            if(_parameters.onload) _parameters.onload(ev);
        }

        Builder.SetMargins(t_frame, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        return t_frame;
    }

    static CreateVideoFrame(_parameters)
    {
        let t_frame = document.createElement('div');
        t_frame.className = 'video_frame';
        t_frame.innerHTML = `
            <video crossorigin='anonymous | use-credentials'></video>
            <div class='label'><p></p></div>
        `;

        let t_video = t_frame.children[0];
        let t_label = t_frame.children[1];

        if(_parameters.label) t_label.children[0].textContent = _parameters.label;
        else t_label.remove();
        if(_parameters.video) t_video.src = _parameters.video;
        if("controls" in _parameters && _parameters.controls == true) t_video.controls = true;

        if(_parameters.width) t_frame.style.width = _parameters.width;
        if(_parameters.height) t_frame.style.height = _parameters.height;

        if(!_parameters.width)
        {
            t_video.style.height = "100%";
            t_video.style.width = "auto";
            t_frame.style.width = "fit-content";
        }
        else if(!_parameters.height)
        {
            t_video.style.width = "100%";
            t_video.style.height = "auto";
            t_frame.style.height = "fit-content";
        }

        function OnLoad(ev)
        {
            t_frame.style.height = t_frame.clientWidth * t_video.videoHeight / t_video.videoWidth + "px";
            if(_parameters.onload) _parameters.onload(ev);
        }

        /// once the video is loaded, the frame is resized to the correct height
        t_video.oncanplay = function(ev) {
            OnLoad(ev);
        }

        t_frame.SetVideo = function (_url, _onload) {
            if(_url)
            {
                if(_onload) t_frame.children[0].oncanplay = function() {
                    OnLoad(ev);

                    _onload();

                    t_frame.children[0].onload = function(ev) {
                        OnLoad(ev);
                    };
                }
                t_frame.children[0].src = _url;
            }
        }

        return t_frame;
    }

    static CreatePictureFrame(_parameters)
    {
        let t_frame = document.createElement('div');
        t_frame.className = 'picture_frame';

        let t_html = `
            <img crossorigin='anonymous' loading='lazy' src='` + (_parameters.picture_url || _parameters.image) + `'>
        `;
        if(_parameters.label) t_html += `
            <div class='label'><p>` + _parameters.label + `</p></div>
        `;
        t_frame.innerHTML = t_html;

        if (_parameters.resource_id) {
            UserMenu.LoadResourcePicture("///" + _parameters.resource_id, t_frame.children[0]);
        }

        if(_parameters.width) t_frame.style.width = _parameters.width;
        if(_parameters.height) t_frame.style.height = _parameters.height;

        if(!_parameters.width)
        {
            t_frame.children[0].style.height = "100%";
            t_frame.children[0].style.width = "auto";
            t_frame.style.width = "fit-content";
        }
        else if(!_parameters.height)
        {
            t_frame.children[0].style.width = "100%";
            t_frame.children[0].style.height = "auto";
            t_frame.style.height = "fit-content";
        }

        let PictureFitting = null;

        if(_parameters.correct_height)
        {
            PictureFitting = function() {
                t_frame.style.height = t_frame.children[0].clientHeight + "px";
            }
        }

        if(_parameters.correct_width)
        {
            PictureFitting = function() {
                t_frame.style.width = t_frame.children[0].clientWidth + "px";
            }
        }

        if(_parameters.fit_parent)
        {
            PictureFitting = function() {
                t_frame.style.height = t_frame.parentNode.clientHeight + "px";
                t_frame.style.width = t_frame.parentNode.clientWidth + "px";
                t_frame.children[0].style.height = "100%";
                t_frame.children[0].style.width = "100%";
            }
        }

        if(_parameters.fit_picture)
        {
            PictureFitting = function() {
                if(_parameters.width) t_frame.style.height = t_frame.children[0].clientHeight + "px";
                else t_frame.style.width = t_frame.children[0].clientWidth + "px";
            }
        }
        if(_parameters.style) Builder.ApplyStyles(t_frame, _parameters.style);
        if(_parameters.label_style) Builder.ApplyStyles(t_frame, _parameters.label_style);
        if(_parameters.label_size) t_frame.children[1].children[0].style.fontSize = _parameters.label_size;
        if(_parameters.label_weight) t_frame.children[1].children[0].style.fontWeight = _parameters.label_weight;
        if(_parameters.filter) t_frame.children[0].style.filter = _parameters.filter;

        if(_parameters.margin || _parameters.padding || _parameters.align) Builder.SetMargins(t_frame, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        if(_parameters.position) Builder.SetPosition(t_frame, _parameters.position);
        if('allow_drag' in _parameters && _parameters.allow_drag == true)
        {
            t_frame.children[0].style.webkitUserDrag = "auto";
            t_frame.children[0].style.userDrag = "auto";
        }

        if(PictureFitting)
        {
            let t_fitted = false;
            t_frame.children[0].onload = function() {
                t_fitted = true;
                PictureFitting();
            }
            setTimeout(function() {
                if(t_fitted == false) PictureFitting();
            }, 10);
        }

        t_frame.SetPicture = function (_url, _onload) {
            if(_url)
            {
                if(_onload) t_frame.children[0].onload = function() {
                    _onload();
                    t_frame.children[0].onload = null;
                }
                t_frame.children[0].src = _url;
            }
        }

        if(_parameters.change_function)
        {
            t_frame.style.minHeight = "3em";
            t_frame.style.minWidth = "3em";
            t_frame.appendChild(Builder.CreatePressButton({
                after_image: "/web/images/edit_icon.png", size: _parameters.button_size || "1.1em", style: _parameters.button_style || "frost_glass", position: {bottom: "0.5em", right: "0.5em"},
				onclick: function() {
                    _parameters.change_function(t_frame.children[0]);
				}
            }));
        }

        if(_parameters.onclick)
        {
            t_frame.onclick = function(ev) {
                _parameters.onclick(ev);
            }
            t_frame.style.cursor = "pointer";
        }

        return t_frame;
    }

    static CreatePictureWithText(_parameters)
    {
        let t_frame = document.createElement('div');
        t_frame.className = 'picture_text';
        t_frame.innerHTML = `
            <img src='` + _parameters.picture_url + `'>
            <p>` + _parameters.text + `</p>
        `;

        if(_parameters.material) t_frame.classList.add(_parameters.material);
        if(_parameters.padding)
        {
            t_frame.style.padding = _parameters.padding;
            t_frame.children[0].style.borderTopLeftRadius = "calc(1em - " + _parameters.padding + ")";
            t_frame.children[0].style.borderTopRightRadius = "calc(1em - " + _parameters.padding + ")";
        }
        if(_parameters.margin)
        {
            t_frame.style.margin = _parameters.margin;
        }

        return t_frame;
    }

    static CreateHorizontalList(_parameters, element_list = [])
    {
        let t_list = document.createElement('div');
        t_list.className = 'horizontal_list';

        if(_parameters.allow_scroll)
        {
            t_list.classList.add("scroll");
            t_list.innerHTML = `
                <div class='wrapper'></div>
                <div class='scroll_left'><img src='/web/images/retract_icon.png'></div>
                <div class='scroll_right'><img src='/web/images/expand_icon.png'></div>
            `;
            if(element_list) for(let i = 0; i < element_list.length; i++) t_list.children[0].appendChild(element_list[i]);

            t_list.children[1].onclick = function() {
                t_list.children[0].scrollTo({left: t_list.children[0].scrollLeft - 300, behavior: 'smooth'});
            }
            t_list.children[2].onclick = function() {
                t_list.children[0].scrollTo({left: t_list.children[0].scrollLeft + 300, behavior: 'smooth'});
            }

            // t_list.addEventListener("DOMNodeInserted", function() {
            this.OnReady(t_list, function() {
                if(t_list.children[0].scrollWidth == t_list.children[0].clientWidth)
                {
                    t_list.children[1].style.display = "none";
                    t_list.children[2].style.display = "none";
                }
            });    
        }
        else if(_parameters.allow_drag)
        {
            t_list.innerHTML = `
                <div class='wrapper'></div>
            `;

            let t_wrapper = t_list.children[0];
            t_wrapper.style.left = 0;
            if(element_list) for(let i = 0; i < element_list.length; i++) if(element_list[i]) t_wrapper.appendChild(element_list[i]);

            if(window.isMobile == false)
            {
                let t_dragging = false;
                let t_scrollStart = 0;
                Builder.MakeDraggable(t_wrapper, null,
                    function(delta) {
                        /// prevent click once there is a bit of drag
                        if(Math.abs(delta.x) > 2) t_dragging = true;
                        if(delta.x == 0) t_scrollStart = parseInt(t_wrapper.style.left);
                        else
                        {
                            let t_left = delta.x + t_scrollStart;
                            t_wrapper.style.left = ToolBox.Clamp(t_left, t_list.clientWidth - t_wrapper.clientWidth, 0) + "px";
                        }
                    },
                    function() {
                        /// we delay the drag end so the click can happen before
                        setTimeout(function() { t_dragging = false; }, 10);
                    }
                )    
            }
            else t_list.style.overflowX = "scroll";
        }
        else
        {
            if(element_list) for(let i = 0; i < element_list.length; i++) if(element_list[i]) t_list.appendChild(element_list[i]);
        }

        if("width" in _parameters) t_list.style.width = _parameters.width;
        if("height" in _parameters) t_list.style.height = _parameters.height;
        if("style" in _parameters) Builder.ApplyStyles(t_list, _parameters.style);
        if("multiple_lines" in _parameters && _parameters.multiple_lines == true) t_list.style.flexWrap = "wrap";
        if(_parameters.vertical_align)
        {
            if(_parameters.vertical_align === "center") t_list.style.alignItems = "center";
            else if(_parameters.vertical_align === "top") t_list.style.alignItems = "flex-start";
            else if(_parameters.vertical_align === "bottom") t_list.style.alignItems = "flex-end";
        }
        if(_parameters.horizontal_align)
        {
            if(_parameters.horizontal_align === "center") t_list.style.justifyContent = "center";
            else if(_parameters.horizontal_align === "left") t_list.style.justifyContent = "flex-start";
            else if(_parameters.horizontal_align === "right") t_list.style.justifyContent = "flex-end";
        }
        if("spread" in _parameters && _parameters.spread == true) t_list.style.justifyContent = "space-between";
        if(_parameters.size) t_list.style.fontSize = _parameters.size;
        if(_parameters.position) Builder.SetPosition(t_list, _parameters.position);
        Builder.SetMargins(t_list, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);
       
        if(_parameters.onclick)
        {
            t_list.onclick = function() {
                _parameters.onclick();
            }
            t_list.style.cursor = "pointer";
        }

        t_list.EnableEdit = function() {
            for(let i = 0; i < t_list.children.length; i++) if(t_list.children[i].EnableEdit) t_list.children[i].EnableEdit();
        }
        t_list.DisableEdit = function() {
            for(let i = 0; i < t_list.children.length; i++) if(t_list.children[i].DisableEdit) t_list.children[i].DisableEdit();
        }

        return t_list;
    }

    static CreateColumn(_parameters, element_list = [])
    {
        let t_column = document.createElement('div');
        t_column.className = 'column';

        if(_parameters.spread)
        {
            t_column.style.width = "100%";
            t_column.style.height = "100%";
        }

        let scroll_end_func = _parameters.onscrollend;

        if(_parameters.width) t_column.style.width = _parameters.width;
        if(_parameters.height) t_column.style.height = _parameters.height;
        if(_parameters.min_height) t_column.style.minHeight = _parameters.min_height;
        if(_parameters.max_height) t_column.style.maxHeight = _parameters.max_height;
        if(_parameters.max_width) t_column.style.maxWidth = _parameters.max_width;
        if(_parameters.child_align)
        {
            if(_parameters.child_align === 'left') t_column.style.alignItems = "flex-start";
            else if(_parameters.child_align === 'center') t_column.style.alignItems = "center";
            else if(_parameters.child_align === 'right') t_column.style.alignItems = "flex-end";
        }

        if(_parameters.scrollbar)
        {
            t_column.style.overflowY = "scroll";
            t_column.classList.add("no-shrink");
            this.AddScrollbar({
                    margin: {top: "0.25em", right: "0.25em"},
                    style: _parameters.scrollbar_style,
                    onscroll: !(scroll_end_func || _parameters.onscroll) ? null : function() {
                        if(_parameters.onscroll) _parameters.onscroll(t_column.scrollTop);
                        if(scroll_end_func && (t_column.scrollTop + t_column.clientHeight >= t_column.scrollHeight - 10)) scroll_end_func();
                    }
                },
                t_column);
        }
        else if(_parameters.onscroll)
        {
            t_column.onscroll = function(ev) {
                _parameters.onscroll(t_column.scrollTop);
            }
        }

        if(_parameters.overflow_x) t_column.style.overflowX = _parameters.overflow_x;

        if(_parameters.style) Builder.ApplyStyles(t_column, _parameters.style);
        Builder.SetMargins(t_column, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);
        if(_parameters.position) Builder.SetPosition(t_column, _parameters.position);

        if(element_list)
        {
            for(let i = 0; i < element_list.length; i++) t_column.appendChild(element_list[i]);
        }

        /// if no-shrink, the children do not shrunk to fit
        if("no_shrink" in _parameters && _parameters.no_shrink) t_column.classList.add("no-shrink");

        t_column.Clear = function() {
            if(_parameters.scrollbar) for(let i = t_column.length - 1; i >= 1; i--) t_column.children[i].remove();
            else t_column.innerHTML = ``;
        }

        return t_column;
    }

    static CreateCollapseMenu(_parameters, top_elements = [], other_elements = [])
    {
        let t_menu = document.createElement('div');
        t_menu.className = 'collapse_menu';
        t_menu.innerHTML = `
            <div class='top'></div>
            <div class='bottom'></div>
        `;

        let t_top = t_menu.children[0];
        let t_bottom = t_menu.children[1];

        let t_expanded = false;
        let t_onexpand = null;
        if('onexpand' in _parameters) t_onexpand = _parameters.onexpand;
        let t_oncollapse = null;
        if('oncollapse' in _parameters) t_oncollapse = _parameters.oncollapse;

        let t_margin = null;
        if(_parameters.width)
        {
            if(t_margin) t_menu.style.width = "calc(" + _parameters.width + " - " + t_margin + " - " + t_margin + ")";
            else t_menu.style.width = _parameters.width;
        }
        if(_parameters.position) Builder.SetPosition(t_menu, _parameters.position);

        if(_parameters.margin)
        {
            Builder.SetMargins(t_menu, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);
            // t_menu.style.margin = _parameters.margin;
            // t_margin = _parameters.margin;
        }

        if(_parameters.show_button)
        {
            let t_expand = document.createElement('div');
            t_expand.className = 'expand';
            t_expand.innerHTML = `<img src='/web/images/expand_icon.png'>`;
            t_top.appendChild(t_expand);
            t_expand.onclick = function() {
                t_menu.Toggle();
            };

            if(_parameters.tip) Builder.AddToolTip(t_expand, _parameters.tip);
            if(_parameters.button_size) t_expand.style.height = _parameters.button_size;
        }
        else if(!_parameters.lock)
        {
            t_top.style.cursor = "pointer";
            t_top.onclick = function() {
                t_menu.Toggle();
            }
        }

        if(top_elements)
        {
            if(top_elements) for(let i = 0; i < top_elements.length; i++) if(top_elements[i]) t_top.appendChild(top_elements[i]);
        }


        if(_parameters.material)
        {
            t_menu.classList.add(_parameters.material);
        }

        if(_parameters.style && _parameters.style.length > 0) Builder.ApplyStyles(t_menu, _parameters.style);

        if(other_elements) for(let i = 0; i < other_elements.length; i++) if(other_elements[i]) t_bottom.appendChild(other_elements[i]);

        t_menu.AppendTop = function(_ele) {
            t_top.appendChild(_ele);
            return _ele;
        }

        t_menu.AppendBottom = function(_ele) {
            t_bottom.appendChild(_ele);
            return _ele;
        }

        t_menu.ClearBottom = function() {
            t_bottom.innerHTML = ``;
        }

        t_menu.Expand = function() {
            if(t_expanded == true) return;
            t_expanded = true;
            t_menu.classList.add('expand');
            if(t_onexpand) t_onexpand(t_menu);
        }

        t_menu.Collapse = function() {
            if(t_expanded == false) return;
            t_expanded = false;
            t_menu.classList.remove('expand');
            if(t_oncollapse) t_oncollapse(t_menu);
        }

        t_menu.Toggle = function() {
            if(t_expanded == false) t_menu.Expand();
            else t_menu.Collapse();
        }

        t_menu.EnableEdit = function() {
            for(let _ele of t_top.children) if(_ele.EnableEdit) _ele.EnableEdit();
            for(let _ele of t_bottom.children) if(_ele.EnableEdit) _ele.EnableEdit();
        }

        t_menu.DisableEdit = function() {
            for(let _ele of t_top.children) if(_ele.DisableEdit) _ele.DisableEdit();
            for(let _ele of t_bottom.children) if(_ele.DisableEdit) _ele.DisableEdit();
        }

        if('expand' in _parameters && _parameters.expand == true) t_menu.Expand();

        return t_menu;
    }

    
    static CreateBanner(_parameters, elements)
    {
        let t_banner = document.createElement('div');
        t_banner.className = "banner";
        t_banner.innerHTML = `
            <div class='wrapper'></div>
            <div class='selector'></div>
        `;

        if(_parameters.height) t_banner.style.height = _parameters.height;
        if(_parameters.selector_material) t_banner.children[1].classList.add(_parameters.selector_material);

        let t_wrapper = t_banner.children[0];
        let t_selector = t_banner.children[1];

        let t_currentIndex = 0;
        let t_count = elements ? elements.length : 0;
        function SwitchFrame(frame_index)
        {
            t_selector.children[t_currentIndex].classList.remove('select');

            t_currentIndex = frame_index % t_count;
            t_wrapper.style.transform = 'translate(-' + (100 * t_currentIndex) + '%,0)';
            t_selector.children[t_currentIndex].classList.add('select');
        }

        /// add all the frames
        if(elements)
        {
            for(let i = 0; i < elements.length; i++) t_wrapper.appendChild(elements[i]);

            let t_html = ``;
            for(let i = 0; i < elements.length; i++) t_html += `<div class='option'></div>`;
            t_selector.innerHTML = t_html;
            t_selector.children[0].classList.add('select')

            /// on press, switch to corresponding frame index
            for(let i = 0; i < elements.length; i++)
            {
                let t_index = i;
                t_selector.children[i].onclick = function() {
                    SwitchFrame(t_index);
                }
            }
        }

        /// rotate through the frames
        if(elements && _parameters.animate)
        {
            let t_interval = setInterval(function() {
                /// delete the interval if the element does not exist anymore
                if(!document.body.contains(t_wrapper)) clearInterval(t_interval);
                else SwitchFrame(t_currentIndex + 1);
            }, _parameters.rotation_time || 10000);
        }

        return t_banner;
    }

    static SetPosition(_ele, _position = {})
    {
        _ele.style.position = "absolute";
        if('left' in _position) _ele.style.left = (typeof(_position.left) === 'number') ? _position.left + "px" : _position.left;
        if('right' in _position) _ele.style.right = (typeof(_position.right) === 'number') ? _position.right + "px" : _position.right;
        if('top' in _position) _ele.style.top = (typeof(_position.top) === 'number') ? _position.top + "px" : _position.top;
        if('bottom' in _position) _ele.style.bottom = (typeof(_position.bottom) === 'number') ? _position.bottom + "px" : _position.bottom;

        if(_position.center_x)
        {
            if(_position.center_y)
            {
                _ele.style.left = "50%";
                _ele.style.top = "50%";
                _ele.style.transform = "translate(-50%, -50%)";
            }
            else
            {
                _ele.style.left = "50%";
                _ele.style.transform = "translateX(-50%)";
            }
        }
        else if(_position.center_y)
        {
            _ele.style.top = "50%";
            _ele.style.transform = "translateY(-50%)";        
        }
    }

    static SetMargins(_ele, _margins = {}, _padding = {}, _align = "")
    {
        if(!_ele) return;
        if(typeof(_margins) !== "object") _margins = {left: _margins, right: _margins, top: _margins, bottom: _margins};
        if(typeof(_padding) !== "object") _padding = {left: _padding, right: _padding, top: _padding, bottom: _padding};

        _padding = {
            left: _padding.left || "0px",
            right: _padding.right || "0px",
            top: _padding.top || "0px",
            bottom: _padding.bottom || "0px",
        }

        if(_align.includes("left"))
        {
            _margins.left = _margins.left || "0px";
            _margins.right = "auto";
        }
        else if(_align.includes("right"))
        {
            _margins.left = "auto";
            _margins.right = _margins.right || "0px";
        }
        else if(_align.includes("center"))
        {
            if(_ele.style.width !== "100%")
            {
                _margins.left = "auto";
                _margins.right = "auto";    
            }
        }
        else
        {
            _margins.left = _margins.left || "0px";
            _margins.right = _margins.right || "0px";
        }

        let t_verticalAlign = false;
        if(_align.includes("top"))
        {
            _margins.top = _margins.top || "0px";
            _margins.bottom = "auto";
            t_verticalAlign = true;
        }
        else if(_align.includes("bottom"))
        {
            _margins.top = "auto";
            _margins.bottom = _margins.bottom || "0px";
            t_verticalAlign = true;
        }
        else if(_align.includes("middle"))
        {
            if(_ele.style.height !== "100%")
            {
                _margins.top = "auto";
                _margins.bottom = "auto";    
            }
            t_verticalAlign = true;
        }
        else
        {
            _margins.top = _margins.top || "0px";
            _margins.bottom = _margins.bottom || "0px";
        }

        _ele.style.marginLeft = _margins.left;
        _ele.style.marginRight = _margins.right;
        _ele.style.marginTop = _margins.top;
        _ele.style.marginBottom = _margins.bottom;

        _ele.style.paddingLeft = _padding.left;
        _ele.style.paddingRight = _padding.right;
        _ele.style.paddingTop = _padding.top;
        _ele.style.paddingBottom = _padding.bottom;

        if(_ele.style.width)
        {
            let t_width = "calc(" + _ele.style.width
                          + " - " + (_margins.left === "auto" ? "0px" : _margins.left)
                          + " - " + (_margins.right === "auto" ? "0px" : _margins.right)
                          + " - " + _padding.left
                          + " - " + _padding.right + ")";
            _ele.style.width = t_width;
        }

        if(_ele.style.height)
        {
            let t_height = "calc(" + _ele.style.height
                          + " - " + (_margins.top === "auto" ? "0px" : _margins.top)
                          + " - " + (_margins.bottom === "auto" ? "0px" : _margins.bottom)
                          + " - " + _padding.top
                          + " - " + _padding.bottom + ")";
            _ele.style.height = t_height;
        }
    }

    static SetPadding(_ele, _padding = {})
    {
        if(!_ele) return;
        if(typeof(_padding) !== "object") _padding = {left: _padding, right: _padding, top: _padding, bottom: _padding};

        _ele.style.paddingLeft = _padding.left || "0px";
        _ele.style.paddingRight = _padding.right || "0px";
        _ele.style.paddingTop = _padding.top || "0px";
        _ele.style.paddingBottom = _padding.bottom || "0px";
    }

    static CreateBox(_parameters)
    {
        let t_box = document.createElement('div');
        t_box.className = 'basic_box';
        if(_parameters.material) t_box.classList.add(_parameters.material);
        if(_parameters.style) Builder.ApplyStyles(t_box, _parameters.style);
        if(_parameters.width) t_box.style.width = _parameters.width;
        if(_parameters.height) t_box.style.height = _parameters.height;
        if(_parameters.min_height) t_box.style.minHeight = _parameters.min_height;
        if(_parameters.offset) t_box.style.transform = "translate(" + _parameters.offset.x + ", " + _parameters.offset.y + ")";
        if(_parameters.horizontal) t_box.style.flexDirection = "row";
        if(_parameters.border)
        {
            if(_parameters.border === "shadow") t_box.style.boxShadow = "0 0.5em 1em -0.5em black";
        }
        if(_parameters.position) Builder.SetPosition(t_box, _parameters.position);
        if(_parameters.color) t_box.style.backgroundColor = _parameters.color;
        if(_parameters.size) t_box.style.fontSize = _parameters.size;

        Builder.SetMargins(t_box, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        if(_parameters.ondragstart)
        {
            t_box.draggable = true;
            t_box.classList.add('draggable');
            // t_box.children[0].style.pointerEvents = "none";
            t_box.ondragstart = function(ev) {
                _parameters.ondragstart(ev);
            }
        }

        if(_parameters.onclick)
        {
            t_box.style.cursor = "pointer";
            t_box.onclick = function(event) {
                _parameters.onclick(event);
            }
        }

        t_box.EnableEdit = function() {
            for(let _ele of t_box.children) if(_ele.EnableEdit) _ele.EnableEdit();
        }

        t_box.DisableEdit = function() {
            for(let _ele of t_box.children) if(_ele.DisableEdit) _ele.DisableEdit();
        }

        return t_box;
    }

    static CreateTextBox(_parameters)
    {
        let t_box = document.createElement('div');
        t_box.className = 'text_box';
        t_box.innerHTML = `<p></p>`;

        if(_parameters.material) t_box.classList.add(_parameters.material);
        if(_parameters.text) t_box.children[0].textContent = _parameters.text;
        if(_parameters.height) t_box.children[0].style.height = _parameters.height;
        if(_parameters.weight) t_box.children[0].style.fontWeight = _parameters.weight;
        if(_parameters.size) t_box.children[0].style.fontSize = _parameters.size;
        if(_parameters.max_width) t_box.style.maxWidth = _parameters.max_width;
        if(_parameters.width)
        {
            t_box.style.width = _parameters.width;
            if(_parameters.width === "100%") t_box.children[0].style.width = "100%";
        }
        if(_parameters.text_align) t_box.children[0].style.textAlign = _parameters.text_align;
        if(_parameters.color) t_box.children[0].style.color = _parameters.color;
        if(_parameters.text_color) t_box.children[0].style.color = _parameters.text_color;
        if("break_words" in _parameters && _parameters.break_words == false) t_box.children[0].style.lineBreak = "auto";
        if("nowrap" in _parameters && _parameters.nowrap == true) t_box.children[0].style.whiteSpace = "nowrap";
        if(_parameters.image)
        {
            let t_image = document.createElement('img');
            if(_parameters.image_position === "before") t_box.insertBefore(t_image, t_box.children[0]);
            else t_box.appendChild(t_image);
            t_image.src = _parameters.image;
            if(_parameters.filter) t_image.style.filter = _parameters.filter;
        }
        if(_parameters.overflow)
        {
            if(_parameters.overflow === "hidden") t_box.style.overflow = "hidden";
        }

        if(_parameters.onclick)
        {
            t_box.style.cursor = "pointer";
            t_box.onclick = _parameters.onclick;
        }

        if(_parameters.position) Builder.SetPosition(t_box, _parameters.position);
        if(_parameters.style) Builder.ApplyStyles(t_box, _parameters.style);
        Builder.SetMargins(t_box, _parameters.margin || _parameters.margins, _parameters.padding, _parameters.align);

        t_box.SetText = function(_txt) {
            t_box.children[0].textContent = _txt;
        }

        return t_box;
    }

    static CreateList(_parameters)
    {
        let t_table = document.createElement('div');
        t_table.className = 'html_list';

        let t_scrollend = _parameters.onscrollend;
        let t_scrollbar = null;

        if(_parameters.width) t_table.style.width = _parameters.width;
        if(_parameters.height) t_table.style.height = _parameters.height;
        if(_parameters.scroll)
        {
            t_table.style.overflowY = "scroll";
            t_scrollbar = this.AddScrollbar({
                    margin: {top: "0.25em", right: "0.25em"},
                    onscroll: function() {
                        if(!t_scrollend) return;
                        if(t_table.scrollTop + t_table.clientHeight >= t_table.scrollHeight - 20) t_scrollend();
                    }
                },
                t_table
            );
        }
        else
        {
            t_table.onscroll = function() {
                if(!t_scrollend) return;
                if(t_table.scrollTop + t_table.clientHeight >= t_table.scrollHeight - 20) t_scrollend();
            }    
        }
        if(_parameters.max_width) t_table.style.maxWidth = _parameters.max_width;
        if(_parameters.style) Builder.ApplyStyles(t_table, _parameters.style);
        if(_parameters.child_align)
        {
            if(_parameters.child_align === "left") t_table.style.justifyContent = "flex-start";
            else if(_parameters.child_align === "right") t_table.style.justifyContent = "flex-end";
            else if(_parameters.child_align === "center") t_table.style.justifyContent = "center";
            else if(_parameters.child_align === "spread") t_table.style.justifyContent = "space-between";
            else if(_parameters.child_align === "even") t_table.style.justifyContent = "space-evenly";
        }

        Builder.SetMargins(t_table, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);


        t_table.SetScrollEnd = function(on_scrollend) {
            t_scrollend = on_scrollend;
        }

        t_table.Clear = function() {
            t_table.scrollTo({top: 0});
            for(let i = t_table.children.length - 1; i > 0; i--) if(t_table.children[i] != t_scrollbar) t_table.children[i].remove();
        }

        return t_table;
    }

    static CreateLandscapeCard(_parameters)
    {
        let t_card = document.createElement('div');
        t_card.className = 'landscape_card';
        t_card.innerHTML = `
            <div class='description'>
                <p></p>
                <p></p>
            </div>
            <div class='wrapper'>
                <img crossorigin='anonymous' loading='lazy' src=''>
                <div class='description_bis'>
                    <p></p>
                    <p></p>
                </div>
            </div>
        `;

        let t_wrapper = t_card.children[1];
        let t_description = t_card.children[0];
        let t_descriptionbis = t_wrapper.children[1];

        t_card.style.width = _parameters.width || "30em";

        if(_parameters.title) 
        {
            t_description.children[0].textContent = _parameters.title;
            t_descriptionbis.children[0].textContent = _parameters.title;
        }
        else
        {
            t_description.children[0].display = "none";
            t_descriptionbis.children[0].display = "none";
        }
        if(_parameters.text) 
        {
            t_description.children[1].textContent = _parameters.text;
            t_descriptionbis.children[1].textContent = _parameters.text;
        }
        if(_parameters.image) t_wrapper.children[0].src = _parameters.image;
        else t_wrapper.remove();

        if(_parameters.text_size)
        {
            t_description.children[1].style.fontSize = _parameters.text_size;
            t_descriptionbis.children[1].style.fontSize = _parameters.text_size;
        }
        if(_parameters.width) t_card.style.width = _parameters.width;

        Builder.SetMargins(t_card, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);
        if(_parameters.style) Builder.ApplyStyles(t_card, _parameters.style);

        t_description.style.width = t_card.style.width;
        t_descriptionbis.style.width = t_card.style.width;
        t_wrapper.children[0].style.width = t_card.style.width;
        
        return t_card
    }

    static CreateFancyCardA(_parameters)
    {
        let t_card = document.createElement('div');
        t_card.className = 'fancy_card_a';
        t_card.innerHTML = `
            <div class='description'>
                <p></p>
                <p></p>
            </div>
            <div class='wrapper'>
                <img crossorigin='anonymous' loading='lazy' src=''>
                <div class='description_bis'>
                    <p></p>
                    <p></p>
                </div>
            </div>
        `;

        let t_wrapper = t_card.children[1];
        let t_description = t_card.children[0];
        let t_descriptionbis = t_wrapper.children[1];

        t_card.style.width = _parameters.width || "16em";

        if(_parameters.title) 
        {
            t_description.children[0].textContent = _parameters.title;
            t_descriptionbis.children[0].textContent = _parameters.title;
        }
        if(_parameters.text) 
        {
            t_description.children[1].textContent = _parameters.text;
            t_descriptionbis.children[1].textContent = _parameters.text;
        }
        if(_parameters.image) t_wrapper.children[0].src = _parameters.image;
        else t_wrapper.remove();

        Builder.SetMargins(t_card, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);
        if(_parameters.style) Builder.ApplyStyles(t_card, _parameters.style);

        t_description.style.width = t_card.style.width;
        t_descriptionbis.style.width = t_card.style.width;
        t_wrapper.children[0].style.width = t_card.style.width;
        
        return t_card
    }

    static CreateFancyCardB(_parameters)
    {
        let t_card = document.createElement('div');
        t_card.className = 'fancy_card_b';
        t_card.innerHTML = `
            <img>
            <div class='wrapper'>
                <p></p>
                <p></p>
            </div>
        `;

        let t_image = t_card.children[0];
        let t_wrapper = t_card.children[1];
        let t_text = t_wrapper.children[0];
        let t_title = t_wrapper.children[1];

        if(_parameters.title) t_title.textContent = _parameters.title;
        else t_title.remove();
        if(_parameters.text) t_text.textContent = _parameters.text;
        else t_text.remove();
        if(_parameters.image) t_image.src = _parameters.image;

        if(_parameters.width) t_card.style.width = _parameters.width;
        if(_parameters.height) t_card.style.height = _parameters.height;
        if(_parameters.size) t_card.style.fontSize = _parameters.size;

        if(_parameters.margins || _parameters.margin) Builder.SetMargins(t_card, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);
        if(_parameters.style) Builder.ApplyStyles(t_card, _parameters.style);

        return t_card;
    }

    static CreateFancyCardC(_parameters)
    {
        let t_card = document.createElement('div');
        t_card.className = 'fancy_card_c';
        t_card.innerHTML = `
            <p></p>
            <p></p>
            <div class='wrapper'>
                <img>
            </div>
        `;

        let t_title = t_card.children[0];
        let t_text = t_card.children[1];
        let t_wrapper = t_card.children[2];
        let t_image = t_wrapper.children[0];

        if(_parameters.title) t_title.textContent = _parameters.title;
        else t_title.remove();
        if(_parameters.text) t_text.textContent = _parameters.text;
        else t_text.remove();
        if(_parameters.image) t_image.src = _parameters.image;

        if(_parameters.width) t_card.style.width = _parameters.width;
        if(_parameters.height) t_card.style.height = _parameters.height;
        if(_parameters.size) t_card.style.fontSize = _parameters.size;

        if(_parameters.margins || _parameters.margin) Builder.SetMargins(t_card, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);
        if(_parameters.style) Builder.ApplyStyles(t_card, _parameters.style);

        return t_card;
    }


    static CreatePictureCard(_parameters, backside_element)
    {
        let t_card = document.createElement('div');
        t_card.className = 'picture_card';
        t_card.innerHTML = `
            <img crossorigin='anonymous' loading='lazy' src=''>
            <div class='info'></div>
            <div class='corner'></div>
        `;

        let t_corner = t_card.children[2];

        let BasicInfo = function() {
            let t_info = document.createElement('div');
            t_info.className = 'basic_info';
            t_info.innerHTML = `
                <p class='title fade_text'></p>
                <div class='other'>
                    <p></p>
                    <p></p>
                </div>
            `;
    
            if(_parameters.picture_title) t_info.children[0].textContent = _parameters.picture_title;
            if(_parameters.info_a) t_info.children[1].children[0].textContent = _parameters.info_a;
            if(_parameters.info_b) t_info.children[1].children[1].textContent = _parameters.info_b;
    
            return t_info;    
        }

        let left_click_func = _parameters.onleftclick;
        let right_click_func = _parameters.onrightclick;

        if(_parameters.picture_url) t_card.children[0].src = _parameters.picture_url;

        if(_parameters.info)
        {
            t_card.children[1].appendChild(_parameters.info);
        }
        else
        {
            t_card.children[1].appendChild(BasicInfo());
        }

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
        if(_parameters.radius) t_card.style.borderRadius = _parameters.radius;
        if(_parameters.resource_id) {
            UserMenu.LoadResourcePicture("///" + _parameters.resource_id, t_card.children[0]);
        }
        if(_parameters.style) Builder.ApplyStyles(t_card, _parameters.style);

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

        if(left_click_func)
        {
            t_card.style.cursor = "pointer";
            t_card.onclick = function() {
                left_click_func(_parameters.resource);
            }
        }

        if(right_click_func)
        {
            t_card.oncontextmenu = function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                right_click_func(_parameters.resource, {x: ev.pageX, y: ev.pageY});
            }
        }

        if(_parameters.ondragstart)
        {
            t_card.draggable = true;
            t_card.children[0].style.pointerEvents = "none";
            t_card.ondragstart = function(ev) {
                _parameters.ondragstart(ev);
            }
        }

        if(_parameters.ondrop)
        {
            Builder.SetupDrop(t_card, _parameters.ondrop);
        }

        t_card.SetPicture = function(_url) {
            t_card.children[0].src = _url;
        }

        t_card.SetFilter = function(_filter) {
            t_card.children[0].style.filter = _filter;
        }

        t_card.SetImageScale = function(_scale) {
            if(_scale == 1.0) t_card.children[0].style.transform = "none";
            else t_card.children[0].style.transform = "scale(" + _scale + ")";
        }

        return t_card;
    }

    static CreateHorizontalBar(_parameters, _items = [])
    {
        let t_bar = document.createElement('div');
        t_bar.className = 'horizontal_bar';
        t_bar.innerHTML = `<div></div>`;

        let t_thickness = "0.5em";
        if(_parameters.thickness) t_thickness = _parameters.thickness;
        t_bar.style.height = _parameters.margin ? "calc(" + t_thickness + " + 2 * " + _parameters.margin.top + ")" : t_thickness;
        t_bar.children[0].style.height = t_thickness;

        if(_parameters.length) t_bar.children[0].style.width = _parameters.margin ? "calc(" + _parameters.length + " - 2 * " + _parameters.margin.left + ")" : _parameters.length;
        if(_parameters.align)
        {
            if(_parameters.align === "left") t_bar.children[0].style.marginLeft = _parameters.margin ? _parameters.margin.left : 0;
            else if(_parameters.align === "right") t_bar.children[0].style.marginRight = _parameters.margin ? _parameters.margin.left : 0;
        }
        if(_parameters.material) t_bar.children[0].classList.add(_parameters.material);
        if(_parameters.margin) t_bar.children[0].style.marginTop = _parameters.margin.top;
        Builder.SetMargins(t_bar, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        return t_bar;
    }

    static CreateStackTitle(_parameters)
    {
        let t_title = document.createElement('div');
        t_title.className = 'stack_title';
        t_title.innerHTML = `
            <h3></h3>
        `;

        t_title.style.width = "100%";
        if(_parameters.text) t_title.children[0].textContent = _parameters.text;
        if(_parameters.image)
        {
            t_title.innerHTML += `
                <img src='` + _parameters.image + `'>
            `;
        }
        if(_parameters.size) for(let i = 0; i < t_title.children.length; i++) t_title.children[i].style.fontSize = _parameters.size;
        if(_parameters.margin || _parameters.margins) Builder.SetMargins(t_title, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);
        if(_parameters.align)
        {
            if(_parameters.align === "left") t_title.style.justifyContent = 'flex-start';
            else if(_parameters.align === "right") t_title.style.justifyContent = 'flex-end';
            else if(_parameters.align === "center") t_title.style.justifyContent = 'center';
            else if(_parameters.align === "spread") t_title.style.justifyContent = 'space-between';
        }

        return t_title;
    }

    static CreateTabSelector(_parameters)
    {
        let t_tabs = document.createElement('div');
        t_tabs.className = 'tabs';
        t_tabs.innerHTML = `
            <p class='label'></p>
            <div class='tab_list'>
                <div class='select'></div>
            </div>
        `;

        if(!_parameters.tabs) return t_tabs;

        let t_label = t_tabs.children[0];
        let t_tabList = t_tabs.children[1];
        let t_selector = null;

        let tab_function = _parameters.onselect || _parameters.onchange;

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

        let t_currentIndex = 0;
        let t_count = _parameters.tabs.length;
        let t_buttonWidths = [];
        let t_buttonOffsets = [];

        /// wait a tiny bit for the elements to be added, then measure the width of each tab
        setTimeout(function() {
            let t_offset = 0;
            for(let i = 0; i < t_count; i++)
            {
                t_buttonWidths[i] = t_tabList.children[i + 1].children[0].clientWidth;
                t_buttonOffsets[i] = t_offset;
                t_offset += t_buttonWidths[i];

                t_tabList.children[i + 1].style.width = "calc(" + t_buttonWidths[i] + "px + 1em)";
            }
            t_selector.style.left = "calc(" + t_buttonOffsets[t_currentIndex] + "px + " + (1.5 * t_currentIndex) + "em)";
            t_selector.style.width = "calc(" + t_buttonWidths[t_currentIndex] + "px + 1em)";
        }, 10);


        function SwitchTab(_index, trigger_function = true)
        {
            if(_index == t_currentIndex) return;
            t_currentIndex = _index;
            t_selector.style.left = "calc(" + t_buttonOffsets[t_currentIndex] + "px + " + (1.5 * t_currentIndex) + "em)";
            t_selector.style.width = "calc(" + t_buttonWidths[t_currentIndex] + "px + 1em)";
            if(trigger_function == true && tab_function) tab_function(_index, _parameters.tabs[_index].value);
        }

        for(let i = 0; i < _parameters.tabs.length; i++)
        {
            let t_tab = t_tabList.appendChild(document.createElement('div'));
            t_tab.className = "tab";

            let t_html = "";
            if(_parameters.tabs[i].image) t_html += `<img src='` + _parameters.tabs[i].image + `'>`;
            if(_parameters.tabs[i].text) t_html += `<p>` + _parameters.tabs[i].text + `</p>`;
            t_tab.innerHTML = t_html;

            if(_parameters.tabs[i].tip) Builder.AddToolTip(t_tab, _parameters.tabs[i].tip);
        }
        t_selector = t_tabList.children[0];

        for(let i = 0; i < _parameters.tabs.length; i++)
        {
            let t_index = i;
            t_tabList.children[i + 1].onclick = function() {
                SwitchTab(t_index);
            }
        }

        if(_parameters.button_width)
        {
            t_selector.style.width = "calc(" + _parameters.button_width + " - 0.5em)";
            for(let i = 1; i < t_tabList.children.length; i++) t_tabList.children[i].style.width = _parameters.button_width;
        }
        if(_parameters.width) t_tabs.style.width = _parameters.width;
        if(_parameters.height) t_tabList.style.height = _parameters.height;
        if(_parameters.size) for(let i = 1; i < t_tabList.children.length; i++) t_tabList.children[i].children[0].style.fontSize = _parameters.size;
        if(_parameters.weight) for(let i = 1; i < t_tabList.children.length; i++) t_tabList.children[i].children[0].style.fontWeight = _parameters.weight;
        if(_parameters.position)
        {
            t_tabs.style.position = "absolute";
            if(_parameters.position.left) t_tabs.style.left = _parameters.position.left;
            if(_parameters.position.right) t_tabs.style.right = _parameters.position.right;
            if(_parameters.position.top) t_tabs.style.top = _parameters.position.top;
            if(_parameters.position.bottom) t_tabs.style.bottom = _parameters.position.bottom;
        }
        if(_parameters.z_index) t_tabs.style.zIndex = _parameters.z_index;

        t_tabs.SetValue = function(_val) {
            let t_index = -1;
            for(t_index = 0; t_index < _parameters.tabs.length; t_index++) if(_parameters.tabs[t_index].value === _val) break;
            if(t_index < _parameters.tabs.length) SwitchTab(t_index, false);
        }

        if(_parameters.value) t_tabs.SetValue(_parameters.value);
        if(_parameters.align && _parameters.align === "center") t_tabs.style.justifyContent = "center";
        if(_parameters.trail_color) t_tabList.style.backgroundColor = _parameters.trail_color;

        Builder.SetMargins(t_tabs, _parameters.margin || _parameters.margins, _parameters.padding, _parameters.align);

        t_tabs.EnableEdit = function() {
            t_tabs.classList.remove("disabled");
        }
        t_tabs.DisableEdit = function() {
            t_tabs.classList.add("disabled");
        }

        return t_tabs;
    }

    static CreateHorizontalSpace(_parameters)
    {
        let t_space = document.createElement('div');
        t_space.className = 'horizontal_space';
        if(_parameters.height) t_space.style.height = _parameters.height;
        return t_space;
    }

    static CreateRangeInput(_parameters)
    {
        let t_range = document.createElement('div');
        t_range.className = 'range_input';
        t_range.innerHTML = `
            <div class='channel'>
                <div class='trail'></div>
                <div class='lever'></div>
            </div>
            <input type='number'>
        `;

        let t_channel = t_range.children[0];
        let t_trail = t_channel.children[0];
        let t_lever = t_channel.children[1];
        let t_text = t_range.children[1];

        let t_onchange = null;
        let t_vertical = false;
        if('vertical' in _parameters && _parameters.vertical == true)
        {
            t_vertical = true;
            t_range.classList.add('vertical');
        }

        let t_min = 0.0;
        let t_max = 1.0;
        let t_step = 0.0;
        let t_exponent = 1.0;
        if('min' in _parameters) t_min = _parameters.min;
        if('max' in _parameters) t_max = _parameters.max;
        if('step' in _parameters) t_step = _parameters.step;
        if('exponent' in _parameters) t_exponent = _parameters.exponent;

        t_text.min = t_min;
        t_text.max = t_max;
        t_text.step = t_step;

        if('width' in _parameters) t_range.style.width = _parameters.width;
        if('height' in _parameters) t_range.style.height = _parameters.height;
        if('digit_width' in _parameters) t_text.style.width = _parameters.digit_width;
        if('hide_digits' in _parameters && _parameters.hide_digits == true)
        {
            t_text.remove();
            t_text = null;
        }

        t_range.SetTrailColor = function(_rgba) {
            try {
                if(typeof(_rgba) === "string" && _rgba.charAt(0) === '#') t_trail.style.backgroundColor = _rgba;
                else t_trail.style.backgroundColor = ToolBox.RGBAToHex(_rgba);
            } catch(err) {console.log(err)}
        }
        if('trail_color' in _parameters) t_range.SetTrailColor(_parameters.trail_color);
        if(_parameters.cursor_color) t_lever.style.backgroundColor = _parameters.cursor_color;
        if(_parameters.background_color)
        {
            t_range.style.backgroundColor = _parameters.background_color;
            t_range.style.borderRadius = "5em";
        }

        function ValueToRatio(_val)
        {
            if(t_min >= 0)
            {
                let t_ratio = ToolBox.Clamp((_val - t_min) / (t_max - t_min), 0.0, 1.0);
                return Math.pow(t_ratio, 1.0 / t_exponent);
            }
            else if(_val >= 0)
            {
                let t_ratio = ToolBox.Clamp(_val / t_max, 0.0, 1.0);
                return 0.5 * Math.pow(t_ratio, 1.0 / t_exponent) + 0.5;
            }
            else
            {
                let t_ratio = ToolBox.Clamp(_val / t_min, 0.0, 1.0);
                return 0.5 - 0.5 * Math.pow(t_ratio, 1.0 / t_exponent);
            }
        }

        function RatioToValue(_ratio)
        {
            if(t_min >= 0)
            {
                let _value = Math.pow(ToolBox.Clamp(_ratio, 0.0, 1.0), t_exponent);
                return (t_max - t_min) * _value + t_min;
            }
            else if(_ratio > 0.5)
            {
                let _value = Math.pow(ToolBox.Clamp(2.0 * _ratio - 1.0, 0.0, 1.0), t_exponent);
                return t_max * _value;
            }
            else
            {
                let _value = Math.pow(ToolBox.Clamp(1.0 - 2.0 * _ratio, 0.0, 1.0), t_exponent);
                return t_min * _value;
            }
        }

        let t_allowEdit = true;
        let t_value = t_min;
        t_range.SetValue = function(_val, trigger_function = true) {
            if(t_allowEdit == false) return;

            if(t_step > 0.0) _val = t_step * Math.round((_val - t_min) / t_step) + t_min;
            _val = ToolBox.Clamp(_val, t_min, t_max);

            t_value = _val;
            let t_ratio = ValueToRatio(_val);

            if(t_vertical == true)
            {
                t_lever.style.bottom = "calc(" + t_ratio + " * (100% - 1.6em))";
                let t_temp = (t_ratio * 1.6 - 1.35) + "em - " + (t_ratio * 100.0) + "%";
                t_trail.style.top = "calc(100% + " + t_temp + " + 1px)";
            }
            else
            {
                t_lever.style.left = "calc(" + t_ratio + " * (100% - 1.6em))";

                let t_temp = (t_ratio * 1.6 - 1.35) + "em - " + (t_ratio * 100.0) + "%";
                t_trail.style.right = "calc(100% + " + t_temp + " + 1px)";
            }

            if(t_text) t_text.value = _val;

            if(trigger_function == true && t_onchange) t_onchange(_val, t_range);
        }

        if('value' in _parameters) t_range.SetValue(_parameters.value, false);

        let t_leverSize = 0;
        let t_lastRatio = 0.0;
        let StopDrag = Builder.MakeDraggable(t_lever, null, delta => {
            let t_deltaRatio;
            let t_overDrag = false;

            // /// increase drag precision
            // delta.x *= 0.5;
            // delta.y *= 0.5;

            let t_rect = t_channel.getBoundingClientRect();
            if(t_vertical == true)
            {
                if(delta.y == 0) t_lastRatio = ValueToRatio(t_value);
                if(Math.abs(delta.x) > t_leverSize / 2) t_overDrag = true;  /// stop drag when the cursor leaves the trail
                t_deltaRatio = -delta.y / (t_rect.height - 1.45 * t_leverSize);
            }
            else
            {
                if(delta.x == 0) t_lastRatio = ValueToRatio(t_value);
                // if(Math.abs(delta.y) > t_leverSize / 2) t_overDrag = true;  /// stop drag when the cursor leaves the trail
                t_deltaRatio = delta.x / (t_rect.width - 1.45 * t_leverSize);
            }

            let t_ratio = t_lastRatio + t_deltaRatio;
            if(t_ratio < 0 || t_ratio > 1.0) t_overDrag = true;
            t_range.SetValue(RatioToValue(t_ratio));    

            if(t_overDrag == true) StopDrag();
        });

        t_channel.onclick = function(ev) {
            if(t_vertical == true)
            {
                let t_rect = t_channel.getBoundingClientRect();
                let dy = 1.0 - (ev.clientY - t_rect.top - (1.45 / 2.0) * t_leverSize) / (t_rect.height - 1.45 * t_leverSize);
                dy = ToolBox.Clamp(dy, 0.0, 1.0);
                t_range.SetValue(RatioToValue(dy));
            }
            else
            {
                let t_rect = t_channel.getBoundingClientRect();
                let dx = (ev.clientX - t_rect.left - (1.45 / 2.0) * t_leverSize) / (t_rect.width - 1.45 * t_leverSize);
                dx = ToolBox.Clamp(dx, 0.0, 1.0);
                t_range.SetValue(RatioToValue(dx));
            }
        }

        /// measure the size of the lever
        setTimeout(function() {
            t_leverSize = t_lever.clientHeight;
        }, 10);

        if(t_text)
        {
            t_text.onchange = function() {
                t_range.SetValue(parseFloat(t_text.value));
            }
        }

        if(_parameters.channel_width) t_channel.style.width = _parameters.channel_width;
        else if(t_text)
        {
            this.OnReady(t_range, function() {
                let t_width = "calc(100% - " + t_text.clientWidth + "px - 0.5em)";
                t_channel.style.width = t_width;
            });
        }

        t_range.GetValue = function() {
            return t_value;
        }

        t_range.SetMax = function(_max) {
            if(t_max == _max) return;
            t_text.max = _max;
            t_max = _max;
            t_range.SetValue(t_value, false);
        }

        t_range.EnableEdit = function() {
            t_allowEdit = true;
            t_range.classList.remove("disabled");
            if(t_text) t_text.disabled = false;
        }

        t_range.DisableEdit = function() {
            t_allowEdit = false;
            t_range.classList.add("disabled");
            if(t_text) t_text.disabled = true;
        }

        t_range.ToggleEdit = function() {
            if(t_allowEdit == true) t_range.DisableEdit();
            else t_range.EnableEdit();
        }

        if(t_text && _parameters.wheel_input)
        {
            Builder.SetupWheelInput(t_text, {
                increment: _parameters.wheel_input,
                set_value: t_range.SetValue,
                get_value: t_range.GetValue
            });
        }

        if(t_text && _parameters.drag_input)
        {
            Builder.SetupDragInput(t_text, {
                set_value: t_range.SetValue,
                get_value: t_range.GetValue,
                step: _parameters.drag_input,
            });
            t_range.StopDrag = function() {
                t_text.StopDrag();
            }
        }

        Builder.SetMargins(t_range, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);
        if(_parameters.position) Builder.SetPosition(t_range, _parameters.position);
        if('disable' in _parameters && _parameters.disable == true) t_range.DisableEdit();
        if("onchange_func" in _parameters) t_onchange = _parameters.onchange_func;
        if(_parameters.onchange) t_onchange = _parameters.onchange;
        if(_parameters.style) Builder.ApplyStyles(t_range, _parameters.style);

        return t_range;
    }

    static CreateDoubleRangeInput(_parameters)
    {
        let t_range = document.createElement('div');
        t_range.className = 'range_input';
        t_range.innerHTML = `
            <div class='channel'>
                <div class='trail'></div>
                <div class='lever left_half'></div>
                <div class='lever right_half'></div>
            </div>
            <input type='number'>
        `;

        let t_channel = t_range.children[0];
        let t_trail = t_channel.children[0];
        let t_levers = [];
        t_levers[0] = t_channel.children[1];
        t_levers[1] = t_channel.children[2];
        let t_text = t_range.children[1];

        let t_onchange = null;
        let t_vertical = false;
        if('vertical' in _parameters && _parameters.vertical == true)
        {
            t_vertical = true;
            t_range.classList.add('vertical');
        }

        let t_min = 0.0;
        let t_max = 1.0;
        let t_step = 0.0;
        let t_exponent = 1.0;
        if('min' in _parameters) t_min = _parameters.min;
        if('max' in _parameters) t_max = _parameters.max;
        if('step' in _parameters) t_step = _parameters.step;
        if('exponent' in _parameters) t_exponent = _parameters.exponent;

        t_text.min = t_min;
        t_text.max = t_max;
        t_text.step = t_step;

        if('width' in _parameters) t_range.style.width = _parameters.width;
        if('height' in _parameters) t_range.style.height = _parameters.height;
        if('digit_width' in _parameters) t_text.style.width = _parameters.digit_width;
        if('hide_digits' in _parameters && _parameters.hide_digits == true)
        {
            t_text.remove();
            t_text = null;
        }

        t_range.SetTrailColor = function(_rgba) {
            try {
                if(typeof(_rgba) === "string" && _rgba.charAt(0) === '#') t_trail.style.backgroundColor = _rgba;
                else t_trail.style.backgroundColor = ToolBox.RGBAToHex(_rgba);
            } catch(err) {console.log(err)}
        }
        if('trail_color' in _parameters) t_range.SetTrailColor(_parameters.trail_color);
        if(_parameters.cursor_color)
        {
            t_levers[0].style.backgroundColor = _parameters.cursor_color;
            t_levers[1].style.backgroundColor = _parameters.cursor_color;
        }
        if(_parameters.background_color)
        {
            t_range.style.backgroundColor = _parameters.background_color;
            t_range.style.borderRadius = "5em";
        }

        function ValueToRatio(_val)
        {
            if(t_min >= 0)
            {
                let t_ratio = ToolBox.Clamp((_val - t_min) / (t_max - t_min), 0.0, 1.0);
                return Math.pow(t_ratio, 1.0 / t_exponent);
            }
            else if(_val >= 0)
            {
                let t_ratio = ToolBox.Clamp(_val / t_max, 0.0, 1.0);
                return 0.5 * Math.pow(t_ratio, 1.0 / t_exponent) + 0.5;
            }
            else
            {
                let t_ratio = ToolBox.Clamp(_val / t_min, 0.0, 1.0);
                return 0.5 - 0.5 * Math.pow(t_ratio, 1.0 / t_exponent);
            }
        }

        function RatioToValue(_ratio)
        {
            if(t_min >= 0)
            {
                let _value = Math.pow(ToolBox.Clamp(_ratio, 0.0, 1.0), t_exponent);
                return (t_max - t_min) * _value + t_min;
            }
            else if(_ratio > 0.5)
            {
                let _value = Math.pow(ToolBox.Clamp(2.0 * _ratio - 1.0, 0.0, 1.0), t_exponent);
                return t_max * _value;
            }
            else
            {
                let _value = Math.pow(ToolBox.Clamp(1.0 - 2.0 * _ratio, 0.0, 1.0), t_exponent);
                return t_min * _value;
            }
        }

        function UpdateTrail()
        {
            let t_ratio = ValueToRatio(t_value[0]);
            t_trail.style.left = "calc(" + t_ratio + " * (100% - 1.6em) + 0.25em)";

            t_ratio = ValueToRatio(t_value[1]);
            let t_temp = (t_ratio * 1.6 - 1.35) + "em - " + (t_ratio * 100.0) + "%";
            t_trail.style.right = "calc(100% + " + t_temp + " + 1px)";
        }

        let t_allowEdit = true;
        let t_value = [t_min, t_min];
        t_range.SetValue = function(_val, lever_index, trigger_function = true) {
            if(t_allowEdit == false) return;

            if(t_step > 0.0) _val = t_step * Math.round((_val - t_min) / t_step) + t_min;
            _val = ToolBox.Clamp(_val, t_min, t_max);

            let t_ratio = ValueToRatio(_val);

            t_value[lever_index] = _val;
            if(lever_index == 0 && t_value[0] >= t_value[1])
            {
                t_value[1] = t_value[0];
                t_levers[1].style.left = "calc(" + t_ratio + " * (100% - 1.6em) + 0.8em)";
            }
            else if(lever_index == 1 && t_value[1] <= t_value[0])
            {
                t_value[0] = t_value[1];
                t_levers[0].style.left = "calc(" + t_ratio + " * (100% - 1.6em) + 0.2em)";
            }

            if(lever_index == 0) t_levers[lever_index].style.left = "calc(" + t_ratio + " * (100% - 1.6em) + 0.2em)";
            else t_levers[lever_index].style.left = "calc(" + t_ratio + " * (100% - 1.6em) + 0.8em)";

            UpdateTrail();

            if(t_text) t_text.value = _val;

            if(trigger_function == true && t_onchange) t_onchange(t_value, t_range);
        }

        if('value' in _parameters)
        {
            t_range.SetValue(_parameters.value[0], 0, false);
            t_range.SetValue(_parameters.value[1], 1, false);
        }

        let t_dragging = false;
        let t_selectedLever = -1;
        let t_leverSize = 0;
        let t_lastRatio = 0.0;
        let OnDrag = function(delta, lever_index) {
            t_dragging = true;
            t_selectedLever = lever_index;

            /// increase drag precision
            delta.x *= 0.5;
            let t_rect = t_channel.getBoundingClientRect();

            let t_deltaRatio;
            if(delta.x == 0) t_lastRatio = ValueToRatio(t_value[lever_index]);
            t_deltaRatio = delta.x / (t_rect.width - 1.45 * t_leverSize);

            let t_ratio = t_lastRatio + t_deltaRatio;
            t_range.SetValue(RatioToValue(t_ratio), lever_index);
        }

        let OnDragEnd = function(ev) {
            setTimeout(function() {
                t_dragging = false;
            }, 10);
        }
        Builder.MakeDraggable(t_levers[0], null, delta => {
            OnDrag(delta, 0);
        }, OnDragEnd);

        Builder.MakeDraggable(t_levers[1], null, delta => {
            OnDrag(delta, 1);
        }, OnDragEnd);

        t_channel.onclick = function(ev) {
            if(t_dragging == true) return;

            let t_rect = t_channel.getBoundingClientRect();
            let dx = (ev.clientX - t_rect.left - (1.45 / 2.0) * t_leverSize) / (t_rect.width - 1.45 * t_leverSize);
            dx = ToolBox.Clamp(dx, 0.0, 1.0);

            let t_val = RatioToValue(dx);
            let t_middle = 0.5 * (t_value[0] + t_value[1]);
            if(t_val < t_middle) t_range.SetValue(t_val, 0);
            else t_range.SetValue(t_val, 1);
        }

        /// measure the size of the lever
        setTimeout(function() {
            t_leverSize = t_levers[0].clientHeight;
        }, 10);

        if(t_text)
        {
            t_text.onchange = function() {
                t_range.SetValue(parseFloat(t_text.value), t_selectedLever);
            }
        }

        if(_parameters.channel_width) t_channel.style.width = _parameters.channel_width;
        else if(t_text)
        {
            this.OnReady(t_range, function() {
                let t_width = "calc(100% - " + t_text.clientWidth + "px - 0.5em)";
                t_channel.style.width = t_width;
            });
        }

        t_range.GetValue = function() {
            return t_value;
        }

        t_range.SetMax = function(_max) {
            if(t_max == _max) return;
            t_text.max = _max;
            t_max = _max;
            t_range.SetValue(t_value[0], 0, false);
            t_range.SetValue(t_value[1], 1, false);
        }

        t_range.EnableEdit = function() {
            t_allowEdit = true;
            t_range.classList.remove("disabled");
            if(t_text) t_text.disabled = false;
        }

        t_range.DisableEdit = function() {
            t_allowEdit = false;
            t_range.classList.add("disabled");
            if(t_text) t_text.disabled = true;
        }

        t_range.ToggleEdit = function() {
            if(t_allowEdit == true) t_range.DisableEdit();
            else t_range.EnableEdit();
        }

        if(t_text && _parameters.wheel_input)
        {
            Builder.SetupWheelInput(t_text, {
                increment: _parameters.wheel_input,
                set_value: function(_val) {
                    t_range.SetValue(_val, t_selectedLever);
                },
                get_value: function() {
                    return t_range.GetValue()[t_selectedLever];
                }
            });
        }

        if(t_text && _parameters.drag_input)
        {
            Builder.SetupDragInput(t_text, {
                set_value: function(_val) {
                    t_range.SetValue(_val, t_selectedLever);
                },
                get_value: function() {
                    return t_range.GetValue()[t_selectedLever];
                },
                step: _parameters.drag_input,
            });
            t_range.StopDrag = function() {
                t_text.StopDrag();
            }
        }

        Builder.SetMargins(t_range, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);
        if(_parameters.position) Builder.SetPosition(t_range, _parameters.position);
        if('disable' in _parameters && _parameters.disable == true) t_range.DisableEdit();
        if("onchange_func" in _parameters) t_onchange = _parameters.onchange_func;
        if(_parameters.onchange) t_onchange = _parameters.onchange;
        if(_parameters.style) Builder.ApplyStyles(t_range, _parameters.style);

        return t_range;
    }

    static CreateRGBInput(_parameters)
    {
        let t_rgb = document.createElement('div');
        t_rgb.className = 'rgb_input';
        t_rgb.innerHTML = `
            <p></p>
            <div class='wrapper'>
                <input type='color'>
            </div>
        `;

        let t_label = t_rgb.children[0];
        let t_wrapper = t_rgb.children[1];
        let t_input = t_wrapper.children[0];
        let t_button = null;

        let t_onchange = null;
        t_input.oninput = function() {
            if(t_onchange) t_onchange(t_rgb.GetValue());
        }

        if("value" in _parameters) t_input.value = ToolBox.RGBToHex(_parameters.value);
        if(_parameters.width) t_rgb.style.width = _parameters.width;
        if(_parameters.height)
        {
            t_rgb.style.height = _parameters.height;
            t_wrapper.style.height = "100%";
        }
        if("label" in _parameters)
        {
            t_label.textContent = _parameters.label;
            if("label_weight" in _parameters) t_label.style.fontWeight = _parameters.label_weight;
            if("label_size" in _parameters) t_label.style.fontSize = _parameters.label_size;
        }
        else
        {
            t_label.remove();
            t_label = null;
        }
        if(_parameters.style) Builder.ApplyStyles(t_rgb, _parameters.style);

        if("onvalid_func" in _parameters)
        {
            t_button = t_rgb.appendChild(Builder.CreatePressButton({
                after_image: _parameters.image || '/web/images/check_icon.png', size: "1.1em",
                onclick: function(_event, _button) {
                    _parameters.onvalid_func(t_rgb.GetValue(), t_rgb, t_button, _event);
                }
            }));
        }

        this.OnReady(t_rgb, function() {
            if(t_button)
            {
                let t_width = "calc(100% - " + t_button.clientWidth + "px - 0.5em)";
                t_wrapper.style.width = t_width;    
            }
            else
            {
                let t_width = "100%";
                t_wrapper.style.width = t_width;
                t_wrapper.style.margin = 0;
            }
        });

        Builder.SetMargins(t_rgb, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        /// functions
        t_rgb.GetValue = function() {
            return ToolBox.HexToRGB(t_input.value);
        }

        t_rgb.SetValue = function(_val) {
            t_input.value = ToolBox.RGBToHex(_val);
        }

        let t_allowEdit = true;
        t_rgb.EnableEdit = function() {
            t_allowEdit = true;
            t_rgb.classList.remove("disabled");
            t_input.disabled = false;
            if(t_button) t_button.SetImage('/web/images/check_icon.png');
        }

        t_rgb.DisableEdit = function() {
            t_allowEdit = false;
            t_rgb.classList.add("disabled");
            t_input.disabled = true;
            if(t_button) t_button.SetImage('/web/images/edit_icon.png');
        }

        t_rgb.ToggleEdit = function() {
            if(t_allowEdit == true) t_rgb.DisableEdit();
            else t_rgb.EnableEdit();
        }

        if('disable' in _parameters && _parameters.disable == true) t_rgb.DisableEdit();
        if('onchange' in _parameters) t_onchange = _parameters.onchange;

        return t_rgb;
    }

    static CreateRGBAInput(_parameters)
    {
        let t_input = document.createElement('div');
        t_input.className = 'rgba_input';
        t_input.innerHTML = `
            <p></p>
            <div class='wrapper'>
                <input type='color'>
            </div>
        `;

        let t_color = {r: 1.0, g: 1.0, b: 1.0, a: 1.0};

        let t_label = t_input.children[0];
        let t_wrapper = t_input.children[1];
        let t_rgbInput = t_wrapper.children[0];
        let t_alphaInput = null;
        let t_button = null;

        let t_onchange = null;

        t_input.GetValue = function() {
            let t_val = ToolBox.HexToRGB(t_rgbInput.value);
            t_val[3] = t_alphaInput.GetValue();
            t_color = t_val;
            return t_val;
        }        
        
        t_alphaInput = t_input.appendChild(Builder.CreateRangeInput({
            width: "50%", value: 1.0, min: 0.0, max: 1.0, step: 0.01, hide_digits: true,
            onchange_func: function(_val, _range) {
                t_color = t_input.GetValue();
                _range.SetTrailColor(t_color);
                if(t_onchange) t_onchange(t_color);
            }
        }));

        t_rgbInput.oninput = function() {
            t_color = t_input.GetValue();
            t_alphaInput.SetTrailColor(t_color);
            if(t_onchange) t_onchange(t_color);
        }

        t_input.SetValue = function(_val) {
            t_color = _val;
            t_rgbInput.value = ToolBox.RGBToHex(_val);
            t_alphaInput.SetValue(_val.a || _val[3], false);
        }

        if("value" in _parameters) t_input.SetValue(_parameters.value, false);
        if(_parameters.width) t_input.style.width = _parameters.width;
        if("label" in _parameters)
        {
            t_label.textContent = _parameters.label;
            if("label_weight" in _parameters) t_label.style.fontWeight = _parameters.label_weight;
            if("label_size" in _parameters) t_label.style.fontSize = _parameters.label_size;
        }
        else
        {
            t_label.remove();
            t_label = null;
        }

        if("onvalid_func" in _parameters)
        {
            t_button = t_input.appendChild(Builder.CreatePressButton({
                after_image: _parameters.image || '/web/images/check_icon.png', size: "1.1em",
                onclick: function(_event, _button) {
                    _parameters.onvalid_func(t_input.GetValue(), t_input, t_button, _event);
                }
            }));
        }

        this.OnReady(t_input, function() {
            let t_buttonWidth = t_button ? t_button.clientWidth : 0;
            let t_width = "calc(50% - " + t_buttonWidth + "px - 0.5em)";
            t_wrapper.style.width = t_width;
        });

        Builder.SetMargins(t_input, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        let t_allowEdit = true;
        t_input.EnableEdit = function() {
            t_allowEdit = true;
            t_input.classList.remove("disabled");
            t_rgbInput.disabled = false;
            t_alphaInput.EnableEdit();
            if(t_button) t_button.SetImage('/web/images/check_icon.png');
        }

        t_input.DisableEdit = function() {
            t_allowEdit = false;
            t_input.classList.add("disabled");
            t_rgbInput.disabled = true;
            t_alphaInput.DisableEdit();
            if(t_button) t_button.SetImage('/web/images/edit_icon.png');
        }

        t_input.ToggleEdit = function() {
            if(t_allowEdit == true) t_input.DisableEdit();
            else t_input.EnableEdit();
        }

        if('disable' in _parameters && _parameters.disable == true) t_input.DisableEdit();
        if('onchange' in _parameters) t_onchange = _parameters.onchange;


        return t_input;
    }

    
    static CreateVec2Input(_parameters)
    {
        let t_vector = document.createElement('div');
        t_vector.className = 'vec2_input';
        t_vector.innerHTML = `
            <div class='wrapper'>
                <input type='number' value='0.0'>
                <input type='number' value='0.0'>
            </div>
        `;

        let t_inputs = t_vector.children[0];
        let t_button = null;

        if("value" in _parameters)
        {
            try {
                t_inputs.children[0].value = parseFloat('x' in _parameters.value ? _parameters.value.x : _parameters.value[0]);
                t_inputs.children[1].value = parseFloat('y' in _parameters.value ? _parameters.value.y : _parameters.value[1]);
            }
            catch(err) {
                console.log(err)
                console.log(_parameters.value)
            }
        }
        if("text_align" in _parameters)
        {
            t_inputs.children[0].style.textAlign = _parameters.text_align;
            t_inputs.children[1].style.textAlign = _parameters.text_align;
        }
        if(_parameters.width) t_vector.style.width = _parameters.width;
        if("slot_padding" in _parameters)
        {
            t_inputs.children[0].style.padding = _parameters.slot_padding;
            t_inputs.children[1].style.padding = _parameters.slot_padding;
        }
        if('type' in _parameters)
        {
            if(_parameters.type === "position" || _parameters.type === "rotation" || _parameters.type === "scale") t_vector.classList.add('coordinates');
        }

        let button_func = _parameters.oncheck;
        if(button_func)
        {
            t_button = t_vector.appendChild(Builder.CreatePressButton({
                after_image: _parameters.image || '/web/images/check_icon.png', size: "1.1em",
                onclick: function(_event, _button) {
                    button_func(t_vector.GetValue(), t_vector, t_button, _event);
                }
            }));
        }

        if(t_button)
        {
            this.OnReady(t_vector, function() {
                let t_buttonWidth = t_button.clientWidth;
                let t_width = "calc(100% - " + t_buttonWidth + "px)";
                t_vector.children[0].style.width = t_width;
            });
        }

        if('onchange' in _parameters)
        {
            t_inputs.children[0].oninput = function() {
                _parameters.onchange(t_vector.GetValue(), t_vector);
            }
            t_inputs.children[1].oninput = function() {
                _parameters.onchange(t_vector.GetValue(), t_vector);
            }
        }

        Builder.SetMargins(t_vector, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        /// functions
        t_vector.GetValue = function() {
            return {
                x: parseFloat(t_inputs.children[0].value),
                y: parseFloat(t_inputs.children[1].value)
            }
        }

        t_vector.SetValue = function(_value, trigger_function = false) {
            try {
                t_inputs.children[0].value = parseFloat('x' in _value ? _value.x : _value[0]);
                t_inputs.children[1].value = parseFloat('y' in _value ? _value.y : _value[1]);
                if(trigger_function == true && _parameters.onchange) _parameters.onchange(t_vector.GetValue(), t_vector);
            }
            catch(err) {
                console.log(err)
                console.log(_value)
            }
        }

        if(_parameters.wheel_input)
        {
            Builder.SetupWheelInput(t_inputs.children[0], { increment: _parameters.wheel_input });
            Builder.SetupWheelInput(t_inputs.children[1], { increment: _parameters.wheel_input });
        }

        if(_parameters.drag_input)
        {
            Builder.SetupDragInput(t_inputs.children[0], { step: _parameters.drag_input });
            Builder.SetupDragInput(t_inputs.children[1], { step: _parameters.drag_input });
            t_vector.StopDrag = function() {
                t_inputs.children[0].StopDrag();
                t_inputs.children[1].StopDrag();
            }
        }

        let t_allowEdit = true;
        t_vector.EnableEdit = function() {
            t_allowEdit = true;
            t_vector.classList.remove("disabled");
            t_inputs.children[0].disabled = false;
            t_inputs.children[1].disabled = false;
            if(t_button) t_button.SetImage('/web/images/check_icon.png');
        }

        t_vector.DisableEdit = function() {
            t_allowEdit = false;
            t_vector.classList.add("disabled");
            t_inputs.children[0].disabled = true;
            t_inputs.children[1].disabled = true;
            if(t_button) t_button.SetImage('/web/images/edit_icon.png');
        }

        t_vector.ToggleEdit = function() {
            if(t_allowEdit == true) t_vector.DisableEdit();
            else t_vector.EnableEdit();
        }

        if('disable' in _parameters && _parameters.disable == true) t_vector.DisableEdit();
        if("allow_edit" in _parameters && _parameters.allow_edit == false) t_vector.DisableEdit();

        return t_vector;
    }

    static CreateVec3Input(_parameters)
    {
        let t_vector = document.createElement('div');
        t_vector.className = 'vec3_input';
        t_vector.innerHTML = `
            <div class='wrapper'>
                <input type='number' value='0.0'>
                <input type='number' value='0.0'>
                <input type='number' value='0.0'>
            </div>
        `;

        let t_inputs = t_vector.children[0];
        let t_button = null;


        if("text_align" in _parameters)
        {
            t_inputs.children[0].style.textAlign = _parameters.text_align;
            t_inputs.children[1].style.textAlign = _parameters.text_align;
            t_inputs.children[2].style.textAlign = _parameters.text_align;
        }
        if(_parameters.width) t_vector.style.width = _parameters.width;
        if("slot_padding" in _parameters)
        {
            t_inputs.children[0].style.padding = _parameters.slot_padding;
            t_inputs.children[1].style.padding = _parameters.slot_padding;
            t_inputs.children[2].style.padding = _parameters.slot_padding;
        }
        if('type' in _parameters)
        {
            if(_parameters.type === "position" || _parameters.type === "rotation" || _parameters.type === "scale") t_vector.classList.add('coordinates');
        }

        let button_func = _parameters.oncheck;
        if(button_func)
        {
            t_button = t_vector.appendChild(Builder.CreatePressButton({
                after_image: _parameters.image || '/web/images/check_icon.png', size: "1.1em",
                onclick: function(_event, _button) {
                    button_func(t_vector.GetValue(), t_vector, t_button, _event);
                }
            }));
        }

        if(t_button)
        {
            this.OnReady(t_vector, function() {
                let t_buttonWidth = t_button.clientWidth;
                let t_width = "calc(100% - " + t_buttonWidth + "px)";
                t_vector.children[0].style.width = t_width;
            });
        }

        if('onchange' in _parameters)
        {
            t_inputs.children[0].oninput = function() {
                _parameters.onchange(t_vector.GetValue());
            }
            t_inputs.children[1].oninput = function() {
                _parameters.onchange(t_vector.GetValue());
            }
            t_inputs.children[2].oninput = function() {
                _parameters.onchange(t_vector.GetValue());
            }
        }

        Builder.SetMargins(t_vector, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        /// functions
        t_vector.GetValue = function() {
            return {
                x: parseFloat(t_inputs.children[0].value),
                y: parseFloat(t_inputs.children[1].value),
                z: parseFloat(t_inputs.children[2].value)
            }
        }

        t_vector.SetValue = function(_value, trigger_function = false) {
            try {
                t_inputs.children[0].value = parseFloat('x' in _value ? _value.x : _value[0]);
                t_inputs.children[1].value = parseFloat('y' in _value ? _value.y : _value[1]);
                t_inputs.children[2].value = parseFloat('z' in _value ? _value.z : _value[2]);
                if(trigger_function == true && _parameters.onchange) _parameters.onchange(t_vector.GetValue());
            }
            catch(err) {
                console.log(err)
                console.log(_value)
            }
        }

        if(_parameters.wheel_input)
        {
            Builder.SetupWheelInput(t_inputs.children[0], { increment: _parameters.wheel_input });
            Builder.SetupWheelInput(t_inputs.children[1], { increment: _parameters.wheel_input });
            Builder.SetupWheelInput(t_inputs.children[2], { increment: _parameters.wheel_input });
        }

        if(_parameters.drag_input)
        {
            Builder.SetupDragInput(t_inputs.children[0], { step: _parameters.drag_input });
            Builder.SetupDragInput(t_inputs.children[1], { step: _parameters.drag_input });
            Builder.SetupDragInput(t_inputs.children[2], { step: _parameters.drag_input });
            t_vector.StopDrag = function() {
                t_inputs.children[0].StopDrag();
                t_inputs.children[1].StopDrag();
                t_inputs.children[2].StopDrag();
            }
        }

        if("value" in _parameters) t_vector.SetValue(_parameters.value);

        let t_allowEdit = true;
        t_vector.EnableEdit = function() {
            t_allowEdit = true;
            t_vector.classList.remove("disabled");
            t_inputs.children[0].disabled = false;
            t_inputs.children[1].disabled = false;
            t_inputs.children[2].disabled = false;
            if(t_button) t_button.SetImage('/web/images/check_icon.png');
        }

        t_vector.DisableEdit = function() {
            t_allowEdit = false;
            t_vector.classList.add("disabled");
            t_inputs.children[0].disabled = true;
            t_inputs.children[1].disabled = true;
            t_inputs.children[2].disabled = true;
            if(t_button) t_button.SetImage('/web/images/edit_icon.png');
        }

        t_vector.ToggleEdit = function() {
            if(t_allowEdit == true) t_vector.DisableEdit();
            else t_vector.EnableEdit();
        }

        if('disable' in _parameters && _parameters.disable == true) t_vector.DisableEdit();
        if("allow_edit" in _parameters && _parameters.allow_edit == false) t_vector.DisableEdit();

        return t_vector;
    }

    static CreateTextInput(_parameters)
    {
        let t_input = document.createElement('div');
        t_input.className = 'text_input';
        t_input.innerHTML = `
            <div class='button'>
                <p></p>
                <img>
            </div>
            <input type='text' value=''>
        `;

        let t_button = t_input.children[0];
        let t_text = t_input.children[1];
        let t_buttonIcon = t_button.children[1];

        let enter_function = _parameters.onenter || _parameters.onclick;

        if(_parameters.type) t_text.type = _parameters.type;
        if(_parameters.width) t_input.style.width = _parameters.width;
        if(_parameters.min_width) t_input.style.minWidth = _parameters.min_width;
        if(_parameters.image_source) t_buttonIcon.src = _parameters.image_source;
        else if(_parameters.button_image) t_buttonIcon.src = _parameters.button_image;
        else t_buttonIcon.remove();
        if(_parameters.placeholder) t_text.placeholder = _parameters.placeholder;
        if("value" in _parameters) t_text.value = _parameters.value;
        if(_parameters.password) t_text.type = 'password';
        if(_parameters.text_align) t_text.style.textAlign = _parameters.text_align;
        if(_parameters.title) t_button.children[0].textContent = _parameters.title;
        else t_button.children[0].remove();
        if(_parameters.font_weight) t_text.style.fontWeight = _parameters.font_weight;
        if(_parameters.size)
        {
            t_button.style.fontSize = _parameters.size;
            t_text.style.fontSize = _parameters.size;
        }
        if(_parameters.no_button && _parameters.no_button == true)
        {
            t_button.remove();
            t_button = null;
            t_input.classList.add("no_button");
        }
        else if(_parameters.button_position && _parameters.button_position === "right")
        {
            t_input.style.flexDirection = "row-reverse";
            t_input.classList.add("right");
        }
        if(_parameters.disable && _parameters.disable == true)
        {
            t_input.classList.add("disabled");
            t_text.disabled = true;
        }
        if("allow_edit" in _parameters && _parameters.allow_edit == false)
        {
            t_input.classList.add("disabled");
            t_text.disabled = true;
        }

        /// wait for element to be inserted before correcting the width of the input
        if(t_button)
        {
            // t_input.addEventListener("DOMNodeInserted", function() {
            Builder.OnReady(t_input, function() {
                let t_buttonWidth = t_button.clientWidth;
                let t_width = "calc(100% - " + t_buttonWidth + "px)";
                t_text.style.width = t_width;
            });
        }

        if('onclear' in _parameters)
        {
            let t_clearButton = t_input.appendChild(document.createElement('div'));
            t_clearButton.className = 'clear_button';
            t_clearButton.innerHTML = `<img src='/web/images/close_slim_icon.png'>`;
            t_clearButton.onclick = function() {
                _parameters.onclear(t_text);
            }

            if(_parameters.clear_tip) Builder.AddToolTip(t_clearButton, _parameters.clear_tip);
        }

        Builder.SetMargins(t_input, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        if(enter_function)
        {
            if(t_button) t_button.onclick = function(ev) {
                Builder.StopPropagation(ev);
                enter_function(t_input.GetValue(), this, ev);
            }
    
            t_text.onkeypress = function(event) {
                if(event.key === "Enter") enter_function(t_input.GetValue(), this, event);
            }    
        }
        else if(_parameters.onvalidate)
        {
            if(t_button) t_button.onclick = function(ev) {
                Builder.StopPropagation(ev);

                if(t_text.disabled == true) t_input.EnableEdit();
                else
                {
                    t_input.ToggleEdit();
                    _parameters.onvalidate(t_input.GetValue());
                }
            }
        }

        if(_parameters.wheel_input)
        {
            Builder.SetupWheelInput(t_text, { increment: _parameters.wheel_input });
        }

        if(_parameters.drag_input)
        {
            Builder.SetupDragInput(t_text, { step: _parameters.drag_input });
            t_input.StopDrag = function() {
                t_text.StopDrag();
            }
        }

        if('onchange' in _parameters)
        {
            t_text.oninput = function() {
                _parameters.onchange(t_input.GetValue(), t_input);
            }
        }

        if('onunfocus' in _parameters)
        {
            t_text.onchange = function() {
                _parameters.onunfocus(t_input.GetValue());
            }
        }

        t_input.Lock = function(ignore_button) {
            t_text.disabled = true;
            t_input.classList.add("disabled");
            t_input.classList.add("lock");
            if(!t_button || (ignore_button && ignore_button == true)) return;
            
            t_buttonIcon.src = "/web/images/edit_icon.png";
        }

        t_input.Unlock = function() {
            t_input.classList.remove("lock");
        }

        t_input.EnableEdit = function(ignore_button = null) {
            t_text.disabled = false;
            t_input.classList.remove("disabled");
            t_input.classList.remove("lock");
            if(!t_button || (ignore_button && ignore_button == true)) return;
            
            t_buttonIcon.src = "/web/images/check_icon.png";
        }

        t_input.DisableEdit = function() {
            t_input.Lock();
        }

        t_input.ToggleEdit = function() {
            t_text.disabled = !t_text.disabled;
            t_input.classList.toggle("disabled");
            if(t_text.disabled == true) t_buttonIcon.src = "/web/images/edit_icon.png";
            else t_buttonIcon.src = "/web/images/check_icon.png";
        }

        let t_integer = t_text.type === 'number' && (_parameters.integer || false);
        t_input.GetValue = function() {
            if(t_integer == true) t_text.value = parseInt(t_text.value.length > 0 ? t_text.value : "0");
            else if(t_text.type === "number") t_text.value = parseFloat(t_text.value.length > 0 ? t_text.value : "0.0");
            return t_text.value;
        }

        t_input.SetValue = function(_val) {
            t_text.value = _val;
        }

        t_input.Clear = function() {
            t_text.value = "";
        }

        t_input.Focus = function() {
            t_text.focus();
        }

        return t_input;
    }

    static CreateTextEditor(_parameters)
    {
        let t_text = document.createElement('div');
        t_text.className = 'text_editor';
        t_text.innerHTML = `
            <textarea></textarea>
        `;
        let t_input = t_text.children[0];
        if(_parameters.width) t_text.style.width = _parameters.width;
        if(_parameters.height)
        {
            t_text.style.height = _parameters.height;
            t_input.style.height = "calc(100% - 0.5em)";
        }
        if(_parameters.max_height) t_input.style.maxHeight = _parameters.max_height;
        if(_parameters.min_height) t_input.style.minHeight = _parameters.min_height;
        if(_parameters.placeholder) t_input.placeholder = _parameters.placeholder;
        if(_parameters.text_align) t_input.style.textAlign = _parameters.text_align;
        if(_parameters.text) t_input.value = _parameters.text;
        if(_parameters.size) t_text.style.fontSize = _parameters.size;
        if(_parameters.weight) t_input.style.fontWeight = _parameters.weight;
        if(_parameters.resize) t_input.style.resize = _parameters.resize;
        if('text_wrap' in _parameters && _parameters.text_wrap == false) t_input.style.whiteSpace = "pre";

        Builder.SetMargins(t_text, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);
        if(_parameters.position) Builder.SetPosition(t_text, _parameters.position);
        // t_text.style.marginBottom = "calc(" + t_text.style.marginBottom + " - 0.25em)";

        let ctrlPressed = false;
        let enterPressed = false;
        t_input.onkeyup = function(ev) {
            if(!_parameters.height) Builder.TextareaAutoresize(t_input, "0.25em");
            if(ev.key === "Control") ctrlPressed = false;
            if(ev.key === "Enter") enterPressed = false;
        }

        if("allow_shortcuts" in _parameters && _parameters.allow_shortcuts == true)
        {
            t_input.onkeydown = function(ev) {
                if(ev.key === "Control") ctrlPressed = true;
                if(ev.key === "Enter") enterPressed = true;
                if(ctrlPressed == true && enterPressed == true)
                {
                    Validate();
                    ctrlPressed = false;
                    enterPressed = false;
                }
            }    
        }

        if(_parameters.onchange)
        {
            t_input.oninput = function(ev) {
                _parameters.onchange(t_input.value);
            }
        }

        if(_parameters.ondrop)
        {
            Builder.SetupDrop(t_text, _parameters.ondrop);
        }
    

        let t_button = null;
        if(_parameters.validate_function)
        {
            t_button = Builder.CreatePressButton({
                after_image: "/web/images/edit_icon.png", size: _parameters.button_size || "1.1em", position: {bottom: "0.25em", right: "0.25em"},
                style: _parameters.button_style || null,
                onclick: Validate
            });
            t_text.appendChild(t_button);
        }

        t_text.DisableEdit = function(ignore_button)
        {
            t_text.classList.add('disable');
            t_input.disabled = true;

            if(!t_button || (ignore_button && ignore_button == true)) return;

            t_button.SetImage('/web/images/edit_icon.png');
            t_button.onclick = function() {
                t_text.EnableEdit();
            }
        }

        t_text.EnableEdit = function()
        {
            t_text.classList.remove('disable');
            t_input.disabled = false;

            if(!t_button) return;

            t_button.SetImage('/web/images/check_icon.png');
            t_button.onclick = Validate;
        }

        let t_autoDisable = true;
        if('no_disable' in _parameters && _parameters.no_disable == true) t_autoDisable = false;
        function Validate()
        {
            if(t_autoDisable == true) t_text.DisableEdit();
            if(_parameters.validate_function) _parameters.validate_function(t_input.value);
        }

        if(!_parameters.height)
        {
            setTimeout(function()  {
                Builder.TextareaAutoresize(t_input, "0.25em");
            }, 10);
        }

        if(_parameters.disable && _parameters.disable == true) t_text.DisableEdit();
        else t_text.EnableEdit();

        t_text.Clear = function() {
            t_input.value = "";
        }

        t_text.GetValue = function() {
            return t_input.value;
        }

        t_text.SetValue = function(_val) {
            t_input.value = _val;
            if(_parameters.onchange) _parameters.onchange(t_input.value);
        }

        t_text.Lock = function(ignore_button) {
            t_text.DisableEdit(ignore_button);
            t_text.classList.add('locked');
        }

        t_text.Unlock = function() {
            t_text.classList.remove('locked');
        }

        t_text.Autoresize = function() {
            Builder.TextareaAutoresize(t_input, "0.25em");
        }

        let t_ref = null;
        t_text.AddReference = function(ref_parameters) {
            if(ref_parameters.position && ref_parameters.position === 'after') t_ref = t_text.appendChild(document.createElement("div"), t_input);
            else t_ref = t_text.insertBefore(document.createElement("div"), t_input);
            t_ref.className = "reference";
            t_ref.innerHTML = `
                <p></p>
                <img src='/web/images/close_icon.png'>
            `;

            if(ref_parameters.text) t_ref.children[0].textContent = ref_parameters.text;
            t_ref.children[1].onclick = function() {
                t_ref.remove();
                t_ref = null;
                if(ref_parameters.onclose) ref_parameters.onclose();
            }
        }

        t_text.ClearReference = function() {
            if(t_ref) t_ref.remove();
        }

        let t_markers = [];
        t_text.AddMarker = function(_line) {
            let t_marker = t_text.appendChild(document.createElement('div'));
            t_marker.classList = 'marker';
            t_marker.style.top = (1.46 * _line - 0.7) + "em";
            t_markers.push(t_marker);
        }

        t_text.ClearMarkers = function() {
            for(let i = 0; i < t_markers.length; i++) t_markers[i].remove();
        }

        return t_text;
    }

    static CreateButtonList(_parameters)
    {
        let t_list = document.createElement('div');
        t_list.className = 'button_list';

        if(_parameters.buttons)
        {
            for(let i = 0; i < _parameters.buttons.length; i++)
            {
                if(_parameters.type === 'basic')
                {
                    let t_button = this.CreateBasicButton({
                        before_image: _parameters.buttons[i].image,
                        text: _parameters.buttons[i].text,
                        filter: _parameters.buttons[i].filter,
                        size: _parameters.size,
                        weight: _parameters.weight,
                        material: _parameters.material,
                        style: _parameters.buttons[i].style,
                        onclick: _parameters.buttons[i].onclick
                    });
                    t_list.appendChild(t_button);    
                }
                else if(_parameters.type === 'hover')
                {
                    let t_button = this.CreateHoverButton({
                        before_image: _parameters.buttons[i].image,
                        text: _parameters.buttons[i].text,
                        filter: _parameters.buttons[i].filter,
                        size: _parameters.size,
                        weight: _parameters.weight,
                        material: _parameters.material,
                        style: _parameters.buttons[i].style,
                        onclick: _parameters.buttons[i].onclick
                    });
                    t_list.appendChild(t_button);    
                }
                else
                {
                    let t_button = this.CreatePressButton({
                        before_image: _parameters.buttons[i].image,
                        text: _parameters.buttons[i].text,
                        filter: _parameters.buttons[i].filter,
                        size: _parameters.size,
                        weight: _parameters.weight,
                        material: _parameters.material,
                        style: _parameters.buttons[i].style,
                        onclick: _parameters.buttons[i].onclick
                    });
                    t_list.appendChild(t_button);    
                }
            }
        }

        if('shrink' in _parameters && _parameters.shrink == true)
        {
            for(let i = 0; i < t_list.children.length; i++) t_list.children[i].classList.add("shrink");
        }

        return t_list;
    }

    static CreateHorizontalTable(_parameters)
    {
        let t_table = document.createElement('div');
        t_table.className = "horizontal_table";

        let t_divides = _parameters.divides || [];
        let t_html = ``;
        for(let i = 0; i < t_divides.length + 1; i++) t_html += `<div></div>`;
        t_table.innerHTML = t_html;

        let t_width = 0;
        for(let i = 0; i < t_divides.length; i++)
        {
            t_table.children[i].style.width = t_divides[i] + "%";
            t_width += t_divides[i];
        }
        t_table.children[t_divides.length].style.width = Math.max(0, 100 - t_width) + "%";

        return t_table;
    }

    static CreatePairTable(_parameters = {})
    {
        let t_table = document.createElement('div');
        t_table.className = "pair_table";

        let t_leftWidth = null;
        let t_rightWidth = null;
        let t_leftAlign = "left";
        let t_rightAlign = "left";
        let t_rowSpacing = "0px";

        if(_parameters.title)
        {
            let t_title = document.createElement('div');
            t_title.className = 'title';
            t_title.innerHTML = `<p>` + _parameters.title + `</p>`;
            t_table.appendChild(t_title);

            if(_parameters.title_size) t_title.children[0].style.fontSize = _parameters.title_size;
            if(_parameters.title_margin)
            {
                t_title.style.marginTop = _parameters.title_margin;
                t_title.style.marginBottom = _parameters.title_margin;
            }
        }

        if(_parameters.width) t_table.style.width = _parameters.width;
        if(_parameters.left_width) t_leftWidth = _parameters.left_width;
        if(_parameters.right_width) t_rightWidth = _parameters.right_width;
        if(_parameters.left_align) t_leftAlign = _parameters.left_align;
        if(_parameters.right_align) t_rightAlign = _parameters.right_align;
        if(_parameters.style) Builder.ApplyStyles(t_table, _parameters.style);
        if("row_spacing" in _parameters) t_rowSpacing = _parameters.row_spacing;

        Builder.SetMargins(t_table, _parameters.margin || _parameters.margins, _parameters.padding, _parameters.align);

        t_table.AppendRow = function(left_ele, right_ele) {
            let t_row = document.createElement('div');
            t_row.className = 'row';
            t_row.innerHTML = `
                <div class='left'></div>
                <div class='right'></div>
            `;
            t_row.children[0].appendChild(left_ele);
            t_row.children[1].appendChild(right_ele);

            if(t_leftWidth) t_row.children[0].style.width = t_leftWidth;
            if(t_leftAlign === "right") t_row.children[0].style.justifyContent = 'flex-end';
            else if(t_leftAlign === "center") t_row.children[0].style.justifyContent = 'center';

            if(t_rightWidth) t_row.children[1].style.width = t_rightWidth;
            if(t_rightAlign === "right") t_row.children[1].style.justifyContent = 'flex-end';
            else if(t_rightAlign === "center") t_row.children[1].style.justifyContent = 'center';

            if(t_rowSpacing !== "0px")
            {
                t_row.style.marginTop = t_rowSpacing;
                t_row.style.marginBottom = t_rowSpacing;
            }

            t_table.appendChild(t_row);

            return right_ele;
        }

        if(_parameters.onclick)
        {
            t_table.onclick = function() {
                _parameters.onclick();
            }
            t_table.style.cursor = "pointer";
        }

        return t_table;
    }

    static CreateTagInput(_parameters)
    {
        let t_input = document.createElement('div');
        t_input.className = 'tag_input';
        t_input.innerHTML = `
            <div class='top'>
                <p></p>
            </div>
            <div class='tag_list'></div>
        `;

        let t_allowEdit = true;
        let t_values = [];
        let onchange_function = _parameters.onchange;

        let t_top = t_input.children[0];
        let t_label = t_top.children[0];
        let t_tagList = t_input.children[1];

        function AddTag(_value)
        {
            if(t_allowEdit == false) return;

            if(_value === "") return;
            for(let i = 0; i < t_values.length; i++) if(t_values[i] === _value) return;
            t_values.push(_value);

            let t_tag = document.createElement("div");
            t_tag.className = 'tag';
            t_tag.innerHTML = `<p>` + _value + `</p><img src='/web/images/close_icon_thin.png'>`;
            t_tagList.appendChild(t_tag);

            t_tag.children[1].onclick = function() {
                RemoveTag(_value);
                t_tag.remove();
            }
        }

        function RemoveTag(_value)
        {
            if(t_allowEdit == false) return;

            for(let i = 0; i < t_values.length; i++)
            {
                if(t_values[i] === _value)
                {
                    t_values[i] = t_values[t_values.length - 1];
                    t_values.pop();
                    if(onchange_function) onchange_function(t_values);
                    return;
                }
            }
        }

        let t_text = t_top.appendChild(Builder.CreateTextInput({
            title: _parameters.button_label,
            placeholder: _parameters.placeholder,
            image_source: _parameters.image_source,
            text_align: 'center',
            align: 'center',
            onenter: function(_value) {
                /// create tag and clear input
                AddTag(_value);
                t_text.Clear();

                if(onchange_function) onchange_function(t_values);
            }
        }));

        if("width" in _parameters)
        {
            t_input.style.width = _parameters.width;
            t_top.style.width = "100%";
        }
        if('size' in _parameters) t_input.style.fontSize = _parameters.size;
        if('weight' in _parameters) t_label.style.fontWeight = _parameters.weight;
        if("label" in _parameters) t_label.textContent = _parameters.label;
        else
        {
            t_label.remove();
            t_label = null;
        }

        t_input.Clear = function() {
            t_values = [];
            t_tagList.innerHTML = ``;
        }

        t_input.SetValue = function(_tags) {
            t_input.Clear();
            _tags.forEach(_tag => {
                AddTag(_tag)
            });
        }

        if("starting_values" in _parameters) t_input.SetValue(_parameters.starting_values);

        Builder.SetMargins(t_input, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);
        if("style" in _parameters) Builder.ApplyStyles(t_input, _parameters.style);


        t_input.DisableEdit = function() {
            t_input.classList.add("disabled");
            t_text.style.display = 'none';
        }

        t_input.EnableEdit = function() {
            t_input.classList.remove("disabled");
            t_text.style.display = 'flex';
        }

        if("allow_edit" in _parameters && _parameters.allow_edit == false) t_input.DisableEdit();

        return t_input;
    }



    static CreateCheckList(_parameters)
    {
        let t_checkList = document.createElement('div');
        t_checkList.className = "check_list";
        t_checkList.innerHTML = `
            <div class='label'><p></p></div>
            <div class='list'></div>
        `;

        let t_label = t_checkList.children[0];
        let t_list = t_checkList.children[1];

        let t_dragging = false;
        let onchange_function = _parameters.onchange;

        let t_items = [];
        let values = [];
        function ToggleItem(_ele, _value)
        {
            for(let i = 0; i < values.length; i++)
            {
                if(values[i] === _value)
                {
                    values[i] = values[values.length - 1];
                    values.pop();
                    _ele.classList.remove("select");

                    onchange_function(values);
                    return;
                }
            }

            _ele.classList.add("select");
            values.push(_value);
            onchange_function(values);
        }

        if(_parameters.title)
        {
            t_label.children[0].textContent = _parameters.title;
            if(_parameters.weight) t_label.style.fontWeight = _parameters.weight;
        }
        else t_label.remove();
        if("width" in _parameters) t_checkList.style.width = _parameters.width;
        if("size" in _parameters) t_checkList.style.fontSize = _parameters.size;
        if(_parameters.child_align)
        {
            if(_parameters.child_align === 'left') t_checkList.style.justifyContent = "flex-start";
            else if(_parameters.child_align === 'center') t_checkList.style.justifyContent = "center";
            else if(_parameters.child_align === 'right') t_checkList.style.justifyContent = "flex-end";
        }

        if(_parameters.list)
        {
            t_items = _parameters.list;
            for(let i = 0; i < t_items.length; i++)
            {
                let t_check = document.createElement('div');
                t_check.className = 'check';

                if(t_items[i].text)
                {
                    let t_text = t_check.appendChild(document.createElement('p'));
                    t_text.textContent = t_items[i].text;
                }
                if(t_items[i].image)
                {
                    let t_image = t_check.appendChild(document.createElement('img'));
                    t_image.src = t_items[i].image;
                }

                if(t_items[i].tip)
                {
                    /// information that appears on hovering
                    Builder.AddToolTip(t_check, t_items[i].tip);
                }

                if(!('value' in t_items[i])) t_items[i].value = t_items[i].text || i;

                t_list.appendChild(t_check);

                t_check.onclick = function() {
                    if(t_dragging == true) return;
                    ToggleItem(t_check, t_items[i].value);
                }
            }
        }

        if('one_line' in _parameters && _parameters.one_line == true)
        {
            t_checkList.classList.add("one_line");
            t_list.style.left = 0;

            let t_scrollStart = 0;
            Builder.MakeDraggable(t_list, null,
                function(delta) {
                    /// prevent click once there is a bit of drag
                    if(Math.abs(delta.x) > 2) t_dragging = true;
                    if(delta.x == 0) t_scrollStart = parseInt(t_list.style.left);
                    else
                    {
                        let t_left = delta.x + t_scrollStart;
                        t_list.style.left = ToolBox.Clamp(t_left, t_checkList.clientWidth - t_list.clientWidth, 0) + "px";
                    }
                },
                function() {
                    /// we delay the drag end so the click can happen before
                    setTimeout(function() { t_dragging = false; }, 10);
                }
            )
        }

        t_checkList.SetValue = function(_checks) {
            values = _checks;
            if(_checks.length == 0) t_checkList.Clear();
            else
            {
                for(let i = 0; i < t_items.length; i++)
                {
                    if(_checks.includes(t_items[i].value)) t_list.children[i].classList.add('select');
                    else t_list.children[i].classList.remove('select');
                }    
            }
        }

        if(_parameters.value) t_checkList.SetValue(_parameters.value);

        t_checkList.Clear = function() {
            for(let i = 0; i < t_list.children.length; i++) t_list.children[i].classList.remove('select');
        }

        Builder.SetMargins(t_checkList, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        t_checkList.EnableEdit = function() {
            t_checkList.classList.remove("disabled");
        }

        t_checkList.DisableEdit = function() {
            t_checkList.classList.add("disabled");
        }

        return t_checkList;
    }

    static CreateGrabber(_parameters = {})
    {
        let t_grabber = document.createElement('div');
        t_grabber.className = 'grabber';
        t_grabber.innerHTML = `
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        `;
        return t_grabber;
    }

    static CreateFloatingBox(_parameters, _elements)
    {
        let t_box = document.createElement('div');
        t_box.className = "floating_box";
        t_box.innerHTML = `
            <div class='wrapper'></div>
            <div class='close'><img src='/web/images/close_icon_shadow.png'></div>
        `;

        /// make sure the window is on top of everything else
        t_box.style.zIndex = window.maxZIndex++;
        
        let t_wrapper = t_box.children[0];
        let t_close = t_box.children[1];
        let onclose_func = _parameters.onclose;

        if(_parameters.material) t_box.classList.add(_parameters.material);
        if(_parameters.style) Builder.ApplyStyles(t_box, _parameters.style);
        if(_parameters.min_width) t_wrapper.style.minWidth = _parameters.min_width;
        if(_parameters.maxWidth) t_box.style.maxWidth = _parameters.maxWidth;
        if(_parameters.maxHeight) t_box.style.maxHeight = _parameters.maxHeight;
        if(_parameters.width) t_wrapper.style.width = _parameters.width;
        if(_parameters.height) t_wrapper.style.height = _parameters.height;
        if(_parameters.close_align && _parameters.close_align === "left")
        {
            t_close.style.left = "0.25em";
            t_close.style.right = "auto";
        }

        if(_elements) for(let i = 0; i < _elements.length; i++) t_wrapper.appendChild(_elements[i]);       
        if(_parameters.scrollbar) this.AddScrollbar({margin: {top: "0.25em", right: "0.25em"}}, t_wrapper);
        if(_parameters.allow_drag && _parameters.allow_drag == true)
        {
            let t_grabber = t_box.appendChild(Builder.CreateGrabber());
            Builder.MakeDraggable(t_grabber, t_box);
        }
        if('allow_resize' in _parameters && _parameters.allow_resize == true)
        {
            setTimeout(function() {
                Builder.MakeResizable(t_box);
                t_box.style.left = (window.innerWidth / 2 - t_box.clientWidth / 2) + "px";
                t_box.style.top = (window.innerHeight / 2 - t_box.clientHeight / 2) + "px";
                t_box.style.width = t_wrapper.clientWidth + "px";
                t_box.style.height = t_wrapper.clientHeight + "px";
                t_box.style.transform = 'none';
                t_wrapper.style.width = "100%";    
            }, 100);
        }

        t_box.AppendElement = function(_ele) {
            t_wrapper.appendChild(_ele);
            return _ele;
        }

        t_box.Close = function() {
            t_box.remove();
            if(onclose_func) onclose_func();
        }

        t_box.GetContainer = function() {
            return t_box.children[0];
        }

        if("onhide" in _parameters)
        {
            t_close.onclick = function() {
                t_box.style.display = "none";
                _parameters.onhide();
            }
        }
        else
        {
            if("no_close" in _parameters && _parameters.no_close == true) t_close.remove();
            else t_close.onclick = t_box.Close;
        }

        document.body.appendChild(t_box);

        return t_box;
    }

    static CreateResponsiveBox(_parameters, top_elements = [], bottom_elements = [])
    {
        // Remove null elements from arrays
        if (top_elements) top_elements = top_elements.filter(function (el) {
            return el != null;
        });
        if (bottom_elements) bottom_elements = bottom_elements.filter(function (el) {
            return el != null;
        }   );
        let t_box = document.createElement('div');
        t_box.className = "responsive_box";
        t_box.innerHTML = `
            <div class='top'></div>
            <div class='bottom'></div>
        `;

        if(_parameters.width)
        {
            t_box.children[0].style.width = "calc(0.5 * " + _parameters.width + ")";
            t_box.children[1].style.width = "calc(0.5 * " + _parameters.width + ")";
        }

        if(_parameters.min_height) t_box.style.minHeight = _parameters.min_height;
        if(_parameters.max_height)
        {
            t_box.children[0].style.maxHeight = _parameters.max_height;
            t_box.children[1].style.maxHeight = _parameters.max_height;
        }
        if(_parameters.height)
        {
            if(mobileWebsite)
            {
                t_box.children[0].style.height = "calc(0.5 * " + _parameters.height + ")";
                t_box.children[1].style.height = "calc(0.5 * " + _parameters.height + ")";
            }
            else
            {
                t_box.children[0].style.height = _parameters.height;
                t_box.children[1].style.height = _parameters.height;
            }
        }

        if(_parameters.material) t_box.classList.add(_parameters.material);
        if(_parameters.style) Builder.ApplyStyles(t_box, _parameters.style);

        if(top_elements) for(let i = 0; i < top_elements.length; i++) t_box.children[0].appendChild(top_elements[i]);
        if(bottom_elements) for(let i = 0; i < bottom_elements.length; i++) t_box.children[1].appendChild(bottom_elements[i]);

        t_box.AppendTop = function(_ele) {
            t_box.children[0].appendChild(_ele);
            return _ele;
        }

        t_box.AppendBottom = function(_ele) {
            t_box.children[1].appendChild(_ele);
            return _ele;
        }

        /// wait for element to be inserted before correcting the width of the input
        this.OnReady(t_box, function() {
            let t_totalWidth = t_box.children[0].clientWidth + t_box.children[1].clientWidth;

            if(t_totalWidth > t_box.clientWidth)
            {
                t_box.classList.add("vertical");
                t_box.children[1].style.width = t_box.children[0].clientWidth + "px";
            }
            else
            {
                let t_height = Math.max(t_box.clientHeight, Math.max(t_box.children[0].clientHeight, t_box.children[1].clientHeight));
                t_box.children[0].style.height = t_height + "px";
                t_box.children[1].style.height = t_height + "px";
            }
        });

        t_box.SetVertical = function() {
            t_box.classList.add("vertical");
        }

        t_box.ClearTop = function() {
            t_box.children[0].innerHTML = '';
        }

        t_box.ClearBottom = function() {
            t_box.children[1].innerHTML = '';
        }
        
        return t_box;
    }

    static CreateSelector(_parameters)
    {
        let t_switch = document.createElement('div');
        t_switch.className = 'selector';
        t_switch.innerHTML = `
            <div class='label'><p></p></div>
            <div class='options'><div class='wrapper'></div></div>
        `;

        let t_label = t_switch.children[0];
        let t_options = t_switch.children[1];
        let t_wrapper = t_options.children[0];
        let _func = _parameters.onselect;

        let t_opened = false;
        let t_currentIndex = 0;
        let t_expandUpward = true;

        t_switch.Open = function() {
            t_switch.classList.add('open');
            t_opened = true;

            // t_wrapper.children[0].style.marginTop = "0px";

            if(t_expandUpward == true)
            {
                let t_deltaY = t_options.clientHeight - t_wrapper.clientHeight;
                t_wrapper.style.transform = 'translateY(' + t_deltaY + 'px)';
            }
            else
            {
                t_wrapper.style.transform = 'translateY(0)';
            }

            /// auto removal when clicking anywhere
            document.onclick = function(event) {
                event.stopPropagation();
                event.preventDefault();
                t_switch.Close();
                document.onclick = null;
            }
        }
        t_switch.Close = function() {
            t_switch.classList.remove('open');
            t_wrapper.style.transform = 'translateY(-' + (t_currentIndex * 1.45) + 'em)';
            t_opened = false;
        }

        function SelectOption(_index, _value)
        {
            if(t_opened == false)
            {
                t_switch.Open();
            }
            else
            {
                t_wrapper.children[t_currentIndex].classList.remove('select');
                t_wrapper.children[_index].classList.add('select');
                t_currentIndex = _index;
                t_switch.Close();

                if(_func && (typeof _value !== "undefined")) _func(_value);    
            }
        }
        
        for(let i = 0; i < _parameters.options.length; i++)
        {
            let t_index = i;
            let t_option = document.createElement('div');
            t_option.className = 'option';
            t_option.innerHTML = '<p>' + _parameters.options[i].text + '</p>';
            t_wrapper.appendChild(t_option);
            t_option.onclick = function(event) {
                event.stopPropagation();
                event.preventDefault();

                if("value" in _parameters.options[i]) SelectOption(t_index, _parameters.options[t_index].value);
                else SelectOption(t_index, _parameters.options[t_index].text);
            }
        }

        if(_parameters.value)
        {
            let i = 0;
            for(i = 0; i < _parameters.options.length; i++) if(_parameters.options[i].value === _parameters.value || _parameters.options[i].text === _parameters.value) break;
            if(i < _parameters.options.length) t_currentIndex = i;
            else t_currentIndex = 0;
            t_switch.Close();
        }

        if(_parameters.label)
        {
            t_label.children[0].textContent = _parameters.label;
            if(_parameters.label_weight) t_label.children[0].style.fontWeight = _parameters.label_weight;
        }
        else
        {
            t_label.remove();
            t_label = null;
        }

        if(_parameters.size) for(let i = 0; i < t_switch.children.length; i++) t_switch.children[i].style.fontSize = _parameters.size;
        if(_parameters.height) t_switch.style.height = _parameters.height;
        if(_parameters.width) t_switch.style.width = _parameters.width;
        if(_parameters.style) Builder.ApplyStyles(t_switch, _parameters.style);
        if(_parameters.expand) t_expandUpward = _parameters.expand === "downward" ? false : true;
        if("shrink" in _parameters && _parameters.shrink == true) t_switch.classList.add("shrink");
        Builder.SetMargins(t_switch, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);


        if(_parameters.align)
        {
            if(_parameters.align === "center") t_switch.style.justifyContent = "center";
            else if(_parameters.align === "left") t_switch.style.justifyContent = "flex-start";
            else if(_parameters.align === "right") t_switch.style.justifyContent = "flex-end";
            else if(_parameters.align === "spread") t_switch.style.justifyContent = "space-between";
        }

        t_switch.DisableEdit = function() {
            t_switch.classList.add("disabled");
        }

        t_switch.EnableEdit = function() {
            t_switch.classList.remove("disabled");
        }

        if('allow_edit' in _parameters && _parameters.allow_edit == false) t_switch.DisableEdit();
        
        return t_switch;
    }

    static CreateMouseMenu(_parameters)
    {
        let t_oldMenu = document.getElementById('mouse_menu');
        if(t_oldMenu) t_oldMenu.remove();

        let t_menu = document.createElement('div');
        t_menu.id = 'mouse_menu';
        document.body.appendChild(t_menu);

        if(_parameters.position)
        {
            if(_parameters.position.x < 0.5 * window.innerWidth) t_menu.style.left = _parameters.position.x + "px";
            else t_menu.style.right = (window.innerWidth - parseInt(_parameters.position.x)) + "px";
            if(_parameters.position.y < 0.5 * window.innerHeight) t_menu.style.top = _parameters.position.y + "px";
            else t_menu.style.bottom = (window.innerHeight - parseInt(_parameters.position.y)) + "px";
        }

        /// auto removal when clicking anywhere
        document.onclick = function(event) {
            event.stopPropagation();
            event.preventDefault();
            document.onclick = null;
            if("cancel_func" in _parameters) _parameters.cancel_func();
            t_menu.remove();
        }

        return t_menu;
    }

    static CreateAddressBar(_parameters)
    {
        let t_address = document.createElement('div');
        t_address.className = 'address_bar';
        t_address.innerHTML = `
            <div class='wrapper'></div>
        `;

        let address_func = _parameters.onselect;

        t_address.SetAddress = function(_address) {
            /// empty address bar
            _parameters.address = _address;
            t_address.children[0].innerHTML = '';

            if(_address.charAt(0) == '/') _address = _address.slice(1);
            let t_arr = _address.split('/');
            let t_total = "";
            for(let i = 0; i < t_arr.length; i++)
            {
                if(i > 0)
                {
                    let t_div = document.createElement('div');
                    t_div.className = 'divider';
                    t_address.children[0].appendChild(t_div);    
                }

                let t_button = document.createElement('div');
                t_button.className = 'folder';
                if(i == 0)
                {
                    if(t_arr[0] === _parameters.public_id) t_button.innerHTML = `<p>Public</p>`;
                    else t_button.innerHTML = `<p>Home</p>`;
                }
                else t_button.innerHTML = `<p>` + t_arr[i] + `</p>`;
                if(i == t_arr.length - 1) t_button.style.marginRight = "2.5em";
                t_address.children[0].appendChild(t_button);

                if(_parameters.font_size) t_button.children[0].style.fontSize = _parameters.font_size;

                t_total += "/" + t_arr[i];
                let t_link = t_total;
                t_button.onclick = function() {
                    if(address_func) address_func(t_link);
                }
            }

            /// unfortunate, but mutationobservers do not catch node insertion
            setTimeout(function() {
                t_address.children[0].scrollTo({top: 0, left: 100000, behavior: "smooth"});
            }, 100)
        }

        if(_parameters.address) t_address.SetAddress(_parameters.address);

        if(_parameters.width) t_address.style.width = _parameters.width;
        if(_parameters.height) t_address.style.height = _parameters.height;
        if(_parameters.margin)
        {
            t_address.style.marginLeft = _parameters.margin.left;
            t_address.style.marginRight = _parameters.margin.left;
            if(_parameters.width) t_address.style.width = "calc(" + _parameters.width + " - 2 * " + _parameters.margin.left + ")";
            t_address.style.marginTop = _parameters.margin.top;
            t_address.style.marginBottom = _parameters.margin.top;
        }
        if(_parameters.offset)
        {
            t_address.children[0].style.marginLeft = _parameters.offset;
            if(_parameters.width) t_address.children[0].style.width = "calc(" + _parameters.width + " - " + _parameters.offset + ")";
        }
        if(_parameters.material) t_address.classList.add(_parameters.material);


        return t_address;
    }

    
    static MakeDraggable(trigger_ele, target_ele = null, drag_func = null, drag_end = null, mouse_cursor = null)
    {
        var downLeft = 0, downTop = 0, deltaLeft = 0, deltaTop = 0, targetLeft = 0, targetTop = 0;
        trigger_ele.onmousedown = dragMouseDown;
        trigger_ele.ontouchstart = dragMouseDown;
        trigger_ele.style.cursor = mouse_cursor || "grab";
        let preventClick = false;
    
        function dragMouseDown(e)
        {        
            e = e || window.event;
            e.preventDefault();
            e.stopPropagation();

            // get the mouse cursor position at startup:
            downLeft = e.touches ? e.touches[0].clientX : e.clientX;
            downTop = e.touches ? e.touches[0].clientY : e.clientY;

            if(target_ele)
            {
                targetLeft = target_ele.offsetLeft;
                targetTop = target_ele.offsetTop;
            }

            document.addEventListener('click', PreventDefault, {capture: true});
            document.addEventListener('mouseup', closeDragElement, {capture: true});
            document.addEventListener('mousemove', elementDrag, {capture: true});
            document.addEventListener('touchend', closeDragElement, {capture: true});
            document.addEventListener('touchmove', elementDrag, {capture: true});

            trigger_ele.style.cursor = mouse_cursor || "grabbing";
            document.documentElement.style.cursor = mouse_cursor || 'grabbing';

            if(drag_func) drag_func({x: 0, y: 0});
        }
    
        function elementDrag(e)
        {
            e = e || window.event;
            e.preventDefault();
            e.stopPropagation();

            let mouseX = e.touches ? e.touches[0].clientX : e.clientX;
            let mouseY = e.touches ? e.touches[0].clientY : e.clientY;

            if(mouseX < 0) mouseX = 0;
            else if(mouseX > window.innerWidth) mouseX = window.innerWidth;
            if(mouseY < 0) mouseY = 0;
            else if(mouseY > window.innerHeight) mouseY = window.innerHeight;

            // calculate the new cursor position:
            deltaLeft = mouseX - downLeft;
            deltaTop = mouseY - downTop;

            // set the element's new position:
            if(target_ele)
            {
                target_ele.style.left = (targetLeft + deltaLeft) + "px";    
                target_ele.style.top = (targetTop + deltaTop) + "px";
            }

            /// prevent click if the mouse moves more than 5 pixels
            if(Math.abs(deltaLeft) + Math.abs(deltaTop) > 5) preventClick = true;

            trigger_ele.style.cursor = mouse_cursor || "grabbing";
            document.documentElement.style.cursor = mouse_cursor || 'grabbing';

            if(drag_func) drag_func({x: deltaLeft, y: deltaTop});
        }
    
        function closeDragElement(event) {
            // stop moving when mouse button is released:
            document.removeEventListener('mouseup', closeDragElement, {capture: true});
            document.removeEventListener('mousemove', elementDrag, {capture: true});
            document.removeEventListener('touchend', closeDragElement, {capture: true});
            document.removeEventListener('touchmove', elementDrag, {capture: true});

            trigger_ele.style.cursor = mouse_cursor || "grab";
            document.documentElement.style.cursor = 'initial';

            if(event)
            {
                event.stopPropagation();
                event.preventDefault();    
            }

            if(drag_end) drag_end(event);
        }

        /// this function prevent clicks when the drag happen
        function PreventDefault(event) {
            if(preventClick == true)
            {
                event.stopPropagation();
                event.preventDefault();
                preventClick = false;
            }
            document.removeEventListener('click', PreventDefault, {capture: true});
        }

        let StopDrag = function() {
            closeDragElement();
            preventClick = false;
            PreventDefault();
        }

        trigger_ele.StopDrag = StopDrag;

        return StopDrag;
    }

    static MakeResizable(menu, lock_ratio = true)
    {
        let resizer = menu.appendChild(document.createElement('div'));
        resizer.className = "resizer";
        resizer.innerHTML = `
            <img src='/web/images/extender_icon.png'>
        `

        let downX = 0, downY, downWidth = 0, downHeight = 0, downLeft = 0, downTop = 0;
        resizer.onmousedown = dragMouseDown;
        resizer.ontouchstart = dragMouseDown;
    
        function dragMouseDown(e)
        {
            e = e || window.event;
            if(!e.touches) e.preventDefault();

            // get the menu position relative to the right
            downWidth = menu.clientWidth;
            downHeight = menu.clientHeight;
            downLeft = parseInt(menu.style.left);
            downTop = parseInt(menu.style.top);
            downX = e.touches ? e.touches[0].clientX : e.clientX;
            downY = e.touches ? e.touches[0].clientY : e.clientY;

            menu.classList.add("notouch");

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            document.ontouchend = closeDragElement;
            document.ontouchmove = elementDrag;
        }
    
        function elementDrag(e) {
            e = e || window.event;
            if(!e.touches) e.preventDefault();

            let mouseX = e.touches ? e.touches[0].clientX : e.clientX;
            let mouseY = e.touches ? e.touches[0].clientY : e.clientY;
            if(mouseX < 0) mouseX = 0;
            else if(mouseX > window.innerWidth) mouseX = window.innerWidth;
            if(mouseY < 0) mouseY = 0;
            else if(mouseY > window.innerHeight) mouseY = window.innerHeight;

            /// measure cursor position relative to the right
            let deltaX = mouseX - downX;
            let deltaY = mouseY - downY;
            let newWidth = downWidth - deltaX;
            let newHeight = downHeight + deltaY;
            if(newWidth < 100)
            {
                newWidth = 100;
                deltaX = downWidth - 100;
            }
            if(newHeight < 100) newHeight = 100;

            if(lock_ratio == true)
            {
                let t_ratio = Math.max(newWidth / downWidth, newHeight / downHeight);
                newWidth = t_ratio * downWidth;
                newHeight = t_ratio * downHeight;
                deltaX = downWidth - newWidth;
            }

            // set the element's new width and position:
            menu.style.width = newWidth + "px";
            menu.style.left = (downLeft + deltaX) + "px";
            menu.style.height = newHeight + "px";
        }
    
        function closeDragElement() {
            // stop moving when mouse button is released:
            menu.classList.remove("notouch");

            document.onmouseup = null;
            document.onmousemove = null;
            document.ontouchend = null;
            document.ontouchmove = null;
        }
    }

    static CreateJSONEditor(_parameters)
    {
        /// special types: vectors, matrices...
        let t_specialTypes = _parameters.special_types ? _parameters.special_types : false;
        let t_onchange = _parameters.onchange;
        let t_object = _parameters.json || {};
        let t_ondrop = _parameters.ondrop;

        function CheckEntryName(_keys, _name)
        {
            for(let i = 0; i < 1000; i++)
            {
                let j = 0;
                for(j = 0; j < _keys.length; j++) if(_keys[j] === _name) break;
                if(j >= _keys.length)
                {
                    _keys.push(_name);
                    return _name;
                }

                _name += "_0";
            }

            console.log("error: no new entry name found");
            _keys.push(_name);
            return _name;
        }

        async function QuickMenu(_position, _ele)
        {
            return new Promise(function (resolve, reject) {
                let t_menu = Builder.CreateMouseMenu({
                    position: {
                        x: _position.x,
                        y: _position.y
                    },
                    cancel_func: function() {
                        resolve(null);
                    }
                });
                t_menu.appendChild(Builder.CreateBasicButton({ text: "Number", weight: 600, size: "1.0em", align: "left", onclick: function() {
                    resolve("number")
                    t_menu.remove();
                }}))
                t_menu.appendChild(Builder.CreateBasicButton({ text: "Text", weight: 600, size: "1.0em", align: "left", onclick: function() {
                    resolve("string")
                    t_menu.remove();
                }}))
                t_menu.appendChild(Builder.CreateBasicButton({ text: "Boolean", weight: 600, size: "1.0em", align: "left", onclick: function() {
                    resolve("bool")
                    t_menu.remove();
                }}))
                t_menu.appendChild(Builder.CreateBasicButton({ text: "Array", weight: 600, size: "1.0em", align: "left", onclick: function() {
                    resolve("array")
                    t_menu.remove();
                }}))
                t_menu.appendChild(Builder.CreateBasicButton({ text: "Object", weight: 600, size: "1.0em", align: "left", onclick: function() {
                    resolve("object")
                    t_menu.remove();
                }}))
            });
        }

        function RemoveFromArray(_ele)
        {
            let t_array = _ele.parentNode;
            _ele.remove();
            
            for(let i = 0; i < t_array.children.length - 1; i++) t_array.children[i].SetIndex(i);
        }

        function PrettifyKey(_key)
        {
            let t_key = _key.replace("_", " ");
            return t_key.charAt(0).toUpperCase() + t_key.slice(1);
        }

        function ConsolidateKey(_key)
        {
            let t_key = _key.replace(" ", "_");
            return t_key.toLowerCase();
        }

        function CreateElement(_parent = null, _key = null, _value = null, _shrink, full_edit = false)
        {
            let t_ele = document.createElement("div");
            t_ele.className = "json_element" + ((_shrink == true) ? " shrink" : "");
            if(_parameters.style) Builder.ApplyStyles(t_ele, _parameters.style);

            let t_left = null;
            let t_right = null;
            let t_buttons = [];
            let t_inputs = [];
            let t_keySettings = null;
            let t_key = _key;

            try {
                /// check if the key contains information about the type
                let t_suffix = "";
                if(typeof(_key) === "string" && _key.length > 3 && _key.charAt(_key.length - 3) == '$')
                {
                    t_suffix = _key.slice(-2);
                    t_key = _key.slice(0, _key.length - 3);
                    // if(_parent)
                    // {
                    //     _parent[t_key] = _parent[_key];
                    //     _parent[_key] = null;
                    //     _key = t_key;
                    // }
                }

                if(typeof(t_key) === "string")
                {
                    t_left = document.createElement('div');
                    t_left.className = "json_key";
                    t_left.innerHTML = `
                        <div class='expander'><img src='/web/images/expand_icon.png'></div>
                    `;

                    let t_allowShrink = true;

                    /// key name editor
                    let t_keyInput = Builder.CreateTextInput({
                        value: PrettifyKey(t_key), type: "text", font_weight: 600, width: "calc(100% - 3em)", text_align: _parent ? "left" : "center", disable: true, no_button: true, margin: {top: "0.15em", bottom: "0.15em"},
                        onunfocus: function(_val) {
                            t_key = ConsolidateKey(_val);
                            _parent[t_key] = _parent[_key];
                            _parent[_key] = null;
                            _key = t_key;
                            if(t_onchange) t_onchange(t_object);
                        }
                    });

                    let t_edit = null;
                    if(full_edit == true)
                    {
                        /// edit button
                        t_edit = Builder.CreatePressButton({
                            after_image: "/web/images/edit_icon.png", size: "1.1em", margin: "0.1em",
                            onclick: function(ev) {
                                t_keySettings.EnableEdit();
                            }
                        });
                        t_edit.style.display = 'none';
                        t_buttons.push(t_edit);
                    }

                    /// horizontal listing of the key editor and the button
                    t_keySettings = t_left.appendChild(Builder.CreateHorizontalList({
                            width: "calc(100% - 1.5em)", spread: true
                        }, [t_keyInput, t_edit]
                    ));

                    function RemoveField()
                    {
                        // delete _parent[_key];
                        _parent[_key] = null;
                        t_ele.remove();
                        if(t_onchange) t_onchange(t_object);
                    }

                    t_keySettings.EnableEdit = function() {
                        t_keyInput.EnableEdit();
                        t_allowShrink = false;
                        t_edit.SetImage("/web/images/delete_icon.png");
                        t_edit.SetClickFunction(function() {
                            RemoveField();
                        })
                    }

                    t_keySettings.DisableEdit = function() {
                        t_keyInput.DisableEdit();
                        t_allowShrink = true;
                        t_edit.SetImage("/web/images/edit_icon.png");
                        t_edit.SetClickFunction(function() {
                            t_keySettings.EnableEdit();
                        })
                    }

                    /// shrink / expand button
                    let ExpandField = function() {
                        t_ele.classList.toggle('shrink');
                        /// if the value is a string, we need to resize the textarea
                        if(!t_ele.className.includes('shrink') && t_right.className.includes('json_string')) t_right.children[0].Autoresize();
                    }
                    t_left.children[0].onclick = function() {ExpandField();}
                    t_keyInput.onclick = function() {
                        if(t_allowShrink == false) return;
                        ExpandField();
                    }

                    t_ele.appendChild(t_left);
                }
                else if(typeof(_key) === "number")
                {
                    /// if the field is part of an array
                    let t_left = document.createElement('div');
                    t_left.className = "json_key";

                    /// key name editor
                    let t_keyInput = Builder.CreateTextBox({
                        text: _key.toString(), font_weight: 600, width: "100%", text_align: "left", margin: {left: "0.5em", top: "0.15em", bottom: "0.15em"}
                    });

                    let t_edit = null;
                    if(full_edit == true)
                    {
                        /// edit button
                        t_edit = Builder.CreatePressButton({
                            after_image: "/web/images/delete_icon.png", size: "1.2em", margin: "0.25em",
                            onclick: function(ev) {
                                RemoveFromArray(t_ele, _key);
                                ToolBox.RemoveFromArray(_parent, _key);
                                if(t_onchange) t_onchange(t_object);
                            }
                        });
                        t_edit.style.display = 'none';
                        t_buttons.push(t_edit);
                    }

                    /// horizontal listing of the key editor and the button
                    t_left.appendChild(t_left.appendChild(Builder.CreateHorizontalList({
                            width: "calc(100% - 1.5em)"
                        }, [t_keyInput, t_edit]
                    )));

                    t_ele.SetIndex = function(_index) {
                        _key = _index;
                        t_key = _index;
                        t_keyInput.SetText(_index);
                    }

                    t_ele.appendChild(t_left);
                }

                /// function to allow editing
                t_ele.EnableEdit = function() {
                    for(let i = 0; i < t_inputs.length; i++) t_inputs[i].EnableEdit();
                    for(let i = 0; i < t_buttons.length; i++) t_buttons[i].style.display = "flex";
                }

                t_ele.DisableEdit = function() {
                    for(let i = 0; i < t_inputs.length; i++) t_inputs[i].DisableEdit();
                    for(let i = 0; i < t_buttons.length; i++) t_buttons[i].style.display = "none";
                    if(t_keySettings && full_edit == true) t_keySettings.DisableEdit();
                }

                if(t_specialTypes == true)
                {
                    if(t_suffix === "v2" || t_suffix === "v3" || (typeof(t_key) === "string" && (t_key.includes("position") || t_key.includes("center") || t_key.includes("barycenter") || t_key.includes("size") || t_key.includes("vector"))))
                    {
                        if(_value.length == 3)
                        {
                            t_right = document.createElement('div');
                            t_right.className = 'json_vec3';
                            let t_input = Builder.CreateVec3Input({
                                value: _value, width: "100%", margin: "0.25em", disable: true,
                                drag_input: 0.01,
                                onchange: function(_val) {
                                    if(_parent) _parent[_key] = [_val.x, _val.y, _val.z];
                                    if(t_onchange) t_onchange(t_object);
                                }
                            });
                            t_right.appendChild(t_input);
                            t_ele.appendChild(t_right);
                            t_inputs.push(t_input);

                            if(full_edit == false)
                            {
                                t_ele.classList.add("inline");
                                t_ele.classList.remove("shrink");
                            }
                            return t_ele;
                        }
                        else if(_value.length == 2)
                        {
                            t_right = document.createElement('div');
                            t_right.className = 'json_vec2';
                            let t_input = Builder.CreateVec2Input({
                                value: _value, width: "100%", margin: "0.25em", disable: true,
                                onchange: function(_val) {
                                    if(_parent) _parent[_key] = [_val.x, _val.y];
                                    if(t_onchange) t_onchange(t_object);
                                }
                            });
                            t_right.appendChild(t_input);
                            t_ele.appendChild(t_right);
                            t_inputs.push(t_input);

                            if(full_edit == false)
                            {
                                t_ele.classList.add("inline");
                                t_ele.classList.remove("shrink");
                            }
                            return t_ele;
                        }
                    }
                    else if(typeof(t_key) === "string" && t_key.includes("color") && typeof(_value) === 'object')
                    {
                        t_right = document.createElement('div');
                        t_right.className = 'json_rgb';
                        let t_input = null;
                        if('a' in _value || _value.length >= 4)
                        {
                            t_input = Builder.CreateRGBAInput({
                                value: _value, width: "100%", margin: "0.25em", disable: true,
                                onchange: function(_val) {
                                    if(_parent) _parent[_key] = [_val[0], _val[1], _val[2], _val[3]];
                                    if(t_onchange) t_onchange(t_object);
                                }
                            });
                        }
                        else
                        {
                            t_input = Builder.CreateRGBInput({
                                value: _value, width: "100%", margin: "0.25em", disable: true,
                                onchange: function(_val) {
                                    if(_parent) _parent[_key] = [_val[0], _val[1], _val[2]];
                                    if(t_onchange) t_onchange(t_object);
                                }
                            });    
                        }
                        t_right.appendChild(t_input);
                        t_ele.appendChild(t_right);
                        t_inputs.push(t_input);

                        if(full_edit == false)
                        {
                            t_ele.classList.add("inline");
                            t_ele.classList.remove("shrink");
                        }
                        return t_ele;
                    }
                    else if(typeof(t_key) === "string" && t_key.includes("radius"))
                    {
                        t_right = document.createElement('div');
                        t_right.className = 'json_range';
                        let t_input = Builder.CreateRangeInput({
                            width: "100%", margin: "0.25em", value: _value, min: 0.0, max: 10000.0, step: 0.01,
                            wheel_input: 0.5,
                            drag_input: 0.1,
                            exponent: 4.0,
                            hide_digits: false, digit_width: "2.5em", trail_color: "#4bb25e",
                            onchange_func: function(_val, _range) {
                                if(_parent) _parent[_key] = _val;
                                if(t_onchange) t_onchange(t_object);
                            }
                        })    
                        t_right.appendChild(t_input);
                        t_ele.appendChild(t_right);
                        t_inputs.push(t_input);

                        if(full_edit == false)
                        {
                            t_ele.classList.add("inline");
                            t_ele.classList.remove("shrink");
                        }
                        return t_ele;                        
                    }
                    else if(t_suffix == "a2")
                    {
                        /// horizontal and vertical alignment
                        t_right = document.createElement('div');
                        t_right.className = 'json_a2';
                        let t_horizontal = Builder.CreateSelector({
                            options: [
                                {text: "left"},
                                {text: "center"},
                                {text: "right"}
                            ],
                            value: _value[0],
                            // allow_edit: false,
                            align: "spread",
                            onselect: function(_value) {
                                if(_parent) _parent[_key][0] = _value;
                                if(t_onchange) t_onchange(t_object);
                            }
                        });
                        let t_vertical = Builder.CreateSelector({
                            options: [
                                {text: "top"},
                                {text: "center"},
                                {text: "bottom"}
                            ],
                            value: _value[1],
                            // allow_edit: false,
                            align: "spread",
                            onselect: function(_value) {
                                if(_parent) _parent[_key][1] = _value;
                                if(t_onchange) t_onchange(t_object);
                            }
                        });

                        let t_input = Builder.CreateHorizontalList({
                                width: "100%", margin: "0.25em", spread: true
                            },
                            [t_horizontal, t_vertical]
                        );

                        t_right.appendChild(t_input);
                        t_ele.appendChild(t_right);
                        t_inputs.push(t_horizontal);
                        t_inputs.push(t_vertical);

                        if(full_edit == false)
                        {
                            t_ele.classList.add("inline");
                            t_ele.classList.remove("shrink");
                        }
                        return t_ele;
                    }
                    else if(t_suffix == "li")
                    {
                        /// object selector
                        let t_options = [];
                        for(let i = 0; i < _parameters.part_list.length; i++) t_options[i] = {text: _parameters.part_list[i].name, value: _parameters.part_list[i].local_id};

                        t_right = document.createElement('div');
                        t_right.className = 'json_li';
                        let t_input = t_right.appendChild(Builder.CreateSelector({
                            options: t_options,
                            value: _value,
                            allow_edit: false,
                            align: "spread",
                            onselect: function(_value) {
                                if(_parent) _parent[_key] = _value;
                                if(t_onchange) t_onchange(t_object);
                            }
                        }));
                        t_ele.appendChild(t_right);
                        t_inputs.push(t_input);

                        if(full_edit == false)
                        {
                            t_ele.classList.add("inline");
                            t_ele.classList.remove("shrink");
                        }
                        return t_ele;
                    }
                }

                if(Array.isArray(_value))
                {
                    /// remark: array elements should not be shrinkable
                    t_right = document.createElement('div');
                    t_right.className = 'json_array';
                    for(let i = 0; i < _value.length; i++) t_inputs.push(t_right.appendChild(CreateElement(_value, i, _value[i], false, full_edit)));

                    if(full_edit)
                    {
                        let t_add = t_right.appendChild(Builder.CreatePressButton({
                            before_image: "/web/images/plus_icon.png", text: "Add", size: "1em", margin: "0.25em", align: "center",
                            onclick: function(ev) {
                                QuickMenu({x: ev.clientX, y: ev.clientY}, t_ele).then(_type => {
                                    if(!_type) return;

                                    let t_childValue = null;
                                    if(_type === "number") t_childValue = 0;
                                    else if(_type === "string") t_childValue = "write here";
                                    else if(_type === "bool") t_childValue = false;
                                    else if(_type === "array") t_childValue = [];
                                    else if(_type === "object") t_childValue = {};
                                    
                                    _value.push(t_childValue);
                                    let t_field = t_right.insertBefore(CreateElement(_value, _value.length - 1, t_childValue, false, true), t_add);
                                    t_field.EnableEdit();
                                    t_inputs.push(t_field);
                                    if(t_onchange) t_onchange(t_object);
                                })
                            }
                        }));
                        t_add.style.display = "none";
                        t_buttons.push(t_add);
                    }

                    t_ele.appendChild(t_right);
                    t_ele.classList.add("shadow");
                }
                else if(typeof(_value) === "object")
                {
                    t_right = document.createElement('div');
                    t_right.className = 'json_object';
                    let t_keys = Object.keys(_value);
                    for(let i = 0; i < t_keys.length; i++) if(_value[t_keys[i]] != null) t_inputs.push(t_right.appendChild(CreateElement(_value, t_keys[i], _value[t_keys[i]], _shrink, full_edit)));

                    if(full_edit)
                    {
                        let t_add = t_right.appendChild(Builder.CreatePressButton({
                            before_image: "/web/images/plus_icon.png", text: "Add", size: "1em", margin: "0.25em", align: "center",
                            onclick: function(ev) {
                                QuickMenu({x: ev.clientX, y: ev.clientY}, t_ele).then(_type => {
                                    if(!_type) return;

                                    let t_childKey = null;
                                    let t_childValue = null;
                                    if(_type === "number") { t_childKey = CheckEntryName(t_keys, "number"); t_childValue = 0; }
                                    else if(_type === "string") { t_childKey = CheckEntryName(t_keys, "text"); t_childValue = "write here"; }
                                    else if(_type === "bool") { t_childKey = CheckEntryName(t_keys, "boolean"); t_childValue = false; }
                                    else if(_type === "array") { t_childKey = CheckEntryName(t_keys, "array"); t_childValue = []; }
                                    else if(_type === "object") { t_childKey = CheckEntryName(t_keys, "object"); t_childValue = {}; }
                                    
                                    _value[t_childKey] = t_childValue;
                                    let t_field = t_right.insertBefore(CreateElement(_value, t_childKey, t_childValue, false, true), t_add);
                                    t_field.EnableEdit();
                                    t_inputs.push(t_field);
                                    if(t_onchange) t_onchange(t_object);
                                })
                            }
                        }));
                        t_add.style.display = "none";
                        t_buttons.push(t_add);
                    }

                    t_ele.appendChild(t_right);
                    t_ele.classList.add("shadow");
                }
                else if(typeof(_value) === "boolean")
                {
                    t_right = document.createElement('div');
                    t_right.className = 'json_bool';
                    let t_input = t_right.appendChild(Builder.CreateToggleButton({value: _value, align: "center", allow_edit: false,
                        onchange: function(_val) {
                            if(_parent) _parent[_key] = _val;
                            if(t_onchange) t_onchange(t_object);
                        }
                    }));
                    t_ele.appendChild(t_right);
                    t_inputs.push(t_input);

                    if(full_edit == false)
                    {
                        t_ele.classList.add("inline");
                        t_ele.classList.remove("shrink");
                    }
                }
                else if(typeof(_value) === "string")
                {
                    t_right = document.createElement('div');
                    t_right.className = 'json_string';
                    let t_text = _value;
                    try {t_text = atob(t_text)} catch(e) {}
                    let t_input = t_right.appendChild(Builder.CreateTextEditor({
                        text: t_text, width: "100%", margin: "0.25em", min_height: "1.5em", max_height: "16em", disable: true,
                        onchange: function(_val) {
                            if(_parent) _parent[_key] = btoa(_val);
                            if(t_onchange) t_onchange(t_object);
                        },
                        ondrop: t_ondrop
                    }));
                    t_ele.appendChild(t_right);
                    t_inputs.push(t_input);
                }
                else if(typeof(_value) === "number")
                {
                    t_right = document.createElement('div');
                    t_right.className = 'json_number';
                    let t_input = Builder.CreateTextInput({
                        value: _value, type: "number", width: "100%", margin: "0.25em", text_align: "center", disable: true, no_button: true, integer: (t_suffix === "i1"),
                        onchange: function(_val) {
                            if(_parent) _parent[_key] = parseFloat(_val);
                            if(t_onchange) t_onchange(t_object);
                        }
                    });
                    t_right.appendChild(t_input);
                    t_ele.appendChild(t_right);
                    t_inputs.push(t_input);

                    if(full_edit == false)
                    {
                        t_ele.classList.add("inline");
                        t_ele.classList.remove("shrink");
                    }
                }
            }
            catch(e)
            {
                console.log(e);
                console.log(_value);
                console.log(t_object);
            }

            return t_ele;
        }


        let t_fullEdit = false;
        if(_parameters.allow_edit && _parameters.allow_edit === "all") t_fullEdit = true;

        let t_shrink = true;
        if(_parameters.expand && _parameters.expand !== "first") t_shrink = false;

        let t_name = _parameters.name || "JSON";
        let t_json = CreateElement(null, t_name, t_object, t_shrink, t_fullEdit);

        if(_parameters.expand)
        {
            if(_parameters.expand === "first") t_json.classList.remove('shrink');
            else if(_parameters.expand === "not_first") t_json.classList.add('shrink');
        }

        if(_parameters.size) t_json.style.fontSize = _parameters.size;
        if(_parameters.width) t_json.style.width = _parameters.width;
        Builder.SetMargins(t_json, _parameters.margin || _parameters.margins, _parameters.padding, _parameters.align);

        /// top button editing and validation function
        let SetButtonMode = null;
        if(_parameters.allow_edit && _parameters.allow_edit !== "none")
        {
            let t_button = null;
            if(t_fullEdit == false)
            {
                t_button = t_json.children[0].children[1].appendChild(Builder.CreatePressButton({
                    after_image: "/web/images/edit_icon.png", size: "1.2em", margin: "0.25em"
                }));
            }
            else t_button = t_json.children[0].children[1].children[1];
            t_button.style.display = "flex";

            SetButtonMode = function(_mode) {
                if(_mode === "enable")
                {
                    t_button.SetImage("/web/images/check_icon.png");
                    t_button.SetClickFunction(function(ev) {
                        t_json.DisableEdit();
                        SetButtonMode("disable");
                        if(_parameters.onvalidation)
                        {
                            let t_cleanObject = ToolBox.RemoveNULLs(t_object);
                            _parameters.onvalidation(t_cleanObject);
                        }
                    });
                    // t_json.classList.remove("shrink");
                }
                else if(_mode === "disable")
                {
                    t_button.SetImage("/web/images/edit_icon.png");
                    t_button.SetClickFunction(function(ev) {
                        t_json.EnableEdit();
                        SetButtonMode("enable");
                    });
                    t_button.style.display = "flex";
                }
            }
            SetButtonMode("disable");
        }

        let t_enableFunction = t_json.EnableEdit;
        let t_disableFunction = t_json.DisableEdit;
        t_json.EnableEdit = function() {
            t_enableFunction();
            if(SetButtonMode) SetButtonMode("enable");
        }

        t_json.DisableEdit = function() {
            t_disableFunction();
            if(SetButtonMode) SetButtonMode("disable");
        }

        t_json.GetValue = function(cleanup = true) {
            if(cleanup == true) return ToolBox.RemoveNULLs(t_object);
            else return t_object;
        }

        if(_parameters.ondrag || ('allow_drag' in _parameters && _parameters.allow_drag == true))
        {
            t_json.draggable = true;
            t_json.ondragstart = function(ev) {
                let t_data;
                if(_parameters.ondrag) t_data = _parameters.ondrag(t_object);
                else t_data = t_object;
                ev.dataTransfer.setData("text/plain", JSON.stringify(t_data));
            }
        }

        return t_json;
    }

    static CreateNodeInterface(_parameters)
    {
        let t_interface = document.createElement('div');
        t_interface.className = 'nodeInterface';
        t_interface.innerHTML = `
            <div class='zoom'>
                <img src='/web/images/plus_icon.png'>
                <img src='/web/images/minus_icon.png'>
            </div>
            <div class='tools'>
                <img src='/web/images/edit_icon.png'>
                <img src='/web/images/help_icon.png'>
                <img src='/web/images/extend_icon.png'>
            </div>
            <canvas class='nodeCanvas' width="1024" height="1024" tabindex=0></canvas>
        `;

        let t_tools = t_interface.children[1];
        let t_edit = t_tools.children[0];
        let t_help = t_tools.children[1];
        let t_enlarge = t_tools.children[2];
        let t_canvas = t_interface.children[2];

        let t_nodeInterface = null;
        let t_allowEdit = ("allow_edit" in _parameters) ? _parameters.allow_edit : false;
        let t_lock = true;

        if(_parameters.width) t_interface.style.width = _parameters.width;
        if(_parameters.height) t_interface.style.height = _parameters.height;
        if(t_allowEdit == false)
        {
            t_edit.remove();
            t_edit = null;
        }
        if(_parameters.no_expand)
        {
            t_enlarge.remove();
            t_enlarge = null;
        }
        
        function UpdateObjectJSON(obj)
        {
            if(obj.meshObject)
            {
                if(obj.meshObject.parts)
                {
                    obj.meshObject.materials = obj.meshObject.parts;
                    obj.meshObject.parts = null;
                    // delete obj.meshObject.parts;
                }
            }
        
            if(obj.childs) for(var i = 0; i < obj.childs.length; i++) UpdateObjectJSON(obj.childs[i]);
        }

        t_help.onclick = function() {
            let t_box = Builder.CreateFloatingBox({ scrollbar: false, allow_drag: true, style: "frost_glass shadow" });
            t_box.AppendElement(Builder.CreateTextBox({ text: `Node Interface: How to`, size: "1.2em", align: "left", margins: {top: "3em", bottom: "0.5em", left: "0.5em", right: "0.5em"}, weight: 500 }));
            t_box.AppendElement(Builder.CreateTextBox({
                margins: "0.5em",
                text:
                `With the mouse:
                - Drag nodes with the left button
                - Drag the screen with the right button
                - Select node with the left click
                - Show menu with the right click
                - Left click on node connectors to link them`,
            }));
        }

        if(t_edit) t_edit.onclick = function() {
            t_interface.Unlock();
        }

        if(t_enlarge) t_enlarge.onclick = function() {
            t_nodeInterface.CreateLargeWindow();
        }

        t_interface.SetInterface = function(node_interface) {
            t_nodeInterface = node_interface;
        }

        t_interface.Ready = function() {
            let objectList = _parameters.part_list || [];
            t_nodeInterface = new NodeInterface(t_canvas, _parameters.cursor_menu, true, objectList,
                {
                    title: _parameters.title,
                    allow_edit: t_allowEdit,
                    lock: t_lock,
                    onnodeselect: _parameters.onnodeselect,
                    onvalidate: _parameters.onvalidate,
                    onsave: _parameters.onsave,
                    path: _parameters.path
                }
            );

            // console.log(_parameters.data);

            if(_parameters.type === "object")
            {
                UpdateObjectJSON(_parameters.data);
                t_nodeInterface.LoadObject(_parameters.data);    
            }
            else if(_parameters.type === "process")
            {
                t_nodeInterface.LoadProcess(_parameters.data);
                t_interface.classList.add("process");
            }

            t_interface.node_interface = t_nodeInterface;
        }

        t_interface.Lock = function() {
            if(t_nodeInterface) t_nodeInterface.DisableEdit();

            if(t_edit)
            {
                t_edit.src = "/web/images/edit_icon.png";
                t_edit.onclick = function() {
                    t_interface.Unlock();
                }    
            }
        }

        t_interface.Unlock = function() {
            if(t_nodeInterface) t_nodeInterface.Unlock();

            if(_parameters.onvalidate)
            {
                t_edit.src = "/web/images/check_icon.png";
                t_edit.onclick = function() {
                    let t_json = t_interface.Compile();
                    _parameters.onvalidate(t_json);
                    t_interface.Lock();
                }
            }
            else if(t_edit)
            {
                t_edit.remove();
                t_edit = null;
            }

            t_lock = false;
        }

        t_interface.EnableEdit = function() {
            if(t_nodeInterface) t_nodeInterface.EnableEdit();
            t_lock = false;
        }

        t_interface.DisableEdit = function() {
            if(t_nodeInterface) t_nodeInterface.DisableEdit();
            t_lock = true;
        }

        t_interface.Compile = function() {
            let t_res = t_nodeInterface.Save();
            return t_res;
        }

        return t_interface;
    }

    static async CreateConfirmationBox(_parameters)
    {
        return new Promise(function(resolve, reject) {

            let t_menu = Builder.CreateFloatingBox({
                    style: "white_board shadow", width: _parameters.width || "25em",
                    onclose: function() {
                        resolve(false);
                        t_menu.remove();
                    }
                },
                []
            );

            if(_parameters.text)
            {
                t_menu.AppendElement(Builder.CreateTextBox({
                    text: _parameters.text,
                    size: "1.2em",
                    weight: "600",
                    max_width: "calc(100% - 4em)",
                    margins: {top: "2em", left: "2em", right: "2em", bottom: "0.5em"}
                }))    
            }

            let t_list = t_menu.AppendElement(Builder.CreateHorizontalList({
                    align: "center"
                },
                [
                    Builder.CreatePressButton({
                        text: "OK",
                        size: "1.2em",
                        margin: "0.5em",
                        style: "green",
                        onclick: function() {
                            t_menu.remove();
                            resolve(true);
                        }
                    }),
                    Builder.CreatePressButton({
                        text: "Cancel",
                        size: "1.2em",
                        margin: "0.5em",
                        style: "red",
                        onclick: function() {
                            t_menu.remove();
                            resolve(false);
                        }
                    })
                ]
            ));


            /// hidden button to allow the use of the keyboard enter and escape as an answer
            let t_input = t_menu.AppendElement(document.createElement('button'));
            t_input.onkeydown = function(event) {
                if(event.key === "Enter")
                {
                    t_menu.remove();
                    resolve(true);
                }
                else if(event.key === "Escape")
                {
                    t_menu.remove();
                    resolve(false);
                }
            }
            t_input.style.position = "absolute";
            t_input.style.opacity = 0;
            t_input.focus();
        });        
    }

    static async CreateQuickSelector(_parameters)
    {
        if(!_parameters.options)
        {
            console.log("WARNING: no options, so default to null");
            return null;
        }

        return new Promise(function(resolve, reject) {

            let t_menu = Builder.CreateFloatingBox({
                    style: "dark white_border", min_width: _parameters.min_width || "15em",
                    padding: "1em",
                    onclose: function() {
                        resolve(null);
                        t_menu.remove();
                    }
                },
                []
            );

            if(_parameters.title)
            {
                t_menu.AppendElement(Builder.CreateTextBox({
                    text: _parameters.title,
                    size: "1.3em",
                    weight: "600",
                    margins: "0.5em",
                    text_color: "white",
                }))    
            }

            for(let i = 0; i < _parameters.options.length; i++)
            {
                t_menu.AppendElement(Builder.CreatePressButton({
                    text: _parameters.options[i].text,
                    before_image: _parameters.options[i].image || "",
                    size: "1.3em",
                    margins: '0.5em',
                    align: 'center',
                    text_color: "white",
                    style: "white_border",
                    onclick: function() {
                        resolve(_parameters.options[i].value || _parameters.options[i].text);
                        t_menu.remove();
                    }
                }))
            }

        });
    }

    static CreateAnimatedText(_parameters)
    {
        let t_animation = document.createElement('div');
        t_animation.className = 'animated_text';
        t_animation.innerHTML = `
            <p></p>
        `;

        let t_text = t_animation.children[0];
        let t_textIndex = 0;
        let t_charCount = 0;
        let t_writeDelay = _parameters.write_interval || 500;
        let t_eraseDelay = _parameters.erase_interval || 500;
        let t_waitDelay = _parameters.wait_interval || 5000;

        function AddCharacter(_char)
        {
            t_text.textContent += _char;
        }

        function RemoveLastCharacter()
        {
            t_text.textContent = t_text.textContent.slice(0, t_text.textContent.length - 1);
        }

        function LoadText(_text)
        {
            AddCharacter(_text.charAt(t_charCount));
            t_charCount++;
    
            if(t_charCount < _text.length)
            {
                setTimeout(function() {
                    LoadText(_text);
                }, t_writeDelay);
            }
            else
            {
                setTimeout(function() {
                    RemoveText(_text)
                }, t_waitDelay);
            }
        }

        function RemoveText()
        {
            RemoveLastCharacter();
            t_charCount--;

            if(t_charCount > 0)
            {
                setTimeout(function() {
                    RemoveText();
                }, t_eraseDelay);
            }
            else
            {
                t_textIndex++;
                if(t_textIndex == _parameters.text_list.length) t_textIndex = 0;
                LoadText(_parameters.text_list[t_textIndex]);
            }
        }

        if(_parameters.text_list && _parameters.text_list.length > 0) LoadText(_parameters.text_list[0]);
        if(_parameters.size) t_text.style.fontSize = _parameters.size;
        if(_parameters.weight) t_text.style.fontWeight = _parameters.weight;

        Builder.SetMargins(t_animation, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        return t_animation;
    }

    static CreateFooter(_parameters)
    {
        let t_footer = document.createElement('div');
        t_footer.className = 'footer';
        t_footer.innerHTML = `
        `;

        if(_parameters.width) t_footer.style.width = _parameters.width;
        if(_parameters.style) Builder.ApplyStyles(t_footer, _parameters.style);
        
        return t_footer;        
    }

    static CreateMessageBubble(_parameters)
    {
        let t_bubble = document.createElement('div');
        t_bubble.className = "message_bubble";
        t_bubble.innerHTML = `
            <div class='user'>
                <p></p>
                <div class='wrapper'>
                    <img>
                    <p></p>
                </div>
            </div>
            <p class='date'></p>
            <p></p>
        `;

        let t_user = t_bubble.children[0];
        let t_date = t_bubble.children[1];
        let t_message = t_bubble.children[2];

        if(_parameters.text) t_message.textContent = _parameters.text;
        if(_parameters.date) t_date.textContent = _parameters.date;
        if(_parameters.user_name)
        {
            t_user.children[0].textContent = _parameters.user_name;
            t_user.children[1].children[1].textContent = _parameters.user_name;
        }
        else
        {
            t_user.children[0].remove();
            t_user.children[1].children[1].remove();
        }

        if(_parameters.width) t_bubble.style.width = _parameters.width;

        t_bubble.SetUserImage = function(img_src) {
            t_user.children[1].children[0].src = img_src;
        }
        if(_parameters.user_image) t_bubble.SetUserImage(_parameters.user_image);

        Builder.SetMargins(t_bubble, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        if(_parameters.onuserclick)
        {
            t_user.onclick = function() {
                _parameters.onuserclick();
            }
            t_user.style.cursor = "pointer";
        }

        if(_parameters.onrightclick)
        {
            t_bubble.oncontextmenu = function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                _parameters.onrightclick({x: ev.pageX, y: ev.pageY});
            }
        }

        return t_bubble;
    }

    static CreateLoadingBar(_parameters = {})
    {
        let t_bar = document.createElement("div");
        t_bar.className = "loading_bar";
        t_bar.innerHTML = `
            <div class='fill'>
                <p></p>
            </div>
            <p></p>
        `;
    
        t_bar.SetText = function(_text) {
            t_bar.children[1].textContent = _text;
            t_bar.children[0].children[0].textContent = _text;    
        }

        t_bar.SetValue = function(_val) {
            t_bar.children[0].style.width = "calc(" + (100.0 * _val) + "% - 0.3em)";
        }

        t_bar.Hide = function() {
            t_bar.classList.add("hide");
        }

        t_bar.Display = function() {
            t_bar.classList.remove("hide");
        }

        if(_parameters.text) t_bar.SetText(_parameters.text);
        if(_parameters.value) t_bar.SetValue(_parameters.value);
        if(_parameters.width) t_bar.style.width = _parameters.width;

        Builder.SetMargins(t_bar, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        setTimeout(function() {
            t_bar.children[0].children[0].style.width = t_bar.children[1].clientWidth + "px";
        }, 10);

        return t_bar;
    }

    // static Test()
    // {
    //     var json = {
    //         abc: [12, "asdkjhsdf dfsdf",  3245],
    //         position: {x: 123.2, y: -23.1, z: 12},
    //         text_this: "ewsrwer",
    //         asgh: {
    //             jnkjn: 12315,
    //             ksjhn: 4324,
    //             opiuj: "drfshjdfs"
    //         },
    //         check: true,
    //         color: {r: 1.0, g: 0.5, b: 0.2, a: 1.0}
    //     };

    //     let t_box = Builder.CreateFloatingBox({ scrollbar: true, allow_drag: true, style: "frost_glass shadow" });

    //     let t_ele = t_box.AppendElement(Builder.CreateJSONEditor({json: json, special_types: true, style: "frost_glass", allow_edit: true, validate_func: function(_json) {console.log(_json)}}));
    //     t_ele.children[0].classList.remove('shrink');
    //     t_ele.style.marginTop = "3em";

    //     t_box.AppendElement(Builder.CreateRangeInput({value: 0.7, min: 0.05, max: 1.05, step: 0.1, hide_digits: true, onchange_func: function(_val, _range) {
    //         console.log(_val);
    //         _range.SetTrailColor({r: 1.0, g: 1.0, b: 1.0, a: ToolBox.Clamp(_val, 0.0, 1.0)})
    //     }}));

    //     return t_ele;
    // }

    static CreateParametricCurve(_parameters)
    {
        let t_curve = document.createElement('div');
        t_curve.className = "parametric_curve";
        t_curve.innerHTML = `
            <canvas tabindex=0></canvas>
            <div class='parameters'></div>
        `;


        let t_canvas = t_curve.children[0];
        let t_parameters = t_curve.children[1];
        let t_context = null;
        let t_width = 128;
        let t_height = 32;
        let t_disabled = false;

        if("width" in _parameters) t_curve.style.width = _parameters.width;
        if("height" in _parameters) t_canvas.style.height = _parameters.height;
        Builder.SetMargins(t_curve, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        let t_positions = [0.0, 1.0];
        let t_values = [0.0, 1.0];
        let t_viewportPositions = [];
        let t_min = 0.0;
        let t_max = 1.0;
        let t_selected = -1;

        if("value" in _parameters)
        {
            let t_count = _parameters.value.length / 2;
            for(let i = 0; i < t_count; i++)
            {
                t_positions[i] = _parameters.value[2 * i];
                t_values[i] = _parameters.value[2 * i + 1];
            }
        }

        t_curve.GetValue = function() {
            let t_arr = [];
            for(let i = 0; i < t_positions.length; i++)
            {
                t_arr[2 * i] = t_positions[i];
                t_arr[2 * i + 1] = t_values[i];
            }
            return t_arr;
        }

        let ComputePoints = function() 
        {
            t_min = 100000.0;
            t_max = -100000.0;

            let t_points = [];
            if(t_positions.length == 2)
            {
                for(let i = 0; i < 2; i++)
                {
                    t_points[i] = {x: t_positions[i], y: t_values[i]};
                    t_min = Math.min(t_min, t_values[i]);
                    t_max = Math.max(t_max, t_values[i]);
                }
                if(t_max == t_min) t_max += 0.01;
                return t_points;
            }

            let t_count = 40;
            for(let i = 0; i < t_count; i++)
            {
                let t_x = i / (t_count - 1);
                let t_y = ToolBox.ComputeHermiteValue(t_x, t_positions, t_values);
                t_points[i] = {x: t_x, y: t_y};

                t_min = Math.min(t_min, t_y);
                t_max = Math.max(t_max, t_y);
            }

            if(t_max <= 0) t_max = 0.1;
            return t_points;
        }

        let margins = 8;
        let ViewportPosition = function(_pos) {
            return {
                x: (t_width - 2 * margins) * _pos.x + margins,
                y: (t_height - 2 * margins) * (1.0 - _pos.y / t_max) + margins
            }
        }

        let GraphPosition = function(_pos) {
            return {
                x: (_pos.x - margins) / (t_width - 2 * margins),
                y: t_max * (1.0 - (_pos.y - margins) / (t_height - 2 * margins))
            };
        }

        let EventPosition = function(ev) {
            let rect = t_canvas.getBoundingClientRect();
            return {
                x: ToolBox.Clamp(ev.clientX - rect.left, margins, rect.width - margins),
                y: ToolBox.Clamp(ev.clientY - rect.top, margins, rect.height - margins)
            };
        }

        t_curve.DrawAll = function() {
            if(!t_context)
            {
                t_context = t_canvas.getContext("2d");

                t_width = t_canvas.clientWidth;
                t_height = t_canvas.clientHeight;
                t_canvas.width = t_width;
                t_canvas.height = t_height;
                // console.log(t_width + " " + t_height);

                t_curve.canvasContext = t_context;
            }
          
            t_context.fillStyle = _parameters.color || "000000";
            // t_context.clearRect(0, 0, t_width, t_height);
            t_context.fillRect(0, 0, t_width, t_height);

            t_context.lineCap = "round";
            t_context.lineWidth = 3.0;
            t_context.strokeStyle = "#FFFFFF";
            t_context.beginPath();

            /// compute the list of positions
            let t_points = ComputePoints();

            let t_pos = ViewportPosition(t_points[0]);
            t_context.moveTo(t_pos.x, t_pos.y);
            for(let i = 0; i < t_points.length - 1; i++)
            {
                t_pos = ViewportPosition(t_points[i + 1]);
                t_context.lineTo(t_pos.x, t_pos.y);
            }
            t_context.stroke();

            let t_radius = 6;
            for(let i = 0; i < t_positions.length; i++)
            {
                t_viewportPositions[i] = ViewportPosition({x: t_positions[i], y: t_values[i]});
                t_context.beginPath();
                t_context.arc(t_viewportPositions[i].x, t_viewportPositions[i].y, 0.5 * t_radius, 0, 2 * Math.PI);
                if(t_selected == i) t_context.strokeStyle = "#ffcd30";
                else t_context.strokeStyle = "#FFFFFF";
                t_context.lineWidth = t_radius;
                t_context.stroke();
            }
        }

        let FindPosition = function(_pos) {

            for(let i = 0; i < t_positions.length; i++)
            {
                let t_distance = ToolBox.Distance(_pos, t_viewportPositions[i]);
                if(t_distance < 10) return i;
            }

            return -1;
        }

        t_canvas.onclick = function(ev) {
            if(t_disabled == true) return;

            let t_pos = EventPosition(ev);
            let t_index = FindPosition(t_pos);

            if(t_index >= 0) ShowPointParameters(t_index);
            else
            {
                t_index = AddPoint(GraphPosition(t_pos))
                ShowPointParameters(t_index);

                if(_parameters.onchange) _parameters.onchange(t_curve.GetValue());
            };

            t_curve.DrawAll();
        }

        let RemovePoint = function(_index) {

            ToolBox.RemoveFromArray(t_positions, _index);
            ToolBox.RemoveFromArray(t_values, _index);
        }

        let AddPoint = function(_pos) {

            /// first check if close to any position
            for(let i = 0; i < t_positions.length; i++)
            {
                if(Math.abs(_pos.x - t_positions[i]) < 0.02)
                {
                    t_values[i] = _pos.y;
                    return i;
                }
            }

            let t_newPositions = [];
            let t_newValues = [];

            let i = 0;
            for(i = 0; i < t_positions.length; i++)
            {
                if(t_positions[i] > _pos.x) break;
                t_newPositions.push(t_positions[i]);
                t_newValues.push(t_values[i]);
            }

            /// fuse if the two points' positions are close
            let t_index = i;
            if(Math.abs(_pos.x - t_positions[i]) < 0.02)
            {
                t_values[i] = _pos.y;
            }
            else
            {
                t_newPositions.push(_pos.x);
                t_newValues.push(_pos.y);
            }

            for(i = i; i < t_positions.length; i++)
            {
                t_newPositions.push(t_positions[i]);
                t_newValues.push(t_values[i]);
            }
            
            t_positions = t_newPositions;
            t_values = t_newValues;

            return t_index;
        }

        let ShowPointParameters = function(_index)
        {
            t_parameters.innerHTML = "";
            t_selected = _index;
            t_curve.DrawAll();

            if(_index == 0 || _index == t_positions.length - 1)
            {
                t_parameters.appendChild(Builder.CreateHorizontalList({
                        width: "100%",
                        margin: {left: "0.25em", right: "0.25em", bottom: "0.25em"}
                    },[
                        Builder.CreateTextBox({ text: "Point " + _index, margins: "0.25em", weight: 500 }),
                        Builder.CreateTextInput({
                            value: t_values[_index], type: "number", width: "100%", margin: "0.25em", text_align: "center", no_button: true,
                            wheel_input: 0.01,
                            drag_input: 0.01,
                            onchange: function(_val, _element) {
                                if(_val < 0.0)
                                {
                                    _val = 0.0;
                                    _element.SetValue(_val);
                                }

                                t_values[_index] = parseFloat(_val);    /// that's weird, not sure why it insists on it being set as a string
                                t_curve.DrawAll();

                                if(_parameters.onchange) _parameters.onchange(t_curve.GetValue());
                            }
                        })
                    ]
                ));
            }
            else
            {
                t_parameters.appendChild(Builder.CreateHorizontalList({
                        width: "100%",
                        margin: {left: "0.25em", right: "0.25em", bottom: "0.25em"}
                    },[
                        Builder.CreateVec2Input({
                            value: [t_positions[_index], t_values[_index]], width: "100%", margin: "0.25em",
                            wheel_input: 0.01,
                            drag_input: 0.01,
                            onchange: function(_val, _element) {

                                if(_val.x <= 0.0) _val.x = 0.0;
                                else if(_val.x >= 1.0) _val.x = 1.0;
                                if(_val.y < 0.0) _val.y = 0.0;
                                _element.SetValue(_val);

                                RemovePoint(_index);
                                let t_newIndex = AddPoint(_val);
                                t_curve.DrawAll();

                                if(_parameters.onchange) _parameters.onchange(t_curve.GetValue());

                                if(t_newIndex != _index || t_newIndex == t_positions.length - 1)
                                {
                                    /// need to do an emergency drag stop as the element is going to be deleted
                                    _element.StopDrag();
                                    ShowPointParameters(t_newIndex);
                                }
                            }
                        }),
                        Builder.CreatePressButton({
                            pressed: false,
                            image: "/web/images/delete_icon.png",
                            size: "1.1em",
                            tip: "delete point",
                            onclick: function(_pressed) {
                                RemovePoint(_index);
                                t_curve.DrawAll();
                                t_parameters.innerHTML = "";
                                t_selected = -1;

                                if(_parameters.onchange) _parameters.onchange(t_curve.GetValue());
                            }
                        })
                    ]
                ));
            }
        }

        setTimeout(function() {
            t_curve.DrawAll();
        }, 100);

        t_curve.EnableEdit = function() {
            t_disabled = false;
        }

        t_curve.DisableEdit = function() {
            t_disabled = true;
        }


        return t_curve;
    }


    static CreateColorRamp(_parameters)
    {
        let t_curve = document.createElement('div');
        t_curve.className = "color_ramp";
        t_curve.innerHTML = `
            <canvas tabindex=0></canvas>
            <div class='parameters'></div>
        `;


        let t_canvas = t_curve.children[0];
        let t_parameters = t_curve.children[1];
        let t_context = null;
        let t_width = 128;
        let t_height = 32;
        let t_disabled = false;

        if("width" in _parameters) t_curve.style.width = _parameters.width;
        if("height" in _parameters) t_canvas.style.height = _parameters.height;
        Builder.SetMargins(t_curve, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        let t_positions = [0.0, 1.0];
        let t_colors = [{r: 1.0, g: 0.0, b: 1.0}, {r: 0.0, g: 1.0, b: 0.5}];
        let t_viewportPositions = [];
        let t_selected = -1;

        if("value" in _parameters)
        {
            let t_count = _parameters.value.length / 4;
            for(let i = 0; i < t_count; i++)
            {
                t_positions[i] = _parameters.value[4 * i];
                t_colors[i] = {r: _parameters.value[4 * i + 1], g: _parameters.value[4 * i + 2], b: _parameters.value[4 * i + 3]};
            }
        }

        t_curve.GetPositions = function() {
            return t_positions;
        }

        t_curve.UpdatePositions = function(new_positions) {
            /// compute the color values for the positions
            let t_newColors = [];
            for(let i = 0; i < new_positions.length; i++) t_newColors[i] = ToolBox.ComputeHermiteColor(new_positions[i], t_positions, t_colors);

            t_positions = new_positions;
            t_colors = t_newColors;

            t_parameters.innerHTML = "";
            t_selected = -1;
            t_curve.DrawAll();
        }

        t_curve.GetValue = function() {
            let t_arr = [];
            for(let i = 0; i < t_positions.length; i++)
            {
                t_arr[4 * i] = t_positions[i];
                t_arr[4 * i + 1] = t_colors[i].r;
                t_arr[4 * i + 2] = t_colors[i].g;
                t_arr[4 * i + 3] = t_colors[i].b;
            }
            return t_arr;
        }

        let ComputePoints = function() 
        {
            let t_points = [];
            if(t_positions.length == 2)
            {
                for(let i = 0; i < 2; i++) t_points[i] = {x: t_positions[i], c: t_colors[i]};
                return t_points;
            }

            let t_count = 40;
            for(let i = 0; i < t_count; i++)
            {
                let t_x = i / (t_count - 1);
                let t_c = ToolBox.ComputeHermiteColor(t_x, t_positions, t_colors);
                t_points[i] = {x: t_x, c: t_c};
            }

            return t_points;
        }

        let margins = 8;
        let ViewportPosition = function(pos_x) {
            return (t_width - 2 * margins) * pos_x + margins;
        }

        let GraphPosition = function(pos_x) {
            return (pos_x - margins) / (t_width - 2 * margins);
        }

        let EventPosition = function(ev) {
            let rect = t_canvas.getBoundingClientRect();
            return {
                x: ToolBox.Clamp(ev.clientX - rect.left, margins, rect.width - margins),
                y: ToolBox.Clamp(ev.clientY - rect.top, margins, rect.height - margins)
            };
        }

        t_curve.DrawAll = function() {
            if(!t_context)
            {
                t_context = t_canvas.getContext("2d");

                t_width = t_canvas.clientWidth;
                t_height = t_canvas.clientHeight;
                t_canvas.width = t_width;
                t_canvas.height = t_height;
                t_curve.canvasContext = t_context;
            }
          
            t_context.fillStyle = "000000";
            t_context.fillRect(0, 0, t_width, t_height);

            let t_gradient = t_context.createLinearGradient(0, 0, t_width, 0);

            /// compute the list of positions
            let t_points = ComputePoints();

            let t_posX = ViewportPosition(t_points[0].x);
            t_gradient.addColorStop(t_posX / t_width, ToolBox.RGBToHex(t_points[0].c));
            for(let i = 0; i < t_points.length - 1; i++)
            {
                t_posX = ViewportPosition(t_points[i + 1].x);
                t_gradient.addColorStop(t_posX / t_width, ToolBox.RGBToHex(t_points[i + 1].c));
            }
            t_context.fillStyle = t_gradient;
            t_context.fillRect(0, 0, t_width, t_height);

            let t_radius = 6;
            t_context.lineCap = "round";
            t_context.lineWidth = 3.0;
            for(let i = 0; i < t_positions.length; i++)
            {
                t_viewportPositions[i] = {x: ViewportPosition(t_positions[i]), y: 0.5 * t_height};

                /// shadows
                t_context.beginPath();
                t_context.arc(t_viewportPositions[i].x, t_viewportPositions[i].y + 1, t_radius - 1, 0, 2 * Math.PI);
                t_context.strokeStyle = "#00000055";
                t_context.lineWidth = 2;
                t_context.stroke();

                /// knobs
                t_context.beginPath();
                t_context.arc(t_viewportPositions[i].x, t_viewportPositions[i].y, 0.5 * t_radius, 0, 2 * Math.PI);
                if(t_selected == i) t_context.strokeStyle = "#ffcd30";
                else t_context.strokeStyle = "#FFFFFF";
                t_context.lineWidth = t_radius;
                t_context.stroke();
            }
        }

        let FindPosition = function(_pos) {

            for(let i = 0; i < t_positions.length; i++)
            {
                let t_distance = Math.abs(_pos.x - t_viewportPositions[i].x);
                if(t_distance < 10) return i;
            }

            return -1;
        }

        t_canvas.onclick = function(ev) {
            if(t_disabled == true) return;

            let t_pos = EventPosition(ev);
            let t_index = FindPosition(t_pos);

            if(t_index >= 0) ShowPointParameters(t_index);
            else
            {
                let t_posX = GraphPosition(t_pos.x);
                t_index = AddPoint({x: t_posX, c: ToolBox.ComputeHermiteColor(t_posX, t_positions, t_colors)});    //{r: 1.0, g: 1.0, b: 1.0}});
                ShowPointParameters(t_index);

                if(_parameters.onchange) _parameters.onchange(t_curve.GetValue());
            };

            t_curve.DrawAll();
        }

        let RemovePoint = function(_index) {

            ToolBox.RemoveFromArray(t_positions, _index);
            ToolBox.RemoveFromArray(t_colors, _index);
        }

        let AddPoint = function(_pos) {

            /// first check if close to any position
            for(let i = 0; i < t_positions.length; i++)
            {
                if(Math.abs(_pos.x - t_positions[i]) < 0.02)
                {
                    t_colors[i] = _pos.c;
                    return i;
                }
            }

            let t_newPositions = [];
            let t_newColors = [];

            let i = 0;
            for(i = 0; i < t_positions.length; i++)
            {
                if(t_positions[i] > _pos.x) break;
                t_newPositions.push(t_positions[i]);
                t_newColors.push(t_colors[i]);
            }

            /// fuse if the two points' positions are close
            let t_index = i;
            if(Math.abs(_pos.x - t_positions[i]) < 0.02)
            {
                t_colors[i] = _pos.c;
            }
            else
            {
                t_newPositions.push(_pos.x);
                t_newColors.push(_pos.c);
            }

            for(i = i; i < t_positions.length; i++)
            {
                t_newPositions.push(t_positions[i]);
                t_newColors.push(t_colors[i]);
            }
            
            t_positions = t_newPositions;
            t_colors = t_newColors;

            return t_index;
        }

        let ShowPointParameters = function(_index)
        {
            t_parameters.innerHTML = "";
            t_selected = _index;
            t_curve.DrawAll();

            if(_index == 0 || _index == t_positions.length - 1)
            {
                t_parameters.appendChild(Builder.CreateHorizontalList({
                        width: "100%",
                        margin: {left: "0.25em", right: "0.25em", bottom: "0.25em"}
                    },[
                        Builder.CreateRGBInput({
                            value: t_colors[_index],
                            label_weight: 500, width: "100%", disable: false,
                            margin: {top: "0.25em", bottom: "0.25em"},
                            onchange: function(_rgb) {

                                t_colors[_index] = {r: _rgb[0], g: _rgb[1], b: _rgb[2]};    /// that's weird, not sure why it insists on it being set as a string
                                t_curve.DrawAll();

                                if(_parameters.onchange) _parameters.onchange(t_curve.GetValue());
                            }
                        })
                    ]
                ));
            }
            else
            {
                let t_color = t_colors[_index];
                t_parameters.appendChild(Builder.CreateHorizontalList({
                        width: "100%",
                        margin: {left: "0.25em", right: "0.25em", bottom: "0.25em"}
                    },[
                        Builder.CreateTextInput({
                            value: t_positions[_index], type: "number", width: "100%", text_align: "center", no_button: true,
                            wheel_input: 0.01,
                            drag_input: 0.01,
                            onchange: function(_val, _element) {
                                _val = parseFloat(_val);

                                if(_val <= 0.0) _val = 0.0;
                                else if(_val >= 1.0) _val = 1.0;
                                // _val = +_val.toFixed(6);    /// needs the '+' so it stays a number
                                _element.SetValue(_val);

                                RemovePoint(_index);
                                let t_newIndex = AddPoint({x: _val, c: {r: t_color.r, g: t_color.g, b: t_color.b}});
                                t_curve.DrawAll();

                                if(_parameters.onchange) _parameters.onchange(t_curve.GetValue());

                                if(t_newIndex != _index || t_newIndex == t_positions.length - 1)
                                {
                                    /// need to do an emergency drag stop as the element is going to be deleted
                                    _element.StopDrag();
                                    ShowPointParameters(t_newIndex);
                                }
                            }
                        }),
                        Builder.CreateRGBInput({
                            value: t_color,
                            label_weight: 500, width: "100%", height: "2.2em", disable: false,
                            margin: "0.25em",
                            onchange: function(_rgb) {

                                t_color = {r: _rgb[0], g: _rgb[1], b: _rgb[2]};
                                t_colors[_index] = {r: _rgb[0], g: _rgb[1], b: _rgb[2]};
                                t_curve.DrawAll();

                                if(_parameters.onchange) _parameters.onchange(t_curve.GetValue());
                            }
                        }),
                        Builder.CreatePressButton({
                            pressed: false,
                            image: "/web/images/delete_icon.png",
                            size: "1.1em",
                            tip: "delete point",
                            onclick: function(_pressed) {
                                RemovePoint(_index);
                                t_curve.DrawAll();
                                t_parameters.innerHTML = "";
                                t_selected = -1;

                                if(_parameters.onchange) _parameters.onchange(t_curve.GetValue());
                            }
                        })
                    ]
                ));
            }
        }

        setTimeout(function() {
            t_curve.DrawAll();
        }, 100);

        t_curve.EnableEdit = function() {
            t_disabled = false;
        }

        t_curve.DisableEdit = function() {
            t_disabled = true;
        }


        return t_curve;
    }


    static CreateTimeline(_parameters)
    {
        let t_curve = document.createElement('div');
        t_curve.className = "timeline";
        t_curve.innerHTML = `
            <canvas tabindex=0></canvas>
            <div class='parameters'></div>
        `;


        let t_canvas = t_curve.children[0];
        let t_parameters = t_curve.children[1];
        let t_context = null;
        let t_width = 128;
        let t_height = 32;
        let t_disabled = false;

        if("width" in _parameters) t_curve.style.width = _parameters.width;
        if("height" in _parameters) t_canvas.style.height = _parameters.height;
        Builder.SetMargins(t_curve, _parameters.margins || _parameters.margin, _parameters.padding, _parameters.align);

        let t_positions = [0.0, 1.0];
        let t_viewportPositions = [];
        let t_selected = -1;

        if("value" in _parameters)
        {
            let t_count = _parameters.value.length;
            for(let i = 0; i < t_count; i++)
            {
                t_positions[i] = _parameters.value[i];
            }
        }

        t_curve.GetValue = function() {
            let t_arr = [];
            for(let i = 0; i < t_positions.length; i++)
            {
                t_arr[i] = t_positions[i];
            }
            return t_arr;
        }

        let margins = 8;
        let ViewportPosition = function(_pos) {
            return {
                x: (t_width - 2 * margins) * _pos + margins,
                y: (t_height - 2 * margins) * 0.5 + margins
            }
        }

        let GraphPosition = function(_pos) {
            return {
                x: (_pos.x - margins) / (t_width - 2 * margins),
                y: (1.0 - (_pos.y - margins) / (t_height - 2 * margins))
            };
        }

        let EventPosition = function(ev) {
            let rect = t_canvas.getBoundingClientRect();
            return {
                x: ToolBox.Clamp(ev.clientX - rect.left, margins, rect.width - margins),
                y: ToolBox.Clamp(ev.clientY - rect.top, margins, rect.height - margins)
            };
        }

        t_curve.DrawAll = function() {
            if(!t_context)
            {
                t_context = t_canvas.getContext("2d");

                t_width = t_canvas.clientWidth;
                t_height = t_canvas.clientHeight;
                t_canvas.width = t_width;
                t_canvas.height = t_height;
                // console.log(t_width + " " + t_height);

                t_curve.canvasContext = t_context;
            }
          
            t_context.fillStyle = _parameters.color || "000000";
            // t_context.clearRect(0, 0, t_width, t_height);
            t_context.fillRect(0, 0, t_width, t_height);

            t_context.lineCap = "round";
            t_context.lineWidth = 3.0;
            t_context.strokeStyle = "#FFFFFF";
            t_context.beginPath();

            /// compute the list of positions
            let t_pos = ViewportPosition(t_positions[0]);
            t_context.moveTo(t_pos.x, t_pos.y);
            for(let i = 0; i < t_positions.length - 1; i++)
            {
                t_pos = ViewportPosition(t_positions[i + 1]);
                t_context.lineTo(t_pos.x, t_pos.y);
            }
            t_context.stroke();

            let t_radius = 6;
            for(let i = 0; i < t_positions.length; i++)
            {
                t_viewportPositions[i] = ViewportPosition(t_positions[i]);
                t_context.beginPath();
                t_context.arc(t_viewportPositions[i].x, t_viewportPositions[i].y, 0.5 * t_radius, 0, 2 * Math.PI);
                if(t_selected == i) t_context.strokeStyle = "#ffcd30";
                else t_context.strokeStyle = "#FFFFFF";
                t_context.lineWidth = t_radius;
                t_context.stroke();
            }
        }

        let FindPosition = function(_pos) {

            for(let i = 0; i < t_positions.length; i++)
            {
                let t_distance = Math.abs(_pos.x - t_viewportPositions[i].x);
                if(t_distance < 5) return i;
            }

            return -1;
        }

        t_canvas.onclick = function(ev) {
            if(t_disabled == true) return;

            let t_pos = EventPosition(ev);
            let t_index = FindPosition(t_pos);

            if(t_index >= 0) ShowPointParameters(t_index);
            else
            {
                t_index = AddPoint(GraphPosition(t_pos).x);
                if(_parameters.onadd) _parameters.onadd(t_index, t_positions[t_index]);
                ShowPointParameters(t_index);
            };

            t_curve.DrawAll();
        }

        let RemovePoint = function(_index) {

            ToolBox.RemoveFromArray(t_positions, _index);
        }

        let AddPoint = function(_pos) {

            let t_newPositions = [];

            let i = 0;
            for(i = 0; i < t_positions.length; i++)
            {
                if(t_positions[i] > _pos) break;
                t_newPositions.push(t_positions[i]);
            }

            /// fuse if the two points' positions are close
            let t_index = i;
            t_newPositions.push(_pos);

            for(i = i; i < t_positions.length; i++)
            {
                t_newPositions.push(t_positions[i]);
            }
            
            t_positions = t_newPositions;

            return t_index;
        }

        let ShowPointParameters = function(_index)
        {
            t_parameters.innerHTML = "";
            t_selected = _index;
            t_curve.DrawAll();

            if(_parameters.onselect) _parameters.onselect(_index);

            if(_index == 0 || _index == t_positions.length - 1)
            {
                t_parameters.appendChild(Builder.CreateHorizontalList({
                        width: "100%",
                        margin: {left: "0.25em", right: "0.25em", bottom: "0.25em"}
                    },[
                        Builder.CreateTextBox({ text: "Point " + _index, margins: "0.25em", weight: 500 }),
                    ]
                ));
            }
            else
            {
                let t_min = t_positions[_index - 1] + 0.02;
                let t_max = t_positions[_index + 1] - 0.02;

                t_parameters.appendChild(Builder.CreateHorizontalList({
                        width: "100%",
                        margin: {left: "0.25em", right: "0.25em", bottom: "0.25em"}
                    },[
                        Builder.CreateTextBox({ text: "Point " + _index, margins: "0.25em", weight: 500 }),
                        Builder.CreateTextInput({
                            value: t_positions[_index], type: "number", width: "100%", margin: "0.25em", text_align: "center", no_button: true,
                            wheel_input: 0.01,
                            drag_input: 0.01,
                            onchange: function(_val, _element) {
                                _val = parseFloat(_val);
                                if(_val < t_min)
                                {
                                    _val = t_min;
                                    _element.SetValue(_val);
                                }
                                else if(_val > t_max)
                                {
                                    _val = t_max;
                                    _element.SetValue(_val);
                                }

                                t_positions[_index] = _val;
                                t_curve.DrawAll();

                                if(_parameters.onmove) _parameters.onmove(_index, _val);
                            }
                        }),
                        Builder.CreatePressButton({
                            pressed: false,
                            image: "/web/images/delete_icon.png",
                            size: "1.1em",
                            tip: "delete point",
                            onclick: function(_pressed) {
                                RemovePoint(_index);
                                if(_parameters.onremove) _parameters.onremove(_index);

                                t_parameters.innerHTML = "";
                                t_selected = -1;
                                t_curve.DrawAll();
                            }
                        })
                    ]
                ));
            }
        }

        setTimeout(function() {
            t_curve.DrawAll();
        }, 100);

        t_curve.EnableEdit = function() {
            t_disabled = false;
        }

        t_curve.DisableEdit = function() {
            t_disabled = true;
        }


        return t_curve;
    }
}



function Test()
{
    let t_box = Builder.CreateFloatingBox({ scrollbar: false, allow_drag: true, style: "white_board shadow" });
    // let rampA = t_box.AppendElement(Builder.CreateColorRamp({
    //     // value: [0.0, 0.0, 0.75, 1.0, 1.0, 0.7],
    //     width: "20em",
    //     height: "5em",
    //     margins: "3em",
    //     onchange: function(_values)
    //     {
    //         let t_positions = rampA.GetPositions();
    //         rampB.UpdatePositions([...t_positions]);
    //     }
    // }));

    // let rampB = t_box.AppendElement(Builder.CreateColorRamp({
    //     // value: [0.0, 0.0, 0.75, 1.0, 1.0, 0.7],
    //     width: "20em",
    //     height: "5em",
    //     margins: "3em",
    //     onchange: function(_values)
    //     {
    //         let t_positions = rampB.GetPositions();
    //         rampA.UpdatePositions([...t_positions]);
    //     }
    // }));

    // t_box.AppendElement(Builder.CreateDoubleRangeInput({
    //     width: "100%", value: [0.5, 0.5], min: 0.1, max: 10.0, step: 0.1, exponent: 3.0, margins: "2em",
    //     wheel_input: 0.1,
    //     drag_input: 0.1,
    //     hide_digits: false, digit_width: "2.5em", trail_color: "#ffed7f",
    //     onchange_func: function(_val, _range) {
    //         console.log(_val)
    //     }
    // }));

    let timeline = t_box.AppendElement(Builder.CreateTimeline({
        value: [0.0, 0.5, 0.75, 1.0],
        width: "20em",
        height: "5em",
        margins: "3em",
        onchange: function(_values) {
            console.log(_values)
        },
        onselect: function(_index) {
            console.log(_index);
        }
    }));

}