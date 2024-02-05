import * as THREE from 'three';
import occtimportjs from 'occt-import-js';

export async function LoadStep(data) {
	const targetObject = new THREE.Object3D();

	const wasmUrl = 'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.12/dist/occt-import-js.wasm';

	// init occt-import-js
	const occt = await occtimportjs({
		locateFile: (name) => {
			return wasmUrl;
		},
	});

	// download a step file
	// let response = await fetch("../data/BRACKET.step")
	// let buffer = await response.arrayBuffer()

	// read the imported step file
	let fileBuffer = new Uint8Array(data);
	let result = occt.ReadStepFile(fileBuffer);

	// process the geometries of the result
	for (let resultMesh of result.meshes) {
		let geometry = new THREE.BufferGeometry();

		geometry.setAttribute('position', new THREE.Float32BufferAttribute(resultMesh.attributes.position.array, 3));
		if (resultMesh.attributes.normal) {
			geometry.setAttribute('normal', new THREE.Float32BufferAttribute(resultMesh.attributes.normal.array, 3));
		}
		const index = Uint16Array.from(resultMesh.index.array);
		geometry.setIndex(new THREE.BufferAttribute(index, 1));

		let material = null;
		if (resultMesh.color) {
			const color = new THREE.Color(resultMesh.color[0], resultMesh.color[1], resultMesh.color[2]);
			material = new THREE.MeshPhongMaterial({ color: color });
		} else {
			material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
		}

		const mesh = new THREE.Mesh(geometry, material);
		targetObject.add(mesh);
	}
	return targetObject;
}
