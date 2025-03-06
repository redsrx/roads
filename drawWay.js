'use strict';

let ways = {};

let wayinfowindow = new naver.maps.InfoWindow({
	content: ''
});

const motorwayClass = 'mw';
const widewayClass = 'ww';
const constructingwayClass = 'cw';

const initWays = params => {
	for (const p of params) {
		const wayType = p[0]
		const clor = p[1]
		const init_status = p[2]
		const clss = p[3]
		const part = p[4]
		const trafficlight_size = p[5]
		const strokestyle = p[6]
		const strokeweight = p[7]

		fetch(wayType + '.json')
			.then(res => res.text())
			.then(str => JSON.parse(str))
			.then(jso => {
				for (let wayName in jso) {
					if (wayName.endsWith('_light'))
						continue
					const wayNameMangle = wayName + clss

					let linestr_coord = jso[wayName]
					let signs_coord = jso[wayName + "_light"]
					signs_coord = signs_coord || [];

					let linestr_LatLng = []
					for (let x of linestr_coord)
						linestr_LatLng.push(new naver.maps.LatLng(x[1], x[0]))

					let polline = new naver.maps.Polyline({
						path: linestr_LatLng,
						strokeColor: clor,
						strokeStyle: strokestyle,
						strokeLineCap: 'round',
						strokeLineJoin: 'round',
						strokeWeight: strokeweight,
						clickable: 'true'
					});

					let signs_Marker = []
					for (let x of signs_coord)
						signs_Marker.push(new naver.maps.Marker({
							position: new naver.maps.LatLng(x[1], x[0]),
							icon:
							{
								content:
									'<div style="position:absolute;width:' + trafficlight_size + 'px;height:' + trafficlight_size + 'px;background-image: url(./light.svg);"></div>',
								anchor: new naver.maps.Point(trafficlight_size / 2, trafficlight_size / 2),
							}
						}))

					ways[wayNameMangle] = {
						"type": wayType,
						"overlays": [polline].concat(signs_Marker)
					}

					naver.maps.Event.addListener(polline, 'mouseover', e => {
						polline.setOptions({
							strokeWeight: strokeweight,
							strokeColor: 'yellow',
						});
						wayinfowindow.setOptions({
							position: e.coord,
							content: wayName
						})
						wayinfowindow.open(nmap, e.coord);

					});

					naver.maps.Event.addListener(polline, 'mouseout', _ => {
						polline.setOptions({
							strokeWeight: strokeweight,
							strokeColor: clor
						});
						wayinfowindow.close();
					});

					let ckbx = document.createElement('input')
					ckbx.setAttribute("type", "checkbox")
					if (init_status)
						ckbx.setAttribute("checked", true)
					ckbx.setAttribute('id', wayNameMangle)
					ckbx.setAttribute('class', clss)

					let y = document.createElement('label')
					y.setAttribute('style', 'color: ' + clor)
					y.setAttribute('for', wayNameMangle)
					y.appendChild(document.createTextNode(wayName))

					ckbx.onchange = _ => {
						if (ckbx.checked)
							addWay(wayNameMangle)
						else
							delWay(wayNameMangle)
					}

					part.appendChild(ckbx)
					part.appendChild(y)
					part.appendChild(document.createElement('br'))


					if (init_status)
						addWay(wayNameMangle)
				}
			})

	}
}

const overlays_setMap = (wayName, m) => {
	for (let overlay of ways[wayName]['overlays']) {
		overlay.setMap(m)
	}
}
const addWay = wayName => { overlays_setMap(wayName, nmap) }
const delWay = wayName => { overlays_setMap(wayName, null) }

const selct =
	params => {
		const checkboxes = document.querySelectorAll('input[class="' + params[0] + '"]');
		for (let ckbx of checkboxes) {
			if (ckbx.checked == params[1]) {
				ckbx.checked = !params[1]
				params[2](ckbx.id)
			}
		}
	}

const selectMW = _ => selct([motorwayClass, false, addWay])
const deselectMW = _ => selct([motorwayClass, true, delWay])
const selectWW = _ => selct([widewayClass, false, addWay])
const deselectWW = _ => selct([widewayClass, true, delWay])
