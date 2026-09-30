export interface ServiceData {
  id: string;
  name: string;
  category: string;
  tag: string;
  leadTime: string;
  capacity: string;
  summary: string;
  features: string[];
  lanes: string[];
}

export const SERVICES_DATA: ServiceData[] = [
  {
    id: "ocean-fcl",
    name: "Ocean Liner Freight (FCL & LCL)",
    category: "Maritime",
    tag: "High Volume / Cost Efficient",
    leadTime: "12 - 28 Days",
    capacity: "20ft, 40ft, 40ft HQ, 45ft High Cube",
    summary:
      "Direct vessel slot allocations across major maritime alliances. Guaranteed container equipment availability even during peak seasons with live AIS satellite voyage tracking.",
    features: [
      "Contracted carrier space on 2M, Ocean Alliance & THE Alliance",
      "Full Container Load (FCL) and consolidated LCL options",
      "Reefer temperature control with automated IoT telematics",
      "Port-to-Port, Door-to-Port, and Door-to-Door routing",
    ],
    lanes: ["Shanghai ⇄ Rotterdam", "Chittagong ⇄ Singapore", "Ningbo ⇄ Los Angeles"],
  },
  {
    id: "air-cargo",
    name: "Air Freight Express & Charters",
    category: "Aviation",
    tag: "Time-Critical / Express",
    leadTime: "1 - 5 Days",
    capacity: "Up to 110,000 kg (B747 / B777 Freighters)",
    summary:
      "When deadlines can't wait, our air cargo network delivers urgent components, high-value electronics, and emergency replenishment via direct flights and dedicated cargo charters.",
    features: [
      "Next-Flight-Out (NFO) priority boarding",
      "Consolidated deferred air options for reduced expenses",
      "Dangerous Goods (DGR) certified handling",
      "Airport ramp tarmac transfer with armed security options",
    ],
    lanes: ["Frankfurt ⇄ Dubai", "Hong Kong ⇄ Chicago", "Singapore ⇄ London Heathrow"],
  },
  {
    id: "intermodal-trucking",
    name: "Overland Intermodal & Drayage",
    category: "Ground",
    tag: "Regional & Cross-Border",
    leadTime: "12 Hours - 4 Days",
    capacity: "Standard 53ft, Flatbed, Lowboy, Curtainsider",
    summary:
      "Complete inland drayage from ocean terminals and rail ramps directly to your warehouse doors. GPS-equipped Freigeht with live driver dispatch and electronic proof of delivery.",
    features: [
      "Port & rail container drayage with zero demurrage guarantees",
      "Cross-border bonded transit under TIR carnet",
      "Automated route optimization avoiding road tolls and traffic",
      "Real-time driver telematics and speed monitoring",
    ],
    lanes: ["Rotterdam ⇄ Ruhr Valley", "Chicago ⇄ Dallas", "Chittagong ⇄ Dhaka EPZ"],
  },
  {
    id: "customs-brokerage",
    name: "AI Customs Clearance & Brokerage",
    category: "Compliance",
    tag: "Zero-Hold Border Clearance",
    leadTime: "Under 4 Hours",
    capacity: "Unlimited Declarations",
    summary:
      "Automate HS tariff classifications and import duty calculations. Our licensed in-house customs brokers manage pre-arrival filing to ensure rapid release without border demurrage.",
    features: [
      "Automated electronic entry filing (ACE, CDS, ATLAS)",
      "Automated tariff duty calculation & VAT reclaim assistance",
      "Sanctions, dual-use goods, and anti-dumping checks",
      "Complete digital audit trail for tax authorities",
    ],
    lanes: ["European Union", "United States CBP", "ASEAN Single Window", "UK HMRC"],
  },
  {
    id: "smart-warehousing",
    name: "Smart Warehousing & 3PL Hubs",
    category: "Storage",
    tag: "Automated Inventory",
    leadTime: "Same-Day Dispatch",
    capacity: "450,000+ sq ft across 12 Hubs",
    summary:
      "Modern bonded and ambient warehousing facilities equipped with WMS real-time API integrations, automated cross-docking, pick-and-pack, and kitting.",
    features: [
      "Bonded customs warehouse storage to defer import duties",
      "Barcode and RFID asset tagging for 99.98% inventory accuracy",
      "Cross-dock consolidation and pallet breakdown",
      "Direct API integration with Shopify, SAP, and NetSuite",
    ],
    lanes: ["Singapore Hub", "Rotterdam Maasvlakte", "Jebel Ali Dubai", "New Jersey Terminal"],
  },
  {
    id: "cold-chain",
    name: "Pharma & Cold Chain Logistics",
    category: "Specialized",
    tag: "-25°C to +25°C Controlled",
    leadTime: "Pre-scheduled Priority",
    capacity: "Active & Passive Cold Boxes",
    summary:
      "Unbroken cold chain custody for biologics, vaccines, perishable fresh food, and chemical goods with redundant active temperature loggers transmitting live telemetry.",
    features: [
      "GDP (Good Distribution Practice) compliant handling",
      "Dry ice replenishment and cryogenic nitrogen shippers",
      "Real-time temperature and humidity telemetry alerts",
      "Dedicated refrigerated container plugs on vessel decks",
    ],
    lanes: ["Basel ⇄ Boston", "Oslo ⇄ Tokyo", "Santiago ⇄ Philadelphia"],
  },
];
