var map = new wemapgl.WeMap({
	container: "map",
	key: "GqfwrZUEfxbwbnQUhtBMFivEysYIxelQ",
	center: [105.1, 21.0],
	zoom: 5,
	// Turn on urlController
	urlController: "false",
	// Turn on reverse
	reverse: "false",
});

let popup = new wemapgl.Popup({ closeButton: false, closeOnClick: false });

map.on("load", function () {
	map.addSource("data", {
		type: "geojson",
		data: "http://127.0.0.1:8080/Downloads/data.geojson",
	});

	map.addLayer({
		id: "state-fills",
		type: "fill",
		source: "data",
		layout: {},
		paint: {
			"fill-color": {
				property: "id",
				stops: [
					[-5, "#CC0000"],
					[-4, "#42f5cb"],
					[-3, "#a5ff7d"],
					[-2, "#fcf988"],
					[-1, "#ffca7a"],
					[0, "#CC99CC"],
				],
			},
			"fill-opacity": [
				"case",
				["boolean", ["feature-state", "hover"], false],
				1,
				0.5,
			],
			"fill-outline-color": "#000",
		},
	});

	var hoveredStateId = null;
	map.on("mousemove", "state-fills", (e) => {
		if (e.features.length > 0) {
			if (hoveredStateId !== null) {
				map.setFeatureState(
					{ source: "data", id: hoveredStateId },
					{ hover: false }
				);
			}
			hoveredStateId = e.features[0].properties.gid;
			map.setFeatureState(
				{ source: "data", id: hoveredStateId },
				{ hover: true }
			);
		}
		setCursor("pointer");
		popup
			.setLngLat(e.lngLat)
			.setHTML(`<strong>${e.features[0].properties.ten_tinh}</strong>`)
			.addTo(map);
	});

	map.on("mouseleave", "state-fills", (e) => {
		if (hoveredStateId !== null) {
			map.setFeatureState(
				{ source: "data", id: hoveredStateId },
				{ hover: false }
			);
		}
		hoveredStateId = null;

		setCursor("");
		popup.remove();
	});

	map.on("click", "state-fills", (e) => {
		let province = e.features[0].properties.ten_tinh;
		console.log(province);
		if (
			province === "Cà Mau" ||
			province === "Hậu Giang" ||
			province === "Kiên Giang" ||
			province === "Long An" ||
			province === "Sóc Trăng"
		) {
			showInfoModal(province);
		} else {
			alertModal.show();
		}
	});
});

function setCursor(style) {
	map.getCanvas().style.cursor = style;
}

function parseTabContent(data) {
	var keys = Object.keys(data);

	var content = "<div>";

	for (let i = 0; i < keys.length; i++) {
		let p = data[keys[i]];
		content += `<h5>${keys[i]}</h5><p>${
			typeof p === "object" ? parseTabContent(p) : p
		}</p>`;
	}

	content += "</div>";

	return content;
}

function buildModal(data) {
	var tabs = document.getElementById("pills-tab");
	var tabsContent = document.getElementById("pills-tabContent");

	var keys = Object.keys(data);

	document.getElementById("informationModalLabel").innerText = data[keys[0]];

	tabs.innerHTML = "";
	tabsContent.innerHTML = "";

	for (let i = 1; i < keys.length; i++) {
		tabs.innerHTML += `<li class="nav-item" role="presentation"><button class="nav-link" id="pills-${i}-tab" data-bs-toggle="pill" data-bs-target="#pills-${i}" type="button" role="tab" aria-controls="pills-${i}" aria-selected="true">${keys[i]}</button></li>`;
		tabsContent.innerHTML += `<div class="tab-pane fade" id="pills-${i}" role="tabpanel" aria-labelledby="pills-${i}-tab">${parseTabContent(
			data[keys[i]]
		)}</div>`;
	}

	tabs.firstChild.firstChild.classList.add("active");
	tabsContent.firstChild.classList.add("show");
	tabsContent.firstChild.classList.add("active");
}

var informationModal = new bootstrap.Modal(
	document.getElementById("informationModal")
);

var alertModal = new bootstrap.Modal(document.getElementById("alertModal"));

function showInfoModal(name) {
	fetch("/data", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name: name }),
	})
		.then((response) => response.json())
		.then((data) => {
			buildModal(data[0]);

			informationModal.show();
		})
		.catch((error) => {
			console.error("Error:", error);
		});
}
