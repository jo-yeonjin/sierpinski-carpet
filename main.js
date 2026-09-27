const canvas = document.getElementById("glCanvas");

const gl = canvas.getContext("webgl");

if (gl === null){
    console.log("WebGL을 사용할 수 없습니다.");
}
else{
    console.log("WebGL 준비 완료!");

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

const vertexShaderSource = `
    attribute vec2 aPosition;
    
    void main(){
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`;

const fragmentShaderSource=`
    precision mediump float;
    
    uniform vec4 uColor;

    void main(){
        gl_FragColor = uColor;
    }
`;



const vertexShader = gl. createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
    console.log(gl.getShaderInfoLog(vertexShader));
}

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

if(!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)){
    console.log(gl.getShaderInfoLog(fragmentShader));
}

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program)

if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.log(gl.getProgramInfoLog(program));
}

gl.useProgram(program);

const colorLocation = gl.getUniformLocation(program,"uColor");

const colorInput = document.getElementById("color");

function hexToRgb(hex){
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);

    return [r, g, b];
}

function createSquare(x, y, size){
   const half = size/2;

    const vertices = [
        x - half, y + half,
        x + half, y + half,
        x - half, y - half,

        x - half, y - half,
        x + half, y + half,
        x + half, y - half
    ];
    
    return vertices;
}

const Vertices = [];

function generateCarpet(x, y, size, depth){

    if(depth === 0){
        const square = createSquare(x, y, size);
        Vertices.push(...square);
        return;
    }

    const newSize = size / 3;

    generateCarpet(x - newSize, y + newSize, newSize, depth - 1);
    generateCarpet(x , y + newSize, newSize, depth - 1);
    generateCarpet(x + newSize, y + newSize, newSize, depth - 1);

    generateCarpet(x - newSize, y , newSize, depth - 1);
    generateCarpet(x + newSize, y , newSize, depth - 1);

    generateCarpet(x - newSize, y - newSize, newSize, depth - 1);
    generateCarpet(x , y - newSize, newSize, depth - 1);
    generateCarpet(x + newSize, y - newSize, newSize, depth - 1);

}


const depthInput = document.getElementById('depth');

depthInput.addEventListener("input", function(){
    const depth = Number(depthInput.value);

    Vertices.length = 0;

    generateCarpet(0, 0, 1, depth);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Vertices), gl.STATIC_DRAW);

    render();
});

colorInput.addEventListener("input", function(){
    const rgb = hexToRgb(colorInput.value);

    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;

    gl.uniform4f(colorLocation, r, g, b, 1.0);

    render();
});

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, Vertices.length/2);
}

generateCarpet(0, 0, 1, 1);

const buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Vertices), gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "aPosition");

gl.vertexAttribPointer(
    positionLocation,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

gl.enableVertexAttribArray(positionLocation);

render();