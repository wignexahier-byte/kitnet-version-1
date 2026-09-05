import {
  Moto,
  MotoTenant,
  MotoContract,
  Kitnet,
  KitnetTenant,
  KitnetContract,
  Expense,
  TimelineEvent,
  DocumentItem,
  SystemSettings,
} from '../types';

export const initialSettings: SystemSettings = {
  adminName: 'Wigne Leal Xavier Macedo',
  adminCpf: '155.521.029-59',
  adminPixKey: 'wleal0131@gmail.com',
  adminPhone: '(47) 99123-4567',
  adminEmail: 'wleal0131@gmail.com',
  adminCity: 'Barra Velha',
  adminState: 'Santa Catarina',
  adminCep: '88390-000',
  adminAddress: 'Rua André Avelino Schmitt, 647, Itajubá, Barra Velha, Santa Catarina - CEP 88390-000',
  representativeName: 'Wigne Leal Xavier Macedo',
  representativeCpf: '155.521.029-59',
  representativeEmail: 'wleal0131@gmail.com',
  cityState: 'Barra Velha, Santa Catarina',
  cleaningFee: 400,
  pinCode: '1234',
  biometricsEnabled: true,
  autoBackupDays: 3,
};

export const initialMotos: Moto[] = [
  {
    id: 'moto-1',
    brand: 'Honda',
    model: 'CG 160 Fan ESDI',
    year: 2024,
    color: 'Cinza Metálico',
    plate: 'BRA-2E19',
    renavam: '01294857631',
    chassi: '9C2JC4110PR123891',
    purchaseDate: '2024-01-15',
    purchasePrice: 15800,
    currentKm: 14280,
    status: 'alugada',
    documents: {
      crlv: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      notaFiscal: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      seguro: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    },
    photos: {
      front: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
      rear: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
      right: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
      left: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&auto=format&fit=crop&q=80',
      dashboard: 'https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=600&auto=format&fit=crop&q=80',
      damages: [
        {
          id: 'dmg-1',
          description: 'Pequeno risco no escapamento lado direito',
          date: '2024-02-10',
          photoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
        },
      ],
    },
    delivery: {
      date: '2024-02-01',
      initialKm: 12450,
      photos: [
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
      ],
      stateNotes: 'Moto entregue revisada com óleo novo Motul, 2 chaves e documento digital.',
      clientConfirmed: true,
    },
    kmLogs: [
      {
        id: 'km-1',
        date: '2024-02-01',
        km: 12450,
        notes: 'KM Inicial de Entrega',
      },
      {
        id: 'km-2',
        date: '2024-05-15',
        km: 13350,
        notes: 'Troca de óleo preventiva realizada aos 13.300 km',
      },
      {
        id: 'km-3',
        date: '2024-08-10',
        km: 14280,
        notes: 'Verificação periódica mensal',
      },
    ],
  },
  {
    id: 'moto-2',
    brand: 'Yamaha',
    model: 'Fazer FZ25 ABS',
    year: 2023,
    color: 'Azul Racing',
    plate: 'FXZ-4G88',
    renavam: '03847291048',
    chassi: '9C6KG0410N0087421',
    purchaseDate: '2023-11-20',
    purchasePrice: 21900,
    currentKm: 19400,
    status: 'alugada',
    documents: {
      crlv: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      seguro: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    },
    photos: {
      front: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
      dashboard: 'https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=600&auto=format&fit=crop&q=80',
    },
    delivery: {
      date: '2024-01-10',
      initialKm: 16200,
      photos: [],
      stateNotes: 'Entregue com manual, chave reserva e kit de ferramentas original.',
      clientConfirmed: true,
    },
    kmLogs: [
      {
        id: 'km-4',
        date: '2024-01-10',
        km: 16200,
        notes: 'Entrega inicial do contrato 24 meses',
      },
      {
        id: 'km-5',
        date: '2024-07-20',
        km: 19400,
        notes: 'Pneu traseiro substituído pelo locatário',
      },
    ],
  },
  {
    id: 'moto-3',
    brand: 'Honda',
    model: 'Biz 125 Flex',
    year: 2023,
    color: 'Vermelha Perolizada',
    plate: 'RTM-9A32',
    renavam: '04918273645',
    chassi: '9C2JC4810NR009182',
    purchaseDate: '2023-08-10',
    purchasePrice: 14500,
    currentKm: 8900,
    status: 'disponivel',
    documents: {
      crlv: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    },
    photos: {
      front: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
      dashboard: 'https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=600&auto=format&fit=crop&q=80',
    },
    kmLogs: [
      {
        id: 'km-6',
        date: '2024-08-01',
        km: 8900,
        notes: 'Revisão completa de 9.000km realizada. Pronta para locação.',
      },
    ],
  },
  {
    id: 'moto-4',
    brand: 'Yamaha',
    model: 'Factor 150 UBS',
    year: 2022,
    color: 'Preto Eclipse',
    plate: 'QPL-8H14',
    renavam: '02837491028',
    chassi: '9C6KE1910N0014728',
    purchaseDate: '2022-09-05',
    purchasePrice: 13200,
    currentKm: 28400,
    status: 'manutencao',
    documents: {},
    photos: {
      front: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=600&auto=format&fit=crop&q=80',
    },
    kmLogs: [
      {
        id: 'km-7',
        date: '2024-08-14',
        km: 28400,
        notes: 'Entrou na oficina para troca da caixa de direção e kit transmissão.',
      },
    ],
  },
];

