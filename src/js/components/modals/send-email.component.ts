/**
 * This file is part of the GoGoCarto project.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * @copyright Copyright (c) 2016 Sebastian Castro - 90scastro@gmail.com
 * @license GNU GPL v3
 * @Last Modified time: 2016-12-13
 */

declare var $ : any
import { Element } from "../../classes/classes";
import { App } from "../../gogocarto";
import { AbstractModalComponent } from "./abstract-modal.component";
import { capitalize } from "../../utils/string-helpers";

export class SendEmailComponent extends AbstractModalComponent
{
  constructor()
  {
    super("#modal-send-email");
    this.ajaxUrl = App.config.features.sendMail.url;
  }

  beforeOpen(element : Element)
  {
    this.dom.find('.elementName').text(capitalize(this.element.name));

    this.dom.find('.input-mail-content').val('');
    this.dom.find('.input-mail-subject').val('');
    this.dom.find('#content-error').hide();
    this.dom.find('#mail-error').hide();

    if (App.loginModule.getUserEmail())
    {
      this.dom.find('.input-mail').hide();
      this.dom.find('.input-mail').val(App.loginModule.getUserEmail());
    }
    else
    {
      this.dom.find('.input-mail').val('');
      this.dom.find('.input-mail').show();
    }
  }

  submit()
  {
    let userEmail = this.dom.find('.input-mail').val();
    let mailSubject = this.dom.find('.input-mail-subject').val();
    let mailContent = this.dom.find('.input-mail-content').val();

    this.dom.find('#message-error').hide();
    this.dom.find('#content-error').hide();
    this.dom.find('#mail-error').hide();

    let errors = false;
    if (!mailSubject || !mailContent)
    {
      this.dom.find('#content-error').show();
      errors = true;
    }
    if (!userEmail || this.dom.find('.input-mail').hasClass('invalid'))
    {
      this.dom.find('#mail-error').show();
      this.dom.find('.input-mail').show();
      errors = true;
    }

    if (!errors)
    {      
      let comment = this.dom.find('.input-comment').val();
      let data = { elementId: this.element.id, subject: mailSubject, content: mailContent, userEmail : userEmail };
      this.sendRequest(data);
    } else {
      this.clearLoader()
    }
  }  
}