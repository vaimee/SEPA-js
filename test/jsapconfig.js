module.exports = `
{
	"parameters": {
		"host": "mml.arces.unibo.it",
		"concurrentRequests": 5,
		"ports": {
			"http": 8000,
			"https": 8443,
			"ws": 9000,
			"wss": 9443
		},
		"paths": {
			"query": "/query",
			"update": "/update",
			"subscribe": "/subscribe",
			"register": "/oauth/register",
			"tokenRequest": "/oauth/token",
			"securePath": "/secure"
		},
		"methods": {
			"query": "POST",
			"update": "URL_ENCODED_POST"
		},
		"formats": {
			"query": "JSON",
			"update": "HTML"
		},
		"security": {
			"client_id": "5j7b8RUD3XE5SZoDrFKt2Xn68MYm6maG6I67+0Qk0KPsFsBUz8L71kxS0UBoU19Q",
			"client_secret": "R1n59N8vTzxof3fuNeaPJL3uPWGTUzoatukGlqlmYlu2l0fg2MtRndEzmpujpGI/",
			"jwt": "xabtQWoH8RJJk1FyKJ78J8h8i2PcWmAugfJ4J6nMd+1jVSoiipV4Pcv8bH+8wJLJ2yRaVage8/TzdZJiz2jdRP8bhkuNzFhGx6N1/1mgmvfKihLheMmcU0pLj5uKOYWFb+TB98n1IpNO4G69lia2YoR15LScBzibBPpmKWF+XAr5TeDDHDZQK4N3VBS/e3tFL/yOhkfC9Mw45s3mz83oydQazps2cFzookIhydKJWfuo5pr6yu/dNILNOt8hd9jqK5uCw8It/0FKvsuW0MAboo4X49sDS+AHTOnVUf67wnnPqJ2M1thThv3dIr/WNn+8xJovJWkwcpGP4T7nH7MOCfZzVnKTHr4hN3q14VUWHYn8Ou/nH3c50k/Cs9LEm6iaQxbvHRvHgzAm0mAuwcEC6svdou2VqEqBhkLLURlIu2AtRCzMQCFC+Tcnnah3e0NCH05W8Mdatp0+nMeL+BmdR5u5LEQTCy7d3YTWoC8i4uAPJ5oEEgpoke2PA29KvKo6z6yA/CxN4Qezrp+XIizBXAenHEZoycDFGMMhg2KVMoWLTOEaXSNUJOtY6BuNVl18dBgGJuESbICeWuEtou+YwpWizUV8QWeIuJlUTUn597TKbntBrNEHW/vXzfPO8Ydru7usw60NeExL9gvpAEQXDMv0Q8vRJVtDrQZDR++hbr7UV35qcIBFW3PzOt0DP6/TGcqFyVCHUA2QYKwYezGdCmb582vCMwsI6kVCSXzvz5lhBNankJ6icCsm5elY39EsRKTCQPidAxyY+1JAjrmBYoshPc594N/wbZt2pTgVQvtIAZmL1k48QVNDBymz8jJjlcJlB+3Doly0YwqxjCUZhtsPCJ8tRt0hGt21QjCoRE1LfdkdKBci9Afse49SCMizoiVK/nJlA2lDPmQCwVrEbT5LUmtDhAhZAePtrRPF9r9fRCKRR1NKqtqHXRXG4VaAvQJKvAJCbJVxiOrDn+UAD9p290XKYfyQ3+usiX4C1NxTTH89MiDHkbAAju0yNksS",
			"expires": "J1dLQZDlDYdWtEaYSIG5+A==",
			"type": "XPrHEX2xHy+5IuXHPHigMw=="
		}
	},
	"namespaces": {
		"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		"rdfs": "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	},
	"extended": {
     "thirdparty" : "hey!"
	},
	"updates": {
		"simple": {
			"sparql": "INSERT { <hello> <from> <js> }WHERE{}"
		},
		"deleteIntgration" : {
			"sparql" : "DELETE {<integration> <jsap> ?a }WHERE{<integration> <jsap> ?a}"
		},
		"notification" : {
			"sparql" : "INSERT {<integration> <jsap> 'Hello World' }WHERE{}"
		},
		"defaultArgs": {
			"sparql": "INSERT {?sub ?pred ?obj}WHERE{}",
			"forcedBindings": {
				"sub": {
					"type": "uri",
					"value": "hello"
				},
				"pred": {
					"type": "uri",
					"value": "from"
				},
				"obj": {
					"type": "literal",
					"value": "js"
				}
			}
		}
	},
	"queries": {
		"simple": {
			"sparql": "select * where{?a ?b ?c}"
		},
		"integration": {
			"sparql": "select * where{<integration> <jsap> ?c}"
		},
		"defaultArgs": {
			"sparql": "select * where{?a ?b ?c}",
			"forcedBindings": {
				"a": {
					"type": "uri",
					"value": "subj"
				}
			}
		}
	}
}
`
