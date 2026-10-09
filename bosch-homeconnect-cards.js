/*
 * Bosch Home Connect cards for Home Assistant
 * https://github.com/fabioscarparo/bosch-homeconnect-cards
 *
 * Four Lovelace cards for the appliances of the Home Connect Local
 * integration (homeconnect_ws): washer, dishwasher, oven and induction hob.
 * Entities are looked up from the device by their translation_key,
 * so the cards keep working when entity_ids are renamed.
 *
 * MIT License - Copyright (c) 2026 Fabio Scarparo
 */

const VERSION = "0.1.0";
const DOMAIN = "homeconnect_ws";
const UNAVAILABLE = new Set(["unavailable", "unknown"]);

const KINDS = {
  washer: {
    tag: "homeconnect-washer-card",
    models: ["Washer", "WasherDryer", "Dryer"],
    icon: "mdi:washing-machine",
    programIcon: "mdi:tshirt-crew-outline",
    color: "blue",
  },
  dishwasher: {
    tag: "homeconnect-dishwasher-card",
    models: ["Dishwasher"],
    icon: "mdi:dishwasher",
    programIcon: "mdi:silverware-fork-knife",
    color: "cyan",
  },
  oven: {
    tag: "homeconnect-oven-card",
    models: ["Oven"],
    icon: "mdi:stove",
    programIcon: "mdi:chef-hat",
    color: "deep-orange",
  },
  hob: {
    tag: "homeconnect-hob-card",
    models: ["Hob"],
    icon: "mdi:pot-steam-outline",
    programIcon: "mdi:pot-steam-outline",
    color: "orange",
  },
};

// ---------------------------------------------------------------------------
// Strings
// ---------------------------------------------------------------------------

const STRINGS = {
  it: {
    op: {
      Inactive: "Inattivo",
      Ready: "Pronto",
      DelayedStart: "Avvio programmato",
      Run: "In funzione",
      Pause: "In pausa",
      ActionRequired: "Azione richiesta",
      Finished: "Terminato",
      Error: "Errore",
      Aborting: "Interruzione in corso",
    },
    off: "Spento",
    offline: "Non connesso",
    offline_hint: "L'elettrodomestico non è raggiungibile in rete",
    program: "Programma",
    choose_program: "Scegli un programma",
    search: "Cerca un programma",
    no_results: "Nessun programma trovato",
    start: "Avvia",
    start_delayed: "Avvia tra {t}",
    pause: "Pausa",
    resume: "Riprendi",
    stop: "Interrompi",
    power_on: "Accendi",
    power: "Accensione",
    settings: "Impostazioni del dispositivo",
    estimated: "Durata stimata",
    remaining: "Rimanente",
    starts_in: "Avvio tra",
    ends_at: "Fine alle {t}",
    finished_at: "Terminato alle {t}",
    elapsed: "Trascorso",
    end: "Fine",
    duration: "Durata",
    delay: "Avvio ritardato",
    none: "No",
    temperature: "Temperatura",
    current: "Attuale {v}",
    weight: "Peso",
    level: "Livello",
    pyrolysis_level: "Livello pirolisi",
    preheating: "Preriscaldamento",
    last_cycle: "Ultimo ciclo",
    forecast_energy: "Energia prevista",
    forecast_water: "Acqua prevista",
    salt: "Sale",
    rinse_aid: "Brillantante",
    supply: { empty: "Esaurito", nearly_empty: "Quasi finito", full: "OK" },
    door: { open: "Porta aperta", closed: "Porta chiusa", locked: "Porta bloccata", ajar: "Porta socchiusa" },
    spin: "Centrifuga",
    alert: {
      foam: "Rilevata troppa schiuma",
      aborted: "Programma interrotto",
      insert_food: "Inserisci il cibo nel forno",
      turn_food: "È il momento di girare il cibo",
      preheat_done: "Preriscaldamento terminato",
      temp_high: "Temperatura del forno troppo alta",
      confirm: "Conferma l'operazione sull'elettrodomestico",
      open_door: "Apri la porta",
      close_door: "Chiudi la porta",
      finished: "Programma terminato",
      salt: "Ricarica il sale",
      rinse_aid: "Ricarica il brillantante",
      reload: "Puoi aggiungere capi: metti in pausa e apri la porta",
      reload_now: "Puoi aprire la porta e aggiungere capi",
      error: "L'elettrodomestico segnala un errore",
    },
    hint_remote_start: "Per avviare da qui attiva l'avvio remoto sull'elettrodomestico",
    hint_remote_off: "Controllo remoto non attivo",
    hint_local: "In uso dai comandi dell'elettrodomestico",
    child_lock: "Blocco bambini",
    zones: {
      FrontLeft: "Anteriore sinistra",
      Left: "Sinistra flex",
      RearLeft: "Posteriore sinistra",
      RearRight: "Posteriore destra",
      Right: "Destra flex",
      FrontRight: "Anteriore destra",
    },
    zone_mode: { off: "Spenta", active: "Accesa", residual: "Calore residuo", unselectable: "Non selezionabile" },
    zones_all_off: "Tutte le zone spente",
    power_level: "Livello di potenza",
    keep_warm: "Caldo",
    timer: "Timer",
    zone_start: "Accendi zona",
    zone_stop: "Spegni zona",
    zone_note: "Funziona solo con il piano acceso e il controllo remoto attivo",
    zone_unsupported: "Per comandare le zone serve il servizio homeconnect_ws.start_hob_program",
    groups: {
      favorite: "Preferiti",
      heatingmode: "Modalità di cottura",
      dish_automatic: "Programmi automatici",
      dish_recommendation: "Ricette consigliate",
      cleaning: "Pulizia",
      subsequentmode: "Dopo la cottura",
      other: "Programmi",
    },
    favorite: "Preferito {n}",
    phase: { None: "", PreRinse: "Prelavaggio", MainWash: "Lavaggio", FinalRinse: "Risciacquo finale", Drying: "Asciugatura" },
    no_device: "Scegli un elettrodomestico nell'editor della scheda",
    device_missing: "Elettrodomestico non trovato",
    error: "Comando non riuscito: {e}",
    editor: {
      device_id: "Elettrodomestico",
      name: "Nome",
      color: "Colore",
      hide_hero: "Vista compatta",
    },
    card: {
      washer: "Lavatrice",
      dishwasher: "Lavastoviglie",
      oven: "Forno",
      hob: "Piano a induzione",
      description: "Stato e comandi di un elettrodomestico Bosch Home Connect",
    },
  },
  en: {
    op: {
      Inactive: "Inactive",
      Ready: "Ready",
      DelayedStart: "Delayed start",
      Run: "Running",
      Pause: "Paused",
      ActionRequired: "Action required",
      Finished: "Finished",
      Error: "Error",
      Aborting: "Aborting",
    },
    off: "Off",
    offline: "Disconnected",
    offline_hint: "The appliance can't be reached on the network",
    program: "Program",
    choose_program: "Choose a program",
    search: "Search programs",
    no_results: "No programs found",
    start: "Start",
    start_delayed: "Start in {t}",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    power_on: "Turn on",
    power: "Power",
    settings: "Device settings",
    estimated: "Estimated duration",
    remaining: "Remaining",
    starts_in: "Starts in",
    ends_at: "Ends at {t}",
    finished_at: "Finished at {t}",
    elapsed: "Elapsed",
    end: "Ends",
    duration: "Duration",
    delay: "Delayed start",
    none: "Off",
    temperature: "Temperature",
    current: "Currently {v}",
    weight: "Weight",
    level: "Level",
    pyrolysis_level: "Pyrolysis level",
    preheating: "Preheating",
    last_cycle: "Last cycle",
    forecast_energy: "Expected energy",
    forecast_water: "Expected water",
    salt: "Salt",
    rinse_aid: "Rinse aid",
    supply: { empty: "Empty", nearly_empty: "Low", full: "OK" },
    door: { open: "Door open", closed: "Door closed", locked: "Door locked", ajar: "Door ajar" },
    spin: "Spin",
    alert: {
      foam: "Too much foam detected",
      aborted: "Program aborted",
      insert_food: "Put the food in the oven",
      turn_food: "Time to turn the food",
      preheat_done: "Preheating finished",
      temp_high: "Oven temperature too high",
      confirm: "Confirm the action on the appliance",
      open_door: "Open the door",
      close_door: "Close the door",
      finished: "Program finished",
      salt: "Refill the salt",
      rinse_aid: "Refill the rinse aid",
      reload: "You can add laundry: pause and open the door",
      reload_now: "You can open the door and add laundry",
      error: "The appliance reports an error",
    },
    hint_remote_start: "Enable remote start on the appliance to start it from here",
    hint_remote_off: "Remote control is not active",
    hint_local: "In use from the appliance controls",
    child_lock: "Child lock",
    zones: {
      FrontLeft: "Front left",
      Left: "Left flex",
      RearLeft: "Rear left",
      RearRight: "Rear right",
      Right: "Right flex",
      FrontRight: "Front right",
    },
    zone_mode: { off: "Off", active: "On", residual: "Residual heat", unselectable: "Not selectable" },
    zones_all_off: "All zones are off",
    power_level: "Power level",
    keep_warm: "Warm",
    timer: "Timer",
    zone_start: "Turn zone on",
    zone_stop: "Turn zone off",
    zone_note: "Works only with the hob on and remote control active",
    zone_unsupported: "Zone control needs the homeconnect_ws.start_hob_program service",
    groups: {
      favorite: "Favorites",
      heatingmode: "Heating modes",
      dish_automatic: "Automatic programs",
      dish_recommendation: "Recommended dishes",
      cleaning: "Cleaning",
      subsequentmode: "After cooking",
      other: "Programs",
    },
    favorite: "Favorite {n}",
    phase: { None: "", PreRinse: "Pre-rinse", MainWash: "Main wash", FinalRinse: "Final rinse", Drying: "Drying" },
    no_device: "Choose an appliance in the card editor",
    device_missing: "Appliance not found",
    error: "Command failed: {e}",
    editor: {
      device_id: "Appliance",
      name: "Name",
      color: "Color",
      hide_hero: "Compact view",
    },
    card: {
      washer: "Washer",
      dishwasher: "Dishwasher",
      oven: "Oven",
      hob: "Induction hob",
      description: "Status and controls for a Bosch Home Connect appliance",
    },
  },
};

