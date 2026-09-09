export const img = (id: string, w = 1600, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}${
    h ? `&h=${h}` : ""
  }`;

export const imgSrcSet = (
  id: string,
  widths: number[] = [640, 960, 1280, 1600],
  h?: number,
) => widths.map((w) => `${img(id, w, h)} ${w}w`).join(", ");

export const IMG = {
  heroCar: "1626381958625-f4e4ea343925",
  heroCarAlt: "1603189617530-6d32306f57c5",
  blackSedan: "1594051673969-172a6f721d3c",
  parkedBlack: "1632239524459-5c3137fcdae9",
  bmwBadge: "1680844540129-48dacc7d5d88",
  bmwGarage: "1632239524459-5c3137fcdae9",

  paintBumper: "1675446559093-7523bf74b7ff",
  paintShine: "1735231828340-de64fb535705",
  paintRed: "1656400313914-9cf2e891b0c0",

  headlight: "1774887074328-da3a9e794e6a",
  headlightV: "1666887508454-710055bfd9fb",

  leatherQuilt: "1564842505181-8862a3b9b173",
  leatherBlack: "1519120433933-22bc753101f3",
  leatherSeat: "1601673632676-12f89e430aa3",

  wheel: "1705387957446-d8415e0f5b7b",
  garage: "1731183019339-8d47a6113766",

  carbon: "1637004732258-4b792ce8f474",

  taillightNight: "1642268565002-729f4e3dad5b",
  brakeLight: "1495506539593-87a23e41b6fe",

  engine: "1615906655593-ad0386982a0f",
  engineBay: "1622062929134-a8fa99b46f56",
  diagnostic: "1727893380169-4dda123e19f7",

  transformDiagnose: "1653607240501-92c08ed94c7f",
  transformProtect: "1421344424210-2db540391216",
  transformRestore: "1780558852671-e47265577239",
  transformRefine: "1760161339261-56487b766a17",

  processQC: "1761934657948-708146148588",
  processHandover: "1562003596-a5827707367d",

  navAbout: "1619642751034-765dfdf7c58e",
  navServices: "1786198984387-b63cdf520602",
  navProjects: "1611785677708-128fc827a1e0",
  navNews: "1750558222639-3573a142508d",
};
