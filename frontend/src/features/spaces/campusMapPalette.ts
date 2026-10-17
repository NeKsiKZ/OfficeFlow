import type { ResolvedTheme } from '../../theme/theme'
import { SpaceType } from './types'

export interface CampusMapPalette {
  floor: string
  floorAlt: string
  floorGrid: string
  outdoor: string
  buildingFill: string
  buildingFillBottom: string
  buildingStroke: string
  buildingHighlight: string
  buildingShadow: string
  parkingLotFill: string
  parkingLotStroke: string
  label: string
  mutedLabel: string
  ink: string
  deskFill: string
  deskStroke: string
  deskHover: string
  roomFill: string
  roomStroke: string
  roomHover: string
  parkingFill: string
  parkingStroke: string
  parkingHover: string
  selectedRing: string
  selectedGlow: string
  inactiveAlpha: number
  emptyInk: string
}

export function getCampusMapPalette(theme: ResolvedTheme): CampusMapPalette {
  if (theme === 'dark') {
    return {
      floor: '#141916',
      floorAlt: '#181e1b',
      floorGrid: 'rgba(243, 246, 244, 0.05)',
      outdoor: '#101412',
      buildingFill: 'rgba(42, 52, 48, 0.88)',
      buildingFillBottom: 'rgba(28, 36, 33, 0.94)',
      buildingStroke: 'rgba(209, 213, 210, 0.28)',
      buildingHighlight: 'rgba(255, 255, 255, 0.12)',
      buildingShadow: 'rgba(0, 0, 0, 0.5)',
      parkingLotFill: 'rgba(255, 255, 255, 0.045)',
      parkingLotStroke: 'rgba(180, 188, 184, 0.38)',
      label: 'rgba(220, 226, 222, 0.92)',
      mutedLabel: 'rgba(174, 184, 178, 0.88)',
      ink: '#f3f6f4',
      deskFill: 'rgba(14, 116, 144, 0.5)',
      deskStroke: '#7dd3fc',
      deskHover: 'rgba(125, 211, 252, 0.22)',
      roomFill: 'rgba(180, 83, 9, 0.42)',
      roomStroke: '#fbbf24',
      roomHover: 'rgba(251, 191, 36, 0.22)',
      parkingFill: 'rgba(68, 64, 60, 0.72)',
      parkingStroke: '#d6d3d1',
      parkingHover: 'rgba(214, 211, 209, 0.16)',
      selectedRing: '#4cae8c',
      selectedGlow: 'rgba(76, 174, 140, 0.35)',
      inactiveAlpha: 0.4,
      emptyInk: 'rgba(204, 212, 208, 0.9)',
    }
  }

  return {
    floor: '#ece9e2',
    floorAlt: '#e7e3db',
    floorGrid: 'rgba(60, 60, 67, 0.055)',
    outdoor: '#e2ddd3',
    buildingFill: 'rgba(255, 255, 255, 0.72)',
    buildingFillBottom: 'rgba(248, 248, 250, 0.88)',
    buildingStroke: 'rgba(60, 60, 67, 0.22)',
    buildingHighlight: 'rgba(255, 255, 255, 0.75)',
    buildingShadow: 'rgba(0, 0, 0, 0.1)',
    parkingLotFill: 'rgba(120, 120, 128, 0.07)',
    parkingLotStroke: 'rgba(99, 99, 102, 0.4)',
    label: 'rgba(58, 58, 60, 0.88)',
    mutedLabel: 'rgba(99, 99, 102, 0.9)',
    ink: '#1c1c1e',
    deskFill: 'rgba(224, 242, 254, 0.96)',
    deskStroke: '#0ea5e9',
    deskHover: 'rgba(14, 165, 233, 0.14)',
    roomFill: 'rgba(255, 247, 237, 0.96)',
    roomStroke: '#f59e0b',
    roomHover: 'rgba(245, 158, 11, 0.14)',
    parkingFill: 'rgba(245, 245, 244, 0.96)',
    parkingStroke: '#78716c',
    parkingHover: 'rgba(68, 64, 60, 0.08)',
    selectedRing: '#245a4c',
    selectedGlow: 'rgba(36, 90, 76, 0.22)',
    inactiveAlpha: 0.42,
    emptyInk: 'rgba(72, 72, 74, 0.88)',
  }
}

export function colorsForSpaceType(
  type: SpaceType,
  palette: CampusMapPalette,
): { fill: string; stroke: string; hover: string } {
  switch (type) {
    case SpaceType.Desk:
      return {
        fill: palette.deskFill,
        stroke: palette.deskStroke,
        hover: palette.deskHover,
      }
    case SpaceType.Room:
      return {
        fill: palette.roomFill,
        stroke: palette.roomStroke,
        hover: palette.roomHover,
      }
    case SpaceType.ParkingSpace:
      return {
        fill: palette.parkingFill,
        stroke: palette.parkingStroke,
        hover: palette.parkingHover,
      }
    default:
      return {
        fill: palette.buildingFill,
        stroke: palette.buildingStroke,
        hover: palette.deskHover,
      }
  }
}
