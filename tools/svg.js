// Turns rendered cards (shadow roots included) into plain SVG shapes and text.
// It covers what the cards use: boxes with radius and border, text, ha-icon,
// inline SVG and inputs. The layout comes from the browser, so the output
// matches the real card pixel for pixel.

const SKIP = new Set(["style", "script", "template", "title", "dialog", "link"]);
const SVG_ATTRS = ["cx", "cy", "r", "x", "y", "width", "height", "rx", "ry", "d", "points", "transform", "x1", "x2", "y1", "y2"];
const SVG_STYLES = [
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-dasharray",
  "stroke-linecap",
  "stroke-opacity",
  "opacity",
  "font-size",
  "font-weight",
  "text-anchor",
  "dominant-baseline",
];

const round = (n) => Math.round(n * 100) / 100;

export const escapeXml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);

// Accepts the computed colors Chrome produces, color-mix() results included
export function parseColor(value) {
  if (!value || value === "none" || value === "transparent") return null;
  let r;
  let g;
  let b;
  let a = 1;
  let m = value.match(/^rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\)$/);
  if (m) {
    [r, g, b] = [m[1], m[2], m[3]].map(Number);
    if (m[4] !== undefined) a = m[4].endsWith("%") ? parseFloat(m[4]) / 100 : Number(m[4]);
  } else {
    m = value.match(/^color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.e-]+))?\)$/);
    if (!m) return null;
    [r, g, b] = [m[1], m[2], m[3]].map((v) => Number(v) * 255);
    if (m[4] !== undefined) a = Number(m[4]);
  }
  if (a <= 0) return null;
  const hex = `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("")}`;
  return { hex, alpha: round(a) };
}

function paint(attr, value, extraOpacity = 1) {
  const color = parseColor(value);
  if (!color) return `${attr}="none"`;
  const alpha = round(color.alpha * extraOpacity);
  return `${attr}="${color.hex}"${alpha < 1 ? ` ${attr}-opacity="${alpha}"` : ""}`;
}

export class SvgWriter {
  constructor() {
    this.chars = new Set();
    this.canvas = document.createElement("canvas").getContext("2d");
  }

  // Returns { svg, width, height } with coordinates relative to the element
  render(element, id = "r") {
    const rect = element.getBoundingClientRect();
    this.ox = rect.left;
    this.oy = rect.top;
    this.out = [];
    this.clips = [];
    this.prefix = id;
    this.clipCount = 0;
    this.element(element, true);
    return { svg: this.out.join("\n"), width: round(rect.width), height: round(rect.height) };
  }

  // Skips what scrolled or overflowed out of a clipping parent
  outside(rect) {
    const clip = this.clips.at(-1);
    if (!clip) return false;
    return rect.bottom <= clip.top || rect.top >= clip.bottom || rect.right <= clip.left || rect.left >= clip.right;
  }

  openClip(cs, rect) {
    const id = `${this.prefix}-clip${this.clipCount++}`;
    const r = this.radius(cs, rect);
    this.out.push(
      `<clipPath id="${id}"><rect x="${this.x(rect.left)}" y="${this.y(rect.top)}" width="${round(rect.width)}" height="${round(rect.height)}"${r ? ` rx="${r}"` : ""}/></clipPath>`,
      `<g clip-path="url(#${id})">`,
    );
    this.clips.push(rect);
  }

  x(value) {
    return round(value - this.ox);
  }

  y(value) {
    return round(value - this.oy);
  }

