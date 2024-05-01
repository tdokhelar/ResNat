import { App } from "../gogocarto";
import { AppModes, AppStates, AppDataType } from "../app.module";
import { capitalize, unslugify } from "../utils/string-helpers";
import { Marker } from "../components/map/marker.component";
import { Event } from "../classes/classes";

declare var $;

export class MapManager
{
  // when click on marker it also triger click on map
  // when click on marker we put isClicking to true during
  // few milliseconds so the map don't do anything is click event
  private isClicking = false;

  onMarkerClick = new Event<any>();

  constructor()
  {
    App.mapComponent.onIdle.do( () => { this.handleMapIdle();  });
    App.mapComponent.onClick.do( () => { this.handleMapClick(); });   
    App.infoBarComponent.onHide.do( ()=> { this.handleInfoBarHide(); }); 
  }

  handleInfoBarHide()
  {
    App.setState(AppStates.Normal);
  };

  setTimeoutClicking() 
  { 
    this.isClicking = true;
    let that = this;
    setTimeout(function() { that.isClicking = false; }, 100); 
  };

  handleMarkerClick(marker : Marker)
  {
    if (App.mode != AppModes.Map) return;

    this.setTimeoutClicking();
    this.onMarkerClick.emit(marker.getElement().id);

    if (marker.isHalfHidden()) App.setState(AppStates.Normal);  

    App.setState(AppStates.ShowElement, { id: marker.getId() });    
  }

  handleMapIdle()
  {    
    if (App.mode != AppModes.Map)     return;

    // we need map to be loaded to get the radius of the viewport
    // and get the elements inside
    if (!App.mapComponent.isMapLoaded)
    {
      App.mapComponent.onMapLoaded.do(() => {this.handleMapIdle(); });
      return;
    }

    let updateInAllElementList = !App.mapComponent.hasZoomedIn();

    App.elementsModule.updateElementsToDisplay(updateInAllElementList);

    if (App.state == AppStates.Normal || App.state == AppStates.ShowElement) App.elementsManager.checkForNewElementsToRetrieve();

    if (App.dataType == AppDataType.All) App.historyModule.updateCurrState();
  };

  handleMapClick()
  {
    if (this.isClicking) return;

    //console.log("handle Map Click", AppStates[App.state]);
    
    if (App.state == AppStates.ShowElement || App.state == AppStates.ShowElementAlone)
    {
      App.infoBarComponent.hide(); 
      App.setState(AppStates.Normal);    
    }
    else if (App.state == AppStates.ShowDirections)
      App.setState(AppStates.ShowElement, { id : App.infoBarComponent.getCurrElementId() });    
    
    App.mapControlsComponent.hideControlLayers();
  };

  
}