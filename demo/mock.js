// A fake `hass` object built from demo fixtures, with simulated services and scenarios.
// Used by the demo page and by the SVG renderer.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => new Date(Date.now()).toISOString();

const HOB_ZONE_IDS = { FrontLeft: "100", Left: "120", RearLeft: "200", RearRight: "300", Right: "340", FrontRight: "400" };

export class MockStore {
  static async load() {
    const data = await fetch(new URL("./fixtures.json", import.meta.url)).then((r) => r.json());
    return new MockStore(data);
  }

  constructor(data) {
    this.translations = data.translations;
    this.base = {};
    this.entities = {};
    this.devices = {};
    this.keys = {};
    this.listeners = new Set();
    this.lang = "en";
    this.dark = false;
    for (const device of data.devices) this.devices[device.id] = device;
    const time = now();
    for (const e of data.entities) {
      this.base[e.entity_id] = {
        entity_id: e.entity_id,
        state: String(e.state),
        attributes: e.attributes || {},
        last_changed: time,
        last_updated: time,
        context: { id: "", parent_id: null, user_id: null },
      };
      this.entities[e.entity_id] = {
        entity_id: e.entity_id,
        device_id: e.device_id,
        platform: "homeconnect_ws",
        translation_key: e.key,
        entity_category: e.category ?? null,
      };
      (this.keys[e.device_id] ??= {})[e.key] = e.entity_id;
    }
    this.states = structuredClone(this.base);
    this.build();
  }

  device(model) {
    return Object.values(this.devices).find((d) => d.model === model);
  }

  eid(deviceId, key) {
    return this.keys[deviceId]?.[key];
  }

  setId(entityId, state, attributes = {}) {
    const old = this.states[entityId];
    if (!old) return;
    const value = String(state);
    this.states[entityId] = {
      ...old,
      state: value,
      attributes: { ...old.attributes, ...attributes },
      last_changed: old.state === value ? old.last_changed : now(),
      last_updated: now(),
    };
  }

  set(deviceId, key, state, attributes) {
    const entityId = this.eid(deviceId, key);
    if (entityId) this.setId(entityId, state, attributes);
  }

  reset(deviceId) {
    for (const [entityId, entry] of Object.entries(this.entities)) {
      if (entry.device_id === deviceId) this.states[entityId] = structuredClone(this.base[entityId]);
    }
  }

  scenario(model, name) {
    const device = this.device(model);
    this.reset(device.id);
    SCENARIOS[model][name][1](this, device.id);
  }

  subscribe(fn) {
    this.listeners.add(fn);
  }

  emit() {
    this.build();
    for (const fn of this.listeners) fn(this.hass);
  }

  build() {
    const lang = this.lang;
    this.hass = {
      states: { ...this.states },
      entities: this.entities,
      devices: this.devices,
      areas: {},
      services: { homeconnect_ws: { start_program: {}, start_hob_program: {} } },
      language: lang,
      locale: { language: lang, number_format: "language", time_format: "language" },
      themes: { darkMode: this.dark },
      config: { unit_system: { temperature: "°C" }, version: "2026.9.4" },
      user: { name: "Demo", is_admin: true },
      formatEntityState: (stateObj, state) => this.format(stateObj, state),
      callService: (domain, service, data) => this.callService(domain, service, data),
      callWS: async () => ({}),
    };
  }

  format(stateObj, state) {
    const value = state ?? stateObj.state;
    const it = this.lang === "it";
    if (value === "unavailable") return it ? "Non disponibile" : "Unavailable";
    if (value === "unknown") return it ? "Sconosciuto" : "Unknown";
    const domain = stateObj.entity_id.split(".")[0];
    const key = this.entities[stateObj.entity_id]?.translation_key;
    const translated = this.translations[this.lang]?.[domain]?.[key]?.[value];
    if (translated) return translated;
    if (domain === "binary_sensor" || domain === "switch") return value === "on" ? (it ? "Acceso" : "On") : it ? "Spento" : "Off";
    const n = Number(value);
    const unit = stateObj.attributes.unit_of_measurement;
    if (value !== "" && Number.isFinite(n)) {
      const digits = unit === "kWh" ? 2 : unit === "L" ? 0 : 1;
      const text = new Intl.NumberFormat(this.lang, { maximumFractionDigits: digits }).format(n);
      return unit ? `${text}${unit === "%" ? "" : " "}${unit}` : text;
    }
    return value;
  }

