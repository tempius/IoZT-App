import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { HomePage } from '../home/home';

@Component({
  selector: 'page-add',
  templateUrl: 'add.html'
})
export class AddPage {
  customSelect: { title: string, subTitle: string, mode?: string };
  typesInfo: {
    button: { title: string, fields: {} },
    switch: { title: string, fields: {} },
  };
  componentTypes: Array<{}>;
  typeFields: Array<{}>;

  //componentSelected: string;

  /** form fields */
  componentType: string;
  componentName: string;
  fieldAddress: { label: string, type: string, required: boolean, placeholder: string, value: string, name: string };
  fieldActionI: { label: string, type: string, required: boolean, placeholder: string, value: string, name: string };
  fieldActionO: { label: string, type: string, required: boolean, placeholder: string, value: string, name: string };
  fieldWebsocketAddress: { label: string, type: string, required: boolean, placeholder: string, value: string, name: string };

  /** component edit */
  component: any;
  index: any;
  editingComponent: boolean = false;

  /** components received */
  components: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.components = navParams.get('components');
    this.component = navParams.get('component');
    this.index = navParams.get('index');

    this.customSelect = {
      title: 'Selecionar o tipo do componente',
      subTitle: '',
      //mode: 'ios', //use 'md' for android, 'ios' for ios, 'wp' for windows 
    };

    /** form fields */
    this.fieldAddress = {
      label: 'Address:',
      type: 'text',
      required: true,
      placeholder: '[URL]',
      value: '',
      name: 'address',
    };
    this.fieldActionI = {
      label: 'Action ON:',
      type: 'text',
      required: true,
      placeholder: '[URI]',
      value: '',
      name: 'actionI',
    };
    this.fieldActionO = {
      label: 'Action OFF:',
      type: 'text',
      required: true,
      placeholder: '[URI]',
      value: '',
      name: 'actionO',
    };
    this.fieldWebsocketAddress = {
      label: 'WS address:',
      type: 'text',
      required: false,
      placeholder: '[URL] (optional)',
      value: '',
      name: 'websocketAddress'
    };

    this.typesInfo = {
      button: {
        title: 'Botão',
        fields: {
          address: this.fieldAddress,
          actionI: this.fieldActionI,
        },
      },
      switch: {
        title: 'Interruptor',
        fields: {
          address: this.fieldAddress,
          actionI: this.fieldActionI,
          actionO: this.fieldActionO,
          websocketAddress: this.fieldWebsocketAddress,
        },
      },
    };

    this.componentTypes = Object.keys(this.typesInfo);

    if (this.component && Object.keys(this.component).length) {
      this.editingComponent = true;
      this.componentType = this.component.componentType;
      this.componentName = this.component.componentName;
      this.typeFields = Object.keys(this.typesInfo[this.component.componentType].fields);

      this.typeFields.forEach(field => {
        this.typesInfo[this.component.componentType].fields[String(field)].value = this.component[String(field)];
      });
    }

  }

  onSelectChange(selectedValue: any) {
    this.typeFields = Object.keys(this.typesInfo[selectedValue].fields);
  }

  goToRoot() {
    this.navCtrl.setRoot(HomePage);
  }

  closeWebsocket(component, onCloseEvent = false) {
    clearTimeout(component.timer);
    component.state = undefined;
    component.connection = false;
    if (!onCloseEvent) component.socket.close();
  }

  closeAllWebsockets() {
    this.components.forEach(component => {
      if (component.websocketAddress) this.closeWebsocket(component);
    });
  }

  saveComponent(form) {
    if (form && form.status === 'VALID') {
      if (this.components.length) this.closeAllWebsockets();

      const component = form.value;
      const storedComponents = localStorage.getItem('Components') ? JSON.parse(localStorage.getItem('Components')) : [];
      if (this.editingComponent) {
        storedComponents[this.index] = component;
        localStorage.setItem('Components', JSON.stringify(storedComponents));
        this.goToRoot();
      }
      else {
        storedComponents.push(component);
        localStorage.setItem('Components', JSON.stringify(storedComponents));
        this.goToRoot();
      }
    }
    else {
      Object.keys(form.controls).forEach(key => {
        if (form.controls[key].status === 'INVALID') {
          let inputField: HTMLElement = <HTMLElement>document.querySelector('input[ng-reflect-name=' + key + ']');
          inputField.focus();
          inputField.blur();
          inputField.focus();
          inputField.blur();
        }
      });
    }
  }

}
