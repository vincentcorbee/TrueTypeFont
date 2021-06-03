const mapPlatformId = (id:number) => {
  const identifiers: any = {
    0: {
      id,
      platform: "Unicode",
      desc: "Indicates Unicode version"
    },
    1: {
      id,
      platform: "Macintosh",
      desc: "QuickDraw Script Manager code"
    },
    3: {
      id,
      platform: "Microsoft",
      desc: "Microsoft encoding"
    }
  };

  return identifiers[id];
};

export default mapPlatformId