/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */
declare let $, jQuery : any;

import { AppModule } from "../../app.module";
import { Category, Option } from "../../modules/taxonomy/taxonomy.module";
import { App } from "../../gogocarto";

export class FiltersComponent
{  
  currentActiveMainOptionId = null;

  constructor() {}

  initialize()
  {  
    $('.filter-menu .tooltipped').tooltip();

    // -------------------------------
    // --------- FAVORITE-------------
    // -------------------------------
    $('#filter-favorite').click(function(e : Event)
    {      
      let favoriteCheckbox = $('#favorite-checkbox');

      let checkValue = !favoriteCheckbox.is(':checked');
      $(this).toggleClass('checked', checkValue);
      App.filterModule.showOnlyFavorite(checkValue);

      if (checkValue) {
        App.filterModule.showOnlyPending(false);
        $('#pending-checkbox').prop('checked',false);
        App.filterModule.showOnlyModeration(false);
        $('#moderation-checkbox').prop('checked',false);
      }
      
      App.elementsModule.updateElementsToDisplay(true);

      favoriteCheckbox.prop('checked',checkValue);

      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    });

    // -------------------------------
    // --------- PENDING-------------
    // -------------------------------
    $('#filter-pending').click(function(e : Event)
    {      
      let pendingCheckbox = $('#pending-checkbox');

      let checkValue = !pendingCheckbox.is(':checked');

      App.filterModule.showOnlyPending(checkValue);
      
      if (checkValue) {
        App.filterModule.showOnlyFavorite(false);
        $('#favorite-checkbox').prop('checked',false);
        App.filterModule.showOnlyModeration(false);
        $('#moderation-checkbox').prop('checked',false);
      }

      App.elementsModule.updateElementsToDisplay(true);

      pendingCheckbox.prop('checked',checkValue);

      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    });

    // -------------------------------
    // --------- MODERAITON-------------
    // -------------------------------
    $('#filter-moderation').click(function(e : Event)
    {      
      let moderationCheckbox = $('#moderation-checkbox');

      let checkValue = !moderationCheckbox.is(':checked');

      App.filterModule.showOnlyModeration(checkValue);
      
      if (checkValue) {
        App.filterModule.showOnlyFavorite(false);
        $('#favorite-checkbox').prop('checked',false);
        App.filterModule.showOnlyPending(false);
        $('#pending-checkbox').prop('checked',false);
      }

      App.elementsModule.updateElementsToDisplay(true);

      moderationCheckbox.prop('checked',checkValue);

      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    });


    // -------------------------------
    // ------ MAIN OPTIONS -----------
    // -------------------------------
    var that = this;

    $('.main-categories .main-icon').click( function(e)
    {
      let optionId = $(this).attr('data-option-id');
      that.setMainOption(optionId);
    });

    // follow main active option background when user scroll through main options
    $('.main-categories').on('scroll', () =>
    {
      $('#active-main-option-background').css('top', $('#main-option-gogo-icon-' + this.currentActiveMainOptionId).position().top);
    });

    

    // ----------------------------------
    // ------ CATEGORIES ----------------
    // ----------------------------------
    $('.subcategory-item .name-wrapper:not(.uncheckable)').click(function()
    {    
      let categoryId = $(this).attr('data-category-id');
      App.taxonomyModule.getCategoryById(categoryId).toggleChildrenDetail();
    });  

    $('.subcategory-item .checkbox-wrapper').click(function(e)
    {    
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();

      let categoryId = $(this).attr('data-category-id');
      App.taxonomyModule.getCategoryById(categoryId).toggle();
      
    });      

    // Add surbrillance in main-categories sidebar filters menu whenn hovering a main category
    $('#main-option-all.show-one-pane-per-main-option .gogo-icon-name-wrapper').hover( 
      function(e : Event) {
        let optionId = $(this).attr('data-option-id');
        let sidebarIcon = $('#main-option-gogo-icon-' + optionId);
        if (!sidebarIcon.hasClass('hover')) sidebarIcon.addClass('hover');
      },
      function(e : Event) {
        let optionId = $(this).attr('data-option-id');
        let sidebarIcon = $('#main-option-gogo-icon-' + optionId);
        sidebarIcon.removeClass('hover');
      }
    );
    // -------------------------------
    // ------ SUB OPTIONS ------------
    // -------------------------------
    $('.subcategorie-option-item:not(#filter-favorite):not(#filter-pending):not(#filter-moderation) .option-name').click(function(e : Event)
    {
      let optionDom = $(this).closest('.subcategorie-option-item');
      let optionId = optionDom.attr('data-option-id');
      let option = App.taxonomyModule.getOptionById(optionId);

      if (option.isMainOption && App.config.menu.showOnePanePerMainOption) App.filtersComponent.setMainOption(option.id);
      else if (optionDom.hasClass('uncheckable')) return;
      else if (option.isCollapsible()) option.toggleChildrenDetail()
      else option.toggle();
    });

    $('.subcategorie-option-item:not(#filter-favorite):not(#filter-pending):not(#filter-moderation)').find('.icon, .checkbox-wrapper').click(function(e)
    {    
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();

      let optionId = $(this).closest('.subcategorie-option-item').attr('data-option-id');
      App.taxonomyModule.getOptionById(optionId).toggle();
    });
  }

  setMainOption(optionId)
  {
    if (this.currentActiveMainOptionId == optionId) return;

    if (this.currentActiveMainOptionId != null) App.elementsModule.clearCurrentsElement();

    let oldId = this.currentActiveMainOptionId;
    this.currentActiveMainOptionId = optionId;

    if (optionId == 'all')
    {
      $('#menu-subcategories-title').text("Tous les " + App.config.text.elementPlural);
    }
    else
    {
      let mainOption = App.taxonomyModule.getMainOptionById(optionId);        

      $('#menu-subcategories-title').text(mainOption.name);
    }

    this.updateMainOptionBackground();

    App.infoBarComponent.hide();

    //console.log("setMainOptionId " + optionId + " / oldOption : " + oldId);
    if (oldId != null) App.historyModule.updateCurrState();

    setTimeout( () => {
      App.elementListComponent.reInitializeElementToDisplayLength();
    
      App.boundsModule.updateFilledBoundsAccordingToNewMainOptionId();
      App.elementsManager.checkForNewElementsToRetrieve();
      App.elementsModule.updateElementsToDisplay(true,true);
    }, 400);    
  }

  // the main option selected got a specific background, who can vertically translate
  updateMainOptionBackground()
  {
    let optionId = this.currentActiveMainOptionId;    

    $('.main-option-subcategories-container:not(#main-option-' + optionId + ')').hide();
    $('#main-option-' + optionId).fadeIn(400);

    $('.main-categories .main-icon').removeClass('active');
    $('#main-option-gogo-icon-' + optionId).addClass('active');

    if(!$('#main-option-gogo-icon-' + optionId).position()) { return; }

    $('#active-main-option-background').animate({top: $('#main-option-gogo-icon-' + optionId).position().top}, 400, 'easeOutQuart');
  }
}