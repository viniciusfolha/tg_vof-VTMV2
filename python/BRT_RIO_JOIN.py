import json



data = [];
final = {}
with open('data.txt') as json_data:
	print(type(json_data))
	d = json_data.read().replace("]}{\"veiculos\": [",",")
	c = json.loads(d)
	print(len(c["veiculos"]))
	for veiculo in c["veiculos"]:
		if veiculo not in data:
			data.append(veiculo)
	print(len(data))
	final['veiculos'] = data
	
with open('RIO_BRT_ALL.txt', 'w') as outfile:
	json.dump(final, outfile)

