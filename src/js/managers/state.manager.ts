import { App } from "../gogocarto";
import { AppDataType, AppModes } from "../app.module";
import { Element } from "../classes/classes";

export enum AppStates 
{
  Normal,
  ShowElement,
  ShowElementAlone,
  ShowDirections
}

export class StateManager
{
  // curr state of the app
  private state_ : AppStates = null;  

  // somes states need a element id, we store it in this property
  private stateElementId_ : number = null;

  get state() { return this.state_; }
  get stateElementId() : number { return this.stateElementId_; }

  /*
  * Change App state
  */
  setState($newState : AppStates, options : any = {}, $backFromHistory : boolean = false) 
  {   
    // console.log("AppModule set State : " + AppStates[$newState]  +  ', options = ',options);
    let element = (options && options.id) ? App.elementById(options.id) : null;

    let oldStateName = this.state_;
    this.state_ = $newState;      

    if (oldStateName == AppStates.ShowDirections && App.directionsComponent) 
      App.directionsComponent.clear();

    if (oldStateName == AppStates.ShowElementAlone)  
    {
      App.elementsModule.clearCurrentsElement();
      App.displayElementAloneModule.end();  
    }  

    this.stateElementId_ = options ? options.id : null;
    
    switch ($newState)
    {
      case AppStates.Normal: this.setNormalState(); break;
      case AppStates.ShowElement: this.setShowElementState(element, options); break; 
      case AppStates.ShowElementAlone: this.setShowElementAloneState(element, options); break;
      case AppStates.ShowDirections: this.setShowDirectionsState(element, options);break;      
    }

    if (!$backFromHistory &&
       ( oldStateName !== $newState 
        || $newState == AppStates.ShowElement
        || $newState == AppStates.ShowElementAlone
        || $newState == AppStates.ShowDirections) )
    {
      if (App.dataType == AppDataType.All) App.historyModule.pushNewState(options);
      else App.historyModule.updateCurrState(options);
    }     

    App.documentTitleModule.updateDocumentTitle(options);
  };

  private setNormalState()
  {
    App.infoBarComponent.hide(false);
  }  

  private setShowElementState(element, options)
  {
    if (App.mode == AppModes.List)
    {
      if (!App.mapComponent.isInitialized)
      {
        App.mapComponent.onMapReady.do(() => 
        {
          App.mapComponent.panToLocation(element.position, 14, false);
          App.infoBarComponent.showElement(element.id);
        });
      }
      else
      {
        App.mapComponent.panToLocation(element.position, 14, false);            
        App.infoBarComponent.showElement(element.id);
      }            

      App.setMode(AppModes.Map, false, false);
    } 
    else // AppMode
    {
      App.infoBarComponent.showElement(element.id);
    }
  }  

  private setShowElementAloneState(element, options)
  {
    App.infoBarComponent.show();

    if (element)
    {
      App.DEAModule.begin(element.id, true);          
    }
    else
    {
      App.ajaxModule.getElementById(options.id,
        (elementJson) => {
          App.elementsJsonModule.convertJsonElements([elementJson], true, true);
          App.DEAModule.begin(elementJson.id, true);
          App.documentTitleModule.updateDocumentTitle(options);
          App.historyModule.updateCurrState(options);
        },
        (error) => 
        { 
          let historystate = App.historyStateManager.lastHistoryState;
          App.component.toastMessage("Erreur pendant le chargement de cet élement");
          
          App.setState(AppStates.Normal);
          if (historystate.viewport) App.mapComponent.setViewPort(historystate.viewport);
          else App.mapComponent.fitDefaultBounds();
          setTimeout( () => { App.infoBarComponent.hide(); }, 200);
          setTimeout( () => { App.infoBarComponent.hide(); }, 500);
        }
      );            
    }      
  }

  private setShowDirectionsState(element : Element, options)
  {
    let origin = App.geocoder.getLocation(); 
    // if no element, we get it from ajax 
    if (!element)
    {
      if (!options.id) return; 
      App.ajaxModule.getElementById(options.id, (elementJson) => 
      { 
        App.elementsJsonModule.convertJsonElements([elementJson], true, true);
        element = App.elementById(elementJson.id);
        App.documentTitleModule.updateDocumentTitle(options);  
        this.checkIfReadyToStartDirections(element);                        
      },
      (error) => { /*TODO*/ alert("No element with App id"); }
      );               
    }

    this.checkIfReadyToStartDirections(element)  
  }

  private checkIfReadyToStartDirections(element)
  {
    let origin = App.geocoder.getLocation();
      
    if (!element || !origin) return;
    
    if (App.mode == AppModes.List)
    {
      if (!App.mapComponent.isInitialized)
      {
        App.mapComponent.onMapReady.do(() => { this.beginDirectionsCalculation(origin, element); });
      }           

      App.setMode(AppModes.Map, false, false);
    } 
      
    this.beginDirectionsCalculation(origin, element);
  }

  private beginDirectionsCalculation = function (origin : L.LatLng, element : Element)
  {
    if (!App.mapComponent.isInitialized) return;

    App.DEAModule.begin(element.id, false);
    // wait for the info bar to open, so the map is resized at this final viewport
    // Then we can calculate route and fitbounds regarding routing result
    setTimeout( () => { App.directionsComponent.calculateRoute(origin, element); }, 400);     
  };
}