naver.maps.onJSContentLoaded = _ => {
	let infoWindow = new naver.maps.InfoWindow({
		content: ''
	});

	nmap.addListener('click', e => {
		const latlng = e.coord;

		infoWindow.setContent(latlng._lng + ',' + latlng._lat)
		infoWindow.open(nmap, latlng);
	});
}
