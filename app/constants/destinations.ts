/**
 * Supported Major Ports & Hubs for Freight Pricing Calculation
 */

export interface PortOption {
    code: string;
    name: string;
    country: string;
    region: string;
}

export const MAJOR_PORTS: PortOption[] = [
    // Bangladesh Hubs
    { code: "BDCGP", name: "Chattogram Port", country: "Bangladesh", region: "Asia" },
    { code: "BDDAC", name: "Dhaka Airport / ICD", country: "Bangladesh", region: "Asia" },
    { code: "BDMGL", name: "Mongla Port", country: "Bangladesh", region: "Asia" },

    // Middle East Corridor
    { code: "AEJEA", name: "Jebel Ali Port / Dubai", country: "UAE", region: "Middle East" },
    { code: "SAJED", name: "Jeddah Islamic Port", country: "Saudi Arabia", region: "Middle East" },
    { code: "QADOH", name: "Hamad Port / Doha", country: "Qatar", region: "Middle East" },

    // Asia Hubs
    { code: "SGSIN", name: "Port of Singapore", country: "Singapore", region: "Asia" },
    { code: "MYPKG", name: "Port Klang", country: "Malaysia", region: "Asia" },
    { code: "CNSHA", name: "Port of Shanghai", country: "China", region: "Asia" },
    { code: "INNSA", name: "Nhava Sheva (JNPT) Mumbai", country: "India", region: "Asia" },

    // Europe Hubs
    { code: "NLRTM", name: "Port of Rotterdam", country: "Netherlands", region: "Europe" },
    { code: "DEHAM", name: "Port of Hamburg", country: "Germany", region: "Europe" },
    { code: "GBFXT", name: "Port of Felixstowe", country: "United Kingdom", region: "Europe" },

    // Americas Hubs
    { code: "USLAX", name: "Port of Los Angeles", country: "United States", region: "Americas" },
    { code: "USNYC", name: "Port of New York & New Jersey", country: "United States", region: "Americas" },
    { code: "CAVAN", name: "Port of Vancouver", country: "Canada", region: "Americas" },
];
