import { assets } from "./data/assets.js";
import Phaser from "phaser";
import "./style.css";
import "./theme.css";
import { drawStreets } from "./map/streets.js";
import regions from "./data/regions.json";
import { createSlot, contains, validateMap } from "./domain/maps.js";
import { createRuralMap } from "./data/world.js";

const assetIds = Object.keys(assets);
const maps = Object.fromEntries(
  regions.map((r) => [
    r.id,
    r.id === "rural"
      ? createRuralMap()
      : { version: 1, id: r.id, background: r.background, slots: [] },
  ]),
);
let current = null,
  selected = null,
  editor = false,
  placing = false,
  scene;
const app = document.querySelector("#app");
app.innerHTML = `<header><strong>IMPÉRIO DO QUEIJO</strong><span>Cadastro territorial · etapa 1</span><button id="world">Mapa-múndi</button><button id="editor">Editor visual</button></header><main><nav id="regions"></nav><section id="map"></section><aside><h2 id="title">Queijópolis</h2><p id="notice">Selecione uma região. O cadastro dos terrenos ainda está em revisão; a campanha não está disponível nesta etapa.</p><div id="tools" hidden><button id="place">Posicionar terreno</button><button id="export">Exportar JSON</button><label>Importar JSON<input id="import" type="file" accept="application/json"></label></div><form id="details" hidden><label>ID<input name="id" required></label><label>Tipo<select name="type"><option value="land">Terreno</option><option value="farm">Fazenda</option><option value="factory">Fábrica</option><option value="sale">Venda</option><option value="security">Segurança</option><option value="service">Serviço</option></select></label><label>Proprietário<input name="owner" required></label><label>Edifício<select name="building"><option value="">Vazio</option></select></label><label>Nível<input name="level" type="number" min="0" step="1"></label><label>Largura do sprite<input name="width" type="number" min="1"></label><label>Profundidade<input name="depth" type="number"></label><label>Posição visual X<input name="x" type="number"></label><label>Posição visual Y<input name="y" type="number"></label><label>Polígono JSON<textarea name="polygon" rows="4"></textarea></label><label>Posto associado<select name="securityId"><option value="">Nenhum</option></select></label><label><input name="buy" type="checkbox">Pode comprar</label><label><input name="sell" type="checkbox">Pode vender</label><label><input name="conquer" type="checkbox">Pode conquistar</label><button type="submit">Aplicar cadastro</button><button id="remove" type="button">Remover terreno</button></form><p id="status" role="status"></p></aside></main><footer>Arraste para navegar · roda do mouse para zoom · clique para selecionar · no editor, posicione e ajuste polígonos em coordenadas do mapa.</footer>`;
const $ = (id) => document.getElementById(id);
const form = $("details");
assetIds
  .filter((n) => !n.startsWith("countryside"))
  .forEach((n) => {
    const o = document.createElement("option");
    o.value = n;
    o.textContent = n;
    form.elements.building.append(o);
  });
