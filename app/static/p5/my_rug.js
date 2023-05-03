var main_width;
var main_height;
var width_offset;
var height_offset;
var my_tiles;
var my_bg;
var my_colors;
var is_mobile;

function setup() {
    // window.onload 
    // define width, height
    $("#my_canvas").css("width", ($(window).width()).toString() + "px");
    $("#my_canvas").css("height", ($(window).height()).toString() + "px");
    let my_canvas = createCanvas($("#my_canvas").width(), $("#my_canvas").height(), P2D);
    my_canvas.parent("my_canvas");
    my_bg = color(255, 255, 255, 60);
    my_colors = [color(61, 137, 186, 160), color(247, 232, 3, 160)];
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
    is_mobile = /Mobi/.test(navigator.userAgent);
    if ($("#my_canvas").width() > $("#my_canvas").height()) {
        $("#placeholder").css("height", (0.1 * $("#my_canvas").height()).toString() + "px");
        main_width = $("#content_box").offset().left;
        main_height = $("#my_canvas").height();
        width_offset = 0.05 * main_width;
        height_offset = 0.15 * main_width;
    } 
    else {
        $("#placeholder").css("height", (0.3 * $("#my_canvas").height()).toString() + "px");
        main_width = $("#my_canvas").width();
        main_height = 0.3 * $("#my_canvas").height();
        width_offset = 0.15 * main_height;
        height_offset = 0.05 * main_height;
    }
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
    my_tiles.shaking = true;
}
  
function mouseReleased() {
    my_tiles.shaking = false;
}

function touchStarted() {
    my_tiles.shaking = true;
}

function touchEnded() {
    my_tiles.shaking = false;
}

