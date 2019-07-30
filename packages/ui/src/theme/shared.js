export const Saturation = Object.freeze({
  high: 'high',
  low: 'low',
});

const DefaultSaturationMap = {
  high: 100,
  low: 25,
};

export const makeColorFn =
  (hue, saturationMap = DefaultSaturationMap) =>
    (sat, lum) => {
      const effectiveSat = saturationMap[sat];
      return `hsl(${hue}, ${effectiveSat}%, ${lum}%)`;
    };

// Purple
export const primaryColor = makeColorFn(291, {
  high: 70,
  low: 45,
});

// Blue with a tiny bit of green (bluish grey)
export const secondaryColor = makeColorFn(200, {
  high: 10,
  low: 5,
});

// Red with the tiniest hint of green
export const dangerColor = makeColorFn(1, {
  high: 90,
  low: 50,
});

// Blue with a tiny bit of green (bluish grey)
export const generalColor = makeColorFn(200, {
  high: 15,
  low: 10,
});

// Greenish blue
export const focusColor = makeColorFn(200, {
  high: 95,
  low: 60,
});

// Greenish blue, with less green
export const selectionColor = makeColorFn(205, {
  high: 95,
  low: 60,
});
