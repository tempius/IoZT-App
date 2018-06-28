import { Component, ViewChild } from '@angular/core';
import { Content, NavController, reorderArray, AlertController, ItemSliding } from 'ionic-angular';
import { Http } from '@angular/http'; //Response
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/timeout';

import { AddPage } from '../add/add';
import { ScanPage } from '../scan/scan';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild(Content) content: Content;
  componentOptions: ItemSliding;
  removeAlert: any;
  storedComponents: Array<{ componentType: string, componentName: string, address: string, actionI: string, actionO: string, websocketAddress?: string }>;
  components: Array<{ componentType: string, componentName: string, state?: boolean, address: string, actionI: string, actionO: string, websocketAddress?: string, timer?: any, connection?: boolean, socket?: WebSocket }>;
  reorder: boolean;
  timeout: number = 3000;

  constructor(public navCtrl: NavController, private alertCtrl: AlertController, public http: Http) {

    this.storedComponents = localStorage.getItem('Components') ? JSON.parse(localStorage.getItem('Components')) : [];
    this.components = localStorage.getItem('Components') ? JSON.parse(localStorage.getItem('Components')) : [];
    this.reorder = false;

    this.components.forEach(component => {
      this.connectComponent(component);
    });

    // Close the connection when the window is closed
    const that = this;
    window.addEventListener('beforeunload', function () {
      that.closeAllWebsockets();
    });
  }

  /** pages */
  reloadHome() {
    let reloadAlert = this.alertCtrl.create({
      title: 'Forçar Reconexão',
      message: 'Tem a certeza que pretende reconectar todos os componentes?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            //console.log('Cancel clicked');
          }
        },
        {
          text: 'Reconectar',
          handler: () => {
            this.closeAllWebsockets();
            this.navCtrl.setRoot(HomePage);
          }
        }
      ]
    });

    reloadAlert.present();
  }

  goToScanComponentsPage() {
    this.closeAllWebsockets();
    this.navCtrl.setRoot(ScanPage);
  }

  addComponent() {
    this.navCtrl.push(AddPage, {
      components: this.components,
    });
  }

  editComponent(component, index) {
    this.navCtrl.push(AddPage, {
      components: this.components,
      component: component,
      index: index,
    });
  }

  /** actions */
  websocketEventAdd(component) {
    // Open a connection
    const that = this;
    component.timer = null;
    component.socket = new WebSocket(component.websocketAddress);

    // When a connection is made
    component.socket.onopen = function () {
      clearTimeout(component.timer);
    }

    // When data is received
    component.socket.onmessage = function (event) {
      clearTimeout(component.timer);
      component.state = event.data === 'ON' ? true : false;
    }

    // A connection could not be made
    component.socket.onerror = function (event) {
      that.closeWebsocket(component);
    }

    // A connection was closed
    component.socket.onclose = function (code, reason) {
      that.closeWebsocket(component, true);
    }

    component.timer = setTimeout(() => {
      that.closeWebsocket(component);
    }, that.timeout);
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

  connectComponent(component) {
    component.state = undefined;
    component.connection = true;
    if (component.websocketAddress) {
      this.websocketEventAdd(component);
    }
    else {
      this.http.get(component.address).timeout(this.timeout).subscribe(
        data => {
          component.state = false;
        },
        err => {
          console.error('Error:', err);
          component.connection = false;
        }
      );
    }
  }

  reconnectComponent(component) {
    this.connectComponent(component);
  }

  toggleComponentOptions(slidingItem: ItemSliding) {
    this.componentOptions = slidingItem;
  }

  toggleReorder() {
    this.reorder = !this.reorder;

    // if (!this.reorder) localStorage.setItem('Components', JSON.stringify(this.storedComponents));
    if (this.componentOptions) this.componentOptions.close();

    // this.content.resize();
  }

  reorderComponents(event) {
    reorderArray(this.components, event);
    reorderArray(this.storedComponents, event);
    localStorage.setItem('Components', JSON.stringify(this.storedComponents));
  }

  deleteComponent(component, index) {
    if (this.components.length) {
      let removeAlert = this.alertCtrl.create({
        title: 'Eliminar',
        message: 'Tem a certeza que pretende remover o componente?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              //console.log('Cancel clicked');
            }
          },
          {
            text: 'Remover',
            handler: () => {
              if (component.websocketAddress && component.connection) {
                component.socket.close();
              }
              this.components.splice(index, 1);
            }
          }
        ]
      });

      removeAlert.present();
    }
  }

  sendAction(component, url, event = { checked: false }) {
    component.connection = true;
    this.http.post(url, {}).timeout(this.timeout).subscribe(
      data => {
        component.state = event.checked;
      },
      err => {
        console.error('Error:', err);
        event.checked = !event.checked;
        component.state = undefined;
        component.connection = false;
      }
    );
  }

  buttonPress(component) {
    this.sendAction(component, component.address + component.actionI);
  }

  switchChange(event, component) {
    if (event.checked !== component.state) {
      if (component.websocketAddress) {
        //verify connection
        if (component.socket.readyState === component.socket.OPEN) {
          // send data to the server
          component.socket.send(event.checked ? 'ON' : 'OFF');
          component.timer = setTimeout(() => {
            this.closeWebsocket(component);
          }, this.timeout);
        }
        else {
          event.checked = !event.checked;
          this.closeWebsocket(component);
        }
      }
      else {
        this.sendAction(component, component.address + (event.checked ? component.actionI : component.actionO), event);
      }
    }
  }

}