  // --- Simulated services ----------------------------------------------------

  async callService(domain, service, data) {
    this.onCall?.({ domain, service, data });
    await sleep(350);
    const entityId = data.entity_id;
    const entry = this.entities[entityId];
    if (domain === "switch") {
      const current = this.states[entityId].state;
      const next = service === "toggle" ? (current === "on" ? "off" : "on") : service === "turn_on" ? "on" : "off";
      this.setId(entityId, next);
      if (entry.translation_key === "switch_power_state") this.power(entry.device_id, next === "on");
    } else if (domain === "select") {
      this.setId(entityId, data.option);
    } else if (domain === "number") {
      this.setId(entityId, data.value);
    } else if (domain === "button") {
      this.setId(entityId, now());
      this.button(entry.device_id, entry.translation_key);
    } else if (domain === "homeconnect_ws" && service === "start_program") {
      const d = data.device_id;
      const hours = (data.start_in?.hours ?? 0) + (data.start_in?.minutes ?? 0) / 60;
      if (hours > 0) {
        this.set(d, "sensor_operation_state", "DelayedStart");
        this.set(d, "sensor_start_in", hours.toFixed(2));
      } else {
        this.button(d, "button_start_program");
      }
    } else if (domain === "homeconnect_ws" && service === "start_hob_program") {
      const d = data.device_id;
      const id = HOB_ZONE_IDS[data.zone];
      const index = Number(data.power_level);
      const level = index === 0 ? "Off" : index === 1 ? "KeepWarm" : index === 20 ? "Boost1" : index === 21 ? "Boost2" : String(index * 5);
      zone(this, d, id, index === 0 ? "residuelheat" : "active", level, data.duration || 0);
    }
    this.emit();
  }

  power(d, on) {
    this.set(d, "sensor_power_state", on ? "on" : this.devices[d].model === "Oven" ? "standby" : "off");
    this.set(d, "sensor_operation_state", on ? "Ready" : "Inactive");
    if (on) this.set(d, "binary_sensor_remote_control_active", "on");
  }

  button(d, key) {
    const selected = this.states[this.eid(d, "select_program")]?.state;
    if (key === "button_start_program") {
      this.set(d, "sensor_operation_state", "Run");
      this.set(d, "sensor_active_program", selected);
      this.set(d, "sensor_program_progress", 2);
      if (this.devices[d].model === "Washer") this.set(d, "sensor_door_state", "locked");
    } else if (key === "button_abort_program") {
      this.set(d, "sensor_operation_state", "Ready");
      this.set(d, "sensor_active_program", "unknown");
      this.set(d, "sensor_program_progress", 0);
      this.set(d, "sensor_start_in", 0);
    } else if (key === "button_oven_pause") {
      this.set(d, "sensor_operation_state", "Pause");
    } else if (key === "button_oven_resume") {
      this.set(d, "sensor_operation_state", "Run");
    }
  }
}

// --- Scenarios -----------------------------------------------------------------

const on = (s, d) => {
  s.set(d, "switch_power_state", "on");
  s.set(d, "sensor_power_state", "on");
  s.set(d, "sensor_operation_state", "Ready");
  s.set(d, "binary_sensor_remote_control_active", "on");
  for (const key of ["button_start_program", "button_abort_program", "button_oven_pause", "button_oven_resume"]) {
    s.set(d, key, "unknown");
  }
};

const washerReady = (s, d) => {
  on(s, d);
  s.set(d, "select_program", "laundrycare_washer_program_cotton_cotton_cotton");
  s.set(d, "sensor_door_state", "closed");
  s.set(d, "binary_sensor_door_state", "off");
  s.set(d, "switch_laundry_speed_perfect", "off");
  s.set(d, "switch_laundry_silent_mode", "on");
  s.set(d, "switch_child_lock", "off");
  s.set(d, "number_duration", 7200);
  s.set(d, "sensor_remaining_program_time", "2.98", { "Is Estimated": true });
  s.set(d, "sensor_laundry_spin_speed", "rpm1400");
  s.set(d, "sensor_program_progress", 0);
};

