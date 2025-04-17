// springTorqueA.ts
// a spring disc for torque transmission

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
	contour,
	contourCircle,
	//ctrRectangle,
	figure,
	//degToRad,
	radToDeg,
	ffix,
	pNumber,
	pCheckbox,
	//pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
//import { triALLrL } from 'triangule';

const pDef: tParamDef = {
	partName: 'springTorqueA',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('D1', 'mm', 20, 1, 1000, 1),
		pNumber('N1', 'hole', 16, 0, 400, 1),
		pNumber('T1', 'mm', 2, 0.1, 50, 0.1),
		pNumber('E1', 'mm', 1, 0.1, 50, 0.1),
		pSectionSeparator('External ring'),
		pCheckbox('Ring2', true),
		pNumber('D2', 'mm', 80, 1, 1000, 1),
		pNumber('N2', 'hole', 16, 0, 400, 1),
		pNumber('T2', 'mm', 2, 0.1, 50, 0.1),
		pNumber('E2', 'mm', 1, 0.1, 50, 0.1),
		pSectionSeparator('Spoke'),
		pNumber('N3', 'spoke', 5, 0, 60, 1),
		pNumber('E3', 'mm', 3, 0.1, 100, 0.1),
		pNumber('R3', 'mm', 3, 0, 100, 0.1),
		pNumber('Th', 'mm', 3, 0.1, 100, 0.1)
	],
	paramSvg: {
		D1: 'springTorqueA_profile.svg',
		N1: 'springTorqueA_profile.svg',
		T1: 'springTorqueA_profile.svg',
		E1: 'springTorqueA_profile.svg',
		Ring2: 'springTorqueA_profile.svg',
		D2: 'springTorqueA_profile.svg',
		N2: 'springTorqueA_profile.svg',
		T2: 'springTorqueA_profile.svg',
		E2: 'springTorqueA_profile.svg',
		N3: 'springTorqueA_profile.svg',
		E3: 'springTorqueA_profile.svg',
		R3: 'springTorqueA_profile.svg',
		Th: 'springTorqueA_profile.svg'
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
		const R1 = param.D1 / 2;
		const RT1 = param.T1 / 2;
		const R2 = param.D2 / 2;
		const RT2 = param.T2 / 2;
		const Rmax = param.Ring2 ? R2 + RT2 + param.E2 : R1 + RT1 + param.E1;
		const Rmin = R1 - RT1 - param.E1;
		const Rh1 = R1 + RT1 + param.E1;
		const Rh2 = R2 - RT2 - param.E2;
		const E32 = param.E3 / 2;
		// step-5 : checks on the parameter values
		if (Rh1 + 2 * param.R3 > Rh2) {
			throw `err087: D2 ${param.D2} is too small compare to D1 ${param.D1}, R3 ${param.R3}`;
		}
		if (Rmin < 0.1) {
			throw `err093: D1 ${param.D1} is too small compare to T1 ${param.T1}, E1 ${param.E1}`;
		}
		// step-5.1 : further calculation
		const aIntMin = 2 * Math.asin((RT1 + 0.5 * param.E1) / R1);
		const aInt = param.N1 > 0 ? (2 * Math.PI) / param.N1 : 3.14;
		if (aInt < aIntMin) {
			throw `err101: aInt ${ffix(radToDeg(aInt))} is too small compare to aIntMin ${ffix(radToDeg(aIntMin))} degree`;
		}
		const aExtMin = 2 * Math.asin((RT2 + 0.5 * param.E2) / R2);
		const aExt = param.N2 > 0 ? (2 * Math.PI) / param.N2 : 3.14;
		if (aExt < aExtMin) {
			throw `err106: aExt ${ffix(radToDeg(aExt))} is too small compare to aExtMin ${ffix(radToDeg(aExtMin))} degree`;
		}
		const ah2 = Math.asin(E32 / Rh2);
		const ah1 = Math.asin(E32 / Rh1);
		const ahR1 = Math.asin((E32 + param.R3) / (param.R3 + Rh1));
		const ah0 = param.N3 > 0 ? (2 * Math.PI) / param.N3 : 3.14;
		const sinah02 = Math.sin(ah0 / 2);
		const Rh1b = sinah02 > 0 ? E32 / sinah02 : Rh1 / 2;
		const hollowTriangle = Rh1b - 0.1 > Rh1b ? true : false;
		if (!hollowTriangle && ah0 < 2 * (ah1 + ahR1)) {
			throw `err115: ah0 ${ffix(radToDeg(ah0))} is too small compare to ah1 ${ffix(radToDeg(ah1))}, ahR1 ${ffix(radToDeg(ahR1))} degree`;
		}
		// step-6 : any logs
		rGeome.logstr += `Dmax ${ffix(2 * Rmax)}, Dmin ${ffix(2 * Rmin)} mm\n`;
		// sub-function
		// figProfile
		const ctrExt = contourCircle(0, 0, Rmax);
		const ctrInt = contourCircle(0, 0, Rmin);
		const ctrsIntHoles: tContour[] = [];
		for (let ii = 0; ii < param.N1; ii++) {
			const p1 = point(0, 0).translatePolar(ii * aInt, R1);
			ctrsIntHoles.push(contourCircle(p1.cx, p1.cy, RT1));
		}
		const ctrsExtHoles: tContour[] = [];
		const ctrsHollow: tContour[] = [];
		if (param.Ring2) {
			for (let ii = 0; ii < param.N2; ii++) {
				const p1 = point(0, 0).translatePolar(ii * aExt, R2);
				ctrsExtHoles.push(contourCircle(p1.cx, p1.cy, RT2));
			}
			for (let ii = 0; ii < param.N3; ii++) {
				const aRef = ii * ah0;
				const p1 = point(0, 0).translatePolar(aRef + ah1, Rh1);
				const p1b = point(0, 0).translatePolar(aRef + ah0 / 2, Rh1b);
				const [x0, y0] = hollowTriangle ? [p1b.cx, p1b.cy] : [p1.cx, p1.cy];
				const iCtr = contour(x0, y0)
					.addCornerRounded(param.R3)
					.addSegStrokeAP(aRef + ah2, Rh2)
					.addCornerRounded(param.R3)
					.addPointAP(aRef + ah0 / 2, Rh2)
					.addPointAP(aRef + ah0 - ah2, Rh2)
					.addSegArc2()
					.addCornerRounded(param.R3);
				if (hollowTriangle) {
					iCtr.closeSegStroke();
				} else {
					iCtr.addSegStrokeAP(aRef + ah0 - ah1, Rh1)
						.addCornerRounded(param.R3)
						.addPointAP(aRef + ah0 / 2, Rh1)
						.addPointAP(aRef + ah1, Rh1)
						.addSegArc2();
				}
				ctrsHollow.push(iCtr);
			}
		}
		figProfile.addMainOI([ctrExt, ctrInt, ...ctrsIntHoles, ...ctrsExtHoles, ...ctrsHollow]);
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
		rGeome.logstr += 'springTorqueA drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const springTorqueADef: tPageDef = {
	pTitle: 'springTorqueA',
	pDescription: 'spring disc for torque transmission',
	pDef: pDef,
	pGeom: pGeom
};

export { springTorqueADef };
