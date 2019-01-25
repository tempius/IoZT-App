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
    "double switch": { title: string, fields: {} },
  };
  types: Array<{}>;
  typeFields: Array<{}>;

  //componentSelected: string;

  /** form fields */
  type: string;
  componentName: string;
  fieldProtocol: { label: string, type: string, required: boolean, placeholder: string, value: string, name: string, types: Array<{}>, selectOptions: Object };
  fieldAddress: { label: string, type: string, required: boolean, placeholder: string, value: string, name: string };
  fieldPort: { label: string, type: string, required: boolean, placeholder: string, value: string, name: string };
  fieldActionI: { label: string, type: string, required: boolean, placeholder: string, value: string, name: string };
  fieldActionO: { label: string, type: string, required: boolean, placeholder: string, value: string, name: string };
  fieldActionI2: { label: string, type: string, required: boolean, placeholder: string, value: string, name: string };
  fieldActionO2: { label: string, type: string, required: boolean, placeholder: string, value: string, name: string };

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
    this.fieldProtocol = {
      label: 'Protocol:',
      type: 'select',
      required: true,
      placeholder: '[PROTOCOL]',
      value: '',
      name: 'protocol',
      types: [
        { text: 'HTTP', value: 'http' },
        { text: 'HTTPS', value: 'https' },
        { text: 'WEBSOCKET', value: 'ws' },
      ],
      selectOptions: {
        title: 'Selecionar o protocolo',
        subtitle: '',
      },
    };
    this.fieldAddress = {
      label: 'Address:',
      type: 'text',
      required: true,
      placeholder: '[URL]',
      value: '',
      name: 'address',
    };
    this.fieldPort = {
      label: 'Port:',
      type: 'number',
      required: false,
      placeholder: '[PORT] (optional)',
      value: '',
      name: 'port',
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
    this.fieldActionI2 = {
      label: 'Action ON:',
      type: 'text',
      required: true,
      placeholder: '[URI]',
      value: '',
      name: 'actionI2',
    };
    this.fieldActionO2 = {
      label: 'Action OFF:',
      type: 'text',
      required: true,
      placeholder: '[URI]',
      value: '',
      name: 'actionO2',
    };

    this.typesInfo = {
      button: {
        title: 'Botão',
        fields: {
          protocol: this.fieldProtocol,
          address: this.fieldAddress,
          port: this.fieldPort,
          actionI: this.fieldActionI,
        },
      },
      switch: {
        title: 'Interruptor',
        fields: {
          protocol: this.fieldProtocol,
          address: this.fieldAddress,
          port: this.fieldPort,
          actionI: this.fieldActionI,
          actionO: this.fieldActionO,
        },
      },
      "double switch": {
        title: 'Interruptor duplo',
        fields: {
          protocol: this.fieldProtocol,
          address: this.fieldAddress,
          port: this.fieldPort,
          actionI: this.fieldActionI,
          actionO: this.fieldActionO,
          actionI2: this.fieldActionI2,
          actionO2: this.fieldActionO2,
        },
      },
    };

    this.types = Object.keys(this.typesInfo);

    if (this.component && Object.keys(this.component).length) {
      this.editingComponent = true;
      this.type = this.component.type;
      this.componentName = this.component.componentName;
      this.typeFields = Object.keys(this.typesInfo[this.component.type].fields);

      this.typeFields.forEach(field => {
        this.typesInfo[this.component.type].fields[String(field)].value = this.component[String(field)];
      });
    }

  }

  onSelectTypeChange(selectedValue: any) {
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
      if (component.protocol === 'ws') this.closeWebsocket(component);
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
        if (form.controls[key].status === 'INVALID' && this.typesInfo[this.type].fields[key] && this.typesInfo[this.type].fields[key].type !== 'select' && this.typesInfo[this.type].fields[key].required) {
          let inputField: HTMLElement = <HTMLElement>document.querySelector('ion-input.' + key + ' input');
          inputField.focus();
          inputField.blur();
          inputField.focus();
          inputField.blur();
        }
      });
    }
  }

}
