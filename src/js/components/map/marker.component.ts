/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */
import { AppModule, AppStates } from "../../app.module";
import { Element } from "../../classes/classes";

import { App } from "../../gogocarto";
declare let $, L : any;

export class Marker
{
	private elementId : string;
	private isAnimating : boolean = false;
	// we use leaflet markers to display marker on map. Marker is just a extension of leafletMarker
	private leafletMarker : L.Marker;
	// we may want to half hidden somes markers in particular states (setting opacity to .5)
	private halfHidden : boolean = false;
	// we unclesterize small clusters to show directly the markers. For the markers to be visible, wi inclinate some of them to right of left
	private inclination = "normal";

	constructor(elementId : string, position_ : L.LatLng) 
	{
		this.elementId = elementId;

		if (!position_)
		{
			let element = this.getElement();
			if (element === null) console.log("element non geolocalized id = " + this.elementId);
			else position_ = element.position;
		} 

		this.leafletMarker = L.marker(position_, { 'riseOnHover' : true});				
		this.leafletMarker.on('click', (ev) => { App.mapManager.handleMarkerClick(this); });	
		this.leafletMarker.on('mouseover', (ev) => { if (!this.isAnimating) this.showBigSize(); });
		this.leafletMarker.on('mouseout', (ev) => { if (!this.isAnimating) this.showNormalSize(); });
		this.leafletMarker.setIcon(L.divIcon({className: 'leaflet-marker-container', html: "<span id=\"marker-"+ this.elementId + "\" gogo-icon-marker></span>"}));
	};		

	update() 
	{		
		let element = this.getElement();

		let disableMarker = false;
		let showMoreIcon = true;

		let optionsToDisplay = element.getIconsToDisplay();

		let htmlMarker = App.templateModule.render('marker', 
		{
			element : element, 
			mainOptionToDisplay: optionsToDisplay[0],
			otherOptionsToDisplay: optionsToDisplay.slice(1), 
			showMoreIcon : showMoreIcon,
			disableMarker : disableMarker,
			pendingClass : element.isPending() && App.config.isFeatureAvailable('pending') ? 'pending' : '',
			showPending : element.isPending() && App.config.isFeatureAvailable('pending'),
			config : App.config
		});

		// save the class because it has been modified by marker cluster adding or
		// removing the "rotate" class	
		let oldClassName = (<any>this.leafletMarker)._icon ?  (<any>this.leafletMarker)._icon.className : 'leaflet-marker-container';
		oldClassName.replace('leaflet-marker-icon', '');
  	this.leafletMarker.setIcon(L.divIcon({className: oldClassName, html: htmlMarker}));	

  	if (this.isDisplayedOnElementInfoBar()) this.showBigSize();
	};

	animateDrop() 
	{
		this.isAnimating = true;
		this.domMarker().animate({top: '-=25px'}, 300, 'easeInOutCubic');
		this.domMarker().animate({top: '+=25px'}, 250, 'easeInOutCubic', () => {this.isAnimating = false; this.domMarker().css('top', 'auto')} );
	};	

	showBigSize() 
	{			
		this.addClassToLeafletMarker_("BigSize");
		let domMarker = this.domMarker();
		domMarker.parent().find('.marker-name').show();
		domMarker.find('.moreIconContainer').show();
		domMarker.find('.gogo-icon-plus-circle').hide();
	};

	showNormalSize($force : boolean = false) 
	{	
		if (!$force && this.isDisplayedOnElementInfoBar()) return;

		let domMarker = this.domMarker();
		this.removeClassToLeafletMarker_("BigSize");
		domMarker.parent().find('.marker-name').hide();
		domMarker.find('.moreIconContainer').hide();
		domMarker.find('.gogo-icon-plus-circle').show();
	};

	showHalfHidden($force : boolean = false) 
	{		
		if (!$force && this.isDisplayedOnElementInfoBar()) return;

		this.addClassToLeafletMarker_("halfHidden");
		let domMarker = this.domMarker();
		domMarker.css('z-index','1');
		domMarker.find('.gogo-icon-plus-circle').addClass("halfHidden");
		domMarker.find('.moreIconContainer').addClass("halfHidden");

		this.halfHidden = true;
	};

	showNormalHidden() 
	{		
		this.removeClassToLeafletMarker_("halfHidden");
		let domMarker = this.domMarker();
		domMarker.css('z-index','10');
		domMarker.find('.gogo-icon-plus-circle').removeClass("halfHidden");
		domMarker.find('.moreIconContainer').removeClass("halfHidden");

		this.halfHidden = false;
	};

	private addClassToLeafletMarker_(classToAdd) 
	{		
		this.domMarker().addClass(classToAdd);
		this.domMarker().siblings('.marker-name').addClass(classToAdd); 
	};

	private removeClassToLeafletMarker_(classToRemove) 
	{		
		this.domMarker().removeClass(classToRemove);
		this.domMarker().siblings('.marker-name').removeClass(classToRemove);      
	};

	isDisplayedOnElementInfoBar() { return App.infoBarComponent.getCurrElementId() == this.elementId; }

	domMarker() { return $('#marker-'+ this.elementId); }

	getId () : string { return this.elementId; };

	getLeafletMarker () : L.Marker { return this.leafletMarker; };

	isHalfHidden() : boolean { return this.halfHidden; }

	getElement () : Element { return App.elementsModule.getElementById(this.elementId); };

	getPosition () : L.LatLng { return this.leafletMarker.getLatLng(); };
}

