import {
  BrickWall,
  Building2,
  Cctv,
  DoorOpen,
  Fence,
  HardHat,
  Lightbulb,
  Sofa,
  Sprout,
  SunMedium,
  Tractor,
  Droplets,
  Grid2x2,
  Hammer,
  House,
  Mountain,
  Package,
  PaintRoller,
  Rows3,
  Tags,
  Zap,
  type LucideProps,
} from "lucide-react"

const icons = {
  cement: Package,
  "iron-rods": Rows3,
  blocks: BrickWall,
  roofing: House,
  tiles: Grid2x2,
  paint: PaintRoller,
  plumbing: Droplets,
  electrical: Zap,
  tools: Hammer,
  aggregates: Mountain,
  plant: Tractor,
  furniture: Sofa,
  "doors-windows": DoorOpen,
  lighting: Lightbulb,
  solar: SunMedium,
  garden: Sprout,
  fencing: Fence,
  ppe: HardHat,
  security: Cctv,
  deals: Tags,
  "real-estate": Building2,
} as const

export function CategoryIcon({ slug, ...props }: { slug: string } & LucideProps) {
  const Icon = icons[slug as keyof typeof icons] ?? Package
  return <Icon aria-hidden strokeWidth={1.6} {...props} />
}
