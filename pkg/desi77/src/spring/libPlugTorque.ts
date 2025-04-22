// libPlugTorque.ts

import type {
	tContour,
	//tOuterInner,
	//tParamDef,
	tParamVal
	//tGeom,
	//tPageDef
	//tSubInst
	//tSubDesign
} from 'geometrix';
import {
	//withinZeroPi,
	withinPiPi,
	//ShapePoint,
	//point,
	contour,
	//contourCircle,
	//ctrRectangle,
	//figure,
	degToRad,
	radToDeg,
	ffix
	//pNumber,
	//pCheckbox,
	//pDropdown,
	//pSectionSeparator,
	//EExtrude,
	//EBVolume,
	//initGeom
} from 'geometrix';
//import { triLALrL, triALLrL, triLLLrA } from 'triangule';
import { triALLrLAA } from 'triangule';

function ctrPlugExtern(param: tParamVal, RbEmax: number): [tContour, string] {
	let rLog = '';
	const aM = degToRad(param.aM);
	const Rt = param.Dt / 2;
	const aTooth = (2 * Math.PI) / param.Nt;
	const aAddenE = (param.ate * aTooth) / 100;
	const Htde = (param.Ht * param.dh) / 100;
	const Htae = (param.Ht * (param.ah + param.aeh)) / 100;
	const RminE = Rt - Htde;
	const RbE = Rt + Htae;
	let aSlopeE = 0;
	let aAddE = aAddenE;
	if (Math.abs(aM) > 0.001) {
		//const tri1 = triALLrLAA(aM, Rt, RbI);
		//const tri2 = triALLrLAA(withinPiPi(Math.PI + aM), Rt, RmaxI);
		const tri3 = triALLrLAA(aM, Rt, RminE);
		const tri4 = triALLrLAA(withinPiPi(Math.PI + aM), Rt, RbE);
		//const [l3a, a31a, a12a, l3b, a31b, a12b, trilog1] = tri1;
		//const [l3c, a31c, a12c, l3d, a31d, a12d, trilog2] = tri2;
		//const [, , a12a, , , , trilog1] = tri1;
		//const [, , , , , a12d, trilog2] = tri2;
		const [, , a12e, , , , trilog3] = tri3;
		const [, , , , , a12h, trilog4] = tri4;
		//rGeome.logstr += trilog1 + trilog2 + trilog3 + trilog4;
		rLog += trilog3 + trilog4;
		//rGeome.logstr += `dbg143: a31 ${ffix(aM)}, Rt ${ffix(Rt)}, RminE ${ffix(RminE)}\n`;
		//rGeome.logstr += `dbg146: l3a ${ffix(l3a)}, a31a ${ffix(a31a)}, a12a ${ffix(a12a)}, l3b ${ffix(l3b)}, a31b ${ffix(a31b)}, a12b ${ffix(a12b)}\n`;
		//rGeome.logstr += `dbg147: l3c ${ffix(l3c)}, a31c ${ffix(a31c)}, a12c ${ffix(a12c)}, l3d ${ffix(l3d)}, a31d ${ffix(a31d)}, a12d ${ffix(a12d)}\n`;
		aSlopeE = -a12e + a12h;
		aAddE = aAddenE - 2 * a12h;
	}
	const aDedE = aTooth - 2 * aSlopeE - aAddE;
	// step-5 : checks on the parameter values
	if (RbE > RbEmax) {
		throw `err087: RbE ${RbE} is too large compare to RbEmax ${RbEmax}`;
	}
	const tooSmallAngle = 0.0001;
	if (aAddE < tooSmallAngle || aDedE < tooSmallAngle) {
		throw `err164: aAddE ${ffix(radToDeg(aAddE))} or aDedE ${ffix(radToDeg(aDedE))} are too small`;
	}
	// contour
	const ctrToothE = contour(RminE, 0);
	for (let ii = 0; ii < param.Nt; ii++) {
		const aRef = ii * aTooth;
		ctrToothE.addSegStrokeAP(aRef + aSlopeE, RbE).addCornerRounded(param.Rae);
		if (param.SnAae === 1) {
			ctrToothE
				.addPointAP(aRef + aSlopeE + aAddE / 2, RbE)
				.addPointAP(aRef + aSlopeE + aAddE, RbE)
				.addSegArc2();
		} else {
			ctrToothE.addSegStrokeAP(aRef + aSlopeE + aAddE, RbE);
		}
		ctrToothE.addCornerRounded(param.Rae);
		ctrToothE.addSegStrokeAP(aRef + 2 * aSlopeE + aAddE, RminE).addCornerRounded(param.Rde);
		if (param.SnAde === 1) {
			ctrToothE
				.addPointAP(aRef + aTooth - aDedE / 2, RminE)
				.addPointAP(aRef + aTooth, RminE)
				.addSegArc2();
		} else {
			ctrToothE.addSegStrokeAP(aRef + aTooth, RminE);
		}
		ctrToothE.addCornerRounded(param.Rde);
	}
	return [ctrToothE, rLog];
}

export { ctrPlugExtern };