// Program names: the integration doesn't translate all of them, so the cards ship their own.
// The key is the last meaningful part of the program (see programInfo).
const PROGRAM_LABELS = {
  it: {
    // Washer
    cotton: "Cotone",
    darkwash: "Capi scuri",
    delicatessilk: "Delicati/Seta",
    delicatessilkmp: "Delicati/Seta MP",
    drumclean70: "Pulizia cesto 70°",
    easycare: "Sintetici",
    goldencycle: "Golden Cycle",
    eco4060: "Eco 40-60",
    mix: "Misti",
    outdoor: "Outdoor",
    rinse: "Risciacquo",
    sensitive: "Sensitive",
    shirtsblouses: "Camicie",
    sportfitness: "Sport/Fitness",
    spindrain: "Centrifuga/Scarico",
    steaming: "Vapore",
    super1530: "Super 15'/30'",
    wool: "Lana",
    // Dishwasher
    auto1: "Auto 35-45°",
    auto2: "Auto 45-65°",
    auto3: "Auto 65-75°",
    eco50: "Eco 50°",
    glas40: "Delicato 40°",
    intensiv70: "Intensivo 70°",
    intensivpower: "Intensive Power",
    kurz60: "Breve 60°",
    machinecare: "Cura macchina",
    mixedload: "Carico misto",
    nightwash: "Notte",
    prerinse: "Prerisciacquo",
    quick45: "Veloce 45°",
    quick65: "Veloce 65°",
    quickd: "Quick D",
    super60: "Super 60°",
    // Oven, heating modes
    "3dhotair": "Aria calda 3D",
    airfry: "Air Fry",
    bottomheating: "Calore inferiore",
    defrost: "Scongelamento",
    grilllargearea: "Grill superficie grande",
    grillsmallarea: "Grill superficie piccola",
    hotairgentle: "Aria calda delicata",
    hotairgrilling: "Grill ventilato",
    keepwarm: "Mantenere in caldo",
    letrest: "Riposo",
    pizzasetting: "Funzione pizza",
    preheating: "Preriscaldamento",
    preheatovenware: "Preriscaldare le stoviglie",
    slowcook: "Cottura lenta",
    topbottomheating: "Statico",
    topbottomheatingeco: "Statico eco",
    // Oven, cleaning
    drying: "Asciugatura",
    easyclean: "EasyClean",
    pyrolysis: "Pirolisi",
    // Oven, after cooking
    "subsequentmode:continuecooking": "Continua la cottura",
    "subsequentmode:keepwarm": "Mantieni in caldo",
    "subsequentmode:leavetorest": "Lascia riposare",
    "subsequentmode:startbaking": "Avvia la cottura",
    // Oven, dishes
    belly: "Pancetta di maiale",
    bonelesslegoflambmedium: "Cosciotto d'agnello disossato, medio",
    bonelessporkneckjoint: "Coppa di maiale disossata",
    gooselegs: "Cosce d'oca",
    jointofporkwithcracklingegshoulder: "Spalla di maiale con cotenna",
    jointofveallean: "Arrosto di vitello magro",
    jointofvealmarbled: "Arrosto di vitello marezzato",
    legoflambonthebonewelldone: "Cosciotto d'agnello con osso, ben cotto",
    meatloafmadefromfreshmincedmeat: "Polpettone",
    pavlova: "Pavlova",
    potroastedbeef: "Brasato di manzo",
    roastporkloin: "Lombata di maiale arrosto",
    sirloinmedium: "Controfiletto, medio",
    sirloinrare: "Controfiletto, al sangue",
    slowroastjoint: "Arrosto a bassa temperatura",
    stewwithmeat: "Spezzatino di carne",
    stewwithvegetables: "Stufato di verdure",
    turkeybreast: "Petto di tacchino",
    unstuffedduck: "Anatra non farcita",
    unstuffedsmallturkey: "Tacchino piccolo non farcito",
    vealossobuco: "Ossobuco di vitello",
    bakesavouryfreshcookedingredients: "Sformato salato",
    bonlessrolledshoulder: "Spalla arrotolata disossata",
    chickenparts: "Pezzi di pollo",
    chips: "Patatine",
    freshlasagne: "Lasagne fresche",
    fruitcrumble: "Crumble di frutta",
    halvedchicken: "Mezzo pollo",
    loinjoint: "Arrosto di lombo",
    muffins: "Muffin",
    partcookedbreadrollsorbaguette: "Panini o baguette precotti",
    pizzathickcrust1slicefrozen: "Pizza alta surgelata",
    pizzathincrust1slice: "Pizza sottile",
    porkroast: "Arrosto di maiale",
    potatogratinrawingredients4cmdeep: "Gratin di patate",
    roastwholefish: "Pesce intero al forno",
    scones: "Scones",
    topsideandtoprump: "Girello e scamone",
    turkeycrownbritishstyle: "Petto di tacchino all'inglese",
    wholebakedpotatoes: "Patate intere al forno",
    // Hob
    powerlevelmode: "Livello di potenza",
  },
  en: {
    cotton: "Cotton",
    darkwash: "Dark wash",
    delicatessilk: "Delicates/Silk",
    delicatessilkmp: "Delicates/Silk MP",
    drumclean70: "Drum clean 70°",
    easycare: "Easy-care",
    goldencycle: "Golden Cycle",
    eco4060: "Eco 40-60",
    mix: "Mixed load",
    outdoor: "Outdoor",
    rinse: "Rinse",
    sensitive: "Sensitive",
    shirtsblouses: "Shirts",
    sportfitness: "Sportswear",
    spindrain: "Spin/Drain",
    steaming: "Steam",
    super1530: "Super 15'/30'",
    wool: "Wool",
    auto1: "Auto 35-45°",
    auto2: "Auto 45-65°",
    auto3: "Auto 65-75°",
    eco50: "Eco 50°",
    glas40: "Glass 40°",
    intensiv70: "Intensive 70°",
    intensivpower: "Intensive Power",
    kurz60: "Short 60°",
    machinecare: "Machine care",
    mixedload: "Mixed load",
    nightwash: "Night wash",
    prerinse: "Pre-rinse",
    quick45: "Quick 45°",
    quick65: "Quick 65°",
    quickd: "Quick D",
    super60: "Super 60°",
    "3dhotair": "3D hot air",
    airfry: "Air fry",
    bottomheating: "Bottom heat",
    defrost: "Defrost",
    grilllargearea: "Full surface grill",
    grillsmallarea: "Centre surface grill",
    hotairgentle: "Hot air gentle",
    hotairgrilling: "Hot air grilling",
    keepwarm: "Keep warm",
    letrest: "Let rest",
    pizzasetting: "Pizza setting",
    preheating: "Preheating",
    preheatovenware: "Preheat ovenware",
    slowcook: "Slow cook",
    topbottomheating: "Top/bottom heat",
    topbottomheatingeco: "Top/bottom heat eco",
    drying: "Drying",
    easyclean: "EasyClean",
    pyrolysis: "Pyrolysis",
    "subsequentmode:continuecooking": "Continue cooking",
    "subsequentmode:keepwarm": "Keep warm",
    "subsequentmode:leavetorest": "Leave to rest",
    "subsequentmode:startbaking": "Start baking",
    belly: "Pork belly",
    bonelesslegoflambmedium: "Boneless leg of lamb, medium",
    bonelessporkneckjoint: "Boneless pork neck joint",
    gooselegs: "Goose legs",
    jointofporkwithcracklingegshoulder: "Pork shoulder with crackling",
    jointofveallean: "Lean joint of veal",
    jointofvealmarbled: "Marbled joint of veal",
    legoflambonthebonewelldone: "Leg of lamb on the bone, well done",
    meatloafmadefromfreshmincedmeat: "Meatloaf",
    pavlova: "Pavlova",
    potroastedbeef: "Pot-roasted beef",
    roastporkloin: "Roast pork loin",
    sirloinmedium: "Sirloin, medium",
    sirloinrare: "Sirloin, rare",
    slowroastjoint: "Slow roast joint",
    stewwithmeat: "Meat stew",
    stewwithvegetables: "Vegetable stew",
    turkeybreast: "Turkey breast",
    unstuffedduck: "Unstuffed duck",
    unstuffedsmallturkey: "Unstuffed small turkey",
    vealossobuco: "Veal ossobuco",
    bakesavouryfreshcookedingredients: "Savoury bake",
    bonlessrolledshoulder: "Boneless rolled shoulder",
    chickenparts: "Chicken pieces",
    chips: "Chips",
    freshlasagne: "Fresh lasagne",
    fruitcrumble: "Fruit crumble",
    halvedchicken: "Halved chicken",
    loinjoint: "Loin joint",
    muffins: "Muffins",
    partcookedbreadrollsorbaguette: "Part-baked rolls or baguette",
    pizzathickcrust1slicefrozen: "Frozen thick-crust pizza",
    pizzathincrust1slice: "Thin-crust pizza",
    porkroast: "Pork roast",
    potatogratinrawingredients4cmdeep: "Potato gratin",
    roastwholefish: "Whole roast fish",
    scones: "Scones",
    topsideandtoprump: "Topside and top rump",
    turkeycrownbritishstyle: "Turkey crown",
    wholebakedpotatoes: "Whole baked potatoes",
    powerlevelmode: "Power level",
  },
};

// Unnamed favorites go last, after the real programs
const GROUP_ORDER = [
  "heatingmode",
  "dish_automatic",
  "dish_recommendation",
  "cleaning",
  "other",
  "favorite",
  "subsequentmode",
];

const GROUP_ICONS = {
  favorite: "mdi:heart-outline",
  heatingmode: "mdi:heat-wave",
  dish_automatic: "mdi:chef-hat",
  dish_recommendation: "mdi:book-open-variant",
  cleaning: "mdi:spray-bottle",
  subsequentmode: "mdi:timer-sand",
};

// Switches shown as program options
const OPTION_META = {
  switch_laundry_speed_perfect: { icon: "mdi:run-fast", it: "Velocità perfetta", en: "SpeedPerfect" },
  switch_laundry_silent_mode: { icon: "mdi:volume-low", it: "Silenzioso", en: "Silent" },
  switch_laundry_prewash: { icon: "mdi:water-plus-outline", it: "Prelavaggio", en: "Prewash" },
  switch_laundry_rinse_plus: { icon: "mdi:water-sync", it: "Risciacquo extra", en: "Rinse plus" },
  switch_laundry_water_plus: { icon: "mdi:water-plus", it: "Acqua extra", en: "Water plus" },
  switch_half_load: { icon: "mdi:circle-half-full", it: "Mezzo carico", en: "Half load" },
  switch_hygiene_plus: { icon: "mdi:shimmer", it: "Hygiene Plus", en: "Hygiene Plus" },
  switch_vario_speed_plus: { icon: "mdi:rabbit", it: "VarioSpeed Plus", en: "VarioSpeed Plus" },
  switch_silence_on_demand: { icon: "mdi:volume-off", it: "Silenzio su richiesta", en: "Silence on demand" },
  switch_extra_dry: { icon: "mdi:weather-sunny", it: "Asciugatura extra", en: "Extra dry" },
  switch_oven_fast_pre_heat: { icon: "mdi:fast-forward", it: "Preriscaldamento rapido", en: "Fast preheat" },
  switch_oven_steam_boost: { icon: "mdi:weather-fog", it: "Getto di vapore", en: "Steam boost" },
  switch_oven_cavity_light: { icon: "mdi:lightbulb-outline", it: "Luce interna", en: "Oven light", live: true },
  switch_child_lock: { icon: "mdi:lock-outline", it: "Blocco bambini", en: "Child lock", live: true },
};

// Switches that are not program options
const OPTION_EXCLUDE = new Set([
  "switch_power_state",
  "switch_child_lock",
  "switch_oven_child_lock",
  "switch_backend_connection",
  "switch_door_light_ring",
  "switch_drum_light",
]);

const HOB_ZONES = [
  { id: "200", name: "RearLeft" },
  { id: "100", name: "FrontLeft" },
  { id: "120", name: "Left" },
  { id: "300", name: "RearRight" },
  { id: "400", name: "FrontRight" },
  { id: "340", name: "Right" },
];

const HOB_LEVELS = [
  "KeepWarm",
  "10", "15", "20", "25", "30", "35", "40", "45", "50",
  "55", "60", "65", "70", "75", "80", "85", "90",
  "Boost1", "Boost2",
];

