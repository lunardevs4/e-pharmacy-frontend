export interface ProvinceData {
  [province: string]: {
    [district: string]: {
      [sector: string]: {
        [cell: string]: string[] // Villages
      }
    }
  }
}

export const RWANDA_LOCATIONS: ProvinceData = {
  'Kigali City': {
    'Gasabo': {
      'Remera': {
        'Kibagabaga': ['Nyirabwana', 'Karuruma', 'Kibagabaga Cell Village'],
        'Nyarutarama': ['Kamatamu', 'Kangondo', 'Nyarutarama Village'],
      },
      'Kacyiru': {
        'Kamutwa': ['Inyange', 'Amahoro', 'Kamutwa Village'],
        'Kamatamu': ['Umucyo', 'Urugero'],
      },
    },
    'Kicukiro': {
      'Kanombe': {
        'Busanza': ['Gasaraba', 'Karama', 'Busanza Center'],
        'Kabeza': ['Rebero', 'Sangwa', 'Kabeza Center'],
      },
      'Kagarama': {
        'Muyange': ['Muyange I', 'Muyange II'],
        'Kagarama': ['Rugando', 'Ubumwe'],
      },
    },
  },
  'Northern Province': {
    'Musanze': {
      'Muhoza': {
        'Mpenge': ['Mpenge I', 'Mpenge II'],
        'Ruhengeri': ['Kigombe', 'Kabeza Ruhengeri'],
      },
      'Cyuve': {
        'Cyuve Cell': ['Bukane', 'Rwebeya'],
      },
    },
    'Gicumbi': {
      'Byumba': {
        'Kibali': ['Kibali I', 'Kibali II'],
        'Gacurabwenge': ['Gacurabwenge I', 'Gacurabwenge II'],
      },
    },
  },
  'Eastern Province': {
    'Rwamagana': {
      'Kigabiro': {
        'Cyanya': ['Cyanya I', 'Cyanya II'],
        'Sibagire': ['Sibagire I', 'Sibagire II'],
      },
    },
    'Bugesera': {
      'Nyamata': {
        'Nyamata Cell': ['Nyamata I', 'Nyamata II'],
        'Murama': ['Murama I', 'Murama II'],
      },
    },
  },
  'Southern Province': {
    'Huye': {
      'Ngoma': {
        'Butare': ['Butare I', 'Butare II', 'Butare Center'],
        'Ngoma Cell': ['Ngoma I', 'Ngoma II'],
      },
    },
    'Nyanza': {
      'Busasamana': {
        'Kavumu': ['Kavumu I', 'Kavumu II'],
        'Nyanza Cell': ['Nyanza Center', 'Nyanza Village'],
      },
    },
  },
  'Western Province': {
    'Rubavu': {
      'Gisenyi': {
        'Gisenyi Cell': ['Gisenyi I', 'Gisenyi II'],
        'Amahoro': ['Amahoro I', 'Amahoro II'],
      },
    },
    'Karongi': {
      'Rubengera': {
        'Rubengera Cell': ['Rubengera I', 'Rubengera II'],
        'Kibirizi': ['Kibirizi I', 'Kibirizi II'],
      },
    },
  },
}
