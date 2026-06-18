import Phaser from "phaser";
import {
  buildJourneyResult,
  getCurrentImpactLabel,
  type JourneyResult,
} from "@/lib/journey";
import type { JourneyBridge } from "../bridge";
import { JOURNEY_ZONES, WORLD_HEIGHT, WORLD_WIDTH, ZONE_WIDTH } from "../data/zones";
import { EnvironmentSystem } from "../systems/EnvironmentSystem";

export class JourneyScene extends Phaser.Scene {
  private bridge!: JourneyBridge;
  private environment!: EnvironmentSystem;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private zoneMarkers: Phaser.GameObjects.Container[] = [];
  private zoneLabels: Phaser.GameObjects.Text[] = [];
  private completedZones = new Set<number>();
  private activeZoneIndex = 0;
  private awaitingChoice = false;
  private pendingZoneIndex: number | null = null;
  private choiceHistory: JourneyResult["choices"] = [];
  private hintText!: Phaser.GameObjects.Text;
  private interactKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super("JourneyScene");
  }

  init(data: { bridge: JourneyBridge; initialHealth: number; city: string }) {
    this.bridge = data.bridge;
    this.registry.set("initialHealth", data.initialHealth);
    this.completedZones.clear();
    this.activeZoneIndex = 0;
    this.awaitingChoice = false;
    this.pendingZoneIndex = null;
    this.choiceHistory = [];
  }

  preload() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture("smog-dot", 8, 8);
    g.destroy();

    const pg = this.make.graphics({ x: 0, y: 0 });
    pg.fillStyle(0xfbbf24, 1);
    pg.fillRoundedRect(0, 0, 28, 36, 6);
    pg.fillStyle(0x38bdf8, 0.9);
    pg.fillCircle(14, 10, 9);
    pg.fillStyle(0x1e293b, 1);
    pg.fillRect(6, 28, 6, 8);
    pg.fillRect(16, 28, 6, 8);
    pg.fillStyle(0x64748b, 1);
    pg.fillRect(4, 14, 20, 16);
    pg.generateTexture("explorer", 28, 36);
    pg.destroy();

    const mg = this.make.graphics({ x: 0, y: 0 });
    mg.lineStyle(3, 0x22c55e, 1);
    mg.strokeCircle(16, 16, 14);
    mg.lineStyle(2, 0x86efac, 0.8);
    mg.strokeCircle(16, 16, 8);
    mg.generateTexture("marker", 32, 32);
    mg.destroy();
  }

  create() {
    const initialHealth = this.registry.get("initialHealth") as number;

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBackgroundColor(0x07100f);

    this.environment = new EnvironmentSystem(this, initialHealth, WORLD_WIDTH);
    this.bridge.onHealthChange?.(initialHealth, "Starting conditions");

    this.drawZoneDecorations();
    this.createPlayer();
    this.createControls();
    this.createHud();

    this.bridge.resolveChoice = (choiceId: string) => this.handleChoice(choiceId);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
  }

  update() {
    if (this.awaitingChoice) {
      this.player.setVelocity(0, 0);
      return;
    }

    const speed = 160;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;

    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.player.setVelocity(vx, vy);

    const zoneIndex = Math.floor(this.player.x / ZONE_WIDTH);
    if (zoneIndex !== this.activeZoneIndex && zoneIndex >= 0 && zoneIndex < JOURNEY_ZONES.length) {
      this.activeZoneIndex = zoneIndex;
      this.bridge.onZoneEnter?.(zoneIndex, JOURNEY_ZONES[zoneIndex].title);
    }

    this.checkInteraction();
  }

  private drawZoneDecorations() {
    JOURNEY_ZONES.forEach((zone, index) => {
      const cx = index * ZONE_WIDTH + ZONE_WIDTH / 2;

      const sign = this.add.rectangle(cx, 250, 180, 36, 0x0d1f18, 0.85);
      sign.setStrokeStyle(2, 0x22c55e, 0.4);
      sign.setDepth(-1);

      const label = this.add
        .text(cx, 250, zone.title, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          color: "#86efac",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(-1);
      this.zoneLabels.push(label);

      const marker = this.add.container(cx, 380);
      const ring = this.add.image(0, 0, "marker").setAlpha(0.85);
      marker.add(ring);
      marker.setSize(48, 48);
      this.tweens.add({
        targets: ring,
        scale: { from: 0.9, to: 1.15 },
        alpha: { from: 0.5, to: 1 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
      });
      this.zoneMarkers.push(marker);
    });
  }

  private createPlayer() {
    this.player = this.physics.add.sprite(120, 380, "explorer");
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.body?.setSize(20, 28);
    this.player.body?.setOffset(4, 6);
  }

  private createControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D") as typeof this.wasd;
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  private createHud() {
    this.hintText = this.add
      .text(16, 16, "Use arrow keys or WASD to explore · Approach the green markers", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        color: "#a7f3d0",
        backgroundColor: "#07100f",
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0.9);
  }

  private checkInteraction() {
    if (this.awaitingChoice) return;

    for (let i = 0; i < JOURNEY_ZONES.length; i++) {
      if (this.completedZones.has(i)) continue;

      const nextZone = this.completedZones.size;
      if (i !== nextZone) continue;

      const marker = this.zoneMarkers[i];
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, marker.x, marker.y);

      if (dist < 70) {
        this.hintText.setText(`Press E or walk closer to choose · ${JOURNEY_ZONES[i].title}`);

        if (dist < 45 || Phaser.Input.Keyboard.JustDown(this.interactKey)) {
          this.openChoicePanel(i);
        }
        return;
      }
    }

    this.hintText.setText("Use arrow keys or WASD to explore · Approach the green markers");
  }

  private openChoicePanel(zoneIndex: number) {
    if (this.awaitingChoice || this.completedZones.has(zoneIndex)) return;

    this.awaitingChoice = true;
    this.pendingZoneIndex = zoneIndex;
    this.player.setVelocity(0, 0);

    const zone = JOURNEY_ZONES[zoneIndex];
    this.bridge.onChoiceRequest?.({
      zoneIndex,
      zone,
      choices: zone.choices,
    });
  }

  private handleChoice(choiceId: string) {
    if (!this.awaitingChoice || this.pendingZoneIndex === null) return;

    const index = this.pendingZoneIndex;
    const zone = JOURNEY_ZONES[index];
    const choice = zone.choices.find((c) => c.id === choiceId) ?? zone.choices[0];

    const newHealth = this.environment.adjustHealth(choice.delta);
    const impactLabel = getCurrentImpactLabel(choice.delta);

    this.choiceHistory.push({
      zoneId: zone.id,
      choiceId: choice.id,
      label: choice.label,
      delta: choice.delta,
    });

    this.completedZones.add(index);
    this.awaitingChoice = false;
    this.pendingZoneIndex = null;

    this.bridge.onHealthChange?.(newHealth, impactLabel);

    const marker = this.zoneMarkers[index];
    this.tweens.add({
      targets: marker,
      alpha: 0.2,
      scale: 0.6,
      duration: 500,
    });

    this.cameras.main.flash(
      choice.delta >= 0 ? 300 : 200,
      choice.delta >= 0 ? 34 : 239,
      choice.delta >= 0 ? 197 : 68,
      choice.delta >= 0 ? 94 : 68,
      false,
    );

    if (this.completedZones.size >= JOURNEY_ZONES.length) {
      this.time.delayedCall(800, () => {
        const result = buildJourneyResult(newHealth, this.choiceHistory);
        this.bridge.onComplete?.(result);
      });
    }
  }
}
