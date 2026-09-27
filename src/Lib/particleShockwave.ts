import * as ex from "excalibur";

export function spawnShockwave(scene: ex.Scene, pos: ex.Vector, color: ex.Color): void {
  console.log("particle color: ", color);

  const emitter = new ex.ParticleEmitter({
    pos: pos,
    emitterType: ex.EmitterType.Circle,
    radius: 4,
    isEmitting: false,
    emitRate: 0,
    particle: {
      minAngle: 0,
      maxAngle: Math.PI * 2,
      minSpeed: 180,
      maxSpeed: 320,
      life: 250, // total life in ms
      opacity: 1,
      fade: true,
      startSize: 10,
      endSize: 1,
      beginColor: color,
      endColor: ex.Color.Transparent,
      acc: ex.Vector.Zero,
    },
  });

  scene.add(emitter);

  // Burst 35 particles outward
  emitter.emitParticles(35);

  // Clean up emitter actor after particles expire
  scene.engine.clock.schedule(() => {
    emitter.kill();
  }, 350);
}
