/**
 * Supported Major Ports & Hubs for Freight Pricing Calculation
 */

export interface PortOption {
    code: string;
    name: string;
    country: string;
    region: string;
    flag: string;
}

export const MAJOR_PORTS: PortOption[] = [
    // Bangladesh Maritime Ports (No Airports)
    { code: "BDCGP", name: "Chattogram Port", country: "Bangladesh", region: "Asia", flag: "🇧🇩" },
    { code: "BDMGL", name: "Mongla Port", country: "Bangladesh", region: "Asia", flag: "🇧🇩" },
    { code: "BDPYR", name: "Payra Deep Sea Port", country: "Bangladesh", region: "Asia", flag: "🇧🇩" },

    // Middle East Corridor
    { code: "AEJEA", name: "Jebel Ali Port / Dubai", country: "UAE", region: "Middle East", flag: "🇦🇪" },
    { code: "SAJED", name: "Jeddah Islamic Port", country: "Saudi Arabia", region: "Middle East", flag: "🇸🇦" },
    { code: "QADOH", name: "Hamad Port / Doha", country: "Qatar", region: "Middle East", flag: "🇶🇦" },
    { code: "OMSOH", name: "Port of Sohar", country: "Oman", region: "Middle East", flag: "🇴🇲" },

    // Asia Maritime Hubs
    { code: "SGSIN", name: "Port of Singapore", country: "Singapore", region: "Asia", flag: "🇸🇬" },
    { code: "MYPKG", name: "Port Klang", country: "Malaysia", region: "Asia", flag: "🇲🇾" },
    { code: "CNSHA", name: "Port of Shanghai", country: "China", region: "Asia", flag: "🇨🇳" },
    { code: "CNNBO", name: "Port of Ningbo-Zhoushan", country: "China", region: "Asia", flag: "🇨🇳" },
    { code: "INNSA", name: "Nhava Sheva (JNPT) Mumbai", country: "India", region: "Asia", flag: "🇮🇳" },
    { code: "LKCMB", name: "Port of Colombo", country: "Sri Lanka", region: "Asia", flag: "🇱🇰" },

    // Europe Maritime Hubs
    { code: "NLRTM", name: "Port of Rotterdam", country: "Netherlands", region: "Europe", flag: "🇳🇱" },
    { code: "DEHAM", name: "Port of Hamburg", country: "Germany", region: "Europe", flag: "🇩🇪" },
    { code: "BEANR", name: "Port of Antwerp", country: "Belgium", region: "Europe", flag: "🇧🇪" },
    { code: "GBFXT", name: "Port of Felixstowe", country: "United Kingdom", region: "Europe", flag: "🇬🇧" },

    // Americas Maritime Hubs
    { code: "USLAX", name: "Port of Los Angeles", country: "United States", region: "Americas", flag: "🇺🇸" },
    { code: "USNYC", name: "Port of New York & New Jersey", country: "United States", region: "Americas", flag: "🇺🇸" },
    { code: "CAVAN", name: "Port of Vancouver", country: "Canada", region: "Americas", flag: "🇨🇦" },
];
