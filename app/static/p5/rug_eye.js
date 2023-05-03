var main_width;
var main_height;
var width_offset;
var height_offset;
var my_tiles;
var my_bg;
var my_colors;

function setup() {
    // window.onload 
    // define width, height
    $("#my_canvas").css("width", ($(window).width()).toString() + "px");
    $("#my_canvas").css("height", ($(window).height()).toString() + "px");
    let my_canvas = createCanvas($("#my_canvas").width(), $("#my_canvas").height(), P2D);
    my_canvas.parent("my_canvas");
    // console.log("create canvas", width, height);
    my_bg = color(255, 255, 255, 60);
    my_colors = [color(61, 137, 186, 140), color(247, 232, 3, 140)];
    frameRate(60);
    init();
}

function windowResized() {
    $("#my_canvas").css("width", ($(window).width()).toString() + "px");
    $("#my_canvas").css("height", ($(window).height()).toString() + "px");
    resizeCanvas($("#my_canvas").width(), $("#my_canvas").height());
    init();
}

function init() {
    if ($("#my_canvas").width() > $("#my_canvas").height()) {
        $("#placeholder").css("height", (0.1 * $("#my_canvas").height()).toString() + "px");
        main_width = $("#content_box").offset().left;
        main_height = $("#my_canvas").height();
        width_offset = 0.1 * main_width;
        height_offset = 0.1 * main_width;
    } 
    else {
        $("#placeholder").css("height", (0.3 * $("#my_canvas").height()).toString() + "px");
        main_width = $("#my_canvas").width();
        main_height = 0.3 * $("#my_canvas").height();
        width_offset = 0.1 * main_height;
        height_offset = 0.1 * main_height;
    }
    // console.log("init", $("#my_canvas").width(), $("#my_canvas").height(), main_width, main_height);
    my_tiles = new MyTiles(main_width, main_height);
}

function draw() {
    fill(my_bg);
    noStroke();
    rect(0, 0, width, height);

    push();
    translate(width_offset, height_offset);
    my_tiles.draw();
    pop();
}

function mousePressed() {
    my_tiles.shaking = 1;
}
  
function mouseReleased() {
    my_tiles.shaking = 0;
}

function touchStarted() {
    my_tiles.shaking = 1;
}

function touchEnded() {
    my_tiles.shaking = 0;
}

