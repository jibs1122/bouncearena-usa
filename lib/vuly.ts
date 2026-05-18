export function isVulyBrand(name: string) {
  return name.trim().toLowerCase() === "vuly";
}

export function isAconBrand(name: string) {
  return name.trim().toLowerCase() === "acon";
}

export function isAffiliateBrand(name: string) {
  return isVulyBrand(name) || isAconBrand(name);
}
