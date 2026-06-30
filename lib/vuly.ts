export function isVulyBrand(name: string) {
  return name.trim().toLowerCase() === "vuly";
}

export function isAconBrand(name: string) {
  return name.trim().toLowerCase() === "acon";
}

export function isZupapaBrand(name: string) {
  return name.trim().toLowerCase() === "zupapa";
}

export function isJumpzyllaBrand(name: string) {
  return name.trim().toLowerCase() === "jumpzylla";
}

export function isSpringfreeBrand(name: string) {
  return name.trim().toLowerCase() === "springfree";
}

export function isSkywalkerBrand(name: string) {
  return name.trim().toLowerCase() === "skywalker";
}

export function isJumpflexBrand(name: string) {
  return name.trim().toLowerCase() === "jumpflex";
}

export function isOrccBrand(name: string) {
  return name.trim().toLowerCase() === "orcc";
}

export function isAffiliateBrand(name: string) {
  return isVulyBrand(name)
    || isAconBrand(name)
    || isZupapaBrand(name)
    || isJumpzyllaBrand(name)
    || isSpringfreeBrand(name)
    || isSkywalkerBrand(name)
    || isJumpflexBrand(name)
    || isOrccBrand(name);
}
