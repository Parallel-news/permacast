export function RGBobjectToString(rgb) {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function RGBobjectToArray(rgb) {
  return [rgb.r, rgb.g, rgb.b];
}

export function RGBstringToArray(str) {
  return str.replace(/[^0-9,]/g, '').split(',');
}

export function RGBtoHSL (rgb) {
  let r, g, b;
  if (typeof(rgb) === 'string') [r, g, b] = RGBstringToArray(rgb);
  if (Array.isArray(rgb)) [r, g, b] = rgb;
  if (typeof rgb === 'object') [r, g, b] = RGBobjectToArray(rgb);  

  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return {h: h, s: s, l: l};
}

export function HSLtoRGB (h, s, l) {
  let r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }

    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {r: r * 255, g: g * 255, b: b * 255};
}

export function replaceDarkColorsRGB (rgbArg, lightness=0.25) {
  let hsl = RGBtoHSL(rgbArg);
  if (hsl.l < lightness) hsl.l = lightness;
  let rgb = HSLtoRGB(hsl.h, hsl.s, hsl.l);
  rgb.r = Math.round(rgb.r);
  rgb.g = Math.round(rgb.g);
  rgb.b = Math.round(rgb.b);
  return rgb;
}


export function replaceLightColorsRGB(rgbArg, lightness=0.9) {
  let hsl = RGBtoHSL(...rgbArg);
  if (hsl.l > lightness) hsl.l = lightness;
  let rgb = HSLtoRGB(hsl.h, hsl.s, hsl.l);
  rgb.r = Math.round(rgb.r);
  rgb.g = Math.round(rgb.g);
  rgb.b = Math.round(rgb.b);
  return rgb;
}

/** @param {Array} rgbArg - example: [255, 255, 255] */
export function isTooDark (rgbArg, lightness=0.25) {
  let hsl = RGBtoHSL(rgbArg);
  return hsl.l < lightness;
}

/** @param {Array} rgbArg - example: [255, 255, 255] */
export function isTooLight(rgbArg, lightness=0.9) {
  let hsl = RGBtoHSL(rgbArg);
  return hsl.l > lightness;
}

export const shortenAddress = (addr) => {
  return addr.substring(0, 4) + '...' + addr.substring(addr.length - 4);
}

// capitalize first letter, remove ar from label
export const trimANSLabel = (label) => {
  return label.replace(/\w/, c => c.toUpperCase()).replace('ar', '')
}

export const LANGUAGES = [
  {
    "code": "en",
    "name": "English"
  },
  {
    "code": "zh",
    "name": "简体中文"
  },
]

export const MOCK_CREATORS = [
  {
    fullname: 'Marton Lederer',
    anshandle: 'martonlederer',
    avatar: 'https://avatars.githubusercontent.com/u/30638105?v=4',
  }, {
    fullname: 'Marton Lederer',
    anshandle: 'martonlederer',
    avatar: 'https://avatars.githubusercontent.com/u/30638105?v=4',
  }, {
    fullname: 'Marton Lederer',
    anshandle: 'martonlederer',
    avatar: 'https://avatars.githubusercontent.com/u/30638105?v=4',
  }
]
