// Local logo files take priority. Clearbit is only used as fallback for brands not listed here.
const BRAND_LOCAL_LOGOS: Record<string, string> = {
  'Akrobat':                  '/brand-logos/akrobat.svg',
  'Texas Trampolines':        '/brand-logos/texas-trampolines.png',
  'Crazy Ape':                '/brand-logos/crazy-ape.svg',
  'ACON':                     '/brand-logos/acon.png',
  'AlleyOOP':                 '/brand-logos/alleyoop.png',
  'Avyna':                    '/brand-logos/avyna.png',
  'BCAN':                     '/brand-logos/bcan.jpeg',
  'Beast':                    '/brand-logos/beast.png',
  'Capital Play':             '/brand-logos/capital-play.png',
  'Jumpflex':                 '/brand-logos/jumpflex.png',
  'Jump Yeti':                '/brand-logos/jump-yeti.png',
  'JumpSport':                '/brand-logos/jumpsport.png',
  'MaxAir':                   '/brand-logos/maxair.png',
  'North':                    '/brand-logos/north.png',
  'Vuly':                     '/brand-logos/vuly.png',
  'Skywalker':                '/brand-logos/skywalker.png',
  'Springfree':               '/brand-logos/springfree.png',
  'Sportspower':              '/brand-logos/sportspower.png',
  'Sportspower / Bounce Pro': '/brand-logos/sportspower.png',
  'Zupapa':                   '/brand-logos/zupapa.png',
  'JumpKing':                 '/brand-logos/jumpking.png',
  'Little Tikes':             '/brand-logos/little-tikes.png',
  'ORCC':                     '/brand-logos/orcc.png',
  'JUMPZYLLA':                '/brand-logos/jumpzylla.png',
  'Upper Bounce':             '/brand-logos/upper-bounce.png',
  'West Coast Jump':          '/brand-logos/west-coast-jump.png',
  'Zero Gravity':             '/brand-logos/zero-gravity.jpeg',
};

const BRAND_CLEARBIT_DOMAINS: Record<string, string> = {
  'Bounce Pro':               'sportspowerltd.net',
};

// Preferred brand shop/collection URLs for outbound CTAs.
export const BRAND_SHOP_URLS: Record<string, string> = {
  'Akrobat':                  'https://www.akrobat.com/us/trampolines/all-trampolines',
  'Texas Trampolines':        'http://www.texastrampolines.com/display.asp?departmentID=262&view=all',
  'Crazy Ape':                'https://crazyape.shop/collections/trampolines',
  'Springfree':               'https://www.amazon.com/stores/SpringfreeTrampoline/page/58A3ACF0-B069-4CBF-BE94-90D6287FA73E?tag=bounce092-20',
  'ACON':                     'https://us.acon24.com/collections/menu-trampolines',
  'Jumpflex':                 'https://www.amazon.com/stores/Jumpflex/page/1D21C722-6A37-4FCF-9579-322B558A355C?tag=bounce092-20',
  'Vuly':                     'https://www.vulyplay.com/aff/100/',
  'Skywalker':                'https://www.amazon.com/stores/SkywalkerTrampolines/page/BD97F687-9035-41A4-A529-C990960C862B?tag=bounce092-20',
  'Upper Bounce':             'https://machrus.com/collections/upper-bounce-trampolines',
  'Zupapa':                   'https://www.zupapa.us/?ref=bltzjtnf',
  'JUMPZYLLA':                'https://www.amazon.com/stores/JUMPZYLLA/page/076B3548-F40F-45F3-B42F-647D3985453B?lp_asin=B09Q19MDH9&tag=bounce092-20',
  'JumpKing':                 'https://www.jumpking.com/trampolines',
  'Sportspower / Bounce Pro': 'https://www.sportspowerltd.net/trampolines',
  'Little Tikes':             'https://www.littletikes.com/collections/trampolines',
  'ORCC':                     'https://www.amazon.com/stores/page/67583A3C-507F-411A-A70A-F9CE8A03F0EA?tag=bounce092-20',
};

export function getBrandLogoUrl(brandName: string): string | null {
  if (BRAND_LOCAL_LOGOS[brandName]) return BRAND_LOCAL_LOGOS[brandName];
  const domain = BRAND_CLEARBIT_DOMAINS[brandName];
  if (domain) return `https://logo.clearbit.com/${domain}`;
  return null;
}

export function getBrandShopUrl(brandName: string, csvFallback: string | null): string | null {
  return csvFallback ?? BRAND_SHOP_URLS[brandName];
}
