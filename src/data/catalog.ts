export type Category = "ctyrkolky" | "utv" | "motocykly" | "skutry" | "prislusenstvi";
export type Homologation = "T3b" | "L7e" | "L3e" | "L1e" | "—";
export type Art = "atv" | "utv" | "moto" | "scooter" | "gear"; // legacy placeholder hint, unused by the photo tiles

export interface Product {
  slug: string;
  brand: string;
  category: Category;
  name: string;
  price: number;        // Kč incl. VAT
  oldPrice?: number;
  homologation: Homologation;
  art: Art;
  tags?: ("new" | "sale" | "demo")[];
  cc?: number;
  power?: string;       // e.g. "27 kW / 37 k"
  drive?: string;       // "4x4" | "2WD"
  short: { cs: string; en: string };
  specs: { label: { cs: string; en: string }; value: string }[];
  colors: string[];     // hex swatches
}

export const categories: {
  slug: Category;
  label: { cs: string; en: string };
  blurb: { cs: string; en: string };
  art: Art;
}[] = [
  {
    slug: "ctyrkolky",
    label: { cs: "Čtyřkolky", en: "ATVs" },
    blurb: {
      cs: "Pracovní i sportovní ATV od 110 do 1000 ccm. Homologace T3b pro traktorové registrace nebo L7e na běžnou SPZ.",
      en: "Utility and sport ATVs from 110 to 1000 cc. T3b tractor homologation or L7e for a standard road plate.",
    },
    art: "atv",
  },
  {
    slug: "utv",
    label: { cs: "UTV / Side-by-side", en: "UTV / Side-by-side" },
    blurb: {
      cs: "Dvoumístné a šestimístné užitkové stroje s korbou, kabinou nebo elektrickým pohonem.",
      en: "Two- and six-seat utility vehicles with a bed, a cab, or an electric drivetrain.",
    },
    art: "utv",
  },
  {
    slug: "motocykly",
    label: { cs: "Motocykly", en: "Motorcycles" },
    blurb: {
      cs: "Silniční, cestovní a adventure motocykly CFMOTO od 300 do 800 ccm.",
      en: "CFMOTO road, touring and adventure motorcycles from 300 to 800 cc.",
    },
    art: "moto",
  },
  {
    slug: "skutry",
    label: { cs: "Skútry", en: "Scooters" },
    blurb: {
      cs: "Kentoya a TUMOTO. Padesátky na řidičák AM a stodvacetpětky pro každodenní dojíždění.",
      en: "Kentoya and TUMOTO. 50 cc mopeds for an AM licence and 125 cc commuters for every day.",
    },
    art: "scooter",
  },
  {
    slug: "prislusenstvi",
    label: { cs: "Příslušenství", en: "Accessories" },
    blurb: {
      cs: "Navijáky, radlice, kufry, přilby a servisní materiál pro všechny prodávané značky.",
      en: "Winches, plow blades, cases, helmets and service consumables for every brand we sell.",
    },
    art: "gear",
  },
];

export const brands = ["CFMOTO", "Linhai", "TGB", "Kentoya", "TUMOTO"] as const;

const L = (cs: string, en: string) => ({ cs, en });

