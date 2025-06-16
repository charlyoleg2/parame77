// pcar.ts
// the envelop of a passager car

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
	contour,
	contourCircle,
	figure,
	//degToRad,
	//radToDeg,
	ffix,
	pNumber,
	//pCheckbox,
	//pDropdown,
	pSectionSeparator,
	EExtrude,
	EBVolume,
	initGeom
} from 'geometrix';

const pDef: tParamDef = {
	partName: 'pcar',
	params: [
		//pNumber(name, unit, init, min, max, step)
		pNumber('LB1', 'mm', 1000, 100, 4000, 1),
		pNumber('LB2', 'mm', 3500, 100, 8000, 1),
		pNumber('LB3', 'mm', 1500, 100, 4000, 1),
		pNumber('LT1', 'mm', 800, 100, 4000, 1),
		pNumber('LT3', 'mm', 1200, 100, 4000, 1),
		pNumber('LT4', 'mm', 1600, 100, 4000, 1),
		pNumber('HF1', 'mm', 900, 100, 3000, 1),
		pNumber('HF3', 'mm', 600, 100, 3000, 1),
		pNumber('HF4', 'mm', 300, 100, 3000, 1),
		pNumber('HB1', 'mm', 800, 100, 3000, 1),
		pSectionSeparator('Wheels'),
		pNumber('HW1', 'mm', 200, -1000, 1000, 1),
		pNumber('DW1', 'mm', 100, 1, 500, 1),
		pNumber('DW2', 'mm', 600, 1, 2000, 1),
		pNumber('DW3', 'mm', 800, 1, 2000, 1),
		pNumber('WW1', 'mm', 300, 1, 1000, 1),
		pNumber('WW2', 'mm', 200, 1, 1000, 1),
		pNumber('RW2', 'mm', 50, 1, 1000, 1),
		pSectionSeparator('Side'),
		pNumber('C1', 'mm', 50, 1, 500, 1),
		pNumber('C2', 'mm', 50, 1, 500, 1),
		pNumber('C3', 'mm', 50, 1, 500, 1),
		pNumber('C4', 'mm', 50, 1, 500, 1),
		pNumber('Rs1', 'mm', 100, 1, 2000, 1),
		pNumber('Rs2', 'mm', 100, 1, 2000, 1),
		pNumber('Rs3', 'mm', 100, 1, 2000, 1),
		pNumber('Rs4', 'mm', 100, 1, 2000, 1),
		pNumber('Rs5', 'mm', 100, 1, 2000, 1),
		pNumber('Rs6', 'mm', 100, 1, 2000, 1),
		pNumber('Rs7', 'mm', 100, 1, 2000, 1),
		pSectionSeparator('Top'),
		pNumber('Wt1', 'mm', 600, 1, 2000, 1),
		pNumber('Wt2', 'mm', 800, 1, 2000, 1),
		pNumber('Ct1', 'mm', 50, 1, 500, 1),
		pNumber('Ct2', 'mm', 50, 1, 500, 1),
		pNumber('Ct3', 'mm', 50, 1, 500, 1),
		pNumber('Rt1', 'mm', 100, 1, 2000, 1),
		pNumber('Rt2', 'mm', 100, 1, 2000, 1),
		pSectionSeparator('Front'),
		pNumber('Wf1', 'mm', 800, 1, 2000, 1),
		pNumber('Wf2', 'mm', 150, 1, 1000, 1),
		pNumber('Cf1', 'mm', 50, 1, 500, 1),
		pNumber('Cf2', 'mm', 50, 1, 500, 1),
		pNumber('Cf3', 'mm', 50, 1, 500, 1),
		pNumber('Rf1', 'mm', 100, 1, 2000, 1),
		pNumber('Rf2', 'mm', 100, 1, 2000, 1),
		pNumber('Rf3', 'mm', 100, 1, 2000, 1)
	],
	paramSvg: {
		LB1: 'pcar_side.svg',
		LB2: 'pcar_side.svg',
		LB3: 'pcar_side.svg',
		LT1: 'pcar_side.svg',
		LT3: 'pcar_side.svg',
		LT4: 'pcar_side.svg',
		HF1: 'pcar_side.svg',
		HF3: 'pcar_side.svg',
		HF4: 'pcar_side.svg',
		HB1: 'pcar_side.svg',
		HW1: 'pcar_side.svg',
		DW1: 'pcar_side.svg',
		DW2: 'pcar_side.svg',
		DW3: 'pcar_side.svg',
		WW1: 'pcar_front.svg',
		WW2: 'pcar_front.svg',
		RW2: 'pcar_front.svg',
		C1: 'pcar_side.svg',
		C2: 'pcar_side.svg',
		C3: 'pcar_side.svg',
		C4: 'pcar_side.svg',
		Rs1: 'pcar_side.svg',
		Rs2: 'pcar_side.svg',
		Rs3: 'pcar_side.svg',
		Rs4: 'pcar_side.svg',
		Rs5: 'pcar_side.svg',
		Rs6: 'pcar_side.svg',
		Rs7: 'pcar_side.svg',
		Wt1: 'pcar_top.svg',
		Wt2: 'pcar_top.svg',
		Ct1: 'pcar_top.svg',
		Ct2: 'pcar_top.svg',
		Ct3: 'pcar_top.svg',
		Ct4: 'pcar_top.svg',
		Rt1: 'pcar_top.svg',
		Rt2: 'pcar_top.svg',
		Wf1: 'pcar_front.svg',
		Wf2: 'pcar_front.svg',
		Cf1: 'pcar_front.svg',
		Cf2: 'pcar_front.svg',
		Cf3: 'pcar_front.svg',
		Rf1: 'pcar_front.svg',
		Rf2: 'pcar_front.svg',
		Rf3: 'pcar_front.svg'
	},
	sim: {
		tMax: 180,
		tStep: 0.5,
		tUpdate: 500 // every 0.5 second
	}
};

