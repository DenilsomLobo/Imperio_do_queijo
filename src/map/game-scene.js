import Phaser from "phaser";
import {installMapGestures} from "./gestures.js";
import {mapAssetIds} from "./map-assets.js";
import { contains } from "../domain/maps.js";
import { collectorPosition, collectionAsset, shopAsset, guardAsset, combatIcons, resourceWarning } from "./presentation.js";
import { drawStreets } from "./streets.js";

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
// Área inicial no celular em pé: a fazenda, a queijaria e a barraquinha do Seu Zé.
const START_VIEW = { x: 650, y: 1650 };

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
      const loading=document.createElement('div');
      loading.className='map-loading';loading.setAttribute('role','status');
      loading.innerHTML='<span class="map-loading-cheese" aria-hidden="true"></span><span>Carregando mapa…</span><span class="map-loading-bar"><i></i></span>';
      this.game.canvas.parentElement.append(loading);this.loadingIndicator=loading;
      this.load.on('progress',value=>{
        loading.querySelector('span:nth-child(2)').textContent=`Carregando mapa… ${Math.round(value*100)}%`;
        loading.querySelector('.map-loading-bar i').style.width=`${Math.round(value*100)}%`;
      });
      for (const id of mapAssetIds(getMap())) this.load.image(id, assets[id]);
    }
    create() {
      this.staticObjects = [];
      this.dynamicObjects = [];
      this.collectorSprites = new Map();
      this.fitted = false;
      // Depois do primeiro enquadramento, redimensionar só ajusta limites e mantém a vista do jogador.
      this.scale.on("resize",()=>{ if(this.fitted) this.constrain(); else this.fit(); });
      this.selectionRing = this.add.graphics().setVisible(false);
      this.tweens.add({targets:this.selectionRing,alpha:{from:0.45,to:1},duration:700,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      installMapGestures(this, (p) => {
        const pos = this.cameras.main.getWorldPoint(p.x, p.y);
        const map = getMap();
        if (!map) return;
        // Área de toque maior que o ícone, para dedos.
        const icon = this.collectors?.find(
          (i) => Math.hypot(pos.x - i.x, pos.y - i.y) < Math.max(40, 26 / this.cameras.main.zoom),
        );
        if (icon) {
          this.popCollector(icon.id);
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
      this.show();
      onReady(this);
      this.loadingIndicator?.remove();
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
        if(map.id==='rural' && this.textures.exists('comece_flag.png')) {
          const flag=this.add.image(190,1920,'comece_flag.png').setOrigin(0.5,1).setDepth(10005);
          flag.setDisplaySize(230,230*flag.height/flag.width);
          if(!reducedMotion()) this.tweens.add({targets:flag,angle:{from:-2,to:2},duration:1400,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
          this.staticObjects.push(flag);
        }
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
      c.removeBounds();
      c.setZoom(this.minimumZoom());
      c.centerOn(width / 2, height / 2);
      // Tela em pé (celular): preenche a altura e começa pela região inicial, em vez de um mapa minúsculo.
      if (c.height > c.width * 1.15) {
        c.setZoom(Math.min(3, Math.max(c.width / width, c.height / height, c.width / 900)));
        c.centerOn(START_VIEW.x, START_VIEW.y);
      }
      this.fitted = c.width > 0 && c.height > 0;
      this.constrain();
    }
    minimumZoom() {
      const map=getMap(),c=this.cameras.main;
      return map?Math.min(c.width/map.width,c.height/map.height):0.25;
    }
    constrain() {
      const c=this.cameras.main,map=getMap();
      if(!map)return;
      c.setZoom(Phaser.Math.Clamp(c.zoom,this.minimumZoom(),3));
      // Center an axis when its terrain fits; otherwise keep panning on the map.
      const halfW=c.width/(2*c.zoom),halfH=c.height/(2*c.zoom);
      const x=c.scrollX+c.width/2,y=c.scrollY+c.height/2;
      c.centerOn(halfW*2>=map.width?map.width/2:Phaser.Math.Clamp(x,halfW,map.width-halfW),
        halfH*2>=map.height?map.height/2:Phaser.Math.Clamp(y,halfH,map.height-halfH));
      c.preRender();
      Object.assign(this.game.canvas.dataset,{zoom:String(c.zoom),minimumZoom:String(this.minimumZoom()),scrollX:String(c.scrollX),scrollY:String(c.scrollY)});
    }
    zoomAt(factor,anchor,destination=anchor) {
      const c=this.cameras.main;
      this.panTween?.stop();
      c.preRender();
      const before=c.getWorldPoint(anchor.x,anchor.y);
      c.setZoom(Phaser.Math.Clamp(c.zoom*factor,this.minimumZoom(),3));
      c.preRender();
      const after=c.getWorldPoint(destination.x,destination.y);
      c.scrollX+=before.x-after.x;c.scrollY+=before.y-after.y;
      this.constrain();
    }
    focus(id, offsetY = 0) {
      const slot = getMap()?.slots.find((s) => s.id === id);
      if (slot) {
        this.panTween?.stop();
        this.cameras.main.setZoom(Math.max(this.cameras.main.zoom, 0.85));
        this.cameras.main.centerOn(
          slot.sprite.x,
          slot.sprite.y - slot.sprite.width * 0.4 + offsetY / this.cameras.main.zoom,
        );
        this.constrain();
      }
    }
    // Desliza a câmera até a construção sem mudar o zoom (ex.: ao abrir o painel no celular).
    glideTo(id, offsetY = 0, offsetX = 0) {
      const slot = getMap()?.slots.find((s) => s.id === id), c = this.cameras.main;
      if (!slot) return;
      const target = { x: slot.sprite.x + offsetX / c.zoom, y: slot.sprite.y - slot.sprite.width * 0.4 + offsetY / c.zoom };
      const from = { x: c.scrollX + c.width / 2, y: c.scrollY + c.height / 2 };
      this.panTween?.stop();
      if (reducedMotion()) { c.centerOn(target.x, target.y); this.constrain(); return; }
      const probe = { t: 0 };
      this.panTween = this.tweens.add({ targets: probe, t: 1, duration: 380, ease: 'Sine.easeInOut',
        onUpdate: () => { c.centerOn(from.x + (target.x - from.x) * probe.t, from.y + (target.y - from.y) * probe.t); this.constrain(); } });
    }
    zoomBy(factor) {
      const c = this.cameras.main;
      this.zoomAt(factor,{x:c.width/2,y:c.height/2});
    }
    slotTop(id) {
      const s = getMap()?.slots.find((slot) => slot.id === id);
      if (!s) return null;
      return { x: s.sprite.x, y: s.type === 'security' ? s.sprite.y - 90 : s.sprite.y - s.sprite.width * 0.62, slot: s };
    }
    // Número flutuante ("+R$ 25", "+1 L") que sobe e some sobre a construção.
    floatText(id, text, { color = '#2f7d32', icon = null, delay = 0 } = {}) {
      const at = this.slotTop(id);
      if (!at || presentationOnly) return;
      const zoom = this.cameras.main.zoom, size = Math.round(Math.max(26, 17 / zoom));
      const label = this.add.text(0, 0, text, {
        fontFamily: '"Lilita One", "Trebuchet MS", Arial, sans-serif', fontSize: `${size}px`,
        color, stroke: '#fff8e7', strokeThickness: Math.max(5, size / 5),
      }).setOrigin(icon ? 0 : 0.5, 0.5);
      const parts = [label];
      if (icon && this.textures.exists(icon)) {
        const img = this.add.image(-size * 0.7, 0, icon).setDisplaySize(size * 1.25, size * 1.25);
        parts.unshift(img);
        label.setX(-size * 0.05);
      }
      const box = this.add.container(at.x, at.y, parts).setDepth(20000).setAlpha(0);
      const rise = Math.max(70, 50 / zoom);
      this.tweens.add({ targets: box, alpha: 1, duration: 140, delay });
      this.tweens.add({ targets: box, y: at.y - rise, duration: reducedMotion() ? 600 : 1300, delay, ease: 'Cubic.easeOut' });
      this.tweens.add({ targets: box, alpha: 0, duration: 380, delay: delay + (reducedMotion() ? 500 : 1000), onComplete: () => box.destroy() });
    }
    // Pequena chuva de ícones (moedas, queijos) para recompensas.
    burst(id, asset, count = 6) {
      const at = this.slotTop(id);
      if (!at || presentationOnly || reducedMotion() || !this.textures.exists(asset)) return;
      const zoom = this.cameras.main.zoom, size = Math.max(26, 18 / zoom);
      for (let i = 0; i < count; i++) {
        const img = this.add.image(at.x, at.y + size, asset).setDisplaySize(size, size).setDepth(19999);
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6, dist = size * (2 + Math.random() * 2.2);
        this.tweens.add({ targets: img, x: at.x + Math.cos(angle) * dist, y: at.y + Math.sin(angle) * dist, duration: 520, ease: 'Quad.easeOut' });
        this.tweens.add({ targets: img, alpha: 0, scale: img.scale * 0.4, duration: 300, delay: 420 + i * 25, onComplete: () => img.destroy() });
      }
    }
    // Brilho de sucesso ao redor da construção (melhorias, conquistas).
    flash(id, color = 0xf2c14e) {
      const at = this.slotTop(id);
      if (!at || presentationOnly) return;
      const ring = this.add.graphics().setDepth(19998);
      ring.lineStyle(10, color, 1).strokeCircle(0, 0, at.slot.sprite.width * 0.55);
      ring.setPosition(at.x, at.y + at.slot.sprite.width * 0.3).setScale(0.6);
      this.tweens.add({ targets: ring, scale: 1.25, alpha: 0, duration: reducedMotion() ? 300 : 800, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    }
    popCollector(id) {
      const icon = this.collectorSprites.get(id);
      if (!icon || reducedMotion()) return;
      this.tweens.add({ targets: icon, scale: icon.scale * 1.35, alpha: 0.2, duration: 180, yoyo: true });
    }
    // Seta saltitante do tutorial sobre uma construção (null remove).
    pointAt(id) {
      if (this.pointerTarget === id) return;
      this.pointerTarget = id;
      this.pointer?.destroy();
      this.pointer = null;
      const at = id ? this.slotTop(id) : null;
      if (!at) return;
      const g = this.add.graphics();
      g.fillStyle(0x352719, 0.35).fillTriangle(-26, -56, 26, -56, 3, 4);
      g.fillStyle(0xf2c14e, 1).fillTriangle(-28, -60, 28, -60, 0, 0);
      g.lineStyle(5, 0x5c4030, 1).strokeTriangle(-28, -60, 28, -60, 0, 0);
      g.fillStyle(0xf2c14e, 1).fillRect(-11, -110, 22, 52);
      g.lineStyle(5, 0x5c4030, 1).strokeRect(-11, -110, 22, 52);
      const ring = this.add.graphics();
      ring.lineStyle(6, 0xf2c14e, 1).strokeEllipse(0, 0, at.slot.sprite.width * 0.9, at.slot.sprite.width * 0.45);
      ring.setPosition(0, at.slot.sprite.y - at.y);
      const arrow = this.add.container(0, -40, [g]);
      this.pointer = this.add.container(at.x, at.y - 30, [ring, arrow]).setDepth(20001);
      if (!reducedMotion()) {
        this.tweens.add({ targets: arrow, y: -80, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: ring, alpha: { from: 1, to: 0.25 }, scale: { from: 0.9, to: 1.08 }, duration: 760, yoyo: true, repeat: -1 });
      }
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
      const activeCollectors = new Set();
      const selectedSlot = map.slots.find((s) => s.id === getSelected() && state.properties[s.id]);
      if (selectedSlot && !presentationOnly) {
        const w = selectedSlot.type === 'security' ? 110 : selectedSlot.sprite.width;
        this.selectionRing.clear();
        this.selectionRing.fillStyle(0xf2c14e, 0.22).fillEllipse(0, 0, w * 1.05, w * 0.5);
        this.selectionRing.lineStyle(5, 0xf2c14e, 1).strokeEllipse(0, 0, w * 1.05, w * 0.5);
        this.selectionRing.setPosition(selectedSlot.sprite.x, selectedSlot.sprite.y - (selectedSlot.type === 'security' ? 0 : w * 0.12)).setDepth(selectedSlot.sprite.depth - 1).setVisible(true);
      } else this.selectionRing.setVisible(false);
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
          const guard=guardAsset(p);
          const image = this.add.image(s.sprite.x,s.sprite.y,guard).setOrigin(0.5,1).setDepth(10001);
          const width = guard.startsWith("bandeira_") ? 68 : 88;
          image.setDisplaySize(width,width*image.height/image.width);
          this.dynamicObjects.push(image);
          if (!presentationOnly) combatIcons(state,p.id).forEach((asset,i)=>{
            const icon=this.add.image(s.sprite.x+i*54,s.sprite.y-125,asset).setDisplaySize(50,50).setDepth(10004);
            // Ataques chamam atenção com uma leve pulsação.
            if(!reducedMotion()) this.tweens.add({targets:icon,scale:icon.scale*1.18,duration:420,yoyo:true,repeat:-1});
            this.dynamicObjects.push(icon);
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
        if(p.staffNotices?.length) this.label(s.sprite.x,s.sprite.y+65,p.type==="security"?"Capangas pediram demissão":"Funcionários pediram demissão",14,true);
        const warning = resourceWarning(p);
        if (warning) this.warningBadge(s.sprite.x - s.sprite.width * 0.42, s.sprite.y - s.sprite.width * 0.72, warning);
        const asset = collectionAsset(p);
        if (asset) {
          const {x,y}=collectorPosition(s);
          this.collectors.push({id:p.id,x,y});
          activeCollectors.add(p.id);
          this.collector(p.id, x, y, asset);
        }
      }
      for (const [id, icon] of this.collectorSprites) {
        if (activeCollectors.has(id)) continue;
        this.tweens.killTweensOf(icon);
        icon.destroy();
        this.collectorSprites.delete(id);
      }
    }
    // Ícones de coleta persistem entre atualizações para manter a animação suave.
    collector(id, x, y, asset) {
      let icon = this.collectorSprites.get(id);
      if (icon && icon.texture.key !== asset) { this.tweens.killTweensOf(icon); icon.destroy(); icon = null; }
      if (icon) return icon;
      icon = this.add.image(x, y, asset).setDisplaySize(60, 60).setDepth(10003);
      const base = icon.scale;
      icon.setScale(0);
      this.tweens.add({ targets: icon, scale: base, duration: 260, ease: 'Back.easeOut' });
      if (!reducedMotion()) {
        this.tweens.add({ targets: icon, y: y - 10, duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 260 });
      }
      this.collectorSprites.set(id, icon);
      return icon;
    }
    warningBadge(x, y, text) {
      const caption = this.add.text(x + 22, y, text, {
        fontFamily: '"Nunito Variable", "Trebuchet MS", Arial, sans-serif', fontStyle: 'bold', fontSize: '16px', color: '#fff8e7',
      }).setOrigin(0, 0.5).setDepth(10006);
      const width = caption.width + 40;
      const plate = this.add.graphics().setDepth(10005);
      plate.fillStyle(0x352719, 0.25).fillRoundedRect(x - 16, y - 13, width, 30, 15);
      plate.fillStyle(0xb5432a, 0.96).fillRoundedRect(x - 18, y - 15, width, 30, 15);
      plate.fillStyle(0xfff8e7, 1).fillCircle(x, y, 10);
      const mark = this.add.text(x, y, '!', { fontFamily: 'Arial', fontStyle: 'bold', fontSize: '16px', color: '#b5432a' }).setOrigin(0.5).setDepth(10006);
      this.dynamicObjects.push(plate, caption, mark);
    }
    label(x, y, text, size = 22, title = false) {
      const caption = this.add.text(x, y + 8, text, {
        fontFamily: title ? '"Lilita One", Georgia, serif' : '"Nunito Variable", "Trebuchet MS", Arial, sans-serif',
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