const washerRun = (s, d) => {
  washerReady(s, d);
  s.set(d, "sensor_operation_state", "Run");
  s.set(d, "sensor_active_program", "laundrycare_washer_program_cotton_cotton_cotton");
  s.set(d, "sensor_program_progress", 62);
  s.set(d, "sensor_remaining_program_time", "1.4");
  s.set(d, "sensor_laundry_process_phase", "rinsing");
  s.set(d, "sensor_door_state", "locked");
  s.set(d, "sensor_laundry_reload", "impossible");
};

const dishReady = (s, d) => {
  on(s, d);
  s.set(d, "select_program", "dishcare_dishwasher_program_eco50");
  s.set(d, "binary_sensor_door_state", "off");
  s.set(d, "sensor_remaining_program_time", "3.83", { "Is Estimated": true });
  s.set(d, "switch_half_load", "off");
  s.set(d, "switch_hygiene_plus", "off");
  s.set(d, "switch_vario_speed_plus", "on");
  s.set(d, "number_oven_start_in_relative", 0);
};

const ovenReady = (s, d) => {
  on(s, d);
  s.set(d, "select_program", "cooking_oven_program_heatingmode_3dhotair");
  s.set(d, "number_oven_setpoint_temperature", 180);
  s.set(d, "sensor_oven_current_temperature", 24);
  s.set(d, "number_duration", 3600);
  s.set(d, "switch_oven_fast_pre_heat", "off");
  s.set(d, "switch_oven_cavity_light", "off");
};

const ovenRun = (s, d, current, elapsed, remaining, progress) => {
  ovenReady(s, d);
  s.set(d, "sensor_operation_state", "Run");
  s.set(d, "sensor_active_program", "cooking_oven_program_heatingmode_3dhotair");
  s.set(d, "sensor_oven_current_temperature", current);
  s.set(d, "sensor_elapsed_program_time", elapsed);
  s.set(d, "sensor_remaining_program_time", remaining);
  s.set(d, "sensor_program_progress", progress);
  s.set(d, "switch_oven_cavity_light", "on");
};

function zone(s, d, id, state, level = "Off", remaining = 0) {
  s.set(d, `sensor_hob_zone_${id}_state`, state);
  s.set(d, `sensor_hob_zone_${id}_power_level`, level);
  s.set(d, `sensor_hob_zone_${id}_remaining_time`, remaining);
  s.set(d, `binary_sensor_hob_zone_${id}_residual_heat`, state === "residuelheat" ? "on" : "off");
}

const hobOn = (s, d) => {
  on(s, d);
  s.set(d, "sensor_operation_state", "Run");
};

