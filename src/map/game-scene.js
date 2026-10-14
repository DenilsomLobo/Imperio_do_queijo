import Phaser from "phaser";
import { contains } from "../domain/maps.js";
import { total, attackStrength } from "../domain/game.js";
import { collectorPosition, collectionAsset, shopAsset, guardAsset, combatIcons } from "./presentation.js";
import { drawStreets } from "./streets.js";

export function mapScene({
  assets,
  getMap,
  getState,
  getSelected,
  onSelect,
  onCollect,
  onReady,
  presentationOnly = false,
}) {
  return class GameMap extends Phaser.Scene {
    preload() {
      for (const [id, url] of Object.entries(assets)) this.load.image(id, url);
    }
    create() {
      this.staticObjects = [];
      this.dynamicObjects = [];
      this.drag = null;
      this.input.on("pointerdown", (p) => {
        this.drag = { x: p.x, y: p.y, lastX: p.x, lastY: p.y, moved: false };
      });
      this.input.on("pointermove", (p) => {
        const d = this.drag;
        if (!p.isDown || !d) return;
        if (Math.hypot(p.x - d.x, p.y - d.y) > 5) d.moved = true;
        if (d.moved) {
          const c = this.cameras.main;
          c.scrollX -= (p.x - d.lastX) / c.zoom;
          c.scrollY -= (p.y - d.lastY) / c.zoom;
        }
        d.lastX = p.x;
        d.lastY = p.y;
      });
      this.input.on("pointerup", (p) => {
        const d = this.drag;
        this.drag = null;
        if (!d || d.moved) return;
        const pos = this.cameras.main.getWorldPoint(p.x, p.y);
        const map = getMap();
        if (!map) return;
        const icon = this.collectors?.find(
          (i) => Math.hypot(pos.x - i.x, pos.y - i.y) < 32,
        );
        if (icon) {
          onCollect(icon.id);
          return;
        }
        const ordered = [...map.slots].sort(
          (a, b) => b.sprite.depth - a.sprite.depth,
        );
        const slot =
          ordered.find(
            (s) =>
              s.type === "security" &&
              Math.abs(pos.x - s.sprite.x) <= 35 &&
              pos.y >= s.sprite.y - 60 &&
              pos.y <= s.sprite.y + 20,
          ) ??
          ordered.find((s) =>
            this.propertySprites.get(s.id)?.getBounds().contains(pos.x, pos.y),
          ) ??
          ordered.find((s) => contains(s.polygon, pos.x, pos.y));
        onSelect(slot?.id ?? null);
      });
      this.input.on("wheel", (p, objects, dx, dy) => {
        if (!getMap()) return;
        const c = this.cameras.main,
          before = c.getWorldPoint(p.x, p.y);
        c.setZoom(Phaser.Math.Clamp(c.zoom * (dy > 0 ? 0.9 : 1.1), 0.25, 3));
        c.preRender();
        const after = c.getWorldPoint(p.x, p.y);
        c.scrollX += before.x - after.x;
        c.scrollY += before.y - after.y;
      });
      this.game.canvas.addEventListener("wheel", (e) => e.preventDefault(), {
        passive: false,
      });
      onReady(this);
      this.show();
      this.game.canvas.dataset.ready = "true";
    }
    show() {
      this.staticObjects.forEach((o) => o.destroy());
      this.staticObjects = [];
      this.propertySprites = new Map();
      const map = getMap();
      if (map) {
        const img = this.textures.get(map.background).getSourceImage();
        this.staticObjects.push(
          this.add
            .image(0, 0, map.background)
            .setOrigin(0)
            .setDepth(-100)
            .setDisplaySize(map.width ?? img.width, map.height ?? img.height),
        );
        this.staticObjects.push(drawStreets(this, map));
        for (const s of map.slots) {
          if (s.type !== "security" && s.building) {
            const o = this.add
              .image(s.sprite.x, s.sprite.y, s.building)
              .setOrigin(0.5, 1)
              .setDepth(s.sprite.depth);
            o.setDisplaySize(
              s.sprite.width,
              (s.sprite.width * o.height) / o.width,
            );
            this.staticObjects.push(o);
            this.propertySprites.set(s.id, o);
          }
        }
        this.fit();
      }
      this.refresh();
    }
    fit() {
      const map = getMap();
      if (!map) return;
      const img = this.textures.get(map.background).getSourceImage(),
        width = map.width ?? img.width,
        height = map.height ?? img.height,
        c = this.cameras.main;
      c.setZoom(Math.min(c.width / width, c.height / height));
      c.centerOn(width / 2, height / 2);
    }
    focus(id) {
      const slot = getMap()?.slots.find((s) => s.id === id);
      if (slot) {
        this.cameras.main.setZoom(Math.max(this.cameras.main.zoom, 0.85));
        this.cameras.main.centerOn(
          slot.sprite.x,
          slot.sprite.y - slot.sprite.width * 0.4,
        );
      }
    }
    zoomBy(factor) {
      const c = this.cameras.main;
      c.setZoom(Phaser.Math.Clamp(c.zoom * factor, 0.25, 2));
    }
    refresh() {
      this.dynamicObjects.forEach((o) => o.destroy());
      this.dynamicObjects = [];
      this.collectors = [];
      const map = getMap(),
        state = getState();
      if (!map) return;
      const draw = this.add.graphics().setDepth(10000);
      this.dynamicObjects.push(draw);
      for (const s of map.slots) {
        const p = state.properties[s.id];
        if (!p) continue;
        const selected = getSelected() === s.id;
        if (selected) {
          draw.lineStyle(3, 0xd99a24, 1);
          draw.strokePoints(s.polygon, true);
        }
        if (s.type === "security") {
          const color = p.owner === "player" ? 0x52734d : p.owner === "neutral" ? 0x786858 : 0xc66b43;
          draw.fillStyle(0xdcc9a7,0.9);
          draw.fillEllipse(s.sprite.x,s.sprite.y,74,42);
          draw.lineStyle(selected?4:2,color,1);
          draw.strokeEllipse(s.sprite.x,s.sprite.y,74,42);
          const image = this.add.image(s.sprite.x,s.sprite.y,guardAsset(p)).setOrigin(0.5,1).setDepth(10001);
          const width = p.team ? 88 : 68;
          image.setDisplaySize(width,width*image.height/image.width);
          this.dynamicObjects.push(image);
          if (!presentationOnly) combatIcons(state,p.id).forEach((asset,i)=>{
            this.dynamicObjects.push(this.add.image(s.sprite.x+i*54,s.sprite.y-125,asset).setDisplaySize(50,50).setDepth(10004));
          });
          continue;
        }
        const physical = this.propertySprites.get(s.id);
        if (physical && p.type === "sale") {
          const asset = shopAsset(s,p);
          if (physical.texture.key !== asset) {
            physical.setTexture(asset);
            physical.setDisplaySize(s.sprite.width,s.sprite.width*physical.height/physical.width);
          }
        }
        if (presentationOnly || !s.building) continue;
        this.label(s.sprite.x,s.sprite.y+8,s.name,18,true);
        const asset = collectionAsset(p);
        if (asset) {
          const {x,y}=collectorPosition(s);
          this.collectors.push({id:p.id,x,y});
          this.dynamicObjects.push(this.add.image(x,y,asset).setDisplaySize(60,60).setDepth(10003));
        }
      }
    }
    label(x, y, text, size = 22, title = false) {
      const caption = this.add.text(x, y + 8, text, {
        fontFamily: title ? 'Georgia, "Times New Roman", serif' : '"Trebuchet MS", Arial, sans-serif',
        fontSize: `${size}px`,
        fontStyle: title ? "bold" : "normal",
        color: title ? "#FFF8E7" : "#352719",
        align: "center",
        wordWrap: { width: title ? 250 : 290 },
        lineSpacing: 3,
      }).setOrigin(0.5, 0).setDepth(10002);
      const width = Math.max(caption.width + 30, title ? 190 : 120);
      const height = caption.height + 16;
      const plate = this.add.graphics().setDepth(10001);
      plate.fillStyle(0x352719, 0.22);
      plate.fillRoundedRect(x-width/2+2,y+4,width,height,9);
      plate.fillStyle(title ? 0x5c4030 : 0xfff8e7, 0.97);
      plate.fillRoundedRect(x-width/2,y,width,height,9);
      plate.lineStyle(2,title ? 0xd99a24 : 0xd8c5a5,1);
      plate.strokeRoundedRect(x-width/2,y,width,height,9);
      plate.lineStyle(1,title ? 0xf2c14e : 0xf3e7cf,0.6);
      plate.strokeRoundedRect(x-width/2+4,y+4,width-8,height-8,6);
      if (title) {
        plate.fillStyle(0xf2c14e,1);
        plate.fillCircle(x-width/2+9,y+height/2,2);
        plate.fillCircle(x+width/2-9,y+height/2,2);
      }
      this.dynamicObjects.push(plate, caption);
      return height;
    }
  };
}
