import { NetworkInterfaceInfo, networkInterfaces } from 'os'
import qrcode from 'qrcode-terminal'

export default (): void => {
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
