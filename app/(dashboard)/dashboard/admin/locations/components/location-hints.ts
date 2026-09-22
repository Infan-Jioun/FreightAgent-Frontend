import type { LocationHint } from "@/app/types/interface";

export type { LocationHint };

export const LOCATION_HINTS: Record<string, LocationHint> = {
    // Bangladesh
    chittagong: { country: "Bangladesh", countryCode: "BD", city: "Chittagong", region: "Chittagong Division", lat: "22.3475", lng: "91.8123", type: "SEA_PORT" },
    chattogram: { country: "Bangladesh", countryCode: "BD", city: "Chittagong", region: "Chittagong Division", lat: "22.3475", lng: "91.8123", type: "SEA_PORT" },
    cgp: { country: "Bangladesh", countryCode: "BD", city: "Chittagong", region: "Chittagong Division", lat: "22.3475", lng: "91.8123", type: "SEA_PORT" },
    dhaka: { country: "Bangladesh", countryCode: "BD", city: "Dhaka", region: "Dhaka Division", lat: "23.8433", lng: "90.3978", type: "AIR_PORT" },
    dac: { country: "Bangladesh", countryCode: "BD", city: "Dhaka", region: "Dhaka Division", lat: "23.8433", lng: "90.3978", type: "AIR_PORT" },
    shahjalal: { country: "Bangladesh", countryCode: "BD", city: "Dhaka", region: "Dhaka Division", lat: "23.8433", lng: "90.3978", type: "AIR_PORT" },
    mongla: { country: "Bangladesh", countryCode: "BD", city: "Mongla", region: "Khulna Division", lat: "22.4833", lng: "89.5833", type: "SEA_PORT" },
    mgl: { country: "Bangladesh", countryCode: "BD", city: "Mongla", region: "Khulna Division", lat: "22.4833", lng: "89.5833", type: "SEA_PORT" },
    sylhet: { country: "Bangladesh", countryCode: "BD", city: "Sylhet", region: "Sylhet Division", lat: "24.8949", lng: "91.8687", type: "AIR_PORT" },
    zyl: { country: "Bangladesh", countryCode: "BD", city: "Sylhet", region: "Sylhet Division", lat: "24.8949", lng: "91.8687", type: "AIR_PORT" },
    // Singapore
    singapore: { country: "Singapore", countryCode: "SG", city: "Singapore", region: "Central Region", lat: "1.2644", lng: "103.8222", type: "SEA_PORT" },
    sgp: { country: "Singapore", countryCode: "SG", city: "Singapore", region: "Central Region", lat: "1.2644", lng: "103.8222", type: "SEA_PORT" },
    sin: { country: "Singapore", countryCode: "SG", city: "Singapore", region: "East Region", lat: "1.3644", lng: "103.9915", type: "AIR_PORT" },
    changi: { country: "Singapore", countryCode: "SG", city: "Singapore", region: "East Region", lat: "1.3644", lng: "103.9915", type: "AIR_PORT" },
    // UAE
    dubai: { country: "United Arab Emirates", countryCode: "AE", city: "Dubai", region: "Dubai Emirate", lat: "25.2048", lng: "55.2708", type: "AIR_PORT" },
    dxb: { country: "United Arab Emirates", countryCode: "AE", city: "Dubai", region: "Dubai Emirate", lat: "25.2528", lng: "55.3644", type: "AIR_PORT" },
    "jebel ali": { country: "United Arab Emirates", countryCode: "AE", city: "Dubai", region: "Dubai Emirate", lat: "24.9857", lng: "55.0611", type: "SEA_PORT" },
    jea: { country: "United Arab Emirates", countryCode: "AE", city: "Dubai", region: "Dubai Emirate", lat: "24.9857", lng: "55.0611", type: "SEA_PORT" },
    // Sri Lanka
    colombo: { country: "Sri Lanka", countryCode: "LK", city: "Colombo", region: "Western Province", lat: "6.9271", lng: "79.8612", type: "SEA_PORT" },
    cmb: { country: "Sri Lanka", countryCode: "LK", city: "Colombo", region: "Western Province", lat: "6.9271", lng: "79.8612", type: "SEA_PORT" },
    // China
    shanghai: { country: "China", countryCode: "CN", city: "Shanghai", region: "Shanghai Municipality", lat: "31.2304", lng: "121.4737", type: "SEA_PORT" },
    pvg: { country: "China", countryCode: "CN", city: "Shanghai", region: "Shanghai Municipality", lat: "31.1443", lng: "121.8083", type: "AIR_PORT" },
    shenzhen: { country: "China", countryCode: "CN", city: "Shenzhen", region: "Guangdong Province", lat: "22.5431", lng: "114.0579", type: "SEA_PORT" },
    guangzhou: { country: "China", countryCode: "CN", city: "Guangzhou", region: "Guangdong Province", lat: "23.1291", lng: "113.2644", type: "SEA_PORT" },
    beijing: { country: "China", countryCode: "CN", city: "Beijing", region: "Beijing Municipality", lat: "39.9042", lng: "116.4074", type: "AIR_PORT" },
    pek: { country: "China", countryCode: "CN", city: "Beijing", region: "Beijing Municipality", lat: "40.0799", lng: "116.6031", type: "AIR_PORT" },
    // India
    mumbai: { country: "India", countryCode: "IN", city: "Mumbai", region: "Maharashtra", lat: "18.9220", lng: "72.8347", type: "SEA_PORT" },
    bom: { country: "India", countryCode: "IN", city: "Mumbai", region: "Maharashtra", lat: "19.0896", lng: "72.8656", type: "AIR_PORT" },
    delhi: { country: "India", countryCode: "IN", city: "New Delhi", region: "Delhi", lat: "28.5562", lng: "77.1000", type: "AIR_PORT" },
    del: { country: "India", countryCode: "IN", city: "New Delhi", region: "Delhi", lat: "28.5562", lng: "77.1000", type: "AIR_PORT" },
    chennai: { country: "India", countryCode: "IN", city: "Chennai", region: "Tamil Nadu", lat: "13.0827", lng: "80.2707", type: "SEA_PORT" },
    maa: { country: "India", countryCode: "IN", city: "Chennai", region: "Tamil Nadu", lat: "12.9941", lng: "80.1709", type: "AIR_PORT" },
    kolkata: { country: "India", countryCode: "IN", city: "Kolkata", region: "West Bengal", lat: "22.5726", lng: "88.3639", type: "SEA_PORT" },
    ccu: { country: "India", countryCode: "IN", city: "Kolkata", region: "West Bengal", lat: "22.6542", lng: "88.4467", type: "AIR_PORT" },
    // Malaysia
    "port klang": { country: "Malaysia", countryCode: "MY", city: "Klang", region: "Selangor", lat: "3.0319", lng: "101.3868", type: "SEA_PORT" },
    pkg: { country: "Malaysia", countryCode: "MY", city: "Klang", region: "Selangor", lat: "3.0319", lng: "101.3868", type: "SEA_PORT" },
    kl: { country: "Malaysia", countryCode: "MY", city: "Kuala Lumpur", region: "Federal Territory", lat: "3.1390", lng: "101.6869", type: "AIR_PORT" },
    kul: { country: "Malaysia", countryCode: "MY", city: "Kuala Lumpur", region: "Selangor", lat: "2.7456", lng: "101.7099", type: "AIR_PORT" },
    // Japan
    tokyo: { country: "Japan", countryCode: "JP", city: "Tokyo", region: "Kantō", lat: "35.5494", lng: "139.7798", type: "SEA_PORT" },
    nrt: { country: "Japan", countryCode: "JP", city: "Tokyo", region: "Chiba Prefecture", lat: "35.7720", lng: "140.3929", type: "AIR_PORT" },
    osaka: { country: "Japan", countryCode: "JP", city: "Osaka", region: "Kansai", lat: "34.6937", lng: "135.5023", type: "SEA_PORT" },
    // South Korea
    busan: { country: "South Korea", countryCode: "KR", city: "Busan", region: "Busan Metropolitan City", lat: "35.1796", lng: "129.0756", type: "SEA_PORT" },
    pus: { country: "South Korea", countryCode: "KR", city: "Busan", region: "Busan Metropolitan City", lat: "35.1796", lng: "129.0756", type: "SEA_PORT" },
    // Netherlands
    rotterdam: { country: "Netherlands", countryCode: "NL", city: "Rotterdam", region: "South Holland", lat: "51.9225", lng: "4.4792", type: "SEA_PORT" },
    rtm: { country: "Netherlands", countryCode: "NL", city: "Rotterdam", region: "South Holland", lat: "51.9225", lng: "4.4792", type: "SEA_PORT" },
    // Germany
    hamburg: { country: "Germany", countryCode: "DE", city: "Hamburg", region: "Hamburg", lat: "53.5753", lng: "9.8689", type: "SEA_PORT" },
    // USA
    "los angeles": { country: "United States", countryCode: "US", city: "Los Angeles", region: "California", lat: "33.7395", lng: "-118.2596", type: "SEA_PORT" },
    lax: { country: "United States", countryCode: "US", city: "Los Angeles", region: "California", lat: "33.9425", lng: "-118.4081", type: "AIR_PORT" },
    "new york": { country: "United States", countryCode: "US", city: "New York", region: "New York", lat: "40.6413", lng: "-73.7781", type: "AIR_PORT" },
    jfk: { country: "United States", countryCode: "US", city: "New York", region: "New York", lat: "40.6413", lng: "-73.7781", type: "AIR_PORT" },
};

export function detectLocationHint(nameOrCode: string): LocationHint | null {
    if (!nameOrCode || nameOrCode.trim().length < 2) return null;
    const lower = nameOrCode.trim().toLowerCase();
    if (LOCATION_HINTS[lower]) return LOCATION_HINTS[lower];
    for (const key of Object.keys(LOCATION_HINTS)) {
        if (lower.includes(key) || key.includes(lower)) return LOCATION_HINTS[key];
    }
    return null;
}