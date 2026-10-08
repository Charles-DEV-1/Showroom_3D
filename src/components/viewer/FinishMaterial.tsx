import { Component, Suspense, useEffect, useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
import { useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { SRGBColorSpace } from 'three'
import type { Texture } from 'three'
import type { Finish } from '../../types/product'

export type TextureStatus = 'ready' | 'error'
type ReportStatus = (url: string, status: TextureStatus) => void

function configureColorMap(map: Texture) {
  map.colorSpace = SRGBColorSpace
  map.needsUpdate = true
}

function SolidMaterial({ color }: { color: string }) {
  return <meshStandardMaterial color={color} roughness={0.68} metalness={0} />
}

class TextureBoundary extends Component<{
  children: ReactNode; fallback: ReactNode; url: string; reportStatus: ReportStatus
}, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.reportStatus(this.props.url, 'error') }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function TexturedMaterial({ url, reportStatus }: { url: string; reportStatus: ReportStatus }) {
  const map = useTexture(url, configureColorMap)
  const invalidate = useThree((state) => state.invalidate)
  useLayoutEffect(() => {
    invalidate()
  }, [map, invalidate])
  useEffect(() => { reportStatus(url, 'ready') }, [url, reportStatus])
  // White avoids tinting the uploaded color image with the fallback color.
  return <meshStandardMaterial map={map} color="#FFFFFF" roughness={0.68} metalness={0} />
}

export default function FinishMaterial({ finish, reportStatus }: { finish?: Finish; reportStatus: ReportStatus }) {
  const fallback = <SolidMaterial color={finish?.color ?? '#A49A8A'} />
  if (!finish?.textureUrl) return fallback
  return (
    <TextureBoundary key={finish.textureUrl} url={finish.textureUrl} reportStatus={reportStatus} fallback={fallback}>
      <Suspense fallback={fallback}>
        <TexturedMaterial url={finish.textureUrl} reportStatus={reportStatus} />
      </Suspense>
    </TextureBoundary>
  )
}
