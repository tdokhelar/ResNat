import { AppModule } from "../../app.module";
import { Category, Option, CategoryValue} from "../classes";
import { parseUriId, slugify } from "../../utils/string-helpers";
import { App } from "../../gogocarto";

export class OptionValue
{
	optionId : any;
	index : number;
	description : string;
	diff : string; // use to compare with modified optionValue. Values cna be "removed", "added", or "equals"
	option_ : Option = null;
	isFilledByFilters : boolean = true;

	children : CategoryValue[] = [];
	colorOptionId : number = null;

	constructor($optionValueJson, $key = 0)
	{
		// console.log("value json", $optionValueJson);
		// in case of compact json, the options values are stored in simple array
		if (typeof $optionValueJson == 'number' || typeof $optionValueJson == 'string')
		{
			this.optionId = $optionValueJson.toString();
			this.index = $key;
			this.description = '';
		}
		else if (Array.isArray($optionValueJson) && $optionValueJson.length >= 2)
		{
			this.optionId = $optionValueJson[0];
			this.index = $key;
			this.description = $optionValueJson.length == 3 ?  $optionValueJson[2] : '';
		}
		else if (typeof $optionValueJson == 'object')
		{
			if ($optionValueJson["@id"]) {
				this.optionId = parseUriId($optionValueJson["@id"]);
			} else {
				this.optionId = $optionValueJson.categoryId || $optionValueJson.optionId;
				this.index = $key;
				this.description = $optionValueJson.description || '';
			}			
		}	
		this.diff = $optionValueJson.diff;	
	}

	get option() : Option
	{
		if (this.option_) return this.option_;
		return this.option_ = App.taxonomyModule.getOptionById(this.optionId);
	}

	setRecursivelyFilledByFilters(bool : boolean)
	{
		this.isFilledByFilters = bool;
		for(let categoryValue of this.children)
		{
			for (let suboptionValue of categoryValue.children)
			{
				suboptionValue.setRecursivelyFilledByFilters(bool);
			}
		}
	}

	get categoryOwner() : Category
	{
		return <Category> this.option.getOwner();
	}

	addCategoryValue(categoryValue : CategoryValue)
	{
		this.children.push(categoryValue);
	}
}