function pGeom(t: number, param: tParamVal, suffix = ''): tGeom {
	const rGeome = initGeom(pDef.partName + suffix);
	const figSideWiWheels = figure();
	const figSideWoWheels = figure();
	rGeome.logstr += `${rGeome.partName} simTime: ${t}\n`;
	try {
		// step-4 : some preparation calculation
		const RW1 = param.DW1 / 2;
		const RW2 = param.DW2 / 2;
		const RW3 = param.DW3 / 2;
		const BodyY0 = RW2 - param.HW1;
		const BodyHeight = param.HF1 + param.HF3 + param.HF4;
		const BodyLength = param.LB1 + param.LB2 + param.LB3;
		const BodyWidth = 2 * param.Wt1 + param.Wt2;
		const LT2 = BodyLength - (param.LT1 + param.LT3 + param.LT4);
		const HF3b = param.HF3 - param.C2;
		const HB1b = param.HB1 - param.C2;
		const HB2 = BodyHeight - param.HB1;
		const Wf1b = BodyHeight - param.Cf3 - param.Wf1;
		const Wf2b = BodyWidth - 2 * (param.Cf1 + param.Wf2);
		const Cf1b = param.Wt1 - (param.Cf1 + param.WW1 + param.WW2);
		const Ct2b = param.Wt1 - (param.Ct2 + param.WW1 + param.WW2);
		const Ct1b = param.LB1 - (param.Ct1 + RW3);
		const Ct3b = param.LB3 - (param.Ct3 + RW3);
		const dXwheel2 = RW3 ** 2 - param.HW1 ** 2;
		if (dXwheel2 < 0) {
			throw `err158: dXwheel2 ${ffix(dXwheel2)} is negative because of HW1 ${ffix(param.HW1)} and RW3 ${ffix(RW3)} mm`;
		}
		const dXwheel = Math.sqrt(RW3 ** 2 - param.HW1 ** 2);
		const LB1b = param.LB1 - dXwheel;
		const LB2b = param.LB2 - 2 * dXwheel;
		const LB3b = param.LB3 - dXwheel;
		function calcCR(dX: number, dY: number, dC: number): number {
			//const AD = Math.sqrt(dX ** 2 + dY ** 2) / 2;
			const AD2 = (dX ** 2 + dY ** 2) / 4;
			const AD = Math.sqrt(AD2);
			const EA = Math.sqrt(AD2 + dC ** 2);
			const rAC = (EA * AD) / dC;
			return rAC;
		}
		const CR1 = calcCR(param.LT1, HB1b, param.C1);
		const CR2 = calcCR(LT2, 0, param.C2);
		const CR3 = calcCR(param.LT3, HF3b, param.C3);
		const CR4 = calcCR(param.LT4, param.HF4, param.C4);
		// step-5 : checks on the parameter values
		if (BodyY0 < 0) {
			throw `err147: DW2 ${ffix(param.DW2)} is too small comapre to HW1 ${ffix(param.HW1)} mm`;
		}
		if (LT2 < 0) {
			throw `err169: LT2 ${ffix(LT2)} mm is negative`;
		}
		if (HF3b < 0) {
			throw `err174: HF3b ${ffix(HF3b)} mm is negative`;
		}
		if (HB1b < 0) {
			throw `err178: HB1b ${ffix(HB1b)} mm is negative`;
		}
		if (HB2 < 0) {
			throw `err172: HB2 ${ffix(HB2)} mm is negative`;
		}
		if (Wf1b < 0) {
			throw `err161: Wf1b ${ffix(Wf1b)} mm is negative`;
		}
		if (Wf2b < 0) {
			throw `err164: Wf2b ${ffix(Wf2b)} mm is negative`;
		}
		if (Cf1b < 0) {
			throw `err167: Cf1b ${ffix(Cf1b)} mm is negative`;
		}
		if (Ct1b < 0) {
			throw `err170: Ct1b ${ffix(Ct1b)} mm is negative`;
		}
		if (Ct2b < 0) {
			throw `err173: Ct2b ${ffix(Ct2b)} mm is negative`;
		}
		if (Ct3b < 0) {
			throw `err176: Ct3b ${ffix(Ct3b)} mm is negative`;
		}
		if (LB1b < 0) {
			throw `err185: LB1b ${ffix(LB1b)} mm is negative`;
		}
		if (LB2b < 0) {
			throw `err189: LB2b ${ffix(LB2b)} mm is negative`;
		}
		if (LB3b < 0) {
			throw `err193: LB3b ${ffix(LB3b)} mm is negative`;
		}
		// step-6 : any logs
		rGeome.logstr += `Body: Y0 ${ffix(BodyY0)}, Height ${ffix(BodyHeight)}, Lenght: ${ffix(BodyLength)}, Width: ${ffix(BodyWidth)} mm\n`;
		// step-7 : drawing of the figures
		// sub-function
		// figSideWiWheels
		function makeCtrSide(withWheels: boolean): tContour {
			const rCtr = contour(-param.LB1, BodyY0).addCornerRounded(param.Rs1);
			if (withWheels) {
				rCtr.addSegStrokeR(LB1b, 0)
					.addPointR(dXwheel, param.HW1 + RW3)
					.addPointR(2 * dXwheel, 0)
					.addSegArc2()
					.addSegStrokeR(LB2b, 0)
					.addPointR(dXwheel, param.HW1 + RW3)
					.addPointR(2 * dXwheel, 0)
					.addSegArc2()
					.addSegStrokeR(LB3b, 0);
			} else {
				rCtr.addSegStrokeR(BodyLength, 0);
			}
			rCtr.addCornerRounded(param.Rs7)
				.addSegStrokeR(0, param.HF1)
				.addCornerRounded(param.Rs6)
				.addPointR(-param.LT4, param.HF4)
				//.addSegStroke()
				.addSegArc(CR4, false, true)
				.addCornerRounded(param.Rs5)
				.addPointR(-param.LT3, HF3b)
				//.addSegStroke()
				.addSegArc(CR3, false, true)
				.addCornerRounded(param.Rs4)
				.addPointR(-LT2, 0)
				//.addSegStroke()
				.addSegArc(CR2, false, true)
				.addCornerRounded(param.Rs3)
				.addPointR(-param.LT1, -HB1b)
				//.addSegStroke()
				.addSegArc(CR1, false, true)
				.addCornerRounded(param.Rs2)
				.closeSegStroke();
			return rCtr;
		}
		figSideWiWheels.addMainO(makeCtrSide(true));
		figSideWiWheels.addSecond(contourCircle(0, RW2, RW2));
		figSideWiWheels.addSecond(contourCircle(0, RW2, RW1));
		figSideWiWheels.addSecond(contourCircle(param.LB2, RW2, RW2));
		figSideWiWheels.addSecond(contourCircle(param.LB2, RW2, RW1));
		// figSideWoWheels
		figSideWoWheels.addMainO(makeCtrSide(false));
		figSideWoWheels.mergeFigure(figSideWiWheels, true);
		// final figure list
		rGeome.fig = {
			faceSideWiWheels: figSideWiWheels,
			faceSideWoWheels: figSideWoWheels
		};
		// step-8 : recipes of the 3D construction
		// volume
		const designName = rGeome.partName;
		rGeome.vol = {
			extrudes: [
				{
					outName: `subpax_${designName}_sideWiW1`,
					face: `${designName}_faceSideWiWheels`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.Wt1,
					rotate: [0, 0, 0],
					translate: [0, 0, 0]
				},
				{
					outName: `subpax_${designName}_sideWiW2`,
					face: `${designName}_faceSideWiWheels`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.Wt1,
					rotate: [0, 0, 0],
					translate: [0, 0, param.Wt2 + param.Wt1]
				},
				{
					outName: `subpax_${designName}_sideWoW`,
					face: `${designName}_faceSideWoWheels`,
					extrudeMethod: EExtrude.eLinearOrtho,
					length: param.Wt2,
					rotate: [0, 0, 0],
					translate: [0, 0, param.Wt1]
				}
			],
			volumes: [
				{
					outName: `ipax_${designName}_side`,
					boolMethod: EBVolume.eUnion,
					inList: [
						`subpax_${designName}_sideWiW1`,
						`subpax_${designName}_sideWiW2`,
						`subpax_${designName}_sideWoW`
					]
				},
				{
					outName: `pax_${designName}`,
					boolMethod: EBVolume.eIntersection,
					inList: [`subpax_${designName}_side`]
				}
			]
		};
		// step-9 : optional sub-design parameter export
		// sub-design
		rGeome.sub = {};
		// step-10 : final log message
		// finalize
		rGeome.logstr += 'pcar drawn successfully!\n';
		rGeome.calcErr = false;
	} catch (emsg) {
		rGeome.logstr += emsg as string;
		console.log(emsg as string);
	}
	return rGeome;
}

const pcarDef: tPageDef = {
	pTitle: 'pcar',
	pDescription: 'the envelop of a passager car',
	pDef: pDef,
	pGeom: pGeom
};

export { pcarDef };