export const initialMotoTenants: MotoTenant[] = [
  {
    id: 'tenant-moto-1',
    fullName: 'Gabriel Rodrigues Albuquerque',
    cpf: '52948193041',
    rg: '54.892.103-7',
    birthDate: '1996-07-25',
    phone: '47992458190',
    whatsapp: '47992458190',
    email: 'gabriel.albuquerque.moto@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    address: 'Rua José Alberto dos Santos, 312, Centro — Barra Velha/SC',
    profession: 'Entregador Autônomo / Parceiro Logístico',
    company: 'iFood / Mercado Livre Express',
    income: 4850,
    cnh: {
      number: '06492817290',
      category: 'A/B',
      expirationDate: '2028-11-15',
    },
    documents: {
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      cnhFront: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      cnhBack: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      proofOfAddress: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      proofOfIncome: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    },
    approvalChecklist: {
      cnhValid: true,
      docsChecked: true,
      addressValidated: true,
      incomeAnalyzed: true,
      depositReceived: true,
      contractSigned: true,
      result: 'aprovado',
      cpfValidationLog: 'CPF Regular na Receita Federal. Score 780. Sem restrições veiculares.',
      notes: 'Locatário com excelente histórico e referências verificadas.',
    },
  },
  {
    id: 'tenant-moto-2',
    fullName: 'Matheus Henrique Silveira',
    cpf: '41892037488',
    rg: '48.371.902-1',
    birthDate: '1993-03-14',
    phone: '47988341290',
    whatsapp: '47988341290',
    email: 'matheus.silveira.express@outlook.com',
    photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    address: 'Av. Paraná, 1420 — Itajubá, Barra Velha/SC',
    profession: 'Supervisor de Rota & Logística',
    company: 'Transportes & Logística Catarinense Ltda',
    income: 5400,
    cnh: {
      number: '07829148301',
      category: 'A',
      expirationDate: '2027-08-20',
    },
    documents: {
      photo: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
      cnhFront: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      cnhBack: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      proofOfAddress: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      proofOfIncome: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    },
    approvalChecklist: {
      cnhValid: true,
      docsChecked: true,
      addressValidated: true,
      incomeAnalyzed: true,
      depositReceived: true,
      contractSigned: true,
      result: 'aprovado',
      cpfValidationLog: 'CPF Regular. Renda comprovada via holerite CLT.',
      notes: 'Supervisor CLT na empresa há mais de 3 anos.',
    },
  },
  {
    id: 'tenant-moto-3',
    fullName: 'Rodrigo Antunes Fagundes',
    cpf: '68239104812',
    rg: '39.481.029-4',
    birthDate: '1999-10-08',
    phone: '47997124455',
    whatsapp: '47997124455',
    email: 'rodrigo.fagundes.sc@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    address: 'Rua Nereu Ramos, 560 — São Cristóvão, Barra Velha/SC',
    profession: 'Prestador de Serviços Elétricos / Instalador',
    company: 'EletroFagundes Instalações',
    income: 4200,
    cnh: {
      number: '08192837410',
      category: 'A/B',
      expirationDate: '2028-04-12',
    },
    documents: {
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      cnhFront: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      cnhBack: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      proofOfAddress: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    },
    approvalChecklist: {
      cnhValid: true,
      docsChecked: true,
      addressValidated: true,
      incomeAnalyzed: true,
      depositReceived: false,
      contractSigned: false,
      result: 'aprovado',
      cpfValidationLog: 'CPF Regular. Cadastro e documentação pré-aprovados.',
      notes: 'Cliente qualificado interessado na locação da Honda Biz 125.',
    },
  },
];

