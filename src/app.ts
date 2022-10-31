/* eslint @typescript-eslint/no-misused-promises: 0 */
/* eslint @typescript-eslint/no-floating-promises: 0 */

// ─── Imports ─────────────────────────────────────────────────────────────────

import { debug } from 'console'
import * as dotenv from 'dotenv'
import express, { Application, Request, Response } from 'express'
import fs, { Stats } from 'fs'
import { NetworkInterfaceInfo, networkInterfaces } from 'os'
import path from 'path'
import qrcode from 'qrcode-terminal'
import { spawn } from 'child_process'

// ─────────────────────────────────────────────────────────────────────────────

dotenv.config()

function createTarball (dirPath: string): void {
  console.log('Creating the tarball...')
  const tarballName: string = (dirPath.split('/').pop() as string) + '.tar.gz'
  const child = spawn('tar', ['-C', dirPath, '-czf', tarballName, '.'])

  child.on('close', (data) => {
    createQRCode()
  })
}

function createQRCode (): void {
  // ─── Retrieve IP Address ─────────────────────────────────────────────

  const ip: string | undefined = Object.values(networkInterfaces())
    .flat()
    .find((i: NetworkInterfaceInfo | undefined): Boolean => {
      if (i === undefined) return false
      return i.family === 'IPv4' && !i.internal
    })
    ?.address
  if (ip === undefined) throw new Error('Cannot retrieve the local IP of this machine.')
  const address: string = 'http://' + ip + ':' + String(process.env.PORT)

  // ─── Generate The QR Code ────────────────────────────────────────────

  qrcode.generate(address)
}

async function main (av: string[]): Promise<void> {
  // ─── Error Handling ──────────────────────────────────────────────────

  if (av.length !== 3) throw new Error('Invalid arguments')

  // ─── Init ────────────────────────────────────────────────────────────

  const app: Application = express()
  let filePath: string = process.argv[2][0] === '/' ? process.argv[2] : path.resolve() + '/' + process.argv[2]
  if (filePath[filePath.length - 1] === '/') filePath = filePath.slice(0, -1)
  const fileName: string = filePath.split('/').pop() as string
  const stats: Stats = await fs.promises.stat(filePath)

  if (stats.isDirectory()) {
    createTarball(filePath)
  } else {
    createQRCode()
  }

  // ─── Route For Serving The File ──────────────────────────────────────

  app.get('/', async (req: Request, res: Response): Promise<void> => {
    if (stats.isDirectory()) {
      res.download(path.resolve() + '/' + fileName + '.tar.gz')
      return
    }
    console.log('Sending ' + fileName + '...')
    res.download(filePath)
  })

  app.get('/hello', (req: Request, res: Response) => {
    res.send('Hello World !')
  })

  // ─── Start Server ────────────────────────────────────────────────────

  const server = app.listen(Number(process.env.PORT), () => {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.on('data', () => process.kill(process.pid, 'SIGTERM'))
    console.log('Press any key to stop sharing')
  })

  // ─── Graceful Shutdown ───────────────────────────────────────────────

  process.on('SIGTERM', () => {
    debug('SIGTERM signal received: closing HTTP server.')
    server.close(async () => {
      debug('HTTP server closed.')
      try {
        await fs.promises.access(path.resolve() + '/' + fileName + '.tar.gz')
        await fs.promises.unlink(path.resolve() + '/' + fileName + '.tar.gz')
        process.exit(0)
      } catch (err: unknown) {
        process.exit(0)
      }
    })
  })
  // ─────────────────────────────────────────────────────────────────────
}

// ─── Call To Main ────────────────────────────────────────────────────────────

try {
  main(process.argv)
} catch (err: unknown) {
  console.error(err)
}

// ─────────────────────────────────────────────────────────────────────────────
