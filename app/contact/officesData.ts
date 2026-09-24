export interface OfficeItem {
  city: string;
  address: string;
  phone: string;
  email: string;
  role: string;
}

export const OFFICES: OfficeItem[] = [
  {
    city: "Rotterdam, Netherlands",
    address: "Maasvlakte 2, Haven 9200, 3047 AL Rotterdam",
    phone: "+31 10 798 4400",
    email: "rotterdam.ops@freightagent.com",
    role: "European Maritime Operations",
  },
  {
    city: "Singapore",
    address: "10 Pasir Panjang Road, Mapletree Business City, Singapore 117438",
    phone: "+65 6829 5500",
    email: "singapore.ops@freightagent.com",
    role: "Southeast Asia Control Tower",
  },
  {
    city: "Dubai, United Arab Emirates",
    address: "JAFZA View 18, Jebel Ali Free Zone, Dubai",
    phone: "+971 4 881 9200",
    email: "dubai.desk@freightagent.com",
    role: "Middle East & South Asia Desk",
  },
  {
    city: "Chittagong, Bangladesh",
    address: "Agrabad Commercial Area, Chittagong 4100",
    phone: "+880 31 716 300",
    email: "chittagong.ops@freightagent.com",
    role: "Bay of Bengal Port Hub",
  },
  {
    city: "New York, USA",
    address: "One World Trade Center, Suite 8500, New York, NY 10007",
    phone: "+1 (800) 458-9921",
    email: "americas@freightagent.com",
    role: "Americas Headquarters",
  },
];
