// factory.ts
// a scalable factory-plan

// step-1 : import from geometrix
import type {
	tContour,
	tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	contour,
	contourCircle,
	ctrRectangle,
	figure,
	//degToRad,
	//radToDeg,
	ffix,
	pNumber,
	pCheckbox,
	pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';

// step-2 : definition of the parameters and more (part-name, svg associated to each parameter, simulation parameters)
const pDef: tParamDef = {
	// partName is used in URL. Choose a name without slash, backslash and space.
	partName: 'factory',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('onx', 'office', 4, 1, 50, 1),
		pNumber('ony', 'office', 3, 1, 50, 1),
		pNumber('olx', 'mm', 5000, 1000, 50000, 10),
		pNumber('oly', 'mm', 5000, 1000, 50000, 10),
		pNumber('iwx', 'mm', 2000, 500, 10000, 10),
		pNumber('iwy', 'mm', 2000, 500, 10000, 10),
		pSectionSeparator('details'),
		pNumber('ewx', 'mm', 5000, 500, 20000, 10),
		pNumber('ewy', 'mm', 5000, 500, 20000, 10),
		pDropdown('officeOrientation', ['xdw', 'xup', 'xal', 'ydw', 'yup', 'yal']),
		pNumber('ith', 'mm', 400, 100, 2000, 10),
		pNumber('eth', 'mm', 400, 100, 2000, 10),
		pNumber('bw', 'mm', 1500, 200, 10000, 10),
		pSectionSeparator('heights and roof'),
		pNumber('oh1', 'mm', 2800, 2000, 5000, 10),
		pNumber('oh2', 'mm', 4000, 2000, 10000, 10),
		pNumber('rth', 'mm', 200, 10, 1000, 10),
		pNumber('ras', 'degree', 49.0, 20, 90, 0.1),
		pNumber('ran', 'degree', 90, 80, 160, 0.1),
		pSectionSeparator('lateral windows'),
		pNumber('swx1', 'mm', 1000, 10, 5000, 10),
		pNumber('swx2', 'mm', 1000, 10, 5000, 10),
		pNumber('swh1', 'mm', 1000, 10, 5000, 10),
		pNumber('swh2', 'mm', 1000, 10, 5000, 10),
		pNumber('swh3', 'mm', 200, 10, 5000, 10),
		pSectionSeparator('front windows'),
		pNumber('fwx1', 'mm', 1000, 10, 5000, 10),
		pNumber('fwx2', 'mm', 1000, 10, 5000, 10),
		pNumber('fwh1', 'mm', 1000, 10, 5000, 10),
		pNumber('fwh2', 'mm', 1000, 10, 5000, 10),
		pNumber('fwh3', 'mm', 200, 10, 5000, 10),
		pNumber('fdx1', 'mm', 1000, 10, 5000, 10),
		pNumber('fdx2', 'mm', 1000, 10, 5000, 10),
		pNumber('fdh2', 'mm', 2000, 10, 5000, 10),
		pNumber('fdh3', 'mm', 200, 10, 5000, 10),
		pSectionSeparator('to be deleted'),
		pNumber('L1', 'mm', 120, 1, 400, 1),
		pNumber('L2', 'mm', 80, 1, 400, 1),
		pNumber('W1', 'mm', 2, 0.1, 10, 0.1),
		pNumber('H1', 'mm', 40, 1, 400, 1),
		pNumber('H2', 'mm', 2, 0.1, 10, 0.1),
		//pSectionSeparator(name)
		pSectionSeparator('hollow'),
		//pCheckbox(name, init)
		pCheckbox('holes', true),
		pNumber('D1', 'mm', 10, 1, 400, 1),
		pNumber('D2', 'mm', 5, 1, 400, 1),
		pSectionSeparator('corners'),
		pNumber('Rc', 'mm', 10, 0, 400, 1)
	],
	paramSvg: {
		onx: 'factory_top.svg',
		ony: 'factory_top.svg',
		olx: 'factory_top.svg',
		oly: 'factory_top.svg',
		iwx: 'factory_top.svg',
		iwy: 'factory_top.svg',
		ewx: 'factory_top.svg',
		ewy: 'factory_top.svg',
		officeOrientation: 'factory_top.svg',
		ith: 'factory_top.svg',
		eth: 'factory_top.svg',
		bw: 'factory_top.svg',
		oh1: 'factory_west.svg',
		oh2: 'factory_west.svg',
		rth: 'factory_west.svg',
		ras: 'factory_west.svg',
		ran: 'factory_west.svg',
		swx1: 'factory_side_window.svg',
		swx2: 'factory_side_window.svg',
		swh1: 'factory_side_window.svg',
		swh2: 'factory_side_window.svg',
		swh3: 'factory_side_window.svg',
		fwx1: 'factory_front_window.svg',
		fwx2: 'factory_front_window.svg',
		fwh1: 'factory_front_window.svg',
		fwh2: 'factory_front_window.svg',
		fwh3: 'factory_front_window.svg',
		fdx1: 'factory_front_window.svg',
		fdx2: 'factory_front_window.svg',
		fdh2: 'factory_front_window.svg',
		fdh3: 'factory_front_window.svg',
		//
		L1: 'factory_top.svg',
		L2: 'factory_west.svg',
		W1: 'factory_side_window.svg',
		H1: 'factory_front_window.svg',
		H2: 'factory_top.svg',
		holes: 'factory_top.svg',
		D1: 'factory_top.svg',
		D2: 'factory_top.svg',
		Rc: 'factory_top.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

// step-3 : definition of the function that creates from the parameter-values the figures and construct the 3D
function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figBottom = figure();
	const figTop = figure();
	const figSide = figure();
	const figFace = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const L1b = param.L1 - 2 * param.W1;
		const L2b = param.L2 - 2 * param.W1;
		const Rcb = Math.max(param.Rc - param.W1, 0);
		const H3b = param.H1 - param.H2;
		const circleDelta = ((param.D1 + param.D2) * 3) / 4;
		// step-5 : checks on the parameter values
		if (L1b < 0) {
			throw `err085: L1 ${param.L1} is too small compare to W1 ${param.W1}`;
		}
		if (L2b < 0) {
			throw `err088: L2 ${param.L2} is too small compare to W1 ${param.W1}`;
		}
		if (H3b < 0) {
			throw `err091: H1 ${param.H1} is too small compare to H2 ${param.H2}`;
		}
		// step-6 : any logs
		rGeome.logstr += `box-base surface ${ffix(param.L1 * param.L2)} mm2\n`;
		rGeome.logstr += `box volume ${ffix(param.L1 * param.L2 * param.H1)} mm3\n`;
		// step-7 : drawing of the figures
		// figTop
		const ctrExt = contour(0, 0)
			.addCornerRounded(param.Rc)
			.addSegStrokeA(param.L1, 0)
			.addCornerRounded(param.Rc)
			.addSegStrokeA(param.L1, param.L2)
			.addCornerRounded(param.Rc)
			.addSegStrokeA(0, param.L2)
			.addCornerRounded(param.Rc)
			.closeSegStroke();
		const ctrInt = ctrRectangle(param.W1, param.W1, L1b, L2b, Rcb);
		const ctrsTop: tOuterInner = [ctrExt, ctrInt];
		figTop.addMainOI(ctrsTop);
		const hole1 = contourCircle(param.L1 / 2, param.L2 / 2, param.D1 / 2);
		const hole2 = contourCircle(param.L1 / 2 + circleDelta, param.L2 / 2, param.D2 / 2);
		if (param.holes) {
			figTop.addSecond(hole1);
			figTop.addSecond(hole2);
		}
		// figBottom
		if (param.holes) {
			figBottom.addMainOI([ctrExt, hole1, hole2]);
		} else {
			figBottom.addMainO(ctrExt);
		}
		figBottom.addSecond(ctrInt);
		// figSide
		function shapeU(hLength: number): tContour {
			const rCtr = contour(0, 0)
				.addSegStrokeR(hLength, 0)
				.addSegStrokeR(0, param.H1)
				.addSegStrokeR(-param.W1, 0)
				.addSegStrokeR(0, -H3b)
				.addSegStrokeR(-hLength + 2 * param.W1, 0)
				.addSegStrokeR(0, H3b)
				.addSegStrokeR(-param.W1, 0)
				.closeSegStroke();
			return rCtr;
		}
		figSide.addMainOI([shapeU(param.L2)]);
		if (param.holes) {
			const x1 = param.L2 / 2 - param.D1 / 2;
			figSide.addSecond(ctrRectangle(x1, 0, param.D1, param.H2));
		}
		// figFace
		figFace.addMainO(shapeU(param.L1));
		if (param.holes) {
			const x1 = param.L1 / 2 - param.D1 / 2;
			figFace.addSecond(ctrRectangle(x1, 0, param.D1, param.H2));
			const x2 = param.L1 / 2 + circleDelta - param.D2 / 2;
			figFace.addSecond(ctrRectangle(x2, 0, param.D2, param.H2));
		}
		// final figure list
		rGeome.fig = {
			faceBottom: figBottom,
			faceTop: figTop,
			faceSide: figSide,
			faceFace: figFace
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_bottom`,
					face: `${designName}_faceBottom`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.H2,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_top`,
					face: `${designName}_faceTop`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: H3b,
					rotate: [0, 0, 0],
					translate: [0, 0, param.H2]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_bottom`, `subpax_${designName}_top`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'factory drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

// step-11 : definiton of the final object that gathers the precedent object and function
const factoryDef: tPageDef = {
	pTitle: 'factory',
	pDescription: 'a scalable factory-plan',
	pDef: pDef,
	pGeom: pGeom
};

// step-12 : export the final object
export { factoryDef };