const status = (text) => ($("status").textContent = text);
function selection(slot) {
  selected = slot;
  form.hidden = !slot;
  if (slot) {
    for (const key of ["id", "type", "owner", "level"])
      form.elements[key].value = slot[key];
    form.elements.building.value = slot.building ?? "";
    for (const key of ["x", "y", "width", "depth"])
      form.elements[key].value = slot.sprite[key];
    form.elements.polygon.value = JSON.stringify(slot.polygon);
    for (const key of ["buy", "sell", "conquer"])
      form.elements[key].checked = slot.rules[key];
    const select = form.elements.securityId;
    select.replaceChildren(new Option("Nenhum", ""));
    current.slots
      .filter((s) => s.type === "security" && s.id !== slot.id)
      .forEach((s) => select.add(new Option(s.id, s.id)));
    select.value = slot.securityId ?? "";
  }
  for (const el of form.elements) el.disabled = !editor;
  scene?.redraw();
}
function openRegion(r) {
  current = maps[r.id];
  placing = false;
  selection(null);
  $("title").textContent = r.name;
  $("notice").textContent =
    "Cadastro em revisão: nenhum terreno é presumido pelo desenho do fundo. Edifícios no fundo são parte da arte e não são interativos.";
  scene?.showRegion();
}
regions.forEach((r) => {
  const b = document.createElement("button");
  b.textContent = r.name;
  b.onclick = () => openRegion(r);
  $("regions").append(b);
});
$("world").onclick = () => {
  current = null;
  selection(null);
  scene?.showRegion();
  $("title").textContent = "Queijópolis";
  $("notice").textContent = "Selecione uma região na lista.";
};
$("editor").onclick = () => {
  editor = !editor;
  $("tools").hidden = !editor;
  $("editor").textContent = editor ? "Sair do editor" : "Editor visual";
  placing = false;
  selection(selected);
};
$("place").onclick = () => {
  if (!current) return status("Selecione uma região.");
  placing = true;
  status("Clique no mapa para criar um terreno.");
};
form.onsubmit = (e) => {
  e.preventDefault();
  if (!editor || !selected) return;
  try {
    const val = (k) => form.elements[k].value;
    const next = {
      ...selected,
      id: val("id").trim(),
      type: val("type"),
      owner: val("owner").trim(),
      building: val("building") || null,
      level: Number(val("level")),
      occupation: val("building") ? "occupied" : "empty",
      securityId: val("securityId") || null,
      polygon: JSON.parse(val("polygon")),
      sprite: Object.fromEntries(
        ["x", "y", "width", "depth"].map((k) => [k, Number(val(k))]),
      ),
      rules: Object.fromEntries(
        ["buy", "sell", "conquer"].map((k) => [k, form.elements[k].checked]),
      ),
    };
    const candidate = {
      ...current,
      slots: current.slots.map((s) =>
        s === selected
          ? next
          : {
              ...s,
              securityId: s.securityId === selected.id ? next.id : s.securityId,
            },
      ),
    };
    validateMap(candidate, assetIds);
    current.slots = candidate.slots;
    selection(next);
    status("Cadastro atualizado. Exporte o JSON para guardar as alterações.");
  } catch (err) {
    status(err.message);
  }
};
$("remove").onclick = () => {
  if (!editor || !selected) return;
  const id = selected.id;
  current.slots = current.slots
    .filter((s) => s.id !== id)
    .map((s) => ({
      ...s,
      securityId: s.securityId === id ? null : s.securityId,
    }));
  selection(null);
  status("Terreno removido.");
};
$("export").onclick = () => {
  if (!current) return status("Selecione uma região.");
  validateMap(current, assetIds);
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(current, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${current.id}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$("import").onchange = async (e) => {
  try {
    const file = e.target.files[0];
    if (!file) return;
    const map = validateMap(JSON.parse(await file.text()), assetIds);
    const region = regions.find((r) => r.id === map.id);
    if (!region || map.background !== region.background)
      throw Error("Região ou fundo incompatível.");
    maps[map.id] = map;
    openRegion(region);
    status(`${map.slots.length} terrenos importados.`);
  } catch (err) {
    status(err.message);
  } finally {
    e.target.value = "";
  }
};
class MapScene extends Phaser.Scene {
  preload() {
    for (const [id, url] of Object.entries(assets)) this.load.image(id, url);
  }
  create() {
    scene = this;
    this.objects = [];
    this.outlines = this.add.graphics().setDepth(100000);
    this.drag = null;
    this.input.on("pointerdown", (p) => {
      this.drag = { x: p.x, y: p.y, lastX: p.x, lastY: p.y, moved: false };
    });
    this.input.on("pointermove", (p) => {
      if (!p.isDown || !this.drag) return;
      const d = this.drag;
      if (Math.hypot(p.x - d.x, p.y - d.y) > 5) d.moved = true;
      if (d.moved) {
        this.cameras.main.scrollX -= (p.x - d.lastX) / this.cameras.main.zoom;
        this.cameras.main.scrollY -= (p.y - d.lastY) / this.cameras.main.zoom;
      }
      d.lastX = p.x;
      d.lastY = p.y;
    });
    this.input.on("pointerup", (p) => {
      const d = this.drag;
      this.drag = null;
      if (!d || d.moved || !current) return;
      const pos = this.cameras.main.getWorldPoint(p.x, p.y);
      if (placing && editor) {
        const img = this.textures.get(current.background).getSourceImage();
        if (
          pos.x < 0 ||
          pos.y < 0 ||
          pos.x > (current.width ?? img.width) ||
          pos.y > (current.height ?? img.height)
        )
          return;
        const id = `${current.id}-${crypto.randomUUID()}`;
        const s = createSlot(
          current.id,
          Math.round(pos.x),
          Math.round(pos.y),
          id,
        );
        current.slots.push(s);
        placing = false;
        selection(s);
        status("Terreno criado; ajuste o cadastro e exporte.");
      } else
        selection(
          [...current.slots]
            .sort((a, b) => b.sprite.depth - a.sprite.depth)
            .find((s) => contains(s.polygon, pos.x, pos.y)) ?? null,
        );
    });
    this.input.on("wheel", (p, objects, dx, dy) => {
      if (!current) return;
      const c = this.cameras.main;
      const before = c.getWorldPoint(p.x, p.y);
      c.setZoom(Phaser.Math.Clamp(c.zoom * (dy > 0 ? 0.9 : 1.1), 0.25, 3));
      c.preRender();
      const after = c.getWorldPoint(p.x, p.y);
      c.scrollX += before.x - after.x;
      c.scrollY += before.y - after.y;
    });
    this.game.canvas.addEventListener("wheel", (e) => e.preventDefault(), {
      passive: false,
    });
    this.showRegion();
  }
  showRegion() {
    this.background?.destroy();
    this.streets?.destroy();
    this.streets?.destroy();
    if (current) {
      this.background = this.add
        .image(0, 0, current.background)
        .setOrigin(0)
        .setDepth(-100);
      const img = this.textures.get(current.background).getSourceImage();
      const c = this.cameras.main;
      this.background.setDisplaySize(
        current.width ?? img.width,
        current.height ?? img.height,
      );
      this.streets = drawStreets(this, current);
      c.setZoom(
        Math.min(
          c.width / (current.width ?? img.width),
          c.height / (current.height ?? img.height),
        ),
      );
      c.centerOn(
        (current.width ?? img.width) / 2,
        (current.height ?? img.height) / 2,
      );
    }
    this.redraw();
  }
  redraw() {
    this.objects.forEach((o) => o.destroy());
    this.objects = [];
    this.outlines.clear();
    if (!current) return;
    for (const s of current.slots) {
      if (s.building) {
        const o = this.add
          .image(s.sprite.x, s.sprite.y, s.building)
          .setOrigin(0.5, 1)
          .setDepth(s.sprite.depth);
        o.setDisplaySize(s.sprite.width, (s.sprite.width * o.height) / o.width);
        this.objects.push(o);
      }
      this.outlines.lineStyle(
        s === selected ? 3 : 1,
        s === selected ? 0xffe08a : 0x79dbbf,
        0.9,
      );
      this.outlines.strokePoints(s.polygon, true);
      if (editor)
        this.objects.push(
          this.add
            .text(s.polygon[0].x, s.polygon[0].y, s.id, {
              fontSize: "12px",
              backgroundColor: "#142b2b",
            })
            .setDepth(100001),
        );
    }
  }
}
new Phaser.Game({
  type: Phaser.CANVAS,
  parent: "map",
  backgroundColor: "#182b2a",
  scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%" },
  scene: MapScene,
});
