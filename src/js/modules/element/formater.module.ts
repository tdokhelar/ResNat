import { ElementBase, ElementStatus } from '../../classes/classes'; 
import { capitalize } from "../../utils/string-helpers";
import { App } from "../../gogocarto";

export class ElementFormaterModule
{
  calculateFormatedOpenHours(element : ElementBase)
  {         
    element.formatedOpenHours = {};
    let new_key, new_key_translated, newDailySlot;
    for(let key in element.openHours)
    {
      new_key_translated = this.translateDayKey(key);        
      newDailySlot = this.formateDailyTimeSlot(element.openHours[key]);
      
      if (newDailySlot) element.formatedOpenHours[new_key_translated] = newDailySlot;
    }
  }

  getProperty(element : ElementBase, propertyName)
  {
    let value = this.getValue(element, propertyName) || "";
    
    // in iframe the pending modifications are not displayed, just the old version
    if (element.status != ElementStatus.PendingModification || !App.config.isFeatureAvailable('pending') || !element.modifiedElement) return value;

    let modifiedValue = this.getValue(element.modifiedElement, propertyName);

    if (!value && !modifiedValue) return '';

    value = value || '';
    modifiedValue = modifiedValue || '';

    return App.elementDiffModule.getDiffValue(value, modifiedValue, propertyName)
  }

  private translateDayKey(dayKey)
  {
    switch(dayKey)
    {
      case 'Mo': return 'lundi';
      case 'Tu': return 'mardi';
      case 'We': return 'mercredi';
      case 'Th': return 'jeudi';
      case 'Fr': return 'vendredi';
      case 'Sa': return 'samedi';
      case 'Su': return 'dimanche';
    }

    return '';
  }

  private formateDailyTimeSlot(dailySlot) 
  {    
    if (dailySlot === null) return null;
    return dailySlot.replace(/-/g, ' - ').replace(/,/g, ' et ');
  };   

  private getValue(element : ElementBase, propertyName)
  {
    let value;
    if (propertyName == 'address') value = element.address.getFormatedAddress();
    else if (propertyName in element) value = element[propertyName]
    else value = element.data[propertyName]
    
    return value;
  }
}