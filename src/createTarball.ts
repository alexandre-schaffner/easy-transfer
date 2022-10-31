import createQRCode from './createQRCode'
import { spawn } from 'child_process'

export default (dirPath: string): void => {
  console.log('Creating the tarball...')
  const tarballName: string = (dirPath.split('/').pop() as string) + '.tar.gz'
  const child = spawn('tar', ['-C', dirPath, '-czf', tarballName, '.'])

  child.on('close', (data) => {
    createQRCode()
  })
}
