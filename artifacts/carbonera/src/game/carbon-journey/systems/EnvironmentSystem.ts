import Phaser from "phaser";
import { clampHealth } from "@/lib/journey";

interface EnvironmentVisuals {
  sky: Phaser.GameObjects.Rectangle;
  smog: Phaser.GameObjects.Particles.ParticleEmitter;
  trees: Phaser.GameObjects.Container[];
  buildings: Phaser.GameObjects.Container[];
  birds: Phaser.GameObjects.Container[];
  trafficGroup: Phaser.GameObjects.Container;
}

function healthToSkyColor(health: number): number {
  if (health >= 75) return 0x7ec8e3;
  if (health >= 55) return 0x6ba3c7;
  if (health >= 35) return 0x8a9aab;
  if (health >= 15) return 0x6b7280;
  return 0x4b5563;
}

function healthToGroundTint(health: number): number {
  if (health >= 55) return 0x3d7a4a;
  if (health >= 35) return 0x4a6b3a;
  return 0x5a4a3a;
}

export class EnvironmentSystem {
  private health: number;
  private readonly scene: Phaser.Scene;
  private readonly visuals: EnvironmentVisuals;

  constructor(scene: Phaser.Scene, initialHealth: number, worldWidth: number) {
    this.scene = scene;
    this.health = clampHealth(initialHealth);

    const sky = scene.add
      .rectangle(worldWidth / 2, 140, worldWidth, 280, healthToSkyColor(this.health))
      .setDepth(-10);

    const ground = scene.add
      .rectangle(worldWidth / 2, 460, worldWidth, 120, healthToGroundTint(this.health))
      .setDepth(-9);

    const smog = scene.add.particles(0, 0, "smog-dot", {
      x: { min: 0, max: worldWidth },
      y: { min: 80, max: 220 },
      speed: { min: 8, max: 22 },
      scale: { start: 0.4, end: 1.2 },
      alpha: { start: 0.15, end: 0 },
      lifespan: 3500,
      frequency: 120,
      quantity: 1,
      blendMode: "ADD",
    });
    smog.setDepth(5);

    const trees: Phaser.GameObjects.Container[] = [];
    const buildings: Phaser.GameObjects.Container[] = [];
    const birds: Phaser.GameObjects.Container[] = [];

    for (let z = 0; z < 5; z++) {
      const baseX = z * 720 + 360;
      for (let t = 0; t < 4; t++) {
        trees.push(this.createTree(baseX - 220 + t * 130, 390));
      }
      buildings.push(this.createBuilding(baseX - 80, 310, 0x64748b));
      buildings.push(this.createBuilding(baseX + 120, 330, 0x475569));
    }

    for (let i = 0; i < 6; i++) {
      birds.push(this.createBird(120 + i * 520, 90 + (i % 3) * 30));
    }

    const trafficGroup = scene.add.container(0, 0);
    for (let z = 0; z < 5; z++) {
      const cx = z * 720 + 360;
      trafficGroup.add(this.createCar(cx - 40, 430, 0xef4444));
      trafficGroup.add(this.createCar(cx + 60, 438, 0xf97316));
    }

    scene.add.existing(ground);

    this.visuals = { sky, smog, trees, buildings, birds, trafficGroup };
    this.applyHealth(this.health, false);
  }

  getHealth(): number {
    return this.health;
  }

  adjustHealth(delta: number): number {
    this.health = clampHealth(this.health + delta);
    this.applyHealth(this.health, true);
    return this.health;
  }

  private applyHealth(health: number, animate: boolean): void {
    const targetSky = healthToSkyColor(health);
    const smogRate = health >= 70 ? 400 : health >= 45 ? 200 : health >= 25 ? 90 : 40;
    const treeAlpha = health >= 70 ? 1 : health >= 45 ? 0.75 : health >= 25 ? 0.45 : 0.2;
    const buildingTint =
      health >= 70 ? 0xffffff : health >= 45 ? 0xcccccc : health >= 25 ? 0x999999 : 0x666666;
    const birdAlpha = health >= 55 ? 1 : health >= 30 ? 0.5 : 0;
    const trafficAlpha = health >= 60 ? 0.25 : health >= 35 ? 0.55 : 0.85;

    if (animate) {
      this.visuals.sky.setFillStyle(targetSky);
    } else {
      this.visuals.sky.setFillStyle(targetSky);
    }

    if (health >= 75) {
      this.visuals.smog.stop();
    } else {
      this.visuals.smog.start();
      this.visuals.smog.setFrequency(smogRate);
    }

    this.visuals.trees.forEach((tree) => tree.setAlpha(treeAlpha));
    this.visuals.buildings.forEach((building) => {
      building.each((child: Phaser.GameObjects.GameObject) => {
        const tintable = child as Phaser.GameObjects.GameObject & {
          setTint?: (tint: number) => Phaser.GameObjects.GameObject;
        };
        tintable.setTint?.(buildingTint);
      });
    });
    this.visuals.birds.forEach((bird) => bird.setAlpha(birdAlpha));
    this.visuals.trafficGroup.setAlpha(trafficAlpha);
  }

  private createTree(x: number, y: number): Phaser.GameObjects.Container {
    const trunk = this.scene.add.rectangle(0, 18, 10, 28, 0x8b5a2b);
    const foliage = this.scene.add.ellipse(0, -8, 36, 42, 0x22c55e);
    const container = this.scene.add.container(x, y, [trunk, foliage]);
    container.setDepth(-2);
    return container;
  }

  private createBuilding(x: number, y: number, color: number): Phaser.GameObjects.Container {
    const body = this.scene.add.rectangle(0, 30, 70, 90, color);
    const roof = this.scene.add.triangle(0, -20, -38, 10, 38, 10, 0, -18, 0x334155);
    const window1 = this.scene.add.rectangle(-15, 10, 14, 18, 0xfef08a, 0.6);
    const window2 = this.scene.add.rectangle(15, 25, 14, 18, 0xfef08a, 0.4);
    const container = this.scene.add.container(x, y, [body, roof, window1, window2]);
    container.setDepth(-3);
    return container;
  }

  private createBird(x: number, y: number): Phaser.GameObjects.Container {
    const wingL = this.scene.add.triangle(-6, 0, 0, 0, -12, -4, -12, 4, 0x1e293b);
    const wingR = this.scene.add.triangle(6, 0, 0, 0, 12, -4, 12, 4, 0x1e293b);
    const container = this.scene.add.container(x, y, [wingL, wingR]);
    container.setDepth(2);

    this.scene.tweens.add({
      targets: container,
      x: x + 80,
      duration: 4000 + Math.random() * 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return container;
  }

  private createCar(x: number, y: number, color: number): Phaser.GameObjects.Container {
    const body = this.scene.add.rectangle(0, 0, 36, 14, color);
    const cabin = this.scene.add.rectangle(-4, -8, 18, 12, 0x94a3b8);
    const wheel1 = this.scene.add.circle(-10, 8, 4, 0x1e293b);
    const wheel2 = this.scene.add.circle(10, 8, 4, 0x1e293b);
    return this.scene.add.container(x, y, [body, cabin, wheel1, wheel2]);
  }
}
