import json
import os
import datetime
import time
novo = []
Path = "/home/vinicius/Documents/Sport2/Athlete2/"
filelist = os.listdir(Path)
for i in filelist:
	if i.endswith(".geojson"):
		with open(Path + i) as infile:
			jsondata = json.load(infile)
			print i;
			if("heartRates" in jsondata["features"][0]["properties"]):
				obj = {};
				obj['idObj'] = "Ath2-" + i[:-8];
				obj['trajetoria'] = [];
				for idx,event in enumerate(jsondata["features"][0]["properties"]["coordTimes"]):
					if(idx%100 == 0):
						traj = {}
						traj['datahora'] = time.mktime(datetime.datetime.strptime(event, "%Y-%m-%dT%H:%M:%SZ").timetuple())*1000;
						obj['trajetoria'].append(traj);

				for idx,event in enumerate(jsondata["features"][0]["properties"]["heartRates"]):
					if(idx%100 == 0):
						obj["trajetoria"][idx/100]['heartRates'] = event;

				for idx,event in enumerate(jsondata["features"][0]["geometry"]["coordinates"]):
					if(idx%100 ==0):
						obj["trajetoria"][idx/100]['latitude'] = event[1];
						obj["trajetoria"][idx/100]['longitude'] = event[0];
						obj["trajetoria"][idx/100]['elevacao'] = event[2];

				novo.append(obj);

with open('/home/vinicius/Documents/ath2_red.json', 'w') as outfile:
	json.dump(novo, outfile,indent=4,ensure_ascii=True)
