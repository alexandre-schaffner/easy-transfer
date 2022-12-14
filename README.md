# easy-transfer

easy-transfer is a simple tool that allows you to easily share files from your computer to another device on your local network using a QR code.

## Installation

To install easy-transfer, you can clone the repository from GitHub and build the package yourself:
```bash
$ git clone git@github.com:alexandre-schaffner/easy-transfer.git
$ cd easy-transfer
$ yarn install
$ yarn build
```

You can then install the package globally with:

```bash
$ yarn install-pkg
```

## Usage

To use easy-transfer, simply run the `easy-transfer` command followed by the path to the file you want to share. This will generate a QR code in the terminal that you can scan with the other device to download the file.

```bash
$ easy-transfer path/to/file
```

## Options

easy-transfer has several options that you can use to customize the way it works.

### `--port`

The `--port` option allows you to specify the port that the server will listen on. This is useful if you want to use a specific port or if the default port (3000) is already in use.

```bash
$ easy-transfer --port 4000 path/to/file
```


### `--no-qr`

The `--no-qr` option disables the QR code generation, so the URL to the file will be printed to the terminal instead. This is useful if the device you are sharing with does not have a QR code scanner.

```bash
$ easy-transfer --no-qr path/to/file
```