function MyTiles(the_width, the_height) {
    this.the_width = min(the_width, the_height);
    this.the_height = min(the_width, the_height);
    this.golden_ratio = (1 + Math.sqrt(5)) / 2;
    this.i = 10;
    this.j = 3;
    this.r = 0;
    this.lock = 0;
    this.tiles = [];
    this.hexes = [];
    this.mode_i = 0;
    this.mode_j = 0;
    this.mode_r = 0;
    this.shaking = 0;
    this.theta = 0.1 * PI;
    this.depth = 3;
    this.color_key = random(10);
    this.min_x;
    this.max_x;
    this.min_y;
    this.max_y;

    this.init = function() {
        this.hexes = [];
        this.tiles = [];
        // let a = createVector(0, 0);
        // let theta = PI / this.i;
        // this.grow_from_b_c(a, theta, 0, 0);
        this.hexes.push(createVector(0, 0));
        this.generate_hex(0, 0, 1);
        this.generate_tiles();
    }

    this.generate_hex = function(x, y, depth) {
        let s = 0.3 * this.the_height / 1.75;
        if (depth < this.depth) {
            y--;
            x++;
            this.hexes.push(createVector(x * s, y * s));
            this.generate_hex(x, y, depth + 1);

            y++;
            this.hexes.push(createVector(x * s, y * s));
            this.generate_hex(x, y, depth + 1);

            x--;
            y++;
            this.hexes.push(createVector(x * s, y * s));
            this.generate_hex(x, y, depth + 1);

            x--;
            this.hexes.push(createVector(x * s, y * s));
            this.generate_hex(x, y, depth + 1);

            y--;
            this.hexes.push(createVector(x * s, y * s));
            this.generate_hex(x, y, depth + 1);

            x++;
            y--;
            this.hexes.push(createVector(x * s, y * s));
            this.generate_hex(x, y, depth + 1);
        }
    }

    this.generate_tiles = function() {
        let s = 0.3 * this.the_height / 1.75 / 1.75;

        for (let h = 0; h < this.hexes.length; h++) {
            var temp_x = this.hexes[h].x + 0.5 * this.hexes[h].y;
            var temp_y = sqrt(3) / 2 * this.hexes[h].y;
            // var temp_x = this.hexes[h].x;
            // var temp_y = this.hexes[h].y;
            // console.log(temp_x, temp_y);

            // for (let i = 0; i < 6; i++) {
            //     let d = TAU / 12 + i * TAU / 6;
            //     let a = createVector(temp_x, temp_y);
            //     let b = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            //     d += TAU / 6;
            //     let c = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            //     this.tiles.push([0, a, b, c]);
            // }

            // hex style
            // for (let i = 0; i < 6; i++) {
            //     let d = TWO_PI / (2 * 6) + i * TWO_PI / 6;
            //     let a = createVector(temp_x, temp_y);
            //     let b = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            //     d += TWO_PI / 6;
            //     let c = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            //     if (i % 2 == 0) {
            //         temp_tiles.push([0, a, b, c]);
            //     }
            //     else {
            //         temp_tiles.push([0, a, c, b]);
            //     }

            //     if (b.x < this.min_x) {
            //         this.min_x = b.x;
            //     }
            //     if (b.x > this.max_x) {
            //         this.max_x = b.x;
            //     }
            //     if (b.y < this.min_y) {
            //         this.min_y = b.y;
            //     }
            //     if (b.y > this.max_y) {
            //         this.max_y = b.y;
            //     }

            // }

            
            // for (let i = 0; i < 2; i++) {
            //     let d = TWO_PI / 12 + TWO_PI / 4 + i * PI;
            //     let b = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            //     d += TWO_PI / 6;
            //     let a = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            //     d += TWO_PI / 6;
            //     let c = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            //     if (i % 2 == 0) {
            //         temp_tiles.push([1, a, b, c]);
            //     }
            //     else {
            //         temp_tiles.push([1, a, c, b]);
            //     }
            // }

            // for (let i = 0; i < 2; i++) {
            //     let d = i * PI;
            //     let b = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            //     d += TWO_PI / 6;
            //     let c = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            //     if (i % 2 == 0) {
            //         temp_tiles.push([0, createVector(temp_x, temp_y), b, c]);
            //     }
            //     else {
            //         temp_tiles.push([0, createVector(temp_x, temp_y), c, b]);
            //     }
            // }

            // // previous style
            // for (let i = 0; i < 6; i++) {
            //     let d = TWO_PI / 12 + i * TWO_PI / 6;
            //     let a = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            //     d += TWO_PI / 3;
            //     let b = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            //     let bFromA = p5.Vector.sub(b, a);
            //     bFromA.rotate(-PI / 10);
            //     let c = p5.Vector.add(a, bFromA);
            //     if (i % 2 ==  0) {
            //         // temp_tiles.push([0, a, b, c]);
            //         temp_tiles.push([1, createVector(temp_x, temp_y), a, b]);
            //     }
            //         temp_tiles.push([0, a, b, c]);
            // }
            for (let i = 0; i < 3; i++) {
                let d = TAU / 12 + i * TAU / 3;
                let b = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
                d += TAU / 6;
                let a = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
                d += TAU / 6;
                let c = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
                this.tiles.push([1, a, b, c]);
            }
        }
    }

    this.subdivide_tiles = function() {
        var temp_tiles = [];
        for (var t = 0; t < this.tiles.length; t++) {
            if (this.tiles[t][0] == 0) {
                var p = this.tiles[t][1].copy().add(this.tiles[t][2].copy().sub(this.tiles[t][1].copy()).mult(1.0 / this.golden_ratio));
                temp_tiles.push([0, this.tiles[t][3], p, this.tiles[t][2]]);
                temp_tiles.push([1, p, this.tiles[t][3], this.tiles[t][1]]);
            }
            else {
                var q = this.tiles[t][2].copy().add(this.tiles[t][1].copy().sub(this.tiles[t][2].copy()).mult(1.0 / this.golden_ratio));
                var r = this.tiles[t][2].copy().add(this.tiles[t][3].copy().sub(this.tiles[t][2].copy()).mult(1.0 / this.golden_ratio));
                temp_tiles.push([1, r, this.tiles[t][3], this.tiles[t][1]]);
                temp_tiles.push([1, q, r, this.tiles[t][2]]);
                temp_tiles.push([0, r, q, this.tiles[t][1]]);
            }
        }
        this.tiles = temp_tiles;
    }

    this.breath = function() {
        this.j = this.j;
        this.r = (sin(map(frameCount % 180, 0, 180, 0, TWO_PI)) * 5);
        let the_depth = int(round(map(abs(this.r + 0.5), 0, 5, 1.5, 4.4)));
        the_depth = this.depth;
        if (the_depth != this.depth) {
            this.color_key = random(10);
        }
        this.depth = the_depth;
    }

    this.inputing = function() {
        this.j = this.j;
        this.color_key = map(frameCount % 60, 0, 59, 0.0, 1.0);
    }

    this.loading = function() {
        // this.j = 3 + round(sin(map(frameCount % 60, 0, 60, 0, TWO_PI))) * 2;
        this.j = this.j;
    }

    this.generate = function() {
        if (this.lock == 0) {
            this.lock = 1;
            // this.move_i();
            // this.move_j();
            if (this.shaking == 1) {
            }
            else if ($("#current_state").val() == "I"){
                this.inputing();
            }
            else if ($("#current_state").val() == "L") {
                this.loading();
            }
            else {
                // if ($("#current_state").val().length == 0) {
                //     this.i = 10;
                //     this.j = 4;
                //     this.move_r();
                // }
                // else if ($("#current_state").val() == "I") {
                //     this.move_i();
                // } 
                // else if ($("#current_state").val() == "L") {
                //     console.log("L");
                //     this.move_j();
                // }
                this.breath();
            }
            
            this.init();
            // console.log(this.hexes.length, this.hexes);
            this.tiles = this.tiles.filter((arr, index, self) =>
                index === self.findIndex(otherArr =>
                    JSON.stringify(otherArr) === JSON.stringify(arr)
                )
            );
            // console.log(this.tiles.length);
            // }
            for (var jj = 1; jj < this.j; jj++) {
                this.subdivide_tiles();
            }

            let min_x = Infinity;
            let max_x = -Infinity;
            let min_y = Infinity;
            let max_y = -Infinity;
            for (var t = 0; t < this.tiles.length; t++) {
                for (var tt = 1; tt < 3; tt++) {
                    let x = this.tiles[t][tt].x;
                    if (x < min_x) {
                        min_x = x;
                    }
                    if (x > max_x) {
                        max_x = x;
                    }
                    let y = this.tiles[t][tt].y;
                    if (y < min_y) {
                        min_y = y;
                    }
                    if (y > max_y) {
                        max_y = y;
                    }
                }
            }
            this.min_x = min_x;
            this.max_x = max_x;
            this.min_y = min_y;
            this.max_y = max_y;
            this.lock = 0;
        }
    }
    
    this.draw = function() {
        // if (this.count == this.cycle) {
        //     this.count = 0;
        // }
        // this.count += 1;
        // //var progress = map(this.count * this.count, 1, this.cycle * this.cycle, 0.0, 1.0);
        // var progress = map(this.count, 1, this.cycle, 0.0, 1.0);
        if (frameCount % 60 == 0) {
            this.generate();
        }
        var max_temp_r;
        // console.log(deviceOrientation);
        if (deviceOrientation == 'undefined') {
            if (abs(mouseX - pmouseX) > abs(mouseY - pmouseY)) {
                max_temp_r = map(constrain(mouseX - pmouseX, -100, 100), -100, 100, -12.0, 12.0);
            }
            else {
                max_temp_r = map(constrain(mouseY - pmouseY, -100, 100), -100, 100, -12.0, 12.0);
            }
        } 
        else {
            if (abs(rotationX - pRotationX) > abs(rotationY - pRotationY)) {
                max_temp_r = map(constrain(rotationX - pRotationX, -60, 60), -60, 60, -12.0, 12.0);
            }
            else {
                max_temp_r = map(constrain(rotationY - pRotationY, -60, 60), -60, 60, -12.0, 12.0);
            }
        }
        
        
        translate(0.5 * this.the_width, 0.5 * this.the_height);
        stroke(255, 0, 0);
        noFill();
        rectMode(CENTER);
        rect(0, 0, this.the_width, this.the_height);

        // // debug
        

        for (let h = 0; h < this.hexes.length; h++) {
            fill(255, 0, 0);
            noStroke();
            circle(this.hexes[h].x, this.hexes[h].y, 10);
            // console.log(this.hexes[h].x, this.hexes[h].y);
        }

        fill(0);
        noStroke();
        circle(0, 0, 10);

        // for (let t = 0; t < this.tiles.length; t++) {
        //     fill(0, 0, 255);
        //     noStroke();
        //     circle(this.tiles[t][1].x, this.tiles[t][1].y, 10);
        // }

        for (let t = 0; t < this.tiles.length; t++) {
            if ($("#current_state").val() == "I") {
                // let the_color_key = constrain(map(this.tiles[t][1].x, -0.5 * this.the_width, 0.5 * this.the_width, 0.0, 1.0), 0.0, 1.0);
                let the_color_key = map(this.tiles[t][1].x, 1.2 * this.min_x, 1.2 * this.max_x, 0.0, 1.0);
                // console.log(the_color_key, this.color_key);
                if (abs(the_color_key - this.color_key) < 0.1) {
                    fill(my_colors[0]);
                    // stroke(my_colors[0]);
                } 
                else {
                    fill(my_colors[1]);
                    // stroke(my_colors[1]);
                }
            }
            else if ($("#current_state").val() == "L") {
                // scale(map(min(abs(mouseX - pmouseX), 100), 0, 100, 0.618, 0.5), map(min(abs(mouseY - pmouseY), 100), 0, 100, 0.618, 0.5));
                fill(my_colors[this.tiles[t][0]]);
                // stroke(my_colors[this.tiles[t][0]]);
            }
            else if (t % 2 == (int(round(this.color_key)) % 2)) {
                fill(my_colors[this.tiles[t][0]]);
                // stroke(my_colors[this.tiles[t][0]]);
            }
            else {
                let the_color_key = abs(int(round((this.tiles[t][1].y + this.color_key)))) % my_colors.length;
                fill(my_colors[the_color_key]);
                // stroke(my_colors[the_color_key]);
            }
            // noStroke();
            stroke(my_bg);
            strokeWeight(1);
            // noFill();
            push();
            
            // rotate(radians(this.r));
            // let the_temp_r = map(this.tiles[t][2].y, this.min_y, 1.2 * this.max_y, 0.0, max_temp_r);
            // rotate(radians(the_temp_r));

            // if (this.shaking == 1) {
            //     // rotate(radians(sin(map(frameCount % 3, 0, 3, 0, TWO_PI)) * 1));
            //     scale(1.0 + (sin(map(frameCount % 3, 0, 3, 0, TWO_PI)) * 0.01));
            // } 
            
            beginShape();
            // curveVertex(this.tiles[t][0].x, this.tiles[t][0].y);
            for (var v = 1; v < 4; v++) {
                vertex(this.tiles[t][v].x, this.tiles[t][v].y);
            }
            // curveVertex(this.tiles[t][3].x, this.tiles[t][3].y);
            endShape(CLOSE);
            pop();
        }        
    }
}



