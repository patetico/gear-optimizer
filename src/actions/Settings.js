export const SETTINGS = 'Configure settings.';
export const TITAN = 'Go to titan.';

export const Settings = (statname, stats) => ({
  type: SETTINGS,
  payload: { statname, stats },
});

export const Go2Titan = (titan, looty, pendant, accslots) => ({
  type: TITAN,
  payload: {
    titan, looty, pendant, accslots,
  },
});
