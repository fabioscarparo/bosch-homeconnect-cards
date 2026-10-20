/*
 * Bosch Home Connect cards for Home Assistant
 * https://github.com/fabioscarparo/bosch-homeconnect-cards
 *
 * Five Lovelace cards for the appliances of the Home Connect Local
 * integration (homeconnect_ws): washer, dryer, dishwasher, oven and induction hob.
 * Entities are looked up from the device by their translation_key,
 * so the cards keep working when entity_ids are renamed.
 *
 * MIT License - Copyright (c) 2026 Fabio Scarparo
 */

const VERSION = "0.6.6";
const DOMAIN = "homeconnect_ws";
const UNAVAILABLE = new Set(["unavailable", "unknown"]);

const KINDS = {
  washer: {
    tag: "homeconnect-washer-card",
    models: ["Washer", "WasherDryer"],
    icon: "mdi:washing-machine",
    programIcon: "mdi:tshirt-crew-outline",
    color: "blue",
  },
  dryer: {
    tag: "homeconnect-dryer-card",
    models: ["Dryer"],
    icon: "mdi:tumble-dryer",
    programIcon: "mdi:tshirt-crew-outline",
    color: "deep-purple",
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

// Italian and German, English for any other language
function cardLang(language) {
  const code = String(language || "en").toLowerCase();
  return ["it", "de"].find((lang) => code.startsWith(lang)) || "en";
}

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
    usage: "Consumi",
    energy: "Energia",
    water: "Acqua",
    this_month: "Questo mese",
    since: "Dal {d}",
    last_months: "Ultimi 6 mesi",
    this_year: "Quest'anno",
    per_cycle: "Media per ciclo",
    total: "Totale",
    usage_none: "Le statistiche compaiono dopo il primo ciclo registrato da Home Assistant",
    usage_error: "Non è stato possibile leggere le statistiche di Home Assistant",
    forecast_energy: "Energia prevista",
    forecast_water: "Acqua prevista",
    salt: "Sale",
    rinse_aid: "Brillantante",
    supply: { empty: "Esaurito", nearly_empty: "Quasi finito", full: "OK" },
    door: { open: "Porta aperta", closed: "Porta chiusa", locked: "Porta bloccata", ajar: "Porta socchiusa" },
    spin: "Centrifuga",
    spin_off: "Senza centrifuga",
    cold: "Fredda",
    rpm: "{n} giri/min",
    rinse_plus: "Extra risciacquo",
    pretreatment: "Pretrattamento",
    pretreatment_values: { prewash: "Prelavaggio", handsoak: "Ammollo" },
    soak_temperature: "Temperatura ammollo",
    soak_duration: "Durata ammollo",
    steam_intensity: "Intensità vapore",
    intensity: { middle: "Media", high: "Alta" },
    multiple_soak: "Ammollo multiplo",
    stains: "Antimacchie",
    load_recommendation: "Carico consigliato",
    laundry_load: "Carico",
    drying_target: "Livello di asciugatura",
    drying_targets: {
      irondry: "Stiratura con ferro",
      gentledry: "Leggermente umido",
      cupboarddry: "Asciugatura normale",
      cupboarddryplus: "Asciugatura normale plus",
      extradry: "Asciugatura extra",
    },
    wrinkle_guard: "Antipiega",
    wrinkle_duration: "Durata antipiega",
    app_program: "Programma scelto nell'app",
    refresher: "Refresher",
    refresher_values: { shirt1: "1 camicia", shirt5: "5 camicie", business: "Business" },
    wash_spin: "Centrifuga del lavaggio",
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
      drying_done: "Asciugatura terminata",
      condensate: "Svuota il serbatoio della condensa",
      lint_filter: "Pulisci il filtro lanugine",
      self_cleaning: "Pulisci il modulo autopulente",
      easyclean: "Pulisci il filtro EasyClean",
      refresher: "Ricarica il refresher",
      care_cycle: "È consigliato un ciclo di cura",
      evaporator: "L'evaporatore è ghiacciato",
    },
    hint_remote_start: "Avvio remoto non attivo: attivalo sull'elettrodomestico per avviare da qui",
    hint_close_door: "Chiudi la porta per avviare il programma",
    hint_start_unavailable:
      "Al momento l'elettrodomestico non accetta l'avvio. Controlla, per esempio, che la porta sia chiusa e l'avvio remoto attivo",
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
      Center: "Centrale",
    },
    zone_mode: { off: "Spenta", active: "Accesa", residual: "Calore residuo", unselectable: "Non selezionabile" },
    zones_all_off: "Tutte le zone spente",
    power_level: "Livello di potenza",
    keep_warm: "Caldo",
    timer: "Timer",
    zone_start: "Accendi zona",
    zone_stop: "Spegni zona",
    zone_note: "Funziona solo con il piano acceso e il controllo remoto attivo",
    zone_unsupported: "Le zone si accendono e si regolano dal piano cottura",
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
    phase: {
      None: "",
      PreRinse: "Prelavaggio",
      MainWash: "Lavaggio",
      FinalRinse: "Risciacquo finale",
      Drying: "Asciugatura",
      // Dryer
      NoPhase: "",
      DetectingLoad: "Rilevamento del carico",
      Heating: "Riscaldamento",
      CoolingDown: "Raffreddamento",
      AdditionalCoolingDown: "Raffreddamento aggiuntivo",
      GuardingWrinkle: "Antipiega",
      IronDryReached: "Stiratura con ferro",
      GentlyDryReached: "Leggermente umido",
      CupboardDryReached: "Asciugatura normale",
      CupboardDryPlusReached: "Asciugatura normale plus",
      ExtraDryReached: "Asciugatura extra",
      SlightlyDampReached: "Leggermente umido",
      CleaningHeatExchanger: "Pulizia dello scambiatore di calore",
      LaundryRefreshing: "Rinfrescamento",
    },
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
      dryer: "Asciugatrice",
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
    usage: "Consumption",
    energy: "Energy",
    water: "Water",
    this_month: "This month",
    since: "Since {d}",
    last_months: "Last 6 months",
    this_year: "This year",
    per_cycle: "Average per cycle",
    total: "Total",
    usage_none: "Statistics show up after the first cycle Home Assistant records",
    usage_error: "Couldn't read the Home Assistant statistics",
    forecast_energy: "Expected energy",
    forecast_water: "Expected water",
    salt: "Salt",
    rinse_aid: "Rinse aid",
    supply: { empty: "Empty", nearly_empty: "Low", full: "OK" },
    door: { open: "Door open", closed: "Door closed", locked: "Door locked", ajar: "Door ajar" },
    spin: "Spin",
    spin_off: "No spin",
    cold: "Cold",
    rpm: "{n} rpm",
    rinse_plus: "Rinse plus",
    pretreatment: "Pre-treatment",
    pretreatment_values: { prewash: "Prewash", handsoak: "Soak" },
    soak_temperature: "Soak temperature",
    soak_duration: "Soak duration",
    steam_intensity: "Steam intensity",
    intensity: { middle: "Medium", high: "High" },
    multiple_soak: "Multiple soak",
    stains: "Stains",
    load_recommendation: "Recommended load",
    laundry_load: "Load",
    drying_target: "Drying level",
    drying_targets: {
      irondry: "Iron dry",
      gentledry: "Gentle dry",
      cupboarddry: "Cupboard dry",
      cupboarddryplus: "Cupboard dry plus",
      extradry: "Extra dry",
    },
    wrinkle_guard: "Wrinkle guard",
    wrinkle_duration: "Wrinkle guard duration",
    app_program: "Program chosen in the app",
    refresher: "Refresher",
    refresher_values: { shirt1: "1 shirt", shirt5: "5 shirts", business: "Business" },
    wash_spin: "Wash spin speed",
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
      drying_done: "Drying finished",
      condensate: "Empty the condensate container",
      lint_filter: "Clean the lint filter",
      self_cleaning: "Clean the self-cleaning module",
      easyclean: "Clean the EasyClean filter",
      refresher: "Refill the refresher",
      care_cycle: "A care cycle is recommended",
      evaporator: "The evaporator is frozen",
    },
    hint_remote_start: "Remote start is off: turn it on at the appliance to start from here",
    hint_close_door: "Close the door to start the program",
    hint_start_unavailable:
      "The appliance doesn't accept a start right now. Check, for example, that the door is closed and remote start is on",
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
      Center: "Center",
    },
    zone_mode: { off: "Off", active: "On", residual: "Residual heat", unselectable: "Not selectable" },
    zones_all_off: "All zones are off",
    power_level: "Power level",
    keep_warm: "Warm",
    timer: "Timer",
    zone_start: "Turn zone on",
    zone_stop: "Turn zone off",
    zone_note: "Works only with the hob on and remote control active",
    zone_unsupported: "Zones are switched on and adjusted at the hob",
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
    phase: {
      None: "",
      PreRinse: "Pre-rinse",
      MainWash: "Main wash",
      FinalRinse: "Final rinse",
      Drying: "Drying",
      // Dryer
      NoPhase: "",
      DetectingLoad: "Detecting the load",
      Heating: "Heating",
      CoolingDown: "Cooling down",
      AdditionalCoolingDown: "Extra cooling down",
      GuardingWrinkle: "Wrinkle guard",
      IronDryReached: "Iron dry",
      GentlyDryReached: "Gentle dry",
      CupboardDryReached: "Cupboard dry",
      CupboardDryPlusReached: "Cupboard dry plus",
      ExtraDryReached: "Extra dry",
      SlightlyDampReached: "Slightly damp",
      CleaningHeatExchanger: "Cleaning the heat exchanger",
      LaundryRefreshing: "Refreshing",
    },
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
      dryer: "Dryer",
      dishwasher: "Dishwasher",
      oven: "Oven",
      hob: "Induction hob",
      description: "Status and controls for a Bosch Home Connect appliance",
    },
  },
  de: {
    op: {
      Inactive: "Inaktiv",
      Ready: "Bereit",
      DelayedStart: "Startzeitvorwahl",
      Run: "Läuft",
      Pause: "Pausiert",
      ActionRequired: "Aktion erforderlich",
      Finished: "Beendet",
      Error: "Fehler",
      Aborting: "Wird abgebrochen",
    },
    off: "Aus",
    offline: "Nicht verbunden",
    offline_hint: "Das Gerät ist im Netzwerk nicht erreichbar",
    program: "Programm",
    choose_program: "Programm wählen",
    search: "Programme suchen",
    no_results: "Keine Programme gefunden",
    start: "Starten",
    start_delayed: "Start in {t}",
    pause: "Pause",
    resume: "Fortsetzen",
    stop: "Stopp",
    power_on: "Einschalten",
    power: "Ein/Aus",
    settings: "Geräteeinstellungen",
    estimated: "Geschätzte Dauer",
    remaining: "Verbleibend",
    starts_in: "Start in",
    ends_at: "Ende um {t}",
    finished_at: "Beendet um {t}",
    elapsed: "Vergangen",
    end: "Ende",
    duration: "Dauer",
    delay: "Startzeitvorwahl",
    none: "Aus",
    temperature: "Temperatur",
    current: "Aktuell {v}",
    weight: "Gewicht",
    level: "Stufe",
    pyrolysis_level: "Pyrolyse-Stufe",
    preheating: "Vorheizen",
    last_cycle: "Letztes Programm",
    usage: "Verbrauch",
    energy: "Energie",
    water: "Wasser",
    this_month: "Dieser Monat",
    since: "Seit {d}",
    last_months: "Letzte 6 Monate",
    this_year: "Dieses Jahr",
    per_cycle: "Durchschnitt pro Programm",
    total: "Gesamt",
    usage_none: "Die Statistiken erscheinen nach dem ersten Programm, das Home Assistant aufzeichnet",
    usage_error: "Die Statistiken von Home Assistant konnten nicht gelesen werden",
    forecast_energy: "Erwartete Energie",
    forecast_water: "Erwartetes Wasser",
    salt: "Salz",
    rinse_aid: "Klarspüler",
    supply: { empty: "Leer", nearly_empty: "Fast leer", full: "OK" },
    door: { open: "Tür offen", closed: "Tür geschlossen", locked: "Tür verriegelt", ajar: "Tür angelehnt" },
    spin: "Schleudern",
    spin_off: "Ohne Schleudern",
    cold: "Kalt",
    rpm: "{n} U/min",
    rinse_plus: "Spülen Plus",
    pretreatment: "Vorbehandlung",
    pretreatment_values: { prewash: "Vorwäsche", handsoak: "Einweichen" },
    soak_temperature: "Einweichtemperatur",
    soak_duration: "Einweichdauer",
    steam_intensity: "Dampfintensität",
    intensity: { middle: "Mittel", high: "Hoch" },
    multiple_soak: "Mehrfach-Einweichen",
    stains: "Flecken",
    load_recommendation: "Empfohlene Beladung",
    laundry_load: "Beladung",
    drying_target: "Trocknungsgrad",
    drying_targets: {
      irondry: "Bügeltrocken",
      gentledry: "Schonend trocken",
      cupboarddry: "Schranktrocken",
      cupboarddryplus: "Schranktrocken plus",
      extradry: "Extratrocken",
    },
    wrinkle_guard: "Knitterschutz",
    wrinkle_duration: "Knitterschutz-Dauer",
    app_program: "In der App gewähltes Programm",
    refresher: "Refresher",
    refresher_values: { shirt1: "1 Hemd", shirt5: "5 Hemden", business: "Business" },
    wash_spin: "Schleuderdrehzahl der Wäsche",
    alert: {
      foam: "Zu viel Schaum erkannt",
      aborted: "Programm abgebrochen",
      insert_food: "Jetzt das Gargut einschieben",
      turn_food: "Jetzt das Gargut wenden",
      preheat_done: "Vorheizen beendet",
      temp_high: "Garraumtemperatur zu hoch",
      confirm: "Bestätige die Aktion am Gerät",
      open_door: "Öffne die Tür",
      close_door: "Schließe die Tür",
      finished: "Programm beendet",
      salt: "Salz nachfüllen",
      rinse_aid: "Klarspüler nachfüllen",
      reload: "Wäsche nachlegen möglich: pausiere und öffne die Tür",
      reload_now: "Du kannst die Tür öffnen und Wäsche nachlegen",
      error: "Das Gerät meldet einen Fehler",
      drying_done: "Trocknen beendet",
      condensate: "Kondensatbehälter leeren",
      lint_filter: "Flusensieb reinigen",
      self_cleaning: "Selbstreinigungsmodul reinigen",
      easyclean: "EasyClean-Filter reinigen",
      refresher: "Refresher nachfüllen",
      care_cycle: "Ein Pflegeprogramm wird empfohlen",
      evaporator: "Der Verdampfer ist vereist",
    },
    hint_remote_start: "Fernstart ist aus: Schalte ihn am Gerät ein, um hier zu starten",
    hint_close_door: "Schließe die Tür, um das Programm zu starten",
    hint_start_unavailable:
      "Das Gerät nimmt gerade keinen Start an. Prüfe zum Beispiel, ob die Tür geschlossen und Fernstart eingeschaltet ist",
    hint_remote_off: "Fernsteuerung ist nicht aktiv",
    hint_local: "Wird gerade am Gerät bedient",
    child_lock: "Kindersicherung",
    zones: {
      FrontLeft: "Vorne links",
      Left: "Flex links",
      RearLeft: "Hinten links",
      RearRight: "Hinten rechts",
      Right: "Flex rechts",
      FrontRight: "Vorne rechts",
      Center: "Mitte",
    },
    zone_mode: { off: "Aus", active: "An", residual: "Restwärme", unselectable: "Nicht wählbar" },
    zones_all_off: "Alle Kochzonen sind aus",
    power_level: "Leistungsstufe",
    keep_warm: "Warm",
    timer: "Timer",
    zone_start: "Kochzone einschalten",
    zone_stop: "Kochzone ausschalten",
    zone_note: "Funktioniert nur bei eingeschaltetem Kochfeld und aktiver Fernsteuerung",
    zone_unsupported: "Kochzonen werden am Kochfeld eingeschaltet und eingestellt",
    groups: {
      favorite: "Favoriten",
      heatingmode: "Heizarten",
      dish_automatic: "Automatikprogramme",
      dish_recommendation: "Empfohlene Gerichte",
      cleaning: "Reinigung",
      subsequentmode: "Nach dem Garen",
      other: "Programme",
    },
    favorite: "Favorit {n}",
    phase: {
      None: "",
      PreRinse: "Vorspülen",
      MainWash: "Reinigen",
      FinalRinse: "Klarspülen",
      Drying: "Trocknen",
      // Dryer
      NoPhase: "",
      DetectingLoad: "Beladungserkennung",
      Heating: "Aufheizen",
      CoolingDown: "Abkühlen",
      AdditionalCoolingDown: "Zusätzliches Abkühlen",
      GuardingWrinkle: "Knitterschutz",
      IronDryReached: "Bügeltrocken",
      GentlyDryReached: "Schonend trocken",
      CupboardDryReached: "Schranktrocken",
      CupboardDryPlusReached: "Schranktrocken plus",
      ExtraDryReached: "Extratrocken",
      SlightlyDampReached: "Leicht feucht",
      CleaningHeatExchanger: "Wärmetauscher reinigen",
      LaundryRefreshing: "Auffrischen",
    },
    no_device: "Wähle im Karteneditor ein Gerät",
    device_missing: "Gerät nicht gefunden",
    error: "Befehl fehlgeschlagen: {e}",
    editor: {
      device_id: "Gerät",
      name: "Name",
      color: "Farbe",
      hide_hero: "Kompakte Ansicht",
    },
    card: {
      washer: "Waschmaschine",
      dryer: "Trockner",
      dishwasher: "Geschirrspüler",
      oven: "Backofen",
      hob: "Induktionskochfeld",
      description: "Status und Bedienung eines Bosch Home Connect Geräts",
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
    // Dryer, as the Home Connect app names them
    "dryer:bedlinens": "Lenzuola",
    "dryer:coldrefresh": "Refresh freddo",
    "dryer:connecteddry": "Smart Dry",
    "dryer:delicates": "Delicati",
    "dryer:depthcare": "Cura profonda",
    "dryer:downfeathers": "Piumini",
    "dryer:mix": "Carico misto",
    "dryer:cottoneco": "Eco",
    "dryer:ecocottoneu23": "Eco",
    "dryer:hygiene": "Allergy Plus",
    "dryer:inbasket": "Lana con cestello",
    "dryer:inbasketplushtoys": "Peluches con cestello",
    "dryer:jeans": "Jeans",
    "dryer:pillow": "Piumini",
    "dryer:quickcare": "Cura rapida",
    "dryer:shirtblouses": "Camicie",
    "dryer:silentdry": "Silent dry",
    "dryer:sportswear": "Sport/Fitness",
    "dryer:super40": "Rapido 40 min.",
    "dryer:synthetic": "Sintetici",
    "dryer:timecold": "Programma a tempo a freddo",
    "dryer:timewarm": "Programma a tempo caldo",
    "dryer:towels": "Asciugamani",
    "dryer:waterproof": "Impermeabilizzazione",
    "dryer:woolfinish": "Lana finish",
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
    "dryer:bedlinens": "Bed linen",
    "dryer:coldrefresh": "Cold refresh",
    "dryer:connecteddry": "Connected Dry",
    "dryer:delicates": "Delicates",
    "dryer:depthcare": "Deep care",
    "dryer:downfeathers": "Down",
    "dryer:cottoneco": "Eco cotton",
    "dryer:ecocottoneu23": "Eco cotton",
    "dryer:hygiene": "Hygiene",
    "dryer:inbasket": "Wool basket",
    "dryer:inbasketplushtoys": "Soft toys in basket",
    "dryer:jeans": "Jeans",
    "dryer:pillow": "Pillows",
    "dryer:quickcare": "Quick care",
    "dryer:shirtblouses": "Shirts",
    "dryer:silentdry": "Silent Dry",
    "dryer:sportswear": "Sportswear",
    "dryer:super40": "Super 40'",
    "dryer:synthetic": "Synthetics",
    "dryer:timecold": "Time cold",
    "dryer:timewarm": "Time warm",
    "dryer:towels": "Towels",
    "dryer:waterproof": "Waterproofing",
    "dryer:woolfinish": "Wool finish",
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
  de: {
    cotton: "Baumwolle",
    darkwash: "Jeans/Dunkle Wäsche",
    delicatessilk: "Fein/Seide",
    delicatessilkmp: "Anti-Mikroplastik",
    drumclean70: "Trommelreinigung 70°",
    easycare: "Pflegeleicht",
    goldencycle: "Golden Cycle",
    eco4060: "Eco 40-60",
    mix: "Mix",
    outdoor: "Outdoor",
    rinse: "Spülen",
    sensitive: "Sensitiv",
    shirtsblouses: "Hemden/Blusen",
    sportfitness: "Sportbekleidung",
    spindrain: "Schleudern/Abpumpen",
    steaming: "Dampf",
    super1530: "Super 15'/30'",
    wool: "Wolle",
    "dryer:bedlinens": "Bettwäsche",
    "dryer:coldrefresh": "Kalt auffrischen",
    "dryer:connecteddry": "Connected Dry",
    "dryer:delicates": "Feinwäsche",
    "dryer:depthcare": "Tiefenpflege",
    "dryer:downfeathers": "Daunen",
    "dryer:cottoneco": "Baumwolle Eco",
    "dryer:ecocottoneu23": "Baumwolle Eco",
    "dryer:hygiene": "Hygiene",
    "dryer:inbasket": "Wollkorb",
    "dryer:inbasketplushtoys": "Kuscheltiere im Korb",
    "dryer:jeans": "Jeans",
    "dryer:pillow": "Kopfkissen",
    "dryer:quickcare": "Schnellpflege",
    "dryer:shirtblouses": "Hemden/Blusen",
    "dryer:silentdry": "Silent Dry",
    "dryer:sportswear": "Sportbekleidung",
    "dryer:super40": "Super 40'",
    "dryer:synthetic": "Pflegeleicht",
    "dryer:timecold": "Zeitprogramm kalt",
    "dryer:timewarm": "Zeitprogramm warm",
    "dryer:towels": "Handtücher",
    "dryer:waterproof": "Imprägnieren",
    "dryer:woolfinish": "Wolle finish",
    auto1: "Auto 35-45°",
    auto2: "Auto 45-65°",
    auto3: "Auto 65-75°",
    eco50: "Eco 50°",
    glas40: "Glas 40°",
    intensiv70: "Intensiv 70°",
    intensivpower: "Intensiv Power",
    kurz60: "Speed 60°",
    machinecare: "Maschinenpflege",
    mixedload: "Mischbeladung",
    nightwash: "Leise 50°",
    prerinse: "Vorspülen",
    quick45: "Schnell 45°",
    quick65: "Schnell 65°",
    quickd: "Quick D",
    super60: "Super 60°",
    "3dhotair": "3D-Heißluft",
    airfry: "Air Fry",
    bottomheating: "Unterhitze",
    defrost: "Auftauen",
    grilllargearea: "Grill, große Fläche",
    grillsmallarea: "Grill, kleine Fläche",
    hotairgentle: "Heißluft sanft",
    hotairgrilling: "Umluftgrillen",
    keepwarm: "Warmhalten",
    letrest: "Ruhen lassen",
    pizzasetting: "Pizzastufe",
    preheating: "Vorheizen",
    preheatovenware: "Geschirr vorwärmen",
    slowcook: "Niedertemperaturgaren",
    topbottomheating: "Ober-/Unterhitze",
    topbottomheatingeco: "Ober-/Unterhitze Eco",
    drying: "Trocknen",
    easyclean: "EasyClean",
    pyrolysis: "Pyrolyse",
    "subsequentmode:continuecooking": "Weitergaren",
    "subsequentmode:keepwarm": "Warmhalten",
    "subsequentmode:leavetorest": "Ruhen lassen",
    "subsequentmode:startbaking": "Backen starten",
    belly: "Schweinebauch",
    bonelesslegoflambmedium: "Lammkeule ohne Knochen, medium",
    bonelessporkneckjoint: "Schweinenacken ohne Knochen",
    gooselegs: "Gänsekeulen",
    jointofporkwithcracklingegshoulder: "Schweinebraten mit Kruste",
    jointofveallean: "Kalbsbraten, mager",
    jointofvealmarbled: "Kalbsbraten, durchwachsen",
    legoflambonthebonewelldone: "Lammkeule mit Knochen, durchgegart",
    meatloafmadefromfreshmincedmeat: "Hackbraten",
    pavlova: "Pavlova",
    potroastedbeef: "Rinderschmorbraten",
    roastporkloin: "Schweinelendenbraten",
    sirloinmedium: "Roastbeef, medium",
    sirloinrare: "Roastbeef, englisch",
    slowroastjoint: "Schmorbraten, langsam gegart",
    stewwithmeat: "Eintopf mit Fleisch",
    stewwithvegetables: "Eintopf mit Gemüse",
    turkeybreast: "Putenbrust",
    unstuffedduck: "Ente, ungefüllt",
    unstuffedsmallturkey: "Babypute, ungefüllt",
    vealossobuco: "Kalbs-Ossobuco",
    bakesavouryfreshcookedingredients: "Herzhafter Auflauf",
    bonlessrolledshoulder: "Schweinerollbraten",
    chickenparts: "Hähnchenteile",
    chips: "Pommes frites",
    freshlasagne: "Lasagne, frisch",
    fruitcrumble: "Obstcrumble",
    halvedchicken: "Hähnchen, halbiert",
    loinjoint: "Lendenbraten",
    muffins: "Muffins",
    partcookedbreadrollsorbaguette: "Aufbackbrötchen oder Baguette",
    pizzathickcrust1slicefrozen: "Pizza mit dickem Boden, tiefgekühlt",
    pizzathincrust1slice: "Pizza mit dünnem Boden",
    porkroast: "Schweinebraten",
    potatogratinrawingredients4cmdeep: "Kartoffelgratin",
    roastwholefish: "Fisch, ganz",
    scones: "Scones",
    topsideandtoprump: "Oberschale und Tafelspitz",
    turkeycrownbritishstyle: "Putenkrone",
    wholebakedpotatoes: "Backkartoffeln, ganz",
    powerlevelmode: "Leistungsstufe",
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
  // Washer options, named like in the Home Connect app
  switch_laundry_water_plus: { icon: "mdi:water-plus", it: "Water Plus", en: "Water Plus", de: "Wasser Plus" },
  switch_laundry_prewash: { icon: "mdi:tray-arrow-up", it: "Prelavaggio", en: "Prewash", de: "Vorwäsche" },
  switch_laundry_rinse_hold: { icon: "mdi:waves", it: "Ammollo a fine ciclo", en: "Rinse hold", de: "Spülstopp" },
  switch_laundry_less_ironing: { icon: "mdi:iron-outline", it: "Stirameno", en: "Less ironing", de: "Bügelleicht" },
  switch_laundry_soak: { icon: "mdi:bucket-outline", it: "Ammollo", en: "Soak", de: "Einweichen" },
  switch_laundry_hygienic_steam: { icon: "mdi:kettle-steam-outline", it: "Vapore", en: "Steam", de: "Dampf" },
  switch_laundry_intensive_plus: { icon: "mdi:shimmer", it: "Intensive Plus", en: "Intensive Plus", de: "Intensiv Plus" },
  switch_laundry_mini_load: { icon: "mdi:tshirt-crew-outline", it: "Mini", en: "Mini", de: "Mini" },
  switch_laundry_silent_mode: { icon: "mdi:weather-night", it: "Silenzioso", en: "Silent", de: "Leise" },
  switch_laundry_silent_wash: { icon: "mdi:weather-night", it: "Silenzioso", en: "Silent", de: "Leise" },
  switch_laundry_speed_perfect: { icon: "mdi:speedometer", it: "SpeedPerfect", en: "SpeedPerfect", de: "SpeedPerfect" },
  switch_laundry_common_speed_perfect: { icon: "mdi:speedometer", it: "SpeedPerfect", en: "SpeedPerfect", de: "SpeedPerfect" },
  switch_laundry_water_and_rinse_plus1: { icon: "mdi:water-sync", it: "Acqua e risciacquo +1", en: "Water and rinse +1", de: "Wasser und Spülen +1" },
  switch_laundry_disinfectant: { icon: "mdi:bottle-tonic-plus-outline", it: "Disinfettante", en: "Disinfectant", de: "Desinfektion" },
  switch_laundry_low_temperature_hygiene: { icon: "mdi:shield-check-outline", it: "Igiene a bassa temperatura", en: "Low temperature hygiene", de: "Hygiene bei niedriger Temperatur" },
  switch_laundry_rinse_plus: { icon: "mdi:water-sync", it: "Risciacquo extra", en: "Rinse plus", de: "Spülen Plus" },
  switch_half_load: { icon: "mdi:circle-half-full", it: "Mezzo carico", en: "Half load", de: "Halbe Beladung" },
  // Dryer options
  switch_laundry_gentle: { icon: "mdi:feather", it: "Delicato", en: "Gentle", de: "Schonen" },
  switch_laundry_hygiene: { icon: "mdi:shield-check-outline", it: "Igiene", en: "Hygiene", de: "Hygiene" },
  switch_laundry_wrinkle_guard_boost: { icon: "mdi:hanger", it: "Antipiega boost", en: "Wrinkle guard boost", de: "Knitterschutz Boost" },
  switch_hygiene_plus: { icon: "mdi:shimmer", it: "Hygiene Plus", en: "Hygiene Plus", de: "Hygiene Plus" },
  switch_vario_speed_plus: { icon: "mdi:rabbit", it: "VarioSpeed Plus", en: "VarioSpeed Plus", de: "VarioSpeed Plus" },
  switch_silence_on_demand: { icon: "mdi:volume-off", it: "Silenzio su richiesta", en: "Silence on demand", de: "Leise auf Knopfdruck" },
  switch_extra_dry: { icon: "mdi:weather-sunny", it: "Asciugatura extra", en: "Extra dry", de: "Extra Trocken" },
  switch_oven_fast_pre_heat: { icon: "mdi:fast-forward", it: "Preriscaldamento rapido", en: "Fast preheat", de: "Schnellaufheizen" },
  switch_oven_steam_boost: { icon: "mdi:weather-fog", it: "Getto di vapore", en: "Steam boost", de: "Dampfstoß" },
  switch_oven_cavity_light: { icon: "mdi:lightbulb-outline", it: "Luce interna", en: "Oven light", de: "Backofenlicht", live: true },
  switch_child_lock: { icon: "mdi:lock-outline", it: "Blocco bambini", en: "Child lock", de: "Kindersicherung", live: true },
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
  // The large middle zone of 80 cm hobs such as the Bosch PXV875DV1E
  { id: "500", name: "Center" },
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

// Versions of the integration differ: Home Connect Local by chris-mc1 and the fork by
// vemboy200 name some entities differently. The cards use the first key and fall back
// to the others when it's missing.
const KEY_ALIASES = {
  button_oven_pause: ["button_pause_program"],
  button_oven_resume: ["button_resume_program"],
  sensor_oven_current_temperature: ["sensor_oven_current_temperature_group"],
  switch_oven_cavity_light: ["light_oven_cavity"],
  binary_sensor_oven_program_finished: ["binary_sensor_program_finished"],
  number_oven_start_in_relative: ["number_start_in"],
  sensor_energy_consumed: ["sensor_energy_consumed_total"],
  sensor_water_consumed: ["sensor_water_consumed_total"],
};

// Some versions report states in lower case (run, mainwash, keepwarm)
const OP_STATES = ["Inactive", "Ready", "DelayedStart", "Run", "Pause", "ActionRequired", "Finished", "Error", "Aborting"];
const OP_BY_LOWER = Object.fromEntries(OP_STATES.map((state) => [state.toLowerCase(), state]));
const HOB_LEVEL_BY_LOWER = { off: "Off", keepwarm: "KeepWarm", boost1: "Boost1", boost2: "Boost2" };
const normalizeLevel = (level) => (level == null ? level : (HOB_LEVEL_BY_LOWER[String(level).toLowerCase()] ?? String(level)));

// Hob zones come either with one translation key per zone (sensor_hob_zone_100_state)
// or with a key shared by all zones and the zone number in the entity name
const ZONE_PARTS = {
  state: "state",
  power_level: "level",
  remaining_time: "remaining",
  remaining_program_time: "remaining",
  residual_heat: "residual",
};

function zoneNumber(text) {
  const value = String(text ?? "");
  const named = value.match(/zon[a-z]*[_\s]*(\d{3})(?!\d)/i);
  if (named) return named[1];
  const numbers = [...value.matchAll(/(?:^|\D)(\d{3})(?=\D|$)/g)];
  return numbers.length ? numbers.at(-1)[1] : undefined;
}

function hobZonePart(entry, stateObj) {
  const key = entry.translation_key;
  let m = key.match(/^(?:binary_)?sensor_hob_zone_(\d+)_(state|power_level|remaining_time|remaining_program_time|residual_heat)$/);
  if (m) return { zone: m[1], part: ZONE_PARTS[m[2]] };
  m = key.match(/^sensor_hob_zone_(state|power_level|remaining_program_time)$/);
  if (!m) return null;
  const zone = zoneNumber(entry.entity_id) ?? zoneNumber(stateObj?.attributes.friendly_name);
  return zone ? { zone, part: ZONE_PARTS[m[1]] } : null;
}

// The total consumption sensors behind the consumption sheet
const USAGE_METRICS = {
  energy: { total: "sensor_energy_consumed", icon: "mdi:lightning-bolt", unit: "kWh", digits: 1, color: "var(--amber-color, #ffc107)" },
  water: { total: "sensor_water_consumed", icon: "mdi:water", unit: "L", digits: 0, color: "var(--blue-color, #2196f3)" },
};

// Selects stepped through with minus and plus, limited to the values that make sense
// there: the "ul" values are for US appliances
const OPTION_STEPS = {
  select_laundry_option_temperature: (option) => /^(cold|gc\d+)$/.test(option),
  select_laundry_spin_speed: (option) => /^(off|rpm\d+)$/.test(option),
  select_laundry_soak_temperature: (option) => /^(cold|gc\d+)$/.test(option),
  select_laundry_spin_speed_before_drying: (option) => /^(off|rpm\d+)$/.test(option),
  // Only the durations: the dryer card turns the wrinkle guard on and off with its own button
  select_laundry_wrinkle_guard: (option) => /^min\d+$/.test(option),
};

// The values a stepper goes through, lowest first. Home Connect Local by chris-mc1 can list
// them sorted as text (min120 before min30), so the numbered ones are sorted by number.
function stepOptions(key, options = []) {
  const allowed = options.filter(OPTION_STEPS[key] || (() => true));
  const number = (option) => Number(String(option).match(/\d+$/)?.[0] ?? NaN);
  const plain = allowed.filter((option) => Number.isNaN(number(option)));
  const numbered = allowed.filter((option) => !Number.isNaN(number(option))).sort((a, b) => number(a) - number(b));
  return [...plain, ...numbered];
}

// "2h" or "90min", as used by the fork's "Delay start" select
function delayOptionSeconds(option) {
  const m = String(option ?? "").match(/^\+?(\d+)\s*(h|min)$/i);
  if (!m) return 0;
  return Number(m[1]) * (m[2].toLowerCase() === "h" ? 3600 : 60);
}

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
function dial({ pct = 0, marker = null, knob = false, color = "var(--accent)", label = "", big = "", unit = "", sub = "", gap = "" }) {
  const r = 96;
  const circumference = 2 * Math.PI * r;
  const length = circumference * 0.75;
  const value = clamp(pct, 0, 1) * length;
  const point = (p) => {
    const angle = ((135 + 270 * clamp(p, 0, 1)) * Math.PI) / 180;
    return [(120 + r * Math.cos(angle)).toFixed(1), (120 + r * Math.sin(angle)).toFixed(1)];
  };
  let markerSvg = "";
  // Like the thermostat card: the current value is a small dot on the track,
  // the value you set has the handle at the end of the arc
  if (marker != null) {
    const [x, y] = point(marker);
    markerSvg += `<circle class="marker" cx="${x}" cy="${y}" r="3.5"></circle>`;
  }
  if (knob) {
    const [x, y] = point(pct);
    markerSvg += `<circle class="knob" cx="${x}" cy="${y}" r="12" style="fill:${color}"></circle>
      <circle class="knob-center" cx="${x}" cy="${y}" r="7.5"></circle>`;
  }
  return `
    <div class="dial ${knob ? "with-knob" : ""}">
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
  .dial .marker { fill: var(--primary-text-color); opacity: 0.6; }
  .dial .knob-center { fill: var(--white-color, #fff); }
  /* The handle moves at once with the buttons, so the arc does too */
  .dial.with-knob .value { transition: stroke 300ms, opacity 300ms; }
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
  .segmented button { flex: 1 1 auto; min-width: 40px; padding: 0 10px; white-space: nowrap; font-size: var(--ha-font-size-m, 14px); font-weight: 500; border-radius: var(--radius); transition: background-color 180ms, color 180ms; }
  .segmented button.sel { background: var(--accent); color: var(--on-accent); }


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
  .badge.no-icon { padding-inline-start: 12px; }
  .badge .part { margin-inline-start: 4px; }

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
  /* On the baseline, moved down by half the cap height of Roboto (dy 0.355em): capitals and digits sit in the middle */
  .zone text { text-anchor: middle; font-family: inherit; pointer-events: none; }
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

  /* Consumption sheet, with the type scale and colors of Home Assistant */
  .usage-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(0, 1fr)); gap: 8px; }
  .usage-tile {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 16px;
    border-radius: var(--radius);
    background: var(--control);
    text-align: start;
    transition: background-color 180ms;
  }
  .usage-tile:hover:not(.sel) { background: var(--control-hover); }
  .usage-tile.sel { background: color-mix(in srgb, var(--metric) 20%, transparent); }
  .ut-head { display: flex; align-items: center; gap: 8px; font-size: var(--ha-font-size-m, 14px); line-height: 20px; font-weight: var(--ha-font-weight-medium, 500); }
  .ut-head ha-icon { color: var(--metric); --mdc-icon-size: 20px; }
  .ut-value { margin-top: 4px; font-size: var(--ha-font-size-3xl, 28px); line-height: 36px; font-weight: var(--ha-font-weight-normal, 400); font-variant-numeric: tabular-nums; }
  .ut-value .unit { margin-inline-start: 4px; font-size: var(--ha-font-size-l, 16px); color: var(--secondary-text-color); }
  .ut-sub { font-size: var(--ha-font-size-s, 12px); line-height: 16px; color: var(--secondary-text-color); }
  .chart { position: relative; display: flex; gap: 8px; height: 168px; }
  /* Baseline above the month labels, like the axis of the Home Assistant charts */
  .chart::after { content: ""; position: absolute; inset: auto 0 24px; border-top: 1px solid var(--divider-color); }
  .chart .col { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .chart .bar-area { flex: 1; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 4px; }
  .chart .bar {
    box-sizing: border-box;
    width: 100%;
    max-width: 40px;
    border: 1.5px solid var(--metric);
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    background: color-mix(in srgb, var(--metric) 50%, transparent);
    transition: height 300ms;
  }
  .chart .col.current .bar { background: var(--metric); }
  .chart .bar.empty { height: 0 !important; border: none; }
  .chart.loading .bar { height: 30% !important; border: none; background: var(--control); }
  .chart .v, .chart .m { font-size: var(--ha-font-size-s, 12px); line-height: 16px; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .chart .col.current .v, .chart .col.current .m { color: var(--primary-text-color); font-weight: var(--ha-font-weight-medium, 500); }
  /* Rows like the entity rows of an entities card */
  .usage-rows { display: flex; flex-direction: column; }
  .usage-rows .row { min-height: 40px; }
  .usage-rows .row-label { gap: 16px; font-size: var(--ha-font-size-m, 14px); }
  .usage-rows .row-label ha-icon { color: var(--state-icon-color, #44739e); --mdc-icon-size: 24px; margin: 0 8px; }
  .usage-rows .row-text { display: flex; flex-direction: column; min-width: 0; }
  .usage-rows .row-text span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .usage-rows .secondary { font-size: var(--ha-font-size-s, 12px); line-height: 16px; color: var(--secondary-text-color); }
  .row-value { font-size: var(--ha-font-size-m, 14px); font-weight: var(--ha-font-weight-normal, 400); font-variant-numeric: tabular-nums; white-space: nowrap; }

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
    return cardLang(this._hass?.locale?.language || this._hass?.language);
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
    // A dryer program can have another name than the washer one with the same id (dryer:mix)
    const appliance = key.match(/^laundrycare_(dryer)_program_/)?.[1];
    const own = (appliance && labels[`${appliance}:${info.id}`]) || labels[`${info.group}:${info.id}`] || labels[info.id];
    if (own) return own;
    // Newer versions of the integration translate many more programs
    const stateObj = this.st("select_program") || this.st("sensor_active_program");
    const translated = stateObj ? this._fmtState(stateObj, key) : key;
    if (translated && translated !== key) return translated;
    return PROGRAM_LABELS.en[info.id] || humanize(info.id);
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
    const zones = {};
    for (const entry of Object.values(hass.entities || {})) {
      if (entry.device_id !== id || entry.platform !== DOMAIN || !entry.translation_key) continue;
      const stateObj = hass.states[entry.entity_id];
      // "restored" entities are still in the registry but no longer provided by the integration
      const stale = !stateObj || stateObj.attributes?.restored === true;
      // Some versions have two entities for one key: keep them all and pick when reading
      (found[entry.translation_key] ||= []).push({ id: entry.entity_id, stale, category: entry.entity_category ?? null });
      const zonePart = hobZonePart(entry, stateObj);
      if (zonePart) {
        const zone = (zones[zonePart.zone] ||= {});
        const before = zone[zonePart.part];
        if (!before || (before.stale && !stale)) zone[zonePart.part] = { id: entry.entity_id, stale };
      }
    }
    // After a migration the old key can still be there as a stale entity, next to the renamed one
    for (const [key, aliases] of Object.entries(KEY_ALIASES)) {
      const candidates = [key, ...aliases].flatMap((name) => found[name] || []);
      if (candidates.length) found[key] = candidates;
    }
    for (const candidates of Object.values(found)) candidates.sort((a, b) => a.stale - b.stale);
    this._entityCache = { registry: hass.entities, id, found, zones };
    return this._entityCache;
  }

  // The first candidate that has a state, else the first one
  eid(key) {
    const candidates = this._found[key];
    if (!candidates) return undefined;
    const usable = candidates.find((c) => !c.stale && !UNAVAILABLE.has(this._hass.states[c.id]?.state));
    return (usable || candidates[0]).id;
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
    const rawOp = this.ok("sensor_operation_state") ? this.val("sensor_operation_state") : null;
    const op = rawOp ? (OP_BY_LOWER[rawOp.toLowerCase()] ?? rawOp) : null;
    const running = RUNNING.has(op);
    let off = offline;
    if (!off && !running) {
      const power = this.st("switch_power_state");
      const powerState = ["select_power_state", "sensor_power_state"]
        .map((key) => this.st(key))
        .find((stateObj) => stateObj && !UNAVAILABLE.has(stateObj.state));
      if (power && !UNAVAILABLE.has(power.state)) off = power.state === "off";
      else if (powerState) {
        off = ["off", "mainsoff", "standby"].includes(String(powerState.state).toLowerCase()) && (!op || op === "Inactive");
      }
    }
    const active = this.ok("sensor_active_program") ? this.val("sensor_active_program") : null;
    const selectEid = this.eid("select_program");
    const selected = selectEid
      ? (this._pendingVal(selectEid) ?? (this.ok("select_program") ? this.val("select_program") : null))
      : null;
    // Only the "Remote start allowed" entity says that remote start is off. Start can also
    // be unavailable for other reasons, such as an open door, so that gets its own hint.
    // The fork also keeps Start unavailable until a program is selected.
    const remoteStart = this.st("binary_remote_start_allowed");
    const remoteStartBlocked = remoteStart?.state === "off";
    const startUnavailable = !off && !running && !!selected && this.val("button_start_program") === "unavailable";
    return {
      offline,
      off,
      op,
      running,
      program: running ? active || selected : selected || active,
      remoteStartBlocked,
      startUnavailable,
      remoteControlOff: this.val("binary_sensor_remote_control_active") === "off",
      localControl: this.on("binary_sensor_local_control_active"),
    };
  }

  // --- Render ----------------------------------------------------------------

  _render() {
    if (!this._hass || !this._config) return;
    const entities = this._entities();
    this._found = entities.found;
    this._zoneEntities = entities.zones;
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
    else if (d.programHint) parts.push(d.programHint);
    return parts.join(" · ");
  }

  _header(d) {
    const color = d.offline || d.off ? "var(--inactive)" : "var(--accent)";
    const infoKey = this.eid("sensor_operation_state") ? "sensor_operation_state" : "switch_power_state";
    const power = d.offline ? null : this._power();
    const powerBtn = power
      ? `<button class="icon-btn ${power.on ? "on" : ""}" data-action="power-toggle"
           title="${esc(this._t("power"))}" aria-label="${esc(this._t("power"))}" aria-pressed="${power.on}">
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

  // The power control: a switch on appliances with two power states, a select on those
  // with more, like On, Standby and MainsOff. Both versions of the integration do the same.
  _power() {
    const toggle = this.st("switch_power_state");
    if (toggle && !UNAVAILABLE.has(toggle.state)) {
      return { kind: "switch", id: toggle.entity_id, on: (this._pendingVal(toggle.entity_id) ?? toggle.state) === "on" };
    }
    const select = this.st("select_power_state");
    if (!select || UNAVAILABLE.has(select.state)) return null;
    const options = select.attributes.options || [];
    const option = (name) => options.find((o) => String(o).toLowerCase() === name);
    // Off or MainsOff, like the power switch: an appliance can list Standby among the
    // options but refuse it, as a Bosch WAV28E41 washer does (#3)
    const onOption = option("on");
    const offOption = option("off") ?? option("mainsoff") ?? option("standby");
    if (!onOption || !offOption) return null;
    const state = this._pendingVal(select.entity_id) ?? select.state;
    return { kind: "select", id: select.entity_id, on: String(state).toLowerCase() === "on", onOption, offOption };
  }

  _setPower(on) {
    const power = this._power();
    if (!power) return;
    const value = power.kind === "switch" ? (on ? "on" : "off") : on ? power.onOption : power.offOption;
    this._pending[power.id] = { value, time: Date.now() };
    this._render();
    if (power.kind === "switch") this._call("switch", on ? "turn_on" : "turn_off", { entity_id: power.id });
    else this._call("select", "select_option", { entity_id: power.id, option: value });
  }

  _offBody(d) {
    if (d.offline) {
      return `<div class="empty"><ha-icon icon="mdi:lan-disconnect"></ha-icon><span>${esc(this._t("offline_hint"))}</span></div>`;
    }
    if (!this._power()) return "";
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

  _badge(icon, text, { key, entity, color, label, action: onTap, parts = [] } = {}) {
    const target = entity || (key ? this.eid(key) : undefined);
    let action = target ? `data-action="more-info" data-entity="${target}" role="button" tabindex="0"` : "";
    if (onTap) action = `data-action="${onTap}" role="button" tabindex="0"`;
    return `
      <div class="badge ${icon ? "" : "no-icon"}" ${action} style="${color ? `--badge-color:${color}` : ""}">
        ${icon ? `<ha-icon icon="${icon}"></ha-icon>` : ""}
        ${label ? `<span class="muted">${esc(label)}</span>` : ""}
        ${text != null ? `<span>${esc(text)}</span>` : ""}
        ${parts
          .map((part) => `<ha-icon class="part" icon="${part.icon}" style="--badge-color:${part.color}"></ha-icon><span>${esc(part.text)}</span>`)
          .join("")}
      </div>`;
  }

  _programSelect(d) {
    if (!this.eid("select_program") || d.running) return "";
    // "unknown" only means that no program is selected yet
    const disabled = this.val("select_program") === "unavailable" || d.remoteControlOff;
    // programHint: a card can name a program the integration doesn't know
    const label = d.program ? this._programLabel(d.program) : d.programHint || this._t("choose_program");
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
      .filter(([key, candidates]) => key.startsWith("switch_") && !candidates[0].category && !OPTION_EXCLUDE.has(key))
      .map(([key]) => key);
  }

  // `first`: buttons a card adds before the option switches, already rendered
  _options(d, keys = this._optionKeys(), first = []) {
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
    items.unshift(...first.filter(Boolean));
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
    return this._stepperRow({
      label,
      icon: icon || attrs.icon || "mdi:numeric",
      text: format(value),
      pending: pending !== undefined,
      action: "step",
      key,
      step,
      minus: off || value <= lo,
      plus: off || value >= hi,
    });
  }

  _stepperRow({ label, icon, text, pending, action, key, step, minus, plus }) {
    return `
      <div class="row">
        <div class="row-label"><ha-icon icon="${icon}"></ha-icon><span>${esc(label)}</span></div>
        <div class="stepper ${pending ? "pending" : ""}">
          <button data-action="${action}" data-key="${key}" data-delta="${-step}" ${minus ? "disabled" : ""} aria-label="-">
            <ha-icon icon="mdi:minus"></ha-icon></button>
          <span class="num">${esc(text)}</span>
          <button data-action="${action}" data-key="${key}" data-delta="${step}" ${plus ? "disabled" : ""} aria-label="+">
            <ha-icon icon="mdi:plus"></ha-icon></button>
        </div>
      </div>`;
  }

  _optionStepper(key, { label, icon, format }) {
    const stateObj = this.st(key);
    if (!stateObj || UNAVAILABLE.has(stateObj.state)) return "";
    const options = stepOptions(key, stateObj.attributes.options);
    const current = this._pendingVal(stateObj.entity_id) ?? stateObj.state;
    const index = options.indexOf(current);
    const off = this._d.running || this._d.remoteControlOff;
    return this._stepperRow({
      label,
      icon,
      text: format ? format(current) : this._fmtState(stateObj, current),
      pending: this._pending[stateObj.entity_id] !== undefined,
      action: "option-step",
      key,
      step: 1,
      minus: off || index <= 0,
      plus: off || index >= options.length - 1,
    });
  }

  // The name of a select's option: the integration's translation, unless a card has its own
  _optionLabel(key, option) {
    return this._fmtState(this.st(key), option);
  }

  // A select with many options, opened in a list like the programs
  _selectRow(key, { label, icon }) {
    const stateObj = this.st(key);
    if (!stateObj || UNAVAILABLE.has(stateObj.state)) return "";
    const current = this._pendingVal(stateObj.entity_id) ?? stateObj.state;
    const disabled = this._d.running || this._d.remoteControlOff;
    return `
      <button class="select" data-action="open-select" data-key="${key}" ${disabled ? "disabled" : ""}>
        <ha-icon icon="${icon}"></ha-icon>
        <span class="sel-text">
          <span class="lbl">${esc(label)}</span>
          <span class="val">${esc(current === "off" ? this._t("none") : this._optionLabel(key, current))}</span>
        </span>
        <ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
      </button>`;
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

  // Delayed start comes in three shapes: the appliance's own "start in" number, or the
  // fork's "Delay start" number (minutes) or select (+1 h ... +24 h). The fork applies its
  // own delay when Start is pressed; the appliance's number needs the start_program action.
  _delay() {
    if (this.ok("number_delay_start")) {
      const stateObj = this.st("number_delay_start");
      const factor = UNIT_SECONDS[stateObj.attributes.unit_of_measurement] ?? 60;
      const value = this._pendingVal(stateObj.entity_id) ?? Number(stateObj.state);
      return { kind: "number", key: "number_delay_start", factor, seconds: value * factor, native: true };
    }
    if (this.ok("select_delay_start")) {
      const stateObj = this.st("select_delay_start");
      const option = this._pendingVal(stateObj.entity_id) ?? stateObj.state;
      const options = stateObj.attributes.options || [];
      return { kind: "select", key: "select_delay_start", option, options, seconds: delayOptionSeconds(option), native: true };
    }
    if (this.ok("number_oven_start_in_relative")) {
      const stateObj = this.st("number_oven_start_in_relative");
      const value = this._pendingVal(stateObj.entity_id) ?? Number(stateObj.state);
      return { kind: "number", key: "number_oven_start_in_relative", factor: 1, seconds: value, native: false };
    }
    return null;
  }

  _delayValue() {
    return this._delay()?.seconds ?? 0;
  }

  _delayControl(step) {
    const delay = this._delay();
    if (!delay) return "";
    const format = (seconds) => (seconds > 0 ? durationText(seconds) : this._t("none"));
    const label = this._t("delay");
    const icon = "mdi:timer-plus-outline";
    if (delay.kind === "select") {
      const index = delay.options.indexOf(delay.option);
      const off = this._d.remoteControlOff;
      return this._stepperRow({
        label,
        icon,
        text: format(delay.seconds),
        pending: this._pending[this.eid(delay.key)] !== undefined,
        action: "delay-option",
        key: delay.key,
        step: 1,
        minus: off || index <= 0,
        plus: off || index >= delay.options.length - 1,
      });
    }
    return this._stepper(delay.key, {
      label,
      icon,
      step: Math.max(1, step / delay.factor),
      format: (value) => format(value * delay.factor),
    });
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
          blocked: !d.program || d.remoteStartBlocked || d.startUnavailable,
        }),
      );
    }
    const html = buttons.filter(Boolean).join("");
    return html ? `<div class="actions">${html}</div>` : "";
  }

  // Shown right above the buttons they explain
  _hints(d, { start = true } = {}) {
    const hints = [];
    if (d.remoteControlOff) hints.push(["mdi:remote-off", this._t("hint_remote_off")]);
    else if (start && !d.running && d.remoteStartBlocked) hints.push(["mdi:remote-off", this._t("hint_remote_start")]);
    else if (start && !d.running && d.startUnavailable) {
      if (this._doorOpen()) hints.push(["mdi:door-open", this._t("hint_close_door")]);
      else hints.push(["mdi:information-outline", this._t("hint_start_unavailable")]);
    }
    if (d.localControl) hints.push(["mdi:gesture-tap-button", this._t("hint_local")]);
    return hints
      .map(([icon, text]) => this._alert("info", icon, text))
      .join("");
  }

  _doorOpen() {
    const sensor = this.val("sensor_door_state");
    if (sensor && !UNAVAILABLE.has(sensor)) return ["open", "ajar"].includes(sensor.toLowerCase());
    return this.val("binary_sensor_door_state") === "on";
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
    // With the total consumption sensors the badge opens the consumption sheet
    const action = this._hasUsage() ? "open-usage" : undefined;
    const metrics = [
      ["sensor_energy_consumed_last", USAGE_METRICS.energy],
      ["sensor_water_consumed_last", USAGE_METRICS.water],
    ].filter(([key]) => this.ok(key));
    if (!metrics.length) return action ? [this._badge("mdi:chart-bar", this._t("usage"), { action })] : [];
    // Energy and water of the last cycle in one badge, each value with its own icon
    return [
      this._badge(null, null, {
        key: metrics[0][0],
        label: this._t("last_cycle"),
        action,
        parts: metrics.map(([key, metric]) => ({ icon: metric.icon, color: metric.color, text: this._consumption(key) })),
      }),
    ];
  }

  // --- Consumption -----------------------------------------------------------

  // A consumption value with fixed decimals, whatever display precision the entity has
  _consumption(key) {
    const stateObj = this.st(key);
    if (!stateObj || UNAVAILABLE.has(stateObj.state)) return "";
    const value = Number(stateObj.state);
    const unit = stateObj.attributes.unit_of_measurement || "";
    if (!Number.isFinite(value)) return this._fmtState(stateObj);
    return `${this._num(value, unit === "L" ? 0 : 2)} ${unit}`.trim();
  }

  // Totals with a value: some appliances, such as a Bosch WRB247C0IT dryer, list the
  // consumption among their features but never report it, so the entity stays unavailable.
  // While the appliance is disconnected every entity is: its statistics are still there.
  _usageMetrics() {
    const offline = this.val("connection") === "off";
    return Object.keys(USAGE_METRICS).filter((name) => {
      const total = USAGE_METRICS[name].total;
      return this.ok(total) || (offline && !!this._found[total]);
    });
  }

  _hasUsage() {
    return this._usageMetrics().length > 0;
  }

  // Every entity of a key, stale ones too: after a migration the old one keeps the history
  _statisticIds(key) {
    return (this._found[key] || []).map((c) => c.id);
  }

  async _loadUsage() {
    const now = new Date(Date.now());
    const months = Array.from({ length: 12 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 11 + i, 1));
    const ids = {
      energy: this._statisticIds(USAGE_METRICS.energy.total),
      water: this._statisticIds(USAGE_METRICS.water.total),
      cycles: this._statisticIds("sensor_count_completed"),
    };
    const usage = { months, series: {} };
    try {
      // By day, added up into months: the first day also tells from when the history starts
      const result = await this._hass.callWS({
        type: "recorder/statistics_during_period",
        start_time: months[0].toISOString(),
        statistic_ids: [...new Set(Object.values(ids).flat())],
        period: "day",
        types: ["change"],
        units: { energy: "kWh", volume: "L" },
      });
      usage.days = {};
      usage.first = {};
      for (const [name, list] of Object.entries(ids)) {
        const series = months.map(() => null);
        const days = [];
        for (const id of list) {
          for (const row of result?.[id] || []) {
            const start = new Date(row.start);
            if (!(usage.first[name] <= start)) usage.first[name] = start;
            if (!Number.isFinite(row.change)) continue;
            days.push({ start, change: row.change });
            const index = months.findIndex((m) => m.getFullYear() === start.getFullYear() && m.getMonth() === start.getMonth());
            if (index >= 0) series[index] = (series[index] ?? 0) + row.change;
          }
        }
        usage.series[name] = series;
        usage.days[name] = days;
      }
      const firsts = [usage.first.energy, usage.first.water].filter(Boolean);
      usage.since = firsts.length ? new Date(Math.min(...firsts)) : null;
    } catch (err) {
      usage.error = true;
    }
    this._usage = usage;
    if (this._sheet?.type === "usage") this._renderSheet();
  }

  _usageBody() {
    const usage = this._usage;
    const metric = this._sheet.metric || "energy";
    if (!USAGE_METRICS[metric]) return "";
    const lang = this._hass?.locale?.language || this._lang;
    const month = (date, style) => new Intl.DateTimeFormat(lang, { month: style }).format(date);
    const metrics = Object.entries(USAGE_METRICS).filter(([name]) => this._usageMetrics().includes(name));
    const loaded = usage && !usage.error;
    const sum = (values) => {
      const known = values.filter((v) => v != null);
      return known.length ? known.reduce((a, b) => a + b, 0) : null;
    };
    const day = (date) => new Intl.DateTimeFormat(lang, { day: "numeric", month: "short" }).format(date).replace(".", "");
    // The history can start later than this month or this year, for example after a migration
    const since = loaded ? usage.since : null;
    const thisMonth = usage?.months?.at(-1);
    const period = since && since > thisMonth ? this._t("since", { d: day(since) }) : this._t("this_month");

    const tiles = metrics
      .map(([name, m]) => {
        const value = loaded ? usage.series[name]?.at(-1) : null;
        return `
          <button class="usage-tile ${name === metric ? "sel" : ""}" data-action="usage-metric" data-metric="${name}"
            style="--metric:${m.color}" aria-pressed="${name === metric}">
            <span class="ut-head"><ha-icon icon="${m.icon}"></ha-icon>${esc(this._t(name))}</span>
            <span class="ut-value">${value != null ? `${esc(this._num(value, m.digits))}<span class="unit">${m.unit}</span>` : "-"}</span>
            <span class="ut-sub">${esc(period)}</span>
          </button>`;
      })
      .join("");

    const series = loaded ? usage.series[metric]?.slice(-6) || [] : Array(6).fill(null);
    const months = (usage?.months || []).slice(-6);
    const max = Math.max(...series.filter((v) => v != null), 0);
    const columns = series
      .map((value, i) => {
        const pct = max > 0 && value != null ? Math.max(4, (value / max) * 100) : 0;
        const label = months[i] ? month(months[i], "short").replace(".", "") : "";
        return `
          <div class="col ${i === series.length - 1 ? "current" : ""}">
            <div class="bar-area">
              <span class="v">${value != null ? esc(this._num(value, USAGE_METRICS[metric].digits)) : ""}</span>
              <div class="bar ${value == null ? "empty" : ""}" style="height:${pct * 0.82}%"></div>
            </div>
            <span class="m">${esc(label)}</span>
          </div>`;
      })
      .join("");

    // Rows with both metrics side by side
    const pair = (energy, water) => [energy, water].filter(Boolean).join(" · ");
    const fmt = (name, value, digits = USAGE_METRICS[name].digits) =>
      value != null && this._found[USAGE_METRICS[name].total] ? `${this._num(value, digits)} ${USAGE_METRICS[name].unit}` : "";
    const rows = [];
    const last = pair(this._consumption("sensor_energy_consumed_last"), this._consumption("sensor_water_consumed_last"));
    // The fork has the end of the last program on the start counter, disabled by default
    const lastEnd = new Date(this.st("sensor_count_started")?.attributes["Last End"] ?? NaN);
    const lastDate = Number.isFinite(lastEnd.getTime())
      ? new Intl.DateTimeFormat(lang, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(lastEnd)
      : "";
    if (last) rows.push(["mdi:history", this._t("last_cycle"), last, lastDate]);
    if (loaded) {
      // Only over the days with both the consumption and the number of cycles
      const perCycle = (name) => {
        if (!usage.first[name] || !usage.first.cycles) return null;
        const from = Math.max(usage.first[name], usage.first.cycles);
        const total = (days) => sum(days.filter((d) => d.start >= from).map((d) => d.change));
        const cycles = total(usage.days.cycles);
        return cycles > 0 ? total(usage.days[name]) / cycles : null;
      };
      const average = pair(fmt("energy", perCycle("energy"), 2), fmt("water", perCycle("water"), 0));
      if (average) rows.push(["mdi:approximately-equal", this._t("per_cycle"), average]);
      const yearStart = new Date(new Date(Date.now()).getFullYear(), 0, 1);
      const thisYear = (name) => sum((usage.series[name] || []).filter((_, i) => usage.months[i] >= yearStart));
      const yearText = pair(fmt("energy", thisYear("energy")), fmt("water", thisYear("water")));
      // Only when the history covers more than this month, which the tiles show already
      if (yearText && since && since < thisMonth) {
        rows.push(["mdi:calendar-blank-outline", since > yearStart ? this._t("since", { d: day(since) }) : this._t("this_year"), yearText]);
      }
    }
    const total = pair(this._consumption(USAGE_METRICS.energy.total), this._consumption(USAGE_METRICS.water.total));
    if (total) rows.push(["mdi:sigma", this._t("total"), total]);

    const empty = loaded && !series.some((v) => v != null);
    const message = usage?.error ? "usage_error" : empty ? "usage_none" : null;
    return `
      <div class="sheet-body usage">
        <div class="usage-tiles">${tiles}</div>
        <div class="section-label">${esc(this._t("last_months"))} · ${USAGE_METRICS[metric].unit}</div>
        ${usage?.error ? "" : `<div class="chart ${loaded ? "" : "loading"}" style="--metric:${USAGE_METRICS[metric].color}">${columns}</div>`}
        ${message ? `<div class="note">${esc(this._t(message))}</div>` : ""}
        <div class="usage-rows">${rows
          .map(
            ([icon, label, value, secondary]) => `
          <div class="row"><div class="row-label"><ha-icon icon="${icon}"></ha-icon>
            <div class="row-text"><span>${esc(label)}</span>${secondary ? `<span class="secondary">${esc(secondary)}</span>` : ""}</div></div>
            <span class="row-value">${esc(value)}</span></div>`,
          )
          .join("")}</div>
      </div>`;
  }

  // --- Actions ---------------------------------------------------------------

  _onClick(ev) {
    const el = ev.target.closest?.("[data-action]");
    if (!el || el.disabled) return;
    const action = el.dataset.action;
    const key = el.dataset.key;
    const entityId = key ? this.eid(key) : el.dataset.entity;

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
        this._setPower(true);
        break;
      case "power-toggle": {
        const power = this._power();
        if (power) this._setPower(!power.on);
        break;
      }
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
      case "option-step": {
        const stateObj = this.st(key);
        if (!stateObj) break;
        const options = stepOptions(key, stateObj.attributes.options);
        const current = this._pendingVal(stateObj.entity_id) ?? stateObj.state;
        const index = clamp(options.indexOf(current) + Number(el.dataset.delta), 0, options.length - 1);
        if (options[index] !== current) this._select(key, options[index]);
        break;
      }
      case "open-select":
        this._openSheet({ type: "select", key, title: el.querySelector(".lbl")?.textContent });
        break;
      case "pick-option":
        this._select(key, el.dataset.option);
        this._dialog.close();
        break;
      case "delay-option": {
        const delay = this._delay();
        if (delay?.kind !== "select") break;
        const index = clamp(delay.options.indexOf(delay.option) + Number(el.dataset.delta), 0, delay.options.length - 1);
        this._select(delay.key, delay.options[index]);
        break;
      }
      case "open-programs":
        this._openSheet({ type: "programs" });
        break;
      case "open-usage": {
        this._usage = null;
        const [metric] = this._usageMetrics();
        this._openSheet({ type: "usage", metric });
        this._loadUsage();
        break;
      }
      case "usage-metric":
        this._sheet.metric = el.dataset.metric;
        this._renderSheet();
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
    if (next === current) return;
    this._pending[entityId] = { value: next, number: true, time: Date.now() };
    this._render();
    clearTimeout(this._timers[entityId]);
    this._timers[entityId] = setTimeout(() => {
      // Gone when the appliance already reports this value, or the steps went back to it
      const pending = this._pending[entityId];
      if (pending?.value !== next) return;
      pending.time = Date.now();
      this._call("number", "set_value", { entity_id: entityId, value: next });
    }, 900);
  }

  _start() {
    const delay = this._delay();
    if (delay && !delay.native && delay.seconds > 0) {
      this._call(DOMAIN, "start_program", {
        device_id: this._config.device_id,
        start_in: {
          hours: Math.floor(delay.seconds / 3600),
          minutes: Math.floor((delay.seconds % 3600) / 60),
          seconds: 0,
        },
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
    if (this._sheet.type === "select" || this._sheet.type === "usage") {
      const title = this._sheet.type === "usage" ? this._t("usage") : this._sheet.title;
      return `
        <div class="sheet-head">
          <div class="sheet-title">${esc(title || "")}</div>
          <button class="icon-btn" data-action="close" aria-label="Close"><ha-icon icon="mdi:close"></ha-icon></button>
        </div>`;
    }
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
    if (this._sheet.type === "usage") return this._usageBody();
    if (this._sheet.type === "select") {
      const stateObj = this.st(this._sheet.key);
      if (!stateObj) return "";
      const current = this._pendingVal(stateObj.entity_id) ?? stateObj.state;
      return (stateObj.attributes.options || [])
        .map(
          (option) => `
          <button class="item ${option === current ? "selected" : ""}" data-action="pick-option"
            data-key="${this._sheet.key}" data-option="${esc(option)}">
            <span>${esc(this._optionLabel(this._sheet.key, option))}</span>
            ${option === current ? '<ha-icon icon="mdi:check"></ha-icon>' : ""}
          </button>`,
        )
        .join("");
    }
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
// Washer, dryer and dishwasher
// ---------------------------------------------------------------------------

class CycleCard extends HomeConnectCard {
  _times() {
    const remaining = toSeconds(this.st("sensor_remaining_program_time"));
    const estimate = toSeconds(this.st("sensor_estimated_remaining_program_time"));
    const startIn = toSeconds(this.st("sensor_start_in"));
    const progress = this.numVal("sensor_program_progress");
    // Before the start the remaining time can be 0, as nothing is running: then the estimate counts.
    // A leftover minute doesn't, also when the hours give 60.0000001 seconds.
    const expected = remaining > 0 ? remaining : Math.round(estimate) > 60 ? estimate : null;
    return { remaining, estimate, expected, startIn, progress };
  }

  // Before the start, for the selected program
  _loadRecommendationBadge(d) {
    if (d.off || d.running || !(this.numVal("sensor_laundry_load_recommendation") > 0)) return "";
    return this._badge("mdi:weight-kilogram", this._fmtState(this.st("sensor_laundry_load_recommendation")), {
      key: "sensor_laundry_load_recommendation",
      label: this._t("load_recommendation"),
    });
  }

  _phase() {
    for (const key of ["sensor_laundry_process_phase", "sensor_dryer_process_phase", "sensor_program_phase"]) {
      if (!this.ok(key)) continue;
      const value = String(this.val(key)).toLowerCase();
      const phases = STRINGS[this._lang].phase;
      const own = Object.keys(phases).find((phase) => phase.toLowerCase() === value);
      if (own !== undefined) return phases[own];
      return this._fmtState(this.st(key));
    }
    return "";
  }

  _hero(d) {
    const { remaining, expected, startIn, progress } = this._times();
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
    const duration = expected;
    const time = splitDuration(duration);
    return dial({
      label: esc(this._t("estimated")),
      big: time ? time.value : "-",
      unit: time ? time.unit : "",
      sub: duration != null && (d.program || d.programHint) ? esc(this._t("ends_at", { t: this._clock(this._delayValue() + duration) })) : "",
    });
  }

  _compactHero(d) {
    const { remaining, expected, startIn, progress } = this._times();
    let left = this._phase() || this._t(`op.${d.op}`);
    let right = "";
    if (d.op === "DelayedStart" && startIn != null) {
      left = `${this._t("starts_in")} ${durationText(startIn)}`;
    } else if (d.running && remaining != null) {
      right = this._t("ends_at", { t: this._clock(remaining) });
      left = `${left} · ${durationText(remaining)}`;
    } else if (d.op === "Ready" && expected != null) {
      right = durationText(expected);
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

  // Spin speeds such as rpm1400 read the same in every language: 1400 U/min, not RPM1400
  _spinBadgeText() {
    const value = String(this.val("sensor_laundry_spin_speed")).toLowerCase();
    return /^(off|rpm\d+)$/.test(value) ? this._spinText(value) : this._fmtState(this.st("sensor_laundry_spin_speed"));
  }

  _spinText(option) {
    if (option === "off") return this._t("spin_off");
    const rpm = String(option).match(/^rpm(\d+)$/);
    return rpm ? this._t("rpm", { n: rpm[1] }) : this._fmtState(this.st("select_laundry_spin_speed"), option);
  }

  _temperatureText(option) {
    if (option === "cold") return this._t("cold");
    const degrees = String(option).match(/^gc(\d+)$/);
    return degrees ? `${degrees[1]} °C` : this._fmtState(this.st("select_laundry_option_temperature"), option) || String(option);
  }

  _plusText(option) {
    const plus = String(option).match(/^plus(\d)$/);
    return plus ? `+${plus[1]}` : this._t("none");
  }

  _controls(d) {
    const idle = !d.running;
    return [
      this._programSelect(d),
      idle
        ? this._optionStepper("select_laundry_option_temperature", {
            label: this._t("temperature"),
            icon: "mdi:thermometer",
            format: (option) => this._temperatureText(option),
          })
        : "",
      idle
        ? this._optionStepper("select_laundry_spin_speed", {
            label: this._t("spin"),
            icon: "mdi:rotate-right",
            format: (option) => this._spinText(option),
          })
        : "",
      idle ? this._options(d) : "",
      idle
        ? this._segmented("select_laundry_rinseplus", {
            label: this._t("rinse_plus"),
            icon: "mdi:water-sync",
            format: (option) => this._plusText(option),
          })
        : "",
      idle
        ? this._segmented("select_laundry_pretreatment", {
            label: this._t("pretreatment"),
            icon: "mdi:hand-wash-outline",
            format: (option) => (option === "off" ? this._t("none") : this._t(`pretreatment_values.${option}`)),
          })
        : "",
      idle
        ? this._optionStepper("select_laundry_soak_temperature", {
            label: this._t("soak_temperature"),
            icon: "mdi:thermometer-water",
            format: (option) => this._temperatureText(option),
          })
        : "",
      idle
        ? this._stepper("number_laundry_soak_duration", {
            label: this._t("soak_duration"),
            icon: "mdi:timer-sand",
            step: 900,
            format: (v) => durationText(v),
          })
        : "",
      idle
        ? this._segmented("select_laundry_hygienic_steam_intensity", {
            label: this._t("steam_intensity"),
            icon: "mdi:kettle-steam-outline",
            format: (option) => this._t(`intensity.${option}`),
          })
        : "",
      idle
        ? this._segmented("select_laundry_multiple_soak", {
            label: this._t("multiple_soak"),
            icon: "mdi:bucket-outline",
            format: (option) => this._plusText(option),
          })
        : "",
      idle ? this._selectRow("select_laundry_option_stains", { label: this._t("stains"), icon: "mdi:water-alert-outline" }) : "",
      d.running
        ? ""
        : this._stepper("number_duration", {
            label: this._t("duration"),
            icon: "mdi:timer-outline",
            step: 600,
            format: (v) => durationText(v),
            // The duration belongs to the program: the appliance takes it only once one is selected
            disabled: !d.program,
          }),
      d.running ? "" : this._delayControl(1800),
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
    const badges = [this._doorBadge(), this._loadRecommendationBadge(d)];
    if (this.numVal("sensor_laundry_load") > 0) {
      badges.push(
        this._badge("mdi:scale", this._fmtState(this.st("sensor_laundry_load")), {
          key: "sensor_laundry_load",
          label: this._t("laundry_load"),
        }),
      );
    }
    // With a spin speed select the stepper shows it already
    if (!d.off && this.ok("sensor_laundry_spin_speed") && (d.running || !this.ok("select_laundry_spin_speed"))) {
      badges.push(
        this._badge("mdi:rotate-right", this._spinBadgeText(), {
          key: "sensor_laundry_spin_speed",
          label: this._t("spin"),
        }),
      );
    }
    if (!d.running) badges.push(...this._lastCycleBadges());
    return badges;
  }
}

class DryerCard extends CycleCard {
  static kind = "dryer";

  // Drying levels and refresher programs named by the card: not every version of the
  // integration translates them
  _optionLabel(key, option) {
    const group = { select_laundry_drying_target: "drying_targets", select_laundry_refresher: "refresher_values" }[key];
    const path = group && `${group}.${String(option).toLowerCase()}`;
    const own = path && this._t(path);
    return own && own !== path ? own : super._optionLabel(key, option);
  }

  _wrinkleText(option) {
    const minutes = String(option).match(/^min(\d+)$/);
    return minutes ? `${minutes[1]} min` : this._t("none");
  }

  // The spin speed of the wash before, which the dryer uses to estimate the time
  _spinText(option) {
    if (option === "off") return this._t("spin_off");
    const rpm = String(option).match(/^rpm(\d+)$/);
    return rpm ? this._t("rpm", { n: rpm[1] }) : this._optionLabel("select_laundry_spin_speed_before_drying", option);
  }

  // A program downloaded from the Home Connect app has a code the integration doesn't
  // know, so the program is unknown, but the dryer gives its time (fork issue #230)
  _derive() {
    const d = super._derive();
    // The same times the dial shows: a leftover estimate of a minute doesn't count
    const { remaining, expected } = this._times();
    if (!d.program && (d.op === "Ready" || d.running) && (remaining > 0 || expected)) d.programHint = this._t("app_program");
    return d;
  }

  // The cool-down has its own event, for when the phase doesn't tell
  _phase() {
    const phase = super._phase();
    if (!phase && this.on("binary_sensor_cool_down_phase_running")) return this._t("phase.CoolingDown");
    return phase;
  }

  // Like in the Home Connect app, the wrinkle guard is turned on and off, and when on it
  // lasts one of the durations the dryer offers
  _wrinkle() {
    const stateObj = this.st("select_laundry_wrinkle_guard");
    if (!stateObj || UNAVAILABLE.has(stateObj.state)) return null;
    const options = stateObj.attributes.options || [];
    const current = this._pendingVal(stateObj.entity_id) ?? stateObj.state;
    return { current, durations: stepOptions("select_laundry_wrinkle_guard", options), canTurnOff: options.includes("off") };
  }

  _wrinkleButton(d) {
    const wrinkle = this._wrinkle();
    if (!wrinkle?.canTurnOff || !wrinkle.durations.length) return "";
    const on = wrinkle.current !== "off";
    return `
      <button class="ctrl opt ${on ? "active" : ""}" data-action="wrinkle-toggle" aria-pressed="${on}" ${d.running || d.remoteControlOff ? "disabled" : ""}>
        <ha-icon icon="mdi:hanger"></ha-icon><span>${esc(this._t("wrinkle_guard"))}</span>
      </button>`;
  }

  _wrinkleDuration() {
    const wrinkle = this._wrinkle();
    if (!wrinkle || wrinkle.current === "off") return "";
    return this._optionStepper("select_laundry_wrinkle_guard", {
      label: this._t(wrinkle.canTurnOff ? "wrinkle_duration" : "wrinkle_guard"),
      icon: "mdi:timer-sand",
      format: (option) => this._wrinkleText(option),
    });
  }

  _onAction(action) {
    if (action !== "wrinkle-toggle") return;
    const wrinkle = this._wrinkle();
    if (!wrinkle) return;
    if (wrinkle.current !== "off") {
      this._wrinkleLast = wrinkle.current;
      this._select("select_laundry_wrinkle_guard", "off");
      return;
    }
    // Back to the last duration, else 120 minutes as the appliance does
    const next = [this._wrinkleLast, "min120"].find((option) => wrinkle.durations.includes(option));
    this._select("select_laundry_wrinkle_guard", next ?? wrinkle.durations[Math.floor(wrinkle.durations.length / 2)]);
  }

  _controls(d) {
    const idle = !d.running;
    return [
      this._programSelect(d),
      idle ? this._selectRow("select_laundry_drying_target", { label: this._t("drying_target"), icon: "mdi:water-percent" }) : "",
      idle
        ? this._segmented("select_laundry_refresher", {
            label: this._t("refresher"),
            icon: "mdi:spray-bottle",
            format: (option) => this._optionLabel("select_laundry_refresher", option),
          })
        : "",
      idle
        ? this._optionStepper("select_laundry_spin_speed_before_drying", {
            label: this._t("wash_spin"),
            icon: "mdi:rotate-right",
            format: (option) => this._spinText(option),
          })
        : "",
      idle ? this._options(d, this._optionKeys(), [this._wrinkleButton(d)]) : "",
      idle ? this._wrinkleDuration() : "",
      idle
        ? this._stepper("number_duration", {
            label: this._t("duration"),
            icon: "mdi:timer-outline",
            step: 600,
            format: (v) => durationText(v),
            // Time programs only, once one is selected
            disabled: !d.program,
          })
        : "",
      idle ? this._delayControl(1800) : "",
      this._hints(d),
      this._actions(d),
    ].join("");
  }

  _alerts(d) {
    const alerts = [];
    const add = (type, icon, text) => alerts.push(this._alert(type, icon, this._t(text)));
    const any = (...keys) => keys.some((key) => this.on(key));
    if (this.on("binary_sensor_evaporator_frozen")) add("error", "mdi:snowflake-alert", "alert.evaporator");
    if (d.op === "Error" || this.on("binary_sensor_fatal_error_occurred")) add("error", "mdi:alert-circle-outline", "alert.error");
    if (this.on("binary_sensor_program_aborted")) add("warning", "mdi:cancel", "alert.aborted");
    if (this.on("binary_sensor_condensate_container_full")) add("warning", "mdi:cup-water", "alert.condensate");
    // The lint filter has an alert and, on newer dryers, a cleaning reminder: one is enough
    if (any("binary_sensor_lint_filter_full", "binary_sensor_clean_lint_filter")) add("warning", "mdi:air-filter", "alert.lint_filter");
    if (this.on("binary_sensor_clean_self_cleaning_module")) add("warning", "mdi:broom", "alert.self_cleaning");
    if (this.on("binary_sensor_easyclean_filter_reminder")) add("info", "mdi:filter-variant", "alert.easyclean");
    if (any("binary_sensor_refresher_level", "binary_sensor_refresher_container_empty")) add("info", "mdi:spray-bottle", "alert.refresher");
    if (this.on("binary_sensor_maintenance_reminder")) add("info", "mdi:wrench-outline", "alert.care_cycle");
    // Before the cool-down and the wrinkle guard: when the program ends the dial says it
    if (this.on("binary_sensor_drying_process_finished") && d.op !== "Finished") add("success", "mdi:check-circle-outline", "alert.drying_done");
    // No hint about adding laundry, unlike the washer: a dryer allows it for the whole program
    return alerts.join("");
  }

  _badges(d) {
    const badges = [this._doorBadge(), this._loadRecommendationBadge(d)];
    // Only while it's on, like the lock on the dryer's display
    if (this.on("switch_child_lock")) badges.push(this._badge("mdi:lock-outline", this._t("child_lock"), { key: "switch_child_lock" }));
    // While the program runs the controls are hidden: its drying level and wrinkle guard stay in sight
    if (d.running) {
      const target = this.val("select_laundry_drying_target");
      if (this.ok("select_laundry_drying_target")) {
        badges.push(
          this._badge("mdi:water-percent", this._optionLabel("select_laundry_drying_target", target), {
            key: "select_laundry_drying_target",
          }),
        );
      }
      const wrinkle = this.val("select_laundry_wrinkle_guard");
      if (this.ok("select_laundry_wrinkle_guard") && wrinkle !== "off") {
        badges.push(
          this._badge("mdi:hanger", this._wrinkleText(wrinkle), {
            key: "select_laundry_wrinkle_guard",
            label: this._t("wrinkle_guard"),
          }),
        );
      }
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
      d.running ? "" : this._delayControl(1800),
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
        knob: true,
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
            // The duration belongs to the program: the appliance takes it only once one is selected
            disabled: !d.program,
          }),
        );
      }
      parts.push(this._delayControl(900));
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
    // Ovens such as the Gaggenau BO470112 report one preheat event instead of one per cavity
    const preheatKeys = ["binary_sensor_oven_regular_preheat_finished", "binary_sensor_oven_fast_preheat_finished", "binary_sensor_oven_preheat_finished"];
    if (preheatKeys.some((key) => this.on(key))) {
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
    const entities = this._zoneEntities[id] || {};
    const stateOf = (part) => (entities[part] ? this._hass.states[entities[part].id] : undefined);
    const known = (stateObj) => stateObj && !UNAVAILABLE.has(stateObj.state);
    const stateObj = stateOf("state");
    const state = known(stateObj) ? stateObj.state.toLowerCase() : undefined;
    const levelObj = stateOf("level");
    const level = known(levelObj) ? normalizeLevel(levelObj.state) : null;
    const remaining = toSeconds(stateOf("remaining"));
    const residual = stateOf("residual")?.state === "on" || state === "residuelheat";
    const active = state === "active" || (level && level !== "Off");
    let mode = "off";
    if (active) mode = "active";
    else if (residual) mode = "residual";
    else if (state === "notselectable") mode = "unselectable";
    const zone = HOB_ZONES.find((z) => z.id === id);
    return { id, name: zone.name, mode, level, remaining, entities };
  }

  _zones() {
    return HOB_ZONES.filter((z) => this._zoneEntities[z.id]?.state || this._zoneEntities[z.id]?.level).map((z) =>
      this._zone(z.id),
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
    // 80 and 90 cm hobs have a large zone in the middle. The Bosch PXV875DV1E gives the size
    // and position of each zone: drawn at 4 px per cm, with the front at the bottom. With a
    // flex zone on both sides, like the Neff T69YYV4C0, the middle zone sits between them.
    const wide = !!byId["500"];
    const leftFlex = !!byId["120"];
    const layout = wide
      ? {
          // 10 px between the two halves of a flex zone, like on 60 cm hobs
          "200": leftFlex ? { rect: [21, 12, 84, 75] } : { circle: [61, 49, 30] },
          "100": leftFlex ? { rect: [21, 97, 84, 75] } : { circle: [61, 139, 36] },
          "120": { rect: [21, 12, 84, 160] },
          "500": { circle: [leftFlex ? 162 : 150, 80, 48] },
          "300": rightFlex ? { rect: [218, 12, 84, 75] } : { circle: [260, 52, 38] },
          "400": rightFlex ? { rect: [218, 97, 84, 75] } : { circle: [260, 133, 40] },
          "340": { rect: [218, 12, 84, 160] },
        }
      : {
          "200": { rect: [20, 20, 140, 80] },
          "100": { rect: [20, 110, 140, 80] },
          "120": { rect: [20, 20, 140, 170] },
          // Round zones centered on the right column, one above the other
          "300": rightFlex ? { rect: [180, 20, 140, 80] } : { circle: [250, 58, 38] },
          "400": rightFlex ? { rect: [180, 110, 140, 80] } : { circle: [250, 148, 44] },
          "340": { rect: [180, 20, 140, 170] },
        };
    const [width, height] = wide ? [324, 190] : [340, 210];
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
        // Strong enough at every level for the white level on top, stronger as the level goes up
        const fill = z.mode === "active" ? `fill-opacity:${Math.max(0.62, 0.28 + strength * 0.6).toFixed(2)}` : "";
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
        // Smaller in the small round zones of 80 cm hobs: the level fits the zone
        const size = shape.circle ? Math.min(30, Math.round(shape.circle[2] * 0.8)) : 30;
        const fontSize = size < 30 ? `font-size:${size}px;` : "";
        let label = "";
        if (z.mode === "active") {
          const text = this._levelText(z.level);
          const color = "#fff";
          const timer = z.remaining > 0 ? durationText(z.remaining) : "";
          label = `
            <text class="lvl ${text.length > 3 ? "small" : ""}" x="${cx}" y="${timer ? cy - 8 : cy}" dy="0.355em" style="${text.length > 3 ? "" : fontSize}fill:${color}">${esc(text)}</text>
            ${timer ? `<text class="tmr" x="${cx}" y="${cy + 20}" dy="0.355em" style="fill:${color}">${esc(timer)}</text>` : ""}`;
        } else if (z.mode === "residual") {
          label = `<text class="lvl" x="${cx}" y="${cy}" dy="0.355em"${fontSize ? ` style="${fontSize}"` : ""}>H</text>`;
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
      <svg class="hob" viewBox="0 0 ${width} ${height}" role="group">
        <rect class="glass" x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="18"></rect>
        ${shapes}
      </svg>
      ${anyLit ? "" : `<div class="hob-off">${esc(this._t("zones_all_off"))}</div>`}`;
  }

  _offBody(d) {
    if (d.offline) return super._offBody(d);
    // The same Turn on button as the other cards, below the map
    return this._hobMap() + super._offBody(d);
  }

  _body(d) {
    return [this._hobMap(), `<div class="controls">${this._options(d, ["switch_child_lock"])}${this._hints(d, { start: false })}</div>`].join("");
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
            entity: (z.entities.residual || z.entities.state)?.id,
            label: name,
            color: "var(--amber-color, #ffc107)",
          });
        }
        const timer = z.remaining > 0 ? ` · ${durationText(z.remaining)}` : "";
        return this._badge("mdi:fire", `${this._levelText(z.level)}${timer}`, {
          entity: (z.entities.level || z.entities.state)?.id,
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
    const lang = cardLang(this._hass.locale?.language || this._hass.language);
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

const CARD_CLASSES = { washer: WasherCard, dryer: DryerCard, dishwasher: DishwasherCard, oven: OvenCard, hob: HobCard };

if (!customElements.get("homeconnect-card-editor")) {
  customElements.define("homeconnect-card-editor", HomeConnectCardEditor);
}

const pageLang = cardLang(document.querySelector("home-assistant")?.hass?.language || navigator.language);

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