// Helper to build installments relative to dynamic year and month
function generateSampleInstallments(
  prefix: string,
  count: number,
  monthlyAmount: number,
  paidCount: number,
  startYear: number,
  startMonth: number,
  dueDay: number
): { installments: MotoContract['installments']; totalPaid: number } {
  const installments: MotoContract['installments'] = [];
  let totalPaid = 0;

  for (let i = 1; i <= count; i++) {
    const monthIndex = startMonth + i - 1;
    const year = startYear + Math.floor(monthIndex / 12);
    const month = ((monthIndex % 12) + 12) % 12 + 1;
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(dueDay).padStart(2, '0');
    const dueDate = `${year}-${monthStr}-${dayStr}`;

    let status: 'pago' | 'pendente' | 'atrasado' = 'pendente';
    let paidDate: string | undefined = undefined;

    if (i <= paidCount) {
      status = 'pago';
      paidDate = `${year}-${monthStr}-${String(Math.min(dueDay, 28)).padStart(2, '0')}`;
      totalPaid += monthlyAmount;
    }

    installments.push({
      id: `${prefix}-inst-${i}`,
      number: i,
      totalInstallments: count,
      dueDate,
      paidDate,
      amount: monthlyAmount,
      status,
      paymentMethod: status === 'pago' ? 'PIX' : undefined,
    });
  }

  return { installments, totalPaid };
}

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth(); // 0-indexed

// Moto 1 (Lucas): Início há 10 meses atrás. 10 parcelas pagas, parcela 11 vence neste mês
const moto1StartMonth = currentMonth - 10;
const moto1StartYear = currentYear;
const sample1 = generateSampleInstallments('c1', 36, 1250, 10, moto1StartYear, moto1StartMonth, 10);

// Moto 2 (Matheus): Início há 8 meses atrás. 7 parcelas pagas, 8ª parcela venceu no mês anterior (atraso recente realista)
const moto2StartMonth = currentMonth - 7;
const moto2StartYear = currentYear;
const sample2 = generateSampleInstallments('c2', 24, 1450, 7, moto2StartYear, moto2StartMonth, 15);

const moto1StartMonthStr = String(((moto1StartMonth % 12) + 12) % 12 + 1).padStart(2, '0');
const moto1CalculatedStartYear = moto1StartYear + Math.floor(moto1StartMonth / 12);
const moto2StartMonthStr = String(((moto2StartMonth % 12) + 12) % 12 + 1).padStart(2, '0');
const moto2CalculatedStartYear = moto2StartYear + Math.floor(moto2StartMonth / 12);

export const initialMotoContracts: MotoContract[] = [
  {
    id: 'contract-moto-1',
    motoId: 'moto-1',
    tenantId: 'tenant-moto-1',
    startDate: `${moto1CalculatedStartYear}-${moto1StartMonthStr}-01`,
    durationMonths: 36,
    monthlyValue: 1250,
    dueDay: 10,
    deposit: 1500,
    insuranceDeductible: '1.500,00',
    depositStatus: 'retida',
    status: 'ativo',
    installments: sample1.installments,
    totalAgreedValue: 36 * 1250,
    notes: 'Plano com intenção de compra em 36 parcelas. Ao quitar a 36ª parcela a moto será transferida no DETRAN.',
  },
  {
    id: 'contract-moto-2',
    motoId: 'moto-2',
    tenantId: 'tenant-moto-2',
    startDate: `${moto2CalculatedStartYear}-${moto2StartMonthStr}-10`,
    durationMonths: 24,
    monthlyValue: 1450,
    dueDay: 15,
    deposit: 1800,
    insuranceDeductible: '1.800,00',
    depositStatus: 'retida',
    status: 'ativo',
    installments: sample2.installments,
    totalAgreedValue: 24 * 1450,
    notes: 'Locação com opção de compra em 24 meses.',
  },
];

