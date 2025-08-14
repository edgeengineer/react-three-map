import React from 'react'
import type { Story } from '@ladle/react'
import { BlenderView } from '../../src/components/BlenderView'

export const BlenderUI: Story = () => {
  return (
    <BlenderView>
      <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white/50 text-center">
          <p className="text-2xl mb-2">Map View Area</p>
          <p className="text-sm">Use the "Add Primitive" dropdown to add 3D objects</p>
          <p className="text-xs mt-4">Note: Objects will be added to the map in the Integrated stories</p>
          <div className="mt-8 p-4 bg-purple-500 text-white rounded-lg">
            Test: If this has purple background, Tailwind is working
          </div>
        </div>
      </div>
    </BlenderView>
  )
}

BlenderUI.storyName = 'Blender UI (Static Background)'

export default {
  title: 'Blender View',
}