export const products: Product[] = [
  // ───────────────────────── ČTYŘKOLKY / ATV ─────────────────────────
  {
    slug: "cfmoto-gladiator-x110-le",
    brand: "CFMOTO", category: "ctyrkolky", name: "GLADIATOR X110 LE",
    price: 44990, homologation: "—", art: "atv", cc: 107, power: "5,2 kW / 7 k", drive: "2WD",
    short: L("Dětská čtyřkolka s omezovačem rychlosti a dálkovým vypínáním.", "Youth ATV with a speed limiter and remote kill switch."),
    specs: [
      { label: L("Motor", "Engine"), value: "107 ccm, 1 válec, vzduchem chlazený" },
      { label: L("Převodovka", "Transmission"), value: "CVT, F/N/R" },
      { label: L("Hmotnost", "Weight"), value: "118 kg" },
      { label: L("Určeno", "Intended for"), value: "10+ let, mimo veřejné komunikace" },
    ],
    colors: ["#1f1f1f", "#d71920", "#2c6bd6"],
  },
  {
    slug: "cfmoto-gladiator-c4-g4",
    brand: "CFMOTO", category: "ctyrkolky", name: "GLADIATOR C4 G4",
    price: 150990, homologation: "T3b", art: "atv", cc: 409, power: "24,5 kW / 33 k", drive: "4x4",
    tags: ["new"],
    short: L("Praktická pracovní čtyřkolka s novým motorem 192: tišší chod, méně vibrací, uzávěrka předního diferenciálu.", "Practical utility ATV with the new 192 engine: quieter running, less vibration, lockable front differential."),
    specs: [
      { label: L("Motor", "Engine"), value: "409 ccm, 1 válec, DOHC, 4 ventily, kapalinou chlazený, EFI" },
      { label: L("Vrtání × zdvih", "Bore × stroke"), value: "91 × 76,2 mm" },
      { label: L("Převodovka", "Transmission"), value: "CVT, L/H/N/R/P" },
      { label: L("Pohon", "Drivetrain"), value: "2WD / 4WD, uzávěrka předního diferenciálu" },
      { label: L("Homologace", "Homologation"), value: "T3b" },
    ],
    colors: ["#1f1f1f", "#5a6b3d", "#c9c9c9"],
  },
  {
    slug: "cfmoto-gladiator-c5-g4",
    brand: "CFMOTO", category: "ctyrkolky", name: "GLADIATOR C5 G4 EPS",
    price: 160990, homologation: "T3b", art: "atv", cc: 499, power: "29 kW / 39 k", drive: "4x4",
    tags: ["new"],
    short: L("Silnější sourozenec C4: motor 499 ccm, posilovač řízení a uzávěrka předního diferenciálu. Verze s ABS za 170 990 Kč.", "The C4's bigger sibling: 499 cc engine, power steering and a lockable front differential. ABS version at 170 990 Kč."),
    specs: [
      { label: L("Motor", "Engine"), value: "499 ccm, 1 válec, SOHC, 4 ventily, kapalinou chlazený, EFI" },
      { label: L("Vrtání × zdvih", "Bore × stroke"), value: "92 × 75 mm" },
      { label: L("Převodovka", "Transmission"), value: "CVT, L/H/N/R/P" },
      { label: L("Pohon", "Drivetrain"), value: "2WD / 4WD, uzávěrka předního diferenciálu" },
      { label: L("Řízení", "Steering"), value: "Elektrický posilovač EPS" },
      { label: L("Homologace", "Homologation"), value: "T3b" },
    ],
    colors: ["#1f1f1f", "#5a6b3d", "#c9c9c9"],
  },
  {
    slug: "cfmoto-gladiator-x450",
    brand: "CFMOTO", category: "ctyrkolky", name: "GLADIATOR X450 EPS",
    price: 139990, homologation: "T3b", art: "atv", cc: 400, power: "19,5 kW / 26 k", drive: "4x4",
    tags: ["new"],
    short: L("Kompaktní pracovní čtyřkolka s posilovačem řízení a 4x4 na tlačítko.", "Compact utility ATV with power steering and push-button 4x4."),
    specs: [
      { label: L("Motor", "Engine"), value: "400 ccm, 1 válec, kapalinou chlazený, EFI" },
      { label: L("Pohon", "Drivetrain"), value: "2WD / 4WD s uzávěrkou předního diferenciálu" },
      { label: L("Nosnost nosičů", "Rack capacity"), value: "35 kg vpředu / 70 kg vzadu" },
      { label: L("Tažná síla", "Towing"), value: "500 kg" },
      { label: L("Homologace", "Homologation"), value: "T3b (traktor), 2 osoby" },
    ],
    colors: ["#1f1f1f", "#5a6b3d", "#c9c9c9"],
  },
  {
    slug: "cfmoto-gladiator-x520-g2",
    brand: "CFMOTO", category: "ctyrkolky", name: "GLADIATOR X520 G2 EPS",
    price: 159990, homologation: "T3b", art: "atv", cc: 495, power: "27 kW / 37 k", drive: "4x4",
    short: L("Nejprodávanější pracovní stroj CFMOTO. Druhá generace s novým rámem a 7\" displejem.", "CFMOTO's best-selling workhorse. Second generation with a new frame and a 7-inch display."),
    specs: [
      { label: L("Motor", "Engine"), value: "495 ccm, 1 válec, kapalinou chlazený, EFI" },
      { label: L("Pohon", "Drivetrain"), value: "2WD / 4WD, uzávěrka předního diferenciálu" },
      { label: L("Odpružení", "Suspension"), value: "Dvojité A-ramena vpředu i vzadu, 180 mm zdvih" },
      { label: L("Tažná síla", "Towing"), value: "600 kg" },
      { label: L("Homologace", "Homologation"), value: "T3b, 2 osoby" },
    ],
    colors: ["#1f1f1f", "#5a6b3d", "#d71920", "#c9c9c9"],
  },
  {
    slug: "cfmoto-gladiator-x625",
    brand: "CFMOTO", category: "ctyrkolky", name: "GLADIATOR X625 EPS",
    price: 199990, homologation: "T3b", art: "atv", cc: 580, power: "30 kW / 41 k", drive: "4x4",
    short: L("Pracovní čtyřkolka s vyhřívanými rukojeťmi, navijákem a dvoumístnou homologací.", "Utility ATV with heated grips, a winch and two-seat homologation."),
    specs: [
      { label: L("Motor", "Engine"), value: "580 ccm, 1 válec, kapalinou chlazený, EFI" },
      { label: L("Výbava", "Equipment"), value: "Naviják 3 000 lb, vyhřívané rukojeti, 7\" TFT" },
      { label: L("Nosnost nosičů", "Rack capacity"), value: "45 kg / 90 kg" },
      { label: L("Tažná síla", "Towing"), value: "750 kg" },
      { label: L("Homologace", "Homologation"), value: "T3b, 2 osoby" },
    ],
    colors: ["#1f1f1f", "#5a6b3d", "#c9c9c9"],
  },
  {
    slug: "cfmoto-gladiator-x850",
    brand: "CFMOTO", category: "ctyrkolky", name: "GLADIATOR X850 EPS",
    price: 239990, homologation: "L7e", art: "atv", cc: 800, power: "45 kW / 61 k", drive: "4x4",
    short: L("Dvouválec V-twin, silniční homologace L7e a plná výbava pro celodenní vyjížďky.", "V-twin engine, L7e road homologation and full equipment for all-day rides."),
    specs: [
      { label: L("Motor", "Engine"), value: "800 ccm, V-twin, kapalinou chlazený, EFI" },
      { label: L("Pohon", "Drivetrain"), value: "2WD / 4WD, uzávěrka" },
      { label: L("Odpružení", "Suspension"), value: "Plynové tlumiče, 230 mm zdvih" },
      { label: L("Tažná síla", "Towing"), value: "800 kg" },
      { label: L("Homologace", "Homologation"), value: "L7e (silniční), 2 osoby" },
    ],
    colors: ["#1f1f1f", "#d71920", "#c9c9c9"],
  },
  {
    slug: "cfmoto-gladiator-x1000",
    brand: "CFMOTO", category: "ctyrkolky", name: "GLADIATOR X1000 EPS",
    price: 269990, oldPrice: 289990, homologation: "L7e", art: "atv", cc: 963, power: "58 kW / 79 k", drive: "4x4",
    tags: ["sale"],
    short: L("Vlajková loď. Litrový V-twin, hliníková kola a 14\" pneumatiky.", "The flagship. Litre-class V-twin, alloy wheels and 14-inch tyres."),
    specs: [
      { label: L("Motor", "Engine"), value: "963 ccm, V-twin, kapalinou chlazený, EFI" },
      { label: L("Kola", "Wheels"), value: "14\" hliníková, pneu 26\"" },
      { label: L("Výbava", "Equipment"), value: "Naviják 3 500 lb, 7\" TFT, LED" },
      { label: L("Tažná síla", "Towing"), value: "1 000 kg" },
      { label: L("Homologace", "Homologation"), value: "L7e, 2 osoby" },
    ],
    colors: ["#1f1f1f", "#2c2c2c", "#c9c9c9"],
  },
  {
    slug: "linhai-370-promax-4x4",
    brand: "Linhai", category: "ctyrkolky", name: "370 Promax 4x4",
    price: 99990, homologation: "T3b", art: "atv", cc: 352, power: "16 kW / 22 k", drive: "4x4",
    short: L("Nejlevnější pracovní 4x4 v nabídce. Jednoduchá, nenáročná a s traktorovou homologací.", "The most affordable 4x4 workhorse we stock. Simple, undemanding, tractor homologated."),
    specs: [
      { label: L("Motor", "Engine"), value: "352 ccm, 1 válec, kapalinou chlazený, karburátor" },
      { label: L("Pohon", "Drivetrain"), value: "2WD / 4WD" },
      { label: L("Nosnost nosičů", "Rack capacity"), value: "30 kg / 60 kg" },
      { label: L("Homologace", "Homologation"), value: "T3b" },
    ],
    colors: ["#5a6b3d", "#1f1f1f", "#d71920"],
  },
  {
    slug: "linhai-570-promax-4x4",
    brand: "Linhai", category: "ctyrkolky", name: "570 Promax 4x4",
    price: 129990, homologation: "T3b", art: "atv", cc: 549, power: "24 kW / 33 k", drive: "4x4",
    short: L("Osvědčený motor 570, poctivá výbava a tažná síla pro les i statek.", "The proven 570 engine, honest equipment and towing power for forest and farm."),
    specs: [
      { label: L("Motor", "Engine"), value: "549 ccm, 1 válec, kapalinou chlazený, EFI" },
      { label: L("Pohon", "Drivetrain"), value: "2WD / 4WD, uzávěrka" },
      { label: L("Tažná síla", "Towing"), value: "600 kg" },
      { label: L("Homologace", "Homologation"), value: "T3b, 2 osoby" },
    ],
    colors: ["#5a6b3d", "#1f1f1f", "#c9c9c9"],
  },
  {
    slug: "linhai-m570l-eps-efi-e5",
    brand: "Linhai", category: "ctyrkolky", name: "M570L EPS EFI E5",
    price: 164990, homologation: "L7e", art: "atv", cc: 549, power: "24 kW / 33 k", drive: "4x4",
    short: L("Starý známý s novou homologací L7e a Euro 5. Posilovač řízení v základu.", "An old friend with new L7e homologation and Euro 5. Power steering as standard."),
    specs: [
      { label: L("Motor", "Engine"), value: "549 ccm, Euro 5, EFI" },
      { label: L("Řízení", "Steering"), value: "Elektrický posilovač EPS" },
      { label: L("Kola", "Wheels"), value: "12\" hliníková" },
      { label: L("Homologace", "Homologation"), value: "L7e, 2 osoby" },
    ],
    colors: ["#1f1f1f", "#5a6b3d", "#c9c9c9"],
  },
  {
    slug: "linhai-landforce-650l-eps",
    brand: "Linhai", category: "ctyrkolky", name: "Landforce 650L EPS 4x4",
    price: 169990, homologation: "L7e", art: "atv", cc: 580, power: "32 kW / 44 k", drive: "4x4",
    tags: ["new"],
    short: L("Nová řada Landforce. Delší rozvor, 25\" pneumatiky a moderní LED optika.", "The new Landforce line. Longer wheelbase, 25-inch tyres and modern LED lighting."),
    specs: [
      { label: L("Motor", "Engine"), value: "580 ccm, 1 válec, EFI, Euro 5" },
      { label: L("Pohon", "Drivetrain"), value: "2WD / 4WD, uzávěrka" },
      { label: L("Tažná síla", "Towing"), value: "750 kg" },
      { label: L("Homologace", "Homologation"), value: "L7e, 2 osoby" },
    ],
    colors: ["#1f1f1f", "#5a6b3d", "#c9c9c9"],
  },
  {
    slug: "linhai-landforce-650l-pro-eps",
    brand: "Linhai", category: "ctyrkolky", name: "Landforce 650L Pro EPS 4x4",
    price: 179990, homologation: "L7e", art: "atv", cc: 580, power: "32 kW / 44 k", drive: "4x4",
    short: L("Verze Pro přidává naviják, hliníková kola a tažné zařízení z výroby.", "The Pro version adds a winch, alloy wheels and a factory tow hitch."),
    specs: [
      { label: L("Motor", "Engine"), value: "580 ccm, 1 válec, EFI, Euro 5" },
      { label: L("Výbava", "Equipment"), value: "Naviják, hliníková kola, tažné zařízení, ochranné rámy" },
      { label: L("Homologace", "Homologation"), value: "L7e, 2 osoby" },
    ],
    colors: ["#1f1f1f", "#c9c9c9"],
  },
  {
    slug: "tgb-blade-600-ltx-4x4-e5",
    brand: "TGB", category: "ctyrkolky", name: "Blade 600 LTX 4x4 (E5)",
    price: 194990, homologation: "L7e", art: "atv", cc: 561, power: "31 kW / 42 k", drive: "4x4",
    short: L("Tchajwanská kvalita zpracování, nízké těžiště a bezproblémové ovládání.", "Taiwanese build quality, a low centre of gravity and trouble-free handling."),
    specs: [
      { label: L("Motor", "Engine"), value: "561 ccm, 1 válec, EFI, Euro 5" },
      { label: L("Pohon", "Drivetrain"), value: "2WD / 4WD, uzávěrka" },
      { label: L("Odpružení", "Suspension"), value: "IRS, nastavitelné tlumiče" },
      { label: L("Homologace", "Homologation"), value: "L7e, 2 osoby" },
    ],
    colors: ["#1f1f1f", "#5a6b3d", "#2c6bd6"],
  },
  {
    slug: "tgb-blade-600-ltx-max-eps-t3b",
    brand: "TGB", category: "ctyrkolky", name: "Blade 600 LTX MAX EPS 4x4 Limited (T3b)",
    price: 214990, homologation: "T3b", art: "atv", cc: 561, power: "31 kW / 42 k", drive: "4x4",
    short: L("Limited výbava: posilovač, naviják, hliníková kola, vyhřívané rukojeti. Traktorová homologace.", "Limited spec: power steering, winch, alloy wheels, heated grips. Tractor homologation."),
    specs: [
      { label: L("Motor", "Engine"), value: "561 ccm, 1 válec, EFI" },
      { label: L("Výbava", "Equipment"), value: "EPS, naviják 3 000 lb, 14\" hliníková kola, vyhřívané rukojeti" },
      { label: L("Homologace", "Homologation"), value: "T3b, 2 osoby" },
    ],
    colors: ["#1f1f1f", "#5a6b3d"],
  },
  {
    slug: "tgb-blade-600-ltx-max-eps-e5",
    brand: "TGB", category: "ctyrkolky", name: "Blade 600 LTX MAX EPS 4x4 Limited (E5)",
    price: 194990, oldPrice: 224990, homologation: "L7e", art: "atv", cc: 561, power: "31 kW / 42 k", drive: "4x4",
    tags: ["sale"],
    short: L("Totéž v silniční homologaci L7e. Nyní v akční ceně dovozce.", "The same in L7e road homologation. Currently at the importer's promotional price."),
    specs: [
      { label: L("Motor", "Engine"), value: "561 ccm, 1 válec, EFI, Euro 5" },
      { label: L("Výbava", "Equipment"), value: "EPS, naviják 3 000 lb, 14\" hliníková kola, vyhřívané rukojeti" },
      { label: L("Homologace", "Homologation"), value: "L7e, 2 osoby" },
    ],
    colors: ["#1f1f1f", "#5a6b3d"],
  },
  {
    slug: "tgb-blade-1000-ltx-max-eps-t3b",
    brand: "TGB", category: "ctyrkolky", name: "Blade 1000 LTX MAX EPS 4x4 Limited (T3b)",
    price: 259990, oldPrice: 279990, homologation: "T3b", art: "atv", cc: 997, power: "62 kW / 84 k", drive: "4x4",
    tags: ["sale"],
    short: L("Litrový V-twin TGB, nejsilnější pracovní čtyřkolka v naší nabídce.", "TGB's litre V-twin, the most powerful utility ATV we offer."),
    specs: [
      { label: L("Motor", "Engine"), value: "997 ccm, V-twin, EFI" },
      { label: L("Výbava", "Equipment"), value: "EPS, naviják 3 500 lb, 14\" hliníková kola, LED" },
      { label: L("Tažná síla", "Towing"), value: "1 000 kg" },
      { label: L("Homologace", "Homologation"), value: "T3b, 2 osoby" },
    ],
    colors: ["#1f1f1f", "#2c2c2c"],
  },
  {
    slug: "tgb-blade-1000-ltx-max-eps-e5",
    brand: "TGB", category: "ctyrkolky", name: "Blade 1000 LTX MAX EPS 4x4 Limited (E5)",
    price: 269990, oldPrice: 289990, homologation: "L7e", art: "atv", cc: 997, power: "62 kW / 84 k", drive: "4x4",
    tags: ["sale"],
    short: L("Blade 1000 se silniční homologací a Euro 5.", "The Blade 1000 with road homologation and Euro 5."),
    specs: [
      { label: L("Motor", "Engine"), value: "997 ccm, V-twin, EFI, Euro 5" },
      { label: L("Výbava", "Equipment"), value: "EPS, naviják 3 500 lb, 14\" hliníková kola, LED" },
      { label: L("Homologace", "Homologation"), value: "L7e, 2 osoby" },
    ],
    colors: ["#1f1f1f", "#2c2c2c"],
  },

  // ───────────────────────── UTV ─────────────────────────
  {
    slug: "linhai-utv-570-t-boss-eps",
    brand: "Linhai", category: "utv", name: "UTV 570 T-BOSS EPS",
    price: 229990, homologation: "T3b", art: "utv", cc: 549, power: "24 kW / 33 k", drive: "4x4",
    short: L("Vstupní UTV s korbou 300 kg, posilovačem řízení a homologací T3b.", "Entry-level UTV with a 300 kg bed, power steering and T3b homologation."),
    specs: [
      { label: L("Motor", "Engine"), value: "549 ccm, 1 válec, EFI" },
      { label: L("Korba", "Cargo bed"), value: "300 kg, sklopná" },
      { label: L("Sedadla", "Seats"), value: "2" },
      { label: L("Homologace", "Homologation"), value: "T3b" },
    ],
    colors: ["#5a6b3d", "#1f1f1f"],
  },
  {
    slug: "linhai-utv-650-t-boss-eps",
    brand: "Linhai", category: "utv", name: "UTV 650 T-BOSS EPS",
    price: 259990, homologation: "T3b", art: "utv", cc: 580, power: "32 kW / 44 k", drive: "4x4",
    short: L("Silnější motor 650, naviják a střecha v základu.", "The stronger 650 engine, winch and roof as standard."),
    specs: [
      { label: L("Motor", "Engine"), value: "580 ccm, 1 válec, EFI, Euro 5" },
      { label: L("Korba", "Cargo bed"), value: "350 kg, sklopná" },
      { label: L("Výbava", "Equipment"), value: "Naviják 3 500 lb, střecha, EPS" },
      { label: L("Homologace", "Homologation"), value: "T3b" },
    ],
    colors: ["#5a6b3d", "#1f1f1f", "#c9c9c9"],
  },
  {
    slug: "cfmoto-gladiator-u6-eps",
    brand: "CFMOTO", category: "utv", name: "GLADIATOR U6 EPS",
    price: 349990, homologation: "T3b", art: "utv", cc: 580, power: "30 kW / 41 k", drive: "4x4",
    short: L("Kompaktní pracovní side-by-side pro dva, s korbou 320 kg a kabinovými dveřmi.", "Compact two-seat working side-by-side with a 320 kg bed and cab doors."),
    specs: [
      { label: L("Motor", "Engine"), value: "580 ccm, 1 válec, EFI" },
      { label: L("Korba", "Cargo bed"), value: "320 kg, sklopná" },
      { label: L("Tažná síla", "Towing"), value: "800 kg" },
      { label: L("Homologace", "Homologation"), value: "T3b" },
    ],
    colors: ["#1f1f1f", "#5a6b3d", "#c9c9c9"],
  },
  {
    slug: "cfmoto-gladiator-u6-ev",
    brand: "CFMOTO", category: "utv", name: "GLADIATOR U6 EV",
    price: 500990, homologation: "T3b", art: "utv", power: "50 kW", drive: "4x4",
    tags: ["new"],
    short: L("Elektrický pracovní UTV. Tichý provoz do stájí, sadů a městské údržby.", "Electric utility UTV. Silent operation for stables, orchards and municipal work."),
    specs: [
      { label: L("Pohon", "Powertrain"), value: "Elektromotor 50 kW, baterie 22 kWh" },
      { label: L("Dojezd", "Range"), value: "až 90 km" },
      { label: L("Nabíjení", "Charging"), value: "6,6 kW AC, 0–100 % za 4 h" },
      { label: L("Homologace", "Homologation"), value: "T3b" },
    ],
    colors: ["#1f1f1f", "#c9c9c9"],
  },
  {
    slug: "cfmoto-gladiator-u10-pro-highland",
    brand: "CFMOTO", category: "utv", name: "GLADIATOR U10 PRO HIGHLAND",
    price: 640990, homologation: "T3b", art: "utv", cc: 999, power: "48 kW / 65 k", drive: "4x4",
    short: L("Plně vybavená pracovní vlajková loď: kabina, topení, stěrače, naviják 4 500 lb.", "Fully equipped utility flagship: cab, heater, wipers, 4,500 lb winch."),
    specs: [
      { label: L("Motor", "Engine"), value: "999 ccm, V-twin, EFI" },
      { label: L("Kabina", "Cab"), value: "Uzavřená, topení, stěrače, skleněné dveře" },
      { label: L("Korba", "Cargo bed"), value: "450 kg, elektricky sklopná" },
      { label: L("Homologace", "Homologation"), value: "T3b" },
    ],
    colors: ["#1f1f1f", "#5a6b3d"],
  },
  {
    slug: "cfmoto-gladiator-z10-sport",
    brand: "CFMOTO", category: "utv", name: "GLADIATOR Z10 SPORT",
    price: 449990, homologation: "T3b", art: "utv", cc: 963, power: "55 kW / 75 k", drive: "4x4",
    short: L("Sportovní side-by-side s dlouhými zdvihy a nastavitelnými tlumiči.", "Sport side-by-side with long-travel, adjustable suspension."),
    specs: [
      { label: L("Motor", "Engine"), value: "963 ccm, V-twin, EFI" },
      { label: L("Odpružení", "Suspension"), value: "280 mm vpředu, 300 mm vzadu" },
      { label: L("Kola", "Wheels"), value: "14\" hliníková, pneu 27\"" },
      { label: L("Homologace", "Homologation"), value: "T3b" },
    ],
    colors: ["#1f1f1f", "#d71920"],
  },

  // ───────────────────────── MOTOCYKLY ─────────────────────────
  {
    slug: "cfmoto-300cl-x",
    brand: "CFMOTO", category: "motocykly", name: "300CL-X",
    price: 109990, homologation: "L3e", art: "moto", cc: 292, power: "21 kW / 29 k",
    short: L("Scrambler na řidičák A2. Lehký, nízký, s ABS a TFT displejem.", "A2-licence scrambler. Light, low, with ABS and a TFT display."),
    specs: [
      { label: L("Motor", "Engine"), value: "292 ccm, 1 válec, DOHC, kapalinou chlazený" },
      { label: L("Výška sedla", "Seat height"), value: "800 mm" },
      { label: L("Hmotnost", "Weight"), value: "165 kg" },
      { label: L("Řidičský průkaz", "Licence"), value: "A2" },
    ],
    colors: ["#1f1f1f", "#c9c9c9", "#5a6b3d"],
  },
  {
    slug: "cfmoto-450-cl-c",
    brand: "CFMOTO", category: "motocykly", name: "450 CL-C",
    price: 129990, homologation: "L3e", art: "moto", cc: 449, power: "29 kW / 40 k",
    tags: ["new"],
    short: L("Cruiser s dvouválcem 450 a nízkým sedlem 690 mm.", "Cruiser with the 450 twin and a low 690 mm seat."),
    specs: [
      { label: L("Motor", "Engine"), value: "449 ccm, 2 válce, 270° kliková hřídel" },
      { label: L("Výška sedla", "Seat height"), value: "690 mm" },
      { label: L("Hmotnost", "Weight"), value: "190 kg" },
      { label: L("Řidičský průkaz", "Licence"), value: "A2" },
    ],
    colors: ["#1f1f1f", "#7a5a3d", "#c9c9c9"],
  },
  {
    slug: "cfmoto-450-sr",
    brand: "CFMOTO", category: "motocykly", name: "450 SR",
    price: 139990, homologation: "L3e", art: "moto", cc: 449, power: "35 kW / 47 k",
    short: L("Supersport třídy A2 s plnou kapotáží a zavěšením ze závodní 450SR S.", "Fully faired A2 supersport with suspension from the racing 450SR S."),
    specs: [
      { label: L("Motor", "Engine"), value: "449 ccm, 2 válce, DOHC, 270°" },
      { label: L("Výška sedla", "Seat height"), value: "795 mm" },
      { label: L("Hmotnost", "Weight"), value: "179 kg" },
      { label: L("Elektronika", "Electronics"), value: "ABS, kontrola trakce, 5\" TFT" },
    ],
    colors: ["#1f1f1f", "#2c6bd6", "#d71920"],
  },
  {
    slug: "cfmoto-450-nk",
    brand: "CFMOTO", category: "motocykly", name: "450 NK",
    price: 119990, homologation: "L3e", art: "moto", cc: 449, power: "35 kW / 47 k",
    short: L("Naked verze 450. Nejlevnější cesta k dvouválci CFMOTO.", "The naked 450. The most affordable way into a CFMOTO twin."),
    specs: [
      { label: L("Motor", "Engine"), value: "449 ccm, 2 válce, DOHC, 270°" },
      { label: L("Výška sedla", "Seat height"), value: "795 mm" },
      { label: L("Hmotnost", "Weight"), value: "172 kg" },
      { label: L("Řidičský průkaz", "Licence"), value: "A2" },
    ],
    colors: ["#1f1f1f", "#c9c9c9", "#d71920"],
  },
  {
    slug: "cfmoto-450-mt",
    brand: "CFMOTO", category: "motocykly", name: "450 MT",
    price: 149990, homologation: "L3e", art: "moto", cc: 449, power: "32 kW / 44 k",
    short: L("Lehké adventure s 21\" předním kolem, 200 mm zdvihu a nastavitelnou výškou sedla.", "Lightweight adventure bike with a 21-inch front wheel, 200 mm travel and an adjustable seat."),
    specs: [
      { label: L("Motor", "Engine"), value: "449 ccm, 2 válce, DOHC, 270°" },
      { label: L("Kola", "Wheels"), value: "21\" / 18\" drátěná" },
      { label: L("Výška sedla", "Seat height"), value: "800 / 820 mm" },
      { label: L("Nádrž", "Fuel tank"), value: "17,5 l" },
    ],
    colors: ["#1f1f1f", "#5a6b3d", "#2c6bd6"],
  },
  {
    slug: "cfmoto-450-mt-r",
    brand: "CFMOTO", category: "motocykly", name: "450 MT-R",
    price: 153990, homologation: "L3e", art: "moto", cc: 449, power: "32 kW / 44 k",
    tags: ["new"],
    short: L("Rally verze s vyšším zdvihem, ochrannými rámy a terénními pneumatikami.", "Rally version with longer travel, crash bars and off-road tyres."),
    specs: [
      { label: L("Motor", "Engine"), value: "449 ccm, 2 válce, DOHC, 270°" },
      { label: L("Odpružení", "Suspension"), value: "KYB plně nastavitelné, 230 mm" },
      { label: L("Výbava", "Equipment"), value: "Ochranné rámy, kryt motoru, terénní pneu" },
      { label: L("Nádrž", "Fuel tank"), value: "17,5 l" },
    ],
    colors: ["#1f1f1f", "#d71920"],
  },
  {
    slug: "cfmoto-700cl-x-heritage",
    brand: "CFMOTO", category: "motocykly", name: "700CL-X Heritage",
    price: 169990, homologation: "L3e", art: "moto", cc: 693, power: "55 kW / 75 k",
    short: L("Retro naked s dvouválcem 700, ride-by-wire a jízdními režimy.", "Retro naked with the 700 twin, ride-by-wire and riding modes."),
    specs: [
      { label: L("Motor", "Engine"), value: "693 ccm, 2 válce, DOHC" },
      { label: L("Výška sedla", "Seat height"), value: "800 mm" },
      { label: L("Hmotnost", "Weight"), value: "196 kg" },
      { label: L("Elektronika", "Electronics"), value: "ABS, 2 jízdní režimy, tempomat" },
    ],
    colors: ["#1f1f1f", "#7a5a3d", "#c9c9c9"],
  },
  {
    slug: "cfmoto-700-mt-adventure",
    brand: "CFMOTO", category: "motocykly", name: "700 MT Adventure",
    price: 189990, homologation: "L3e", art: "moto", cc: 693, power: "54 kW / 73 k",
    short: L("Cestovní enduro s kufry a ochrannými rámy v ceně. Připravené na dovolenou.", "Touring enduro with panniers and crash bars included. Ready for the holiday."),
    specs: [
      { label: L("Motor", "Engine"), value: "693 ccm, 2 válce, DOHC" },
      { label: L("Výbava", "Equipment"), value: "Hliníkové kufry, ochranné rámy, hlavní stojan" },
      { label: L("Kola", "Wheels"), value: "19\" / 17\"" },
      { label: L("Nádrž", "Fuel tank"), value: "19 l" },
    ],
    colors: ["#1f1f1f", "#5a6b3d"],
  },
  {
    slug: "cfmoto-800-mt-x",
    brand: "CFMOTO", category: "motocykly", name: "800 MT-X",
    price: 259990, homologation: "L3e", art: "moto", cc: 799, power: "70 kW / 95 k",
    short: L("Velké adventure s motorem KTM LC8c, 21\" kolem a elektronikou Bosch.", "Big adventure bike with the KTM LC8c engine, 21-inch wheel and Bosch electronics."),
    specs: [
      { label: L("Motor", "Engine"), value: "799 ccm, 2 válce, DOHC (LC8c)" },
      { label: L("Kola", "Wheels"), value: "21\" / 18\" drátěná" },
      { label: L("Elektronika", "Electronics"), value: "Bosch IMU, cornering ABS, TC, quickshifter" },
      { label: L("Nádrž", "Fuel tank"), value: "19 l" },
    ],
    colors: ["#1f1f1f", "#c9c9c9"],
  },

  // ───────────────────────── SKÚTRY ─────────────────────────
  {
    slug: "kentoya-mopedo-50-4t",
    brand: "Kentoya", category: "skutry", name: "Mopedo 50 4T",
    price: 26990, homologation: "L1e", art: "scooter", cc: 49, power: "2,2 kW / 3 k",
    short: L("Nejlevnější vstupenka na řidičák AM. Čtyřtakt, 45 km/h, spotřeba 2 l.", "The cheapest ticket for an AM licence. Four-stroke, 45 km/h, 2 litres per 100 km."),
    specs: [
      { label: L("Motor", "Engine"), value: "49 ccm, 4T, vzduchem chlazený" },
      { label: L("Max. rychlost", "Top speed"), value: "45 km/h" },
      { label: L("Řidičský průkaz", "Licence"), value: "AM (od 15 let)" },
    ],
    colors: ["#1f1f1f", "#d71920", "#c9c9c9"],
  },
  {
    slug: "kentoya-rush-i-125-4t",
    brand: "Kentoya", category: "skutry", name: "Rush-i 125 4T",
    price: 39990, homologation: "L3e", art: "scooter", cc: 125, power: "6,5 kW / 9 k",
    short: L("Sportovní tvary, vstřikování a LED světla za cenu padesátky.", "Sporty lines, fuel injection and LED lights for the price of a 50."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, EFI, Euro 5" },
      { label: L("Kola", "Wheels"), value: "12\" / 12\"" },
      { label: L("Řidičský průkaz", "Licence"), value: "A1 nebo B + 125" },
    ],
    colors: ["#1f1f1f", "#2c6bd6", "#c9c9c9"],
  },
  {
    slug: "kentoya-hamster-i-125-4t",
    brand: "Kentoya", category: "skutry", name: "Hamster-i 125 4T",
    price: 39990, homologation: "L3e", art: "scooter", cc: 125, power: "6,5 kW / 9 k",
    short: L("Retro kulatý skútr s velkým úložným prostorem pod sedlem.", "Round retro scooter with big under-seat storage."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, EFI, Euro 5" },
      { label: L("Úložný prostor", "Storage"), value: "Přilba integrální pod sedlem" },
      { label: L("Řidičský průkaz", "Licence"), value: "A1 nebo B + 125" },
    ],
    colors: ["#c9c9c9", "#7a5a3d", "#5a6b3d"],
  },
  {
    slug: "kentoya-phoenix-i-125-4t",
    brand: "Kentoya", category: "skutry", name: "Phoenix-i 125 4T",
    price: 43990, homologation: "L3e", art: "scooter", cc: 125, power: "7 kW / 9,5 k",
    short: L("Cestovní skútr s velkým plexi a 13\" koly. Nejprodávanější Kentoya v Jeníkově.", "Touring scooter with a tall screen and 13-inch wheels. Our best-selling Kentoya."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, EFI, Euro 5" },
      { label: L("Kola", "Wheels"), value: "13\" / 13\"" },
      { label: L("Brzdy", "Brakes"), value: "Kotoučové, CBS" },
    ],
    colors: ["#1f1f1f", "#c9c9c9", "#d71920"],
  },
  {
    slug: "kentoya-mojito-125-4t",
    brand: "Kentoya", category: "skutry", name: "Mojito 125 4T",
    price: 44990, homologation: "L3e", art: "scooter", cc: 125, power: "7 kW / 9,5 k",
    short: L("Italský styl, plochá podlaha a nízké sedlo 760 mm.", "Italian style, a flat floor and a low 760 mm seat."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, EFI, Euro 5" },
      { label: L("Výška sedla", "Seat height"), value: "760 mm" },
      { label: L("Kola", "Wheels"), value: "12\" / 12\"" },
    ],
    colors: ["#c9c9c9", "#5a6b3d", "#d71920"],
  },
  {
    slug: "kentoya-saxon-i-125-4t",
    brand: "Kentoya", category: "skutry", name: "Saxon-i 125 4T",
    price: 44990, homologation: "L3e", art: "scooter", cc: 125, power: "7 kW / 9,5 k",
    short: L("Praktický městský skútr s USB zásuvkou a háky na nákup.", "Practical city scooter with a USB socket and shopping hooks."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, EFI, Euro 5" },
      { label: L("Kola", "Wheels"), value: "12\" / 12\"" },
      { label: L("Výbava", "Equipment"), value: "USB, LED, digitální budíky" },
    ],
    colors: ["#1f1f1f", "#c9c9c9"],
  },
  {
    slug: "kentoya-torrax-125-4t",
    brand: "Kentoya", category: "skutry", name: "Torrax 125 4T",
    price: 64990, homologation: "L3e", art: "scooter", cc: 125, power: "8,5 kW / 11,5 k",
    short: L("Maxiskútr střední třídy s ABS a velkým kufrem pod sedlem.", "Mid-size maxi-scooter with ABS and a large under-seat compartment."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, kapalinou chlazený, EFI" },
      { label: L("Brzdy", "Brakes"), value: "ABS" },
      { label: L("Kola", "Wheels"), value: "14\" / 13\"" },
    ],
    colors: ["#1f1f1f", "#c9c9c9"],
  },
  {
    slug: "kentoya-maximus-i-125-4t",
    brand: "Kentoya", category: "skutry", name: "MAXIMUS-i 125 4T Euro 5",
    price: 69990, homologation: "L3e", art: "scooter", cc: 125, power: "9 kW / 12 k",
    short: L("Velký cestovní maxiskútr. Plexi, opěrka spolujezdce, dva integrály pod sedlem.", "Large touring maxi-scooter. Screen, pillion backrest, two full-face helmets under the seat."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, kapalinou chlazený, EFI, Euro 5" },
      { label: L("Brzdy", "Brakes"), value: "ABS" },
      { label: L("Nádrž", "Fuel tank"), value: "12 l" },
    ],
    colors: ["#1f1f1f", "#c9c9c9", "#2c6bd6"],
  },
  {
    slug: "kentoya-v-cross-125-4t",
    brand: "Kentoya", category: "skutry", name: "V-Cross 125 4T",
    price: 69990, oldPrice: 74990, homologation: "L3e", art: "scooter", cc: 125, power: "10,3 kW / 14 k",
    tags: ["new", "sale"],
    short: L("Novinka 2026. 14 koní, ABS + ASR, 8\" barevný displej, plynové tlumiče vzadu.", "New for 2026. 14 hp, ABS + ASR, 8-inch colour display, gas rear shocks."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, kapalinou chlazený, EFI" },
      { label: L("Elektronika", "Electronics"), value: "ABS, ASR, 8\" barevný displej, podsvícená tlačítka" },
      { label: L("Světla", "Lighting"), value: "Full LED" },
      { label: L("Odpružení", "Suspension"), value: "Plynové tlumiče vzadu" },
    ],
    colors: ["#f2f2f0", "#1f1f1f", "#d71920"],
  },
  {
    slug: "kentoya-raptor-125-4t",
    brand: "Kentoya", category: "skutry", name: "Raptor 125 4T",
    price: 72990, homologation: "L3e", art: "scooter", cc: 125, power: "8,8 kW / 12 k",
    short: L("Kapalinou chlazený, 12 koní, ABS, nastavitelné plexi, dálkové ovládání a 8\" displej se start-stop.", "Liquid-cooled, 12 hp, ABS, adjustable screen, keyless remote and an 8-inch display with start-stop."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, kapalinou chlazený, EFI" },
      { label: L("Elektronika", "Electronics"), value: "ABS, start-stop, dálkové ovládání, 8\" displej" },
      { label: L("Světla", "Lighting"), value: "Full LED" },
      { label: L("Plexi", "Screen"), value: "Nastavitelné" },
    ],
    colors: ["#1f1f1f", "#c9c9c9", "#2c6bd6"],
  },
  {
    slug: "tumoto-r-50",
    brand: "TUMOTO", category: "skutry", name: "R 50",
    price: 34900, homologation: "L1e", art: "scooter", cc: 49, power: "2,4 kW / 3,3 k",
    short: L("Padesátka s 12\" koly a kotoučovou brzdou vpředu.", "A 50 with 12-inch wheels and a front disc brake."),
    specs: [
      { label: L("Motor", "Engine"), value: "49 ccm, 4T, EFI, Euro 5" },
      { label: L("Max. rychlost", "Top speed"), value: "45 km/h" },
      { label: L("Řidičský průkaz", "Licence"), value: "AM" },
    ],
    colors: ["#1f1f1f", "#d71920"],
  },
  {
    slug: "tumoto-r9-125",
    brand: "TUMOTO", category: "skutry", name: "R9 125",
    price: 39990, homologation: "L3e", art: "scooter", cc: 125, power: "6,5 kW / 9 k",
    short: L("Základní stodvacetpětka. Spolehlivá, jednoduchá, levná na servis.", "The basic 125. Reliable, simple, cheap to service."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, EFI, Euro 5" },
      { label: L("Kola", "Wheels"), value: "12\" / 12\"" },
    ],
    colors: ["#1f1f1f", "#c9c9c9", "#2c6bd6"],
  },
  {
    slug: "tumoto-coral-125",
    brand: "TUMOTO", category: "skutry", name: "Coral 125",
    price: 45990, homologation: "L3e", art: "scooter", cc: 125, power: "7 kW / 9,5 k",
    short: L("Retro styl s chromovanými detaily a koženkovým sedlem.", "Retro style with chrome details and a leatherette seat."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, EFI, Euro 5" },
      { label: L("Kola", "Wheels"), value: "12\" / 12\"" },
    ],
    colors: ["#f2f2f0", "#7a5a3d", "#5a6b3d"],
  },
  {
    slug: "tumoto-easymax-plus-125",
    brand: "TUMOTO", category: "skutry", name: "Easymax Plus 125i",
    price: 55000, homologation: "L3e", art: "scooter", cc: 125, power: "8 kW / 11 k",
    short: L("Cestovní skútr s ABS, plexi a kufrem v ceně.", "Touring scooter with ABS, screen and top case included."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, EFI, Euro 5" },
      { label: L("Brzdy", "Brakes"), value: "ABS" },
      { label: L("Výbava", "Equipment"), value: "Kufr 32 l, plexi, USB" },
    ],
    colors: ["#1f1f1f", "#c9c9c9"],
  },
  {
    slug: "tumoto-xdv-125",
    brand: "TUMOTO", category: "skutry", name: "XDV 125",
    price: 69900, homologation: "L3e", art: "scooter", cc: 125, power: "10 kW / 13,6 k",
    short: L("Adventure skútr: vysoké plexi, ochranné rámy, 14\" kola, ABS.", "Adventure scooter: tall screen, crash bars, 14-inch wheels, ABS."),
    specs: [
      { label: L("Motor", "Engine"), value: "125 ccm, 4T, kapalinou chlazený, EFI" },
      { label: L("Brzdy", "Brakes"), value: "ABS" },
      { label: L("Kola", "Wheels"), value: "14\" / 14\"" },
    ],
    colors: ["#1f1f1f", "#5a6b3d", "#d71920"],
  },
  {
    slug: "tumoto-nexy-plus-125",
    brand: "TUMOTO", category: "skutry", name: "NEXY+ 125 Hybrid",
    price: 69990, homologation: "L3e", art: "scooter", cc: 125, power: "9 kW + 1,2 kW",
    tags: ["new"],
    short: L("Hybrid: spalovací motor a elektromotor v zadním kole. Nižší spotřeba, tichý rozjezd.", "Hybrid: combustion engine plus a hub motor in the rear wheel. Lower consumption, silent take-off."),
    specs: [
      { label: L("Pohon", "Powertrain"), value: "125 ccm 4T + elektromotor 1,2 kW" },
      { label: L("Brzdy", "Brakes"), value: "ABS" },
      { label: L("Displej", "Display"), value: "7\" TFT, navigace přes telefon" },
    ],
    colors: ["#1f1f1f", "#c9c9c9"],
  },
  {
    slug: "tumoto-xdv-300",
    brand: "TUMOTO", category: "skutry", name: "XDV 300 Euro5+",
    price: 94000, homologation: "L3e", art: "scooter", cc: 278, power: "18 kW / 24,5 k",
    short: L("Dálniční maxiskútr 300. Dva lidé, kufr a 130 km/h.", "Motorway-capable 300 maxi-scooter. Two up, top case, 130 km/h."),
    specs: [
      { label: L("Motor", "Engine"), value: "278 ccm, 4T, kapalinou chlazený, EFI, Euro 5+" },
      { label: L("Brzdy", "Brakes"), value: "ABS, kotouče 260 mm" },
      { label: L("Řidičský průkaz", "Licence"), value: "A2" },
    ],
    colors: ["#1f1f1f", "#d71920", "#c9c9c9"],
  },

  // ───────────────────────── PŘÍSLUŠENSTVÍ ─────────────────────────
  {
    slug: "navijak-3500-lb-synteticke-lano",
    brand: "CFMOTO", category: "prislusenstvi", name: "Naviják 3 500 lb, syntetické lano",
    price: 7990, homologation: "—", art: "gear",
    short: L("Univerzální naviják s dálkovým ovládáním. Montážní sady pro CFMOTO, Linhai i TGB.", "Universal winch with wireless remote. Mounting kits for CFMOTO, Linhai and TGB."),
    specs: [
      { label: L("Tažná síla", "Pull"), value: "1 588 kg" },
      { label: L("Lano", "Rope"), value: "Syntetické, 15 m" },
    ],
    colors: ["#1f1f1f"],
  },
  {
    slug: "snehova-radlice-150-cm",
    brand: "CFMOTO", category: "prislusenstvi", name: "Sněhová radlice 150 cm",
    price: 12990, homologation: "—", art: "gear",
    short: L("Ocelová radlice s natáčením do stran, rychloupínací rám.", "Steel plow blade with side angling and a quick-release frame."),
    specs: [
      { label: L("Šířka", "Width"), value: "150 cm" },
      { label: L("Natáčení", "Angling"), value: "5 poloh, ±30°" },
    ],
    colors: ["#1f1f1f", "#d71920"],
  },
  {
    slug: "zadni-kufr-100-l",
    brand: "CFMOTO", category: "prislusenstvi", name: "Zadní kufr 100 l na čtyřkolku",
    price: 5490, homologation: "—", art: "gear",
    short: L("Uzamykatelný box s opěrkou spolujezdce.", "Lockable box with a pillion backrest."),
    specs: [{ label: L("Objem", "Volume"), value: "100 l" }],
    colors: ["#1f1f1f"],
  },
  {
    slug: "tazne-zarizeni-50-mm",
    brand: "Linhai", category: "prislusenstvi", name: "Tažné zařízení, koule 50 mm",
    price: 1890, homologation: "—", art: "gear",
    short: L("Homologované tažné zařízení pro přívěsy do 750 kg.", "Type-approved hitch for trailers up to 750 kg."),
    specs: [{ label: L("Max. hmotnost přívěsu", "Max trailer weight"), value: "750 kg" }],
    colors: ["#1f1f1f"],
  },
  {
    slug: "prilba-otevrena-s-plexi",
    brand: "Kentoya", category: "prislusenstvi", name: "Přilba otevřená s plexi",
    price: 1990, homologation: "—", art: "gear",
    short: L("Lehká jet přilba ECE 22.06, velikosti XS–XXL.", "Lightweight ECE 22.06 jet helmet, sizes XS to XXL."),
    specs: [{ label: L("Norma", "Standard"), value: "ECE 22.06" }],
    colors: ["#1f1f1f", "#f2f2f0", "#d71920"],
  },
  {
    slug: "plachta-na-skutr",
    brand: "TUMOTO", category: "prislusenstvi", name: "Plachta na skútr",
    price: 690, homologation: "—", art: "gear",
    short: L("Voděodolná plachta s otvory na zámek.", "Waterproof cover with lock eyelets."),
    specs: [{ label: L("Velikost", "Size"), value: "M (skútry do 125 ccm)" }],
    colors: ["#1f1f1f"],
  },
  {
    slug: "motorovy-olej-10w-40-4l",
    brand: "CFMOTO", category: "prislusenstvi", name: "Motorový olej 10W-40, 4 l",
    price: 890, homologation: "—", art: "gear",
    short: L("Polosyntetický olej doporučený pro CFMOTO a Linhai.", "Semi-synthetic oil recommended for CFMOTO and Linhai."),
    specs: [{ label: L("Specifikace", "Spec"), value: "JASO MA2, API SL" }],
    colors: ["#1f1f1f"],
  },
  {
    slug: "pneumatika-atv-25x8-12",
    brand: "TGB", category: "prislusenstvi", name: "Pneumatika ATV 25x8-12",
    price: 2390, homologation: "—", art: "gear",
    short: L("Univerzální terénní vzorek, 6PR. Prodej i přezutí u nás v pneuservisu.", "All-terrain pattern, 6PR. Sold and fitted in our tyre shop."),
    specs: [{ label: L("Rozměr", "Size"), value: "25x8-12, 6PR" }],
    colors: ["#1f1f1f"],
  },
];

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);
export const byCategory = (c: Category) => products.filter((p) => p.category === c);
export const formatKc = (n: number) =>
  n.toLocaleString("cs-CZ", { maximumFractionDigits: 0 }).replace(/ /g, " ") + " Kč";