// [label, apply]
export const SCENARIOS = {
  Washer: {
    off: ["Off", () => {}],
    ready: ["Ready", washerReady],
    run: ["Running", washerRun],
    pause: [
      "Paused",
      (s, d) => {
        washerRun(s, d);
        s.set(d, "sensor_operation_state", "Pause");
        s.set(d, "sensor_laundry_reload", "possiblepauseprogram");
      },
    ],
    foam: [
      "Foam alert",
      (s, d) => {
        washerRun(s, d);
        s.set(d, "binary_sensor_foam_detection", "on");
      },
    ],
    offline: ["Disconnected", (s, d) => s.set(d, "connection", "off")],
    done: [
      "Finished",
      (s, d) => {
        washerReady(s, d);
        s.set(d, "sensor_operation_state", "Finished");
        s.set(d, "sensor_active_program", "laundrycare_washer_program_cotton_cotton_cotton");
        s.set(d, "sensor_program_progress", 100);
        s.set(d, "sensor_remaining_program_time", 0);
      },
    ],
  },
  Dishwasher: {
    off: ["Off", () => {}],
    ready: ["Ready", dishReady],
    delayed: [
      "Delayed start",
      (s, d) => {
        dishReady(s, d);
        s.set(d, "sensor_operation_state", "DelayedStart");
        s.set(d, "sensor_start_in", "2.5");
        s.set(d, "number_oven_start_in_relative", 9000);
      },
    ],
    run: [
      "Running",
      (s, d) => {
        dishReady(s, d);
        s.set(d, "sensor_operation_state", "Run");
        s.set(d, "sensor_active_program", "dishcare_dishwasher_program_eco50");
        s.set(d, "sensor_program_phase", "MainWash");
        s.set(d, "sensor_program_progress", 35);
        s.set(d, "sensor_remaining_program_time", "2.5");
        s.set(d, "sensor_salt", "nearly_empty");
      },
    ],
    salt: [
      "Salt empty",
      (s, d) => {
        dishReady(s, d);
        s.set(d, "sensor_operation_state", "Run");
        s.set(d, "sensor_active_program", "dishcare_dishwasher_program_auto2");
        s.set(d, "select_program", "dishcare_dishwasher_program_auto2");
        s.set(d, "sensor_program_phase", "FinalRinse");
        s.set(d, "sensor_program_progress", 78);
        s.set(d, "sensor_remaining_program_time", "0.6");
        s.set(d, "sensor_salt", "empty");
      },
    ],
    done: [
      "Finished",
      (s, d) => {
        dishReady(s, d);
        s.set(d, "sensor_operation_state", "Finished");
        s.set(d, "sensor_active_program", "dishcare_dishwasher_program_eco50");
        s.set(d, "sensor_rinse_aid", "empty");
        s.set(d, "sensor_program_progress", 100);
      },
    ],
  },
  Oven: {
    off: ["Off", () => {}],
    ready: ["Ready", ovenReady],
    preheat: [
      "Preheating",
      (s, d) => {
        ovenRun(s, d, 128, 420, "0.88", 12);
        s.set(d, "switch_oven_fast_pre_heat", "on");
      },
    ],
    cook: [
      "Cooking",
      (s, d) => {
        ovenRun(s, d, 181, 1800, "0.5", 50);
        s.set(d, "binary_sensor_oven_turn_food_now", "on");
      },
    ],
    food: [
      "Insert food",
      (s, d) => {
        ovenRun(s, d, 200, 600, "0.75", 15);
        s.set(d, "sensor_active_program", "cooking_oven_program_heatingmode_pizzasetting");
        s.set(d, "select_program", "cooking_oven_program_heatingmode_pizzasetting");
        s.set(d, "number_oven_setpoint_temperature", 200);
        s.set(d, "binary_sensor_oven_regular_preheat_finished", "on");
        s.set(d, "binary_sensor_oven_insert_food_now", "on");
      },
    ],
    dish: [
      "Recipe",
      (s, d) => {
        ovenReady(s, d);
        s.set(d, "select_program", "cooking_oven_program_dish_automatic_conv_turkeybreast");
        s.set(d, "number_oven_weight", 1200);
      },
    ],
    done: [
      "Finished",
      (s, d) => {
        ovenReady(s, d);
        s.set(d, "sensor_operation_state", "Finished");
        s.set(d, "sensor_active_program", "cooking_oven_program_heatingmode_3dhotair");
        s.set(d, "sensor_oven_current_temperature", 176);
        s.set(d, "binary_sensor_oven_program_finished", "on");
      },
    ],
  },
  Hob: {
    off: ["Off", () => {}],
    residual: [
      "Residual heat",
      (s, d) => {
        zone(s, d, "100", "residuelheat");
        zone(s, d, "300", "residuelheat");
      },
    ],
    cook: [
      "Cooking",
      (s, d) => {
        hobOn(s, d);
        zone(s, d, "400", "active", "70", 600);
        zone(s, d, "200", "active", "Boost1");
        zone(s, d, "100", "residuelheat");
      },
    ],
    confirm: [
      "Confirm on hob",
      (s, d) => {
        hobOn(s, d);
        zone(s, d, "100", "active", "90", 300);
        zone(s, d, "300", "active", "35");
        s.set(d, "sensor_confirm_action_at_appliance", "confirm_action_at_appliance");
      },
    ],
    flex: [
      "Flex zone",
      (s, d) => {
        hobOn(s, d);
        zone(s, d, "120", "active", "45", 1500);
        zone(s, d, "100", "notselectable");
        zone(s, d, "200", "notselectable");
        zone(s, d, "300", "active", "KeepWarm");
      },
    ],
  },
};
