import json
import urllib2
import time

headers = {'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' ,
'Accept-Encoding':'gzip, deflate',
'Accept-Language':'en-US,pt-BR;q=0.7,en;q=0.3',
'Connection':'keep-alive',
'Host':'dadosabertos.rio.rj.gov.br',
'Upgrade-Insecure-Requests':'1',
'User-Agent':'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:53.0) Gecko/20100101 Firefox/53.0'
}
url = 'http://webapibrt.rio.rj.gov.br/api/v1/brt'
req = urllib2.Request(url)
while(True):
	data = json.load(urllib2.urlopen(req))
	with open('./dataOnibus.txt', 'a') as outfile:
		json.dump(data, outfile)
		print (time.ctime())
		time.sleep(300)
