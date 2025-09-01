import React, { useState, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from './ui/menubar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { Plus, Box, Circle, Triangle, Cylinder, Edit3, Move, Monitor, Tablet, Smartphone } from 'lucide-react'
import './BlenderView.css'

interface PrimitiveObject {
  id: string
  type: 'cube' | 'sphere' | 'cone' | 'cylinder'
  position: [number, number, number]
  geometry: THREE.BufferGeometry
}

type Mode = 'object' | 'edit'
type Device = 'desktop' | 'tablet' | 'mobile'

interface BlenderViewProps {
  children: React.ReactNode
  onAddPrimitive?: (type: PrimitiveObject['type']) => void
  objectCount?: number
}

export function BlenderView({ children, onAddPrimitive, objectCount }: BlenderViewProps) {
  const [localObjectCount, setLocalObjectCount] = useState(0)
  const [mode, setMode] = useState<Mode>('object')
  const [device, setDevice] = useState<Device>('desktop')
  // const [selectedObject, setSelectedObject] = useState<string | null>(null)

  // const createGeometry = (type: PrimitiveObject['type']): THREE.BufferGeometry => {
  //   switch (type) {
  //     case 'cube':
  //       return new THREE.BoxGeometry(1, 1, 1)
  //     case 'sphere':
  //       return new THREE.SphereGeometry(0.5, 32, 16)
  //     case 'cone':
  //       return new THREE.ConeGeometry(0.5, 1, 32)
  //     case 'cylinder':
  //       return new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
  //     default:
  //       return new THREE.BoxGeometry(1, 1, 1)
  //   }
  // }

  const addPrimitive = useCallback((type: PrimitiveObject['type']) => {
    setLocalObjectCount(prev => prev + 1)
    onAddPrimitive?.(type)
  }, [onAddPrimitive])

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'object' ? 'edit' : 'object')
  }, [])

  // Handle Tab key press for mode toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        toggleMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleMode])

  const getDeviceIcon = () => {
    switch (device) {
      case 'tablet':
        return <Tablet className="blender-view-icon" />
      case 'mobile':
        return <Smartphone className="blender-view-icon" />
      default:
        return <Monitor className="blender-view-icon" />
    }
  }

  const getModeIcon = () => {
    return mode === 'edit' ? <Edit3 className="blender-view-icon" /> : <Move className="blender-view-icon" />
  }

  return (
    <div className="blender-view-container">
      <div className="blender-view-header">
        <Menubar className="blender-view-menubar">
          <MenubarMenu>
            <MenubarTrigger className="blender-view-menubar-trigger">
              File
            </MenubarTrigger>
            <MenubarContent className="blender-view-menubar-content">
              <MenubarItem>New Scene</MenubarItem>
              <MenubarItem>Open...</MenubarItem>
              <MenubarSeparator className="blender-view-menubar-separator" />
              <MenubarItem>Save</MenubarItem>
              <MenubarItem>Save As...</MenubarItem>
              <MenubarSeparator className="blender-view-menubar-separator" />
              <MenubarItem>Exit</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="blender-view-menubar-trigger">
              Edit
            </MenubarTrigger>
            <MenubarContent className="blender-view-menubar-content">
              <MenubarItem>Undo</MenubarItem>
              <MenubarItem>Redo</MenubarItem>
              <MenubarSeparator className="blender-view-menubar-separator" />
              <MenubarItem>Cut</MenubarItem>
              <MenubarItem>Copy</MenubarItem>
              <MenubarItem>Paste</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="blender-view-button"
              >
                <Plus className="blender-view-icon" />
                Add Primitive
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="blender-view-dropdown-content">
              <DropdownMenuLabel className="blender-view-dropdown-label">Mesh Primitives</DropdownMenuLabel>
              <DropdownMenuSeparator className="blender-view-dropdown-separator" />
              <DropdownMenuItem 
                onClick={() => addPrimitive('cube')}
                className="blender-view-dropdown-item"
              >
                <Box className="blender-view-icon blender-view-icon-mr" />
                Cube
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => addPrimitive('sphere')}
                className="blender-view-dropdown-item"
              >
                <Circle className="blender-view-icon blender-view-icon-mr" />
                Sphere
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => addPrimitive('cone')}
                className="blender-view-dropdown-item"
              >
                <Triangle className="blender-view-icon blender-view-icon-mr" />
                Cone
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => addPrimitive('cylinder')}
                className="blender-view-dropdown-item"
              >
                <Cylinder className="blender-view-icon blender-view-icon-mr" />
                Cylinder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="blender-view-button"
            onClick={toggleMode}
          >
            {getModeIcon()}
            {mode === 'edit' ? 'Edit Mode' : 'Object Mode'}
          </Button>

          <div className="blender-view-flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="blender-view-button"
              >
                {getDeviceIcon()}
                {device.charAt(0).toUpperCase() + device.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="blender-view-dropdown-content">
              <DropdownMenuLabel className="blender-view-dropdown-label">Device Preview</DropdownMenuLabel>
              <DropdownMenuSeparator className="blender-view-dropdown-separator" />
              <DropdownMenuRadioGroup value={device} onValueChange={(value) => setDevice(value as Device)}>
                <DropdownMenuRadioItem 
                  value="desktop"
                  className="blender-view-dropdown-item"
                >
                  <Monitor className="blender-view-icon blender-view-icon-mr" />
                  Desktop
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem 
                  value="tablet"
                  className="blender-view-dropdown-item"
                >
                  <Tablet className="blender-view-icon blender-view-icon-mr" />
                  Tablet
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem 
                  value="mobile"
                  className="blender-view-dropdown-item"
                >
                  <Smartphone className="blender-view-icon blender-view-icon-mr" />
                  Mobile
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Menubar>
      </div>

      <div className="blender-view-content">
        {children}
      </div>

      <div className="blender-view-statusbar">
        <span className="blender-view-status-text">
          Objects: {objectCount ?? localObjectCount} | Mode: {mode === 'edit' ? 'Edit' : 'Object'} | Device: {device.charAt(0).toUpperCase() + device.slice(1)}
        </span>
        <span className="blender-view-status-hint">
          Press Tab to toggle mode
        </span>
      </div>
    </div>
  )
}