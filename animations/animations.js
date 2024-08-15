
class Vector {
    constructor(x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static Add(a, b, c)
    {
        if(c)
        {
            return {
                x: a.x + b.x + c.x,
                y: a.y + b.y + c.y,
                z: a.z + b.z + c.z
            }
        }
        else
        {
            return {
                x: a.x + b.x,
                y: a.y + b.y,
                z: a.z + b.z
            }
        }
    }

    static Sub(a, b)
    {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
            z: a.z - b.z
        }
    }

    static Dot(a, b)
    {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    static Mult(a, b)
    {
        if(a instanceof Vector)
        {
            return {
                x: a.x * b.x,
                y: a.y * b.y,
                z: a.z * b.z
            }
        }
        else
        {
            return {
                x: a * b.x,
                y: a * b.y,
                z: a * b.z
            }
        }
    }

    static Cross(a, b)
    {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        }
    }

    static Len(a)
    {
        return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    }

    static Norm(a)
    {
        let lenInv = 1.0 / Vector.Len(a);
        return Vector.Mult(lenInv, a);
    }

    static Mix(a, b, t)
    {
        return Vector.Add(Vector.Mult(1.0 - t, a), Vector.Mult(t, b));
    }

    Rotate(center, axis, angle)
    {
        let dz = Vector.Dot(Vector.Sub(this, center), axis);
        let newCenter = Vector.Add(center, Vector.Mult(dz, axis))
        let dx = Vector.Sub(this, newCenter);
        let dy = Vector.Cross(axis, dx);
        let newPos = Vector.Add(Vector.Mult(Math.cos(angle), dx), Vector.Mult(Math.sin(angle), dy));
        newPos = Vector.Add(newCenter, newPos);
        this.x = newPos.x;
        this.y = newPos.y;
        this.z = newPos.z;
    }

    Translate(dp)
    {
        this.x += dp.x;
        this.y += dp.y;
        this.z += dp.z;
    }
}

class WaitAnimation {
    constructor(_canvas, _text)
    {
        this.canvas = _canvas;
        this.ctx = _canvas.getContext("2d");
        this.width = _canvas.clientWidth;
        this.height = _canvas.clientHeight;
        _canvas.width = this.width;
        _canvas.height = this.height;

        this.backgroundColor = "#191e23";   // 13, 16, 45
        this.backgroundColorVec = new Vector(25.0, 30.0, 35.0);

        this.text = _text;

        let position = new Vector(-4, 4, 0);
        let lookat = new Vector(0, 0, 0);
        let dir = Vector.Norm(Vector.Sub(lookat, position));
        let right = Vector.Norm(Vector.Cross(dir, new Vector(0, 1, 0)));
        let up = Vector.Norm(Vector.Cross(right, dir));
        this.camera = {
            position: position,
            direction: dir,
            up: up,
            right: right,
            angle: 0.25 * Math.PI,
            ratio: this.width / this.height
        };

        this.pause = false;
        this.time = 0.0;
        this.dt = 0.02;
        this.thunder = 0.0;
        this.wind = new Vector(0.1, 0, 0);
        this.nextWind = new Vector(0.1, 0.0, 0.0);

        this.lines = [];
        this.circles = [];
        this.reflections = [];
    }


    Project(point)
    {
        let dp = Vector.Sub(point, this.camera.position);
        let dist = Vector.Dot(dp, this.camera.direction);
        let dy = Vector.Dot(dp, this.camera.up) / (dist * Math.tan(0.5 * this.camera.angle));
        let dx = Vector.Dot(dp, this.camera.right) / (dist * Math.tan(0.5 * this.camera.angle) * this.camera.ratio);
        return {x: 0.5 * this.width * (1.0 + dx), y: 0.5 * this.height * (1.0 - dy), z: dist};                    
    }


    DrawPoint(point)
    {
        let proj = this.Project(point);
        if(proj.z < 0.0) return;

        var ctx = this.ctx;
        var radius = 2;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgb(255,255,255)";
        ctx.lineWidth = radius;
        ctx.stroke();
    }

