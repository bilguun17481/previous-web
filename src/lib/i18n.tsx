"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "cs" | "en";
type Text = { cs: string; en: string };

export const dict = {
  nav: {
    ctyrkolky: { cs: "Čtyřkolky", en: "ATVs" },
    utv: { cs: "UTV", en: "UTV" },
    motocykly: { cs: "Motocykly", en: "Motorcycles" },
    skutry: { cs: "Skútry", en: "Scooters" },
    prislusenstvi: { cs: "Příslušenství", en: "Accessories" },
    servis: { cs: "Servis", en: "Service" },
    kontakt: { cs: "Kontakt", en: "Contact" },
    cart: { cs: "Košík", en: "Cart" },
    search: { cs: "Hledat", en: "Search" },
    menu: { cs: "Menu", en: "Menu" },
  },
  topbar: {
    cs: "Prodejna a servis Golčův Jeníkov · Po–Pá 7:30–16:00 · +420 603 235 182",
    en: "Showroom and service, Golčův Jeníkov · Mon–Fri 7:30–16:00 · +420 603 235 182",
  },
  hero: {
    eyebrow: { cs: "Novinka 2026", en: "New for 2026" },
    title: { cs: "V-Cross 125", en: "V-Cross 125" },
    lead: {
      cs: "14 koní, ABS a ASR, osmipalcový displej. Nejlépe vybavená stodvacetpětka, jakou Kentoya kdy postavila.",
      en: "14 hp, ABS and ASR, an eight-inch display. The best-equipped 125 Kentoya has ever built.",
    },
    cta: { cs: "Prohlédnout", en: "View model" },
    from: { cs: "Akční cena", en: "Promo price" },
  },
  home: {
    linesEyebrow: { cs: "Sortiment", en: "Range" },
    linesTitle: { cs: "Čtyři řady, jedna dílna.", en: "Four lines, one workshop." },
    linesLead: {
      cs: "Všechno, co prodáme, také servisujeme. Čtyřkolky, UTV, motocykly i skútry projdou před předáním naší dílnou v Golčově Jeníkově.",
      en: "Everything we sell, we also service. Every ATV, UTV, motorcycle and scooter goes through our Golčův Jeníkov workshop before handover.",
    },
    featuredEyebrow: { cs: "Vybrané modely", en: "Featured models" },
    featuredTitle: { cs: "Právě skladem", en: "In stock now" },
    all: { cs: "Celý sortiment", en: "Full range" },
    slide: { cs: "Snímek", en: "Slide" },
    homolEyebrow: { cs: "Jak číst štítek", en: "Reading the badge" },
    homolTitle: { cs: "Homologace rozhoduje, kde smíte jezdit.", en: "Homologation decides where you can ride." },
    homolLead: {
      cs: "Každý stroj u nás nese jeden ze čtyř znaků. Říká, na jaký průkaz ho řídíte a jakou dostane značku.",
      en: "Every vehicle we sell carries one of four marks. It tells you which licence you need and what kind of plate it gets.",
    },
    brandsEyebrow: { cs: "Značky", en: "Brands" },
    brandsTitle: { cs: "Autorizovaný prodej a servis", en: "Authorised sales and service" },
    newsEyebrow: { cs: "Aktuálně", en: "News" },
    allNews: { cs: "Všechny aktuality", en: "All news" },
    serviceTitle: { cs: "Servis, který zná váš stroj.", en: "Service that knows your machine." },
    serviceLead: {
      cs: "Záruční i pozáruční servis čtyřkolek, skútrů a zahradní techniky. Pneuservis, sezónní prohlídky, náhradní díly skladem.",
      en: "Warranty and post-warranty service for ATVs, scooters and garden machinery. Tyre shop, seasonal inspections, parts in stock.",
    },
    serviceCta: { cs: "Objednat servis", en: "Book a service" },
  },
  homol: {
    T3b: { cs: "Traktorová homologace. Registrace jako zemědělský stroj, řidičák B nebo T, rychlost do 60 km/h.", en: "Tractor homologation. Registered as agricultural machinery, B or T licence, limited to 60 km/h." },
    L7e: { cs: "Silniční čtyřkolka. Běžná SPZ, řidičák B, bez omezení rychlosti.", en: "Road quad. Standard plate, B licence, no speed limiter." },
    L3e: { cs: "Motocykl. Řidičák A1, A2 nebo A podle výkonu; stodvacetpětky i na B s praxí.", en: "Motorcycle. A1, A2 or A licence depending on power; 125s also on a B with experience." },
    L1e: { cs: "Moped do 45 km/h. Řidičák AM od 15 let.", en: "Moped up to 45 km/h. AM licence from age 15." },
  },
  catalog: {
    filterBrand: { cs: "Značka", en: "Brand" },
    filterHomol: { cs: "Homologace", en: "Homologation" },
    all: { cs: "Vše", en: "All" },
    sort: { cs: "Řadit: cena vzestupně", en: "Sort: price ascending" },
    models: { cs: "modelů", en: "models" },
    inStock: { cs: "Skladem v Jeníkově", en: "In stock in Jeníkov" },
    new: { cs: "Novinka", en: "New" },
    sale: { cs: "Akce", en: "Sale" },
    demo: { cs: "Předváděcí", en: "Demo" },
    buy: { cs: "Koupit", en: "Buy" },
    soldOut: { cs: "Vyprodáno", en: "Sold out" },
    sortPriceAsc: { cs: "Cena vzestupně", en: "Price ascending" },
    sortPriceDesc: { cs: "Cena sestupně", en: "Price descending" },
    sortName: { cs: "Název", en: "Name" },
    filters: { cs: "Filtr", en: "Filter" },
    reset: { cs: "Zrušit filtr", en: "Clear filter" },
  },
  news: [
    { tag: { cs: "Novinka", en: "New" }, title: { cs: "Kentoya V-Cross 125 dorazil do showroomu", en: "The Kentoya V-Cross 125 has arrived in the showroom" }, text: { cs: "Čtrnáct koní, ABS s ASR a osmipalcový displej. Přijeďte si ho vyzkoušet, předváděcí kus je připravený.", en: "Fourteen horsepower, ABS with ASR and an eight-inch display. Come and try it, the demo bike is ready." } },
    { tag: { cs: "Akce", en: "Offer" }, title: { cs: "Jarní cashback TGB Blade až 30 000 Kč", en: "TGB Blade spring cashback up to 30 000 Kč" }, text: { cs: "Blade 600 a 1000 LTX MAX v akční ceně dovozce do vyprodání zásob.", en: "Blade 600 and 1000 LTX MAX at the importer's promotional price while stocks last." } },
    { tag: { cs: "Servis", en: "Service" }, title: { cs: "Zazimování čtyřkolek a skútrů", en: "Winter storage prep for ATVs and scooters" }, text: { cs: "Objednejte se na podzimní prohlídku. Konzervace, kontrola baterie a uskladnění na přání.", en: "Book an autumn inspection. Preservation, battery check and storage on request." } },
  ],
  campaign: {
    eyebrow: { cs: "Pracovní čtyřkolky", en: "Utility ATVs" },
    title: { cs: "Postavené pro les, pole a zimu.", en: "Built for forest, field and winter." },
    text: { cs: "CFMOTO, Linhai a TGB s traktorovou homologací T3b. Naviják, radlice a tažné zařízení namontujeme před předáním.", en: "CFMOTO, Linhai and TGB with T3b tractor homologation. Winch, plow and hitch fitted before handover." },
    cta: { cs: "Zobrazit čtyřkolky", en: "See ATVs" },
  },
  product: {
    addToCart: { cs: "Přidat do košíku", en: "Add to cart" },
    added: { cs: "Přidáno do košíku", en: "Added to cart" },
    reserve: { cs: "Rezervovat předvedení", en: "Book a test ride" },
    specs: { cs: "Technické údaje", en: "Specifications" },
    colors: { cs: "Barevné provedení", en: "Colour options" },
    included: { cs: "V ceně", en: "Included" },
    includedList: {
      cs: "Předprodejní servis · První olej zdarma · Registrace na úřadě za vás · Zaškolení při předání",
      en: "Pre-delivery inspection · First oil change free · We handle registration · Handover briefing",
    },
    delivery: { cs: "Odběr", en: "Collection" },
    deliveryText: { cs: "Osobně v Golčově Jeníkově, nebo doprava po ČR od 2 500 Kč.", en: "Pick up in Golčův Jeníkov, or delivery across Czechia from 2 500 Kč." },
    financing: { cs: "Financování", en: "Financing" },
    financingText: { cs: "Splátky od 10 % akontace, vyřízení na místě.", en: "Instalments from 10 % deposit, arranged on site." },
    vat: { cs: "Cena včetně 21 % DPH", en: "Price including 21 % VAT" },
    related: { cs: "Podobné modely", en: "Similar models" },
    back: { cs: "Zpět na", en: "Back to" },
  },
  cart: {
    title: { cs: "Košík", en: "Cart" },
    items: { cs: "položky", en: "items" },
    qty: { cs: "Množství", en: "Qty" },
    remove: { cs: "Odebrat", en: "Remove" },
    subtotal: { cs: "Mezisoučet", en: "Subtotal" },
    delivery: { cs: "Doprava", en: "Delivery" },
    pickup: { cs: "Osobní odběr, Golčův Jeníkov", en: "Pick up in Golčův Jeníkov" },
    free: { cs: "Zdarma", en: "Free" },
    total: { cs: "Celkem", en: "Total" },
    vatIncl: { cs: "včetně DPH", en: "incl. VAT" },
    checkout: { cs: "Pokračovat k pokladně", en: "Continue to checkout" },
    continue: { cs: "Pokračovat v nákupu", en: "Continue shopping" },
    note: { cs: "Vozidla registrujeme a předáváme osobně. Příslušenství posíláme po celé ČR.", en: "Vehicles are registered and handed over in person. Accessories ship across Czechia." },
    empty: { cs: "Košík je prázdný.", en: "Your cart is empty." },
    atCheckout: { cs: "podle volby v pokladně", en: "chosen at checkout" },
  },
  checkout: {
    title: { cs: "Pokladna", en: "Checkout" },
    contact: { cs: "Kontakt", en: "Contact" },
    delivery: { cs: "Doprava a odběr", en: "Delivery and collection" },
    payment: { cs: "Platba", en: "Payment" },
    name: { cs: "Jméno a příjmení", en: "Full name" },
    email: { cs: "E-mail", en: "Email" },
    phone: { cs: "Telefon", en: "Phone" },
    street: { cs: "Ulice a číslo", en: "Street and number" },
    city: { cs: "Město", en: "City" },
    zip: { cs: "PSČ", en: "Postcode" },
    optPickup: { cs: "Osobní odběr v Golčově Jeníkově", en: "Pick up in Golčův Jeníkov" },
    optShip: { cs: "Doprava vozidla na adresu", en: "Vehicle delivery to your address" },
    optParcel: { cs: "Balík na adresu (jen příslušenství)", en: "Parcel to address (accessories only)" },
    payTransfer: { cs: "Bankovní převod", en: "Bank transfer" },
    payCard: { cs: "Platební karta", en: "Card" },
    payFin: { cs: "Financování na splátky", en: "Financing" },
    payCash: { cs: "Hotově při odběru", en: "Cash on collection" },
    place: { cs: "Odeslat objednávku", en: "Place order" },
    summary: { cs: "Souhrn objednávky", en: "Order summary" },
    terms: { cs: "Odesláním souhlasíte s obchodními podmínkami. Vozidla vyžadují osobní předání.", en: "By ordering you accept the terms. Vehicles require in-person handover." },
    notes: { cs: "Poznámka", en: "Notes" },
    code: { cs: "Slevový kód", en: "Discount code" },
    apply: { cs: "Použít", en: "Apply" },
    discount: { cs: "Sleva", en: "Discount" },
    badCode: { cs: "Kód není platný.", en: "That code is not valid." },
    choosePoint: { cs: "Vybrat výdejní místo", en: "Choose a pickup point" },
    pickPoint: { cs: "Vyberte prosím výdejní místo.", en: "Please choose a pickup point." },
    noWidget: { cs: "Výběr míst bude dostupný po nastavení Zásilkovny.", en: "Point selection becomes available once Packeta is configured." },
    demo: { cs: "Ukázková verze: objednávky se odesílají až po připojení databáze.", en: "Demo version: orders are sent once the database is connected." },
  },
  service: {
    title: { cs: "Servis a pneuservis", en: "Service and tyres" },
    lead: { cs: "Jedna dílna pro čtyřkolky, UTV, skútry, motocykly a zahradní techniku. Autorizovaný servis CFMOTO, Linhai, TGB, Kentoya a TUMOTO.", en: "One workshop for ATVs, UTVs, scooters, motorcycles and garden machinery. Authorised service for CFMOTO, Linhai, TGB, Kentoya and TUMOTO." },
    items: [
      { cs: "Záruční prohlídky podle servisní knížky", en: "Warranty inspections per the service book" },
      { cs: "Pozáruční opravy všech značek", en: "Post-warranty repairs, all brands" },
      { cs: "Pneuservis pro ATV, skútry i osobní auta", en: "Tyre service for ATVs, scooters and cars" },
      { cs: "Montáž navijáků, radlic a příslušenství", en: "Winch, plow and accessory fitting" },
      { cs: "Příprava na STK a registrace", en: "MOT preparation and registration" },
      { cs: "Zazimování a jarní zprovoznění", en: "Winter storage prep and spring start-up" },
    ] as Text[],
    cta: { cs: "Zavolat do servisu", en: "Call the workshop" },
  },
  contact: {
    title: { cs: "Kontakt", en: "Contact" },
    showroom: { cs: "Prodejna a servis", en: "Showroom and service" },
    hours: { cs: "Otevírací doba", en: "Opening hours" },
    hoursValue: { cs: "Pondělí až pátek 7:30 – 16:00\nSobota a neděle zavřeno", en: "Monday to Friday 7:30 – 16:00\nClosed Saturday and Sunday" },
    phone: { cs: "Telefon", en: "Phone" },
    email: { cs: "E-mail", en: "Email" },
    directions: { cs: "Jak k nám", en: "Getting here" },
    directionsText: { cs: "Areál u nádraží, 200 m od výjezdu z D1 směr Golčův Jeníkov. Parkování s přívěsem přímo před dílnou.", en: "By the railway station, 200 m from the D1 exit towards Golčův Jeníkov. Trailer parking directly in front of the workshop." },
  },
  footer: {
    sales: { cs: "Prodej", en: "Sales" },
    company: { cs: "Firma", en: "Company" },
    help: { cs: "Pomoc", en: "Help" },
    about: { cs: "O nás", en: "About us" },
    terms: { cs: "Obchodní podmínky", en: "Terms" },
    privacy: { cs: "Ochrana údajů", en: "Privacy" },
    financing: { cs: "Financování", en: "Financing" },
    delivery: { cs: "Doprava", en: "Delivery" },
    warranty: { cs: "Záruka", en: "Warranty" },
    parts: { cs: "Náhradní díly", en: "Spare parts" },
    newsletter: { cs: "Novinky e-mailem", en: "News by email" },
    newsletterHint: { cs: "Nové modely a akce, zhruba jednou měsíčně.", en: "New models and offers, roughly once a month." },
    subscribe: { cs: "Odebírat", en: "Subscribe" },
    rights: { cs: "Dvořák a synové s.r.o. · Nádraží 604, 582 82 Golčův Jeníkov", en: "Dvořák a synové s.r.o. · Nádraží 604, 582 82 Golčův Jeníkov" },
  },
};

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "cs", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("cs");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("md-lang");
      if (saved === "en" || saved === "cs") setLangState(saved);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem("md-lang", l); } catch {}
  };
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const { lang, setLang } = useContext(LangCtx);
  const t = (x: Text) => x[lang];
  return { lang, setLang, t };
}
