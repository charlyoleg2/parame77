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
	withinPiPi,
	//ShapePoint,
	point,
	contour,
	contourCircle,
	//ctrRectangle,
	figure,
	degToRad,
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
import { triALLrLAA } from 'triangule';
import { ctrPlugExtern } from './libPlugTorque';

const pDef: tParamDef = {
	partName: 'plugTorque',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('Nt', 'teeth', 8, 1, 1000, 1),
		pNumber('Dt', 'mm', 22, 0.1, 1000, 0.1),
		pNumber('Ht', 'mm', 2, 0.1, 100, 0.1),
		pNumber('Th', 'mm', 1, 0.1, 100, 0.1),
		pDropdown('make3D', ['both', 'intern', 'extern']),
		pSectionSeparator('Tooth profile'),
		pNumber('ati', '%', 50, 1, 99, 0.1),
		pNumber('ate', '%', 52, 1, 99, 1),
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
		pNumber('Rai', 'mm', 1, 0, 50, 0.1),
		pNumber('Rae', 'mm', 1, 0, 50, 0.1),
		pNumber('Rdi', 'mm', 1, 0, 50, 0.1),
		pNumber('Rde', 'mm', 1, 0, 50, 0.1),
		pSectionSeparator('Internal part'),
		pNumber('Ni', 'holes', 5, 0, 1000, 1),
		pNumber('Di', 'mm', 12, 0.1, 1000, 0.1),
		pNumber('DTi', 'mm', 3, 0.1, 100, 0.1),
		pNumber('Ei', 'mm', 1, 0.1, 100, 0.1),
		pSectionSeparator('External part'),
		pNumber('Ne', 'holes', 8, 0, 1000, 1),
		pNumber('De', 'mm', 32, 0.1, 1000, 0.1),
		pNumber('DTe', 'mm', 3, 0.1, 100, 0.1),
		pNumber('Ee', 'mm', 1, 0.1, 100, 0.1)
	],
	paramSvg: {
		Nt: 'plugTorque_teeth_radial.svg',
		Dt: 'plugTorque_teeth_radial.svg',
		Ht: 'plugTorque_teeth_radial.svg',
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
		const aM = degToRad(param.aM);
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
		const moduli = param.Dt / param.Nt;
		const aTooth = (2 * Math.PI) / param.Nt;
		const aAddenI = (param.ati * aTooth) / 100;
		const aAddenE = (param.ate * aTooth) / 100;
		const Htai = (param.Ht * param.ah) / 100;
		const Htdi = (param.Ht * (param.dh + param.deh)) / 100;
		const RmaxI = Rt + Htai;
		const RbI = Rt - Htdi;
		const Htde = (param.Ht * param.dh) / 100;
		const Htae = (param.Ht * (param.ah + param.aeh)) / 100;
		const RminE = Rt - Htde;
		const RbE = Rt + Htae;
		let aSlopeI = 0;
		let aSlopeE = 0;
		let aAddI = aAddenI;
		let aAddE = aAddenE;
		if (Math.abs(aM) > 0.001) {
			const tri1 = triALLrLAA(aM, Rt, RbI);
			const tri2 = triALLrLAA(withinPiPi(Math.PI + aM), Rt, RmaxI);
			const tri3 = triALLrLAA(aM, Rt, RminE);
			const tri4 = triALLrLAA(withinPiPi(Math.PI + aM), Rt, RbE);
			//const [l3a, a31a, a12a, l3b, a31b, a12b, trilog1] = tri1;
			//const [l3c, a31c, a12c, l3d, a31d, a12d, trilog2] = tri2;
			const [, , a12a, , , , trilog1] = tri1;
			const [, , , , , a12d, trilog2] = tri2;
			const [, , a12e, , , , trilog3] = tri3;
			const [, , , , , a12h, trilog4] = tri4;
			rGeome.logstr += trilog1 + trilog2 + trilog3 + trilog4;
			//rGeome.logstr += `dbg143: a31 ${ffix(aM)}, Rt ${ffix(Rt)}, RminE ${ffix(RminE)}\n`;
			//rGeome.logstr += `dbg146: l3a ${ffix(l3a)}, a31a ${ffix(a31a)}, a12a ${ffix(a12a)}, l3b ${ffix(l3b)}, a31b ${ffix(a31b)}, a12b ${ffix(a12b)}\n`;
			//rGeome.logstr += `dbg147: l3c ${ffix(l3c)}, a31c ${ffix(a31c)}, a12c ${ffix(a12c)}, l3d ${ffix(l3d)}, a31d ${ffix(a31d)}, a12d ${ffix(a12d)}\n`;
			aSlopeI = -a12a + a12d;
			aSlopeE = -a12e + a12h;
			aAddI = aAddenI - 2 * a12d;
			aAddE = aAddenE - 2 * a12h;
		}
		const aDedI = aTooth - 2 * aSlopeI - aAddI;
		const aDedE = aTooth - 2 * aSlopeE - aAddE;
		const aSlack = ((param.ate - param.ati) * aTooth) / 100;
		const RbEmax = Re - RTe - param.Ee;
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
		if (param.ati > param.ate) {
			throw `err145: ate ${param.ate} is too small compare to ati ${param.ati} %`;
		}
		if (RbI < Ri + RTi + param.Ei) {
			throw `err087: RbI ${RbI} is too small compare to Di ${param.Di}, DTi ${param.DTi} or Ei ${param.Ei}`;
		}
		if (RbE > RbEmax) {
			throw `err087: RbE ${RbE} is too large compare to De ${param.De}, DTe ${param.DTe} or Ee ${param.Ee}`;
		}
		const tooSmallAngle = 0.0001;
		if (aAddI < tooSmallAngle || aDedI < tooSmallAngle) {
			throw `err161: aAddI ${ffix(radToDeg(aAddI))} or aDedI ${ffix(radToDeg(aDedI))} are too small`;
		}
		if (aAddE < tooSmallAngle || aDedE < tooSmallAngle) {
			throw `err164: aAddE ${ffix(radToDeg(aAddE))} or aDedE ${ffix(radToDeg(aDedE))} are too small`;
		}
		// step-6 : any logs
		rGeome.logstr += `Extern: Dmax ${ffix(2 * RmaxE)}, Dmin ${ffix(2 * RminE)} mm\n`;
		rGeome.logstr += `Intern: Dmax ${ffix(2 * RmaxI)}, Dmin ${ffix(2 * RminI)} mm\n`;
		rGeome.logstr += `aSlack: ${ffix(radToDeg(aSlack))} degree\n`;
		rGeome.logstr += `Tooth: Ht ${param.Ht}, moduli ${ffix(moduli)}, Hti ${ffix(Htai + Htdi)}, Hte ${ffix(Htae + Htde)} mm\n`;
		rGeome.logstr += `Tooth angle intern: aM ${param.aM}, aM[adden] ${ffix(radToDeg(-aAddenI / 2))}, aM[deden] ${ffix(radToDeg((aTooth - aAddenI) / 2))} degree\n`;
		rGeome.logstr += `Tooth angle extern: aM ${param.aM}, aM[adden] ${ffix(radToDeg(-aAddenE / 2))}, aM[deden] ${ffix(radToDeg((aTooth - aAddenE) / 2))} degree\n`;
		// sub-function
		// Intern
		const ctrsI: tContour[] = [];
		ctrsI.push(contourCircle(0, 0, RminI));
		for (let ii = 0; ii < param.Ni; ii++) {
			const p1 = point(0, 0).translatePolar(ii * adTi, Ri);
			ctrsI.push(contourCircle(p1.cx, p1.cy, RTi));
		}
		const ctrToothI = contour(RbI, 0);
		for (let ii = 0; ii < param.Nt; ii++) {
			const aRef = ii * aTooth;
			ctrToothI.addSegStrokeAP(aRef + aSlopeI, RmaxI).addCornerRounded(param.Rai);
			if (param.SnAai === 1) {
				ctrToothI
					.addPointAP(aRef + aSlopeI + aAddI / 2, RmaxI)
					.addPointAP(aRef + aSlopeI + aAddI, RmaxI)
					.addSegArc2();
			} else {
				ctrToothI.addSegStrokeAP(aRef + aSlopeI + aAddI, RmaxI);
			}
			ctrToothI.addCornerRounded(param.Rai);
			ctrToothI.addSegStrokeAP(aRef + 2 * aSlopeI + aAddI, RbI).addCornerRounded(param.Rdi);
			if (param.SnAdi === 1) {
				ctrToothI
					.addPointAP(aRef + aTooth - aDedI / 2, RbI)
					.addPointAP(aRef + aTooth, RbI)
					.addSegArc2();
			} else {
				ctrToothI.addSegStrokeAP(aRef + aTooth, RbI);
			}
			ctrToothI.addCornerRounded(param.Rdi);
		}
		// Extern
		const ctrsE: tContour[] = [];
		ctrsE.push(contourCircle(0, 0, RmaxE));
		for (let ii = 0; ii < param.Ne; ii++) {
			const p1 = point(0, 0).translatePolar(ii * adTe, Re);
			ctrsE.push(contourCircle(p1.cx, p1.cy, RTe));
		}
		const [ctrToothE, logE] = ctrPlugExtern(param, RbEmax);
		rGeome.logstr += logE;
		// figIntern
		figIntern.addMainOI([ctrToothI, ...ctrsI]);
		figIntern.addSecond(contourCircle(0, 0, Rt));
		figIntern.addSecond(ctrToothE);
		for (const iCtr of ctrsE) {
			figIntern.addSecond(iCtr);
		}
		// figExtern
		figExtern.addMainOI([...ctrsE, ctrToothE]);
		figExtern.addSecond(contourCircle(0, 0, Rt));
		figExtern.addSecond(ctrToothI);
		for (const iCtr of ctrsI) {
			figExtern.addSecond(iCtr);
		}
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
					rotate: [0, 0, -aSlack / 2],
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
