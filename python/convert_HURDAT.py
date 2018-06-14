import json

with open('../data/hurdat2-1851-2016-041117.txt') as infile:
	novo = []
	firstline = infile.readline()
	t = 0
	while firstline:
		t+=1	
		print firstline
		hur =  [x.strip() for x in firstline.split(',')]
		#hur_name = "%s_%s" % (hur[0], hur[1])
		hur_name = hur[0]
		obj = {}
		obj['idObj'] = hur_name;
		obj['trajetoria'] = [];
		print hur_name
		for x in xrange(int(hur[2])):
			newline = infile.readline()
			traj = [x.strip() for x in newline.split(',')]
			datahora = "%s-%s" % (traj[0], traj[1])
			rec_iden = traj[2]
			status = traj[3]
			latitude = traj[4]
			longitude =  traj[5]
			wind = traj[6]
			pressure = traj[7]
			latitude = latitude[:-1] if latitude[-1] in ['N', 'E'] else ("-%s" % latitude[:-1])
			longitude = longitude[:-1] if longitude[-1] in ['N', 'E'] else ("-%s" % longitude[:-1])

			trajetoria = {}
			trajetoria['latitude'] = latitude;
			trajetoria['longitude'] = longitude;
			trajetoria['datahora'] = datahora
			trajetoria['wind'] = float(wind)
			trajetoria['pressure'] = float(pressure)
			trajetoria['status'] = status
			obj['trajetoria'].append(trajetoria)
		novo.append(obj)
		firstline = infile.readline()
		
		print t

with open('../data/hurdat2-1851-2016_CONVERTED.json', 'w') as outfile:
	json.dump(novo, outfile,indent=4,ensure_ascii=True)
