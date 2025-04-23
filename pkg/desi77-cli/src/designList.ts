// designList.ts

import type { tAllPageDef } from 'geometrix';
import { door1arcDef } from 'desi77';
import { stoneTowerDef } from 'desi77';
import { springTorqueADef } from 'desi77';
import { plugTorqueDef } from 'desi77';
import { springTorqueBDef } from 'desi77';
import { springTorqueCDef } from 'desi77';

const designList: tAllPageDef = {
	'desi77/door1arc': door1arcDef,
	'desi77/stoneTower': stoneTowerDef,
	'desi77/springTorqueA': springTorqueADef,
	'desi77/plugTorque': plugTorqueDef,
	'desi77/springTorqueB': springTorqueBDef,
	'desi77/springTorqueC': springTorqueCDef
};

export { designList };
