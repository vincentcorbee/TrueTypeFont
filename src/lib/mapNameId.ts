const mapNameId = (id: number) => {
  const names: any = {
    0: {
      name: "Copyright"
    },
    1: {
      name: "FontFamily"
    },
    2: {
      name: "FontSubfamily"
    },
    3: {
      name: "UniqueSubfamily"
    },
    4: {
      name: "FullName"
    },
    5: {
      name: "Version"
    },
    6: {
      name: "PostScriptName"
    },
    7: {
      name: "Trademark"
    },
    8: {
      name: "ManufacturerName"
    },
    9: {
      name: "DesignerName"
    },
    10: {
      name: "Description"
    },
    11: {
      name: "VendorURL"
    },
    12: {
      name: "DesignerURL"
    },
    13: {
      name: "LicenseDescription"
    },
    14: {
      name: "LicenseURL"
    },
    16: {
      name: "PreferredFamily"
    },
    17: {
      name: "PreferredSubfamily"
    }
  };

  const name = names[id];

  if (name) {
    name.id = id;
  }

  return name;
};

export default mapNameId