// Public display metadata from the reviewed 2026 survey. No response or legacy archive data.
export const surveyQuestions: Record<string, any> = {
  "74136a7958bd45eb8fa1d481946b622e": {
    "label": "Site location",
    "type": "SiteQuestion"
  },
  "b74fc16dcdb844a7b0ea919324546faf": {
    "label": "Date and time of activity",
    "type": "DateQuestion"
  },
  "24db050eb2d9466eb603e03260a30f53": {
    "label": "School, organization, or group",
    "type": "TextQuestion"
  },
  "fecc34e5a3494148acced42e93e9ef68": {
    "label": "Number of people in your group",
    "type": "NumberQuestion"
  },
  "267366e9aab34ff7a88a8e068e9b4568": {
    "label": "Please indicate the approximate number of participants in each age range:",
    "type": "MatrixQuestion",
    "items": {
      "HBUkVKA": "0-10 years",
      "QHZbmSs": "11-14 years",
      "wUBKuNa": "15-17 years",
      "GZj6VLa": "18+ years"
    },
    "columns": {
      "f0fbdeabb7fc4d339662a29219d03422": {
        "label": "Number of participants",
        "type": "NumberColumnQuestion",
        "units": {}
      }
    }
  },
  "8f8500074c604f86948cfba58214884b": {
    "label": "Please indicate the approximate number of participants in each gender identity:",
    "type": "MatrixQuestion",
    "items": {
      "cnHeHQz": "Male",
      "u8TBaUu": "Female",
      "SUFWY1b": "Other"
    },
    "columns": {
      "8f71f14b10c3419a9d79f53aea8ab63c": {
        "label": "Number of participants",
        "type": "NumberColumnQuestion",
        "units": {}
      }
    }
  },
  "fac5df3a0f374650a3cfb55be362f3f6": {
    "label": "Were volunteers from any of following groups involved in your event? If so, how many?",
    "type": "MatrixQuestion",
    "items": {
      "c8rgvKC": "Xylem"
    },
    "columns": {
      "69e7b0ff09704bfeb363555c1217e444": {
        "label": "Yes",
        "type": "CheckColumnQuestion",
        "units": {}
      },
      "15a4594777ec4ec3af8e03e9d9492e38": {
        "label": "How many?",
        "type": "NumberColumnQuestion",
        "units": {}
      }
    }
  },
  "5be63e7858bd4097912cdc2cf92d3429": {
    "label": "Which Water Challenge activities did you/your group participate in?",
    "type": "MulticheckQuestion",
    "choices": {
      "fqud6M9": "Water quality testing",
      "edHnNYr": "Beach/river cleanup",
      "meHkyRp": "Storm drain activity",
      "ZzPq3d2": "Tree planting",
      "Zc19r9q": "Habitat restoration",
      "ASn7gND": "Education",
      "ta3XKZX": "Flushing Challenge",
      "W95d24G": "Other (please specify)"
    }
  },
  "7ab674089d6a4f9daa0d061dc37d5444": {
    "label": "Recent precipitation at water testing site",
    "type": "DropdownQuestion",
    "choices": {
      "A9YZFT4": "Clear skies",
      "xSvbBxX": "Cloudy",
      "KvTnfHj": "Hail",
      "1CyZuz6": "Rain (measurable)",
      "4raU3sZ": "Sleet",
      "ZqhqzXV": "Snow"
    }
  },
  "352288dbb92b43bfb5f1bbc67bea2ebc": {
    "label": "Air temperature at water testing site",
    "type": "UnitsQuestion",
    "units": {
      "bn1vwh6": "°C",
      "UzBJPWv": "°F"
    }
  },
  "506a81bfa5f34f3e84f3c5a87598cb43": {
    "label": "Land surrounding water testing site",
    "type": "DropdownQuestion",
    "choices": {
      "6SD77tb": "Agricultural ",
      "9Kbj7qJ": "Commercial",
      "wFCE6qR": "Industrial",
      "v7SUKXa": "Park",
      "wxpvnXN": "Residential ",
      "r2FUrFz": "Wilderness",
      "sD57aj4": "Other (please specify)"
    }
  },
  "7fcb7e6740c14f4baadbdd90190eaee9": {
    "label": "Photo(s):",
    "type": "ImagesQuestion"
  },
  "d60083b1f9a8440c94a8d78428a90b65": {
    "label": "Other observations:",
    "type": "TextQuestion"
  },
  "b53363dc9c484045b6014af6dcad7838": {
    "label": "Type of kit used",
    "type": "MulticheckQuestion",
    "choices": {
      "yrgz1UH": "EarthEcho Water Challenge Kit",
      "Sf1d5aS": "Other (please specify)",
      "74jT3Uz": "Did not use a kit"
    }
  },
  "00343d56f85e4a49ab8e67b4edf316cd": {
    "label": "Turbidity",
    "type": "UnitsQuestion",
    "units": {
      "3amySl1": "JTU",
      "A3jW4Jk": "NTU",
      "xw1fhwk": "cm"
    }
  },
  "acf0fb6f0c4945bf900e7f7f4c71044a": {
    "label": "Water Temperature",
    "type": "UnitsQuestion",
    "units": {
      "W1N6Yjv": "°C",
      "ekhByAz": "°F"
    }
  },
  "c12d9aa9037d412083130df5dc8a4851": {
    "label": "Dissolved Oxygen",
    "type": "UnitsQuestion",
    "units": {
      "1TY381j": "ppm",
      "FFDhHLn": "mg/L"
    }
  },
  "65995522097542f3bf2e2c133c6dc42e": {
    "label": "Dissolved Oxygen Saturation",
    "type": "UnitsQuestion",
    "units": {
      "tZ7mVsm": "%"
    }
  },
  "50ae8dd5aa374c1d97c5fdf21c6767f1": {
    "label": "pH",
    "type": "NumberQuestion"
  },
  "806c4666fb2d49cab1a59f7ffb277a24": {
    "label": "Did you test for any other parameters not included in the EEWC kit? If so, please select all that apply:",
    "type": "MulticheckQuestion",
    "choices": {
      "VdLDjpH": "Salinity",
      "8yk35UF": "Nitrate",
      "dHXC7pw": "Nitrite",
      "GAUnwaT": "Phosphate",
      "AbNnkYr": "Total Dissolved Solids",
      "M1C1SdL": "Biological Oxygen Demand",
      "hTSMYay": "Change in Temperature",
      "6CDBPzL": "Fecal Coliform"
    }
  },
  "1568624090cf4a4da5c136b35b79fe7f": {
    "label": "Salinity",
    "type": "UnitsQuestion",
    "units": {
      "3UufxvL": "PSU",
      "FZyX2cq": "ppt",
      "j9PDQ7x": "g/kg",
      "JpmqMPf": "mg/L",
      "PHrp79H": "uS/cm"
    }
  },
  "7d1b9c62db4042cea225648b853f5607": {
    "label": "Nitrate",
    "type": "UnitsQuestion",
    "units": {
      "p8sRnas": "mg/L-N",
      "W9xARrh": "mg/L-NO3"
    }
  },
  "9a4b649b3161466eacd97b97fbdec637": {
    "label": "Nitrite",
    "type": "UnitsQuestion",
    "units": {
      "W7qjFYU": "mg/L-N",
      "XTAwsRt": "mg/L-NO2"
    }
  },
  "242432d697a54665ac00edf8e5f1d9b5": {
    "label": "Phosphate",
    "type": "UnitsQuestion",
    "units": {
      "9DGWcBq": "mg/L-P",
      "Z55tTwm": "mg/L-PO3"
    }
  },
  "59b9d7efa0584f008dd3a7012a6c2280": {
    "label": "Total Dissolved Solids",
    "type": "UnitsQuestion",
    "units": {
      "RUQmhZR": "mg/L",
      "1AF8htq": "ppm"
    }
  },
  "856095a0542d422881bd3456956d8265": {
    "label": "Biological Oxygen Demand",
    "type": "UnitsQuestion",
    "units": {
      "NHU18Zf": "mg/L",
      "1JyrnDq": "ppm"
    }
  },
  "faf374e7d8ae49bf973ab89e38bfaf2c": {
    "label": "Change in Temperature",
    "type": "UnitsQuestion",
    "units": {
      "rMaTByw": "°C",
      "ztzhraS": "°F"
    }
  },
  "7725a734164f491484dc1e318ca4b0d0": {
    "label": "Fecal Coliform",
    "type": "RadioQuestion",
    "choices": {
      "ykcEqpq": "Present",
      "T9qKXXc": "Absent"
    }
  },
  "0f79829cf955421b8fe6ad70ac5d031d": {
    "label": "If bacteria were present, what was the count?",
    "type": "UnitsQuestion",
    "units": {
      "Wwye8KH": "CFU/mL",
      "8gbMscm": "CFU/100mL"
    }
  },
  "21e1fd35bc284c698778ed8fc79770a8": {
    "label": "Do you have any macroinvertebrate (insect/worm/snail) data to enter from your water quality testing activity?",
    "type": "RadioQuestion",
    "choices": {
      "U91h9MZ": "Yes",
      "wvpvXhz": "No"
    }
  },
  "c4145933594840f7ba264539a5bacd6a": {
    "label": "Group 1 Taxa (pollution sensitive)",
    "type": "MulticheckQuestion",
    "choices": {
      "ZsU63Ay": "Caddisflies",
      "QL3REFX": "Dobsonflies",
      "6Llg1Gh": "Mayflies",
      "HkS17rS": "Stoneflies"
    }
  },
  "dfb89ef0fddf435db80dbb2e100ab96f": {
    "label": "Group 2 Taxa (somewhat pollution tolerant)",
    "type": "MulticheckQuestion",
    "choices": {
      "DdjbKDk": "Craneflies",
      "H8KT8BS": "Dragonflies",
      "8C9yUHu": "Scuds",
      "WwSBD7Y": "Crayfish"
    }
  },
  "6439b1b3373b4c56804e0871bb295261": {
    "label": "Group 3 Taxa (pollution tolerant)",
    "type": "MulticheckQuestion",
    "choices": {
      "1LftkTS": "Leeches",
      "9nnf9LR": "Midges",
      "dncXBUG": "Pouch snails",
      "51cnCnP": "Tubiflex worms",
      "UTPlAd6": "Snails"
    }
  },
  "7bcbdee6f4b14ed288b46bb8209e0be8": {
    "label": "How long was your cleanup event?",
    "type": "RadioQuestion",
    "choices": {
      "kh68zBk": "5 minutes",
      "bKRSKh9": "15 minutes",
      "GembwGE": "30 minutes",
      "wTNRarL": "1 hour+"
    }
  },
  "8ba01a3ddb0d4139a489435e71edae36": {
    "label": "Distance of cleanup event",
    "type": "UnitsQuestion",
    "units": {
      "cNHnrJ6": "Miles",
      "Kzad4Cp": "Kilometers"
    }
  },
  "7549015f12f04060b2dd0502de0353da": {
    "label": "Estimated weight of waste collected",
    "type": "MatrixQuestion",
    "items": {
      "8THC7la": ""
    },
    "columns": {
      "aa46b6181d714840ac6e7cc22bfab317": {
        "label": "Total pieces of waste collected",
        "type": "NumberColumnQuestion",
        "units": {}
      },
      "2e063689e27a4ce69035462d1c32f35c": {
        "label": "Total bags used to collect waste",
        "type": "NumberColumnQuestion",
        "units": {}
      },
      "25f3e7091ab14176952b58435373c210": {
        "label": "Total estimated weight of waste collected",
        "type": "UnitsColumnQuestion",
        "units": {
          "YqKddL3": "pounds",
          "nY9GVPr": "kilograms"
        }
      }
    }
  },
  "d343ec3c79e342f0926323219ba4eac9": {
    "label": "Type of waste collected (select all that apply):",
    "type": "MulticheckQuestion",
    "choices": {
      "ucZ3FDN": "Cigarettes ",
      "48b6mvQ": "Face masks",
      "y4aLNRZ": "Food wrappers",
      "6rGlkVw": "Glass",
      "1U5Yar6": "Paper",
      "7SgraLE": "Plastic bags",
      "S515WHM": "Plastic bottles",
      "CQ3N2mQ": "Other (please specify)"
    }
  },
  "8deeb96181a948bdbe6c22d0d7d91570": {
    "label": "Did you mark any storm drains?",
    "type": "RadioQuestion",
    "choices": {
      "PFwdS4s": "Yes",
      "JyrE8em": "No"
    }
  },
  "226cf31be16e4e13bc2980b893cb6c7e": {
    "label": "How many storm drains did you mark?",
    "type": "NumberQuestion"
  },
  "f4425584b717409080980fc46e1bb30d": {
    "label": "Did you clean any debris from storm drains?",
    "type": "RadioQuestion",
    "choices": {
      "2fmH5jY": "Yes",
      "NYTz3Lw": "No"
    }
  },
  "fa60695cac3044edacad5a147ca7263c": {
    "label": "Total estimated weight of debris removed from storm drains",
    "type": "UnitsQuestion",
    "units": {
      "fpvJv1g": "pounds",
      "fHqLsfx": "kilograms"
    }
  },
  "c678c29a652245cea152fe18dac41270": {
    "label": "Type of debris removed (select all that apply):",
    "type": "MulticheckQuestion",
    "choices": {
      "xdET8HV": "Cigarettes",
      "r8ZKx1z": "Face masks",
      "xgJ4Tps": "Food wrappers",
      "tWwWBWV": "Glass",
      "nCMb44z": "Paper",
      "MXZcp7K": "Plastic bags",
      "7LNDFRQ": "Plastic bottles",
      "Evyp3mu": "Other (please specify)"
    }
  },
  "2467157e1bf94d279b4f2383981e85a4": {
    "label": "What types of trees did you plant?",
    "type": "TextQuestion"
  },
  "1defbced700e41ae8f6eb7ae6770b15c": {
    "label": "How many trees did you plant?",
    "type": "NumberQuestion"
  },
  "e330d937d50848deb5999234e512b6f9": {
    "label": "Did you plant native species?",
    "type": "RadioQuestion",
    "choices": {
      "nxvNQ19": "Yes",
      "MYu6prv": "No"
    }
  },
  "667c4353b3424adb9de268f06b3fa152": {
    "label": "What species did you plant?",
    "type": "TextQuestion"
  },
  "b0151860e58e4f10843a76f531b31268": {
    "label": "Did you remove any invasive species?",
    "type": "RadioQuestion",
    "choices": {
      "vgkxaDr": "Yes",
      "vep5h6y": "No"
    }
  },
  "3a6321270f70494cbde98eef2edacd43": {
    "label": "What invasive species did you remove?",
    "type": "TextListQuestion"
  },
  "d3f59379056440faa18c9f466cfc4583": {
    "label": "Approximately how many square meters of habitat were restored?",
    "type": "UnitsQuestion",
    "units": {
      "dUBT3py": "square meters"
    }
  },
  "a0e778afe23d41ce88548391ba86ff00": {
    "label": "What type of educational activity did you do?",
    "type": "TextQuestion"
  },
  "13e806a68f86463b8d925c29530c8c26": {
    "label": "Did you/your group successfully complete the Flushing Challenge?",
    "type": "RadioQuestion",
    "choices": {
      "ZWUsEjR": "Yes",
      "GKb1cUF": "No"
    }
  },
  "0f891c09669e498196119aff635ac747": {
    "label": "Did you/your group create any posters to educate your community?",
    "type": "RadioQuestion",
    "choices": {
      "ThQ7SqP": "Yes",
      "f6xRXPx": "No"
    }
  },
  "e6eaafc0408d49d4920a325351626952": {
    "label": "If you have photos of your poster(s) you can share them here!",
    "type": "ImagesQuestion"
  },
  "c86d635645554ee7b73d06606d34b906": {
    "label": "If you did a different water challenge activity than any of the ones listed in this survey, please tell us more about any action(s) taken",
    "type": "TextQuestion"
  },
  "c0fe66aead114674beeda08dc27e7141": {
    "label": "If there is anything else you would like to add about any Water Challenge activities taken you can do so here:",
    "type": "TextListQuestion"
  },
  "2581f776b19f4dabaf0ec673ccd3f023": {
    "label": "If there are photos you would like to share about any Water Challenge activities you completed you can do so here:",
    "type": "ImagesQuestion"
  },
  "6147e2579a5d5f1183929a7d34ad07df": {
    "label": "Most unique item found",
    "type": "TextListQuestion"
  }
};
