// plugTorque.ts
// plugable torque transmission

import type {
	tContour,
	//tOuterInner,
	tParamDef,
	tParamVal,
	tGeom,
	tPageDef
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	//withinZeroPi,
	//ShapePoint,
	point,
	//contour,
	contourCircle,
	//ctrRectangle,
	figure,
	//degToRad,
	radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrL } from 'triangule';

const pDef: tParamDef = {
	partName: 'plugTorque',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('Nt', 'teeth', 8, 1, 1000, 1),
		pNumber('Dt', 'mm', 20, 0.1, 1000, 0.1),
		pNumber('Th', 'mm', 1, 0.1, 100, 0.1),
		pDropdown('make3D', ['both', 'intern', 'extern']),
		pSectionSeparator('Tooth profile'),
		pNumber('ati', '%', 50, 1, 99, 0.1),
		pNumber('ate', '%', 50, 1, 99, 1),
		pNumber('ah', '%', 100, 1, 400, 1),
		pNumber('dh', '%', 100, 1, 400, 1),
		pNumber('aeh', '%', 10, 0, 100, 1),
		pNumber('deh', '%', 10, 0, 100, 1),
		pNumber('aM', 'degree', 0, -30, 30, 0.1),
		pSectionSeparator('Tooth profile details'),
		pDropdown('SnAai', ['stroke', 'arc']),
		pDropdown('SnAae', ['stroke', 'arc']),
		pDropdown('SnAdi', ['stroke', 'arc']),
		pDropdown('SnAde', ['stroke', 'arc']),
		pNumber('Rai', 'mm', 1, 0.1, 50, 0.1),
		pNumber('Rae', 'mm', 1, 0.1, 50, 0.1),
		pNumber('Rdi', 'mm', 1, 0.1, 50, 0.1),
		pNumber('Rde', 'mm', 1, 0.1, 50, 0.1),
		pSectionSeparator('Internal part'),
		pNumber('Ni', 'holes', 5, 0, 1000, 1),
		pNumber('Di', 'mm', 10, 0.1, 1000, 0.1),
		pNumber('DTi', 'mm', 3, 0.1, 100, 0.1),
		pNumber('Ei', 'mm', 2, 0.1, 100, 0.1),
		pSectionSeparator('External part'),
		pNumber('Ne', 'holes', 8, 0, 1000, 1),
		pNumber('De', 'mm', 50, 0.1, 1000, 0.1),
		pNumber('DTe', 'mm', 3, 0.1, 100, 0.1),
		pNumber('Ee', 'mm', 2, 0.1, 100, 0.1)
	],
	paramSvg: {
		Nt: 'plugTorque_teeth_radial.svg',
		Dt: 'plugTorque_teeth_radial.svg',
		Th: 'plugTorque_parts.svg',
		make3D: 'plugTorque_parts.svg',
		ati: 'plugTorque_teeth_radial.svg',
		ate: 'plugTorque_teeth_radial.svg',
		ah: 'plugTorque_teeth_radial.svg',
		dh: 'plugTorque_teeth_radial.svg',
		aeh: 'plugTorque_teeth_radial.svg',
		deh: 'plugTorque_teeth_radial.svg',
		aM: 'plugTorque_teeth_adden.svg',
		SnAai: 'plugTorque_teeth_radial.svg',
		SnAae: 'plugTorque_teeth_radial.svg',
		SnAdi: 'plugTorque_teeth_radial.svg',
		SnAde: 'plugTorque_teeth_radial.svg',
		Rai: 'plugTorque_teeth_adden.svg',
		Rae: 'plugTorque_teeth_adden.svg',
		Rdi: 'plugTorque_teeth_deden.svg',
		Rde: 'plugTorque_teeth_deden.svg',
		Ni: 'plugTorque_parts.svg',
		Di: 'plugTorque_parts.svg',
		DTi: 'plugTorque_parts.svg',
		Ei: 'plugTorque_parts.svg',
		Ne: 'plugTorque_parts.svg',
		De: 'plugTorque_parts.svg',
		DTe: 'plugTorque_parts.svg',
		Ee: 'plugTorque_parts.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figIntern = figure();
	const figExtern = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Rt = param.Dt / 2;
		const Ri = param.Di / 2;
		const Re = param.De / 2;
		const RTi = param.DTi / 2;
		const RTe = param.DTe / 2;
		const RminI = Ri - RTi - param.Ei;
		const RmaxE = Re + RTe + param.Ee;
		const adTi = param.Ni > 0 ? (2 * Math.PI) / param.Ni : 3.14;
		const adTe = param.Ne > 0 ? (2 * Math.PI) / param.Ne : 3.14;
		const aMindTi = Math.asin((RTi + 0.3 * param.Ei) / Ri);
		const aMindTe = Math.asin((RTe + 0.3 * param.Ee) / Re);
		// step-5 : checks on the parameter values
		if (RminI < 0.1) {
			throw `err087: RminI ${RminI} is too small because of Di ${param.Di}, DTi ${param.DTi} or Ei ${param.Ei}`;
		}
		if (adTi < 2 * aMindTi) {
			throw `err131: adTi ${ffix(radToDeg(adTi))} is too small compare to aMindTi ${ffix(radToDeg(aMindTi))} degree`;
		}
		if (adTe < 2 * aMindTe) {
			throw `err134: adTe ${ffix(radToDeg(adTe))} is too small compare to aMindTe ${ffix(radToDeg(aMindTe))} degree`;
		}
		// step-6 : any logs
		rGeome.logstr += `Extern: Dmax ${ffix(2 * RmaxE)}, Dmin mm\n`;
		rGeome.logstr += `Intern: Dmax, Dmin ${ffix(2 * RminI)} mm\n`;
		// sub-function
		// Intern
		const ctrsI: tContour[] = [];
		ctrsI.push(contourCircle(0, 0, RminI));
		for (let ii = 0; ii < param.Ni; ii++) {
			const p1 = point(0, 0).translatePolar(ii * adTi, Ri);
			ctrsI.push(contourCircle(p1.cx, p1.cy, RTi));
		}
		// Extern
		const ctrsE: tContour[] = [];
		ctrsE.push(contourCircle(0, 0, RmaxE));
		for (let ii = 0; ii < param.Ne; ii++) {
			const p1 = point(0, 0).translatePolar(ii * adTe, Re);
			ctrsE.push(contourCircle(p1.cx, p1.cy, RTe));
		}
		// figIntern
		figIntern.addMainOI([contourCircle(0, 0, Rt), ...ctrsI]);
		// figExtern
		figIntern.addMainOI([...ctrsE, contourCircle(0, 0, Rt)]);
		// final figure list
		rGeome.fig = {
			faceIntern: figIntern,
			faceExtern: figExtern
		};
		// volume
		const designName = rGeome.partName;
		const nameSubpaxIntern = `subpax_${designName}_intern`;
		const nameSubpaxExtern = `subpax_${designName}_extern`;
		const nameList: string[] = [];
		switch (param.make3D) {
			case 1:
				nameList.push(nameSubpaxIntern);
				break;
			case 2:
				nameList.push(nameSubpaxExtern);
				break;
			default:
				nameList.push(nameSubpaxIntern);
				nameList.push(nameSubpaxExtern);
				break;
		}
		rGeome.vol = {
			extrudes: [
				{
					outName: nameSubpaxIntern,
					face: `${designName}_faceIntern`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.Th,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: nameSubpaxExtern,
					face: `${designName}_faceExtern`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.Th,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eUnion,
					inList: nameList
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'plugTorque drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const plugTorqueDef: tPageDef = {
	pTitle: 'plugTorque',
	pDescription: 'plugable torque transmission',
	pDef: pDef,
	pGeom: pGeom
};

export { plugTorqueDef };