export const initialKitnets: Kitnet[] = [
  {
    id: 'kitnet-1',
    name: 'Kitnet 01 — Jardim Primavera',
    number: '101',
    address: 'Rua André Avelino Schmitt, 647, Bloco A — Itajubá, Barra Velha/SC',
    notes: 'Kitnet térrea com quintal privativo e lavanderia individual. Totalmente reformada e mobiliada.',
    status: 'alugada',
    monthlyRentBase: 1500,
    monthlyWaterBase: 60,
    photos: {
      livingRoom: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
      bedroom: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
      bathroom: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
      kitchen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      outdoor: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    },
    entryInspection: {
      date: '2024-03-01',
      photos: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
      ],
      stateNotes: 'Pintura nova Suvinil Branco Neve, piso porcelanato sem avarias, elétrica 100%.',
      itemsState: {
        pintura: 'otimo',
        eletrica: 'otimo',
        hidraulica: 'otimo',
        portasJanelas: 'bom',
        banheiro: 'otimo',
        cozinha: 'bom',
      },
    },
  },
  {
    id: 'kitnet-2',
    name: 'Kitnet 02 — Studio Centro',
    number: '202',
    address: 'Rua André Avelino Schmitt, 647, Bloco B — Itajubá, Barra Velha/SC',
    notes: 'Studio superior ensolarado com sacada e ar condicionado inverter instalado.',
    status: 'alugada',
    monthlyRentBase: 1650,
    monthlyWaterBase: 50,
    photos: {
      livingRoom: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
      kitchen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    },
    entryInspection: {
      date: '2024-01-15',
      photos: [],
      stateNotes: 'Imóvel em excelente estado com luminárias LED e chuveiro Lorenzetti Turbo.',
      itemsState: {
        pintura: 'otimo',
        eletrica: 'otimo',
        hidraulica: 'otimo',
        portasJanelas: 'otimo',
        banheiro: 'otimo',
        cozinha: 'otimo',
      },
    },
  },
  {
    id: 'kitnet-3',
    name: 'Kitnet 03 — Conforto Norte',
    number: '103',
    address: 'Rua André Avelino Schmitt, 647, Bloco C — Itajubá, Barra Velha/SC',
    notes: 'Em fase final de pintura e troca de bancada da pia. Pronta para próxima locação.',
    status: 'reforma',
    monthlyRentBase: 1550,
    monthlyWaterBase: 50,
    photos: {
      livingRoom: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
    },
  },
];

