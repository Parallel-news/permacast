import ArweaveMultihost from 'arweave-multihost'

export const arweave = ArweaveMultihost.initWithDefaultHosts({
  timeout: 10000,         // Network request timeouts in milliseconds
  logging: false,          // Enable network request logging
  logger: null,    // Logger function
  onError: console.error, // On request error callback
});

// TEST CONTRACT:
//export const CONTRACT_SRC = "4uc2tYgjq75xb3Bc5vMZej-7INXxhaTA70NPL23Om4A"
//export const CONTRACT_SRC = "agSUFSa_1xvUuQ8ay9sLKNOI9BzEtJyPJL4CsyW250E"
//export const CONTRACT_SRC = "j1d4jwWRso3lH04--3rZ1Top_DaoGZWwwPKA8rT180M";
export const CONTRACT_SRC = "IyjpXrCrL8CVEwRJuRsVSPMUNn3fUvIsqMUcp3_kmPs";
//export const CONTRACT_SRC = "FqUfSxgoic43S0wiO4_SCjzLgr0Vm2frcGU-PHhAjIU";
export const NFT_SRC = "-xoIBH2TxLkVWo6XWAjdwXZmTbUH09_hPYD6itHFeZY";
// PROD CONTRACT:
//export const CONTRACT_SRC = "aDDvmtV6Rg15LZ5Hp1yjL6strnyCsVbmhpfPe0gT21Y"
export const NEWS_CONTRACT = "HJFEnaWHLMp2ryrR0nzDKb0DSW7aBplDjcs3vQoVbhw"
// + tag { name: "Protocol", values: "permacast-testnet-v3"}
export const queryObject = {
  query: 
    `query {
      transactions(
        tags: [
          { name: "Contract-Src", values: "${CONTRACT_SRC}"},
        ]
      first: 1000000
      ) {
      edges {
        node {
          id
        }
      }
    }
  }`
}

export const categories = [
  'Arts',
  'Business',
  'Comedy',
  'Education',
  'Fiction',
  'Government',
  'History',
  'Kids & Family',
  'Leisure',
  'Music',
  'News',
  'Religion & Spirituality',
  'Science',
  'Society & Culture',
  'Sports',
  'Technology',
  'True Crime',
  'TV & Film'
]

export const languages = {
        "en":    "English",
        "aa":    "Afar",
        "ab":    "Abkhazian",
        "af":    "Afrikaans",
        "am":    "Amharic",
        "ar":    "Arabic",
        "as":    "Assamese",
        "ay":    "Aymara",
        "az":    "Azeri",
        "ba":    "Bashkir",
        "be":    "Belarusian",
        "bg":    "Bulgarian",
        "bh":    "Bihari",
        "bi":    "Bislama",
        "bn":    "Bengali",
        "bo":    "Tibetan",
        "br":    "Breton",
        "ca":    "Catalan",
        "co":    "Corsican",
        "cs":    "Czech",
        "cy":    "Welsh",
        "da":    "Danish",
        "de":    "German",
        "div":   "Divehi",
        "dz":    "Bhutani",
        "el":    "Greek",
        "eo":    "Esperanto",
        "es":    "Spanish",
        "et":    "Estonian",
        "eu":    "Basque",
        "fa":    "Farsi",
        "fi":    "Finnish",
        "fj":    "Fiji",
        "fo":    "Faeroese",
        "fr":    "French",
        "fy":    "Frisian",
        "ga":    "Irish",
        "gd":    "Gaelic",
        "gl":    "Galician",
        "gn":    "Guarani",
        "gu":    "Gujarati",
        "ha":    "Hausa",
        "he":    "Hebrew",
        "hi":    "Hindi",
        "hr":    "Croatian",
        "hu":    "Hungarian",
        "hy":    "Armenian",
        "ia":    "Interlingua",
        "id":    "Indonesian",
        "ie":    "Interlingue",
        "ik":    "Inupiak",
        "in":    "Indonesian",
        "is":    "Icelandic",
        "it":    "Italian",
        "iw":    "Hebrew",
        "ja":    "Japanese",
        "ji":    "Yiddish",
        "jw":    "Javanese",
        "ka":    "Georgian",
        "kk":    "Kazakh",
        "kl":    "Greenlandic",
        "km":    "Cambodian",
        "kn":    "Kannada",
        "ko":    "Korean",
        "kok":   "Konkani",
        "ks":    "Kashmiri",
        "ku":    "Kurdish",
        "ky":    "Kirghiz",
        "kz":    "Kyrgyz",
        "la":    "Latin",
        "ln":    "Lingala",
        "lo":    "Laothian",
        "ls":    "Slovenian",
        "lt":    "Lithuanian",
        "lv":    "Latvian",
        "mg":    "Malagasy",
        "mi":    "Maori",
        "mk":    "FYRO Macedonian",
        "ml":    "Malayalam",
        "mn":    "Mongolian",
        "mo":    "Moldavian",
        "mr":    "Marathi",
        "ms":    "Malay",
        "mt":    "Maltese",
        "my":    "Burmese",
        "na":    "Nauru",
        "ne":    "Nepali (India)",
        "nl":    "Dutch",
        "no":    "Norwegian",
        "oc":    "Occitan",
        "om":    "(Afan)/Oromoor/Oriya",
        "or":    "Oriya",
        "pa":    "Punjabi",
        "pl":    "Polish",
        "ps":    "Pashto/Pushto",
        "pt":    "Portuguese",
        "qu":    "Quechua",
        "rm":    "Rhaeto-Romanic",
        "rn":    "Kirundi",
        "ro":    "Romanian",
        "ru":    "Russian",
        "rw":    "Kinyarwanda",
        "sa":    "Sanskrit",
        "sb":    "Sorbian",
        "sd":    "Sindhi",
        "sg":    "Sangro",
        "sh":    "Serbo-Croatian",
        "si":    "Singhalese",
        "sk":    "Slovak",
        "sl":    "Slovenian",
        "sm":    "Samoan",
        "sn":    "Shona",
        "so":    "Somali",
        "sq":    "Albanian",
        "sr":    "Serbian",
        "ss":    "Siswati",
        "st":    "Sesotho",
        "su":    "Sundanese",
        "sv":    "Swedish",
        "sw":    "Swahili",
        "sx":    "Sutu",
        "syr":    "Syriac",
        "ta":    "Tamil",
        "te":    "Telugu",
        "tg":    "Tajik",
        "th":    "Thai",
        "ti":    "Tigrinya",
        "tk":    "Turkmen",
        "tl":    "Tagalog",
        "tn":    "Tswana",
        "to":    "Tonga",
        "tr":    "Turkish",
        "ts":    "Tsonga",
        "tt":    "Tatar",
        "tw":    "Twi",
        "uk":    "Ukrainian",
        "ur":    "Urdu",
        "us":    "English",
        "uz":    "Uzbek",
        "vi":    "Vietnamese",
        "vo":    "Volapuk",
        "wo":    "Wolof",
        "xh":    "Xhosa",
        "yi":    "Yiddish",
        "yo":    "Yoruba",
        "zh":    "Chinese",
        "zu":    "Zulu"
    }
