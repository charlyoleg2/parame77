// factory.ts
// a scalable factory-plan

// step-1 : import from geometrix
import type {
	//Contour,
	tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef,
	tVec3,
	tExtrude
	//tVolume
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
		pNumber('oh1', 'mm', 3000, 2000, 5000, 10),
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
		pNumber('fwx1', 'mm', 600, 10, 5000, 10),
		pNumber('fwx2', 'mm', 1000, 10, 5000, 10),
		pNumber('fwh1', 'mm', 1000, 10, 5000, 10),
		pNumber('fwh2', 'mm', 1000, 10, 5000, 10),
		pNumber('fwh3', 'mm', 200, 10, 5000, 10),
		pNumber('fdx1', 'mm', 1000, 10, 5000, 10),
		pNumber('fdx2', 'mm', 1000, 10, 5000, 10),
		pNumber('fdh2', 'mm', 2000, 10, 5000, 10),
		pNumber('fdh3', 'mm', 200, 10, 5000, 10),
		pSectionSeparator('Openings in 3D'),
		pCheckbox('d3_roof', true),
		pCheckbox('d3_wall', false),
		pCheckbox('d3_ground', false),
		pCheckbox('d3_officeCeiling', true),
		pCheckbox('d3_bridge', true)
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
		d3_roof: 'factory_top.svg',
		d3_wall: 'factory_top.svg',
		d3_ground: 'factory_top.svg',
		d3_officeCeiling: 'factory_top.svg',
		d3_bridge: 'factory_top.svg'
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
	const figNorth = figure();
	const figRoof = figure();
	const figGround = figure();
	const figWallEW = figure();
	const figWallNS = figure();
	const figOCeiling = figure();
	const figOWallF = figure();
	const figOWallB = figure();
	const figOWallS = figure();
	const figOWallTop = figure();
	const figBridgeW = figure();
	const figBridgeN = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const pi2 = Math.PI / 2;
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
		// offices
		let ofN = param.ony;
		let ofW = param.oly;
		let ofiw = param.iwy;
		let ofew = param.ewy;
		let osN = param.onx;
		let osW = param.olx;
		let osiw = param.iwx;
		let osew = param.ewx;
		if (param.officeOrientation > 2) {
			ofN = param.onx;
			ofW = param.olx;
			ofiw = param.iwx;
			ofew = param.ewx;
			osN = param.ony;
			osW = param.oly;
			osiw = param.iwy;
			osew = param.ewy;
		}
		if (param.officeOrientation > 5) {
			throw `err189: officeOrientation ${param.officeOrientation} is out of range`;
		}
		const ofWmin = 2 * param.ith + param.fwx1 + param.fwx2 + param.fdx1 + param.fdx2;
		const ofHmin1 = param.ith + param.fwh1 + param.fwh2 + param.fwh3;
		const ofHmin2 = param.ith + param.fdh1 + param.fdh2;
		const osWmin = 2 * param.ith + param.swx1 + param.swx2;
		const osHmin = param.ith + param.swh1 + param.swh2 + param.swh3;
		// office wall positions
		const Xidx = [...Array(param.onx).keys()];
		const owpN = Xidx.map((ii) => param.eth + param.ewx + ii * (param.olx + param.iwx));
		const owpS = Xidx.map(
			(ii) => param.eth + param.ewx + ii * (param.olx + param.iwx) + param.olx - param.ith
		);
		const Yidx = [...Array(param.ony).keys()];
		const owpW = Yidx.map((ii) => param.eth + param.ewy + ii * (param.oly + param.iwy));
		const owpE = Yidx.map(
			(ii) => param.eth + param.ewy + ii * (param.oly + param.iwy) + param.oly - param.ith
		);
		//if (param.officeOrientation == 0) // xdw : X-down
		let powF = owpN;
		let powB = owpS;
		let powS1 = owpW;
		let powS2 = owpE;
		let powFBmin = owpN;
		if (param.officeOrientation == 1) {
			// xup : X-up
			powF = owpS;
			powB = owpN;
		} else if (param.officeOrientation == 2) {
			// xal : X-alternatif
			powF = Xidx.map((ii) => (ii % 2 === 0 ? owpS[ii] : owpN[ii]));
			powB = Xidx.map((ii) => (ii % 2 === 0 ? owpN[ii] : owpS[ii]));
		} else if (param.officeOrientation == 3) {
			// ydw : Y-down
			powF = owpW;
			powB = owpE;
		} else if (param.officeOrientation == 4) {
			// yup : Y-up
			powF = owpE;
			powB = owpW;
		} else if (param.officeOrientation == 5) {
			// yal : Y-alternatif
			powF = Yidx.map((ii) => (ii % 2 === 0 ? owpE[ii] : owpW[ii]));
			powB = Yidx.map((ii) => (ii % 2 === 0 ? owpW[ii] : owpE[ii]));
		}
		if (param.officeOrientation > 2) {
			powS1 = owpN;
			powS2 = owpS;
			powFBmin = owpW;
		}
		const powS = [...powS1, ...powS2];
		// bridge positions
		const Xidx2 = [...Array(param.onx - 1).keys()];
		const Yidx2 = [...Array(param.ony - 1).keys()];
		const brxx = Xidx2.map(
			(ii) => param.eth + param.ewx + param.olx + ii * (param.olx + param.iwx)
		);
		const bryy = Yidx2.map(
			(ii) => param.eth + param.ewy + param.oly + ii * (param.oly + param.iwy)
		);
		const brdx = (param.olx - param.bw) / 2;
		const brdy = (param.oly - param.bw) / 2;
		const brxy = Yidx.map((ii) => param.eth + param.ewy + brdy + ii * (param.oly + param.iwy));
		const bryx = Xidx.map((ii) => param.eth + param.ewx + brdx + ii * (param.olx + param.iwx));
		const iwx2 = param.iwx / 2;
		const iwy2 = param.iwy / 2;
		const brxh = param.ith + iwx2;
		const bryh = param.ith + iwy2;
		// step-5 : checks on the parameter values
		if (olix < 0) {
			throw `err158: olix ${ffix(olix)} is too small compare to ith ${param.ith}`;
		}
		if (oliy < 0) {
			throw `err161: oliy ${ffix(oliy)} is too small compare to ith ${param.ith}`;
		}
		if (ofW < ofWmin) {
			throw `err201: ofW ${ofW} is too small compare to fwx1 ${param.fwx1}, fwx2 ${param.fwx2}, fdx1 ${param.fdx1}, fdx2 ${param.fdx2}`;
		}
		if (param.oh1 < ofHmin1) {
			throw `err204: oh1 ${param.oh1} is too small compare to fwh1 ${param.fwh1}, fwh2 ${param.fwh2}, fwh3 ${param.fwh3}`;
		}
		if (param.oh1 < ofHmin2) {
			throw `err207: oh1 ${param.oh1} is too small compare to fdh1 ${param.fdh1}, fdh2 ${param.fdh2}`;
		}
		if (osW < osWmin) {
			throw `err210: osW ${osW} is too small compare to swx1 ${param.swx1} and swx2 ${param.swx2}`;
		}
		if (param.oh1 < osHmin) {
			throw `err213: oh1 ${param.oh1} is too small compare to swh1 ${param.swh1}, swh2 ${param.swh2}, swh3 ${param.swh3}`;
		}
		if (param.fwx2 < 2 * param.fwh3) {
			throw `err213: fwh3 ${param.fwh3} is too large compare to fwx2 ${param.fwx2}`;
		}
		if (param.fdx2 < 2 * param.fdh3) {
			throw `err219: fdh3 ${param.fdh3} is too large compare to fdx2 ${param.fdx2}`;
		}
		if (param.swx2 < 2 * param.swh3) {
			throw `err222: swh3 ${param.swh3} is too large compare to swx2 ${param.swx2}`;
		}
		if (Math.min(param.olx, param.oly) < param.bw) {
			throw `err172: bw ${param.bw} is too large compare to olx ${param.olx} or oly ${param.oly}`;
		}
		// step-6 : any logs
		rGeome.logstr += `factory size: llex ${ffix(llexm)} x lley ${ffix(lleym)} m\n`;
		rGeome.logstr += `factory surface: ext ${ffix(llexm * lleym)}, int ${ffix(llixm * lliym)} m2\n`;
		rGeome.logstr += `roof: triL ${ffix(roofTriLx)}, Rh ${ffix(Rh)} mm, Rhyp ${ffix(Rhyp)} %\n`;
		rGeome.logstr += `roof north glass length ${ffix(tr1lBC)} mm, Rhxp ${ffix(Rhxp)} %, roof south opaque ${ffix(tr1lCA)} mm, Rhxsp ${ffix(Rhxsp)} %\n`;
		// step-7 : drawing of the figures
		// office walls
		const ctrOfficeBack: tContour[] = [];
		const ctrOfficeFront: tContour[] = [];
		const ctrOfficeFrontW: tContour[] = [];
		for (let ii = 0; ii < ofN; ii++) {
			const ox = param.eth + ofew + ii * (ofW + ofiw);
			const dox = param.ith + param.fwx1 + param.fwx2 + param.fdx1;
			const dr = ofW - dox - param.fdx2;
			const ctrOB = ctrRectangle(ox, 0, ofW, param.oh1);
			const ctrOF = contour(ox, 0)
				.addSegStrokeR(dox, 0)
				.addSegStrokeR(0, param.fdh2)
				.addPointR(param.fdx2 / 2, param.fdh3)
				.addPointR(param.fdx2, 0)
				.addSegArc2()
				.addSegStrokeR(0, -param.fdh2)
				.addSegStrokeR(dr, 0)
				.addSegStrokeR(0, param.oh1)
				.addSegStrokeR(-ofW, 0)
				.closeSegStroke();
			const ctrOFW = contour(ox + param.ith + param.fwx1, param.fwh1)
				.addSegStrokeR(param.fwx2, 0)
				.addSegStrokeR(0, param.fwh2)
				.addPointR(-param.fwx2 / 2, param.fwh3)
				.addPointR(-param.fwx2, 0)
				.addSegArc2()
				.closeSegStroke();
			ctrOfficeBack.push(ctrOB);
			ctrOfficeFront.push(ctrOF);
			ctrOfficeFrontW.push(ctrOFW);
		}
		const ctrOfficeSide: tContour[] = [];
		const ctrOfficeSideW: tContour[] = [];
		for (let ii = 0; ii < osN; ii++) {
			const ox = param.eth + osew + ii * (osW + osiw);
			const ctrOS = ctrRectangle(ox, 0, osW, param.oh1);
			const ctrOSW = contour(ox + param.ith + param.swx1, param.swh1)
				.addSegStrokeR(param.swx2, 0)
				.addSegStrokeR(0, param.swh2)
				.addPointR(-param.swx2 / 2, param.swh3)
				.addPointR(-param.swx2, 0)
				.addSegArc2()
				.closeSegStroke();
			ctrOfficeSide.push(ctrOS);
			ctrOfficeSideW.push(ctrOSW);
		}
		const ctrOfficeCeiling: tContour[] = [];
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
				ctrOfficeCeiling.push(ctrOext);
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
		const ctrWallEW = contour(0, 0).addSegStrokeR(llex, 0).addSegStrokeR(0, fh);
		for (let ii = 0; ii < param.rtn; ii++) {
			ctrWallEW.addSegStrokeR(-Rhxs, Rh).addSegStrokeR(-Rhx, -Rh);
		}
		ctrWallEW.closeSegStroke();
		figWest.addMainO(ctrWallEW);
		// figNorth
		figNorth.addMainO(ctrRectangle(0, -param.eth, lley, param.eth));
		figNorth.addMainO(ctrRectangle(0, 0, param.eth, fh));
		figNorth.addMainO(ctrRectangle(lley - param.eth, 0, param.eth, fh));
		for (let ii = 0; ii < param.ony; ii++) {
			const poy = officeOy + ii * (param.oly + param.iwy);
			figNorth.addMainOI([
				ctrRectangle(poy, 0, param.oly, param.oh1),
				ctrRectangle(poy + param.ith, 0, oliy, param.oh1 - param.ith)
			]);
		}
		figNorth.addMainOI([
			ctrRectangle(0, fh, lley, Rh + param.rth),
			ctrRectangle(0, fh, lley, param.rth),
			ctrRectangle(0, fh + Rh, lley, param.rth)
		]);
		const ctrWallNS = ctrRectangle(0, 0, lley, fh);
		figNorth.addMainO(ctrWallNS);
		// adding office walls
		if (param.officeOrientation < 3) {
			for (let ii = 0; ii < ofN; ii++) {
				figNorth.addMainOI([ctrOfficeFront[ii], ctrOfficeFrontW[ii]]);
				figNorth.addMainO(ctrOfficeBack[ii]);
			}
			for (let ii = 0; ii < osN; ii++) {
				figWest.addMainOI([ctrOfficeSide[ii], ctrOfficeSideW[ii]]);
			}
		} else {
			for (let ii = 0; ii < ofN; ii++) {
				figWest.addMainOI([ctrOfficeFront[ii], ctrOfficeFrontW[ii]]);
				figWest.addMainO(ctrOfficeBack[ii]);
			}
			for (let ii = 0; ii < osN; ii++) {
				figNorth.addMainOI([ctrOfficeSide[ii], ctrOfficeSideW[ii]]);
			}
		}
		// figRoof
		figRoof.mergeFigure(figWest, true);
		figRoof.addMainO(ctrRoof);
		// figGround
		figGround.mergeFigure(figTop, true);
		figGround.addMainO(ctrFext);
		// figWallEW
		figWallEW.mergeFigure(figWest, true);
		figWallEW.addMainO(ctrWallEW);
		// figWallNS
		figWallNS.mergeFigure(figNorth, true);
		figWallNS.addMainO(ctrWallNS);
		// figOCeiling
		figOCeiling.mergeFigure(figTop, true);
		for (const iCtr of ctrOfficeCeiling) {
			figOCeiling.addMainO(iCtr);
		}
		// figOWallF, figOWallB, figOWallS
		if (param.officeOrientation < 3) {
			figOWallF.mergeFigure(figNorth, true);
			figOWallB.mergeFigure(figNorth, true);
			figOWallS.mergeFigure(figWest, true);
		} else {
			figOWallF.mergeFigure(figWest, true);
			figOWallB.mergeFigure(figWest, true);
			figOWallS.mergeFigure(figNorth, true);
		}
		for (let ii = 0; ii < ofN; ii++) {
			figOWallF.addMainOI([ctrOfficeFront[ii], ctrOfficeFrontW[ii]]);
			figOWallB.addMainO(ctrOfficeBack[ii]);
		}
		for (let ii = 0; ii < osN; ii++) {
			figOWallS.addMainOI([ctrOfficeSide[ii], ctrOfficeSideW[ii]]);
		}
		// figOWallTop
		for (const iPosX of powF) {
			for (const iPosY of powS1) {
				figOWallTop.addMainO(ctrRectangle(iPosX, iPosY, param.ith, ofW));
			}
		}
		for (const iPosX of powB) {
			for (const iPosY of powS1) {
				figOWallTop.addSecond(ctrRectangle(iPosX, iPosY, param.ith, ofW));
			}
		}
		for (const iPosY of powS) {
			for (const iPosX of powFBmin) {
				figOWallTop.addSecond(ctrRectangle(iPosX, iPosY, osW, param.ith));
			}
		}
		// figBridgeW
		figBridgeW.mergeFigure(figWest, true);
		for (const ox of brxx) {
			const ctr = contour(ox, param.oh1)
				.addSegStrokeR(0, -brxh)
				.addPointR(iwx2, iwx2)
				.addPointR(2 * iwx2, 0)
				.addSegArc2()
				.addSegStrokeR(0, brxh)
				.closeSegStroke();
			figBridgeW.addMainO(ctr);
		}
		for (const ox of bryx) {
			figBridgeW.addSecond(ctrRectangle(ox, param.oh1 - bryh, param.bw, bryh));
		}
		// figBridgeN
		figBridgeN.mergeFigure(figNorth, true);
		for (const ox of bryy) {
			const ctr = contour(ox, param.oh1)
				.addSegStrokeR(0, -bryh)
				.addPointR(iwy2, iwy2)
				.addPointR(2 * iwy2, 0)
				.addSegArc2()
				.addSegStrokeR(0, bryh)
				.closeSegStroke();
			figBridgeN.addMainO(ctr);
		}
		for (const ox of brxy) {
			figBridgeN.addSecond(ctrRectangle(ox, param.oh1 - brxh, param.bw, brxh));
		}
		// final figure list
		rGeome.fig = {
			faceTop: figTop,
			faceWest: figWest,
			faceNorth: figNorth,
			faceRoof: figRoof,
			faceGround: figGround,
			faceWallEW: figWallEW,
			faceWallNS: figWallNS,
			faceOCeiling: figOCeiling,
			faceOWallF: figOWallF,
			faceOWallB: figOWallB,
			faceOWallS: figOWallS,
			faceOWallTop: figOWallTop,
			faceBridgeW: figBridgeW,
			faceBridgeN: figBridgeN
		};
		// step-8 : recipes of the 3D construction
		const designName = rGeome.partName;
		const unionList: string[] = [];
		unionList.push(`subpax_${designName}_wallSouth`);
		unionList.push(`subpax_${designName}_wallEast`);
		if (param.d3_roof) {
			unionList.push(`subpax_${designName}_roof`);
		}
		if (param.d3_ground) {
			unionList.push(`subpax_${designName}_ground`);
		}
		if (param.d3_wall) {
			unionList.push(`subpax_${designName}_wallNorth`);
			unionList.push(`subpax_${designName}_wallWest`);
		}
		if (param.d3_officeCeiling) {
			unionList.push(`subpax_${designName}_officeCeiling`);
		}
		function rotateOfficeWall(iOfficeOrientation: number, iFrontBack: boolean): tVec3 {
			const rRotate: tVec3 = [pi2, 0, 0];
			let twoRot = iFrontBack;
			if (iOfficeOrientation > 2) {
				twoRot = !twoRot;
			}
			if (twoRot) {
				rRotate[2] = pi2;
			}
			return rRotate;
		}
		function translateOfficeWall(iOO: number, iPos: number, iTh: number, iFB: boolean): tVec3 {
			const rTranslate: tVec3 = [0, 0, 0];
			let trans1 = iFB;
			if (iOO > 2) {
				trans1 = !trans1;
			}
			if (trans1) {
				rTranslate[0] = iPos;
			} else {
				rTranslate[1] = iPos + iTh;
			}
			return rTranslate;
		}
		const volOWF = powF.map((iPos, idx) => {
			const rVol: tExtrude = {
				outName: `subpax_${designName}_OWF${idx}`,
				face: `${designName}_faceOWallF`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.ith,
				rotate: rotateOfficeWall(param.officeOrientation, true),
				translate: translateOfficeWall(param.officeOrientation, iPos, param.ith, true)
			};
			return rVol;
		});
		unionList.push(...powF.map((iPos, idx) => `subpax_${designName}_OWF${idx}`));
		const volOWB = powB.map((iPos, idx) => {
			const rVol: tExtrude = {
				outName: `subpax_${designName}_OWB${idx}`,
				face: `${designName}_faceOWallB`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.ith,
				rotate: rotateOfficeWall(param.officeOrientation, true),
				translate: translateOfficeWall(param.officeOrientation, iPos, param.ith, true)
			};
			return rVol;
		});
		unionList.push(...powB.map((iPos, idx) => `subpax_${designName}_OWB${idx}`));
		const volOWS = powS.map((iPos, idx) => {
			const rVol: tExtrude = {
				outName: `subpax_${designName}_OWS${idx}`,
				face: `${designName}_faceOWallS`,
				extrudeMethod: EExtrude.eLinearOrtho,
				length: param.ith,
				rotate: rotateOfficeWall(param.officeOrientation, false),
				translate: translateOfficeWall(param.officeOrientation, iPos, param.ith, false)
			};
			return rVol;
		});
		unionList.push(...powS.map((iPos, idx) => `subpax_${designName}_OWS${idx}`));
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_ground`,
					face: `${designName}_faceGround`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.eth,
					rotate: [0, 0, 0],
					translate: [0, 0, -param.eth]
				},
				{
					outName: `subpax_${designName}_roof`,
					face: `${designName}_faceRoof`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: lley,
					rotate: [pi2, 0, 0],
					translate: [0, lley, 0]
				},
				{
					outName: `subpax_${designName}_wallNorth`,
					face: `${designName}_faceWallNS`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.eth,
					rotate: [pi2, 0, pi2],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_wallSouth`,
					face: `${designName}_faceWallNS`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.eth,
					rotate: [pi2, 0, pi2],
					translate: [param.eth + llix, 0, 0]
				},
				{
					outName: `subpax_${designName}_wallWest`,
					face: `${designName}_faceWallEW`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.eth,
					rotate: [pi2, 0, 0],
					translate: [0, param.eth, 0]
				},
				{
					outName: `subpax_${designName}_wallEast`,
					face: `${designName}_faceWallEW`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.eth,
					rotate: [pi2, 0, 0],
					translate: [0, 2 * param.eth + lliy, 0]
				},
				{
					outName: `subpax_${designName}_officeCeiling`,
					face: `${designName}_faceOCeiling`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.ith,
					rotate: [0, 0, 0],
					translate: [0, 0, param.oh1 - param.ith]
				},
				...volOWF,
				...volOWB,
				...volOWS
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: unionList
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
