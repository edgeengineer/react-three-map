import React, { useState, useRef, useCallback, useEffect } from 'react'
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
  const [selectedObject, setSelectedObject] = useState<string | null>(null)

  const createGeometry = (type: PrimitiveObject['type']): THREE.BufferGeometry => {
    switch (type) {
      case 'cube':
        return new THREE.BoxGeometry(1, 1, 1)
      case 'sphere':
        return new THREE.SphereGeometry(0.5, 32, 16)
      case 'cone':
        return new THREE.ConeGeometry(0.5, 1, 32)
      case 'cylinder':
        return new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
      default:
        return new THREE.BoxGeometry(1, 1, 1)
    }
  }

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
        return <Tablet className="h-4 w-4" />
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getModeIcon = () => {
    return mode === 'edit' ? <Edit3 className="h-4 w-4" /> : <Move className="h-4 w-4" />
  }

  return (
    <div className="w-full h-screen flex flex-col bg-zinc-900">
      <div className="bg-zinc-800 border-b border-zinc-700">
        <Menubar className="border-0 bg-transparent">
          <MenubarMenu>
            <MenubarTrigger className="text-zinc-300 hover:bg-zinc-700 data-[state=open]:bg-zinc-700">
              File
            </MenubarTrigger>
            <MenubarContent className="bg-zinc-800 border-zinc-700 text-zinc-300">
              <MenubarItem>New Scene</MenubarItem>
              <MenubarItem>Open...</MenubarItem>
              <MenubarSeparator className="bg-zinc-700" />
              <MenubarItem>Save</MenubarItem>
              <MenubarItem>Save As...</MenubarItem>
              <MenubarSeparator className="bg-zinc-700" />
              <MenubarItem>Exit</MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          <MenubarMenu>
            <MenubarTrigger className="text-zinc-300 hover:bg-zinc-700 data-[state=open]:bg-zinc-700">
              Edit
            </MenubarTrigger>
            <MenubarContent className="bg-zinc-800 border-zinc-700 text-zinc-300">
              <MenubarItem>Undo</MenubarItem>
              <MenubarItem>Redo</MenubarItem>
              <MenubarSeparator className="bg-zinc-700" />
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
                className="text-zinc-300 hover:bg-zinc-700 gap-2 ml-1"
              >
                <Plus className="h-4 w-4" />
                Add Primitive
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-800 border-zinc-700 text-zinc-300">
              <DropdownMenuLabel className="text-zinc-400">Mesh Primitives</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-700" />
              <DropdownMenuItem 
                onClick={() => addPrimitive('cube')}
                className="hover:bg-zinc-700 focus:bg-zinc-700"
              >
                <Box className="mr-2 h-4 w-4" />
                Cube
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => addPrimitive('sphere')}
                className="hover:bg-zinc-700 focus:bg-zinc-700"
              >
                <Circle className="mr-2 h-4 w-4" />
                Sphere
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => addPrimitive('cone')}
                className="hover:bg-zinc-700 focus:bg-zinc-700"
              >
                <Triangle className="mr-2 h-4 w-4" />
                Cone
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => addPrimitive('cylinder')}
                className="hover:bg-zinc-700 focus:bg-zinc-700"
              >
                <Cylinder className="mr-2 h-4 w-4" />
                Cylinder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-300 hover:bg-zinc-700 gap-2 ml-1"
            onClick={toggleMode}
          >
            {getModeIcon()}
            {mode === 'edit' ? 'Edit Mode' : 'Object Mode'}
          </Button>

          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-zinc-300 hover:bg-zinc-700 gap-2"
              >
                {getDeviceIcon()}
                {device.charAt(0).toUpperCase() + device.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-zinc-800 border-zinc-700 text-zinc-300">
              <DropdownMenuLabel className="text-zinc-400">Device Preview</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-700" />
              <DropdownMenuRadioGroup value={device} onValueChange={(value) => setDevice(value as Device)}>
                <DropdownMenuRadioItem 
                  value="desktop"
                  className="hover:bg-zinc-700 focus:bg-zinc-700"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  Desktop
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem 
                  value="tablet"
                  className="hover:bg-zinc-700 focus:bg-zinc-700"
                >
                  <Tablet className="mr-2 h-4 w-4" />
                  Tablet
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem 
                  value="mobile"
                  className="hover:bg-zinc-700 focus:bg-zinc-700"
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Mobile
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Menubar>
      </div>

      <div className="flex-1 relative">
        {children}
      </div>

      <div className="bg-zinc-800 border-t border-zinc-700 px-4 py-2 flex items-center justify-between">
        <span className="text-zinc-400 text-sm">
          Objects: {objectCount ?? localObjectCount} | Mode: {mode === 'edit' ? 'Edit' : 'Object'} | Device: {device.charAt(0).toUpperCase() + device.slice(1)}
        </span>
        <span className="text-zinc-500 text-xs">
          Press Tab to toggle mode
        </span>
      </div>
    </div>
  )
}