    DrawLine(line)
    {
        let pA = this.Project(line.A);
        let pB = this.Project(line.B);

        var ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.closePath();
        ctx.strokeStyle = "rgba(" + 255 * line.color[0] + "," + 255 * line.color[1] + "," + 255 * line.color[2] + "," + line.color[3] + ")";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    DrawCircle(circle)
    {
        let center = circle.center;
        let axis = circle.axis;
        let radius = circle.radius;

        let arr = [];
        let count = 50;
        var angle = 2.0 * Math.PI / count;
        var u, v;
        if(axis.x == 0.0 && axis.z == 0.0) u = new Vector(1.0, 0.0, 0.0);
        else u = Vector.Norm(Vector.Cross(axis, new Vector(0.0, 1.0, 0.0)));
        v = Vector.Norm(Vector.Cross(axis, u));
        u = Vector.Mult(radius, u);
        v = Vector.Mult(radius, v);
        for(var i = 0; i < count + 1; i++) arr[i] = Vector.Add(center, Vector.Mult(Math.cos(angle * i), u), Vector.Mult(Math.sin(angle * i), v));

        let proj = [];
        for(var i = 0; i < arr.length; i++) proj[i] = this.Project(arr[i]);

        var ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(proj[0].x, proj[0].y);
        for(var i = 0; i < count + 1; i++) ctx.lineTo(proj[i].x, proj[i].y);
        ctx.closePath();
        ctx.strokeStyle = "rgba(" + 255 * circle.color[0] + "," + 255 * circle.color[1] + "," + 255 * circle.color[2] + "," + circle.color[3] + ")";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    DrawAll()
    {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        if(this.thunder > 0.0)
        {
            this.thunder += this.dt;
            let x = 0.5 * 20.0 * this.thunder - 1.25;
            let y = 0.5 * 20.0 * this.thunder - 3.75;
            let val = 255.0 * 0.3 * (Math.pow(2.5, -x * x) + 2 * Math.pow(2.5, -y * y));

            let color = Vector.Mix(this.backgroundColorVec, new Vector(255.0, 255.0, 255.0), val / 255.0);


            let ctx = this.ctx;
            ctx.rotate(-Math.PI/40);
            ctx.fillStyle = "rgb(" + color.x + "," + color.y + "," + color.z + ")";
            ctx.fillRect(-0.5 * this.width, 0.5 * this.height, 1.5 * this.width, 1.5 * this.height);

            var fontSize = 0.1 * this.height;
            var text = this.text;
            ctx.fillStyle = this.backgroundColor;
            ctx.textBaseline = "bottom";
            ctx.font = fontSize + "px Verdana";
            var textSize = ctx.measureText(text);
            ctx.fillText(text, 0.5 * this.width - 0.5 * textSize.width, 0.8 * this.height - 0.5 * fontSize);
            ctx.rotate(Math.PI/40);

            if(val < 0.01) this.thunder = 0.0;
        }

        for(var i = 0; i < this.lines.length; i++) this.DrawLine(this.lines[i]);
        for(var i = 0; i < this.reflections.length; i++) this.DrawLine(this.reflections[i]);
        for(var i = 0; i < this.circles.length; i++) this.DrawCircle(this.circles[i]);
    }

    CreateDrop()
    {
        let pos = {
            x: 8.0 * (Math.random() - 0.5),
            y: 8.0 + 2.0 * (Math.random() - 0.5),
            z: 8.0 * (Math.random() - 0.5)
        }

        let line = {
            A: new Vector(pos.x, pos.y, pos.z),
            B: new Vector(pos.x, pos.y - 0.5, pos.z),
            color: [1.0, 1.0, 1.0, 1.0]
        }
        this.lines.push(line);

        let reflection = {
            A: new Vector(pos.x, -pos.y, pos.z),
            B: new Vector(pos.x, -pos.y + 0.5, pos.z),
            color: [1.0, 1.0, 1.0, 0.0]
        }
        this.reflections.push(reflection);
    }

    CreateWave(line)
    {
        var circle = {
            center: line.A,
            axis: new Vector(0, 1, 0),
            radius: 0.01,
            color: [1.0, 1.0, 1.0, 1.0]
        }
        this.circles.push(circle);
    }

    CheckThunder()
    {
        if(this.thunder == 0.0)
        {
            let r = Math.random();
            if(r < 0.96) return;
            else this.thunder = 0.0001;
        }
    }

    ChangeWind()
    {
        let r = Math.random();
        if(r < 0.96) return;

        this.nextWind.x = 0.2 * (Math.random() - 0.5);
        this.nextWind.z = 0.2 * (Math.random() - 0.5);
    }

    Animate()
    {
        if(this.pause) return;

        this.time += this.dt;
        if(this.time > 0.15)
        {
            this.time = 0.0;
            this.CreateDrop();
            this.CreateDrop();
            this.CheckThunder();
            this.ChangeWind();
        }

        this.wind = Vector.Mix(this.wind, this.nextWind, this.dt);

        let motion = Vector.Add(new Vector(0, -0.2, 0), this.wind);
        for(var i = 0; i < this.lines.length; i++)
        {
            this.lines[i].A.Translate(motion);
            this.lines[i].B = Vector.Add(this.lines[i].A, Vector.Mult(2.0, motion));
            if(this.lines[i].B.y < 0.0)
            {
                let alpha = -this.lines[i].A.y / motion.y;
                this.lines[i].B = Vector.Add(this.lines[i].A, Vector.Mult(alpha, motion));
            }
            if(this.lines[i].A.y < 0.0)
            {
                this.CreateWave(this.lines[i]);
                this.lines[i] = this.lines[this.lines.length - 1];
                this.lines.pop();
                i--;
            }
        }

        motion = Vector.Add(new Vector(0, 0.2, 0), this.wind);
        for(var i = 0; i < this.reflections.length; i++)
        {
            this.reflections[i].A.Translate(motion);
            this.reflections[i].B = Vector.Add(this.reflections[i].A, Vector.Mult(2.0, motion));
            this.reflections[i].color[3] += 0.005;
            if(this.reflections[i].B.y > 0.0)
            {
                let alpha = -this.reflections[i].A.y / motion.y;
                this.reflections[i].B = Vector.Add(this.reflections[i].A, Vector.Mult(alpha, motion));
            }
            if(this.reflections[i].A.y > 0.0)
            {
                this.reflections[i] = this.reflections[this.reflections.length - 1];
                this.reflections.pop();
                i--;
            }
        }

        for(var i = 0; i < this.circles.length; i++)
        {
            this.circles[i].radius += 0.01;
            this.circles[i].color[3] -= 0.01;
            if(this.circles[i].color[3] < 0.0)
            {
                this.circles[i] = this.circles[this.circles.length - 1];
                this.circles.pop();
                i--;
            }
        }

        this.DrawAll();

        let loading = this;
        setTimeout(function() {
            loading.Animate();
        }, this.dt * 1000);
    }

    UpdateText(_text)
    {
        this.text = _text;
    }

    Stop()
    {
        this.pause = true;
    }

    Play()
    {
        this.pause = false;
        this.Animate();
    }
}
