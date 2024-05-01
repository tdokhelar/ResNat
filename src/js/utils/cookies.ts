/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-08-31
 */
export function createCookie(name, value, days = 100) 
{
	let date = new Date();
	date.setTime(date.getTime()+(days*24*60*60*1000));
	let expires = "; expires="+date.toUTCString();
	
	document.cookie = name+"="+value+expires+"; path=/";
}

export function readCookie(name) {
	let nameEQ = name + "=";
	let ca = document.cookie.split(';');
	for(let i=0;i < ca.length;i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

export function eraseCookie(name) {
	createCookie(name,"");
}