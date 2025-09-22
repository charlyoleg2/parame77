// general.ts

function strDesiNames(libNames: string[]): string {
	const rStr = libNames.join(' and ');
	return rStr;
}

function repoToHomepage(repo: string): string {
	let rHomepage = repo;
	const re1 = /^git\+https:\/\//;
	const re2 = /\.git$/;
	rHomepage = rHomepage.replace(re1, '').replace(re2, '');
	return rHomepage;
}

// this helper function is a workaround to tell the lint-tool that the href-link is external
function rmHttps(iUrl: string): string {
	const re1 = /^https:\/\//;
	const rUrl = iUrl.replace(re1, '');
	return rUrl;
}

export { strDesiNames, repoToHomepage, rmHttps };
