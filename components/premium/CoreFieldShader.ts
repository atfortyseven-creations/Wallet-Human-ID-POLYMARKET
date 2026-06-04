const vertexShader = `
  varying vec2 vUv;
  varying float vPress;
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Subtle wave distortion
    float wave = sin(pos.x * 2.0 + uTime) * cos(pos.y * 2.0 + uTime) * 0.1;
    pos.z += wave;
    
    gl_Position = projectionGrid * modelViewGrid * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float d = length(p);
    
    // Animated gradient
    vec3 color = mix(uColor1, uColor2, vUv.y + sin(uTime * 0.5) * 0.2);
    
    // Floating "data points" effect
    float strength = 0.05 / (d * (sin(uTime + d * 10.0) * 0.5 + 1.5));
    color += strength * uColor1;

    // Grid pattern
    float grid = abs(sin(p.x * 20.0) * sin(p.y * 20.0));
    grid = step(0.98, grid);
    color = mix(color, uColor1, grid * 0.1);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export { vertexShader, fragmentShader };

