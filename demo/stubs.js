// Minimal stand-ins for ha-card and ha-icon, only for previews outside Home Assistant
import * as mdi from "https://cdn.jsdelivr.net/npm/@mdi/js@7.4.47/+esm";

const toKey = (icon) =>
  "mdi" +
  icon
    .replace(/^mdi:/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

class HaIcon extends HTMLElement {
  static get observedAttributes() {
    return ["icon"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  _render() {
    const path = mdi[toKey(this.getAttribute("icon") || "")] || mdi.mdiHelpCircleOutline;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-flex; align-items: center; justify-content: center; flex: none; vertical-align: middle;
          width: var(--mdc-icon-size, 24px); height: var(--mdc-icon-size, 24px); }
        svg { width: 100%; height: 100%; fill: currentColor; display: block; }
      </style>
      <svg viewBox="0 0 24 24"><path d="${path}"></path></svg>`;
  }
}

class HaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          box-sizing: border-box;
          background: var(--ha-card-background, var(--card-background-color, #fff));
          border-radius: var(--ha-card-border-radius, 12px);
          border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
          box-shadow: var(--ha-card-box-shadow, none);
          color: var(--primary-text-color);
        }
      </style>
      <slot></slot>`;
  }
}

customElements.define("ha-icon", HaIcon);
customElements.define("ha-card", HaCard);
