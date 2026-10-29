export type UserRole = "brand" | "creator"

export interface MockUser {
  id: string
  email: string
  password: string
  role: UserRole
  name: string
  avatar: string
  photo?: string
  organizationId: string
  organizationName: string
  orgLogo?: string
  orgTagline?: string
  plan?: string
}

export const ORG_LOGOS: Record<string, { logo: string; icon: string; tagline: string; color: string }> = {
  org1: {
    logo: "/logos/natura.svg",
    icon: "/logos/natura-icon.svg",
    tagline: "Bem estar bem",
    color: "#F47920",
  },
  org2: {
    logo: "/logos/magalu.svg",
    icon: "/logos/magalu-icon.svg",
    tagline: "Magazine Luiza",
    color: "#0086FF",
  },
  org3: {
    logo: "/logos/ifood.svg",
    icon: "/logos/ifood-icon.svg",
    tagline: "iFood · Tecnologia para comer",
    color: "#EA1D2C",
  },
}

export const MOCK_USERS: MockUser[] = [
  // Brand side users
  {
    id: "u1",
    email: "ana@natura.com.br",
    password: "123456",
    role: "brand",
    name: "Ana Beatriz Lima",
    avatar: "AB",
    photo: "https://i.pravatar.cc/300?img=47",
    organizationId: "org1",
    organizationName: "Natura",
    orgLogo: ORG_LOGOS.org1.logo,
    plan: "Pro",
  },
  {
    id: "u2",
    email: "carlos@magalu.com.br",
    password: "123456",
    role: "brand",
    name: "Carlos Mendes",
    avatar: "CM",
    photo: "https://i.pravatar.cc/300?img=52",
    organizationId: "org2",
    organizationName: "Magazine Luiza",
    orgLogo: ORG_LOGOS.org2.logo,
    plan: "Enterprise",
  },
  {
    id: "u3",
    email: "juliana@ifood.com.br",
    password: "123456",
    role: "brand",
    name: "Juliana Ferreira",
    avatar: "JF",
    photo: "https://i.pravatar.cc/300?img=44",
    organizationId: "org3",
    organizationName: "iFood",
    orgLogo: ORG_LOGOS.org3.logo,
    plan: "Pro",
  },
  // Creator side users
  {
    id: "u4",
    email: "bianca@gmail.com",
    password: "123456",
    role: "creator",
    name: "Bianca Torres",
    avatar: "BT",
    photo: "https://i.pravatar.cc/300?img=1",
    organizationId: "creator4",
    organizationName: "@biancatorres",
  },
  {
    id: "u5",
    email: "pedro@gmail.com",
    password: "123456",
    role: "creator",
    name: "Pedro Alves",
    avatar: "PA",
    photo: "https://i.pravatar.cc/300?img=3",
    organizationId: "creator5",
    organizationName: "@pedroalves",
  },
  {
    id: "u6",
    email: "carol@gmail.com",
    password: "123456",
    role: "creator",
    name: "Carolina Souza",
    avatar: "CS",
    photo: "https://i.pravatar.cc/300?img=5",
    organizationId: "creator6",
    organizationName: "@carolsouza",
  },
]