const RUNNING = new Set(["Run", "Pause", "DelayedStart", "ActionRequired", "Aborting"]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const HA_COLORS = new Set([
  "primary", "accent", "red", "pink", "purple", "deep-purple", "indigo", "blue",
  "light-blue", "cyan", "teal", "green", "light-green", "lime", "yellow", "amber",
  "orange", "deep-orange", "brown", "light-grey", "grey", "dark-grey", "blue-grey",
  "black", "white", "disabled",
]);
const colorVar = (color) => (HA_COLORS.has(color) ? `var(--${color}-color)` : color);

const UNIT_SECONDS = { ms: 0.001, s: 1, min: 60, h: 3600, d: 86400 };

function toSeconds(stateObj) {
  if (!stateObj || UNAVAILABLE.has(stateObj.state)) return null;
  const value = Number(stateObj.state);
  if (!Number.isFinite(value)) return null;
  return value * (UNIT_SECONDS[stateObj.attributes.unit_of_measurement] ?? 1);
}

// Duration as a big number and a unit: 42 min, 1:24 h
function splitDuration(sec) {
  if (sec == null) return null;
  const minutes = Math.max(0, Math.round(sec / 60));
  if (minutes < 60) return { value: String(minutes), unit: "min" };
  return { value: `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`, unit: "h" };
}

function durationText(sec) {
  const d = splitDuration(sec);
  return d ? `${d.value} ${d.unit}` : "";
}

const normalize = (text) =>
  String(text).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function programInfo(key) {
  let m = key.match(/^favorite_0*(\d+)$/);
  if (m) return { group: "favorite", id: key, n: Number(m[1]) };
  m = key.match(/^cooking_oven_program_(heatingmode|cleaning|subsequentmode)_(.+)$/);
  if (m) return { group: m[1], id: m[2] };
  m = key.match(/^cooking_oven_program_dish_(automatic|recommendation)_[a-z]+_(.+)$/);
  if (m) return { group: `dish_${m[1]}`, id: m[2] };
  m = key.match(/^laundrycare_[a-z]+_program_(.+)$/);
  if (m) return { group: "other", id: m[1].split("_").pop() };
  m = key.match(/^dishcare_[a-z]+_program_(.+)$/);
  if (m) return { group: "other", id: m[1] };
  m = key.match(/^cooking_[a-z]+_program_(.+)$/);
  if (m) return { group: "other", id: m[1] };
  return { group: "other", id: key.split(".").pop() };
}

function humanize(id) {
  const text = id.replace(/([a-z])(\d)/g, "$1 $2").replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Hob level as shown on the appliance display: 50 -> 5, 55 -> 5.5
function hobLevelNumber(level) {
  const n = Number(level);
  return Number.isFinite(n) ? n / 10 : null;
}

function hobLevelIndex(level) {
  if (!level || level === "Off") return 0;
  if (level === "KeepWarm") return 1;
  if (level === "Boost1") return 20;
  if (level === "Boost2") return 21;
  return Number(level) / 5;
}

function findDevices(hass, models) {
  const ids = new Set(
    Object.values(hass?.entities || {})
      .filter((e) => e.platform === DOMAIN && e.device_id)
      .map((e) => e.device_id),
  );
  return [...ids]
    .map((id) => hass.devices?.[id])
    .filter((d) => d && models.includes(d.model));
}

function fire(node, type, detail) {
  node.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
}

function navigate(path) {
  history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
}

// Patch the existing DOM instead of replacing it, so transitions and focus survive.
function morph(parent, html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  patchChildren(parent, template.content);
}

function patchChildren(target, source) {
  const current = [...target.childNodes];
  const next = [...source.childNodes];
  next.forEach((node, i) => {
    const old = current[i];
    if (!old) {
      target.appendChild(node);
      return;
    }
    if (old.nodeType !== node.nodeType || old.nodeName !== node.nodeName) {
      target.replaceChild(node, old);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      if (old.nodeValue !== node.nodeValue) old.nodeValue = node.nodeValue;
      return;
    }
    for (const { name } of [...old.attributes]) {
      if (!node.hasAttribute(name)) old.removeAttribute(name);
    }
    for (const { name, value } of [...node.attributes]) {
      if (old.getAttribute(name) !== value) old.setAttribute(name, value);
    }
    if ("disabled" in old) old.disabled = node.hasAttribute("disabled");
    patchChildren(old, node);
  });
  for (let i = current.length - 1; i >= next.length; i--) target.removeChild(current[i]);
}

// 270° dial, like the Home Assistant thermostat card
function dial({ pct = 0, marker = null, color = "var(--accent)", label = "", big = "", unit = "", sub = "", gap = "" }) {
  const r = 96;
  const circumference = 2 * Math.PI * r;
  const length = circumference * 0.75;
  const value = clamp(pct, 0, 1) * length;
  let markerSvg = "";
  if (marker != null) {
    const angle = ((135 + 270 * clamp(marker, 0, 1)) * Math.PI) / 180;
    const x = (120 + r * Math.cos(angle)).toFixed(1);
    const y = (120 + r * Math.sin(angle)).toFixed(1);
    markerSvg = `<circle class="marker" cx="${x}" cy="${y}" r="6"></circle>`;
  }
  return `
    <div class="dial">
      <svg viewBox="0 0 240 240" aria-hidden="true">
        <circle class="track" cx="120" cy="120" r="${r}" transform="rotate(135 120 120)"
          style="stroke-dasharray:${length.toFixed(1)} ${circumference.toFixed(1)}"></circle>
        <circle class="value" cx="120" cy="120" r="${r}" transform="rotate(135 120 120)"
          style="stroke:${color};stroke-dasharray:${value.toFixed(1)} ${circumference.toFixed(1)};opacity:${value < 0.5 ? 0 : 1}"></circle>
        ${markerSvg}
      </svg>
      <div class="dial-center">
        <div class="dial-label">${label}</div>
        <div class="big">${big}${unit ? `<span class="unit">${unit}</span>` : ""}</div>
        <div class="dial-sub">${sub}</div>
      </div>
      ${gap ? `<div class="dial-gap">${gap}</div>` : ""}
    </div>`;
}

// ---------------------------------------------------------------------------
// Styles, aligned with the Home Assistant tile card, features and dialogs
// ---------------------------------------------------------------------------

const STYLES = `
  :host {
    display: block;
    --control: color-mix(in srgb, var(--disabled-color, #bdbdbd) 20%, transparent);
    --control-hover: color-mix(in srgb, var(--disabled-color, #bdbdbd) 32%, transparent);
    --inactive: var(--state-inactive-color, var(--disabled-text-color, #9e9e9e));
    --on-accent: var(--text-primary-color, #fff);
    --radius: var(--feature-border-radius, 12px);
  }
  ha-card { height: 100%; box-sizing: border-box; overflow: hidden; }
  .card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    container-type: inline-size;
    font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
    color: var(--primary-text-color);
    -webkit-font-smoothing: antialiased;
  }
  button {
    font: inherit;
    color: inherit;
    background: none;
    border: none;
    margin: 0;
    padding: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:disabled { cursor: default; }
  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

  /* Header, like the tile card */
  .header { display: flex; align-items: center; gap: 10px; min-height: 40px; }
  .tile-icon {
    flex: none;
    width: 36px;
    height: 36px;
    border-radius: var(--tile-icon-border-radius, 50%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--tile-color);
    background: color-mix(in srgb, var(--tile-color) 20%, transparent);
    transition: color 180ms ease-in-out, background-color 180ms ease-in-out;
    --mdc-icon-size: 24px;
  }
  .tile-info { flex: 1; min-width: 0; display: flex; flex-direction: column; cursor: pointer; }
  .name, .secondary { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .name { font-size: var(--ha-font-size-m, 14px); font-weight: var(--ha-font-weight-medium, 500); line-height: 20px; letter-spacing: 0.1px; }
  .secondary { font-size: var(--ha-font-size-s, 12px); line-height: 16px; letter-spacing: 0.4px; color: var(--secondary-text-color); }
  .icon-btn {
    flex: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-text-color);
    transition: background-color 180ms, color 180ms;
    --mdc-icon-size: 22px;
  }
  .icon-btn:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
  .icon-btn.on { color: var(--accent); }

  /* Dial */
  .dial { position: relative; width: 100%; max-width: 248px; aspect-ratio: 1; margin: -4px auto -12px; }
  .dial svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .dial .track, .dial .value { fill: none; stroke-width: 16; stroke-linecap: round; }
  .dial .track { stroke: color-mix(in srgb, var(--disabled-color, #bdbdbd) 30%, transparent); }
  .dial .value { transition: stroke-dasharray 700ms cubic-bezier(0.2, 0, 0, 1), stroke 300ms, opacity 300ms; }
  .dial .marker { fill: var(--ha-card-background, var(--card-background-color, #fff)); stroke: var(--primary-text-color); stroke-width: 3; }
  .dial-center {
    position: absolute;
    inset: 20% 12% 24%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .dial-label, .dial-sub {
    max-width: 100%;
    font-size: var(--ha-font-size-m, 14px);
    line-height: 20px;
    color: var(--secondary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .big {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    font-size: 57px;
    line-height: 64px;
    font-weight: 400;
    letter-spacing: -0.25px;
    font-variant-numeric: tabular-nums;
    --mdc-icon-size: 56px;
  }
  .big .unit { font-size: 22px; line-height: 32px; margin: 4px 0 0 4px; letter-spacing: 0; }
  .big.pending { color: var(--accent); }
  .dial-gap {
    position: absolute;
    left: 50%;
    bottom: 3%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: var(--ha-font-size-m, 14px);
    font-weight: 500;
    color: var(--secondary-text-color);
  }
  .round-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--outline-color, color-mix(in srgb, var(--primary-text-color) 24%, transparent));
    display: flex;
    align-items: center;
    justify-content: center;
    --mdc-icon-size: 22px;
    transition: background-color 180ms;
  }
  .round-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); }
  .round-btn:disabled { opacity: 0.38; }

  /* Compact view */
  .compact { display: flex; flex-direction: column; gap: 6px; }
  .compact-line { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; line-height: 20px; }
  .compact-line .strong { font-weight: 500; }
  .compact-line .muted { color: var(--secondary-text-color); }
  .bar { height: 8px; border-radius: 4px; background: color-mix(in srgb, var(--disabled-color, #bdbdbd) 30%, transparent); overflow: hidden; }
  .bar > div { height: 100%; border-radius: 4px; background: var(--accent); transition: width 700ms cubic-bezier(0.2, 0, 0, 1); }

  /* Stats */
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; }
  .stat-label { font-size: 12px; line-height: 16px; color: var(--secondary-text-color); }
  .stat-value { font-size: 16px; line-height: 24px; font-weight: 500; font-variant-numeric: tabular-nums; }

  /* Controls, like the tile card features */
  .controls { display: flex; flex-direction: column; gap: 8px; }
  .ctrl {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
    height: 42px;
    padding: 0 14px;
    border-radius: var(--radius);
    background: var(--control);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: 500;
    line-height: 20px;
    transition: background-color 180ms, color 180ms, opacity 180ms;
    --mdc-icon-size: 20px;
  }
  .ctrl:hover:not(:disabled) { background: var(--control-hover); }
  .ctrl:disabled { opacity: 0.45; }
  .ctrl.primary { background: var(--accent); color: var(--on-accent); }
  .ctrl.primary:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 88%, var(--primary-text-color)); }
  .ctrl.tonal { background: color-mix(in srgb, var(--accent) 20%, transparent); }
  .ctrl.tonal ha-icon { color: var(--accent); }
  .ctrl.tonal:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 28%, transparent); }
  .ctrl span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .actions { display: flex; gap: 8px; }
  .actions .ctrl { flex: 1; }
  .actions .ctrl.icon-only { flex: 0 0 56px; padding: 0; }

  .options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .opt { justify-content: flex-start; height: 44px; padding: 0 12px; font-weight: 400; }
  .opt ha-icon { color: var(--secondary-text-color); transition: color 180ms; }
  .opt.active { background: color-mix(in srgb, var(--accent) 20%, transparent); }
  .opt.active ha-icon { color: var(--accent); }
  .opt.active:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 28%, transparent); }

  .select {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 52px;
    padding: 6px 12px;
    box-sizing: border-box;
    border-radius: var(--radius);
    background: var(--control);
    text-align: left;
    transition: background-color 180ms;
    --mdc-icon-size: 22px;
  }
  .select:hover:not(:disabled) { background: var(--control-hover); }
  .select:disabled { opacity: 0.45; }
  .select > ha-icon { color: var(--accent); flex: none; }
  .select .chev { color: var(--secondary-text-color); margin-left: auto; }
  .sel-text { display: flex; flex-direction: column; min-width: 0; }
  .sel-text .lbl { font-size: 12px; line-height: 16px; color: var(--secondary-text-color); }
  .sel-text .val { font-size: 15px; line-height: 20px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .row { display: flex; align-items: center; gap: 12px; min-height: 42px; }
  .row-label { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; font-size: var(--ha-font-size-m, 14px); line-height: 20px; }
  .row-label ha-icon { color: var(--secondary-text-color); flex: none; --mdc-icon-size: 22px; padding: 0 1px; }
  .row-label span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .stepper { flex: none; display: flex; align-items: center; width: 164px; height: 42px; border-radius: var(--radius); background: var(--control); }
  .stepper button { flex: none; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius); transition: background-color 180ms; --mdc-icon-size: 20px; }
  .stepper button:hover:not(:disabled) { background: var(--control); }
  .stepper button:disabled { opacity: 0.35; }
  .stepper .num { flex: 1; text-align: center; font-size: var(--ha-font-size-m, 14px); font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .stepper.pending .num { color: var(--accent); }
  .segmented { flex: none; display: flex; height: 42px; min-width: 164px; border-radius: var(--radius); background: var(--control); overflow: hidden; }
  .segmented button { flex: 1; min-width: 40px; padding: 0 8px; font-size: var(--ha-font-size-m, 14px); font-weight: 500; border-radius: var(--radius); transition: background-color 180ms, color 180ms; }
  .segmented button.sel { background: var(--accent); color: var(--on-accent); }

  .hint { display: flex; align-items: center; gap: 8px; font-size: 12px; line-height: 16px; color: var(--secondary-text-color); --mdc-icon-size: 18px; }

  /* Alerts, like ha-alert */
  .alert {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: var(--ha-font-size-m, 14px);
    line-height: 20px;
    background: color-mix(in srgb, var(--alert-color) 12%, transparent);
    --mdc-icon-size: 22px;
  }
  .alert ha-icon { color: var(--alert-color); flex: none; }
  .alert.info { --alert-color: var(--info-color, #039be5); }
  .alert.warning { --alert-color: var(--warning-color, #ffa600); }
  .alert.error { --alert-color: var(--error-color, #db4437); }
  .alert.success { --alert-color: var(--success-color, #43a047); }

  /* Badges, like the dashboard badges */
  .badges { display: flex; flex-wrap: wrap; gap: 8px; }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px 0 8px;
    box-sizing: border-box;
    border-radius: 16px;
    border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    white-space: nowrap;
    cursor: pointer;
    --mdc-icon-size: 18px;
  }
  .badge:hover { background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); }
  .badge ha-icon { color: var(--badge-color, var(--secondary-text-color)); }
  .badge .muted { color: var(--secondary-text-color); font-weight: 400; }

  .empty {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: var(--ha-font-size-m, 14px);
    color: var(--secondary-text-color);
    --mdc-icon-size: 22px;
  }
  .placeholder { padding: 16px; display: flex; align-items: center; gap: 12px; color: var(--secondary-text-color); }

  /* Induction hob */
  .hob { display: block; width: 100%; max-width: 340px; margin: 0 auto; }
  .hob .glass { fill: color-mix(in srgb, var(--primary-text-color) 5%, transparent); stroke: color-mix(in srgb, var(--primary-text-color) 10%, transparent); stroke-width: 1; }
  .zone { cursor: pointer; outline: none; }
  .zone .shape {
    fill: var(--accent);
    fill-opacity: 0;
    stroke: color-mix(in srgb, var(--primary-text-color) 26%, transparent);
    stroke-width: 2;
    transition: fill-opacity 400ms, stroke 300ms;
  }
  .zone:hover .shape { stroke: color-mix(in srgb, var(--primary-text-color) 50%, transparent); }
  .zone:focus-visible .shape { stroke: var(--accent); stroke-width: 3; }
  .zone.active .shape { stroke: var(--accent); }
  .zone.residual .shape { fill: var(--amber-color, #ffc107); fill-opacity: 0.16; stroke: var(--amber-color, #ffc107); stroke-dasharray: 6 5; }
  .zone.unselectable { pointer-events: none; }
  .zone text { text-anchor: middle; dominant-baseline: central; font-family: inherit; pointer-events: none; }
  .zone .lvl { font-size: 30px; font-weight: 500; }
  .zone .lvl.small { font-size: 14px; }
  .zone .tmr { font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums; }
  .zone.residual .lvl { fill: var(--amber-color, #ffc107); }
  .hob-off { text-align: center; font-size: 12px; color: var(--secondary-text-color); margin-top: -4px; }

  /* Dialog: bottom sheet on mobile, centered on desktop */
  dialog {
    width: min(520px, calc(100vw - 32px));
    max-height: min(80vh, 720px);
    padding: 0;
    border: none;
    border-radius: var(--ha-dialog-border-radius, 28px);
    background: var(--ha-dialog-surface-background, var(--mdc-theme-surface, var(--card-background-color, #fff)));
    color: var(--primary-text-color);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.28);
    font-family: var(--ha-font-family-body, Roboto, Noto, sans-serif);
    overflow: hidden;
  }
  dialog[open] { display: flex; flex-direction: column; animation: dialog-in 220ms cubic-bezier(0.2, 0, 0, 1); }
  dialog::backdrop { background: rgba(0, 0, 0, 0.32); }
  @keyframes dialog-in { from { opacity: 0; transform: scale(0.96); } }
  @media (max-width: 600px) {
    dialog {
      width: 100vw;
      max-width: 100vw;
      margin: auto 0 0;
      border-radius: 28px 28px 0 0;
      max-height: 88vh;
    }
    @keyframes dialog-in { from { transform: translateY(40px); opacity: 0; } }
  }
  .sheet-head { display: flex; align-items: center; gap: 8px; padding: 16px 12px 8px 24px; }
  .sheet-title { flex: 1; font-size: 22px; line-height: 28px; font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sheet-sub { padding: 0 24px 8px; margin-top: -6px; font-size: 14px; color: var(--secondary-text-color); }
  .search-wrap { padding: 4px 16px 8px; }
  .search {
    width: 100%;
    box-sizing: border-box;
    height: 44px;
    padding: 0 16px 0 44px;
    border: none;
    border-radius: 22px;
    background: var(--control) no-repeat 14px center / 20px;
    color: var(--primary-text-color);
    font: inherit;
    font-size: 15px;
    outline: none;
  }
  .search:focus { box-shadow: inset 0 0 0 2px var(--accent); }
  .search-icon { position: absolute; margin: 12px 0 0 14px; color: var(--secondary-text-color); --mdc-icon-size: 20px; pointer-events: none; }
  .sheet-dynamic { overflow-y: auto; padding-bottom: 12px; overscroll-behavior: contain; }
  .subheader { padding: 16px 24px 6px; font-size: 14px; line-height: 20px; font-weight: 500; color: var(--secondary-text-color); }
  .item {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    min-height: 48px;
    padding: 4px 24px;
    box-sizing: border-box;
    text-align: left;
    font-size: 16px;
    line-height: 24px;
    --mdc-icon-size: 22px;
  }
  .item:hover { background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); }
  .item > ha-icon:first-child { color: var(--secondary-text-color); flex: none; }
  .item span { flex: 1; min-width: 0; }
  .item.selected { color: var(--accent); font-weight: 500; }
  .item.selected > ha-icon { color: var(--accent); }
  .nothing { padding: 24px; text-align: center; color: var(--secondary-text-color); }
  .sheet-body { display: flex; flex-direction: column; gap: 16px; padding: 8px 24px 24px; }
  .zone-hero { display: flex; align-items: baseline; gap: 12px; }
  .zone-hero .big { justify-content: flex-start; }
  .zone-hero .muted { color: var(--secondary-text-color); font-size: 14px; }
  .section-label { font-size: 14px; font-weight: 500; color: var(--secondary-text-color); margin-bottom: -8px; }
  .levels { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .levels button { height: 40px; border-radius: 10px; background: var(--control); font-size: 15px; font-weight: 500; font-variant-numeric: tabular-nums; transition: background-color 150ms, color 150ms; }
  .levels button:hover:not(.sel) { background: var(--control-hover); }
  .levels button.sel { background: var(--accent); color: var(--on-accent); }
  .note { font-size: 12px; line-height: 16px; color: var(--secondary-text-color); }

  @container (max-width: 300px) {
    .options { grid-template-columns: 1fr; }
    .stepper, .segmented { width: 140px; min-width: 140px; }
  }
`;

// ---------------------------------------------------------------------------
// Base card
// ---------------------------------------------------------------------------

class HomeConnectCard extends HTMLElement {
  static kind = "washer";

  constructor() {
    super();
    this._pending = {};
    this._timers = {};
    this._sheet = null;
    this._query = "";
    this._lastHtml = "";
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>${STYLES}</style>
      <ha-card><div class="card"></div></ha-card>
      <dialog><div class="sheet-static"></div><div class="sheet-dynamic"></div></dialog>`;
    this._cardEl = root.querySelector(".card");
    this._dialog = root.querySelector("dialog");
    this._sheetStatic = root.querySelector(".sheet-static");
    this._sheetDynamic = root.querySelector(".sheet-dynamic");

    root.addEventListener("click", (ev) => this._onClick(ev));
    root.addEventListener("keydown", (ev) => {
      if ((ev.key === "Enter" || ev.key === " ") && ev.target.getAttribute?.("role") === "button") {
        ev.preventDefault();
        this._onClick(ev);
      }
    });
    root.addEventListener("input", (ev) => {
      if (ev.target.classList?.contains("search")) {
        this._query = ev.target.value;
        this._renderSheet();
      }
    });
    this._dialog.addEventListener("click", (ev) => {
      if (ev.target === this._dialog) this._dialog.close();
    });
    this._dialog.addEventListener("close", () => {
      this._sheet = null;
    });
  }

  get kind() {
    return this.constructor.kind;
  }

  get meta() {
    return KINDS[this.kind];
  }

  // --- Lovelace card API ---------------------------------------------------

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this._entityCache = null;
    this.style.setProperty("--accent", colorVar(this._config.color || this.meta.color));
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return this._config?.hide_hero ? 5 : 9;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  static getConfigElement() {
    const editor = document.createElement("homeconnect-card-editor");
    editor.kind = this.kind;
    return editor;
  }

  static getStubConfig(hass) {
    const device = findDevices(hass, KINDS[this.kind].models)[0];
    return { device_id: device?.id ?? "" };
  }

  // --- Strings ---------------------------------------------------------------

  get _lang() {
    const lang = this._hass?.locale?.language || this._hass?.language || "en";
    return lang.startsWith("it") ? "it" : "en";
  }

  _t(path, vars) {
    const pick = (lang) => path.split(".").reduce((obj, key) => obj?.[key], STRINGS[lang]);
    const text = pick(this._lang) ?? pick("en") ?? path;
    return vars ? text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "") : text;
  }

  _num(value, maxDigits = 1) {
    return new Intl.NumberFormat(this._hass?.locale?.language || "it", {
      maximumFractionDigits: maxDigits,
    }).format(value);
  }

  _clock(secondsFromNow, base = Date.now()) {
    const language = this._hass?.locale?.language || "en";
    const format = this._hass?.locale?.time_format;
    const hour12 =
      format === "12" ? true : format === "24" ? false : new Intl.DateTimeFormat(language, { hour: "numeric" }).resolvedOptions().hour12;
    // Same as Home Assistant: 9:40 PM with AM/PM, 09:40 without
    return new Intl.DateTimeFormat(language, {
      hour: hour12 ? "numeric" : "2-digit",
      minute: "2-digit",
      hour12,
    }).format(new Date(base + secondsFromNow * 1000));
  }

  _fmtState(stateObj, state) {
    if (!stateObj) return "";
    if (this._hass.formatEntityState) return this._hass.formatEntityState(stateObj, state);
    const value = state ?? stateObj.state;
    const unit = stateObj.attributes.unit_of_measurement;
    return unit ? `${value} ${unit}` : value;
  }

  _programLabel(key) {
    if (!key) return "";
    const info = programInfo(key);
    if (info.group === "favorite") return this._t("favorite", { n: info.n });
    const labels = PROGRAM_LABELS[this._lang];
    return labels[`${info.group}:${info.id}`] || labels[info.id] || PROGRAM_LABELS.en[info.id] || humanize(info.id);
  }

  _entityName(stateObj) {
    const name = stateObj.attributes.friendly_name || stateObj.entity_id;
    const device = this._deviceName();
    return device && name.startsWith(device) ? name.slice(device.length).trim() : name;
  }

  _deviceName() {
    const device = this._hass.devices?.[this._config.device_id];
    return device?.name_by_user || device?.name || "";
  }

  // --- Entities --------------------------------------------------------------

  _entities() {
    const hass = this._hass;
    const id = this._config.device_id;
    if (this._entityCache?.registry === hass.entities && this._entityCache.id === id) return this._entityCache;
    const found = {};
    for (const entry of Object.values(hass.entities || {})) {
      if (entry.device_id !== id || entry.platform !== DOMAIN || !entry.translation_key) continue;
      const stateObj = hass.states[entry.entity_id];
      // "restored" entities are still in the registry but no longer provided by the integration
      const stale = !stateObj || stateObj.attributes?.restored === true;
      const previous = found[entry.translation_key];
      if (!previous || (previous.stale && !stale)) {
        found[entry.translation_key] = { id: entry.entity_id, stale, category: entry.entity_category ?? null };
      }
    }
    this._entityCache = { registry: hass.entities, id, found };
    return this._entityCache;
  }

  eid(key) {
    return this._found[key]?.id;
  }

  st(key) {
    const id = this.eid(key);
    return id ? this._hass.states[id] : undefined;
  }

  val(key) {
    return this.st(key)?.state;
  }

  ok(key) {
    const stateObj = this.st(key);
    return !!stateObj && !UNAVAILABLE.has(stateObj.state);
  }

  numVal(key) {
    if (!this.ok(key)) return null;
    const value = Number(this.val(key));
    return Number.isFinite(value) ? value : null;
  }

  on(key) {
    return this.val(key) === "on";
  }

  _pendingVal(entityId) {
    const pending = this._pending[entityId];
    if (!pending) return undefined;
    const stateObj = this._hass.states[entityId];
    const reached = stateObj && (pending.number ? Number(stateObj.state) === pending.value : stateObj.state === pending.value);
    if (reached || Date.now() - pending.time > 8000) {
      delete this._pending[entityId];
      return undefined;
    }
    return pending.value;
  }

  // --- Overall state ---------------------------------------------------------

  _derive() {
    const offline = this.val("connection") === "off";
    const op = this.ok("sensor_operation_state") ? this.val("sensor_operation_state") : null;
    const running = RUNNING.has(op);
    let off = offline;
    if (!off && !running) {
      const power = this.st("switch_power_state");
      if (power && !UNAVAILABLE.has(power.state)) off = power.state === "off";
      else if (this.ok("sensor_power_state")) {
        off = ["off", "mainsoff", "standby"].includes(this.val("sensor_power_state")) && (!op || op === "Inactive");
      }
    }
    const active = this.ok("sensor_active_program") ? this.val("sensor_active_program") : null;
    const selectEid = this.eid("select_program");
    const selected = selectEid
      ? (this._pendingVal(selectEid) ?? (this.ok("select_program") ? this.val("select_program") : null))
      : null;
    const remoteStart = this.st("binary_remote_start_allowed");
    return {
      offline,
      off,
      op,
      running,
      program: running ? active || selected : selected || active,
      remoteStartBlocked: remoteStart ? remoteStart.state === "off" : false,
      remoteControlOff: this.val("binary_sensor_remote_control_active") === "off",
      localControl: this.on("binary_sensor_local_control_active"),
    };
  }

  // --- Render ----------------------------------------------------------------

  _render() {
    if (!this._hass || !this._config) return;
    this._found = this._entities().found;
    const html = this._template();
    if (html !== this._lastHtml) {
      morph(this._cardEl, html);
      this._lastHtml = html;
    }
    if (this._sheet) this._renderSheet();
  }

  _template() {
    if (!this._config.device_id) return this._placeholder(this._t("no_device"));
    if (!Object.keys(this._found).length) return this._placeholder(this._t("device_missing"));
    const d = this._derive();
    this._d = d;
    const parts = [this._header(d), this._alerts(d)];
    parts.push(d.offline || d.off ? this._offBody(d) : this._body(d));
    const badges = this._badges(d).filter(Boolean);
    if (badges.length) parts.push(`<div class="badges">${badges.join("")}</div>`);
    return parts.filter(Boolean).join("");
  }

  _placeholder(text) {
    return `<div class="placeholder"><ha-icon icon="${this.meta.icon}"></ha-icon><span>${esc(text)}</span></div>`;
  }

  _statusText(d) {
    if (d.offline) return this._t("offline");
    if (d.off) return this._t("off");
    const parts = [];
    if (d.op) parts.push(this._t(`op.${d.op}`));
    if (d.program && (d.running || d.op === "Ready" || d.op === "Finished")) parts.push(this._programLabel(d.program));
    return parts.join(" · ");
  }

  _header(d) {
    const color = d.offline || d.off ? "var(--inactive)" : "var(--accent)";
    const infoKey = this.eid("sensor_operation_state") ? "sensor_operation_state" : "switch_power_state";
    const power = this.st("switch_power_state");
    const powerOn = power?.state === "on";
    const powerBtn =
      power && !d.offline && !UNAVAILABLE.has(power.state)
        ? `<button class="icon-btn ${powerOn ? "on" : ""}" data-action="toggle" data-key="switch_power_state"
             title="${esc(this._t("power"))}" aria-label="${esc(this._t("power"))}" aria-pressed="${powerOn}">
             <ha-icon icon="mdi:power"></ha-icon></button>`
        : "";
    return `
      <div class="header">
        <div class="tile-icon" style="--tile-color:${color}" data-action="more-info" data-key="${infoKey}" role="button" tabindex="0">
          <ha-icon icon="${this._config.icon || this.meta.icon}"></ha-icon>
        </div>
        <div class="tile-info" data-action="more-info" data-key="${infoKey}">
          <div class="name">${esc(this._config.name || this._deviceName())}</div>
          <div class="secondary">${esc(this._statusText(d))}</div>
        </div>
        ${powerBtn}
        <button class="icon-btn" data-action="device" title="${esc(this._t("settings"))}" aria-label="${esc(this._t("settings"))}">
          <ha-icon icon="mdi:dots-vertical"></ha-icon>
        </button>
      </div>`;
  }

  _offBody(d) {
    if (d.offline) {
      return `<div class="empty"><ha-icon icon="mdi:lan-disconnect"></ha-icon><span>${esc(this._t("offline_hint"))}</span></div>`;
    }
    const power = this.st("switch_power_state");
    if (!power || UNAVAILABLE.has(power.state)) return "";
    return `
      <div class="actions">
        <button class="ctrl tonal" data-action="power-on"><ha-icon icon="mdi:power"></ha-icon><span>${esc(this._t("power_on"))}</span></button>
      </div>`;
  }

  _body(d) {
    const hero = this._config.hide_hero ? this._compactHero(d) : this._hero(d);
    return [hero, `<div class="controls">${this._controls(d)}</div>`].join("");
  }

  _hero() {
    return "";
  }

  _compactHero() {
    return "";
  }

  _controls() {
    return "";
  }

  _alerts() {
    return "";
  }

  _badges() {
    return [];
  }

  // --- Building blocks -------------------------------------------------------

  _alert(type, icon, text) {
    return `<div class="alert ${type}" role="status"><ha-icon icon="${icon}"></ha-icon><span>${esc(text)}</span></div>`;
  }

  _badge(icon, text, { key, color, label } = {}) {
    const action = key && this.eid(key) ? `data-action="more-info" data-key="${key}" role="button" tabindex="0"` : "";
    return `
      <div class="badge" ${action} style="${color ? `--badge-color:${color}` : ""}">
        <ha-icon icon="${icon}"></ha-icon>
        ${label ? `<span class="muted">${esc(label)}</span>` : ""}
        <span>${esc(text)}</span>
      </div>`;
  }

  _programSelect(d) {
    if (!this.eid("select_program") || d.running) return "";
    const disabled = !this.ok("select_program") || d.remoteControlOff;
    const label = d.program ? this._programLabel(d.program) : this._t("choose_program");
    return `
      <button class="select" data-action="open-programs" ${disabled ? "disabled" : ""}>
        <ha-icon icon="${d.program ? GROUP_ICONS[programInfo(d.program).group] || this.meta.programIcon : this.meta.programIcon}"></ha-icon>
        <span class="sel-text">
          <span class="lbl">${esc(this._t("program"))}</span>
          <span class="val">${esc(label)}</span>
        </span>
        <ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
      </button>`;
  }

  _optionKeys() {
    return Object.entries(this._found)
      .filter(([key, info]) => key.startsWith("switch_") && !info.category && !OPTION_EXCLUDE.has(key))
      .map(([key]) => key);
  }

  _options(d, keys = this._optionKeys()) {
    const items = keys
      .filter((key) => this.ok(key))
      .map((key) => {
        const stateObj = this.st(key);
        const meta = OPTION_META[key] || {};
        const on = (this._pendingVal(stateObj.entity_id) ?? stateObj.state) === "on";
        const label = meta[this._lang] || this._entityName(stateObj);
        const icon = meta.icon || stateObj.attributes.icon || "mdi:tune-variant";
        const disabled = (d.running && !meta.live) || d.remoteControlOff;
        return `
          <button class="ctrl opt ${on ? "active" : ""}" data-action="toggle" data-key="${key}" aria-pressed="${on}" ${disabled ? "disabled" : ""}>
            <ha-icon icon="${icon}"></ha-icon><span>${esc(label)}</span>
          </button>`;
      });
    return items.length ? `<div class="options">${items.join("")}</div>` : "";
  }

  _stepper(key, { label, icon, step, format, min, max, disabled = false }) {
    const stateObj = this.st(key);
    if (!stateObj || UNAVAILABLE.has(stateObj.state)) return "";
    const attrs = stateObj.attributes;
    const pending = this._pendingVal(stateObj.entity_id);
    const value = pending ?? Number(stateObj.state);
    const lo = min ?? attrs.min ?? 0;
    const hi = max ?? attrs.max ?? 100;
    const off = disabled || this._d.remoteControlOff;
    return `
      <div class="row">
        <div class="row-label"><ha-icon icon="${icon || attrs.icon || "mdi:numeric"}"></ha-icon><span>${esc(label)}</span></div>
        <div class="stepper ${pending !== undefined ? "pending" : ""}">
          <button data-action="step" data-key="${key}" data-delta="${-step}" ${off || value <= lo ? "disabled" : ""} aria-label="-">
            <ha-icon icon="mdi:minus"></ha-icon></button>
          <span class="num">${esc(format(value))}</span>
          <button data-action="step" data-key="${key}" data-delta="${step}" ${off || value >= hi ? "disabled" : ""} aria-label="+">
            <ha-icon icon="mdi:plus"></ha-icon></button>
        </div>
      </div>`;
  }

  _segmented(key, { label, icon, format }) {
    const stateObj = this.st(key);
    if (!stateObj || UNAVAILABLE.has(stateObj.state)) return "";
    const options = stateObj.attributes.options || [];
    if (options.length < 2 || options.length > 6) return "";
    const current = this._pendingVal(stateObj.entity_id) ?? stateObj.state;
    const disabled = this._d.running || this._d.remoteControlOff;
    return `
      <div class="row">
        <div class="row-label"><ha-icon icon="${icon || stateObj.attributes.icon || "mdi:format-list-numbered"}"></ha-icon><span>${esc(label)}</span></div>
        <div class="segmented" role="radiogroup">
          ${options
            .map(
              (option) => `
            <button class="${option === current ? "sel" : ""}" role="radio" aria-checked="${option === current}"
              data-action="select" data-key="${key}" data-option="${esc(option)}" ${disabled ? "disabled" : ""}>
              ${esc(format ? format(option) : this._fmtState(stateObj, option))}</button>`,
            )
            .join("")}
        </div>
      </div>`;
  }

  _delayValue() {
    const id = this.eid("number_oven_start_in_relative");
    if (!id || !this.ok("number_oven_start_in_relative")) return 0;
    return this._pendingVal(id) ?? Number(this.val("number_oven_start_in_relative"));
  }

  _actions(d) {
    const buttons = [];
    const button = (action, icon, text, { key, primary = false, iconOnly = false, blocked = false } = {}) => {
      const disabled = blocked || d.remoteControlOff || (key && (!this.st(key) || this.val(key) === "unavailable"));
      return `
        <button class="ctrl ${primary ? "primary" : ""} ${iconOnly ? "icon-only" : ""}" data-action="${action}"
          ${key ? `data-key="${key}"` : ""} ${disabled ? "disabled" : ""}
          title="${esc(text)}" aria-label="${esc(text)}">
          <ha-icon icon="${icon}"></ha-icon>${iconOnly ? "" : `<span>${esc(text)}</span>`}
        </button>`;
    };
    const stop = (iconOnly) =>
      this.eid("button_abort_program")
        ? button("press", "mdi:stop", this._t("stop"), { key: "button_abort_program", iconOnly })
        : "";

    // Stop is icon-only when there's a main button next to it
    if (d.op === "Run" || d.op === "ActionRequired") {
      const pause = this.eid("button_oven_pause");
      if (pause) buttons.push(button("press", "mdi:pause", this._t("pause"), { key: "button_oven_pause" }));
      buttons.push(stop(!!pause));
    } else if (d.op === "Pause") {
      const resume = this.eid("button_oven_resume");
      if (resume) buttons.push(button("press", "mdi:play", this._t("resume"), { key: "button_oven_resume", primary: true }));
      buttons.push(stop(!!resume));
    } else if (d.op === "DelayedStart") {
      buttons.push(stop(false));
    } else if (this.eid("button_start_program")) {
      const delay = this._delayValue();
      const text = delay > 0 ? this._t("start_delayed", { t: durationText(delay) }) : this._t("start");
      buttons.push(
        button("start", delay > 0 ? "mdi:timer-play-outline" : "mdi:play", text, {
          primary: true,
          blocked: !d.program || d.remoteStartBlocked || (delay === 0 && this.val("button_start_program") === "unavailable"),
        }),
      );
    }
    const html = buttons.filter(Boolean).join("");
    return html ? `<div class="actions">${html}</div>` : "";
  }

  _hints(d) {
    const hints = [];
    if (d.remoteControlOff) hints.push(["mdi:remote-off", this._t("hint_remote_off")]);
    else if (d.remoteStartBlocked && !d.running) hints.push(["mdi:remote-off", this._t("hint_remote_start")]);
    if (d.localControl) hints.push(["mdi:gesture-tap-button", this._t("hint_local")]);
    return hints
      .map(([icon, text]) => `<div class="hint"><ha-icon icon="${icon}"></ha-icon><span>${esc(text)}</span></div>`)
      .join("");
  }

  _doorBadge() {
    const sensor = this.st("sensor_door_state");
    const binary = this.st("binary_sensor_door_state");
    let state = null;
    let key = null;
    if (sensor && !UNAVAILABLE.has(sensor.state)) {
      state = sensor.state;
      key = "sensor_door_state";
    } else if (binary && !UNAVAILABLE.has(binary.state)) {
      state = binary.state === "on" ? "open" : "closed";
      key = "binary_sensor_door_state";
    }
    if (!state) return "";
    const icons = { open: "mdi:door-open", ajar: "mdi:door-open", locked: "mdi:door-closed-lock", closed: "mdi:door-closed" };
    const color = state === "open" || state === "ajar" ? "var(--accent)" : undefined;
    return this._badge(icons[state] || "mdi:door", this._t(`door.${state}`), { key, color });
  }

  _lastCycleBadges() {
    const badges = [];
    if (this.ok("sensor_energy_consumed_last")) {
      badges.push(
        this._badge("mdi:lightning-bolt", this._fmtState(this.st("sensor_energy_consumed_last")), {
          key: "sensor_energy_consumed_last",
          label: this._t("last_cycle"),
          color: "var(--amber-color, #ffc107)",
        }),
      );
    }
    if (this.ok("sensor_water_consumed_last")) {
      badges.push(
        this._badge("mdi:water", this._fmtState(this.st("sensor_water_consumed_last")), {
          key: "sensor_water_consumed_last",
          color: "var(--blue-color, #2196f3)",
        }),
      );
    }
    return badges;
  }

  // --- Actions ---------------------------------------------------------------

  _onClick(ev) {
    const el = ev.target.closest?.("[data-action]");
    if (!el || el.disabled) return;
    const action = el.dataset.action;
    const key = el.dataset.key;
    const entityId = key ? this.eid(key) : undefined;

    switch (action) {
      case "more-info":
        if (entityId) fire(this, "hass-more-info", { entityId });
        break;
      case "device":
        navigate(`/config/devices/device/${this._config.device_id}`);
        break;
      case "toggle": {
        if (!entityId) return;
        const current = this._pendingVal(entityId) ?? this._hass.states[entityId]?.state;
        this._pending[entityId] = { value: current === "on" ? "off" : "on", time: Date.now() };
        this._render();
        this._call(entityId.split(".")[0], "toggle", { entity_id: entityId });
        break;
      }
      case "power-on":
        this._call("switch", "turn_on", { entity_id: this.eid("switch_power_state") });
        break;
      case "press":
        if (entityId) this._call("button", "press", { entity_id: entityId });
        break;
      case "start":
        this._start();
        break;
      case "step":
        this._step(key, Number(el.dataset.delta));
        break;
      case "select":
        this._select(key, el.dataset.option);
        break;
      case "open-programs":
        this._openSheet({ type: "programs" });
        break;
      case "pick-program":
        this._select("select_program", el.dataset.option);
        this._dialog.close();
        break;
      case "close":
        this._dialog.close();
        break;
      default:
        this._onAction(action, el);
    }
  }

  _onAction() {}

  async _call(domain, service, data) {
    try {
      await this._hass.callService(domain, service, data);
    } catch (err) {
      fire(this, "hass-notification", { message: this._t("error", { e: err?.message || err }) });
    }
  }

  _select(key, option) {
    const entityId = this.eid(key);
    if (!entityId) return;
    this._pending[entityId] = { value: option, time: Date.now() };
    this._render();
    this._call("select", "select_option", { entity_id: entityId, option });
  }

  // Steps add up and the value is sent after a short pause, like the thermostat card
  _step(key, delta) {
    const entityId = this.eid(key);
    const stateObj = this._hass.states[entityId];
    if (!stateObj) return;
    const { min = 0, max = 100 } = stateObj.attributes;
    const current = this._pendingVal(entityId) ?? Number(stateObj.state);
    const size = Math.abs(delta);
    const next = clamp(Math.round((current + delta) / size) * size, min, max);
    this._pending[entityId] = { value: next, number: true, time: Date.now() };
    this._render();
    clearTimeout(this._timers[entityId]);
    this._timers[entityId] = setTimeout(() => {
      this._pending[entityId].time = Date.now();
      this._call("number", "set_value", { entity_id: entityId, value: next });
    }, 900);
  }

  _start() {
    const delay = this._delayValue();
    if (delay > 0) {
      this._call(DOMAIN, "start_program", {
        device_id: this._config.device_id,
        start_in: { hours: Math.floor(delay / 3600), minutes: Math.floor((delay % 3600) / 60), seconds: 0 },
      });
    } else {
      this._call("button", "press", { entity_id: this.eid("button_start_program") });
    }
  }

  // --- Dialog ----------------------------------------------------------------

  _openSheet(sheet) {
    this._sheet = sheet;
    this._query = "";
    this._sheetStatic.innerHTML = this._sheetHead();
    this._renderSheet();
    if (!this._dialog.open) this._dialog.showModal();
    this._sheetDynamic.scrollTop = 0;
    const selected = this._sheetDynamic.querySelector(".selected");
    if (selected) selected.scrollIntoView({ block: "center" });
  }

  _sheetHead() {
    if (this._sheet.type !== "programs") return "";
    const options = this.st("select_program")?.attributes.options || [];
    const search =
      options.length > 12
        ? `<div class="search-wrap"><ha-icon class="search-icon" icon="mdi:magnify"></ha-icon>
             <input class="search" type="search" placeholder="${esc(this._t("search"))}" aria-label="${esc(this._t("search"))}"></div>`
        : "";
    return `
      <div class="sheet-head">
        <div class="sheet-title">${esc(this._t("choose_program"))}</div>
        <button class="icon-btn" data-action="close" aria-label="Close"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>${search}`;
  }

  _renderSheet() {
    if (!this._sheet) return;
    morph(this._sheetDynamic, this._sheetBody());
  }

  _sheetBody() {
    if (this._sheet.type !== "programs") return "";
    const stateObj = this.st("select_program");
    const current = this._d?.program;
    const query = normalize(this._query.trim());
    const groups = {};
    for (const option of stateObj?.attributes.options || []) {
      const label = this._programLabel(option);
      if (query && !normalize(label).includes(query)) continue;
      const group = programInfo(option).group;
      (groups[group] ||= []).push({ option, label });
    }
    const names = GROUP_ORDER.filter((g) => groups[g]);
    if (!names.length) return `<div class="nothing">${esc(this._t("no_results"))}</div>`;
    const showHeaders = names.length > 1;
    return names
      .map((group) => {
        const items = groups[group]
          .map(
            ({ option, label }) => `
          <button class="item ${option === current ? "selected" : ""}" data-action="pick-program" data-option="${esc(option)}">
            <ha-icon icon="${GROUP_ICONS[group] || this.meta.programIcon}"></ha-icon>
            <span>${esc(label)}</span>
            ${option === current ? '<ha-icon icon="mdi:check"></ha-icon>' : ""}
          </button>`,
          )
          .join("");
        return `${showHeaders ? `<div class="subheader">${esc(this._t(`groups.${group}`))}</div>` : ""}${items}`;
      })
      .join("");
  }
}

// ---------------------------------------------------------------------------
// Washer and dishwasher
// ---------------------------------------------------------------------------

class CycleCard extends HomeConnectCard {
  _times() {
    const remaining = toSeconds(this.st("sensor_remaining_program_time"));
    const estimate = toSeconds(this.st("sensor_estimated_remaining_program_time"));
    const startIn = toSeconds(this.st("sensor_start_in"));
    const progress = this.numVal("sensor_program_progress");
    return { remaining, estimate, startIn, progress };
  }

  _phase() {
    for (const key of ["sensor_laundry_process_phase", "sensor_program_phase"]) {
      if (!this.ok(key)) continue;
      const value = this.val(key);
      const own = this._t(`phase.${value}`);
      if (own !== `phase.${value}`) return own;
      return this._fmtState(this.st(key));
    }
    return "";
  }

  _hero(d) {
    const { remaining, estimate, startIn, progress } = this._times();
    const phase = this._phase();
    if (d.op === "DelayedStart" && startIn != null) {
      const time = splitDuration(startIn);
      return dial({
        label: esc(this._t("starts_in")),
        big: time.value,
        unit: time.unit,
        sub: remaining != null ? esc(this._t("ends_at", { t: this._clock(startIn + remaining) })) : "",
      });
    }
    if (d.op === "Run" || d.op === "Pause" || d.op === "ActionRequired") {
      const time = splitDuration(remaining);
      return dial({
        pct: (progress ?? 0) / 100,
        color: d.op === "Pause" ? "var(--inactive)" : "var(--accent)",
        label: esc(phase || this._t(`op.${d.op}`)),
        big: time ? time.value : "-",
        unit: time ? time.unit : "",
        sub: esc(d.op === "Pause" ? this._t("op.Pause") : remaining != null ? this._t("ends_at", { t: this._clock(remaining) }) : ""),
        gap: progress != null ? `${Math.round(progress)}%` : "",
      });
    }
    if (d.op === "Finished") {
      const since = this.st("sensor_operation_state")?.last_changed;
      return dial({
        pct: 1,
        color: "var(--success-color, #43a047)",
        label: esc(this._t("op.Finished")),
        big: '<ha-icon icon="mdi:check"></ha-icon>',
        sub: since ? esc(this._t("finished_at", { t: this._clock(0, Date.parse(since)) })) : "",
      });
    }
    const duration = remaining ?? (estimate > 60 ? estimate : null);
    const time = splitDuration(duration);
    return dial({
      label: esc(this._t("estimated")),
      big: time ? time.value : "-",
      unit: time ? time.unit : "",
      sub: duration != null && d.program ? esc(this._t("ends_at", { t: this._clock(this._delayValue() + duration) })) : "",
    });
  }

  _compactHero(d) {
    const { remaining, startIn, progress } = this._times();
    let left = this._phase() || this._t(`op.${d.op}`);
    let right = "";
    if (d.op === "DelayedStart" && startIn != null) {
      left = `${this._t("starts_in")} ${durationText(startIn)}`;
    } else if (remaining != null && (d.running || d.op === "Ready")) {
      right = d.running ? this._t("ends_at", { t: this._clock(remaining) }) : durationText(remaining);
      if (d.running) left = `${left} · ${durationText(remaining)}`;
    }
    const bar = d.running ? `<div class="bar"><div style="width:${clamp(progress ?? 0, 0, 100)}%"></div></div>` : "";
    return `
      <div class="compact">
        <div class="compact-line"><span class="strong">${esc(left)}</span><span class="muted">${esc(right)}</span></div>
        ${bar}
      </div>`;
  }
}

class WasherCard extends CycleCard {
  static kind = "washer";

  _controls(d) {
    return [
      this._programSelect(d),
      d.running ? "" : this._options(d),
      d.running
        ? ""
        : this._stepper("number_duration", {
            label: this._t("duration"),
            icon: "mdi:timer-outline",
            step: 600,
            format: (v) => durationText(v),
          }),
      this._hints(d),
      this._actions(d),
    ].join("");
  }

  _alerts(d) {
    const alerts = [];
    if (this.on("binary_sensor_foam_detection")) alerts.push(this._alert("warning", "mdi:chart-bubble", this._t("alert.foam")));
    if (this.on("binary_sensor_program_aborted")) alerts.push(this._alert("warning", "mdi:cancel", this._t("alert.aborted")));
    if (d.op === "Error") alerts.push(this._alert("error", "mdi:alert-circle-outline", this._t("alert.error")));
    const reload = this.val("sensor_laundry_reload");
    if (reload?.startsWith("possible")) {
      if (d.op === "Run") alerts.push(this._alert("info", "mdi:tshirt-crew-outline", this._t("alert.reload")));
      if (d.op === "Pause") alerts.push(this._alert("info", "mdi:tshirt-crew-outline", this._t("alert.reload_now")));
    }
    return alerts.join("");
  }

  _badges(d) {
    const badges = [this._doorBadge()];
    if (!d.off && this.ok("sensor_laundry_spin_speed")) {
      badges.push(
        this._badge("mdi:rotate-right", this._fmtState(this.st("sensor_laundry_spin_speed")), {
          key: "sensor_laundry_spin_speed",
          label: this._t("spin"),
        }),
      );
    }
    if (!d.running) badges.push(...this._lastCycleBadges());
    return badges;
  }
}

class DishwasherCard extends CycleCard {
  static kind = "dishwasher";

  _controls(d) {
    return [
      this._programSelect(d),
      d.running ? "" : this._options(d),
      d.running
        ? ""
        : this._stepper("number_oven_start_in_relative", {
            label: this._t("delay"),
            icon: "mdi:timer-plus-outline",
            step: 1800,
            format: (v) => (v > 0 ? durationText(v) : this._t("none")),
          }),
      this._hints(d),
      this._actions(d),
    ].join("");
  }

  _alerts(d) {
    const alerts = [];
    if (this.val("sensor_salt") === "empty") alerts.push(this._alert("warning", "mdi:shaker-outline", this._t("alert.salt")));
    if (this.val("sensor_rinse_aid") === "empty") alerts.push(this._alert("warning", "mdi:water-outline", this._t("alert.rinse_aid")));
    if (this.on("binary_sensor_program_aborted")) alerts.push(this._alert("warning", "mdi:cancel", this._t("alert.aborted")));
    if (d.op === "Error") alerts.push(this._alert("error", "mdi:alert-circle-outline", this._t("alert.error")));
    return alerts.join("");
  }

  _supplyBadge(key, icon, label) {
    if (!this.ok(key)) return "";
    const value = this.val(key);
    const colors = { empty: "var(--error-color, #db4437)", nearly_empty: "var(--warning-color, #ffa600)", full: "var(--success-color, #43a047)" };
    return this._badge(icon, this._t(`supply.${value}`), { key, label, color: colors[value] });
  }

  _badges(d) {
    const badges = [
      this._supplyBadge("sensor_salt", "mdi:shaker-outline", this._t("salt")),
      this._supplyBadge("sensor_rinse_aid", "mdi:water-outline", this._t("rinse_aid")),
      this._doorBadge(),
    ];
    if (!d.off && d.op === "Ready") {
      if (this.ok("sensor_energy_forecast")) {
        badges.push(
          this._badge("mdi:lightning-bolt", this._fmtState(this.st("sensor_energy_forecast")), {
            key: "sensor_energy_forecast",
            label: this._t("forecast_energy"),
            color: "var(--amber-color, #ffc107)",
          }),
        );
      }
      if (this.ok("sensor_water_forecast")) {
        badges.push(
          this._badge("mdi:water", this._fmtState(this.st("sensor_water_forecast")), {
            key: "sensor_water_forecast",
            label: this._t("forecast_water"),
            color: "var(--blue-color, #2196f3)",
          }),
        );
      }
    }
    if (!d.running) badges.push(...this._lastCycleBadges());
    return badges;
  }
}

// ---------------------------------------------------------------------------
// Oven
// ---------------------------------------------------------------------------

class OvenCard extends HomeConnectCard {
  static kind = "oven";

  _programGroup(d) {
    return d.program ? programInfo(d.program).group : null;
  }

  _setpoint() {
    const stateObj = this.st("number_oven_setpoint_temperature");
    if (!stateObj || UNAVAILABLE.has(stateObj.state)) return null;
    const pending = this._pendingVal(stateObj.entity_id);
    return {
      value: pending ?? Number(stateObj.state),
      pending: pending !== undefined,
      min: stateObj.attributes.min ?? 30,
      max: stateObj.attributes.max ?? 300,
      unit: stateObj.attributes.unit_of_measurement || "°C",
    };
  }

  _hero(d) {
    const current = this.numVal("sensor_oven_current_temperature");
    const setpoint = this._setpoint();
    const remaining = toSeconds(this.st("sensor_remaining_program_time"));
    const group = this._programGroup(d);
    const editable = setpoint && !["cleaning", "dish_automatic"].includes(group);

    let sub = "";
    if (d.op === "DelayedStart") sub = `${this._t("starts_in")} ${durationText(toSeconds(this.st("sensor_start_in")))}`;
    else if (d.running && remaining) sub = this._t("ends_at", { t: this._clock(remaining) });
    else if (d.running && setpoint && current != null && current < setpoint.value - 10) sub = this._t("preheating");

    if (!editable) {
      return dial({
        pct: current != null ? (current - 30) / 270 : 0,
        label: esc(this._t("temperature")),
        big: current != null ? this._num(current, 0) : "-",
        unit: "°C",
        sub: esc(sub),
      });
    }
    const range = setpoint.max - setpoint.min;
    const minus = setpoint.value <= setpoint.min || d.remoteControlOff;
    const plus = setpoint.value >= setpoint.max || d.remoteControlOff;
    return `
      ${dial({
        pct: (setpoint.value - setpoint.min) / range,
        marker: current != null ? (current - setpoint.min) / range : null,
        label: current != null ? esc(this._t("current", { v: `${this._num(current, 0)} ${setpoint.unit}` })) : "",
        big: this._num(setpoint.value, 0),
        unit: esc(setpoint.unit),
        sub: esc(sub),
        gap: `
          <button class="round-btn" data-action="step" data-key="number_oven_setpoint_temperature" data-delta="-5" ${minus ? "disabled" : ""} aria-label="-5">
            <ha-icon icon="mdi:minus"></ha-icon></button>
          <button class="round-btn" data-action="step" data-key="number_oven_setpoint_temperature" data-delta="5" ${plus ? "disabled" : ""} aria-label="+5">
            <ha-icon icon="mdi:plus"></ha-icon></button>`,
      }).replace('class="big"', `class="big ${setpoint.pending ? "pending" : ""}"`)}
      ${d.running ? this._stats() : ""}`;
  }

  _stats() {
    const elapsed = toSeconds(this.st("sensor_elapsed_program_time"));
    const remaining = toSeconds(this.st("sensor_remaining_program_time"));
    const cells = [
      [this._t("elapsed"), elapsed != null ? durationText(elapsed) : "-"],
      [this._t("remaining"), remaining ? durationText(remaining) : "-"],
      [this._t("end"), remaining ? this._clock(remaining) : "-"],
    ];
    return `<div class="stats">${cells
      .map(([label, value]) => `<div><div class="stat-label">${esc(label)}</div><div class="stat-value">${esc(value)}</div></div>`)
      .join("")}</div>`;
  }

  _compactHero(d) {
    const current = this.numVal("sensor_oven_current_temperature");
    const setpoint = this._setpoint();
    const remaining = toSeconds(this.st("sensor_remaining_program_time"));
    const progress = this.numVal("sensor_program_progress");
    const temps = [current != null ? `${this._num(current, 0)} °C` : null, setpoint ? `${this._num(setpoint.value, 0)} °C` : null]
      .filter(Boolean)
      .join(" → ");
    const right = d.running && remaining ? this._t("ends_at", { t: this._clock(remaining) }) : "";
    const bar = d.running && progress != null ? `<div class="bar"><div style="width:${clamp(progress, 0, 100)}%"></div></div>` : "";
    return `
      <div class="compact">
        <div class="compact-line"><span class="strong">${esc(temps)}</span><span class="muted">${esc(right)}</span></div>
        ${bar}
      </div>`;
  }

  _controls(d) {
    const group = this._programGroup(d);
    const idle = !d.running;
    const parts = [this._programSelect(d)];
    if (idle) {
      if (this._config.hide_hero && this._setpoint() && !["cleaning", "dish_automatic"].includes(group)) {
        parts.push(
          this._stepper("number_oven_setpoint_temperature", {
            label: this._t("temperature"),
            icon: "mdi:thermometer",
            step: 5,
            format: (v) => `${this._num(v, 0)} °C`,
          }),
        );
      }
      if (group === "dish_automatic") {
        parts.push(
          this._stepper("number_oven_weight", {
            label: this._t("weight"),
            icon: "mdi:scale",
            step: 100,
            format: (v) => `${this._num(v, 0)} g`,
          }),
        );
      }
      if (group?.startsWith("dish_")) {
        parts.push(this._segmented("select_oven_level", { label: this._t("level"), format: (o) => o.replace(/^level0*/, "") }));
      }
      if (d.program?.endsWith("pyrolysis")) {
        parts.push(
          this._segmented("select_pyrolysis_level", {
            label: this._t("pyrolysis_level"),
            format: (o) => o.replace(/^level0*/, ""),
          }),
        );
      }
      if (!["cleaning", "dish_automatic"].includes(group)) {
        parts.push(
          this._stepper("number_duration", {
            label: this._t("duration"),
            icon: "mdi:timer-outline",
            step: 300,
            min: 0,
            format: (v) => (v > 60 ? durationText(v) : this._t("none")),
          }),
        );
      }
      parts.push(
        this._stepper("number_oven_start_in_relative", {
          label: this._t("delay"),
          icon: "mdi:timer-plus-outline",
          step: 900,
          format: (v) => (v > 0 ? durationText(v) : this._t("none")),
        }),
      );
    }
    parts.push(this._options(d), this._hints(d), this._actions(d));
    return parts.join("");
  }

  _alerts(d) {
    const alerts = [];
    const add = (key, type, icon, text) => {
      if (this.on(key)) alerts.push(this._alert(type, icon, text));
    };
    add("binary_sensor_oven_cavity_temperature_too_high", "error", "mdi:thermometer-alert", this._t("alert.temp_high"));
    add("binary_sensor_oven_insert_food_now", "info", "mdi:food", this._t("alert.insert_food"));
    add("binary_sensor_oven_turn_food_now", "info", "mdi:rotate-3d-variant", this._t("alert.turn_food"));
    add("binary_sensor_oven_open_door", "info", "mdi:door-open", this._t("alert.open_door"));
    add("binary_sensor_oven_close_door", "info", "mdi:door-closed", this._t("alert.close_door"));
    if (this.on("binary_sensor_oven_regular_preheat_finished") || this.on("binary_sensor_oven_fast_preheat_finished")) {
      alerts.push(this._alert("success", "mdi:thermometer-check", this._t("alert.preheat_done")));
    }
    add("binary_sensor_oven_program_finished", "success", "mdi:check-circle-outline", this._t("alert.finished"));
    add("binary_sensor_oven_program_aborted", "warning", "mdi:cancel", this._t("alert.aborted"));
    add("binary_sensor_program_aborted", "warning", "mdi:cancel", this._t("alert.aborted"));
    if (this.val("sensor_confirm_action_at_appliance") === "confirm_action_at_appliance") {
      alerts.push(this._alert("info", "mdi:gesture-tap-button", this._t("alert.confirm")));
    }
    if (d.op === "Error") alerts.push(this._alert("error", "mdi:alert-circle-outline", this._t("alert.error")));
    return [...new Set(alerts)].join("");
  }

  _badges(d) {
    const badges = [this._doorBadge()];
    if (d.off && this.ok("sensor_oven_current_temperature")) {
      const current = this.numVal("sensor_oven_current_temperature");
      badges.push(
        this._badge("mdi:thermometer", `${this._num(current, 0)} °C`, {
          key: "sensor_oven_current_temperature",
          color: current > 50 ? "var(--accent)" : undefined,
        }),
      );
    }
    return badges;
  }
}

// ---------------------------------------------------------------------------
// Induction hob
// ---------------------------------------------------------------------------

class HobCard extends HomeConnectCard {
  static kind = "hob";

  getCardSize() {
    return 6;
  }

  _zone(id) {
    const state = this.val(`sensor_hob_zone_${id}_state`);
    const level = this.ok(`sensor_hob_zone_${id}_power_level`) ? this.val(`sensor_hob_zone_${id}_power_level`) : null;
    const remaining = toSeconds(this.st(`sensor_hob_zone_${id}_remaining_time`));
    const residual = this.on(`binary_sensor_hob_zone_${id}_residual_heat`) || state === "residuelheat";
    const active = state === "active" || (level && level !== "Off");
    let mode = "off";
    if (active) mode = "active";
    else if (residual) mode = "residual";
    else if (state === "notselectable") mode = "unselectable";
    const zone = HOB_ZONES.find((z) => z.id === id);
    return { id, name: zone.name, mode, level, remaining };
  }

  _zones() {
    return HOB_ZONES.filter((z) => this.eid(`sensor_hob_zone_${z.id}_state`) || this.eid(`sensor_hob_zone_${z.id}_power_level`)).map(
      (z) => this._zone(z.id),
    );
  }

  _levelText(level) {
    if (!level || level === "Off") return "0";
    if (level === "KeepWarm") return this._t("keep_warm");
    if (level === "Boost1") return "P";
    if (level === "Boost2") return "P+";
    return this._num(hobLevelNumber(level), 1);
  }

  _levelStrength(level) {
    if (level === "Boost1" || level === "Boost2") return 1;
    if (level === "KeepWarm") return 0.05;
    return clamp((hobLevelNumber(level) ?? 0) / 9, 0, 1);
  }

  _hobMap() {
    const zones = this._zones();
    if (!zones.length) return "";
    const byId = Object.fromEntries(zones.map((z) => [z.id, z]));
    const lit = (id) => byId[id] && ["active", "residual"].includes(byId[id].mode);
    const rightFlex = !!byId["340"];
    const layout = {
      "200": { rect: [20, 20, 140, 80] },
      "100": { rect: [20, 110, 140, 80] },
      "120": { rect: [20, 20, 140, 170] },
      "300": rightFlex ? { rect: [180, 20, 140, 80] } : { circle: [248, 58, 38] },
      "400": rightFlex ? { rect: [180, 110, 140, 80] } : { circle: [256, 148, 44] },
      "340": { rect: [180, 20, 140, 170] },
    };
    const hidden = new Set();
    if (lit("120")) hidden.add("100").add("200");
    else hidden.add("120");
    if (lit("340")) hidden.add("300").add("400");
    else hidden.add("340");

    const shapes = zones
      .filter((z) => !hidden.has(z.id) && layout[z.id])
      .map((z) => {
        const shape = layout[z.id];
        let cx;
        let cy;
        let svg;
        const strength = z.mode === "active" ? this._levelStrength(z.level) : 0;
        const fill = z.mode === "active" ? `fill-opacity:${(0.28 + strength * 0.6).toFixed(2)}` : "";
        if (shape.rect) {
          const [x, y, w, h] = shape.rect;
          cx = x + w / 2;
          cy = y + h / 2;
          svg = `<rect class="shape" x="${x}" y="${y}" width="${w}" height="${h}" rx="16" style="${fill}"></rect>`;
        } else {
          const [x, y, r] = shape.circle;
          cx = x;
          cy = y;
          svg = `<circle class="shape" cx="${x}" cy="${y}" r="${r}" style="${fill}"></circle>`;
        }
        const name = this._t(`zones.${z.name}`);
        let label = "";
        if (z.mode === "active") {
          const text = this._levelText(z.level);
          const color = strength > 0.45 ? "#fff" : "var(--primary-text-color)";
          const timer = z.remaining > 0 ? durationText(z.remaining) : "";
          label = `
            <text class="lvl ${text.length > 3 ? "small" : ""}" x="${cx}" y="${timer ? cy - 8 : cy}" style="fill:${color}">${esc(text)}</text>
            ${timer ? `<text class="tmr" x="${cx}" y="${cy + 20}" style="fill:${color}">${esc(timer)}</text>` : ""}`;
        } else if (z.mode === "residual") {
          label = `<text class="lvl" x="${cx}" y="${cy}">H</text>`;
        }
        const desc = `${name}: ${this._t(`zone_mode.${z.mode}`)}${z.mode === "active" ? ` ${this._levelText(z.level)}` : ""}`;
        return `
          <g class="zone ${z.mode}" data-action="zone" data-zone="${z.id}" role="button" tabindex="0" aria-label="${esc(desc)}">
            <title>${esc(desc)}</title>${svg}${label}
          </g>`;
      })
      .join("");

    const anyLit = zones.some((z) => z.mode === "active" || z.mode === "residual");
    return `
      <svg class="hob" viewBox="0 0 340 210" role="group">
        <rect class="glass" x="0.5" y="0.5" width="339" height="209" rx="18"></rect>
        ${shapes}
      </svg>
      ${anyLit ? "" : `<div class="hob-off">${esc(this._t("zones_all_off"))}</div>`}`;
  }

  _offBody(d) {
    if (d.offline) return super._offBody(d);
    return this._hobMap();
  }

  _body(d) {
    return [this._hobMap(), `<div class="controls">${this._options(d, ["switch_child_lock"])}${this._hints(d)}</div>`].join("");
  }

  _alerts(d) {
    const alerts = [];
    if (this.val("sensor_confirm_action_at_appliance") === "confirm_action_at_appliance") {
      alerts.push(this._alert("info", "mdi:gesture-tap-button", this._t("alert.confirm")));
    }
    if (d.op === "Error") alerts.push(this._alert("error", "mdi:alert-circle-outline", this._t("alert.error")));
    return alerts.join("");
  }

  _badges() {
    return this._zones()
      .filter((z) => z.mode === "active" || z.mode === "residual")
      .map((z) => {
        const name = this._t(`zones.${z.name}`);
        if (z.mode === "residual") {
          return this._badge("mdi:heat-wave", this._t("zone_mode.residual"), {
            key: `binary_sensor_hob_zone_${z.id}_residual_heat`,
            label: name,
            color: "var(--amber-color, #ffc107)",
          });
        }
        const timer = z.remaining > 0 ? ` · ${durationText(z.remaining)}` : "";
        return this._badge("mdi:fire", `${this._levelText(z.level)}${timer}`, {
          key: `sensor_hob_zone_${z.id}_power_level`,
          label: name,
          color: "var(--accent)",
        });
      });
  }

  _onAction(action, el) {
    if (action === "zone") {
      const zone = this._zone(el.dataset.zone);
      this._draft = {
        id: zone.id,
        level: zone.mode === "active" && zone.level !== "Off" ? zone.level : "50",
        timer: zone.remaining > 0 ? Math.round(zone.remaining / 60) * 60 : 0,
      };
      this._openSheet({ type: "zone" });
    } else if (action === "zone-level") {
      this._draft.level = el.dataset.level;
      this._renderSheet();
    } else if (action === "zone-timer") {
      this._draft.timer = clamp(this._draft.timer + Number(el.dataset.delta), 0, 99 * 60);
      this._renderSheet();
    } else if (action === "zone-start" || action === "zone-stop") {
      const zone = HOB_ZONES.find((z) => z.id === this._draft.id);
      this._call(DOMAIN, "start_hob_program", {
        device_id: this._config.device_id,
        zone: zone.name,
        power_level: action === "zone-stop" ? 0 : hobLevelIndex(this._draft.level),
        duration: action === "zone-stop" ? 0 : this._draft.timer,
      });
      this._dialog.close();
    }
  }

  _sheetHead() {
    if (this._sheet.type !== "zone") return super._sheetHead();
    const zone = HOB_ZONES.find((z) => z.id === this._draft.id);
    return `
      <div class="sheet-head">
        <div class="sheet-title">${esc(this._t(`zones.${zone.name}`))}</div>
        <button class="icon-btn" data-action="close" aria-label="Close"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>`;
  }

  // Zone control relies on a service that not every version of the integration provides
  _canControlZones() {
    return !!this._hass.services?.[DOMAIN]?.start_hob_program;
  }

  _sheetBody() {
    if (this._sheet.type !== "zone") return super._sheetBody();
    const zone = this._zone(this._draft.id);
    const status =
      zone.mode === "active"
        ? `<div class="big">${esc(this._levelText(zone.level))}</div>
           <span class="muted">${esc(this._t("zone_mode.active"))}${zone.remaining > 0 ? ` · ${esc(durationText(zone.remaining))}` : ""}</span>`
        : `<span class="muted">${esc(this._t(`zone_mode.${zone.mode}`))}</span>`;
    const levels = HOB_LEVELS.map(
      (level) => `
      <button class="${level === this._draft.level ? "sel" : ""}" data-action="zone-level" data-level="${level}"
        aria-pressed="${level === this._draft.level}">${esc(this._levelText(level))}</button>`,
    ).join("");
    const timer = this._draft.timer;
    const disabled = this._d.remoteControlOff || this._d.offline;
    if (!this._canControlZones()) {
      return `
        <div class="sheet-body">
          <div class="zone-hero">${status}</div>
          <div class="note">${esc(this._t("zone_unsupported"))}</div>
        </div>`;
    }
    return `
      <div class="sheet-body">
        <div class="zone-hero">${status}</div>
        <div class="section-label">${esc(this._t("power_level"))}</div>
        <div class="levels">${levels}</div>
        <div class="row">
          <div class="row-label"><ha-icon icon="mdi:timer-outline"></ha-icon><span>${esc(this._t("timer"))}</span></div>
          <div class="stepper">
            <button data-action="zone-timer" data-delta="-60" ${timer <= 0 ? "disabled" : ""} aria-label="-"><ha-icon icon="mdi:minus"></ha-icon></button>
            <span class="num">${timer > 0 ? esc(durationText(timer)) : esc(this._t("none"))}</span>
            <button data-action="zone-timer" data-delta="60" aria-label="+"><ha-icon icon="mdi:plus"></ha-icon></button>
          </div>
        </div>
        <div class="actions">
          <button class="ctrl" data-action="zone-stop" ${disabled || zone.mode !== "active" ? "disabled" : ""}>
            <ha-icon icon="mdi:power"></ha-icon><span>${esc(this._t("zone_stop"))}</span></button>
          <button class="ctrl primary" data-action="zone-start" ${disabled ? "disabled" : ""}>
            <ha-icon icon="mdi:fire"></ha-icon><span>${esc(this._t("zone_start"))}</span></button>
        </div>
        <div class="note">${esc(this._t("zone_note"))}</div>
      </div>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editor
// ---------------------------------------------------------------------------

class HomeConnectCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config) return;
    const kind = KINDS[this.kind] ? this.kind : "washer";
    const lang = (this._hass.locale?.language || this._hass.language || "en").startsWith("it") ? "it" : "en";
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => {
        const config = { ...ev.detail.value };
        for (const key of Object.keys(config)) {
          if (config[key] === "" || config[key] === undefined) delete config[key];
        }
        this._config = config;
        fire(this, "config-changed", { config });
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._config;
    this._form.schema = [
      {
        name: "device_id",
        required: true,
        selector: { device: { filter: KINDS[kind].models.map((model) => ({ integration: DOMAIN, model })) } },
      },
      { name: "name", selector: { text: {} } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "color", selector: { ui_color: { default_color: KINDS[kind].color } } },
          ...(kind === "hob" ? [] : [{ name: "hide_hero", selector: { boolean: {} } }]),
        ],
      },
    ];
    this._form.computeLabel = (schema) => STRINGS[lang].editor[schema.name] ?? schema.name;
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const CARD_CLASSES = { washer: WasherCard, dishwasher: DishwasherCard, oven: OvenCard, hob: HobCard };

if (!customElements.get("homeconnect-card-editor")) {
  customElements.define("homeconnect-card-editor", HomeConnectCardEditor);
}

const pageLang = (document.querySelector("home-assistant")?.hass?.language || navigator.language || "en").startsWith("it")
  ? "it"
  : "en";

window.customCards = window.customCards || [];
for (const [kind, cardClass] of Object.entries(CARD_CLASSES)) {
  const { tag } = KINDS[kind];
  if (customElements.get(tag)) continue;
  customElements.define(tag, cardClass);
  window.customCards.push({
    type: tag,
    name: `Home Connect ${STRINGS[pageLang].card[kind]}`,
    description: STRINGS[pageLang].card.description,
    preview: true,
  });
}

console.info(
  `%c BOSCH HOME CONNECT CARDS %c ${VERSION} `,
  "color: white; background: #009ac7; font-weight: 700;",
  "color: #009ac7; background: white; font-weight: 700;",
);
