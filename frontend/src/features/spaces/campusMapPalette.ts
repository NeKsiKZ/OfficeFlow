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
      floor: '#0a0b0c',
      floorAlt: '#101213',
      floorGrid: 'rgba(255, 255, 255, 0.04)',
      outdoor: '#070808',
      buildingFill: 'rgba(36, 40, 39, 0.95)',
      buildingFillBottom: 'rgba(22, 25, 24, 0.98)',
      buildingStroke: 'rgba(143, 171, 160, 0.22)',
      buildingHighlight: 'rgba(255, 255, 255, 0.06)',
      buildingShadow: 'rgba(0, 0, 0, 0.55)',
      parkingLotFill: 'rgba(143, 171, 160, 0.04)',
      parkingLotStroke: 'rgba(154, 163, 158, 0.4)',
      label: 'rgba(244, 246, 245, 0.9)',
      mutedLabel: 'rgba(156, 163, 161, 0.9)',
      ink: '#f4f6f5',
      deskFill: 'rgba(28, 36, 40, 0.95)',
      deskStroke: '#6d8a96',
      deskHover: 'rgba(109, 138, 150, 0.14)',
      roomFill: 'rgba(36, 32, 28, 0.95)',
      roomStroke: '#9a8d72',
      roomHover: 'rgba(154, 141, 114, 0.14)',
      parkingFill: 'rgba(24, 26, 25, 0.95)',
      parkingStroke: '#7a827c',
      parkingHover: 'rgba(143, 171, 160, 0.1)',
      selectedRing: '#8faba0',
      selectedGlow: 'rgba(143, 171, 160, 0.22)',
      inactiveAlpha: 0.38,
      emptyInk: 'rgba(156, 163, 161, 0.9)',
    }
  }

  return {
    floor: '#e6e8e6',
    floorAlt: '#e0e3e0',
    floorGrid: 'rgba(0, 0, 0, 0.05)',
    outdoor: '#d6dad6',
    buildingFill: 'rgba(255, 255, 255, 0.95)',
    buildingFillBottom: 'rgba(250, 251, 250, 0.98)',
    buildingStroke: 'rgba(61, 92, 78, 0.18)',
    buildingHighlight: 'rgba(255, 255, 255, 0.85)',
    buildingShadow: 'rgba(0, 0, 0, 0.07)',
    parkingLotFill: 'rgba(61, 92, 78, 0.04)',
    parkingLotStroke: 'rgba(0, 0, 0, 0.24)',
    label: 'rgba(12, 15, 13, 0.9)',
    mutedLabel: 'rgba(107, 114, 111, 0.9)',
    ink: '#0c0f0d',
    deskFill: '#e8eef0',
    deskStroke: '#6b8f9e',
    deskHover: 'rgba(107, 143, 158, 0.12)',
    roomFill: '#efeae2',
    roomStroke: '#8a7a5c',
    roomHover: 'rgba(138, 122, 92, 0.12)',
    parkingFill: '#eceeea',
    parkingStroke: '#8a8f8c',
    parkingHover: 'rgba(61, 92, 78, 0.08)',
    selectedRing: '#3d5c4e',
    selectedGlow: 'rgba(61, 92, 78, 0.18)',
    inactiveAlpha: 0.4,
    emptyInk: 'rgba(107, 114, 111, 0.9)',
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
