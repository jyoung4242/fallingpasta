import * as ex from "excalibur";

export function createClearMaterial(engine: ex.Engine): ex.Material {
  const material = engine.graphicsContext.createMaterial({
    name: "level-clear-wave",
    fragmentSource: ex.glsl`in vec2 v_uv;
    out vec4 fragColor;

    //default excalibur uniforms
    uniform sampler2D u_graphic;
    uniform vec2 u_resolution; // Board resolution (width, height)

    //custom uniforms
    uniform float u_progress;  // 0.0 to 1.0 driving the level clear animation
    uniform vec2 u_center;     // Center of explosion (UV space, e.g. vec2(0.5, 0.5))

    void main() {
        vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
        vec2 uv = v_uv;
        vec2 pos = (uv - u_center) * aspect;
        float dist = length(pos);

        // Wave parameters
        float waveRadius = u_progress * 1.5; // Expands across screen
        float waveWidth = 0.15;
        
        // Calculate wave intensity ring
        float waveEdge = smoothstep(waveRadius - waveWidth, waveRadius, dist) - 
                        smoothstep(waveRadius, waveRadius + waveWidth, dist);

        // Distortion offset along wave
        vec2 distOffset = normalize(pos) * waveEdge * 0.03;
        
        // Sample texture with wave distortion
        vec4 texColor = texture(u_graphic, uv - distOffset);

        // Flash ring effect
        vec3 waveColor = vec3(1.0, 0.9, 0.6) * waveEdge * 2.5;

        // Fade out / dissolve area inside the ring
        if (dist < waveRadius - (waveWidth * 0.5)) {
            // Bright flash then dissolve out
            float innerFade = smoothstep(0.0, waveWidth, waveRadius - dist);
            texColor.rgb = mix(texColor.rgb, vec3(1.0), innerFade * 0.5);
        }

        fragColor = vec4(texColor.rgb + waveColor, texColor.a);
    }`,
    uniforms: {
      u_progress: 0.0,
      u_center: ex.vec(0.5, 0.5),
    },
  });

  return material;
}
