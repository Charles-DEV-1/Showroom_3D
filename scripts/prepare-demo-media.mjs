import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'

// Copy just the final presentation assets. The recording sources stay private.
const source = new URL('../artifacts/demo/', import.meta.url)
const destination = new URL('../public/demo/', import.meta.url)
const subtitles = await readFile(new URL('showroom-full-demo.srt', source), 'utf8')
const captions = 'WEBVTT\n\n' + subtitles.replace(/\r\n/g, '\n')
  .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, (_, time, milliseconds) => `${time}.${milliseconds}`).trim() + '\n'
await mkdir(destination, { recursive: true })
await copyFile(new URL('showroom-full-demo.mp4', source), new URL('showroom-full-demo.mp4', destination))
await copyFile(new URL('showroom-full-demo-poster.jpg', source), new URL('showroom-full-demo-poster.jpg', destination))
await writeFile(new URL('showroom-full-demo.vtt', destination), captions)
console.log('Final movie, poster and WebVTT captions prepared in public/demo/.')
