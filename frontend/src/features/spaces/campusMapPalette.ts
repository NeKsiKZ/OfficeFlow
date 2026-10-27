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
      floor: '#24222a',
      floorAlt: '#2a2830',
      floorGrid: 'rgba(232, 237, 235, 0.06)',
      outdoor: '#221f27',
      buildingFill: 'rgba(68, 68, 78, 0.96)',
      buildingFillBottom: 'rgba(55, 53, 62, 0.98)',
      buildingStroke: 'rgba(201, 168, 168, 0.4)',
      buildingHighlight: 'rgba(232, 237, 235, 0.08)',
      buildingShadow: 'rgba(0, 0, 0, 0.4)',
      parkingLotFill: 'rgba(139, 110, 110, 0.1)',
      parkingLotStroke: 'rgba(180, 187, 186, 0.45)',
      label: 'rgba(232, 237, 235, 0.95)',
      mutedLabel: 'rgba(180, 187, 186, 0.92)',
      ink: '#e8edeb',
      deskFill: 'rgba(74, 74, 86, 0.96)',
      deskStroke: '#a8adb2',
      deskHover: 'rgba(168, 173, 178, 0.16)',
      roomFill: 'rgba(90, 76, 82, 0.96)',
      roomStroke: '#c9a8a8',
      roomHover: 'rgba(201, 168, 168, 0.2)',
      parkingFill: 'rgba(78, 78, 88, 0.96)',
      parkingStroke: '#b4bbba',
      parkingHover: 'rgba(180, 187, 186, 0.14)',
      selectedRing: '#c9a8a8',
      selectedGlow: 'rgba(201, 168, 168, 0.32)',
      inactiveAlpha: 0.42,
      emptyInk: 'rgba(180, 187, 186, 0.92)',
    }
  }

  return {
    floor: '#e9e8eb',
    floorAlt: '#e2e1e5',
    floorGrid: 'rgba(42, 40, 46, 0.05)',
    outdoor: '#dddce0',
    buildingFill: 'rgba(255, 255, 255, 0.95)',
    buildingFillBottom: 'rgba(250, 249, 251, 0.98)',
    buildingStroke: 'rgba(139, 110, 110, 0.28)',
    buildingHighlight: 'rgba(255, 255, 255, 0.85)',
    buildingShadow: 'rgba(42, 40, 46, 0.08)',
    parkingLotFill: 'rgba(113, 90, 90, 0.05)',
    parkingLotStroke: 'rgba(42, 40, 46, 0.22)',
    label: 'rgba(42, 40, 46, 0.9)',
    mutedLabel: 'rgba(107, 104, 111, 0.9)',
    ink: '#2a282e',
    deskFill: '#ecebee',
    deskStroke: '#8a8f94',
    deskHover: 'rgba(138, 143, 148, 0.12)',
    roomFill: '#f0ebea',
    roomStroke: '#8b6e6e',
    roomHover: 'rgba(139, 110, 110, 0.12)',
    parkingFill: '#ebeaed',
    parkingStroke: '#8a8c8e',
    parkingHover: 'rgba(113, 90, 90, 0.08)',
    selectedRing: '#8b6e6e',
    selectedGlow: 'rgba(139, 110, 110, 0.22)',
    inactiveAlpha: 0.4,
    emptyInk: 'rgba(107, 104, 111, 0.9)',
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
