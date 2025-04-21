// springTorqueB.ts
// a spring disc for smooth torque transmission

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
	pCheckbox,
	pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrL } from 'triangule';

const pDef: tParamDef = {
	partName: 'springTorqueB',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('De', 'mm', 80, 1, 1000, 1),
		pNumber('Ne', 'hole', 16, 0, 400, 1),
		pNumber('DTe', 'mm', 2, 0.1, 50, 0.1),
		pNumber('Ee', 'mm', 1, 0.1, 50, 0.1),
		pCheckbox('Teeth', true),
		pNumber('Th', 'mm', 3, 0.1, 100, 0.1),
		pSectionSeparator('Internal ring'),
		pNumber('Di', 'mm', 30, 1, 1000, 1),
		pNumber('Ni', 'hole', 8, 0, 400, 1),
		pNumber('DTi', 'mm', 2, 0.1, 50, 0.1),
		pNumber('Ei', 'mm', 1, 0.1, 50, 0.1),
		pSectionSeparator('Spring'),
		pNumber('Ns', 'spring', 6, 4, 60, 1),
		pNumber('aEs', '%', 10, 1, 90, 1),
		pNumber('Esi', '%', 10, 1, 90, 1),
		pNumber('Ese', '%', 10, 1, 90, 1),
		pNumber('Nk', 'zigzag', 3, 1, 100, 1),
		pNumber('Wk', 'mm', 1, 0.1, 20, 0.1),
		pNumber('Wc', 'mm', 1, 0.1, 20, 0.1),
		pSectionSeparator('Tooth Profile'),
		pNumber('ate', '%', 52, 1, 99, 1),
		pNumber('ah', '%', 100, 1, 400, 1),
		pNumber('dh', '%', 100, 1, 400, 1),
		pNumber('aeh', '%', 10, 0, 100, 1),
		pNumber('aM', 'degree', 0, -30, 30, 0.1),
		pSectionSeparator('Tooth profile details'),
		pDropdown('SnAae', ['stroke', 'arc']),
		pDropdown('SnAde', ['stroke', 'arc']),
		pNumber('Rae', 'mm', 1, 0, 50, 0.1),
		pNumber('Rde', 'mm', 1, 0, 50, 0.1)
	],
	paramSvg: {
		De: 'springTorqueB_profile.svg',
		Ne: 'springTorqueB_profile.svg',
		DTe: 'springTorqueB_profile.svg',
		Ee: 'springTorqueB_profile.svg',
		Teeth: 'springTorqueB_profile.svg',
		Th: 'springTorqueB_profile.svg',
		Di: 'springTorqueB_profile.svg',
		Ni: 'springTorqueB_profile.svg',
		DTi: 'springTorqueB_profile.svg',
		Ei: 'springTorqueB_profile.svg',
		Ns: 'springTorqueB_profile.svg',
		aEs: 'springTorqueB_profile.svg',
		Esi: 'springTorqueB_profile.svg',
		Ese: 'springTorqueB_profile.svg',
		Nk: 'springTorqueB_profile.svg',
		Wk: 'springTorqueB_profile.svg',
		Wc: 'springTorqueB_profile.svg',
		ate: 'plugTorque_teeth_radial.svg',
		dh: 'plugTorque_teeth_radial.svg',
		ah: 'plugTorque_teeth_radial.svg',
		aeh: 'plugTorque_teeth_radial.svg',
		aM: 'plugTorque_teeth_adden.svg',
		SnAae: 'plugTorque_teeth_radial.svg',
		SnAde: 'plugTorque_teeth_radial.svg',
		Rae: 'plugTorque_teeth_radial.svg',
		Rde: 'plugTorque_teeth_radial.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figProfile = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const Re = param.De / 2;
		const RTe = param.DTe / 2;
		const Ri = param.Di / 2;
		const RTi = param.DTi / 2;
		const Rmax = Re + RTe + param.Ee;
		const Rmin1 = Ri - RTi - param.Ei;
		const Rse = Re - RTe - param.Ee;
		const Rsi = Ri + RTi + param.Ei;
		const dRs = Rse - Rsi;
		const Esi = (dRs * param.Esi) / 100;
		const Ese = (dRs * param.Ese) / 100;
		const dRLs = dRs - Esi - Ese;
		const aSpringStep = (2 * Math.PI) / param.Ns;
		const aEs = (aSpringStep * param.aEs) / 100;
		const aSpring = aSpringStep - aEs;
		const HLs = (Rse - Ese) * Math.cos(aSpring);
		const iHLs = HLs / (2 * param.Nk);
		const Rk = iHLs / 2;
		const Ek = iHLs - param.Wk;
		// step-5 : checks on the parameter values
		if (Rmin1 < 0.1) {
			throw `err120: Di ${param.Di} is too small compare to DTi ${param.DTi}, Ei ${param.Ei}`;
		}
		if (dRLs < 2 * param.Ws) {
			throw `err133: dRLs ${dRLs} is too small compare to Ws ${param.Ws}`;
		}
		if (Esi < 0.6 * param.Ws) {
			throw `err136: Esi ${Esi} is too small compare to Ws ${param.Ws}`;
		}
		if (Ese < 0.6 * param.Ws) {
			throw `err139: Ese ${Ese} is too small compare to Ws ${param.Ws}`;
		}
		if (Ek < 0.1) {
			throw `err145: Ek ${Ek} is too small`;
		}
		if (dRLs < 2 * Rk) {
			throw `err148: dRLs ${dRLs} is too small compare to Rk ${Rk}`;
		}
		// step-5.1 : further calculation
		const aHMinI = 2 * Math.asin((RTi + 0.5 * param.Ei) / Ri);
		const aHI = param.Ni > 0 ? (2 * Math.PI) / param.Ni : 3.14;
		if (aHI < aHMinI) {
			throw `err126: aHI ${ffix(radToDeg(aHI))} is too small compare to aHMinI ${ffix(radToDeg(aHMinI))} degree`;
		}
		const aHMinE = 2 * Math.asin((RTe + 0.5 * param.Ee) / Re);
		const aHE = param.Ne > 0 ? (2 * Math.PI) / param.Ne : 3.14;
		if (aHE < aHMinE) {
			throw `err131: aHE ${ffix(radToDeg(aHE))} is too small compare to aHMinE ${ffix(radToDeg(aHMinE))} degree`;
		}
		// step-6 : any logs
		rGeome.logstr += `Dmax ${ffix(2 * Rmax)}, Dmin ${ffix(2 * Rmin1)} mm\n`;
		rGeome.logstr += `Spring area: aSpring ${ffix(radToDeg(aSpring))} degree, dRLs ${ffix(dRLs)}, HLs ${ffix(HLs)} mm\n`;
		rGeome.logstr += `Spring zigzag: Ek ${ffix(Ek)}, Rk ${ffix(Rk)} mm\n`;
		// sub-function
		// figProfile
		const ctrExt = contourCircle(0, 0, Rmax);
		const ctrsH: tContour[] = [];
		ctrsH.push(contourCircle(0, 0, Rmin1));
		for (let ii = 0; ii < param.Ni; ii++) {
			const p1 = point(0, 0).translatePolar(ii * aHI, Ri);
			ctrsH.push(contourCircle(p1.cx, p1.cy, RTi));
		}
		for (let ii = 0; ii < param.Ne; ii++) {
			const p1 = point(0, 0).translatePolar(ii * aHE, Re);
			ctrsH.push(contourCircle(p1.cx, p1.cy, RTe));
		}
		figProfile.addMainOI([ctrExt, ...ctrsH]);
		// final figure list
		rGeome.fig = {
			faceProfile: figProfile
		};
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_profile`,
					face: `${designName}_faceProfile`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.Th,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				}
			],
			volumes: [
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIdentity,
					inList: [`subpax_${designName}_profile`]
				}
			]
		};
		// sub-design
		rGeome.sub = {};
		// finalize
		rGeome.logstr += 'springTorqueB drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const springTorqueBDef: tPageDef = {
	pTitle: 'springTorqueB',
	pDescription: 'spring disc for smooth torque transmission',
	pDef: pDef,
	pGeom: pGeom
};

export { springTorqueBDef };