  node(node) {
    if (node.nodeType === Node.TEXT_NODE) this.text(node);
    else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.localName === "slot") node.assignedNodes({ flatten: true }).forEach((n) => this.node(n));
      else if (!SKIP.has(node.localName)) this.element(node);
    }
  }

  element(el, root = false) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return;
    const opacity = Number(cs.opacity);
    if (opacity === 0) return;
    const rect = el.getBoundingClientRect();
    if (this.outside(rect)) return;
    if (opacity < 1) this.out.push(`<g opacity="${round(opacity)}">`);
    this.box(el, cs, rect, root);
    if (el.localName === "ha-icon") this.icon(el, cs, rect);
    else if (el instanceof SVGSVGElement) this.inlineSvg(el, rect);
    else if (el.localName === "input") this.input(el, cs, rect);
    else {
      const clip = !root && cs.overflow !== "visible" && rect.width && rect.height;
      if (clip) this.openClip(cs, rect);
      (el.shadowRoot ? [...el.shadowRoot.childNodes] : [...el.childNodes]).forEach((n) => this.node(n));
      if (clip) {
        this.out.push("</g>");
        this.clips.pop();
      }
    }
    if (opacity < 1) this.out.push("</g>");
  }

  radius(cs, rect) {
    const value = cs.borderTopLeftRadius;
    const r = value.endsWith("%") ? (parseFloat(value) / 100) * Math.min(rect.width, rect.height) : parseFloat(value) || 0;
    return round(Math.min(r, rect.width / 2, rect.height / 2));
  }

  box(el, cs, rect, root) {
    if (!rect.width || !rect.height || el instanceof SVGElement) return;
    const fill = parseColor(cs.backgroundColor);
    const borderWidth = parseFloat(cs.borderTopWidth) || 0;
    const border = cs.borderTopStyle !== "none" && borderWidth > 0 ? parseColor(cs.borderTopColor) : null;
    if (!fill && !border) return;
    const r = this.radius(cs, rect);
    const geometry = (inset) =>
      `x="${this.x(rect.left) + inset}" y="${this.y(rect.top) + inset}" width="${round(rect.width - inset * 2)}" height="${round(rect.height - inset * 2)}"${r ? ` rx="${Math.max(0, r - inset)}"` : ""}`;
    if (fill) this.out.push(`<rect ${geometry(0)} ${paint("fill", cs.backgroundColor)}/>`);
    if (border) {
      this.out.push(
        `<rect ${geometry(borderWidth / 2)} fill="none" ${paint("stroke", cs.borderTopColor)} stroke-width="${borderWidth}"/>`,
      );
    }
  }

  icon(el, cs, rect) {
    const path = el.shadowRoot?.querySelector("path")?.getAttribute("d");
    if (!path || !rect.width) return;
    const scale = round(rect.width / 24);
    this.out.push(
      `<path transform="translate(${this.x(rect.left)} ${this.y(rect.top)}) scale(${scale})" d="${path}" ${paint("fill", cs.color)}/>`,
    );
  }

  baseline(cs, top, height) {
    this.canvas.font = `${cs.fontWeight} ${cs.fontSize} Roboto`;
    const m = this.canvas.measureText("Hg");
    const ascent = m.fontBoundingBoxAscent;
    const descent = m.fontBoundingBoxDescent;
    return top + (height - (ascent + descent)) / 2 + ascent;
  }

  textAttrs(cs) {
    const spacing = cs.letterSpacing !== "normal" && parseFloat(cs.letterSpacing) ? ` letter-spacing="${parseFloat(cs.letterSpacing)}"` : "";
    return `font-size="${parseFloat(cs.fontSize)}" font-weight="${cs.fontWeight}" ${paint("fill", cs.color)}${spacing}`;
  }

  text(node) {
    const value = node.nodeValue;
    if (!value.trim()) return;
    const parent = node.parentElement || node.parentNode.host;
    const cs = getComputedStyle(parent);
    const range = document.createRange();
    const lines = [];
    let line = null;
    for (let i = 0; i < value.length; i++) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rc = range.getClientRects()[0];
      if (!rc || rc.width === 0) continue;
      if (!line || Math.abs(rc.top - line.top) > rc.height / 2) {
        line = { top: rc.top, height: rc.height, chars: [] };
        lines.push(line);
      }
      line.chars.push({ ch: value[i], left: rc.left, right: rc.right });
    }

    // Text cut with an ellipsis by the browser: keep what fits and add "…"
    let limit = Infinity;
    if (cs.textOverflow === "ellipsis" && parent.scrollWidth > parent.clientWidth + 1) {
      const box = parent.getBoundingClientRect();
      this.canvas.font = `${cs.fontWeight} ${cs.fontSize} Roboto`;
      limit = box.left + parent.clientWidth - parseFloat(cs.paddingRight) - this.canvas.measureText("…").width;
    }

    for (const l of lines) {
      let chars = l.chars;
      let suffix = "";
      if (chars.some((c) => c.right > limit)) {
        chars = chars.filter((c) => c.right <= limit);
        suffix = "…";
      }
      const text = (chars.map((c) => c.ch).join("") + suffix).replace(/\s+/g, " ").trim();
      if (!text) continue;
      const first = chars.find((c) => c.ch.trim()) || chars[0];
      for (const ch of text) this.chars.add(ch);
      const y = this.baseline(cs, l.top, l.height);
      this.out.push(`<text x="${this.x(first.left)}" y="${this.y(y)}" ${this.textAttrs(cs)}>${escapeXml(text)}</text>`);
    }
  }

  input(el, cs, rect) {
    if (el.value || !el.placeholder) return;
    const placeholder = getComputedStyle(el, "::placeholder");
    const fontSize = parseFloat(cs.fontSize);
    const y = this.baseline(cs, rect.top + (rect.height - fontSize * 1.172) / 2, fontSize * 1.172);
    for (const ch of el.placeholder) this.chars.add(ch);
    this.out.push(
      `<text x="${this.x(rect.left + parseFloat(cs.paddingLeft))}" y="${this.y(y)}" font-size="${fontSize}" font-weight="${cs.fontWeight}" ${paint("fill", placeholder.color)}>${escapeXml(el.placeholder)}</text>`,
    );
  }

  inlineSvg(svg, rect) {
    const viewBox = svg.getAttribute("viewBox");
    this.out.push(
      `<svg x="${this.x(rect.left)}" y="${this.y(rect.top)}" width="${round(rect.width)}" height="${round(rect.height)}"${viewBox ? ` viewBox="${viewBox}"` : ""} overflow="visible">`,
    );
    [...svg.children].forEach((child) => this.svgNode(child));
    this.out.push("</svg>");
  }

  svgNode(el) {
    if (el.localName === "title") return;
    const cs = getComputedStyle(el);
    if (cs.display === "none") return;
    const attrs = SVG_ATTRS.filter((a) => el.hasAttribute(a)).map((a) => `${a}="${el.getAttribute(a)}"`);
    const styles = [];
    for (const prop of SVG_STYLES) {
      let value = cs.getPropertyValue(prop);
      if (!value) continue;
      if (prop === "fill" || prop === "stroke") {
        const color = parseColor(value);
        styles.push(color ? `${prop}="${color.hex}"` : `${prop}="none"`);
        if (color && color.alpha < 1) {
          const own = Number(cs.getPropertyValue(`${prop}-opacity`) || 1);
          styles.push(`${prop}-opacity="${round(color.alpha * own)}"`);
        }
        continue;
      }
      if ((prop === "fill-opacity" || prop === "stroke-opacity") && styles.some((s) => s.startsWith(`${prop}=`))) continue;
      if (prop === "fill-opacity" || prop === "stroke-opacity" || prop === "opacity") {
        if (Number(value) === 1) continue;
      }
      if (prop === "stroke-dasharray" && value === "none") continue;
      if (prop === "stroke-linecap" && value === "butt") continue;
      if (prop === "text-anchor" && value === "start") continue;
      if (prop === "dominant-baseline" && value === "auto") continue;
      if ((prop === "font-size" || prop === "font-weight") && el.localName !== "text") continue;
      value = value.replace(/px/g, "");
      styles.push(`${prop}="${value}"`);
    }
    const tag = el.localName;
    if (tag === "text") {
      const text = el.textContent;
      for (const ch of text) this.chars.add(ch);
      this.out.push(`<text ${[...attrs, ...styles].join(" ")}>${escapeXml(text)}</text>`);
    } else if (tag === "g") {
      this.out.push(`<g ${attrs.join(" ")}>`);
      [...el.children].forEach((child) => this.svgNode(child));
      this.out.push("</g>");
    } else {
      this.out.push(`<${tag} ${[...attrs, ...styles].join(" ")}/>`);
    }
  }
}

