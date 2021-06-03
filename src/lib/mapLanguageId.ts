const mapLanguageId = (platform: string, id: number) => {
  const languages: any = {
    Macintosh: {
      0: {
        lang: 'English',
      },
      4: {
        lang: 'Dutch'
      }
    },
    Microsoft: {
      0x409: {
        lang: "English",
        reg: "United States"
      },
      0x809: {
        lang: "English",
        reg: "United Kingdom"
      }
    }
  };

  const language = languages[platform][id]

  if (language) {
    language.id = id
  }

  return language;
};

export default mapLanguageId;