// function setup(){
//     w = min(windowWidth, windowHeight)
//     createCanvas(w, w)
  
//     gridWidth = w
//     gridHeight = w
//     hexagonSize = w/10
//   }
  
//   function drawHexagon(cX, cY, r){
//     hx = cX + cY/2
//     hy = sqrt(3)/2 * cY
  
//     beginShape()
//     for(let a = TAU/12; a < TAU + TAU/12; a+=TAU/6){
//       vertex(hx + r * cos(a), hy + r * sin(a))
//     }
//     endShape(CLOSE)
//   }
  
//   function makeSpiral(centerX, centerY, size, count){
//     var x = 0;
//     var y = 0;
  
//     s = size/1.75
  
//     push()
//     translate(centerX, centerY)
//     drawHexagon(centerX, centerY, size/1.75)
//     for(let n = 0; n<count; n++ ) {
//       for(let i=0; i<n; i++){x++;drawHexagon(x*s,y*s,s/1.75)}  // move right
//       for(let i=0; i<n-1; i++){y++;drawHexagon(x*s,y*s,s/1.75)} // move down right. Note N-1
//       for(let i=0; i<n; i++){x--;y++;drawHexagon(x*s,y*s,s/1.75)} // move down left
//       for(let i=0; i<n; i++){x--;drawHexagon(x*s,y*s,s/1.75)} // move left
//       for(let i=0; i<n; i++){y--;drawHexagon(x*s,y*s,s/1.75)} // move up left
//       for(let i=0; i<n; i++){x++;y--;drawHexagon(x*s,y*s,s/1.75)} // move up right
//     }
//     pop()
//   }
  
//   function draw(){
//     background(0);
  
//     makeSpiral(w/2,w/2,hexagonSize, 5);
  
//     noLoop();
//   }