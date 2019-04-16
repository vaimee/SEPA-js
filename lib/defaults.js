const https = require('https')
//Default self-signed sepa certificate
const ca = `
Bag Attributes
    friendlyName: sepakey
    localKeyID: 54 69 6D 65 20 31 35 35 33 32 34 39 38 34 33 33 34 36
subject=/C=IT/ST=Bologna/L=Bologna/CN=localhost
issuer=/C=IT/ST=Bologna/L=Bologna/CN=localhost
-----BEGIN CERTIFICATE-----
MIIDKTCCAhGgAwIBAgIEbMARRzANBgkqhkiG9w0BAQsFADBFMQswCQYDVQQGEwJJ
VDEQMA4GA1UECBMHQm9sb2duYTEQMA4GA1UEBxMHQm9sb2duYTESMBAGA1UEAxMJ
bG9jYWxob3N0MB4XDTE5MDMyMjEwMDg1M1oXDTIwMDMxNjEwMDg1M1owRTELMAkG
A1UEBhMCSVQxEDAOBgNVBAgTB0JvbG9nbmExEDAOBgNVBAcTB0JvbG9nbmExEjAQ
BgNVBAMTCWxvY2FsaG9zdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEB
AJZ9ajuqEqXGU5QAWyMG3w4hScec9BXjOwDeqseSDDxOx/KuHCG5JDTiQzmPBT96
LLUGTn+c2l2c+Ezm4Dk11qjpJ+aiiv+gGvyNJmpw/+UwW7wp13O9sMr21GZxexmZ
/xV/nsXFXXoUurCwZecTzQ6UcNvrvlUy7NVr2TU+ZpwWR/DyKhxe452VJlEaP9Yk
Zu/g9x9rYMs7iG4qErQnGhGS6ds8fU6VrzPCAW9EFxC1SN7r2xnPREU/igv0SilX
e+tPk167l1wgGyBl3K4Ep7O8RoSE/EhyuooZ9oVenqD/MRlKLso1O2Kv7DslrBpv
8UufAWxwwEOhDA3XXfblsDkCAwEAAaMhMB8wHQYDVR0OBBYEFCxDyoFe03ccASA9
JfyvYFEAStceMA0GCSqGSIb3DQEBCwUAA4IBAQBvWzC0qLNhp8L9GkoaNtNKJGEu
WQkqaMDBtrD4Jy+I75/k73ivvwVgbgg0kq9+jYC48tWwcBsDzqNau+Zay4rWZlf9
qbnP3+j4hgLIBPrAAvxWQBzLrVOkZK1hXdrS1fNCFmYdIwlEU7M06C3mv69CD/yJ
vJF2FczexVR2I2L15JdpVlqZ35KwQ8QRTKTtwvQxZeZG56g+Db0vGMMwJqSpPRZc
WdUXV+2aTVZWdO3avHXkS/qZ0A+8HX8bVvm8O/5b21bIo9BfCf3za3/CAVSNFfNp
VfDUVhC465CzJcei94rxKyjWTuVl7CZA+6e2x5Ua/4tASi0sFFAlqGJIpiXr
-----END CERTIFICATE-----
`
const httpsAgent = new https.Agent({ ca: [ca] })

module.exports = Object.freeze({
	"host": "localhost",
	"oauth": {
		"enable": false,
		"register": "https://localhost:8443/oauth/register",
		"tokenRequest": "https://localhost:8443/oauth/token"
	},
	"sparql11protocol": {
		"protocol": "http",
		"port": 8000,
		"query": {
			"path": "/query",
			"method": "POST",
			"format": "JSON"
		},
		"update": {
			"path": "/update",
			"method": "POST",
			"format": "JSON"
		}
	},
	"sparql11seprotocol": {
		"protocol": "ws",
		"availableProtocols": {
			"ws": {
				"port": 9000,
				"path": "/subscribe"
			},
			"wss": {
				"port": 9443,
				"path": "/secure/subscribe"
			}
		}
	},
	"options" : {
		"httpsAgent" : httpsAgent
	}
})