export const initialKitnetTenants: KitnetTenant[] = [
  {
    id: 'tenant-kitnet-1',
    fullName: 'Camila Fernanda Nogueira',
    cpf: '39182740592',
    rg: '51.928.304-2',
    birthDate: '1995-12-04',
    phone: '47991887733',
    whatsapp: '47991887733',
    email: 'camila.nogueira.arq@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    address: 'Rua André Avelino Schmitt, 647, Kit 101 — Itajubá, Barra Velha/SC',
    maritalStatus: 'solteiro',
    incomeType: 'CLT',
    cltDetails: {
      company: 'Studio Nogueira Arquitetura & Interiores',
      role: 'Arquiteta Coordenadora de Projetos',
      salary: 6300,
      tenureMonths: 32,
    },
    documents: {
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      paystub: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      proofOfAddress: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      proofOfIncome: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'tenant-kitnet-2',
    fullName: 'Diego Ramos de Oliveira',
    cpf: '28491837201',
    rg: '44.829.103-8',
    birthDate: '1989-08-19',
    phone: '47996552244',
    whatsapp: '47996552244',
    email: 'diego.ramos.dev@outlook.com',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    address: 'Rua André Avelino Schmitt, 647, Kit 202 — Itajubá, Barra Velha/SC',
    maritalStatus: 'uniao_estavel',
    incomeType: 'empresario',
    empresarioDetails: {
      company: 'DRO Tech Soluções em TI Ltda',
      cnpj: '42.819.304/0001-95',
      activityYears: 6,
    },
    documents: {
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      proofOfIncome: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      socialContract: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'tenant-kitnet-3',
    fullName: 'Juliana Paes Vasconcelos',
    cpf: '45019283755',
    rg: '37.291.840-5',
    birthDate: '1997-05-30',
    phone: '47984119988',
    whatsapp: '47984119988',
    email: 'juliana.vasconcelos.enf@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    address: 'Rua Manoel Teodoro, 180 — Centro, Barra Velha/SC',
    maritalStatus: 'solteiro',
    incomeType: 'CLT',
    cltDetails: {
      company: 'Hospital & Maternidade Regional',
      role: 'Enfermeira Coordenadora Hospitalar',
      salary: 5900,
      tenureMonths: 24,
    },
    documents: {
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      paystub: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      proofOfAddress: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      proofOfIncome: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    },
  },
];

// Helper to build Kitnet installments relative to dynamic year/month
function generateKitnetSampleInstallments(
  prefix: string,
  count: number,
  monthlyAmount: number,
  paidCount: number,
  startYear: number,
  startMonth: number,
  dueDay: number
): KitnetContract['installments'] {
  const installments: KitnetContract['installments'] = [];

  for (let i = 1; i <= count; i++) {
    const monthIndex = startMonth + i - 1;
    const year = startYear + Math.floor(monthIndex / 12);
    const month = ((monthIndex % 12) + 12) % 12 + 1;
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(dueDay).padStart(2, '0');
    const dueDate = `${year}-${monthStr}-${dayStr}`;

    let status: 'pago' | 'pendente' | 'atrasado' = 'pendente';
    let paidDate: string | undefined = undefined;

    if (i <= paidCount) {
      status = 'pago';
      paidDate = `${year}-${monthStr}-${String(Math.min(dueDay, 28)).padStart(2, '0')}`;
    }

    installments.push({
      id: `${prefix}-inst-${i}`,
      number: i,
      totalInstallments: count,
      dueDate,
      paidDate,
      amount: monthlyAmount,
      status,
      paymentMethod: status === 'pago' ? 'PIX' : undefined,
    });
  }

  return installments;
}

// Kitnet 1 (Camila): Início há 5 meses. 5 parcelas pagas, parcela 6 vence neste mês no dia 5
const kitnet1StartMonth = currentMonth - 5;
const kitnet1StartYear = currentYear;
const kitnetSample1 = generateKitnetSampleInstallments('k1', 12, 1560, 5, kitnet1StartYear, kitnet1StartMonth, 5);

// Kitnet 2 (Diego): Início há 4 meses. 3 parcelas pagas, parcela 4 venceu no mês passado (atraso recente de ~15 dias)
const kitnet2StartMonth = currentMonth - 4;
const kitnet2StartYear = currentYear;
const kitnetSample2 = generateKitnetSampleInstallments('k2', 12, 1700, 3, kitnet2StartYear, kitnet2StartMonth, 10);

const kitnet1StartMonthStr = String(((kitnet1StartMonth % 12) + 12) % 12 + 1).padStart(2, '0');
const kitnet1CalculatedStartYear = kitnet1StartYear + Math.floor(kitnet1StartMonth / 12);
const kitnet2StartMonthStr = String(((kitnet2StartMonth % 12) + 12) % 12 + 1).padStart(2, '0');
const kitnet2CalculatedStartYear = kitnet2StartYear + Math.floor(kitnet2StartMonth / 12);

export const initialKitnetContracts: KitnetContract[] = [
  {
    id: 'contract-kitnet-1',
    kitnetId: 'kitnet-1',
    tenantId: 'tenant-kitnet-1',
    startDate: `${kitnet1CalculatedStartYear}-${kitnet1StartMonthStr}-01`,
    endDate: `${kitnet1CalculatedStartYear + 1}-${kitnet1StartMonthStr}-01`,
    durationMonths: 12,
    rentValue: 1500,
    waterValue: 60,
    deposit: 1500,
    depositStatus: 'retida',
    dueDay: 5,
    status: 'ativo',
    installments: kitnetSample1,
    notes: 'Aluguel R$ 1.500 + Água fixa R$ 60 = R$ 1.560 mensais.',
  },
  {
    id: 'contract-kitnet-2',
    kitnetId: 'kitnet-2',
    tenantId: 'tenant-kitnet-2',
    startDate: `${kitnet2CalculatedStartYear}-${kitnet2StartMonthStr}-15`,
    endDate: `${kitnet2CalculatedStartYear + 1}-${kitnet2StartMonthStr}-15`,
    durationMonths: 12,
    rentValue: 1650,
    waterValue: 50,
    deposit: 1650,
    depositStatus: 'retida',
    dueDay: 10,
    status: 'ativo',
    installments: kitnetSample2,
    notes: 'Aluguel R$ 1.650 + Taxa de água R$ 50 = R$ 1.700.',
  },
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    title: 'Internet Fibra 600MB — Bloco Kitnets',
    category: 'internet',
    targetType: 'kitnet',
    amount: 129.9,
    dueDate: '2026-08-20',
    status: 'pendente',
    recurrence: 'mensal',
    notes: 'Vivo Fibra Dedicada para os inquilinos',
  },
  {
    id: 'exp-2',
    title: 'Conta de Água Casan — Geral Kitnets',
    category: 'agua',
    targetType: 'kitnet',
    amount: 184.5,
    dueDate: '2026-08-22',
    status: 'pendente',
    recurrence: 'mensal',
    notes: 'Medição coletiva rateada na taxa fixa',
  },
  {
    id: 'exp-3',
    title: 'Energia Elétrica Celesc — Iluminação Externa',
    category: 'energia',
    targetType: 'kitnet',
    amount: 78.4,
    dueDate: '2026-08-10',
    paidDate: '2026-08-09',
    status: 'pago',
    recurrence: 'mensal',
  },
  {
    id: 'exp-4',
    title: 'Seguro Frota Motos — Suhai Proteção',
    category: 'seguro',
    targetType: 'moto',
    amount: 340.0,
    dueDate: '2026-08-12',
    paidDate: '2026-08-11',
    status: 'pago',
    recurrence: 'mensal',
  },
  {
    id: 'exp-5',
    title: 'Manutenção Factor 150 (Relação e Pastilhas)',
    category: 'manutencao_moto',
    targetType: 'moto',
    targetId: 'moto-4',
    amount: 320.0,
    dueDate: '2026-08-14',
    paidDate: '2026-08-14',
    status: 'pago',
    recurrence: 'nenhuma',
    notes: 'Peças originais Yamaha compradas na concessionária',
  },
  {
    id: 'exp-6',
    title: 'IPTU Mensal Kitnets (Parcela 08/10)',
    category: 'iptu',
    targetType: 'kitnet',
    amount: 215.0,
    dueDate: '2026-08-25',
    status: 'pendente',
    recurrence: 'mensal',
  },
];

export const initialTimeline: TimelineEvent[] = [
  {
    id: 'time-1',
    timestamp: '2024-02-01T10:00:00.000Z',
    type: 'contrato_criado',
    title: 'Contrato de Moto Criado',
    description: 'Contrato de locação com opção de compra (36 meses) assinado com Gabriel Rodrigues Albuquerque para a Honda CG 160 (BRA-2E19).',
    entityType: 'moto',
    entityId: 'moto-1',
  },
  {
    id: 'time-2',
    timestamp: '2024-02-01T14:30:00.000Z',
    type: 'moto_entregue',
    title: 'Moto Entregue ao Locatário',
    description: 'Entrega realizada com 12.450 km e laudo de vistoria física inicial aprovado.',
    entityType: 'moto',
    entityId: 'moto-1',
  },
  {
    id: 'time-3',
    timestamp: '2024-03-01T09:00:00.000Z',
    type: 'contrato_criado',
    title: 'Contrato de Kitnet Criado',
    description: 'Locação residencial de 12 meses iniciada para Camila Fernanda Nogueira na Kitnet 01 (Unidade 101).',
    entityType: 'kitnet',
    entityId: 'kitnet-1',
  },
  {
    id: 'time-4',
    timestamp: '2024-03-01T11:00:00.000Z',
    type: 'vistoria',
    title: 'Vistoria de Entrada Kitnet 01',
    description: 'Laudo fotográfico e vistoria registrados com aprovação da inquilina Camila Nogueira (Pintura nova e elétrica 100%).',
    entityType: 'kitnet',
    entityId: 'kitnet-1',
  },
  {
    id: 'time-5',
    timestamp: '2024-08-05T15:00:00.000Z',
    type: 'pagamento_recebido',
    title: 'Aluguel Recebido: Camila Fernanda Nogueira',
    description: 'Mensalidade 06/12 da Kitnet 01 (R$ 1.560,00) quitada via PIX sem atraso.',
    entityType: 'financeiro',
    entityId: 'kitnet-1',
  },
  {
    id: 'time-6',
    timestamp: '2025-03-01T08:00:00.000Z',
    type: 'contrato_criado',
    title: 'Renovação Automática de Vigência — Kitnet 01',
    description: 'Término do 1º ano de locação. Contrato prorrogado automaticamente por prazo indeterminado (Art. 46 Lei 8.245/91).',
    entityType: 'kitnet',
    entityId: 'kitnet-1',
  },
  {
    id: 'time-7',
    timestamp: '2025-06-10T14:20:00.000Z',
    type: 'pagamento_recebido',
    title: 'Mensalidade de Moto Recebida: Gabriel Albuquerque',
    description: 'Parcela 16/36 da Honda CG 160 (R$ 1.250,00) liquidada via PIX com comprovante anexado.',
    entityType: 'financeiro',
    entityId: 'moto-1',
  },
  {
    id: 'time-8',
    timestamp: '2026-01-15T09:30:00.000Z',
    type: 'manutencao',
    title: 'Troca de Óleo & Revisão — Honda CG 160',
    description: 'Revisão preventiva periódica aos 22.000 km realizada com peças e fluidos originais.',
    entityType: 'moto',
    entityId: 'moto-1',
  },
  {
    id: 'time-9',
    timestamp: '2026-03-01T08:00:00.000Z',
    type: 'contrato_criado',
    title: 'Início da 3ª Vigência de Locação — Kitnet 01',
    description: 'Camila Fernanda Nogueira completa 24 meses ininterruptos de locação na Unidade 101 mantendo adimplência exemplar.',
    entityType: 'kitnet',
    entityId: 'kitnet-1',
  },
  {
    id: 'time-10',
    timestamp: '2026-08-05T16:20:00.000Z',
    type: 'pagamento_recebido',
    title: 'Pagamento de Aluguel Recebido: Camila Fernanda Nogueira',
    description: 'Aluguel do mês 08/2026 (R$ 1.560,00) recebido via PIX registrado no extrato financeiro.',
    entityType: 'financeiro',
    entityId: 'kitnet-1',
  },
  {
    id: 'time-11',
    timestamp: '2026-08-14T11:15:00.000Z',
    type: 'km_atualizado',
    title: 'KM Atualizado — Yamaha Factor 150',
    description: 'Quilometragem atualizada para 28.400 km na entrada para oficina preventiva.',
    entityType: 'moto',
    entityId: 'moto-4',
  },
  {
    id: 'time-12',
    timestamp: '2026-08-15T10:00:00.000Z',
    type: 'pagamento_recebido',
    title: 'Mensalidade Moto Recebida: Matheus Henrique Silveira',
    description: 'Parcela 08/24 da Yamaha Fazer 250 (R$ 1.450,00) recebida com sucesso via PIX.',
    entityType: 'financeiro',
    entityId: 'moto-2',
  },
];

export const initialDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'CRLV Digital — Honda CG 160 (BRA-2E19)',
    category: 'moto',
    relatedId: 'moto-1',
    relatedName: 'Honda CG 160 Fan',
    date: '2024-01-20',
    fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '1.2 MB',
  },
  {
    id: 'doc-2',
    title: 'Contrato Assinado de Locação com Opção de Compra',
    category: 'contrato',
    relatedId: 'contract-moto-1',
    relatedName: 'Gabriel Rodrigues Albuquerque',
    date: '2024-02-01',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '2.8 MB',
  },
  {
    id: 'doc-3',
    title: 'Termo de Entrega e Vistoria com Fotos de KM',
    category: 'termo',
    relatedId: 'moto-1',
    relatedName: 'Gabriel Rodrigues Albuquerque',
    date: '2024-02-01',
    fileUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '3.4 MB',
  },
  {
    id: 'doc-4',
    title: 'Laudo de Vistoria de Entrada Kitnet 01',
    category: 'vistoria' as any,
    relatedId: 'kitnet-1',
    relatedName: 'Kitnet 01 — Camila Nogueira',
    date: '2024-03-01',
    fileUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
    fileType: 'PDF',
    fileSize: '2.1 MB',
  },
];