function MyTiles(the_width, the_height) {
    this.width = min(the_width, the_height);
    this.height = min(the_width, the_height);
    this.golden_ratio = (1 + Math.sqrt(5)) / 2;
    this.g_lock = false;
    this.tiles = [];
    this.hexes = [];
    this.shaking = false;
    this.color_key = random(10);
    this.min_x = Infinity;
    this.max_x = -Infinity;
    this.min_y = Infinity;
    this.max_y = -Infinity;
    this.i = 2; //depth
    this.i_rate = 2; //drop rate
    this.j = 2; //subdivision
    this.r = 0;
    this.r_temp = 0;
    this.r_unit = 12;
    this.speed_unit = 6;

    this.generate_hex = function(x, y, depth) {
        let s = 0.5 * this.height / 1.75;
        if (depth < this.i) {
            y--;
            x++;
            this.hexes.push([createVector(x * s, y * s), random(0.7, 0.99)]);
            this.generate_hex(x, y, depth + 1);

            y++;
            this.hexes.push([createVector(x * s, y * s), random(0.7, 0.99)]);
            this.generate_hex(x, y, depth + 1);

            x--;
            y++;
            this.hexes.push([createVector(x * s, y * s), random(0.7, 0.99)]);
            this.generate_hex(x, y, depth + 1);

            x--;
            this.hexes.push([createVector(x * s, y * s), random(0.7, 0.99)]);
            this.generate_hex(x, y, depth + 1);

            y--;
            this.hexes.push([createVector(x * s, y * s), random(0.7, 0.99)]);
            this.generate_hex(x, y, depth + 1);

            x++;
            y--;
            this.hexes.push([createVector(x * s, y * s), random(0.7, 0.99)]);
            this.generate_hex(x, y, depth + 1);

            for (let r = 0; r < this.i_rate; r++) {
                this.hexes.splice(floor(random(this.hexes.length)), 1);
            }
        }
    }

    this.generate_one_hex_tiles = function() {
        let h = this.hexes.shift();
        var temp_x = h[0].x + 0.5 * h[0].y;
        var temp_y = sqrt(3) / 2 * h[0].y;
        let s = 0.5 * this.height / 1.75 / 1.75 * h[1];
        let temp_tiles = [];

        for (let i = 0; i < 3; i++) {
            let d = TWO_PI / 12 + i * TWO_PI / 3;
            let c = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            d += TWO_PI / 6;
            let a = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            d += TWO_PI / 6;
            let b = createVector(temp_x + s * cos(d), temp_y + s * sin(d));
            temp_tiles.push([1, a, b, c]);
            temp_tiles.push([1, createVector(temp_x, temp_y), b, c]);

            if (a.x < this.min_x) {
                this.min_x = a.x;
            }
            if (a.x > this.max_x) {
                this.max_x = a.x;
            }
            if (a.y < this.min_y) {
                this.min_y = a.y;
            }
            if (a.y > this.max_y) {
                this.max_y = a.y;
            }
        }

        for (var jj = 1; jj < this.j; jj++) {
            temp_tiles = this.subdivide_tiles(temp_tiles);
        }

        this.tiles.push(...temp_tiles);
    }

    this.subdivide_tiles = function(tiles) {
        var temp_tiles = [];
        for (var t = 0; t < tiles.length; t++) {
            if (tiles[t][0] == 0) {
                var p = tiles[t][1].copy().add(tiles[t][2].copy().sub(tiles[t][1].copy()).mult(1.0 / this.golden_ratio));
                temp_tiles.push([0, tiles[t][3], p, tiles[t][2]]);
                temp_tiles.push([1, p, tiles[t][3], tiles[t][1]]);
            }
            else {
                var q = tiles[t][2].copy().add(tiles[t][1].copy().sub(tiles[t][2].copy()).mult(1.0 / this.golden_ratio));
                var r = tiles[t][2].copy().add(tiles[t][3].copy().sub(tiles[t][2].copy()).mult(1.0 / this.golden_ratio));
                temp_tiles.push([1, r, tiles[t][3], tiles[t][1]]);
                temp_tiles.push([1, q, r, tiles[t][2]]);
                temp_tiles.push([0, r, q, tiles[t][1]]);
            }
        }
        return temp_tiles;
    }
    
    this.init = function() {
        this.hexes = [];
        this.tiles = [];
        this.min_x = Infinity;
        this.max_x = -Infinity;
        this.min_y = Infinity;
        this.max_y = -Infinity;
        
        this.hexes.push([createVector(0, 0), random(0.7, 0.99)]);
        this.generate_hex(0, 0, 1);
    }

    this.breath = function() {
        this.i_rate = 2;
        this.r_temp = (sin(map(frameCount % (240 * this.speed_unit), 0, 240 * this.speed_unit, 0, TWO_PI)) * 2 * this.r_unit);
        if (this.r_temp >= 2 * this.r_unit) {
            this.r += 2 * this.r_unit;
        }
        if (this.r_temp <= -2 * this.r_unit) {
            this.r -= 2 * this.r_unit;
        }

        let temp_i = round(sin(map(frameCount % (60 * this.speed_unit), 0, 60 * this.speed_unit, 0, TWO_PI)) * 1 + 3);
        if ((temp_i != this.i) || (this.j != 1)) {
            this.i = temp_i;
            this.j = 1;

            this.init();
        }

        if ((frameCount % (2 * this.speed_unit) == 0) && (this.hexes.length > 0)) {
            this.generate_one_hex_tiles();
        }
    }

    this.inputing = function() {
        if ((this.i != 2) || (this.j != 2)) {
            this.i = 2;
            this.i_rate = 2;
            this.j = 2;

            this.init();
        }
        while (this.hexes.length > 0) {
            this.generate_one_hex_tiles();
        }
        let temp_speed = map(this.max_x - this.min_x, 0, this.width, 0, 20 * this.speed_unit);
        this.color_key = map(frameCount % temp_speed, 0, temp_speed, 0.0, 1.0);
    }

    this.loading = function() {
        this.i = 2;
        this.i_rate = 2;
        this.r_temp += this.r_unit * 0.3 / this.speed_unit;

        let temp_j = round(sin(map(frameCount % (10 * this.speed_unit), 0, 10 * this.speed_unit, 0, TWO_PI)) * 1 + 3);
        if (temp_j != this.j) {
            this.j = temp_j;

            this.init();
        }
        while (this.hexes.length > 0) {
            this.generate_one_hex_tiles();
        }
    }

    this.ending = function() {
        this.r = -this.r_unit;
        this.r_temp = 2 * this.r_unit;

        if ((this.i != 3) || (this.j != 1) || (this.i_rate != 4)) {
            this.i = 3;
            this.i_rate = 4;
            this.j = 1;
            this.init();
        }

        if ((frameCount % (this.speed_unit) == 0) && (this.hexes.length > 0)) {
            this.generate_one_hex_tiles();
        }
    }

    this.generate = function() {
        if (!this.g_lock) {
            this.g_lock = true;

            if (this.shaking) {
            }
            else if ($("#current_state").val() == "I"){
                this.inputing();
            }
            else if ($("#current_state").val() == "L") {
                this.loading();
            }
            else if ($("#current_state").val() == "E") {
                this.ending();
            }
            else {
                this.breath();
            }
            
            this.g_lock = false;
        }
    }
    
    this.init();

    this.draw = function() {
        if (frameCount % 60 >= 0) {
            this.generate();
        }
        var max_r_temp;
        if (!is_mobile) {    
            // $("#temp_text").html(mouseX - pmouseX);
            // $("#temp_text").append("<br/>");
            // $("#temp_text").append(mouseY - pmouseY);
            if (abs(mouseX - pmouseX) > abs(mouseY - pmouseY)) {
                max_r_temp = map(constrain(mouseX - pmouseX, -100, 100), -100, 100, 10 * this.r_unit, -10 * this.r_unit);
            }
            else {
                max_r_temp = map(constrain(mouseY - pmouseY, -100, 100), -100, 100, 10 * this.r_unit, -10 * this.r_unit);
            }
        } 
        else {
            // $("#temp_text").html(rotationX);
            // $("#temp_text").append("<br/>");
            // $("#temp_text").append(rotationY);
            if (abs(rotationX - pRotationX) > abs(rotationY - pRotationY)) {
                max_r_temp = map(constrain(rotationX - pRotationX, -PI / 4, PI / 4), -PI / 4, PI / 4, 10 * this.r_unit, -10 * this.r_unit);
            }
            else {
                max_r_temp = map(constrain(rotationY - pRotationY, -PI / 4, PI / 4), -PI / 4, PI / 4, 10 * this.r_unit, -10 * this.r_unit);
            }
        }
        
        translate(0.5 * this.width, 0.5 * this.height);

        for (let t = 0; t < this.tiles.length; t++) {
            if ($("#current_state").val() == "I") {
                let temp_offset = map(this.tiles[t][1].y, 1.2 * this.min_y, 1.2 * this.max_y, -0.3, 0.3);
                let the_color_key = map(this.tiles[t][1].x, (1.2 - temp_offset) * this.min_x, (1.2 + temp_offset) * this.max_x, 0.0, 1.0);
                if (abs(the_color_key - this.color_key) < 0.07) {
                    fill(my_colors[0]);
                } 
                else {
                    fill(my_colors[1]);
                }
            }
            else if ($("#current_state").val() == "L") {
                fill(my_colors[this.tiles[t][0]]);
            }
            else {
                if (t % 5 == 0) {
                    fill(my_colors[0]);
                }
                else {
                    fill(my_colors[1]);
                }
            }

            noStroke();
            push();
            rotate(radians(this.r));
            let the_temp_r = map(this.tiles[t][2].y, this.min_y, 1.2 * this.max_y, 0.0, max_r_temp + this.r_temp);
            rotate(radians(the_temp_r));

            if (this.shaking) {
                scale(1.0 + (sin(map(frameCount % (0.6 * this.speed_unit), 0, 0.6 * this.speed_unit, 0, TWO_PI)) * 0.02));
            } 
            else {
                scale(0.98 + (sin(map(frameCount % (60 * this.speed_unit), 0, 60 * this.speed_unit, 0, TWO_PI)) * 0.02));
            }
            
            beginShape();
            for (var v = 1; v < 4; v++) {
                vertex(this.tiles[t][v].x, this.tiles[t][v].y);
            }
            endShape(CLOSE);
            pop();
        }        
    }
}