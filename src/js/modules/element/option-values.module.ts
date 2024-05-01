import { Element, ElementBase, OptionValue, CategoryValue, Category, Option } from '../../classes/classes'; 
import { capitalize } from "../../utils/string-helpers";
import { App } from "../../gogocarto";

export class ElementOptionValuesModule
{
  createOptionValues(optionsValuesJson : any, element : ElementBase)
  {
    element.optionsValues = [];

    if(!optionsValuesJson) return;

    for (let key = 0; key < optionsValuesJson.length; ++key) 
    {
      this.createOptionValueForElement(optionsValuesJson[key], key, element);
    } 

    this.lookforMissingParentsOption(element);    
  }

  private createOptionValueForElement(optionValueJson, key : number, element : ElementBase)
  {
    let newOption = new OptionValue(optionValueJson, key);

    if (newOption.option)
    {
      if (newOption.option.isMainOption) 
        element.mainOptionOwnerIds.push(newOption.optionId);

      element.optionsValues.push(newOption);
    }   

    return newOption;   
  }

  updateOptionsWithDescription(element : ElementBase, $optionValuesDescription) {
    element.optionsValues.forEach( (optionValue) => { 
      let correspondingOptionValuewithDescription = $optionValuesDescription.filter( (object) => object.categoryId == optionValue.optionId)[0];
      if (!correspondingOptionValuewithDescription) return;
      optionValue.description = correspondingOptionValuewithDescription.description;
    });
  }

  createOptionsTree(element : ElementBase)
  {
    let mainCategory = App.taxonomyModule.taxonomy;
    element.optionTree = this.recusivelyCreateOptionTree(element, mainCategory, new OptionValue({}));
  }

  private recusivelyCreateOptionTree(element : ElementBase, category : Category, optionValue : OptionValue)
  {
    let categoryValue = new CategoryValue(category);

    for(let option of category.options)
    {      
      let childOptionValue = this.getElementOptionValueCorrespondingToOptionId(element, option.id);
      
      if (childOptionValue)
      {
        categoryValue.addOptionValue(childOptionValue);
        for(let subcategory of option.subcategories)
        {
          this.recusivelyCreateOptionTree(element, subcategory, childOptionValue);
        }
      }      
    }

    if (categoryValue.children.length > 0)
    {
      categoryValue.children.sort( (a,b) => a.index - b.index);
      optionValue.addCategoryValue(categoryValue);
    }

    return optionValue; 
  }  

  private getElementOptionValueCorrespondingToOptionId(element : ElementBase, $optionId : number) : OptionValue
  {
    let index = element.optionsValues.map((value) => value.optionId).indexOf($optionId.toString());
    if (index == -1) return null;
    return element.optionsValues[index];
  }

  // look for missing parent options values. if an element contains
  // only the deepest option value, we add all the parents options
  // of those deepest options so filters can works properly
  private lookforMissingParentsOption(element : ElementBase)
  {
    let optionValuesIds = element.optionsValues.map( (el) => el.optionId);
    for(let optionValue of element.optionsValues)
      for (let parentOptionId of optionValue.option.parentOptionIds)      
        if (optionValuesIds.indexOf(parentOptionId.toString()) == -1)
        {
          let newOption = this.createOptionValueForElement(parentOptionId, 0, element);
          // console.log("Missing option", newOption.option.nameShort, element.name);
          optionValuesIds.push(parentOptionId); 
        } 
  }

  updateOptionValueColor(element : Element, $optionValue : OptionValue)
  {
    if (!$optionValue) return;
    // console.log("updateOptionValue", $optionValue.option.name);
    if ($optionValue.option.useColorForMarker)
    {
      $optionValue.colorOptionId = $optionValue.optionId;
    }    
    else 
    {
      let option : Option;
      let category : Category;
      let colorId : number = null;

      let siblingsOptionsForColoring : OptionValue[] = element.getCurrOptionsValues().filter( 
        (optionValue) => 
          optionValue.isFilledByFilters 
          && optionValue.option.useColorForMarker
          && optionValue.option.ownerId !== $optionValue.option.ownerId 
          && optionValue.categoryOwner.ownerId == $optionValue.categoryOwner.ownerId
      );

      //console.log("siblingsOptionsForColoring", siblingsOptionsForColoring.map( (op) => op.option.name));
      if (siblingsOptionsForColoring.length > 0)
      {
        option = <Option> siblingsOptionsForColoring.shift().option;
        //console.log("-> sibling found : ", option.name);
        colorId = option.id;
      }
      else
      {
        option = $optionValue.option;
        // console.log(option.name, "no siblings, looking for parent");
        while(colorId == null && option)
        {
          category = <Category> option.getOwner();
          if (category)
          {
            option = <Option> category.getOwner();
            if (!option) break;     
            // console.log("  -> parent option" + option.name + " usecolorForMarker", option.useColorForMarker);
            colorId = option.useColorForMarker ? option.id : null;
          }          
        }
      }
      
      $optionValue.colorOptionId = colorId;
    }
  }
}