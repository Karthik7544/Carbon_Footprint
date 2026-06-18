import Phaser from "phaser";
import type { JourneyBridge } from "./bridge";
import { JourneyScene } from "./scenes/JourneyScene";
import { WORLD_HEIGHT } from "./data/zones";

export interface CreateGameOptions {
  parent: HTMLElement;
  bridge: JourneyBridge;
  initialHealth: number;
  city: string;
}

export function createCarbonJourneyGame(options: CreateGameOptions): Phaser.Game {
  const { parent, bridge, initialHealth, city } = options;

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: WORLD_HEIGHT,
    backgroundColor: "#07100f",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: WORLD_HEIGHT,
    },
    scene: {
      key: "JourneyScene",
      scene: JourneyScene,
      data: { bridge, initialHealth, city },
    } as unknown as Phaser.Types.Scenes.SceneType,
  });
}