// Fetches a Roboto subset with just the glyphs in use and returns @font-face rules
export async function embeddedFonts(chars, weights = [400, 500]) {
  const text = encodeURIComponent([...chars].sort().join(""));
  const url = `https://fonts.googleapis.com/css2?family=Roboto:wght@${weights.join(";")}&text=${text}`;
  const css = await fetch(url).then((r) => r.text());
  const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => m[1]);
  const rules = [];
  for (const face of faces) {
    const weight = face.match(/font-weight:\s*(\d+)/)?.[1];
    const src = face.match(/url\(([^)]+)\)\s*format\('(\w+)'\)/);
    if (!weight || !src) continue;
    const buffer = await fetch(src[1]).then((r) => r.arrayBuffer());
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    rules.push(
      `@font-face{font-family:'Roboto';font-style:normal;font-weight:${weight};src:url(data:font/${src[2]};base64,${btoa(binary)}) format('${src[2]}')}`,
    );
  }
  return rules.join("");
}

// Transparent document: only the cards, nothing around them
export function document_({ width, height, body, fonts }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${round(width)}" height="${round(height)}" viewBox="0 0 ${round(width)} ${round(height)}" font-family="Roboto, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif">
<defs>
<style>${fonts}</style>
</defs>
${body}
</svg>
`;
}
