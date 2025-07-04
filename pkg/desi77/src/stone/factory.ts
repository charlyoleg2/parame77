// factory.ts
// a scalable factory-plan

// step-1 : import from geometrix
import type {
	//tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	contour,
	//contourCircle,
	ctrRectangle,
	figure,
	degToRad,
	radToDeg,
	ffix,
	pNumber,
	pCheckbox,
	pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triAPiPi, triAArA, triALArLL, triLALrL, triALLrL, triALLrLAA, triLLLrA, triLLLrAAA } from 'triangule';
import { triALArLL } from 'triangule';

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
		pNumber('rtn', 'triangle', 6, 1, 1000, 1),
		pNumber('ran', 'degree', 49.0, 20, 90, 0.1),
		pNumber('ram', 'degree', 90, 80, 160, 0.1),
		pNumber('rth', 'mm', 200, 10, 1000, 10),
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
		rtn: 'factory_west.svg',
		ran: 'factory_west.svg',
		ram: 'factory_west.svg',
		rth: 'factory_west.svg',
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
	const figTop = figure();
	const figWest = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const llix = param.onx * param.olx + (param.onx - 1) * param.iwx + 2 * param.ewx;
		const llex = llix + 2 * param.eth;
		const lliy = param.ony * param.oly + (param.ony - 1) * param.iwy + 2 * param.ewy;
		const lley = lliy + 2 * param.eth;
		const llixm = llix / 1000;
		const llexm = llex / 1000;
		const lliym = lliy / 1000;
		const lleym = lley / 1000;
		const fh = param.oh1 + param.oh2;
		const olix = param.olx - 2 * param.ith;
		const oliy = param.oly - 2 * param.ith;
		const officeOx = param.eth + param.ewx;
		const officeOy = param.eth + param.ewy;
		// roof
		const roofTriLx = llex / param.rtn;
		const ran = degToRad(param.ran);
		const ram = degToRad(param.ram);
		const ras = Math.PI - ran - ram;
		if (ras < 0.1) {
			// arbitrary 0.1 rad
			throw `err162: ras ${ffix(radToDeg(ras))} is too small. Reduce ran ${ffix(param.ran)} or ram ${ffix(param.ram)} degree`;
		}
		const [tr1lBC, tr1lCA, tr1Log] = triALArLL(ras, roofTriLx, ran);
		rGeome.logstr += tr1Log;
		const Rh = tr1lBC * Math.sin(ran);
		const Rhx = tr1lBC * Math.cos(ran);
		const Rhxs = roofTriLx - Rhx;
		const Rhxp = (100 * Rhx) / roofTriLx;
		const Rhxsp = (100 * Rhxs) / roofTriLx;
		const Rhyp = (100 * Rh) / roofTriLx;
		// step-5 : checks on the parameter values
		if (olix < 0) {
			throw `err158: olix ${ffix(olix)} is too small compare to ith ${param.ith}`;
		}
		if (oliy < 0) {
			throw `err161: oliy ${ffix(oliy)} is too small compare to ith ${param.ith}`;
		}
		if (param.olx < 2 * param.ith + param.swx1 + param.swx2) {
			throw `err151: olx ${param.olx} is too small compare to swx1 ${param.swx1} and swx2 ${param.swx2}`;
		}
		if (param.oly < 2 * param.ith + param.fwx1 + param.fwx2 + param.fdx1 + param.fdx2) {
			throw `err154: oly ${param.oly} is too small compare to fwx1 ${param.fwx1}, fwx2 ${param.fwx2}, fdx1 ${param.fdx1}, fdx2 ${param.fdx2}`;
		}
		if (Math.min(param.olx, param.oly) < param.bw) {
			throw `err172: bw ${param.bw} is too large compare to olx ${param.olx} or oly ${param.oly}`;
		}
		// step-6 : any logs
		rGeome.logstr += `factory size: llex ${ffix(llexm)} x lley ${ffix(lleym)} m\n`;
		rGeome.logstr += `factory surface: ext ${ffix(llexm * lleym)}, int ${ffix(llixm * lliym)} m2\n`;
		rGeome.logstr += `roof: triL ${ffix(roofTriLx)}, Rh ${ffix(Rh)} m, Rhyp ${ffix(Rhyp)} %\n`;
		rGeome.logstr += `roof north glass length ${ffix(tr1lBC)} m, Rhxp ${ffix(Rhxp)} %, roof south opaque ${ffix(tr1lCA)} m, Rhxsp ${ffix(Rhxsp)} %\n`;
		// step-7 : drawing of the figures
		// figTop
		const ctrFext = ctrRectangle(0, 0, llex, lley);
		const ctrFint = ctrRectangle(param.eth, param.eth, llix, lliy);
		figTop.addMainOI([ctrFext, ctrFint]);
		for (let ii = 0; ii < param.onx; ii++) {
			for (let jj = 0; jj < param.ony; jj++) {
				const pox = officeOx + ii * (param.olx + param.iwx);
				const poy = officeOy + jj * (param.oly + param.iwy);
				const ctrOext = ctrRectangle(pox, poy, param.olx, param.oly);
				const ctrOint = ctrRectangle(pox + param.ith, poy + param.ith, olix, oliy);
				figTop.addMainOI([ctrOext, ctrOint]);
			}
		}
		for (let ii = 0; ii < param.onx - 1; ii++) {
			for (let jj = 0; jj < param.ony; jj++) {
				const pox = officeOx + ii * (param.olx + param.iwx) + param.olx;
				const poy = officeOy + jj * (param.oly + param.iwy) + (param.oly - param.bw) / 2;
				const ctrBridge = ctrRectangle(pox, poy, param.iwx, param.bw);
				figTop.addMainO(ctrBridge);
			}
		}
		for (let ii = 0; ii < param.onx; ii++) {
			for (let jj = 0; jj < param.ony - 1; jj++) {
				const pox = officeOx + ii * (param.olx + param.iwx) + (param.olx - param.bw) / 2;
				const poy = officeOy + jj * (param.oly + param.iwy) + param.oly;
				const ctrBridge = ctrRectangle(pox, poy, param.bw, param.iwy);
				figTop.addMainO(ctrBridge);
			}
		}
		// figWest
		figWest.addMainO(ctrRectangle(0, -param.eth, llex, param.eth));
		figWest.addMainO(ctrRectangle(0, 0, param.eth, fh));
		figWest.addMainO(ctrRectangle(llex - param.eth, 0, param.eth, fh));
		for (let ii = 0; ii < param.onx; ii++) {
			const pox = officeOx + ii * (param.olx + param.iwx);
			figWest.addMainOI([
				ctrRectangle(pox, 0, param.olx, param.oh1),
				ctrRectangle(pox + param.ith, 0, olix, param.oh1 - param.ith)
			]);
		}
		const ctrRoof = contour(0, fh);
		for (let ii = 0; ii < param.rtn; ii++) {
			ctrRoof.addSegStrokeR(Rhx, Rh).addSegStrokeR(Rhxs, -Rh);
		}
		ctrRoof.addSegStrokeR(0, param.rth);
		for (let ii = 0; ii < param.rtn; ii++) {
			ctrRoof.addSegStrokeR(-Rhxs, Rh).addSegStrokeR(-Rhx, -Rh);
		}
		ctrRoof.closeSegStroke();
		figWest.addMainO(ctrRoof);
		// final figure list
		rGeome.fig = {
			faceTop: figTop,
			faceWest: figWest
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_top`,
					face: `${designName}_faceTop`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: fh,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: [`subpax_${designName}_top`]
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
