import { Component, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, OrbitControls, useBounds } from '@react-three/drei'
import { PCFShadowMap } from 'three'
import type { Finish, Part, ViewerProps } from '../../types/product'
import { selectedFinishes } from '../../lib/configuration'
import FinishMaterial from './FinishMaterial'
import type { TextureStatus } from './FinishMaterial'
import './Viewer.css'

const meters = (centimeters: number) => centimeters / 100

function ViewerUnavailable() {
  return (
    <div className="viewer-message" role="status">
      <strong>The 3D preview is unavailable.</strong>
      <span>Try reloading or opening this page in a browser with graphics acceleration enabled.</span>
    </div>
  )
}

class ViewerErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? <ViewerUnavailable /> : this.props.children
  }
}

function PartMesh({ part, finish, reportStatus }: {
  part: Part; finish?: Finish; reportStatus: (url: string, status: TextureStatus) => void
}) {
  return (
    <mesh
      name={part.id}
      position={[meters(part.position[0]), meters(part.position[1]), meters(part.position[2])]}
      castShadow
      receiveShadow
    >
      {part.shape === 'box' && (
        <boxGeometry args={[meters(part.size[0]), meters(part.size[1]), meters(part.size[2])]} />
      )}
      {part.shape === 'cylinder' && (
        <cylinderGeometry args={[meters(part.size[0]), meters(part.size[0]), meters(part.size[1]), 24]} />
      )}
      {part.shape === 'sphere' && (
        <sphereGeometry args={[meters(part.size[0]), 24, 16]} />
      )}
      <FinishMaterial finish={finish} reportStatus={reportStatus} />
    </mesh>
  )
}

function Refit({ parts }: { parts: Part[] }) {
  const bounds = useBounds()
  useEffect(() => { bounds.refresh().clip().fit() }, [bounds, parts])
  return null
}

export default function Viewer({ product, selection }: ViewerProps) {
  const sceneSize = Math.max(...product.dimensionsCm.map(meters), 1)
  const [textureStatus, setTextureStatus] = useState<Record<string, TextureStatus>>({})
  const reportStatus = useCallback((url: string, status: TextureStatus) => {
    setTextureStatus((previous) => previous[url] === status ? previous : { ...previous, [url]: status })
  }, [])
  const finishes = selectedFinishes(product, selection)
  const textures = finishes.flatMap((finish) => finish.textureUrl ? [finish.textureUrl] : [])
  const textureError = textures.some((url) => textureStatus[url] === 'error')
  const textureLoading = textures.some((url) => !textureStatus[url])

  return (
    <div className="viewer" aria-label={`Interactive 3D preview of ${product.name}`}>
      <ViewerErrorBoundary>
        <Canvas
          shadows={{ type: PCFShadowMap }}
          frameloop="demand"
          dpr={[1, 1.5]}
          camera={{ position: [3, 2.2, 3], fov: 40, near: 0.01, far: 100 }}
          fallback={<ViewerUnavailable />}
        >
          <color attach="background" args={['#EEEFE8']} />
          <hemisphereLight args={['#FFFFFF', '#B5B5A6', 1.5]} />
          <directionalLight
            position={[4, 6, 3]}
            intensity={1.8}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-left={-sceneSize}
            shadow-camera-right={sceneSize}
            shadow-camera-top={sceneSize}
            shadow-camera-bottom={-sceneSize}
            shadow-bias={-0.0002}
            shadow-normalBias={0.02}
          />
          <directionalLight position={[-3, 2, -2]} intensity={0.5} />
          <OrbitControls
            makeDefault
            enablePan={false}
            enableDamping
            minDistance={sceneSize * 0.65}
            maxDistance={sceneSize * 5}
            minPolarAngle={0.1}
            maxPolarAngle={Math.PI / 2 - 0.03}
          />
          <Bounds fit clip observe margin={1.5} maxDuration={0}>
            <Refit parts={product.parts} />
            <group>
              {product.parts.map((part) => {
                const finish = finishes.find((item) => item.slot === part.slot)
                return <PartMesh key={part.id} part={part} finish={finish} reportStatus={reportStatus} />
              })}
            </group>
          </Bounds>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
            <planeGeometry args={[sceneSize * 100, sceneSize * 100]} />
            <meshStandardMaterial color="#EEEFE8" roughness={1} />
          </mesh>
        </Canvas>
      </ViewerErrorBoundary>
      {(textureLoading || textureError) && <div className="viewer-status" role="status">
        {textureError ? 'Texture unavailable; showing finish color.' : 'Loading texture…'}
      </div>}
      <div className="viewer-hint">Drag to rotate <span aria-hidden="true">·</span> Scroll or pinch to zoom</div>
    </div>
  )
}
